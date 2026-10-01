// ZEITSPUR OHNE VOICEOVER (Video nur mit Texteinblendungen, Vatto legt Musik in TikTok drauf).
// node tools/stumm-vo.mjs <projekt> <video>
// spec.ohne_vo = true · spec.voiceover[i] = { satz, belege, dauer } → je Satz eine Zeitspanne (Standard 2 s), Wörter gleichmäßig verteilt.
// Schreibt videos/<v>/vo/{vo.wav (Stille), woerter.json} – damit laufen timing.mjs/baue-spec.mjs unverändert (ab_wort = Wortindex).
import fs from "node:fs";
import path from "node:path";
import { ROOT, readJSON, writeJSON, parseArgs, fail, run, r3 } from "./lib.mjs";

const { pos } = parseArgs(process.argv.slice(2));
const [projekt, video] = pos;
const vdir = path.join(ROOT, "projekte", projekt || "", "videos", video || "");
if (!fs.existsSync(path.join(vdir, "spec.json"))) fail("Aufruf: node tools/stumm-vo.mjs <projekt> <video>");
const spec = readJSON(path.join(vdir, "spec.json"));
if (!spec.ohne_vo) fail("spec.ohne_vo ist nicht gesetzt – für Videos mit Sprecher vo-ausrichten.mjs nutzen");
const voDir = path.join(vdir, "vo");
fs.mkdirSync(voDir, { recursive: true });

const woerter = [];
let t = 0;
for (const x of spec.voiceover) {
  const w = x.satz.split(/\s+/).filter(Boolean);
  const d = x.dauer ?? 2.0;
  w.forEach((text, i) => woerter.push({ text, s: r3(t + (i * d) / w.length), e: r3(t + ((i + 1) * d) / w.length - 0.02) }));
  t += d;
}
run("ffmpeg", ["-v", "error", "-y", "-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo", "-t", String(r3(t + 0.5)), path.join(voDir, "vo.wav")]);
writeJSON(path.join(voDir, "woerter.json"), { quelle: "stumm-vo.mjs (ohne Voiceover)", woerter });
console.log(`✓ Zeitspur ${video}: ${r3(t)} s, ${woerter.length} Wörter, ${spec.voiceover.length} Takte (ohne Ton)`);
