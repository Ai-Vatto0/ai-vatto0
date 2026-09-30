// SCHRITT 4 – HyperFrames-Komposition aus geprüftem Plan bauen.
// node tools/baue.mjs <job> [--plan schnittplan] [--broll broll] [--ohne-untertitel]
//
// Schnitt nach offiziellem Rezept (hyperframes-core → creator-editing-recipes: Hard cut / Trim):
//   pro Bereich ein <video muted> + ein <audio> mit identischem data-start / data-duration / data-media-start.
//   Das Video ist stumm → genau EINE hörbare Tonspur, kein doppelter Ton.
// Untertitel + B-Roll liegen auf der Schnittzeit (aus der Zeitkarte), nie auf der Quellzeit.
import fs from "node:fs";
import path from "node:path";
import { readJSON, writeJSON, jobDir, parseArgs, fail, r3, ROOT, HF_VERSION, quelleZuSchnitt } from "./lib.mjs";

const { pos, opt } = parseArgs(process.argv.slice(2));
const job = pos[0];
const dir = jobDir(job);
const name = opt.plan || "schnittplan";
const plan = readJSON(path.join(dir, `${name}.json`));
if (!plan.zeitkarte) fail(`Plan ${name} ist nicht geprüft – erst: node tools/pruefe-plan.mjs ${job} --plan ${name}`);
const q = readJSON(path.join(dir, "quellen.json"));
if (plan.quelle.sha256 !== q.arbeitskopie.sha256) fail("Plan und Arbeitskopie passen nicht zusammen.");
const ut = opt["ohne-untertitel"] ? null : readJSON(path.join(dir, `untertitel-${name}.json`));
const brollName = opt.broll || `broll-${name}`;
const brollPfad = path.join(dir, `${brollName}.json`);
const broll = fs.existsSync(brollPfad) ? readJSON(brollPfad) : { einblendungen: [] };

const W = plan.format?.breite || 1080, H = plan.format?.hoehe || 1920;
const zk = plan.zeitkarte;
const GESAMT = zk.at(-1).schnitt_ende;
const out = path.join(dir, `komposition-${name}`);
const assets = path.join(out, "assets");
fs.mkdirSync(path.join(assets, "fonts"), { recursive: true });

// Medien projektlokal bereitstellen (Hardlink spart Platz; Original bleibt unberührt, es wird nur die Arbeitskopie verlinkt).
const link = (src, dst) => { if (fs.existsSync(dst)) fs.rmSync(dst); try { fs.linkSync(src, dst); } catch { fs.copyFileSync(src, dst); } };
link(path.join(dir, q.arbeitskopie.pfad), path.join(assets, "quelle.mp4"));
link(path.join(ROOT, "node_modules", "gsap", "dist", "gsap.min.js"), path.join(assets, "gsap.min.js"));
link(path.join(ROOT, "..", "assets", "fonts", "Poppins-Bold.ttf"), path.join(assets, "fonts", "Poppins-Bold.ttf"));

