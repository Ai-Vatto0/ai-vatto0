// HYPERFRAMES-BUILDER für Skript-Videos (Spec-Workflow). baue.mjs (Sprecher-Schnitt) bleibt unberührt.
// node tools/baue-spec.mjs <projekt> <video>
// Eingaben: videos/<v>/spec.json · zwischen/<v>/index.json (zwischenclip.mjs) · videos/<v>/vo/{vo.wav,woerter.json} (voiceover)
// Ergebnis: videos/<v>/komposition/ (HyperFrames-Projekt) – Szenen mit Zoom/Ken Burns, Übergängen (flash/whip/zoom),
// Kinetic-Captions im VO-Takt, Headlines je Szene, CTA mit Pfeil, VO + Produktton + tiefe Sinus-Schnitte (Faruk: kein Zischen).
import fs from "node:fs";
import path from "node:path";
import { ROOT, readJSON, writeJSON, parseArgs, fail, run, r3, HF_VERSION } from "./lib.mjs";

const { pos } = parseArgs(process.argv.slice(2));
const [projekt, video] = pos;
const dir = path.join(ROOT, "projekte", projekt || "");
const vdir = path.join(dir, "videos", video || "");
if (!fs.existsSync(path.join(vdir, "spec.json"))) fail("Aufruf: node tools/baue-spec.mjs <projekt> <video>");
const spec = readJSON(path.join(vdir, "spec.json"));
const zw = readJSON(path.join(dir, "zwischen", video, "index.json"));
const voDir = path.join(vdir, "vo");
const woerter = readJSON(path.join(voDir, "woerter.json")).woerter; // [{text, s, e}] Skripttext + Whisper-Zeiten
if (zw.szenen.length !== spec.szenen.length) fail("Zwischenclips passen nicht zum Spec – zwischenclip.mjs neu ausführen");

const W = 1080, H = 1920, FPS = 30;
const VO_START = 0.25;
const out = path.join(vdir, "komposition");
fs.rmSync(path.join(out, "compositions"), { recursive: true, force: true });
fs.mkdirSync(path.join(out, "assets", "fonts"), { recursive: true });
fs.mkdirSync(path.join(out, "compositions"), { recursive: true });
const link = (src, dst) => { if (fs.existsSync(dst)) fs.rmSync(dst); try { fs.linkSync(src, dst); } catch { fs.copyFileSync(src, dst); } };
link(path.join(ROOT, "node_modules", "gsap", "dist", "gsap.min.js"), path.join(out, "assets", "gsap.min.js"));
link(path.join(ROOT, "..", "assets", "fonts", "Poppins-Bold.ttf"), path.join(out, "assets", "fonts", "Poppins-Bold.ttf"));
link(path.join(voDir, "vo.wav"), path.join(out, "assets", "vo.wav"));

// ---- Looks (bewusst verschieden, damit Videos nicht gleich aussehen) ----
const LOOKS = {
  gelb: { akzent: "#FFD400", text: "#FFFFFF", kontur: "#000000", pille: "transparent", headlineGross: 104, captionPx: 70, flash: "#FFFFFF" },
  nacht: { akzent: "#4DD8FF", text: "#FFFFFF", kontur: "rgba(0,0,0,0)", pille: "rgba(8,12,22,.78)", headlineGross: 92, captionPx: 62, flash: "#CFF4FF" },
};
const L = LOOKS[spec.look] || fail(`Look „${spec.look}“ unbekannt (${Object.keys(LOOKS).join(", ")})`);
// oben: Untertitel oben, Headlines im unteren Drittel · unten: Headlines oben, Untertitel unten (je Szene überschreibbar: text.top)
const TEXT_Y = spec.textposition === "oben" ? { caption: 230, headline: 1150 } : { caption: 1290, headline: 250 };

// ---- Zeitplan der Szenen (Übergänge überlappen nicht – harte Grenzen, Effekt liegt auf den Wrappern) ----
let t = 0;
const szenen = spec.szenen.map((z, i) => {
  const d = zw.szenen[i].dauer_s;
  const s = { ...z, i, start: r3(t), dauer: r3(d), datei: zw.szenen[i].datei, produktton: zw.szenen[i].produktton };
  t += d;
  return s;
});
const GESAMT = r3(t);
const voEnde = VO_START + woerter.at(-1).e;
if (voEnde > GESAMT - 0.4) fail(`Voiceover (${r3(voEnde)} s) länger als Bild (${GESAMT} s) – Spec anpassen`);
szenen.forEach((s) => { link(path.join(dir, "zwischen", video, s.datei), path.join(out, "assets", `${video}-${s.datei}`)); });

