// SKRIPT-SPECS PRÜFEN (Pflicht vor jedem Bau) – Regeln, Belege, Diversität, Abdeckung, Vergleich mit alten Videos.
// node tools/pruefe-spec.mjs <projekt>
// Liest projekte/<p>/videos/*/spec.json, fakten.json, manifest.json, bibliothek.json (falls gesichtet), referenz/alt-specs.json.
// Schreibt projekte/<p>/pruefung.md. Exit 1 bei Fehlern.
import fs from "node:fs";
import path from "node:path";
import { ROOT, readJSON, parseArgs, fail, r3 } from "./lib.mjs";

const { pos } = parseArgs(process.argv.slice(2));
const projekt = pos[0];
const dir = path.join(ROOT, "projekte", projekt || "");
if (!projekt || !fs.existsSync(dir)) fail("Aufruf: node tools/pruefe-spec.mjs <projekt>");
const fakten = readJSON(path.join(dir, "fakten.json"));
const manifest = readJSON(path.join(dir, "manifest.json"));
const bib = fs.existsSync(path.join(dir, "bibliothek.json")) ? readJSON(path.join(dir, "bibliothek.json")).clips : {};
const altPfad = path.join(dir, "referenz", "alt-specs.json");
const alt = fs.existsSync(altPfad) ? readJSON(altPfad) : null;
const clipsById = Object.fromEntries(manifest.clips.map((c) => [c.id, c]));
const vdir = path.join(dir, "videos");
const specs = fs.existsSync(vdir) ? fs.readdirSync(vdir).filter((d) => fs.existsSync(path.join(vdir, d, "spec.json"))).map((d) => {
  const s = { id: d, ...readJSON(path.join(vdir, d, "spec.json")) };
  const t = path.join(vdir, d, "timing.json"); // am Voiceover ausgerichtete Quellbereiche
  if (fs.existsSync(t)) readJSON(t).szenen.forEach((x, i) => { if (s.szenen[i]) { s.szenen[i].von = x.von; s.szenen[i].bis = x.bis; } });
  return s;
}) : [];
if (!specs.length) fail("Keine Specs unter videos/*/spec.json");

