// SCHRITT 3 – Schnittplan VORSCHLAGEN (verändert nichts an Medien).
// node tools/schnittplan.mjs <job> [--tempo tiktok|ruhig|zuegig] [--plan name]
//
// Grundidee: Wortzeiten von whisper sind Schätzungen. Pausen und Schnittgrenzen kommen aus dem
// TONPEGEL der Arbeitskopie. Geschnitten wird nur in echter Stille zwischen Sprechinseln – so kann
// kein Wort angeschnitten werden. Entfernt wird nur, was belegt ist (Sicherheit "hoch"):
//   • deutlich störende Pausen (werden auf eine natürliche Restpause gekürzt, nicht auf null)
//   • isolierte Füllwörter (äh/ähm …), die allein in einer Sprechinsel stehen
//   • verworfene Takes: ein Satzanfang, der kurz danach neu begonnen wird
// Alles Unklare landet in "pruefen" und bleibt IM Schnitt, bis ein Mensch/der Schnittplaner entscheidet.
import path from "node:path";
import fs from "node:fs";
import { readJSON, writeJSON, jobDir, parseArgs, fail, sha256, readPcm, energyDb, percentile, r3, ffprobe } from "./lib.mjs";

const { pos, opt } = parseArgs(process.argv.slice(2));
const job = pos[0];
const dir = jobDir(job);
const q = readJSON(path.join(dir, "quellen.json"));
const tp = readJSON(path.join(dir, "transcript-pruefung.json"));
const media = path.join(dir, q.arbeitskopie.pfad);
if (!tp.ok) fail("Transkript-Prüfung ist nicht ok – erst Schritt 2 sauber abschließen.");
if (tp.gehoert_zu.sha256 !== q.arbeitskopie.sha256 || sha256(media) !== q.arbeitskopie.sha256)
  fail("Transkript gehört nicht zur aktuellen Arbeitskopie (Prüfsummen verschieden). Nie Zeiten verschiedener Dateien mischen.");
if (sha256(path.join(dir, "transcript.json")) !== tp.transcript_sha256) fail("transcript.json wurde nach der Prüfung verändert – Schritt 2 wiederholen.");

const TEMPI = {
  ruhig: { maxPause: 1.0, restPause: 0.5, minSegment: 1.5 },
  tiktok: { maxPause: 0.7, restPause: 0.35, minSegment: 1.2 },
  zuegig: { maxPause: 0.5, restPause: 0.25, minSegment: 0.9 },
};
const tempo = opt.tempo || "tiktok";
const E_ = TEMPI[tempo];
if (!E_) fail(`Tempo "${tempo}" unbekannt (ruhig | tiktok | zuegig).`);
const cfg = { tempo, ...E_, vorlauf: 0.08, nachlauf: 0.5, fps: q.arbeitskopie.fps };

// ---------- 1. Tonpegel → Sprechinseln ----------
const RATE = 16000, WIN = 0.01;
const pcm = readPcm(media, 0, null, RATE);
const E = energyDb(pcm, RATE, WIN);
const floor = percentile(E, 10), p95 = percentile(E, 95);
const thr = Math.max(floor + 10, p95 - 30);
const warn = [];
if (p95 - floor < 18) warn.push(`Wenig Pegelunterschied zwischen Sprache und Hintergrund (${(p95 - floor).toFixed(1)} dB) – Pausenerkennung unsicher, Musik/Lärm im Hintergrund?`);
let sp = Array.from(E, (e) => e > thr);
const fill = (arr, val, maxLen) => { // kurze Läufe von !val in val umwandeln
  let i = 0;
  while (i < arr.length) {
    if (arr[i] === val) { i++; continue; }
    let j = i; while (j < arr.length && arr[j] !== val) j++;
    if (j - i <= maxLen && i > 0 && j < arr.length) for (let k = i; k < j; k++) arr[k] = val;
    i = j;
  }
};
fill(sp, true, 12);  // Lücken < 120 ms in Sprache schließen (Plosive, Silbengrenzen)
fill(sp, false, 5);  // Knackser < 50 ms entfernen
const inseln = [];
for (let i = 0; i < sp.length;) {
  if (!sp[i]) { i++; continue; }
  let j = i; while (j < sp.length && sp[j]) j++;
  inseln.push({ a: r3(i * WIN), b: r3(j * WIN), woerter: [] });
  i = j;
}
if (inseln.length === 0) fail("Im Ton wurde keine Sprache gefunden.");
const pegelBei = (t) => E[Math.min(E.length - 1, Math.max(0, Math.round(t / WIN)))];
const stillBei = (t) => [-0.02, 0, 0.02].every((d) => pegelBei(t + d) <= thr);

