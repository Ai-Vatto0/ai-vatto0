// SCHRITT 5/7 – Offizieller check + Render + QA. Exporte werden NIE überschrieben (fortlaufende Version).
// Vorschau: node tools/render.mjs <job> [--plan schnittplan]
// Final:    node tools/render.mjs <job> --final --freigabe "Vatto hat vorschau-…-v002 am 30.09. freigegeben"
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { readJSON, jobDir, parseArgs, fail, hf, nextVersion, ffprobe, r3, TOOLS_DIR, writeJSON } from "./lib.mjs";

const { pos, opt } = parseArgs(process.argv.slice(2));
const job = pos[0];
const dir = jobDir(job);
const name = opt.plan || "schnittplan";
const komp = path.join(dir, `komposition-${name}`);
if (!fs.existsSync(path.join(komp, "index.html"))) fail(`Keine Komposition – erst: node tools/baue.mjs ${job} --plan ${name}`);
const final = Boolean(opt.final);
if (final && (typeof opt.freigabe !== "string" || opt.freigabe.length < 10)) fail('Final-Render nur mit dokumentierter Vorschau-Freigabe: --freigabe "wer, welche Vorschau, wann"');
const q = readJSON(path.join(dir, "quellen.json"));

console.log("• hyperframes check …");
const c = hf(["check", "--json"], { cwd: komp, allowFail: true });
let cj = null;
try { cj = JSON.parse(c.stdout.slice(c.stdout.indexOf("{"))); } catch {}
if (c.status !== 0) fail(`check nicht bestanden:\n${(c.stdout + c.stderr).slice(-3000)}`);
console.log(`  ✓ check bestanden${cj?.ok !== undefined ? ` (ok=${cj.ok})` : ""}`);

const ziel = nextVersion(path.join(dir, "exporte"), final ? `final-${name}` : `vorschau-${name}`, "mp4");
console.log(`• Render ${final ? "FINAL (Qualität high)" : "Vorschau (Qualität draft)"} → ${path.relative(dir, ziel)} …`);
const t0 = Date.now();
const r = hf(["render", "-o", ziel, "--fps", q.arbeitskopie.bildrate, "-q", final ? "high" : "draft", "--strict", "--quiet"], { cwd: komp, allowFail: true });
if (r.status !== 0 || !fs.existsSync(ziel)) fail(`Render fehlgeschlagen (Exit ${r.status}):\n${(r.stdout + r.stderr).slice(-3000)}`);
const m = ffprobe(ziel);
console.log(`  ✓ ${r3(m.dauer_s)} s, ${m.video.breite_angezeigt}x${m.video.hoehe_angezeigt}, ${m.video.r_frame_rate} fps, ${(m.bytes / 1e6).toFixed(1)} MB, ${Math.round((Date.now() - t0) / 1000)} s Renderzeit`);
writeJSON(ziel.replace(/\.mp4$/, ".json"), { export: path.basename(ziel), plan: name, art: final ? "final" : "vorschau", freigabe: final ? opt.freigabe : null, erstellt: new Date().toISOString(), ffprobe: m });

console.log("• QA …");
const qa = spawnSync(process.execPath, [path.join(TOOLS_DIR, "qa.mjs"), job, ziel, "--plan", name], { stdio: "inherit" });
process.exitCode = qa.status;
