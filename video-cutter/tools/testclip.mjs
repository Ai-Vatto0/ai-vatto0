// Erzeugt einen SYNTHETISCHEN Testclip (Computerstimme, Timecode im Bild) für den Selbsttest der Werkzeugkette.
// Enthält absichtlich: Versprecher + verworfenen Take, eine störende lange Pause, natürliche kurze Pausen.
// Gespeichert quer (1920x1080) mit Rotations-Metadaten → angezeigt hochkant, wie viele Handyaufnahmen.
// Kein echtes Produkt, keine echten Aussagen – nur Testdaten.
import fs from "node:fs";
import path from "node:path";
import { run, ROOT, parseArgs } from "./lib.mjs";

const { opt } = parseArgs(process.argv.slice(2));
const out = path.resolve(opt.out || path.join(ROOT, "material", "TEST-synthetisch.mp4"));
const tmp = fs.mkdtempSync(path.join(fs.realpathSync(process.env.TMPDIR || "/tmp"), "testclip-"));
if (!fs.existsSync("/usr/bin/espeak-ng") && run("sh", ["-c", "command -v espeak-ng"], { allowFail: true }).status !== 0)
  throw new Error("espeak-ng fehlt (nur für den Selbsttest nötig).");

const teile = [
  ["Kennst du das, wenn dein Kaffee nach zehn Minuten schon kalt ist?", 0.5],
  ["Mit diesem Becher bleibt er, äh,", 0.45],
  ["Moment, nochmal.", 1.2],
  ["Mit diesem Becher bleibt er deutlich länger warm.", 2.6],
  ["Der Deckel geht mit einer Hand auf.", 0.6],
  ["Und er passt in meinen Getränkehalter im Auto.", 0.9],
  ["Jetzt im TikTok Shop.", 0.8],
];

const liste = [];
teile.forEach(([text, pause], i) => {
  const w = path.join(tmp, `t${i}.wav`);
  run("espeak-ng", ["-v", "de+m3", "-s", "150", "-w", w, text]);
  const w48 = path.join(tmp, `s${i}.wav`);
  run("ffmpeg", ["-y", "-v", "error", "-i", w, "-ar", "48000", "-ac", "1", w48]);
  const p = path.join(tmp, `p${i}.wav`);
  run("ffmpeg", ["-y", "-v", "error", "-f", "lavfi", "-i", "anullsrc=r=48000:cl=mono", "-t", String(pause), p]);
  liste.push(`file '${w48}'`, `file '${p}'`);
});
const lead = path.join(tmp, "lead.wav");
run("ffmpeg", ["-y", "-v", "error", "-f", "lavfi", "-i", "anullsrc=r=48000:cl=mono", "-t", "0.6", lead]);
fs.writeFileSync(path.join(tmp, "l.txt"), [`file '${lead}'`, ...liste].join("\n"));
const ton = path.join(tmp, "ton.wav");
run("ffmpeg", ["-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", path.join(tmp, "l.txt"), "-af", "volume=0.6", ton]);
const dauer = Number(run("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", ton]).stdout);

const font = path.join(ROOT, "..", "assets", "fonts", "Poppins-Bold.ttf").replace(/:/g, "\\:");
const hoch = path.join(tmp, "hoch.mp4");
const vf = [
  "drawbox=x=240:y=560:w=600:h=600:color=0x2a9d8f@1:t=fill",
  `drawtext=fontfile='${font}':text='TESTCLIP (synthetisch)':fontsize=54:fontcolor=white:x=(w-tw)/2:y=260`,
  `drawtext=fontfile='${font}':text='%{pts\\:hms}':fontsize=90:fontcolor=yellow:x=(w-tw)/2:y=1260`,
  `drawtext=fontfile='${font}':text='Frame %{frame_num}':fontsize=70:fontcolor=white:x=(w-tw)/2:y=1400`,
].join(",");
run("ffmpeg", [
  "-y", "-v", "error",
  "-f", "lavfi", "-i", `color=c=0x1d3557:s=1080x1920:r=30000/1001:d=${dauer}`,
  "-i", ton,
  "-vf", vf, "-c:v", "libx264", "-preset", "veryfast", "-crf", "20", "-pix_fmt", "yuv420p",
  "-c:a", "aac", "-b:a", "160k", "-ac", "2", "-shortest", hoch,
]);
// Inhalt seitlich speichern und per Metadaten zurückdrehen (wie Handy-Aufnahmen).
const quer = path.join(tmp, "quer.mp4");
run("ffmpeg", ["-y", "-v", "error", "-i", hoch, "-vf", "transpose=2", "-c:v", "libx264", "-preset", "veryfast", "-crf", "20", "-c:a", "copy", quer]);
fs.mkdirSync(path.dirname(out), { recursive: true });
run("ffmpeg", ["-y", "-v", "error", "-display_rotation", "-90", "-i", quer, "-c", "copy", out]);
fs.rmSync(tmp, { recursive: true, force: true });
console.log(`✓ Testclip: ${out} (${dauer.toFixed(2)} s)`);