// ---------- 2. Wörter monoton den Inseln zuordnen (DP) ----------
// Die Wortfolge wird in zusammenhängende Gruppen zerlegt, eine je Insel (leer erlaubt).
// Kosten = Zeitabstand der whisper-Zeit zur Insel + Abweichung Sprechdauer (Buchstaben/Rate) von der
// Inseldauer + Strafe für ein Satzende mitten in einer Insel. Robuster als reine Zeitnähe, weil
// whisper Wörter über Pausen hinweg verschiebt.
const words = readJSON(path.join(dir, "transcript.json")).map((w, i) => ({ ...w, i }));
const n = words.length, m = inseln.length;
const chars = words.map((w) => Math.max(1, w.text.replace(/[^\p{L}\p{N}]/gu, "").length));
const rate = chars.reduce((a, b) => a + b, 0) / inseln.reduce((s, I) => s + (I.b - I.a), 0);
const dist = (w, I) => { const mid = (w.start + w.end) / 2; return mid < I.a ? I.a - mid : mid > I.b ? mid - I.b : 0; };
const MAXG = 60;
const F = Array.from({ length: m + 1 }, () => new Float64Array(n + 1).fill(Infinity));
const B = Array.from({ length: m + 1 }, () => new Int32Array(n + 1));
F[0][0] = 0;
for (let jj = 1; jj <= m; jj++) {
  const I = inseln[jj - 1], dur = I.b - I.a;
  for (let i = 0; i <= n; i++) {
    let best = F[jj - 1][i] + 0.6 * dur, arg = i; // leere Insel
    let d = 0, c = 0, satz = 0;
    for (let k = i - 1; k >= 0 && i - k <= MAXG; k--) {
      d += dist(words[k], I); c += chars[k];
      if (k < i - 1 && /[.?!]$/.test(words[k].text)) satz++;
      const v = F[jj - 1][k] + d + Math.abs(c / rate - dur) + 1.0 * satz;
      if (v < best) { best = v; arg = k; }
    }
    F[jj][i] = best; B[jj][i] = arg;
  }
}
if (!Number.isFinite(F[m][n])) fail("Wörter konnten den Sprechinseln nicht zugeordnet werden.");
for (let jj = m, i = n; jj >= 1; jj--) {
  const k = B[jj][i];
  for (let x = k; x < i; x++) words[x].insel = jj - 1;
  i = k;
}
for (const w of words) inseln[w.insel].woerter.push(w);
// Wortzeiten innerhalb der Insel verfeinern: whisper-Zeiten, wenn sie passen, sonst nach Buchstaben verteilt.
for (const [k, I] of inseln.entries()) {
  I.id = `i${k}`;
  const ws = I.woerter;
  if (!ws.length) continue;
  const passt = ws.every((w) => w.start >= I.a - 0.1 && w.end <= I.b + 0.1);
  if (passt) {
    for (const w of ws) { w.s = r3(Math.max(I.a, w.start)); w.e = r3(Math.min(I.b, Math.max(w.end, w.s + 0.05))); w.zeit = "whisper"; }
  } else {
    const len = ws.map((w) => Math.max(2, w.text.replace(/[^\p{L}\p{N}]/gu, "").length));
    const sum = len.reduce((a, b) => a + b, 0);
    let t = I.a;
    ws.forEach((w, x) => { w.s = r3(t); t += ((I.b - I.a) * len[x]) / sum; w.e = r3(t); w.zeit = "verteilt"; });
  }
}
const inselOhneWort = inseln.filter((I) => !I.woerter.length);

// ---------- 3. Phrasen ----------
const norm = (s) => s.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
const FUELL = /^(äh+|ähm+|öh+|öhm+|ehm+|hm+|hmm+|äm+|mh+)$/;
const CUE = /(moment|nochmal|noch mal|sorry|warte|quatsch|neu anfangen|von vorne|falsch|ups|oh gott|mist)/i;
const phrasen = [];
let cur = null;
for (const w of words) {
  const lueckeVorher = cur ? w.s - cur.woerter.at(-1).e : 0;
  if (!cur || lueckeVorher >= 0.35) { cur = { woerter: [] }; phrasen.push(cur); }
  cur.woerter.push(w);
  if (/[.?!]$/.test(w.text)) cur = null;
}
for (const [k, p] of phrasen.entries()) {
  p.id = `p${k}`;
  p.s = p.woerter[0].s; p.e = p.woerter.at(-1).e;
  p.text = p.woerter.map((w) => w.text).join(" ");
  p.tokens = p.woerter.map((w) => norm(w.text)).filter((t) => t && !FUELL.test(t));
}