// ---------- B-Roll prüfen ----------
const VERBOTEN = /(viral|garantiert|100 ?%|nie wieder|platz \d|bestseller|ausverkauft|nur heute|rabatt|gratis|kostenlos|€|\bpreis)/i;
const ZAHL = /\d/;
const fehler = [];
const alleTexte = (e) => [e.text, e.titel, ...(e.zeilen || []), ...(e.punkte || []).map((p) => p.text)].filter(Boolean).join(" ");
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const an = readJSON(path.join(dir, "analyse.json"));
const zeitVon = (e, feld = "") => {
  if (e.wort) { // Anker auf ein Wort (ID aus analyse.json / untertitel-*.json), genauer als geschätzte Zeiten
    const w = an.woerter.find((x) => `w${x.i}` === e.wort);
    if (!w) { fehler.push(`${e.id || e.text}: Wort ${e.wort} unbekannt`); return null; }
    const t = quelleZuSchnitt(zk, w.s);
    if (t === null) fehler.push(`${e.id || e.text}: Wort ${e.wort} „${w.text}“ ist herausgeschnitten`);
    return t;
  }
  if (e[`schnitt_start${feld}`] !== undefined) return Number(e[`schnitt_start${feld}`]);
  const qs = e[`quelle_start${feld}`];
  if (qs === undefined) return null;
  const t = quelleZuSchnitt(zk, Number(qs));
  if (t === null) fehler.push(`${e.id}: quelle_start ${qs} liegt in einem herausgeschnittenen Bereich`);
  return t;
};
const eins = [];
for (const [k, e] of (broll.einblendungen || []).entries()) {
  e.id = e.id || `br${k + 1}`;
  if (!e.zweck) fehler.push(`${e.id}: "zweck" fehlt (jede Einblendung braucht einen inhaltlichen Zweck)`);
  const txt = alleTexte(e);
  if (VERBOTEN.test(txt)) fehler.push(`${e.id}: verbotene/heikle Formulierung „${txt.match(VERBOTEN)[0]}“ (Compliance)`);
  if (ZAHL.test(txt) && !e.beleg) fehler.push(`${e.id}: enthält eine Zahl ohne "beleg" (z. B. "gesprochen bei 12.3 s" oder Quelle)`);
  if (e.typ === "bild") {
    if (!e.datei || !fs.existsSync(path.resolve(dir, e.datei))) fehler.push(`${e.id}: Bilddatei fehlt (${e.datei})`);
    if (!e.quelle || !e.rechte) fehler.push(`${e.id}: Bild braucht "quelle" und "rechte" (Nutzungsrechte geklärt?)`);
  }
  const start = zeitVon(e);
  if (start === null) { fehler.push(`${e.id}: Zeit fehlt (quelle_start oder schnitt_start)`); continue; }
  const dauer = Math.min(Number(e.dauer || 2.5), r3(GESAMT - start));
  if (dauer < 0.8) fehler.push(`${e.id}: zu kurz (${dauer} s) oder liegt am Videoende`);
  eins.push({ ...e, start: r3(start), dauer: r3(dauer) });
}
eins.sort((a, b) => a.start - b.start).forEach((e, k, arr) => {
  const n = arr[k + 1];
  if (n && e.start + e.dauer > n.start + 0.01) fehler.push(`${e.id} (bis ${r3(e.start + e.dauer)} s) überlappt ${n.id} (ab ${n.start} s) – Einblendungen nacheinander, nie gleichzeitig`);
});
{
  const fk = await import("fontkit");
  const font = fk.openSync(path.join(ROOT, "..", "assets", "fonts", "Poppins-Bold.ttf"));
  const breite = (t, px) => (font.layout(t).advanceWidth / font.unitsPerEm) * px;
  const umbruch = (text, px, max) => { const z = [""]; for (const w of text.split(/\s+/)) { const t = z.at(-1) ? `${z.at(-1)} ${w}` : w; if (breite(t, px) <= max || !z.at(-1)) z[z.length - 1] = t; else z.push(w); } return z; };
  const PLATZ = 880; // 1080 − 60 links − 140 rechts
  for (const e of eins) {
    const zeilen = e.typ === "titel" ? (e.zeilen || [e.text]).map((z) => [z, breite(z, 96) + 20 * z.split(/\s+/).length + 14])
      : e.typ === "cta" ? umbruch(e.text || "Jetzt im TikTok Shop", 76, 720).map((z) => [z, (breite(z, 76) + 14) * 1.04]) : [];
    for (const [z, b] of zeilen) if (b > PLATZ) fehler.push(`${e.id}: Zeile „${z}“ ist ${Math.round(b)} px breit (max ${PLATZ}) – kürzer formulieren`);
  }
}
if (eins.length > 3 && !broll.mehr_als_drei_freigegeben) fehler.push(`${eins.length} Einblendungen – Vorgabe: höchstens 3 pro Video, außer freigegeben.`);
if (fehler.length) fail(`B-Roll ${brollName}: \n  - ${fehler.join("\n  - ")}`);

