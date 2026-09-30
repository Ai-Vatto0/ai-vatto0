// SCHRITT 1 – Quelle sichern.
// node tools/quelle.mjs <job> <aufnahme.mp4> [--start 12.5 --ende 75] [--tonspur 0] [--kein-loudnorm]
//
// - liest Metadaten mit ffprobe (echte Bildrate, Rotation/Orientierung, Tonspuren, Dauer)
// - berechnet SHA-256 des Originals; das Original wird NUR gelesen
// - erzeugt eine Arbeitskopie (optional Ausschnitt) mit Bild und Ton synchron neu kodiert:
//   aufrecht, konstante Bildrate, H.264 + AAC 48 kHz, genau EINE Tonspur, Lautheit linear auf -14 LUFS
// - dokumentiert den Offset Arbeitskopie → Original in quellen.json
import fs from "node:fs";
import path from "node:path";
import { ffprobe, sha256, run, writeJSON, jobDir, parseArgs, fail, r3 } from "./lib.mjs";

const { pos, opt } = parseArgs(process.argv.slice(2));
const [job, orig] = pos;
if (!job || !orig) fail("Aufruf: node tools/quelle.mjs <job> <aufnahme.mp4> [--start s --ende s]");
const src = path.resolve(orig);
if (!fs.existsSync(src)) fail(`Aufnahme nicht gefunden: ${src}`);

const dir = jobDir(job);
const media = path.join(dir, "media");
fs.mkdirSync(media, { recursive: true });
const ziel = path.join(media, "arbeitskopie.mp4");
if (fs.existsSync(path.join(dir, "quellen.json")) && !opt.neu)
  fail(`Job "${job}" hat schon eine Quelle. Neuen Job-Namen wählen oder --neu (überschreibt nur die Arbeitskopie, nie das Original).`);

console.log("• Prüfsumme Original …");
const hashVorher = sha256(src);
const meta = ffprobe(src);
if (!meta.video) fail("Keine Videospur gefunden.");
if (meta.audio.length === 0) fail("Keine Tonspur gefunden – ohne Ton kein Transkript, kein Schnitt nach Sprache.");
const tonspur = Number(opt.tonspur || 0);
if (!meta.audio[tonspur]) fail(`Tonspur ${tonspur} existiert nicht (vorhanden: ${meta.audio.length}).`);

const start = opt.start !== undefined ? Number(opt.start) : 0;
const ende = opt.ende !== undefined ? Number(opt.ende) : meta.dauer_s;
if (!(start >= 0 && ende > start && ende <= meta.dauer_s + 0.01)) fail(`Bereich ${start}–${ende} liegt nicht in 0–${meta.dauer_s}.`);
const dauer = ende - start;

// Zielbildrate: echte Bildrate übernehmen; bei variabler Bildrate auf die nächste Standardrate.
const STD = [["24000/1001", 23.976], ["24", 24], ["25", 25], ["30000/1001", 29.97], ["30", 30], ["50", 50], ["60000/1001", 59.94], ["60", 60]];
const [fpsStr, fpsNum] = STD.reduce((b, c) => (Math.abs(c[1] - meta.video.fps) < Math.abs(b[1] - meta.video.fps) ? c : b));
if (Math.abs(fpsNum - meta.video.fps) > 0.05) console.log(`  ⚠ Bildrate ${meta.video.fps} ist keine Standardrate → Arbeitskopie mit ${fpsStr}`);

