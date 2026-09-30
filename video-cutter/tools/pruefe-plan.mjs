// SCHRITT 3b – Schnittplan prüfen, Zeitkarte und Untertitel auf der NEUEN Schnittzeit erzeugen.
// node tools/pruefe-plan.mjs <job> [--plan schnittplan]
//
// Funktioniert auch für von Hand/vom Schnittplaner bearbeitete Pläne und für Varianten.
// Bereiche dürfen statt Zeiten Phrasen nennen: { "von_phrase": "p3", "bis_phrase": "p5", "grund": "…" }
// (Phrasen-IDs stehen in analyse.json bzw. `node tools/varianten.mjs <job> --saetze`).
// Harte Fehler (Stopp): falsche Quelle/Prüfsumme, Bereich außerhalb der Datei, Grenze mitten in einer
// Sprechinsel (= Wort angeschnitten), überlappende Bereiche ohne "wiederholung": true.
import path from "node:path";
import * as fontkit from "fontkit";
import { readJSON, writeJSON, jobDir, parseArgs, fail, sha256, readPcm, energyDb, r3, ffprobe, ROOT } from "./lib.mjs";

const { pos, opt } = parseArgs(process.argv.slice(2));
const job = pos[0];
const dir = jobDir(job);
const name = opt.plan || "schnittplan";
const planPfad = path.join(dir, `${name}.json`);
const plan = readJSON(planPfad);
const q = readJSON(path.join(dir, "quellen.json"));
const an = readJSON(path.join(dir, "analyse.json"));
const tp = readJSON(path.join(dir, "transcript-pruefung.json"));
const media = path.join(dir, q.arbeitskopie.pfad);

const fehler = [], warn = [];
if (plan.quelle?.sha256 !== q.arbeitskopie.sha256) fehler.push("Plan gehört zu einer anderen Quelldatei (Prüfsumme).");
if (sha256(media) !== q.arbeitskopie.sha256) fehler.push("Arbeitskopie wurde verändert.");
if (plan.transcript_sha256 !== tp.transcript_sha256) fehler.push("Plan beruht auf einem anderen Transkript.");
if (fehler.length) fail(fehler.join("\n  "));

const fps = q.arbeitskopie.fps;
const dauerQ = ffprobe(media).dauer_s;
const inseln = an.inseln;
const woerter = an.woerter;
const phr = Object.fromEntries(an.phrasen.map((p) => [p.id, p]));
const E = energyDb(readPcm(media), 16000, 0.01);
const pegel = (t) => E[Math.min(E.length - 1, Math.max(0, Math.round(t / 0.01)))];
const toFrame = (t) => Math.round(t * fps);

// Phrasen-Bereiche in Zeiten auflösen (Grenzen in die Stille davor/danach legen).
for (const b of plan.bereiche) {
  if (b.von_phrase) {
    const p1 = phr[b.von_phrase], p2 = phr[b.bis_phrase || b.von_phrase];
    if (!p1 || !p2) { fehler.push(`${b.id}: Phrase ${b.von_phrase}/${b.bis_phrase} unbekannt`); continue; }
    const vor = [...inseln].reverse().find((I) => I.b <= p1.s - 0.01);
    const nach = inseln.find((I) => I.a >= p2.e + 0.01);
    const s = Math.max(p1.s - 0.12, vor ? (vor.b + p1.s) / 2 : 0);
    const e = Math.min(p2.e + 0.25, nach ? (p2.e + nach.a) / 2 : dauerQ - 0.05);
    b.start = r3(toFrame(s) / fps); b.ende = r3(toFrame(e) / fps);
    b.aufgeloest_aus = `${b.von_phrase}..${b.bis_phrase || b.von_phrase}`;
    delete b.von_phrase; delete b.bis_phrase;
  }
}
plan.bereiche.forEach((b, k) => { b.id = b.id || `b${k + 1}`; });

for (const b of plan.bereiche) {
  if (!(b.start >= 0 && b.ende > b.start && b.ende <= dauerQ + 0.01)) { fehler.push(`${b.id}: ${b.start}–${b.ende} liegt nicht in 0–${r3(dauerQ)} s`); continue; }
  if (!b.grund) warn.push(`${b.id}: ohne Grund`);
  for (const [t, wo] of [[b.start, "Start"], [b.ende, "Ende"]]) {
    const I = inseln.find((I) => t > I.a + 0.03 && t < I.b - 0.03);
    if (I && !b.erlaube_schnitt_in_sprache) {
      const txt = I.woerter.map((i) => woerter[i].text).join(" ");
      fehler.push(`${b.id}: ${wo} ${t} s schneidet in Sprechinsel ${I.id} (${I.a}–${I.b} s, „${txt || "Geräusch"}“) → Wort angeschnitten`);
    } else if (pegel(t) > an.schwelle_db) warn.push(`${b.id}: ${wo} ${t} s – Pegel über Sprachschwelle, anhören`);
  }
  if (b.ende - b.start < (plan.einstellungen?.minSegment ?? 1.2)) warn.push(`${b.id}: nur ${r3(b.ende - b.start)} s – kurzer Schnitt, wirkt evtl. hektisch`);
}
const sortiert = [...plan.bereiche].sort((x, y) => x.start - y.start);
for (let k = 1; k < sortiert.length; k++) {
  const a = sortiert[k - 1], b = sortiert[k];
  if (b.start < a.ende - 1e-6 && !(a.wiederholung || b.wiederholung)) fehler.push(`${a.id} und ${b.id} überlappen in der Quelle (${b.start} < ${a.ende}) – doppelter Inhalt?`);
}
const umgestellt = plan.bereiche.some((b, k) => k > 0 && b.start < plan.bereiche[k - 1].start);
if (umgestellt) warn.push("Reihenfolge ist umgestellt – prüfen, ob Aussage und Sinn erhalten bleiben.");
if (fehler.length) { writeJSON(planPfad, plan); fail(`Plan ${name} hat Fehler:\n  - ${fehler.join("\n  - ")}`); }