// ---------- HTML ----------
// Aufbau nach hyperframes-studio/-core: Hauptdatei enthält nur Video/Audio-Clips und Sub-Kompositions-Hosts;
// Untertitel = eine Sub-Komposition (eine Spur), jede Einblendung = eigene Sub-Komposition (Zeiten darin lokal).
const TOP = { oben: 200, mitte: 640, unten: 940, tief: 1170 };
const fps = q.arbeitskopie.fps;
const xPos = plan.format?.bildausschnitt_x_prozent ?? 50;
fs.rmSync(path.join(out, "compositions"), { recursive: true, force: true });
fs.mkdirSync(path.join(out, "compositions"), { recursive: true });
const trackV = 0, trackA = 10, trackUT = 20, trackBR = 30;
// Gemessen mit HyperFrames 0.8.77: der Audio-Mix liegt konstant ~2,0 dB unter der Quelle (QA "Pegel Export−Quelle").
// Ausgleich per data-volume; tools/qa.mjs misst das bei jedem Export nach und meldet Abweichungen > 2,5 dB.
const MIX_KORREKTUR = 1.26;
const FONT = `@font-face { font-family: "Poppins"; src: url("assets/fonts/Poppins-Bold.ttf") format("truetype"); font-weight: 700; }`;
const CSS = `
        #root { position: absolute; inset: 0; font-family: "Poppins", sans-serif; font-weight: 700; }
        /* Safe Zone 1080x1920: oben 150, rechts 140, unten 400, links 60 */
        .ut { position: absolute; left: 60px; right: 140px; top: 1330px; display: flex; justify-content: center; }
        .ut-in { max-width: 860px; text-align: center; font-size: 68px; line-height: 1.12; color: #fff; -webkit-text-stroke: 12px #000; paint-order: stroke fill; text-shadow: 0 6px 18px rgba(0,0,0,.45); }
        .w { color: #fff; }
        .broll { position: absolute; left: 60px; right: 140px; display: flex; justify-content: center; }
        .titel { text-align: center; font-size: 96px; line-height: 1.08; color: #fff; }
        .zeile { display: block; }
        .tw { position: relative; display: inline-block; padding: 0 10px; }
        .tx { position: relative; -webkit-text-stroke: 14px #000; paint-order: stroke fill; }
        .em .tx { -webkit-text-stroke: 0; }
        .mark { position: absolute; left: 0; right: 0; top: 10%; bottom: 4%; background: #FFD400; border-radius: 14px; transform-origin: left center; }
        .karte { background: rgba(14,14,18,.86); border-radius: 36px; padding: 34px 44px; box-shadow: 0 20px 60px rgba(0,0,0,.45); max-width: 860px; }
        .k-titel { color: #FFD400; font-size: 40px; letter-spacing: .06em; text-transform: uppercase; margin-bottom: 14px; }
        .punkt { display: flex; align-items: center; gap: 22px; color: #fff; font-size: 56px; line-height: 1.15; margin: 10px 0; }
        .chk { width: 64px; height: 64px; flex: none; }
        .chk path { stroke-dasharray: 48; }
        .pille { display: flex; align-items: stretch; background: rgba(14,14,18,.88); border-radius: 26px; overflow: hidden; box-shadow: 0 14px 40px rgba(0,0,0,.4); }
        .balken { width: 16px; background: #FFD400; transform-origin: center bottom; }
        .p-tx { color: #fff; font-size: 54px; padding: 20px 34px; }
        .cta { position: relative; display: flex; flex-direction: column; align-items: center; }
        .cta-tx { color: #FFD400; font-size: 76px; line-height: 1.05; text-align: center; -webkit-text-stroke: 14px #000; paint-order: stroke fill; max-width: 720px; }
        .pfeil { width: 170px; height: 170px; margin-top: 6px; margin-right: 380px; }
        .pfeil path { stroke-dasharray: 260; }
        .bildkarte { background: #fff; border-radius: 36px; padding: 22px; box-shadow: 0 24px 70px rgba(0,0,0,.5); }
        .bildkarte img { display: block; max-width: 700px; max-height: 720px; object-fit: contain; border-radius: 22px; }`;