// Lautheit linear (zweistufig) messen, damit keine Pumpeffekte entstehen.
let af = "";
let lautheit = null;
if (!opt["kein-loudnorm"]) {
  console.log("• Lautheit messen …");
  const m = run("ffmpeg", ["-hide_banner", "-ss", String(start), "-t", String(dauer), "-i", src, "-map", `0:a:${tonspur}`,
    "-af", "loudnorm=I=-14:TP=-2.5:LRA=11:print_format=json", "-f", "null", "-"]);
  const js = m.stderr.slice(m.stderr.lastIndexOf("{"), m.stderr.lastIndexOf("}") + 1);
  lautheit = JSON.parse(js);
  af = `loudnorm=I=-14:TP=-2.5:LRA=11:measured_I=${lautheit.input_i}:measured_TP=${lautheit.input_tp}:measured_LRA=${lautheit.input_lra}:measured_thresh=${lautheit.input_thresh}:offset=${lautheit.target_offset}:linear=true,aresample=48000`;
}

console.log("• Arbeitskopie (Bild + Ton synchron) …");
const args = ["-y", "-v", "error", "-ss", String(start), "-i", src, "-t", String(dauer),
  "-map", "0:v:0", "-map", `0:a:${tonspur}`,
  "-vf", "format=yuv420p", "-fps_mode", "cfr", "-r", fpsStr,
  "-c:v", "libx264", "-preset", "medium", "-crf", "17", "-g", String(Math.round(fpsNum)), "-bf", "0",
  "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-ac", "2"];
if (af) args.push("-af", af);
args.push("-movflags", "+faststart", ziel);
run("ffmpeg", args);

const hashNachher = sha256(src);
if (hashNachher !== hashVorher) fail("Prüfsumme des Originals hat sich verändert! Sofort stoppen und prüfen.");
const kopie = ffprobe(ziel);
if (Math.abs(kopie.dauer_s - dauer) > 0.15) fail(`Arbeitskopie ist ${kopie.dauer_s}s statt ${r3(dauer)}s lang.`);
if (kopie.audio.length !== 1) fail("Arbeitskopie hat nicht genau eine Tonspur.");

const quellen = {
  erstellt: new Date().toISOString(),
  regel: "Original wird nie verändert. Alle Zeiten in transcript.json/schnittplan.json beziehen sich auf die ARBEITSKOPIE.",
  original: { pfad: src, sha256: hashVorher, sha256_nach_verarbeitung: hashNachher, metadaten: meta },
  arbeitskopie: {
    pfad: path.relative(dir, ziel),
    sha256: sha256(ziel),
    offset_zum_original_s: r3(start),
    bereich_im_original_s: [r3(start), r3(ende)],
    umrechnung: "zeit_original = zeit_arbeitskopie + offset_zum_original_s",
    bildrate: fpsStr,
    fps: fpsNum,
    tonspur_aus_original: tonspur,
    lautheit_vorher: lautheit ? { I: lautheit.input_i, TP: lautheit.input_tp, LRA: lautheit.input_lra } : null,
    lautheit_ziel: lautheit ? "-14 LUFS linear" : "unverändert",
    metadaten: kopie,
  },
  hinweise: [
    ...(meta.audio.length > 1 ? [`Original hat ${meta.audio.length} Tonspuren – verwendet wird Nr. ${tonspur}. Andere Spur? --tonspur N`] : []),
    ...(meta.video.variable_bildrate ? ["Original hat variable Bildrate – Arbeitskopie ist konstant."] : []),
    ...(meta.video.rotation_grad ? [`Original ist per Metadaten um ${meta.video.rotation_grad}° gedreht – Arbeitskopie ist aufrecht gespeichert.`] : []),
    ...(dauer > 95 && !opt.start ? ["Mehr als 90 s: gut für Varianten, für den ersten Test einen 30–90-s-Ausschnitt wählen (--start/--ende)."] : []),
  ],
};
writeJSON(path.join(dir, "quellen.json"), quellen);
console.log(`✓ ${job}: ${kopie.video.breite_angezeigt}x${kopie.video.hoehe_angezeigt} ${meta.video.orientierung}, ${fpsStr} fps, ${r3(dauer)} s, Offset ${r3(start)} s`);
for (const h of quellen.hinweise) console.log(`  ⚠ ${h}`);
console.log(`  → ${path.join(dir, "quellen.json")}`);