// gleiche Sperrliste wie tools/baue.mjs (VERBOTEN) + rote Claims aus dem Faktenblatt
const VERBOTEN = /(viral|garantiert|100 ?%|nie wieder|platz \d|bestseller|ausverkauft|nur heute|rabatt|gratis|kostenlos|€|\bpreis)/i;
const ROT = new RegExp(fakten.rot.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"), "i");
const CLAIM = /(\d|gramm|\bg\b|km|minute|4k|gimbal|hindernis|speicher|reichweite|folgt|verfolgt|akku|flugzeit|fps|stimme|geste|hand|c0|führerschein)/i;
const WINKEL = ["problem_loesung", "pov_erlebnis", "unboxing", "feature_demo", "vorher_nachher", "einwand", "geschenk", "alltag", "detail_tour", "fahrgefuehl", "licht_check"];
const TEMPO_MIN_SZENE = 1.0;

const fehler = [], warn = [], info = [];
const E = (s, m) => fehler.push(`${s}: ${m}`), W = (s, m) => warn.push(`${s}: ${m}`);

// Ausgabedauer einer Szene (Tempo-Effekte werden vorab in ffmpeg gerendert, s. zwischenclip.mjs)
export const szenenDauer = (s) => {
  const L = s.bis - s.von;
  if (s.tempo === "ramp") return L / 3 + L / 3 / 2.5 + L / 3;
  return L / (typeof s.tempo === "number" ? s.tempo : 1);
};

const pruefeText = (sid, wo, text, belege, bedingungOk) => {
  if (VERBOTEN.test(text)) E(sid, `${wo}: verbotene Formulierung „${text.match(VERBOTEN)[0]}“`);
  if (ROT.test(text)) E(sid, `${wo}: roter Claim „${text.match(ROT)[0]}“ (Faktenblatt)`);
  if (/tiktok shop/i.test(text)) return; // CTA
  if (CLAIM.test(text) && !(belege || []).length) E(sid, `${wo}: „${text}“ klingt nach Produktbehauptung – "belege" fehlt`);
  for (const b of belege || []) {
    const f = fakten.fakten[b];
    if (!f) E(sid, `${wo}: Beleg „${b}“ gibt es nicht in fakten.json`);
    else if (f.ampel === "gelb" && !bedingungOk) E(sid, `${wo}: Beleg „${b}“ ist gelb (${f.bedingung}) – "bedingung_ok": true nötig`);
    if (f?.bedingung?.includes("bis zu") && !/bis zu/i.test(text)) E(sid, `${wo}: „${b}“ nur mit „bis zu“`);
  }
};

for (const s of specs) {
  const sid = `Video ${s.id}`;
  if (!WINKEL.includes(s.idee?.winkel)) E(sid, `winkel „${s.idee?.winkel}“ nicht aus Liste (${WINKEL.join(", ")})`);
  if (!s.idee?.hook) E(sid, "idee.hook fehlt");
  if (!Array.isArray(s.szenen) || s.szenen.length < 5) E(sid, "mindestens 5 Szenen");
  let gesamt = 0, zeitlupe = 0;
  (s.szenen || []).forEach((z, i) => {
    const w = `Szene ${i + 1}`;
    const c = clipsById[z.clip];
    if (!c) return E(sid, `${w}: Clip „${z.clip}“ nicht im Manifest`);
    const b = bib[z.clip];
    if (b && z.bis > b.dauer_s + 0.01) E(sid, `${w}: bis ${z.bis} > Cliplänge ${b.dauer_s}`);
    if (!(z.bis > z.von && z.von >= 0)) E(sid, `${w}: von/bis ungültig`);
    if (!z.rolle) W(sid, `${w}: ohne rolle`);
    const d = szenenDauer(z);
    if (d < TEMPO_MIN_SZENE - 1e-6) E(sid, `${w}: nur ${r3(d)} s – zu schnell geschnitten (min. ${TEMPO_MIN_SZENE} s)`);
    if (typeof z.tempo === "number" && z.tempo < 1) {
      zeitlupe++;
      if (!b) W(sid, `${w}: Zeitlupe – Bildrate noch nicht gesichtet`);
      else if (b.fps < 49) E(sid, `${w}: Zeitlupe bei ${b.fps} fps würde Bilder doppeln (erst ab 50 fps)`);
      else if (z.tempo < 30 / b.fps - 0.01) E(sid, `${w}: Zeitlupe ${z.tempo}x zu stark für ${b.fps} fps (min. ${r3(30 / b.fps)}x)`);
    }
    if (z.zoom && !["none", "punch", "kenburns_in", "kenburns_out"].includes(z.zoom)) E(sid, `${w}: zoom „${z.zoom}“ unbekannt`);
    if ((z.zoom_max || 1.2) > 1.25) E(sid, `${w}: Zoom über 1,25x (Qualität/Produkt)`);
    if (z.text) pruefeText(sid, `${w} Text`, z.text.inhalt, z.text.belege, z.text.bedingung_ok);
    if (z.stat) pruefeText(sid, `${w} Daten-Karte`, `${z.stat.zahl} ${z.stat.einheit || ""} ${z.stat.label || ""}`, z.stat.belege, z.stat.bedingung_ok);
    gesamt += d;
  });
  // Schlagzeile darf das gleichzeitig gesprochene VO nicht wiederholen (sonst steht derselbe Satz doppelt im Bild: Headline + Untertitel)
  const STOPP = new Set("der die das den dem ein eine und oder zu in im am an auf aus mit von bis per für du dich dir sie es nur so sogar ganz".split(" "));
  const norm = (t) => t.toLowerCase().replace(/[^a-zäöüß0-9/ ]/g, " ").split(/\s+/).filter((x) => x && !STOPP.has(x));
  const voWoerter = (s.voiceover || []).map((x) => x.satz).join(" ").split(/\s+/);
  (s.szenen || []).forEach((z, i) => {
    if (!z.text?.inhalt || z.ab_wort === undefined || s.ohne_vo) return; // ohne VO sind die Texte der „Takt“ selbst
    const naechste = s.szenen.slice(i + 1).find((n) => n.ab_wort !== undefined)?.ab_wort ?? voWoerter.length;
    const gesprochen = new Set(norm(voWoerter.slice(z.ab_wort, naechste).join(" ")));
    const hl = norm(z.text.inhalt);
    const gleich = hl.filter((x) => gesprochen.has(x));
    if (hl.length && gleich.length / hl.length >= 0.5)
      E(sid, `Szene ${i + 1}: Schlagzeile „${z.text.inhalt}“ wiederholt das VO (${gleich.join(", ")}) – Text muss ergänzen, nicht doppeln`);
  });
  if (zeitlupe && !s.regel_ausnahme) E(sid, "Zeitlupe verwendet, aber regel_ausnahme fehlt (Faruk: „keine Zeitlupe“)");
  if (zeitlupe > 1) E(sid, "mehr als ein Zeitlupen-Moment");
  if (gesamt < 15 || gesamt > 35) E(sid, `Länge ${r3(gesamt)} s außerhalb 15–35 s`);
  const vo = (s.voiceover || []).map((x) => x.satz).join(" ");
  (s.voiceover || []).forEach((x, i) => pruefeText(sid, `VO-Satz ${i + 1}`, x.satz, x.belege, x.bedingung_ok));
  const woerter = vo.split(/\s+/).filter(Boolean).length;
  const wps = woerter / Math.max(1, gesamt - 0.8);
  if (wps > 3.4 && !s.ohne_vo) E(sid, `Voiceover zu dicht: ${woerter} Wörter für ${r3(gesamt)} s (${wps.toFixed(2)} W/s, max 3,4)`);
  if (wps < 1.8 && !s.ohne_vo) W(sid, `Voiceover eher dünn: ${wps.toFixed(2)} W/s`);
  if (!/tiktok shop/i.test(s.cta?.text || "")) E(sid, "CTA muss „Jetzt im TikTok Shop“ enthalten");
  s._gesamt = r3(gesamt); s._woerter = woerter; s._vo = vo; s._zeitlupe = zeitlupe;
  info.push(`${sid} „${s.titel}“: ${r3(gesamt)} s, ${s.szenen.length} Szenen, ${woerter} VO-Wörter (${wps.toFixed(2)} W/s), Winkel ${s.idee?.winkel}, Look ${s.look}, Text ${s.textposition}, Zeitlupe ${zeitlupe}`);
}

// ---------- Diversität ----------
const norm = (f) => f.replace(/_cut(?=\.)/i, "").toLowerCase();
const bins = (shots) => { const set = new Set(); for (const x of shots) for (let t = Math.floor(x.von * 10); t < Math.ceil(x.bis * 10); t++) set.add(`${norm(x.datei)}@${t}`); return set; };
const jaccard = (A, B) => { let i = 0; for (const x of A) if (B.has(x)) i++; return i / Math.max(1, A.size + B.size - i); };
const neuShots = (s) => s.szenen.filter((z) => clipsById[z.clip]).map((z) => ({ datei: clipsById[z.clip].datei, von: z.von, bis: z.bis }));
const tri = (t) => { const s = t.toLowerCase().replace(/[^\p{L}\p{N} ]/gu, ""); const out = new Set(); for (let i = 0; i < s.length - 2; i++) out.add(s.slice(i, i + 3)); return out; };
const median = (a) => { const b = [...a].sort((x, y) => x - y); return b[Math.floor(b.length / 2)]; };
const effekt = (s) => s.szenen.filter((z) => (z.zoom && z.zoom !== "none") || z.tempo !== undefined && z.tempo !== 1).length / s.szenen.length;
const paare = [];
for (let i = 0; i < specs.length; i++) for (let j = i + 1; j < specs.length; j++) {
  const a = specs[i], b = specs[j], p = `${a.id}↔${b.id}`;
  const jac = jaccard(bins(neuShots(a)), bins(neuShots(b)));
  const ersteA = a.szenen[0]?.clip, ersteB = b.szenen[0]?.clip, letzteA = a.szenen.at(-1)?.clip, letzteB = b.szenen.at(-1)?.clip;
  const txt = jaccard(tri(a._vo), tri(b._vo));
  const achsen = [
    Math.abs(median(a.szenen.map(szenenDauer)) - median(b.szenen.map(szenenDauer))) / Math.max(median(a.szenen.map(szenenDauer)), median(b.szenen.map(szenenDauer))) >= 0.29,
    a.look !== b.look, a.textposition !== b.textposition, Math.abs(effekt(a) - effekt(b)) >= 0.25,
    Boolean(a.ohne_vo) !== Boolean(b.ohne_vo), // Ton-Format: Sprecher vs. nur Musik/Text (02.10.)
  ];
  paare.push({ p, jac, txt, achsen: achsen.filter(Boolean).length });
  if (jac > 0.2) E(p, `Shot-Überlappung ${r3(jac)} > 0,2`);
  if ([ersteA, letzteA].some((c) => [ersteB, letzteB].includes(c))) E(p, `gleicher Clip am Anfang/Ende (${ersteA}/${letzteA} vs ${ersteB}/${letzteB})`);
  if (a.idee?.winkel === b.idee?.winkel) E(p, "gleicher Winkel");
  if ((a.idee?.hook || "").toLowerCase() === (b.idee?.hook || "").toLowerCase()) E(p, "gleicher Hook");
  if ((a.cta?.text || "") === (b.cta?.text || "") && (a.cta?.zusatz || "") === (b.cta?.zusatz || "")) W(p, "CTA identisch formuliert – Zusatzzeile variieren");
  if (txt >= 0.35) E(p, `Voiceover-Texte zu ähnlich (Trigramm ${r3(txt)} ≥ 0,35)`);
  if (achsen.filter(Boolean).length < 2) E(p, `nur ${achsen.filter(Boolean).length}/5 Gestaltungsachsen verschieden (Rhythmus, Look, Textposition, Effektanteil, Ton-Format)`);
}

// ---------- Vergleich alt ----------
let altZeile = "";
if (alt) {
  const altSets = Object.entries(alt).map(([k, v]) => [k, bins(v.shots.filter((x) => x.datei))]);
  const altPaare = [];
  for (let i = 0; i < altSets.length; i++) for (let j = i + 1; j < altSets.length; j++) altPaare.push(jaccard(altSets[i][1], altSets[j][1]));
  const mittel = altPaare.reduce((s, x) => s + x, 0) / altPaare.length;
  const maxAlt = Math.max(...altPaare);
  const neuMittel = paare.length ? paare.reduce((s, x) => s + x.jac, 0) / paare.length : 0;
  altZeile = `Alte 20 Videos: mittlere Shot-Überlappung je Paar ${r3(mittel)}, Maximum ${r3(maxAlt)} · Neu: ${r3(neuMittel)}`;
  for (const s of specs) {
    const mine = bins(neuShots(s));
    const [kmax, vmax] = altSets.map(([k, set]) => [k, jaccard(mine, set)]).sort((x, y) => y[1] - x[1])[0];
    info.push(`Video ${s.id}: ähnlichstes altes Video ${kmax} (Überlappung ${r3(vmax)})`);
    if (vmax > 0.35) W(`Video ${s.id}`, `ähnelt altem ${kmax} stark (${r3(vmax)})`);
  }
}

// ---------- Abdeckung ----------
const dauerVon = (id) => bib[id]?.dauer_s;
const gesichtet = manifest.clips.filter((c) => dauerVon(c.id));
const gesamtSek = gesichtet.reduce((s, c) => s + dauerVon(c.id), 0);
const alleNeu = new Set(); specs.forEach((s) => bins(neuShots(s)).forEach((x) => alleNeu.add(x)));
const genutzteClips = new Set(specs.flatMap((s) => s.szenen.map((z) => z.clip)));
const abdeckung = gesamtSek ? `${r3(alleNeu.size / 10)} s von ${r3(gesamtSek)} s gesichtetem Material genutzt (${Math.round((alleNeu.size / 10 / gesamtSek) * 100)} %), ${genutzteClips.size}/${gesichtet.length} Clips` : "Material noch nicht gesichtet";

const md = [`# Spec-Prüfung ${projekt}`, "", `**${fehler.length ? "ROT" : "GRÜN"}** · ${new Date().toLocaleString("de-DE")}`, "",
  "## Videos", ...info.map((x) => `- ${x}`), "",
  "## Diversität", "| Paar | Shot-Überlappung (≤0,2) | VO-Ähnlichkeit (<0,35) | Achsen verschieden (≥2/5) |", "|---|---|---|---|",
  ...paare.map((x) => `| ${x.p} | ${r3(x.jac)} | ${r3(x.txt)} | ${x.achsen}/5 |`), "", altZeile, "",
  "## Abdeckung", abdeckung, "",
  "## Fehler", ...(fehler.length ? fehler.map((x) => `- ✗ ${x}`) : ["- keine"]), "",
  "## Warnungen", ...(warn.length ? warn.map((x) => `- ⚠ ${x}`) : ["- keine"]), ""].join("\n");
fs.writeFileSync(path.join(dir, "pruefung.md"), md);
console.log(md);
if (fehler.length) process.exit(1);