const subcomp = (cid, markup, js) => {
  fs.writeFileSync(path.join(out, "compositions", `${cid}.html`), `<!doctype html>
<html lang="de">
  <head>
    <meta charset="UTF-8" />
    <!-- GENERIERT von tools/baue.mjs – nicht von Hand ändern. -->
  </head>
  <body>
    <template>
      <style>
        ${FONT}${CSS}
      </style>
      <div id="root" data-composition-id="${cid}" data-width="${W}" data-height="${H}">${markup}
      </div>
      <script>
        const tl = gsap.timeline({ paused: true });${js}
        window.__timelines["${cid}"] = tl;
      </script>
    </template>
  </body>
</html>
`);
};
const host = (cid, s, d, track) => `
      <div id="${cid}" data-composition-id="${cid}" data-composition-src="compositions/${cid}.html" data-start="${s}" data-duration="${d}" data-track-index="${track}" data-width="${W}" data-height="${H}"></div>`;

let html = "";
zk.forEach((z) => {
  const d = r3(z.schnitt_ende - z.schnitt_start);
  const auto = JSON.stringify({ version: 1, lanes: [{ target: "volume", points: [{ t: 0, v: 0 }, { t: 0.012, v: 1 }, { t: r3(d - 0.012), v: 1 }, { t: d, v: 0 }] }] });
  html += `
      <video id="v-${z.bereich}" class="clip quelle" src="assets/quelle.mp4" data-start="${z.schnitt_start}" data-duration="${d}" data-media-start="${z.quelle_start}" data-track-index="${trackV}" muted playsinline></video>
      <audio id="a-${z.bereich}" src="assets/quelle.mp4" data-start="${z.schnitt_start}" data-duration="${d}" data-media-start="${z.quelle_start}" data-track-index="${trackA}" data-volume="${MIX_KORREKTUR}" data-automation='${auto}'></audio>`;
});

// Untertitel (Wort-Hervorhebung im Takt). Während einer CTA-Einblendung ausgeblendet (sonst doppelt).
const ctaFenster = eins.filter((e) => e.typ === "cta").map((e) => [e.start, e.start + e.dauer]);
if (ut) {
  let m = "", js = "";
  for (const c of ut.chunks) {
    if (ctaFenster.some(([a, b]) => c.start < b && c.ende > a)) continue;
    const d = r3(c.ende - c.start);
    m += `
        <div id="${c.id}" class="clip ut" data-start="${c.start}" data-duration="${d}" data-track-index="0"><p class="ut-in">${c.woerter.map((w, i) => `<span class="w" id="${c.id}-w${i}">${esc(w.text)}</span>`).join(" ")}</p></div>`;
    js += `\n        tl.fromTo("#${c.id} .ut-in", { scale: 0.86, y: 16, opacity: 0 }, { scale: 1, y: 0, opacity: 1, duration: 0.14, ease: "back.out(2.2)" }, ${c.start});`;
    c.woerter.forEach((w, i) => {
      js += `\n        tl.set("#${c.id}-w${i}", { color: "#FFD400" }, ${r3(Math.max(c.start, w.s))});`;
      if (i < c.woerter.length - 1) js += `\n        tl.set("#${c.id}-w${i}", { color: "#FFFFFF" }, ${r3(Math.max(c.start, c.woerter[i + 1].s))});`;
    });
  }
  subcomp("untertitel", m, js);
  html += host("untertitel", 0, GESAMT, trackUT);
}