// ---------- 4. Kandidaten ----------
const entfernt = [];
const pruefen = [];
const inselVor = (t) => [...inseln].reverse().find((I) => I.b <= t + 1e-6);
const inselNach = (t) => inseln.find((I) => I.a >= t - 1e-6);
const rp = cfg.restPause;
// Bereich zwischen zwei Inseln so ausschneiden, dass eine natürliche Restpause bleibt.
const schnittZwischen = (endeVorher, startDanach) => [r3(endeVorher + rp * 0.45), r3(startDanach - rp * 0.55)];

// (a) verworfene Takes
for (let k = 0; k < phrasen.length; k++) {
  const P = phrasen[k];
  if (P.tokens.length < 2) continue;
  for (let x = k + 1; x < phrasen.length && x <= k + 4; x++) {
    const Q = phrasen[x];
    if (Q.s - P.e > 12) break;
    const kk = Math.min(3, P.tokens.length);
    const gleich = P.tokens.slice(0, kk).every((t, i) => Q.tokens[i] === t);
    if (!gleich || Q.tokens.length < P.tokens.length) continue;
    const zwischen = phrasen.slice(k + 1, x).map((z) => z.text).join(" ");
    const cue = CUE.test(zwischen) || CUE.test(P.text);
    const vollDoppelt = Q.tokens.length === P.tokens.length;
    const vor = inselVor(P.s - 0.001);
    const [a, b] = schnittZwischen(vor ? vor.b : Math.max(0, P.s - rp), Q.s);
    const eintrag = { start: a, ende: b, typ: "verworfener_take", text: [P.text, zwischen].filter(Boolean).join(" … "),
      grund: `Satz „${P.text}“ wird bei ${r3(Q.s)} s neu begonnen („${Q.text}“)${cue ? `, Abbruch-Signal „${(zwischen || P.text).match(CUE)?.[0]}“` : ""}.`,
      behalten_statt: Q.id };
    if (!vollDoppelt && (cue || kk >= 3)) entfernt.push({ ...eintrag, unsicherheit: "niedrig" });
    else pruefen.push({ ...eintrag, unsicherheit: vollDoppelt ? "hoch" : "mittel",
      frage: vollDoppelt ? "Zwei vollständige Takes – welcher ist besser? Standard wäre der letzte." : "Neustart nicht eindeutig belegt." });
    break;
  }
}
const inEntfernt = (t) => entfernt.some((r) => t >= r.start && t <= r.ende);
// (b) Abbruch-Signale ohne erkannten Neustart
for (const P of phrasen) if (CUE.test(P.text) && !inEntfernt(P.s)) pruefen.push({ start: P.s, ende: P.e, typ: "abbruch_signal", text: P.text, unsicherheit: "mittel", grund: "Enthält ein typisches Abbruch-Wort, aber kein eindeutiger Neustart gefunden.", frage: "Versprecher oder gewollte Aussage?" });
// (c) Füllwörter
for (const I of inseln) {
  if (!I.woerter.length || inEntfernt(I.a)) continue;
  const alleFuell = I.woerter.every((w) => FUELL.test(norm(w.text)));
  const einige = I.woerter.filter((w) => FUELL.test(norm(w.text)));
  if (alleFuell) {
    const vor = inselVor(I.a - 0.001), nach = inselNach(I.b + 0.001);
    if (vor && nach) {
      const [a, b] = schnittZwischen(vor.b, nach.a);
      entfernt.push({ start: a, ende: b, typ: "fuellwort", text: I.woerter.map((w) => w.text).join(" "), unsicherheit: "niedrig", grund: "Füllwort steht allein zwischen zwei Pausen (im Ton belegt)." });
    }
  } else if (einige.length) {
    pruefen.push({ start: einige[0].s, ende: einige.at(-1).e, typ: "fuellwort_im_satz", text: I.woerter.map((w) => w.text).join(" "), unsicherheit: "mittel", grund: "Füllwort ohne Pause davor/danach – sauberer Schnitt nicht sicher.", frage: "Stehen lassen oder mit Risiko schneiden?" });
  }
}
// (d) Wortwiederholung (Stottern) – nur markieren
for (let i = 1; i < words.length; i++) {
  const a = norm(words[i - 1].text), b = norm(words[i].text);
  if (a && a === b && !FUELL.test(a) && !inEntfernt(words[i].s)) pruefen.push({ start: words[i - 1].s, ende: words[i].e, typ: "wortwiederholung", text: `${words[i - 1].text} ${words[i].text}`, unsicherheit: "mittel", grund: "Wort doppelt – Stottern oder Betonung?", frage: "Eine Wiederholung entfernen?" });
}
// (e) Geräusche ohne Wort
for (const I of inselOhneWort) if (!inEntfernt(I.a) && I.b - I.a > 0.15) pruefen.push({ start: I.a, ende: I.b, typ: "geraeusch_ohne_wort", text: "", unsicherheit: "mittel", grund: "Pegel ohne erkanntes Wort (Atmen, Räuspern, Nebengeräusch?).", frage: "Anhören – behalten oder raus?" });
// (f) Pausen
for (let k = 1; k < inseln.length; k++) {
  const A = inseln[k - 1], B = inseln[k];
  const L = B.a - A.b;
  if (L <= cfg.maxPause) continue;
  if (inEntfernt(A.b + 0.01) || inEntfernt(B.a - 0.01)) continue;
  const [a, b] = schnittZwischen(A.b, B.a);
  const vorFrage = A.woerter.at(-1)?.text.endsWith("?");
  const eintrag = { start: a, ende: b, typ: "pause", text: "", grund: `Pause ${r3(L)} s → ${rp} s`, pause_s: r3(L) };
  if (L >= 1.0 || (L > cfg.maxPause && !vorFrage)) entfernt.push({ ...eintrag, unsicherheit: "niedrig" });
  else pruefen.push({ ...eintrag, unsicherheit: "mittel", frage: "Pause nach Frage – bewusste Wirkungspause?" });
}

