// VOICEOVER EINMESSEN: Lautheit -14 LUFS (linear), Wortzeiten per whisper, Text = SKRIPT (keine Hörfehler im Bild).
// node tools/vo-ausrichten.mjs <projekt> <video> <vo-datei.mp3|wav>
// Schreibt videos/<v>/vo/{vo.wav, woerter.json, transcript.json}. Stoppt, wenn Skript und Gehörtes zu wenig übereinstimmen.
import fs from "node:fs";
import path from "node:path";
import { ROOT, readJSON, writeJSON, parseArgs, fail, run, hf, ffprobe, r3, sha256 } from "./lib.mjs";

const { pos } = parseArgs(process.argv.slice(2));
const [projekt, video, datei] = pos;
const vdir = path.join(ROOT, "projekte", projekt || "", "videos", video || "");
if (!datei || !fs.existsSync(datei) || !fs.existsSync(path.join(vdir, "spec.json"))) fail("Aufruf: node tools/vo-ausrichten.mjs <projekt> <video> <vo-datei>");
const spec = readJSON(path.join(vdir, "spec.json"));
const voDir = path.join(vdir, "vo");
fs.mkdirSync(voDir, { recursive: true });
const wav = path.join(voDir, "vo.wav");

const m = run("ffmpeg", ["-hide_banner", "-i", datei, "-af", "loudnorm=I=-14:TP=-2:LRA=11:print_format=json", "-f", "null", "-"]);
const j = JSON.parse(m.stderr.slice(m.stderr.lastIndexOf("{"), m.stderr.lastIndexOf("}") + 1));
run("ffmpeg", ["-v", "error", "-y", "-i", datei, "-af", `loudnorm=I=-14:TP=-2:LRA=11:measured_I=${j.input_i}:measured_TP=${j.input_tp}:measured_LRA=${j.input_lra}:measured_thresh=${j.input_thresh}:offset=${j.target_offset}:linear=true,aresample=48000`, "-ac", "2", wav]);

const r = hf(["transcribe", wav, "--engine", "whisper", "--model", "small", "--language", "de", "--dir", voDir, "--json"], { allowFail: true });
const res = JSON.parse((r.stdout || "").trim().split("\n").filter((l) => l.startsWith("{")).pop() || "{}");
if (r.status !== 0 || res.ok !== true) fail(`Transkription fehlgeschlagen (Exit ${r.status})`);
const gehoert = readJSON(path.join(voDir, "transcript.json"));

// Skriptwörter den gehörten Wörtern zuordnen (Levenshtein-Ausrichtung über normalisierte Tokens)
const norm = (s) => s.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
const skript = spec.voiceover.map((x) => x.satz).join(" ").split(/\s+/).filter(Boolean);
const A = skript.map(norm), B = gehoert.map((w) => norm(w.text));
const eq = (a, b) => a === b || (a.length > 3 && b.length > 3 && (a.startsWith(b.slice(0, 4)) || b.startsWith(a.slice(0, 4))));
const D = Array.from({ length: A.length + 1 }, (_, i) => Array.from({ length: B.length + 1 }, (_, k) => (i === 0 ? k : k === 0 ? i : 0)));
for (let i = 1; i <= A.length; i++) for (let k = 1; k <= B.length; k++) D[i][k] = Math.min(D[i - 1][k] + 1, D[i][k - 1] + 1, D[i - 1][k - 1] + (eq(A[i - 1], B[k - 1]) ? 0 : 1));
const map = new Array(A.length).fill(null);
for (let i = A.length, k = B.length; i > 0 && k > 0;) {
  if (D[i][k] === D[i - 1][k - 1] + (eq(A[i - 1], B[k - 1]) ? 0 : 1)) { map[i - 1] = { k: k - 1, gleich: eq(A[i - 1], B[k - 1]) }; i--; k--; }
  else if (D[i][k] === D[i - 1][k] + 1) i--; else k--;
}
const treffer = map.filter((x) => x?.gleich).length / A.length;
// Zeiten: zugeordnete Wörter übernehmen, Lücken linear interpolieren
const woerter = skript.map((text, i) => ({ text, s: map[i] ? gehoert[map[i].k].start : null, e: map[i] ? gehoert[map[i].k].end : null }));
for (let i = 0; i < woerter.length; i++) if (woerter[i].s === null) {
  let a = i - 1; while (a >= 0 && woerter[a].s === null) a--;
  let b = i + 1; while (b < woerter.length && woerter[b].s === null) b++;
  const t0 = a >= 0 ? woerter[a].e : 0, t1 = b < woerter.length ? woerter[b].s : ffprobe(wav).dauer_s;
  const n = b - a - 1, pos = i - a;
  woerter[i].s = r3(t0 + ((t1 - t0) * (pos - 1)) / n); woerter[i].e = r3(t0 + ((t1 - t0) * pos) / n); woerter[i].interpoliert = true;
}
const probleme = [];
if (treffer < 0.85) probleme.push(`nur ${Math.round(treffer * 100)} % der Skriptwörter wiedergefunden – Stimme hat anders gesprochen?`);
for (let i = 1; i < woerter.length; i++) if (woerter[i].s < woerter[i - 1].s - 0.01) probleme.push(`Zeiten nicht monoton bei „${woerter[i].text}“`);
writeJSON(path.join(voDir, "woerter.json"), { quelle: path.basename(datei), sha256: sha256(wav), lautheit_vorher: j.input_i, dauer_s: r3(ffprobe(wav).dauer_s), treffer: r3(treffer), woerter, probleme });
if (probleme.length) fail(`Voiceover passt nicht zum Skript:\n  - ${probleme.join("\n  - ")}`);
console.log(`✓ VO ${video}: ${r3(ffprobe(wav).dauer_s)} s, ${woerter.length} Wörter, ${Math.round(treffer * 100)} % wortgleich, Lautheit ${j.input_i} → -14 LUFS`);