// ---- Sound: tiefer Sinus-Schnitt (90 Hz, 0,18 s) und Hook-Boom (55 Hz, 0,9 s) – kein Rauschen/Zischen ----
const sfx = (name, f, d, vol) => run("ffmpeg", ["-v", "error", "-y", "-f", "lavfi", "-i", `sine=f=${f}:d=${d}`, "-af", `volume=${vol},afade=t=in:d=0.01,afade=t=out:st=${d * 0.4}:d=${d * 0.6}`, "-ar", "48000", "-ac", "2", path.join(out, "assets", name)]);
sfx("wumms.wav", 90, 0.18, 0.5);
sfx("boom.wav", 55, 0.9, 0.6);

const esc = (x) => String(x).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const MIX = 1.26; // gemessener HyperFrames-0.8.77-Mix-Ausgleich (siehe baue.mjs / QA)
let html = "", js = "";
const flashes = [];

// Szenen: Clip-Wrapper (timed) → .inner (Zoom/Whip) → video
szenen.forEach((s) => {
  const id = `sz${s.i + 1}`;
  html += `
      <div id="${id}" class="szene">
        <div class="tr" data-layout-allow-overflow><div class="inner" data-layout-allow-overflow><video id="${id}-v" class="clip" src="assets/${video}-${s.datei}" data-start="${s.start}" data-duration="${s.dauer}" data-media-start="0" data-track-index="0" muted playsinline></video></div></div>
      </div>`;
  const zoomMax = s.zoom_max || 1.12;
  if (s.zoom === "kenburns_in") js += `\n      tl.fromTo("#${id} .inner", { scale: 1.0 }, { scale: ${zoomMax}, duration: ${s.dauer}, ease: "none" }, ${s.start});`;
  if (s.zoom === "kenburns_out") js += `\n      tl.fromTo("#${id} .inner", { scale: ${zoomMax} }, { scale: 1.0, duration: ${s.dauer}, ease: "none" }, ${s.start});`;
  if (s.zoom === "punch") {
    const at = r3(s.start + Math.min(s.dauer * 0.45, s.punch_bei ?? s.dauer * 0.35));
    js += `\n      tl.fromTo("#${id} .inner", { scale: 1.0 }, { scale: ${Math.min(1.2, zoomMax + 0.05)}, duration: 0.14, ease: "power4.out" }, ${at});`;
  }
  // Übergang INS nächste Bild (am Ende dieser Szene)
  const next = szenen[s.i + 1];
  if (next && s.uebergang && s.uebergang !== "cut") {
    const cut = next.start, nid = `sz${next.i + 1}`;
    if (s.uebergang === "flash") {
      flashes.push(r3(cut));
      js += `\n      tl.fromTo("#flash-${s.i + 1}", { opacity: 0 }, { opacity: 0.85, duration: 0.06, ease: "power2.out" }, ${r3(cut - 0.06)});`;
      js += `\n      tl.to("#flash-${s.i + 1}", { opacity: 0, duration: 0.14, ease: "power2.in" }, ${r3(cut)});`;
      html += `\n      <div id="flash-${s.i + 1}" class="clip flash" data-start="${r3(cut - 0.08)}" data-duration="0.3" data-track-index="${60 + s.i}"></div>`;
    }
    if (s.uebergang === "whip") {
      js += `\n      tl.fromTo("#${id} .tr", { xPercent: 0, filter: "blur(0px)" }, { xPercent: -38, filter: "blur(14px)", duration: 0.16, ease: "power3.in" }, ${r3(cut - 0.16)});`;
      js += `\n      tl.fromTo("#${nid} .tr", { xPercent: 38, filter: "blur(14px)" }, { xPercent: 0, filter: "blur(0px)", duration: 0.2, ease: "power3.out", immediateRender: false }, ${r3(cut)});`;
    }
    if (s.uebergang === "zoom") {
      js += `\n      tl.fromTo("#${id} .tr", { scale: 1, filter: "blur(0px)" }, { scale: 1.22, filter: "blur(8px)", duration: 0.14, ease: "power2.in" }, ${r3(cut - 0.14)});`;
      js += `\n      tl.fromTo("#${nid} .tr", { scale: 1.3, filter: "blur(10px)" }, { scale: 1, filter: "blur(0px)", duration: 0.24, ease: "power3.out", immediateRender: false }, ${r3(cut)});`;
    }
    html += `
      <audio id="wumms-${s.i + 1}" src="assets/wumms.wav" data-start="${r3(cut - 0.02)}" data-duration="0.18" data-track-index="${40 + s.i}" data-volume="1"></audio>`;
  }
  if (s.produktton) {
    html += `
      <audio id="${id}-ton" src="assets/${video}-${s.datei}" data-start="${s.start}" data-duration="${s.dauer}" data-media-start="0" data-track-index="${20 + s.i}" data-volume="${r3(0.16 * MIX)}"></audio>`;
  }
});
html += `
      <audio id="boom" src="assets/boom.wav" data-start="0" data-duration="0.9" data-track-index="39" data-volume="1"></audio>
      <audio id="vo" src="assets/vo.wav" data-start="${VO_START}" data-duration="${r3(voEnde - VO_START + 0.3)}" data-media-start="0" data-track-index="10" data-volume="${MIX}"></audio>`;