const CHECK = `<svg class="chk" viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="none" stroke="#FFD400" stroke-width="6"/><path d="M19 33 L28 42 L46 23" fill="none" stroke="#FFD400" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
eins.forEach((e, k) => {
  const id = e.id, d = e.dauer;
  const top = TOP[e.position || (e.typ === "titel" ? "oben" : e.typ === "cta" ? "tief" : "unten")] ?? 940;
  let inner = "", js = "";
  const T = (x) => r3(x); // lokale Zeit in der Sub-Komposition
  if (e.typ === "titel") {
    const betont = new Set((e.betonung || []).map((x) => x.toLowerCase()));
    inner = `<div class="titel">${(e.zeilen || [e.text]).map((z) => `<div class="zeile">${z.split(/\s+/).map((w) => betont.has(w.toLowerCase()) ? `<span class="tw em"><span class="mark"></span><span class="tx">${esc(w)}</span></span>` : `<span class="tw"><span class="tx">${esc(w)}</span></span>`).join(" ")}</div>`).join("")}</div>`;
    js += `\n        tl.fromTo(".tw", { yPercent: 70, opacity: 0, scale: 0.6, rotation: -5 }, { yPercent: 0, opacity: 1, scale: 1, rotation: 0, duration: 0.38, ease: "back.out(2.4)", stagger: 0.08 }, 0);`;
    js += `\n        tl.fromTo(".mark", { scaleX: 0 }, { scaleX: 1, duration: 0.3, ease: "power3.out" }, 0.35);`;
    js += `\n        tl.to(".em .tx", { color: "#111111", duration: 0.12 }, 0.42);`;
  } else if (e.typ === "punkte") {
    inner = `<div class="karte">${e.titel ? `<div class="k-titel">${esc(e.titel)}</div>` : ""}${e.punkte.map((p, i) => `<div class="punkt" id="${id}-p${i}">${CHECK}<span>${esc(p.text)}</span></div>`).join("")}</div>`;
    js += `\n        tl.fromTo(".karte", { y: 40, scale: 0.92, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.35, ease: "back.out(1.8)" }, 0);`;
    e.punkte.forEach((p, i) => {
      let t = p.wort !== undefined || p.quelle_start !== undefined || p.schnitt_start !== undefined ? zeitVon(p) : null;
      t = t === null || t < e.start ? 0.3 + i * 0.45 : t - e.start;
      t = Math.min(t, d - 0.6);
      js += `\n        tl.fromTo("#${id}-p${i}", { x: -50, opacity: 0 }, { x: 0, opacity: 1, duration: 0.3, ease: "power3.out" }, ${T(t)});`;
      js += `\n        tl.fromTo("#${id}-p${i} path", { strokeDashoffset: 48 }, { strokeDashoffset: 0, duration: 0.3, ease: "power2.out" }, ${T(t + 0.12)});`;
    });
  } else if (e.typ === "hinweis") {
    inner = `<div class="pille"><span class="balken"></span><span class="p-tx">${esc(e.text)}</span></div>`;
    js += `\n        tl.fromTo(".pille", { x: -80, opacity: 0 }, { x: 0, opacity: 1, duration: 0.35, ease: "power3.out" }, 0);`;
    js += `\n        tl.fromTo(".balken", { scaleY: 0 }, { scaleY: 1, duration: 0.25, ease: "power2.out" }, 0.15);`;
  } else if (e.typ === "cta") {
    inner = `<div class="cta"><div class="cta-tx">${esc(e.text || "Jetzt im TikTok Shop")}</div><svg class="pfeil" viewBox="0 0 200 200"><path d="M170 20 C 150 90, 110 130, 40 160" fill="none" stroke="#FFD400" stroke-width="14" stroke-linecap="round"/><path d="M40 160 L 70 118 M40 160 L 92 170" fill="none" stroke="#FFD400" stroke-width="14" stroke-linecap="round"/></svg></div>`;
    js += `\n        tl.fromTo(".cta-tx", { scale: 0.3, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(2.6)" }, 0);`;
    js += `\n        tl.fromTo(".pfeil path", { strokeDashoffset: 260 }, { strokeDashoffset: 0, duration: 0.45, ease: "power2.out", stagger: 0.12 }, 0.35);`;
    const pulse = Math.max(0, Math.floor((d - 1.3) / 0.7));
    if (pulse) js += `\n        tl.to(".cta-tx", { scale: 1.04, duration: 0.35, ease: "sine.inOut", yoyo: true, repeat: ${pulse * 2 - 1} }, 0.9);`;
  } else if (e.typ === "bild") {
    // Produktbild unverändert: keine Filter, kein Verzerren, nur gleichmäßige Skalierung/Bewegung.
    const src = `assets/broll-${path.basename(e.datei)}`;
    link(path.resolve(dir, e.datei), path.join(out, src));
    inner = `<div class="bildkarte"><img src="${src}" alt="${esc(e.zweck)}"/></div>`;
    js += `\n        tl.fromTo(".bildkarte", { y: 60, opacity: 0, scale: 0.9 }, { y: 0, opacity: 1, scale: 1, duration: 0.45, ease: "back.out(1.6)" }, 0);`;
    const n = Math.max(1, Math.floor((d - 0.8) / 1.3));
    js += `\n        tl.to(".bildkarte", { y: -10, duration: 0.65, ease: "sine.inOut", yoyo: true, repeat: ${n * 2 - 1} }, 0.5);`;
  } else fail(`${id}: unbekannter typ "${e.typ}" (titel | punkte | hinweis | cta | bild)`);
  // CTA am Videoende bleibt stehen (kein Ausblenden), alles andere blendet kurz vor Ende aus.
  const amEnde = e.start + d >= GESAMT - 0.05;
  if (!(e.typ === "cta" && amEnde)) js += `\n        tl.to(".broll > *", { opacity: 0, y: -24, duration: 0.2, ease: "power2.in" }, ${T(d - 0.22)});`;
  subcomp(id, `\n        <div class="broll ${e.typ}" style="top:${top}px">${inner}</div>`, js);
  html += host(id, e.start, d, trackBR + k);
});

