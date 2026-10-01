// SCHRITT 2 – Lokal transkribieren (HyperFrames 0.8.77 + whisper.cpp) und das Ergebnis PRÜFEN.
// node tools/transkript.mjs <job> [--model small] [--language de]
//
// Stoppt, wenn: Exit-Code ≠ 0, ok ≠ true, transcript.json fehlt/leer, Wortzeiten unplausibel,
// oder die Arbeitskopie nicht mehr zur Prüfsumme in quellen.json passt.
import fs from "node:fs";
import path from "node:path";
import { hf, readJSON, writeJSON, jobDir, parseArgs, fail, sha256, ffprobe, r3 } from "./lib.mjs";

const { pos, opt } = parseArgs(process.argv.slice(2));
const job = pos[0];
const dir = jobDir(job);
const q = readJSON(path.join(dir, "quellen.json"));
const media = path.join(dir, q.arbeitskopie.pfad);
const hash = sha256(media);
if (hash !== q.arbeitskopie.sha256) fail("Arbeitskopie passt nicht zur Prüfsumme in quellen.json – Schritt 1 neu ausführen.");

const model = opt.model || "small";
const language = opt.language || "de";
console.log(`• Transkribiere lokal (whisper.cpp, Modell ${model}, Sprache ${language}) …`);
const tPath = path.join(dir, "transcript.json");
if (fs.existsSync(tPath)) fs.renameSync(tPath, path.join(dir, `transcript.alt-${Date.now()}.json`));
const r = hf(["transcribe", path.relative(dir, media), "--engine", "whisper", "--model", model, "--language", language, "--dir", ".", "--json"],
  { cwd: dir, allowFail: true });
if (r.status !== 0) fail(`transcribe Exit ${r.status}\n${r.stderr.slice(-1500)}`);
let res;
try {
  res = JSON.parse(r.stdout.trim().split("\n").filter((l) => l.startsWith("{")).pop());
} catch {
  fail(`transcribe lieferte kein JSON:\n${r.stdout.slice(-800)}`);
}
if (res.ok !== true) fail(`transcribe meldet ok=${res.ok}: ${JSON.stringify(res).slice(0, 500)}`);
if (!fs.existsSync(tPath)) fail("transcript.json wurde nicht erzeugt.");

const words = readJSON(tPath);
const dauer = ffprobe(media).dauer_s;
const probleme = [];
const warnungen = [];
if (!Array.isArray(words) || words.length === 0) fail("transcript.json ist leer – kein Schnitt ohne Transkript.");
let prev = -1;
for (const w of words) {
  if (typeof w.text !== "string" || typeof w.start !== "number" || typeof w.end !== "number") probleme.push(`Wort ohne Text/Zeit: ${JSON.stringify(w)}`);
  if (w.end < w.start) probleme.push(`"${w.text}" endet vor dem Start (${w.start}–${w.end})`);
  if (w.start < prev - 0.05) probleme.push(`"${w.text}" beginnt vor dem Vorgängerwort (${w.start} < ${prev})`);
  if (w.start < 0 || w.end > dauer + 0.5) probleme.push(`"${w.text}" liegt außerhalb der Datei (0–${r3(dauer)} s)`);
  if (w.end - w.start > 2.5) warnungen.push(`"${w.text}" dauert ${r3(w.end - w.start)} s – Zeit vermutlich über eine Pause gedehnt`);
  prev = w.start;
}
const sprechzeit = words.at(-1).end - words[0].start;
const wps = words.length / Math.max(0.1, sprechzeit);
if (wps < 0.4 || wps > 7) probleme.push(`Unplausible Sprechgeschwindigkeit ${wps.toFixed(2)} Wörter/s`);
if (words.at(-1).end > 1000 && dauer < 1000) probleme.push("Zeiten scheinen in Millisekunden statt Sekunden zu sein");

const pruefung = {
  geprueft: new Date().toISOString(),
  engine: res.engine, model: res.model, sprache: language,
  woerter: words.length, sprechgeschwindigkeit_wps: r3(wps),
  gehoert_zu: { datei: q.arbeitskopie.pfad, sha256: hash, offset_zum_original_s: q.arbeitskopie.offset_zum_original_s },
  transcript_sha256: sha256(tPath),
  ok: probleme.length === 0,
  probleme, warnungen,
  hinweis: "Wortzeiten sind Schätzungen. Pausen und Schnittgrenzen werden in schnittplan.mjs am Tonpegel geprüft.",
};
writeJSON(path.join(dir, "transcript-pruefung.json"), pruefung);
if (!pruefung.ok) fail(`Transkript unplausibel – keine Schnittentscheidungen:\n  - ${probleme.join("\n  - ")}`);
console.log(`✓ ${words.length} Wörter, ${wps.toFixed(2)} W/s, gebunden an ${q.arbeitskopie.pfad} (${hash.slice(0, 12)}…)`);
for (const w of warnungen) console.log(`  ⚠ ${w}`);
console.log(`  Text: ${words.map((w) => w.text).join(" ").slice(0, 400)}`);