// ---- Captions (VO-Wörter, 2–4 pro Block, aktives Wort in Akzentfarbe) als Sub-Komposition ----
const bloecke = [];
let cur = [];
woerter.forEach((w, i) => {
  cur.push({ ...w, i });
  const satzende = /[.!?,]$/.test(w.text);
  if (cur.length >= 4 || satzende || i === woerter.length - 1) { bloecke.push(cur); cur = []; }
});
const ctaStart = szenen.at(-1).start;
let cm = "", cj = "";
bloecke.forEach((b, k) => {
  const s = r3(VO_START + b[0].s), e = r3(Math.min(bloecke[k + 1] ? VO_START + bloecke[k + 1][0].s : GESAMT, VO_START + b.at(-1).e + 0.35));
  if (s >= ctaStart - 0.05) return; // CTA-Szene hat eigene Grafik
  const ende = Math.min(e, ctaStart);
  const id = `c${k + 1}`;
  cm += `
        <div id="${id}" class="clip cap" data-start="${s}" data-duration="${r3(ende - s)}" data-track-index="0"><p class="cap-in">${b.map((w, j) => `<span id="${id}-${j}" class="w">${esc(w.text.replace(/[,.]$/, ""))}</span>`).join(" ")}</p></div>`;
  cj += `\n        tl.fromTo("#${id} .cap-in", { y: 18, scale: 0.9, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.13, ease: "back.out(2)" }, ${s});`;
  b.forEach((w, j) => {
    cj += `\n        tl.set("#${id}-${j}", { color: "${L.akzent}" }, ${r3(Math.max(s, VO_START + w.s))});`;
    if (b[j + 1]) cj += `\n        tl.set("#${id}-${j}", { color: "${L.text}" }, ${r3(Math.max(s, VO_START + b[j + 1].s))});`;
  });
});

// ---- Headlines je Szene (text.inhalt) + CTA ----
let hm = "", hj = "";
szenen.forEach((s) => {
  if (!s.text?.inhalt || s.i === szenen.length - 1) return;
  const anker = s.text.anker_wort !== undefined ? VO_START + woerter[s.text.anker_wort].s : s.start + 0.1;
  const a = r3(Math.max(s.start, anker)), e = r3(s.start + s.dauer - 0.05);
  if (e - a < 0.6) return;
  const id = `h${s.i + 1}`;
  const worte = s.text.inhalt.split(/\s+/);
  const betont = new Set((s.text.betonung || []).map((x) => x.toLowerCase()));
  hm += `
        <div id="${id}" class="clip headline" data-start="${a}" data-duration="${r3(e - a)}" data-track-index="1"${s.text.top ? ` style="top:${s.text.top}px"` : ""}><div class="hl-in">${worte.map((w) => `<span class="hw${betont.has(w.toLowerCase()) ? " em" : ""}">${esc(w)}</span>`).join(" ")}</div></div>`;
  hj += `\n        tl.fromTo("#${id} .hw", { yPercent: 80, opacity: 0, rotation: -4 }, { yPercent: 0, opacity: 1, rotation: 0, duration: 0.32, ease: "back.out(2.2)", stagger: 0.06 }, ${a});`;
  hj += `\n        tl.to("#${id} .hl-in", { opacity: 0, y: -20, duration: 0.18, ease: "power2.in" }, ${r3(e - 0.18)});`;
});
const cta = szenen.at(-1);
hm += `
        <div id="cta" class="clip ctabox" data-start="${cta.start}" data-duration="${r3(GESAMT - cta.start)}" data-track-index="2"><div class="cta-tx">${esc(spec.cta.text)}</div>${spec.cta.zusatz ? `<div class="cta-zu">${esc(spec.cta.zusatz)}</div>` : ""}<svg class="pfeil" viewBox="0 0 200 200"><path d="M170 20 C 150 90, 110 130, 40 160" fill="none" stroke="${L.akzent}" stroke-width="14" stroke-linecap="round"/><path d="M40 160 L 70 118 M40 160 L 92 170" fill="none" stroke="${L.akzent}" stroke-width="14" stroke-linecap="round"/></svg></div>`;