const index = `<!doctype html>
<html lang="de">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=${W}, height=${H}" />
    <!-- GENERIERT von tools/baue.mjs aus ${name}.json – nicht von Hand ändern, sondern Plan/B-Roll ändern und neu bauen. -->
    <script src="assets/gsap.min.js"></script>
    <style>
      ${FONT}
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { width: ${W}px; height: ${H}px; overflow: hidden; background: #000; }
      #root { position: relative; width: 100%; height: 100%; overflow: hidden; background: #000; }
      video.quelle { position: absolute; left: 0; top: 0; width: 100%; height: 100%; object-fit: cover; object-position: ${xPos}% 50%; }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="${GESAMT}" data-width="${W}" data-height="${H}">${html}
    </div>
    <script>
      const tl = gsap.timeline({ paused: true });
      window.__timelines["main"] = tl;
      tl.seek(0);
    </script>
  </body>
</html>
`;
fs.writeFileSync(path.join(out, "index.html"), index);
writeJSON(path.join(out, "hyperframes.json"), { $schema: "https://hyperframes.heygen.com/schema/hyperframes.json", registry: "https://raw.githubusercontent.com/heygen-com/hyperframes/main/registry", paths: { blocks: "compositions", components: "compositions/components", assets: "assets" }, media: { autoProxy: true } });
writeJSON(path.join(out, "package.json"), { name: `${job}-${name}`, private: true, type: "module", scripts: { dev: `npx --yes hyperframes@${HF_VERSION} preview`, check: `npx --yes hyperframes@${HF_VERSION} check`, render: `npx --yes hyperframes@${HF_VERSION} render` } });
writeJSON(path.join(out, "meta.json"), { gebaut: new Date().toISOString(), plan: name, broll: fs.existsSync(brollPfad) ? brollName : null, dauer_s: GESAMT, fps, bildrate: q.arbeitskopie.bildrate, zeitkarte: zk, einblendungen: eins.map(({ id, typ, start, dauer, zweck }) => ({ id, typ, start, dauer, zweck })) });
console.log(`✓ Komposition: ${path.relative(ROOT, out)}/index.html (${GESAMT} s, ${zk.length} Schnitt-Bereiche, ${ut ? ut.chunks.length : 0} Untertitel, ${eins.length} Einblendungen)`);
