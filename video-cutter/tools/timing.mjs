// TIMING: Szenen am Voiceover ausrichten (Faruk: „Schnitte auf Satzanfänge“).
// node tools/timing.mjs <projekt> <video>
// Jede Szene hat "ab_wort" (Index in vo/woerter.json). Schnitt 0,12 s vor dem Wort; CTA hält 1,4 s nach dem letzten Wort.
// Daraus folgt die Ausgabedauer je Szene und – über das Tempo – der benötigte Quellbereich (von → bis).
// Stoppt, wenn ein Clip dafür zu kurz ist, eine Szene < 1 s wird oder "bis_max" (z. B. private Daten ab 13,8 s) überschritten wird.
import fs from "node:fs";
import path from "node:path";
import { ROOT, readJSON, writeJSON, parseArgs, fail, r3 } from "./lib.mjs";

const { pos } = parseArgs(process.argv.slice(2));
const [projekt, video] = pos;
const pdir = path.join(ROOT, "projekte", projekt || "");
const vdir = path.join(pdir, "videos", video || "");
if (!fs.existsSync(path.join(vdir, "vo", "woerter.json"))) fail("Aufruf: node tools/timing.mjs <projekt> <video> (Voiceover vorher einmessen)");
const spec = readJSON(path.join(vdir, "spec.json"));
const bib = readJSON(path.join(pdir, "bibliothek.json")).clips;
const w = readJSON(path.join(vdir, "vo", "woerter.json")).woerter;
export const VO_START = 0.25, VORLAUF = 0.12, CTA_HALT = 1.4, FPS = 30;
const q = (t) => Math.round(t * FPS) / FPS;

const starts = spec.szenen.map((s, i) => {
  if (i === 0) return 0;
  if (s.ab_wort === undefined || !w[s.ab_wort]) fail(`Szene ${i + 1}: "ab_wort" fehlt oder ungültig`);
  return q(VO_START + w[s.ab_wort].s - VORLAUF);
});
const ende = q(VO_START + w.at(-1).e + CTA_HALT);
const fehler = [];
const szenen = spec.szenen.map((s, i) => {
  const dauer = r3((i + 1 < starts.length ? starts[i + 1] : ende) - starts[i]);
  const faktor = s.tempo === "ramp" ? 1 / 0.8 : typeof s.tempo === "number" ? s.tempo : 1; // Quellsekunden je Ausgabesekunde
  const L = r3(dauer * faktor);
  const bis = r3(s.von + L);
  const clipEnde = bib[s.clip]?.dauer_s ?? Infinity;
  const grenze = Math.min(clipEnde - 0.02, s.bis_max ?? Infinity);
  if (dauer < 1.0) fehler.push(`Szene ${i + 1} (${s.clip}): nur ${dauer} s – Wort-Anker zu dicht`);
  if (bis > grenze) fehler.push(`Szene ${i + 1} (${s.clip}): braucht Quelle ${s.von}–${bis} s, verfügbar bis ${r3(grenze)} s – "von" früher setzen oder anderen Clip wählen`);
  if (i > 0 && s.ab_wort <= spec.szenen[i - 1].ab_wort) fehler.push(`Szene ${i + 1}: ab_wort muss steigen`);
  return { szene: i + 1, clip: s.clip, ab_wort: s.ab_wort ?? null, wort: s.ab_wort !== undefined ? w[s.ab_wort].text : "(Start)", start: starts[i], dauer, von: s.von, bis, tempo: s.tempo ?? 1 };
});
// gleiche Quellsekunden innerhalb eines Videos doppelt?
for (let i = 0; i < szenen.length; i++) for (let j = i + 1; j < szenen.length; j++) {
  const a = szenen[i], b = szenen[j];
  if (a.clip === b.clip && Math.min(a.bis, b.bis) - Math.max(a.von, b.von) > 0.05) fehler.push(`Szene ${a.szene} und ${b.szene} zeigen dieselben Sekunden von ${a.clip}`);
}
writeJSON(path.join(vdir, "timing.json"), { video, vo_start: VO_START, vorlauf: VORLAUF, cta_halt: CTA_HALT, gesamt_s: r3(ende), szenen, fehler });
for (const s of szenen) console.log(`  s${s.szene} ${s.start.toFixed(2)} s  ${String(s.dauer).padEnd(5)} s  ${s.clip} ${s.von}–${s.bis} (Tempo ${s.tempo})  ab „${s.wort}“`);
if (fehler.length) fail(`Timing ${video}:\n  - ${fehler.join("\n  - ")}`);
console.log(`✓ Timing ${video}: ${r3(ende)} s, alle Schnitte auf Wortanfängen`);