hj += `\n        tl.fromTo("#cta .cta-tx", { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.42, ease: "back.out(1.2)" }, ${r3(cta.start + 0.1)});`;
if (spec.cta.zusatz) hj += `\n        tl.fromTo("#cta .cta-zu", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: "power3.out" }, ${r3(cta.start + 0.4)});`;
hj += `\n        tl.fromTo("#cta .pfeil path", { strokeDashoffset: 260 }, { strokeDashoffset: 0, duration: 0.45, ease: "power2.out", stagger: 0.12 }, ${r3(cta.start + 0.5)});`;

const FONT = `@font-face { font-family: "Poppins"; src: url("assets/fonts/Poppins-Bold.ttf") format("truetype"); font-weight: 700; }`;
const stroke = spec.look === "gelb" ? `-webkit-text-stroke: 12px ${L.kontur}; paint-order: stroke fill;` : "";
const CSS = `
        #root { position: absolute; inset: 0; font-family: "Poppins", sans-serif; font-weight: 700; }
        /* Safe Zone 1080x1920: oben 150, rechts 140, unten 400, links 60 */
        .cap { position: absolute; left: 60px; right: 140px; top: ${TEXT_Y.caption}px; display: flex; justify-content: center; }
        .cap-in { max-width: 860px; text-align: center; font-size: ${L.captionPx}px; line-height: 1.12; color: ${L.text}; ${stroke} background: ${L.pille}; padding: ${spec.look === "nacht" ? "14px 30px" : "0"}; border-radius: 26px; text-shadow: 0 6px 18px rgba(0,0,0,.45); }
        .headline { position: absolute; left: 60px; right: 140px; top: ${TEXT_Y.headline}px; display: flex; justify-content: center; }
        .hl-in { max-width: 860px; text-align: center; font-size: ${L.headlineGross}px; line-height: 1.04; color: ${L.text}; ${spec.look === "gelb" ? "-webkit-text-stroke: 14px #000; paint-order: stroke fill;" : "background: rgba(8,12,22,.78); padding: 10px 26px 14px; border-radius: 28px; text-shadow: 0 0 22px rgba(77,216,255,.45);"} }
        .hw { display: inline-block; }
        .hw.em { color: ${L.akzent}; }
        .ctabox { position: absolute; left: 60px; right: 140px; top: 1080px; display: flex; flex-direction: column; align-items: center; }
        .cta-tx { color: ${L.akzent}; font-size: 76px; line-height: 1.05; text-align: center; max-width: 720px; ${spec.look === "gelb" ? "-webkit-text-stroke: 14px #000; paint-order: stroke fill;" : "background: rgba(8,12,22,.8); padding: 12px 28px 16px; border-radius: 30px; text-shadow: 0 0 22px rgba(77,216,255,.45);"} }
        .cta-zu { color: #fff; font-size: 44px; margin-top: 12px; text-align: center; max-width: 720px; background: rgba(0,0,0,.55); padding: 6px 18px; border-radius: 16px; }
        .pfeil { width: 150px; height: 150px; margin-top: 4px; margin-right: 400px; }
        .pfeil path { stroke-dasharray: 260; }
        .ki { position: absolute; left: 70px; top: 160px; font-size: 26px; color: #FFFFFF; letter-spacing: .04em; background: rgba(0,0,0,.62); padding: 6px 14px; border-radius: 12px; }`;
const subcomp = (cid, markup, code) => fs.writeFileSync(path.join(out, "compositions", `${cid}.html`), `<!doctype html>
<html lang="de">
  <head><meta charset="UTF-8" /><!-- GENERIERT von tools/baue-spec.mjs – nicht von Hand ändern. --></head>
  <body>
    <template>
      <style>
        ${FONT}${CSS}
      </style>
      <div id="root" data-composition-id="${cid}" data-width="${W}" data-height="${H}">${markup}
      </div>
      <script>
        const tl = gsap.timeline({ paused: true });${code}
        window.__timelines["${cid}"] = tl;
      </script>
    </template>
  </body>
</html>
`);
subcomp("captions", cm, cj);
subcomp("grafik", hm + `\n        <div id="ki" class="clip ki" data-start="0" data-duration="${GESAMT}" data-track-index="3">KI-Stimme</div>`, hj);
const host = (cid, track) => `
      <div id="${cid}"${cid === "captions" ? ' data-track-kind="captions"' : ""} data-composition-id="${cid}" data-composition-src="compositions/${cid}.html" data-start="0" data-duration="${GESAMT}" data-track-index="${track}" data-width="${W}" data-height="${H}"></div>`;