// ---------- 5. Behaltene Bereiche ----------
const gesamtA = r3(Math.max(0, inseln.find((I) => I.woerter.length).a - cfg.vorlauf));
const letzte = [...inseln].reverse().find((I) => I.woerter.length);
const dauer = ffprobe(media).dauer_s;
const gesamtE = r3(Math.min(dauer - 0.05, letzte.b + cfg.nachlauf));
let cuts = entfernt.filter((r) => r.ende - r.start >= 0.15).sort((x, y) => x.start - y.start);
const merged = [];
for (const c of cuts) {
  const last = merged.at(-1);
  if (last && c.start <= last.ende + 0.3) { last.ende = Math.max(last.ende, c.ende); last.teile.push(c); }
  else merged.push({ start: c.start, ende: c.ende, teile: [c] });
}
const baueBereiche = (ms) => {
  const out = [];
  let t = gesamtA;
  for (const c of ms) { if (c.start > t) out.push([t, c.start]); t = Math.max(t, c.ende); }
  if (gesamtE > t) out.push([t, gesamtE]);
  return out;
};
// Mindestlänge: zu kurze Stücke nicht durch Pausenschnitte erzeugen (TikTok: man soll noch etwas sehen).
for (let guard = 0; guard < 50; guard++) {
  const b = baueBereiche(merged);
  const kurz = b.findIndex(([a, e]) => e - a < cfg.minSegment);
  if (kurz < 0) break;
  const [a, e] = b[kurz];
  const nachbar = merged.findIndex((c) => (Math.abs(c.ende - a) < 1e-6 || Math.abs(c.start - e) < 1e-6) && c.teile.every((x) => x.typ === "pause"));
  if (nachbar < 0) { pruefen.push({ start: a, ende: e, typ: "kurzes_segment", text: "", unsicherheit: "mittel", grund: `Segment nur ${r3(e - a)} s lang (Minimum ${cfg.minSegment} s) – wirkt evtl. hektisch.`, frage: "Ok so oder Schnitt anders legen?" }); break; }
  const [weg] = merged.splice(nachbar, 1);
  for (const t of weg.teile) { t.zurueckgenommen = true; pruefen.push({ ...t, typ: "pause_behalten", unsicherheit: "mittel", grund: `${t.grund} – NICHT geschnitten, sonst entstünde ein Stück unter ${cfg.minSegment} s.` }); }
}
// Grenzen: auf Pegelminimum (±40 ms) und dann aufs Bildraster legen, danach prüfen.
const snap = (t) => {
  let best = t, bestE = Infinity;
  for (let d = -0.04; d <= 0.0401; d += WIN) { const e = pegelBei(t + d); if (e < bestE) { bestE = e; best = t + d; } }
  return r3(Math.round(best * cfg.fps) / cfg.fps);
};
const textIn = (a, e) => words.filter((w) => (w.s + w.e) / 2 >= a && (w.s + w.e) / 2 <= e).map((w) => w.text).join(" ");
const bereiche = baueBereiche(merged).map(([a, e], k) => {
  const s = k === 0 ? r3(Math.floor(a * cfg.fps) / cfg.fps) : snap(a);
  const en = snap(e);
  return { id: `b${k + 1}`, start: s, ende: en, dauer: r3(en - s), text: textIn(s, en), grund: "Aussage behalten", unsicherheit: "niedrig" };
});
for (const b of bereiche) {
  const probleme = [];
  if (!stillBei(b.start) && b.start > gesamtA + 0.01) probleme.push("Start liegt nicht in Stille");
  if (!stillBei(b.ende)) probleme.push("Ende liegt nicht in Stille");
  if (probleme.length) { b.unsicherheit = "mittel"; b.grenz_warnung = probleme; }
}
const aktivEntfernt = merged.flatMap((c) => c.teile).filter((t) => !t.zurueckgenommen);

