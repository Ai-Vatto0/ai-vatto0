// VARIANTEN – aus längerem Material mehrere UNTERSCHIEDLICHE Clips planen.
// node tools/varianten.mjs <job> --saetze            → nummerierte Satzliste (Bausteine) für den Schnittplaner
// node tools/varianten.mjs <job> --neu variante-01   → leere, korrekt gebundene Varianten-Datei anlegen
// node tools/varianten.mjs <job>                     → alle Pläne vergleichen: Überschneidung, gleicher Hook, Länge
//
// Varianten nutzen Bereiche per Phrase: { "von_phrase": "p12", "bis_phrase": "p14", "rolle": "hook", "grund": "…" }
// Danach wie jeder Plan: pruefe-plan → broll → baue → render (jeweils mit --plan variante-01).
import fs from "node:fs";
import path from "node:path";
import { readJSON, writeJSON, jobDir, parseArgs, fail, r3, fmt } from "./lib.mjs";

const { pos, opt } = parseArgs(process.argv.slice(2));
const job = pos[0];
const dir = jobDir(job);
const an = readJSON(path.join(dir, "analyse.json"));

if (opt.saetze) {
  const rows = an.phrasen.map((p) => `| ${p.id} | ${fmt(p.s)} | ${r3(p.e - p.s)} s | ${p.text} |`);
  const md = [`# Satz-Bausteine ${job}`, "", "Zeiten = Arbeitskopie. Für Varianten mit von_phrase/bis_phrase verwenden.", "", "| ID | Start | Dauer | Text |", "|---|---|---|---|", ...rows, ""].join("\n");
  fs.writeFileSync(path.join(dir, "saetze.md"), md);
  console.log(md);
  process.exit(0);
}

if (opt.neu) {
  const nm = String(opt.neu);
  if (!/^variante-[a-z0-9-]+$/.test(nm)) fail('Name muss mit "variante-" beginnen, z. B. variante-01');
  const ziel = path.join(dir, `${nm}.json`);
  if (fs.existsSync(ziel)) fail(`${nm}.json existiert schon – nichts überschrieben.`);
  const basis = readJSON(path.join(dir, "schnittplan.json"));
  writeJSON(ziel, {
    version: 1, job, erstellt: new Date().toISOString(), erstellt_von: "Schnittplaner (Variante)",
    quelle: basis.quelle, transcript_sha256: basis.transcript_sha256, einstellungen: basis.einstellungen, format: basis.format,
    idee: { winkel: "", zielgruppe: "", hook: "", kernbotschaft: "", cta: "Jetzt im TikTok Shop" },
    regel: "Nur Sätze aus dem Material. Reihenfolge darf umgestellt werden, Aussagen dürfen dadurch nicht verfälscht werden.",
    bereiche: [], entfernt: [], pruefen: [], untertitel_korrekturen: basis.untertitel_korrekturen || {},
  });
  console.log(`✓ ${nm}.json angelegt – Bereiche eintragen, dann: node tools/pruefe-plan.mjs ${job} --plan ${nm}`);
  process.exit(0);
}

const plaene = fs.readdirSync(dir).filter((f) => /^(schnittplan|variante-[a-z0-9-]+)\.json$/.test(f)).map((f) => ({ name: f.replace(/\.json$/, ""), plan: readJSON(path.join(dir, f)) }));
if (!plaene.length) fail("Keine Pläne gefunden.");
const bereichSet = (p) => (p.zeitkarte || []).map((z) => [z.quelle_start, z.quelle_ende]);
const schnittmenge = (A, B) => { let s = 0; for (const [a1, a2] of A) for (const [b1, b2] of B) s += Math.max(0, Math.min(a2, b2) - Math.max(a1, b1)); return s; };
const laenge = (A) => A.reduce((s, [a, b]) => s + b - a, 0);
const zeilen = [];
const probleme = [];
for (const { name, plan } of plaene) {
  const A = bereichSet(plan);
  if (!A.length) { probleme.push(`${name}: noch nicht geprüft (pruefe-plan fehlt)`); continue; }
  const L = laenge(A);
  zeilen.push(`| ${name} | ${r3(L)} s | ${A.length} | ${plan.idee?.winkel || "–"} | ${plan.idee?.hook || (plan.bereiche[0]?.text || "").slice(0, 40)} |`);
  if (L < 8) probleme.push(`${name}: nur ${r3(L)} s – zu kurz für TikTok-Shop (Faruk: 8–11 s, TikTok One oft ≥ 15 s)`);
  if (L > 60) probleme.push(`${name}: ${r3(L)} s – für eine Werbe-Variante eher zu lang`);
}
const paare = [];
for (let i = 0; i < plaene.length; i++) for (let j = i + 1; j < plaene.length; j++) {
  const A = bereichSet(plaene[i].plan), B = bereichSet(plaene[j].plan);
  if (!A.length || !B.length) continue;
  const ov = schnittmenge(A, B) / Math.min(laenge(A), laenge(B));
  const gleicherHook = Math.abs(A[0][0] - B[0][0]) < 0.3;
  paare.push(`| ${plaene[i].name} ↔ ${plaene[j].name} | ${Math.round(ov * 100)} % | ${gleicherHook ? "JA" : "nein"} |`);
  if (ov > 0.5) probleme.push(`${plaene[i].name} ↔ ${plaene[j].name}: ${Math.round(ov * 100)} % gleiches Material – zu ähnlich (keine identischen Massenvarianten)`);
  if (gleicherHook) probleme.push(`${plaene[i].name} ↔ ${plaene[j].name}: gleicher Hook – mindestens der Einstieg sollte sich unterscheiden`);
}
const md = [`# Varianten-Übersicht ${job}`, "", "| Plan | Länge | Bereiche | Winkel | Hook |", "|---|---|---|---|---|", ...zeilen, "",
  "## Überschneidung (Anteil gleichen Quellmaterials)", "", "| Paar | Überschneidung | gleicher Hook |", "|---|---|---|", ...paare, "",
  "## Probleme", "", ...(probleme.length ? probleme.map((p) => `- ${p}`) : ["- keine"]), ""].join("\n");
fs.writeFileSync(path.join(dir, "varianten-uebersicht.md"), md);
console.log(md);
if (probleme.some((p) => p.includes("zu ähnlich"))) process.exitCode = 2;