html += host("captions", 50) + host("grafik", 51);

const index = `<!doctype html>
<html lang="de">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=${W}, height=${H}" />
    <!-- GENERIERT von tools/baue-spec.mjs aus videos/${video}/spec.json – Änderungen im Spec, dann neu bauen. -->
    <script src="assets/gsap.min.js"></script>
    <style>
      ${FONT}
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { width: ${W}px; height: ${H}px; overflow: hidden; background: #000; }
      #root { position: relative; width: 100%; height: 100%; overflow: hidden; background: #000; }
      .szene { position: absolute; inset: 0; overflow: hidden; }
      .szene .inner { position: absolute; inset: 0; transform-origin: 50% 45%; }
      .szene video { position: absolute; left: 0; top: 0; width: 100%; height: 100%; object-fit: cover; }
      .szene .tr { position: absolute; inset: 0; transform-origin: 50% 50%; }
      .flash { position: absolute; inset: 0; background: ${L.flash}; opacity: 0; pointer-events: none; }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="${GESAMT}" data-width="${W}" data-height="${H}">${html}
    </div>
    <script>
      const tl = gsap.timeline({ paused: true });${js}
      window.__timelines["main"] = tl;
      tl.seek(0);
    </script>
  </body>
</html>
`;
fs.writeFileSync(path.join(out, "index.html"), index);
// Nur-Grafik-Variante (transparent) für die Safe-Zone-Prüfung in render-spec.mjs
const gout = path.join(vdir, "komposition-grafik");
fs.rmSync(gout, { recursive: true, force: true });
fs.mkdirSync(path.join(gout, "assets", "fonts"), { recursive: true });
fs.mkdirSync(path.join(gout, "compositions"), { recursive: true });
for (const f of ["gsap.min.js", "fonts/Poppins-Bold.ttf"]) link(path.join(out, "assets", f), path.join(gout, "assets", f));
for (const f of ["captions.html", "grafik.html"]) fs.copyFileSync(path.join(out, "compositions", f), path.join(gout, "compositions", f));
writeJSON(path.join(gout, "hyperframes.json"), { paths: { blocks: "compositions", components: "compositions/components", assets: "assets" } });
fs.writeFileSync(path.join(gout, "index.html"), `<!doctype html>
<html lang="de">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=${W}, height=${H}" />
    <!-- GENERIERT: nur Untertitel + Grafik, transparenter Hintergrund (QA Safe Zone) -->
    <script src="assets/gsap.min.js"></script>
    <style>
      ${FONT}
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { width: ${W}px; height: ${H}px; overflow: hidden; background: transparent; }
      #root { position: relative; width: 100%; height: 100%; overflow: hidden; }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="${GESAMT}" data-width="${W}" data-height="${H}">${host("captions", 50) + host("grafik", 51)}
    </div>
    <script>
      const tl = gsap.timeline({ paused: true });
      window.__timelines["main"] = tl;
      tl.seek(0);
    </script>
  </body>
</html>
`);
writeJSON(path.join(out, "hyperframes.json"), { $schema: "https://hyperframes.heygen.com/schema/hyperframes.json", registry: "https://raw.githubusercontent.com/heygen-com/hyperframes/main/registry", paths: { blocks: "compositions", components: "compositions/components", assets: "assets" }, media: { autoProxy: true } });
writeJSON(path.join(out, "package.json"), { name: `${projekt}-${video}`, private: true, type: "module", scripts: { dev: `npx --yes hyperframes@${HF_VERSION} preview`, check: `npx --yes hyperframes@${HF_VERSION} check`, render: `npx --yes hyperframes@${HF_VERSION} render` } });
writeJSON(path.join(out, "meta.json"), { gebaut: new Date().toISOString(), video, dauer_s: GESAMT, fps: FPS, vo_start: VO_START, vo_ende: r3(voEnde), szenen: szenen.map(({ i, clip, start, dauer, zoom, tempo, uebergang }) => ({ szene: i + 1, clip, start, dauer, zoom, tempo, uebergang })) });
console.log(`✓ ${projekt}/${video}: ${GESAMT} s, ${szenen.length} Szenen, ${bloecke.length} Caption-Blöcke, Look ${spec.look}, Text ${spec.textposition}`);