// ---------- Zeitkarte (Frame-genau) ----------
let cum = 0;
const zeitkarte = plan.bereiche.map((b) => {
  const f0 = toFrame(b.start), f1 = toFrame(b.ende);
  const z = { bereich: b.id, quelle_start: r3(f0 / fps), quelle_ende: r3(f1 / fps), schnitt_start: r3(cum / fps), schnitt_ende: r3((cum + f1 - f0) / fps), frames: f1 - f0 };
  cum += f1 - f0;
  return z;
});
const gesamt = r3(cum / fps);
const q2s = (t) => { for (const z of zeitkarte) if (t >= z.quelle_start - 1e-6 && t <= z.quelle_ende + 1e-6) return r3(z.schnitt_start + t - z.quelle_start); return null; };

// ---------- Untertitel auf Schnittzeit ----------
const FUELL = /^(äh+|ähm+|öh+|öhm+|ehm+|hm+|hmm+|äm+|mh+)$/i;
const korr = plan.untertitel_korrekturen || {};
const font = fontkit.openSync(path.join(ROOT, "..", "assets", "fonts", "Poppins-Bold.ttf"));
const UT = { schrift_px: 68, max_breite_px: 820, max_woerter: 5 };
const breite = (t) => (font.layout(t).advanceWidth / font.unitsPerEm) * UT.schrift_px;
const saeubern = (t) => t.replace(/[„“"«»]/g, "").replace(/[.,;:]+$/g, "").replace(/:/g, "");
const liste = [];
for (const z of zeitkarte) {
  for (const w of woerter) {
    const mid = (w.s + w.e) / 2;
    if (mid < z.quelle_start || mid > z.quelle_ende) continue;
    const roh = korr[`w${w.i}`] ?? w.text;
    if (FUELL.test(roh.replace(/[^\p{L}]/gu, "")) || roh.trim() === "") continue;
    const s = r3(z.schnitt_start + Math.max(0, w.s - z.quelle_start));
    const e = r3(z.schnitt_start + Math.min(z.quelle_ende, w.e) - z.quelle_start);
    liste.push({ id: `w${w.i}`, text: saeubern(roh), satzende: /[.?!]$/.test(roh), s, e, bereich: z.bereich, korrigiert: korr[`w${w.i}`] !== undefined });
  }
}
const chunks = [];
let c = null;
for (const w of liste) {
  const test = c ? [...c.woerter.map((x) => x.text), w.text].join(" ") : w.text;
  const neu = !c || c.woerter.length >= UT.max_woerter || breite(test) > UT.max_breite_px || w.s - c.woerter.at(-1).e > 0.45 || w.bereich !== c.woerter.at(-1).bereich;
  if (neu) { c = { woerter: [] }; chunks.push(c); }
  c.woerter.push(w);
  if (w.satzende) c = null;
}
chunks.forEach((ch, k) => {
  ch.id = `ut${k + 1}`;
  ch.text = ch.woerter.map((w) => w.text).join(" ");
  ch.start = ch.woerter[0].s;
  const naechster = chunks[k + 1]?.woerter[0].s ?? gesamt;
  // Untertitel enden spätestens mit ihrem Schnittbereich – nichts hängt in die nächste Einstellung.
  const bereichEnde = zeitkarte.find((z) => z.bereich === ch.woerter.at(-1).bereich).schnitt_ende;
  ch.ende = r3(Math.min(naechster, bereichEnde, Math.max(ch.woerter.at(-1).e + 0.3, ch.start + 0.7)));
  ch.breite_px = Math.round(breite(ch.text));
  if (ch.breite_px > UT.max_breite_px) warn.push(`${ch.id} „${ch.text}“ ist ${ch.breite_px}px breit (max ${UT.max_breite_px})`);
});
const verdaechtig = liste.filter((w) => !w.korrigiert && /[A-ZÄÖÜ][a-zäöü]+[A-ZÄÖÜ]|ck[tk]|tock/.test(w.text)).map((w) => `${w.id} „${w.text}“`);
if (verdaechtig.length) warn.push(`Untertitel-Wörter mit möglichem Hörfehler (Markennamen?): ${verdaechtig.join(", ")} → ggf. "untertitel_korrekturen" im Plan`);

plan.zeitkarte = zeitkarte;
plan.statistik = { ...(plan.statistik || {}), schnitt_s: gesamt, schnitte: zeitkarte.length - 1, geprueft: new Date().toISOString() };
writeJSON(planPfad, plan);
writeJSON(path.join(dir, `untertitel-${name}.json`), { plan: name, einstellungen: UT, chunks: chunks.map(({ id, text, start, ende, breite_px, woerter }) => ({ id, text, start, ende, breite_px, woerter: woerter.map(({ id, text, s, e }) => ({ id, text, s, e })) })) });

console.log(`✓ Plan ${name}: ${zeitkarte.length} Bereiche, ${gesamt} s, Grenzen liegen in Stille`);
for (const z of zeitkarte) console.log(`  ${z.bereich}: Quelle ${z.quelle_start}–${z.quelle_ende} → Schnitt ${z.schnitt_start}–${z.schnitt_ende}`);
console.log(`  ${chunks.length} Untertitel-Blöcke → untertitel-${name}.json`);
for (const w of warn) console.log(`  ⚠ ${w}`);
if (plan.pruefen?.length) console.log(`  ? ${plan.pruefen.length} Stelle(n) in "pruefen" – Entscheidung nötig (bleiben bis dahin im Schnitt).`);
