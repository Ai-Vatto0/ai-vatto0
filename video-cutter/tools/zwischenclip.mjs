// ZWISCHENCLIPS je Szene eines Spec-Videos – engine-neutral (HyperFrames UND Remotion spielen sie 1:1 ab).
// node tools/zwischenclip.mjs <projekt> <video>
// - Ausschnitt 9:16 in NATIVER Auflösung (4K quer → 1215×2160, Hochkant 1512×2688) = echte Zoom-Reserve
// - HDR (HLG/PQ) → SDR mit derselben Tonemap-Kette wie gestern (Farben: Vorher/Nachher-Bild für Vatto)
// - Tempo vorab: Zeitlupe (nur ≥50 fps, reine Bildauswahl) oder Speed-Ramp (normal → 2,5× → normal); NIE Interpolation
// - Ausgabe 30 fps konstant, H.264 CRF 16, immer mit Tonspur (Produktton bei 1×, sonst Stille) → einheitliche Clips
import fs from "node:fs";
import path from "node:path";
import { ROOT, readJSON, writeJSON, parseArgs, fail, run, ffprobe, r3 } from "./lib.mjs";

const { pos, opt } = parseArgs(process.argv.slice(2));
const [projekt, video] = pos;
const dir = path.join(ROOT, "projekte", projekt || "");
const vdir = path.join(dir, "videos", video || "");
if (!fs.existsSync(path.join(vdir, "spec.json"))) fail("Aufruf: node tools/zwischenclip.mjs <projekt> <video>");
const spec = readJSON(path.join(vdir, "spec.json"));
// Quellbereiche aus timing.json (am Voiceover ausgerichtet) haben Vorrang vor spec.bis
const timingPfad = path.join(vdir, "timing.json");
if (fs.existsSync(timingPfad)) readJSON(timingPfad).szenen.forEach((t, i) => { spec.szenen[i].von = t.von; spec.szenen[i].bis = t.bis; });
else console.log("⚠ ohne timing.json – Szenenlängen nicht am Voiceover ausgerichtet");
const bib = readJSON(path.join(dir, "bibliothek.json")).clips;
const out = path.join(dir, "zwischen", video);
fs.mkdirSync(out, { recursive: true });
const HDR = "zscale=t=linear:npl=203,format=gbrpf32le,zscale=p=bt709,tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p";

const index = [];
spec.szenen.forEach((z, i) => {
  const b = bib[z.clip];
  if (!b) fail(`Szene ${i + 1}: Clip ${z.clip} nicht gesichtet`);
  const src = path.join(dir, b.datei);
  const ziel = path.join(out, `s${String(i + 1).padStart(2, "0")}.mp4`);
  const L = z.bis - z.von;
  // 1) Ausschnitt/Farbe
  const x = z.x ?? b.tags?.bildmitte ?? 0.5;
  let vf = [];
  if (b.hdr) vf.push(HDR);
  if (b.orientierung === "quer") {
    const cw = `trunc(ih*9/16/2)*2`;
    vf.push(`crop=${cw}:ih:'min(max(iw*${x}-${cw}/2,0),iw-${cw})':0`);
  }
  vf.push("format=yuv420p");
  // 2) Tempo (nur Bildauswahl)
  let filter, mitTon = b.ton && (z.tempo === undefined || z.tempo === 1);
  if (typeof z.tempo === "number" && z.tempo < 1) {
    if (b.fps < 49) fail(`Szene ${i + 1}: Zeitlupe bei ${b.fps} fps verboten`);
    filter = `[0:v]${vf.join(",")},setpts=PTS/${z.tempo},fps=30[v]`;
  } else if (z.tempo === "ramp") {
    const a = L / 3, c = (2 * L) / 3;
    filter = `[0:v]${vf.join(",")},split=3[p1][p2][p3];` +
      `[p1]trim=0:${a},setpts=PTS-STARTPTS[q1];[p2]trim=${a}:${c},setpts=(PTS-STARTPTS)/2.5[q2];[p3]trim=${c}:${L},setpts=PTS-STARTPTS[q3];` +
      `[q1][q2][q3]concat=n=3:v=1:a=0,fps=30[v]`;
  } else filter = `[0:v]${vf.join(",")},fps=30[v]`;
  const args = ["-v", "error", "-y", "-ss", String(z.von), "-t", String(L), "-i", src];
  if (!mitTon) args.push("-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo");
  args.push("-filter_complex", filter, "-map", "[v]", "-map", mitTon ? "0:a:0" : "1:a:0",
    "-c:v", "libx264", "-preset", "fast", "-crf", "16", "-g", "15", "-bf", "0", "-c:a", "aac", "-b:a", "160k", "-ar", "48000", "-ac", "2", "-shortest", "-movflags", "+faststart", ziel);
  run("ffmpeg", args);
  const m = ffprobe(ziel);
  index.push({ szene: i + 1, clip: z.clip, datei: path.basename(ziel), von: z.von, bis: z.bis, tempo: z.tempo ?? 1, produktton: Boolean(mitTon),
    dauer_s: r3(m.dauer_s), breite: m.video.breite_angezeigt, hoehe: m.video.hoehe_angezeigt, hdr_quelle: b.hdr });
  // HDR: Vorher/Nachher für die Farbabnahme durch Vatto
  if (b.hdr && !opt["ohne-farbcheck"]) {
    const t = String(z.von + Math.min(1, L / 2));
    const roh = path.join(out, `.farb-roh-${i + 1}.png`), neu = path.join(out, `.farb-neu-${i + 1}.png`);
    run("ffmpeg", ["-v", "error", "-y", "-ss", t, "-i", src, "-frames:v", "1", "-vf", "scale=360:-2", roh]);
    run("ffmpeg", ["-v", "error", "-y", "-ss", "1", "-i", ziel, "-frames:v", "1", "-vf", "scale=360:-2", neu]);
    run("ffmpeg", ["-v", "error", "-y", "-i", roh, "-i", neu, "-filter_complex", "hstack", path.join(out, `farbcheck-s${String(i + 1).padStart(2, "0")}.jpg`)]);
    fs.rmSync(roh); fs.rmSync(neu);
  }
  console.log(`✓ s${i + 1} ${z.clip} ${z.von}–${z.bis} tempo ${z.tempo ?? 1} → ${r3(m.dauer_s)} s ${m.video.breite_angezeigt}x${m.video.hoehe_angezeigt}${b.hdr ? " (HDR→SDR)" : ""}`);
});
writeJSON(path.join(out, "index.json"), { video, erstellt: new Date().toISOString(), szenen: index, gesamt_s: r3(index.reduce((s, x) => s + x.dauer_s, 0)) });