const plan = {
  version: 1,
  job,
  erstellt: new Date().toISOString(),
  erstellt_von: "tools/schnittplan.mjs (Vorschlag – vom Schnittplaner zu prüfen)",
  quelle: { datei: q.arbeitskopie.pfad, sha256: q.arbeitskopie.sha256, offset_zum_original_s: q.arbeitskopie.offset_zum_original_s, fps: cfg.fps, bildrate: q.arbeitskopie.bildrate },
  transcript_sha256: tp.transcript_sha256,
  einstellungen: cfg,
  format: { breite: 1080, hoehe: 1920, bildausschnitt_x_prozent: 50 },
  regel: "bereiche = Reihenfolge im fertigen Video. Zeiten = Sekunden in der ARBEITSKOPIE. Nur schneiden, was belegt ist.",
  bereiche,
  entfernt: aktivEntfernt.map((r) => ({ start: r.start, ende: r.ende, dauer: r3(r.ende - r.start), typ: r.typ, text: r.text, grund: r.grund, unsicherheit: r.unsicherheit })),
  pruefen: pruefen.sort((x, y) => x.start - y.start),
  statistik: {
    quelle_s: r3(dauer),
    schnitt_s: r3(bereiche.reduce((s, b) => s + b.dauer, 0)),
    schnitte: bereiche.length - 1,
  },
  warnungen: warn,
};
const name = opt.plan || "schnittplan";
const planPfad = path.join(dir, `${name}.json`);
if (fs.existsSync(planPfad)) fs.renameSync(planPfad, path.join(dir, `${name}.alt-${Date.now()}.json`));
writeJSON(planPfad, plan);
writeJSON(path.join(dir, "analyse.json"), {
  hinweis: "Sprechinseln aus dem Tonpegel + monoton zugeordnete Wörter. Grundlage für Grenzprüfung, Untertitel und Varianten.",
  schwelle_db: r3(thr), rauschboden_db: r3(floor), sprachpegel_p95_db: r3(p95),
  inseln: inseln.map((I) => ({ id: I.id, a: I.a, b: I.b, woerter: I.woerter.map((w) => w.i) })),
  woerter: words.map((w) => ({ i: w.i, text: w.text, whisper: [w.start, w.end], s: w.s, e: w.e, insel: `i${w.insel}`, zeit: w.zeit })),
  phrasen: phrasen.map((p) => ({ id: p.id, s: p.s, e: p.e, text: p.text })),
});

console.log(`✓ Schnittplan ${name}.json (Tempo ${tempo})`);
console.log(`  ${plan.statistik.quelle_s} s → ${plan.statistik.schnitt_s} s, ${plan.statistik.schnitte} Schnitte`);
for (const r of plan.entfernt) console.log(`  ✂ ${r.start}–${r.ende} ${r.typ}: ${r.grund}`);
for (const r of plan.pruefen) console.log(`  ? ${r3(r.start)}–${r3(r.ende)} ${r.typ}: ${r.grund}`);
for (const w of [...warn, ...bereiche.filter((b) => b.grenz_warnung).map((b) => `${b.id}: ${b.grenz_warnung.join(", ")}`)]) console.log(`  ⚠ ${w}`);
