// REMOTION-VERGLEICH: dieselbe Spec + dieselben Zwischenclips + dasselbe Voiceover für video-edit/ (Remotion) bereitstellen.
// node tools/remotion-props.mjs <projekt> <video>  →  video-edit/public/spec-<p>-<v>/ + props.json
// Danach (in video-edit/): npx remotion render SpecVideo out/spec-<p>-<v>.mp4 --props=public/spec-<p>-<v>/props.json
import fs from "node:fs";
import path from "node:path";
import { ROOT, readJSON, writeJSON, parseArgs, fail } from "./lib.mjs";

const { pos } = parseArgs(process.argv.slice(2));
const [projekt, video] = pos;
const pdir = path.join(ROOT, "projekte", projekt || "");
const vdir = path.join(pdir, "videos", video || "");
const komp = path.join(vdir, "komposition");
if (!fs.existsSync(path.join(komp, "meta.json"))) fail("erst baue-spec.mjs ausführen");
const spec = readJSON(path.join(vdir, "spec.json"));
const meta = readJSON(path.join(komp, "meta.json"));
const zw = readJSON(path.join(pdir, "zwischen", video, "index.json"));
const woerter = readJSON(path.join(vdir, "vo", "woerter.json")).woerter;
const name = `spec-${projekt}-${video}`;
const pub = path.join(ROOT, "..", "video-edit", "public", name);
fs.mkdirSync(pub, { recursive: true });
const link = (src, dst) => { if (fs.existsSync(dst)) fs.rmSync(dst); try { fs.linkSync(src, dst); } catch { fs.copyFileSync(src, dst); } };
const FPS = 30, f = (s) => Math.round(s * FPS);
zw.szenen.forEach((z) => link(path.join(pdir, "zwischen", video, z.datei), path.join(pub, z.datei)));
for (const a of ["vo.wav", "wumms.wav", "boom.wav", "fonts/Poppins-Bold.ttf"]) link(path.join(komp, "assets", a), path.join(pub, path.basename(a)));
const props = {
  basis: name, fps: FPS, gesamt: f(meta.dauer_s), voStart: f(meta.vo_start), look: spec.look, textposition: spec.textposition,
  cta: spec.cta,
  szenen: spec.szenen.map((s, i) => ({ src: `${name}/${zw.szenen[i].datei}`, von: f(meta.szenen[i].start), dauer: f(meta.szenen[i].dauer), zoom: s.zoom || "none",
    zoomMax: s.zoom_max || 1.12, uebergang: s.uebergang || "cut", produktton: zw.szenen[i].produktton, text: s.text || null })),
  woerter: woerter.map((w) => ({ text: w.text, s: f(w.s), e: f(w.e) })),
};
writeJSON(path.join(pub, "props.json"), props);
console.log(`✓ ${path.relative(path.join(ROOT, ".."), pub)}/props.json (${props.szenen.length} Szenen, ${props.gesamt} Frames)`);
