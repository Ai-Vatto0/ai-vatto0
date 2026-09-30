// SCHRITT 6 – Unabhängige, messbare Qualitätsprüfung eines Exports.
// node tools/qa.mjs <job> <export.mp4> [--plan schnittplan] [--ohne-transkript]
//
// Prüft (automatisch, mit Messwerten – kein pauschales "ok"):
//   1. Datei: Auflösung, Bildrate, Dauer, genau 1 Video- + 1 Tonspur
//   2. Lautheit (EBU R128) und True Peak
//   3. Pro Bereich: Ton-Versatz (Kreuzkorrelation Export ↔ Quelle), Ton doppelt/fehlend (Pegelvergleich),
//      Bild-Versatz (Frame-Vergleich Export ↔ Quelle, ±5 Frames)
//   4. Pro Schnittstelle: Pegel am Schnitt (abgeschnittenes Wort?), Kontaktbogen vorher/nachher
//   5. Neu-Transkription des Exports → Wortvergleich mit dem Plan (fehlende/zusätzliche Wörter, v. a. an Schnitten)
//   6. Untertitel-Kontaktbogen + Liste für die menschliche Sichtung
// Was nicht automatisch prüfbar ist, steht als OFFEN im Bericht.
import fs from "node:fs";
import path from "node:path";
import { readJSON, writeJSON, jobDir, parseArgs, fail, run, hf, ffprobe, readPcm, energyDb, r3, fraction } from "./lib.mjs";

const { pos, opt } = parseArgs(process.argv.slice(2));
const [job, videoArg] = pos;
const dir = jobDir(job);
const name = opt.plan || "schnittplan";
const plan = readJSON(path.join(dir, `${name}.json`));
const q = readJSON(path.join(dir, "quellen.json"));
const an = readJSON(path.join(dir, "analyse.json"));
const ut = fs.existsSync(path.join(dir, `untertitel-${name}.json`)) ? readJSON(path.join(dir, `untertitel-${name}.json`)) : null;
const video = path.resolve(videoArg || "");
if (!fs.existsSync(video)) fail(`Export nicht gefunden: ${video}`);
const quelle = path.join(dir, q.arbeitskopie.pfad);
const zk = plan.zeitkarte;
const GESAMT = zk.at(-1).schnitt_ende;
const fps = q.arbeitskopie.fps;
const base = path.basename(video, ".mp4");
const qaDir = path.join(dir, "qa", base);
fs.mkdirSync(qaDir, { recursive: true });

const checks = [];
const add = (bereich, pruefung, status, detail) => { checks.push({ bereich, pruefung, status, detail }); };

// ---------- 1. Datei ----------
const meta = ffprobe(video);
const vRaw = JSON.parse(run("ffprobe", ["-v", "error", "-print_format", "json", "-show_streams", video]).stdout).streams;
const nV = vRaw.filter((s) => s.codec_type === "video").length, nA = vRaw.filter((s) => s.codec_type === "audio").length;
add("datei", "Spuren", nV === 1 && nA === 1 ? "OK" : "FEHLER", `${nV} Video, ${nA} Ton`);
add("datei", "Auflösung", meta.video.breite_angezeigt === 1080 && meta.video.hoehe_angezeigt === 1920 ? "OK" : "FEHLER", `${meta.video.breite_angezeigt}x${meta.video.hoehe_angezeigt}`);
const vfps = fraction(vRaw.find((s) => s.codec_type === "video").r_frame_rate);
add("datei", "Bildrate", Math.abs(vfps - fps) < 0.01 ? "OK" : "WARNUNG", `${r3(vfps)} fps (Quelle ${r3(fps)})`);
const dDiff = Math.abs(meta.dauer_s - GESAMT);
add("datei", "Dauer", dDiff <= 2 / fps + 0.05 ? "OK" : dDiff < 0.3 ? "WARNUNG" : "FEHLER", `${r3(meta.dauer_s)} s (Plan ${GESAMT} s, Abweichung ${r3(dDiff)} s)`);

// ---------- 2. Lautheit ----------
const lr = run("ffmpeg", ["-hide_banner", "-nostats", "-i", video, "-af", "ebur128=peak=true", "-f", "null", "-"]).stderr;
const I = Number(lr.match(/I:\s+(-?[\d.]+) LUFS/g)?.pop()?.match(/-?[\d.]+/)[0]);
const TP = Number(lr.match(/Peak:\s+(-?[\d.]+) dBFS/g)?.pop()?.match(/-?[\d.]+/)[0]);
add("datei", "Lautheit", Math.abs(I + 14) <= 2 ? "OK" : "WARNUNG", `${I} LUFS (Ziel -14 ±2)`);
add("datei", "True Peak", TP <= -1 ? "OK" : "WARNUNG", `${TP} dBTP (Ziel ≤ -1)`);

// ---------- 3. Sync pro Bereich ----------
const RATE = 8000;
const rms = (a) => Math.sqrt(a.reduce((s, x) => s + x * x, 0) / Math.max(1, a.length));
const db = (x) => 20 * Math.log10(x + 1e-9);
const frames = (file, t0, dur, n) => {
  const r = run("ffmpeg", ["-v", "error", "-ss", String(Math.max(0, t0)), "-i", file, "-t", String(dur), "-fps_mode", "passthrough", "-vf", "scale=72:128,format=gray", "-f", "rawvideo", "-"], { binary: true });
  const sz = 72 * 128, out = [];
  for (let k = 0; k + sz <= r.stdout.length && out.length < n; k += sz) out.push(r.stdout.subarray(k, k + sz));
  return out;
};
const mad = (a, b) => { let s = 0; for (let i = 0; i < a.length; i++) s += Math.abs(a[i] - b[i]); return s / a.length; };
for (const z of zk) {
  const dur = z.schnitt_ende - z.schnitt_start;
  const off = Math.min(0.25, dur * 0.2), win = Math.min(1.6, dur - 2 * off);
  if (win < 0.4) { add(z.bereich, "Sync", "OFFEN", "Bereich zu kurz für automatische Sync-Messung"); continue; }
  const src = readPcm(quelle, z.quelle_start + off - 0.25, win + 0.5, RATE);
  const ren = readPcm(video, z.schnitt_start + off, win, RATE);
  const lvl = db(rms(ren)) - db(rms(src.subarray(Math.round(0.25 * RATE), Math.round((0.25 + win) * RATE))));
  if (db(rms(ren)) < -45) add(z.bereich, "Ton vorhanden", "FEHLER", `Export an ${r3(z.schnitt_start + off)} s praktisch stumm`);
  else {
    let best = -2, lag = 0;
    const nr = Math.sqrt(ren.reduce((s, x) => s + x * x, 0));
    for (let L = -Math.round(0.25 * RATE); L <= Math.round(0.25 * RATE); L += 2) {
      let s = 0, ns = 0;
      const o = Math.round(0.25 * RATE) + L;
      for (let i = 0; i < ren.length; i++) { const v = src[o + i] || 0; s += v * ren[i]; ns += v * v; }
      const c = s / (Math.sqrt(ns) * nr + 1e-9);
      if (c > best) { best = c; lag = L; }
    }
    const lagMs = Math.round((lag / RATE) * 1000);
    add(z.bereich, "Ton-Versatz", Math.abs(lagMs) <= 1000 / fps + 2 && best > 0.6 ? "OK" : best <= 0.6 ? "WARNUNG" : "FEHLER", `${lagMs} ms, Korrelation ${best.toFixed(2)}`);
    add(z.bereich, "Ton einfach (nicht doppelt)", Math.abs(lvl) < 2.5 ? "OK" : "FEHLER", `Pegel Export−Quelle ${lvl.toFixed(1)} dB (doppelte Spur ≈ +6 dB)`);
  }
  // Bild: Export-Frame in der Mitte gegen Quelle ±5 Frames
  const tm = z.schnitt_start + dur / 2;
  // Halbes Frame früher starten, damit der Suchpunkt nicht auf einer Framegrenze liegt.
  const [rf] = frames(video, tm - 0.5 / fps, 3 / fps, 1);
  const sf = frames(quelle, z.quelle_start + dur / 2 - 5.5 / fps, 14 / fps, 11);
  if (!rf || sf.length < 11) { add(z.bereich, "Bild-Versatz", "OFFEN", "Frames nicht lesbar"); continue; }
  const d = sf.map((f) => mad(rf, f));
  const k = d.indexOf(Math.min(...d)) - 5;
  const spread = Math.max(...d) - Math.min(...d);
  if (spread < 0.15) add(z.bereich, "Bild-Versatz", "OFFEN", "Bild zu statisch – Versatz nicht messbar");
  else add(z.bereich, "Bild-Versatz", k === 0 ? "OK" : Math.abs(k) === 1 ? "WARNUNG" : "FEHLER", `${k} Frames (Unterschied ${d.map((x) => x.toFixed(2)).join("/")})`);
}

// ---------- 4. Schnittstellen ----------
const Eren = energyDb(readPcm(video, 0, null, 16000), 16000, 0.01);
const schnittBilder = [];
zk.slice(0, -1).forEach((z, i) => {
  const t = z.schnitt_ende;
  const w = Eren.slice(Math.max(0, Math.round((t - 0.06) / 0.01)), Math.round((t + 0.06) / 0.01));
  const peak = Math.max(...w);
  add(`schnitt ${i + 1} (${z.bereich}→${zk[i + 1].bereich})`, "Stille am Schnitt", peak <= an.schwelle_db ? "OK" : "WARNUNG", `max ${peak.toFixed(1)} dB bei ${r3(t)} s (Sprachschwelle ${an.schwelle_db} dB)`);
  schnittBilder.push([r3(Math.max(0, t - 1.5 / fps)), r3(t + 0.5 / fps)]);
});
const sheet = (zeiten, out, spalten) => {
  if (!zeiten.length) return null;
  const tmp = fs.mkdtempSync(path.join(qaDir, ".f-"));
  zeiten.forEach((t, i) => run("ffmpeg", ["-v", "error", "-y", "-ss", String(t), "-i", video, "-frames:v", "1", "-vf", `scale=270:480,drawtext=text='${t.toFixed(2)}s':x=8:y=8:fontsize=22:fontcolor=white:box=1:boxcolor=black@0.6`, path.join(tmp, `f${String(i).padStart(3, "0")}.png`)]));
  const rows = Math.ceil(zeiten.length / spalten);
  run("ffmpeg", ["-v", "error", "-y", "-i", path.join(tmp, "f%03d.png"), "-vf", `tile=${spalten}x${rows}:padding=6:color=0x222222`, "-frames:v", "1", out]);
  fs.rmSync(tmp, { recursive: true, force: true });
  return out;
};
const kSchnitte = sheet(schnittBilder.flat(), path.join(qaDir, "kontakt-schnitte.jpg"), 4);
const utZeiten = (ut?.chunks || []).map((c) => r3((c.start + c.ende) / 2)).filter((t) => t < GESAMT);
const kUT = sheet(utZeiten.slice(0, 16), path.join(qaDir, "kontakt-untertitel.jpg"), 4);

// ---------- 4b. Safe Zone (Pixelvergleich Export ↔ Quelle an Einblendungs-/Untertitel-Zeitpunkten) ----------
// Alles, was im Export deutlich anders ist als die Quelle, ist Grafik. Liegt davon etwas außerhalb der Safe Zone → Befund.
{
  const SW = 270, SH = 480, F = 1080 / SW; // Messraster 1/4
  const zone = { l: 60 / F, r: (1080 - 140) / F, o: 150 / F, u: (1920 - 400) / F };
  const grab = (file, t) => run("ffmpeg", ["-v", "error", "-ss", String(Math.max(0, t)), "-i", file, "-frames:v", "1", "-vf", `scale=${SW}:${SH},format=gray`, "-f", "rawvideo", "-"], { binary: true }).stdout;
  const metaK = fs.existsSync(path.join(dir, `komposition-${name}`, "meta.json")) ? readJSON(path.join(dir, `komposition-${name}`, "meta.json")) : { einblendungen: [] };
  const punkte = [
    ...metaK.einblendungen.flatMap((e) => [e.start + Math.min(1.0, e.dauer / 2), e.start + e.dauer - 0.35].map((t) => ({ t: r3(t), was: e.id }))),
    ...(ut?.chunks || []).map((c) => ({ t: r3((c.start + c.ende) / 2), was: c.id })),
  ].filter((p) => p.t > 0 && p.t < GESAMT);
  const q2s = (t) => { const z = zk.find((z) => t >= z.schnitt_start && t < z.schnitt_ende); return z ? z.quelle_start + (t - z.schnitt_start) : null; };
  const verstoesse = [];
  for (const p of punkte) {
    const tq = q2s(p.t);
    if (tq === null) continue;
    const a = grab(video, p.t), b = grab(quelle, tq);
    if (a.length < SW * SH || b.length < SW * SH) continue;
    let n = 0, box = [SW, SH, 0, 0];
    for (let y = 0; y < SH; y++) for (let x = 0; x < SW; x++) {
      if (Math.abs(a[y * SW + x] - b[y * SW + x]) < 60) continue;
      if (x >= zone.l && x <= zone.r && y >= zone.o && y <= zone.u) continue;
      n++; box = [Math.min(box[0], x), Math.min(box[1], y), Math.max(box[2], x), Math.max(box[3], y)];
    }
    if (n > 12) verstoesse.push(`${p.was} @${p.t}s: ${n * 16} px² außerhalb, Bereich x ${Math.round(box[0] * F)}–${Math.round(box[2] * F)}, y ${Math.round(box[1] * F)}–${Math.round(box[3] * F)}`);
  }
  add("grafik", "Safe Zone (oben 150, rechts 140, unten 400, links 60)", verstoesse.length ? "FEHLER" : "OK", verstoesse.length ? verstoesse.join("; ") : `${punkte.length} Zeitpunkte geprüft`);
}

// ---------- 5. Neu-Transkription ----------
const norm = (s) => s.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
const FUELL = /^(äh+|ähm+|öh+|öhm+|ehm+|hm+|hmm+|äm+|mh+)$/;
let transkript = null;
if (!opt["ohne-transkript"]) {
  const tdir = path.join(qaDir, "transkript");
  fs.mkdirSync(tdir, { recursive: true });
  const r = hf(["transcribe", video, "--engine", "whisper", "--model", opt.model || "small", "--language", "de", "--dir", tdir, "--json"], { allowFail: true });
  const js = (r.stdout || "").trim().split("\n").filter((l) => l.startsWith("{")).pop();
  const ok = r.status === 0 && js && JSON.parse(js).ok === true && fs.existsSync(path.join(tdir, "transcript.json"));
  if (!ok) add("transkript", "Neu-Transkription", "OFFEN", `nicht möglich (Exit ${r.status})`);
  else {
    const gehoert = readJSON(path.join(tdir, "transcript.json")).map((w) => ({ t: norm(w.text), s: w.start, text: w.text })).filter((w) => w.t && !FUELL.test(w.t));
    const erwartet = [];
    for (const z of zk) for (const w of an.woerter) {
      const mid = (w.s + w.e) / 2;
      if (mid >= z.quelle_start && mid <= z.quelle_ende && norm(w.text) && !FUELL.test(norm(w.text)))
        erwartet.push({ t: norm(w.text), text: w.text, s: r3(z.schnitt_start + w.s - z.quelle_start) });
    }
    const lev = (a, b) => { const m = a.length, n = b.length; const d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]); for (let j = 1; j <= n; j++) d[0][j] = j; for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); return d[m][n]; };
    const aehnlich = (a, b) => a === b || lev(a, b) / Math.max(a.length, b.length) <= 0.34;
    const m = erwartet.length, n = gehoert.length;
    const D = Array.from({ length: m + 1 }, (_, i) => Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)));
    for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) D[i][j] = Math.min(D[i - 1][j] + 1, D[i][j - 1] + 1, D[i - 1][j - 1] + (aehnlich(erwartet[i - 1].t, gehoert[j - 1].t) ? 0 : 1));
    const fehlend = [], extra = [], anders = [];
    for (let i = m, j = n; i > 0 || j > 0;) {
      if (i > 0 && j > 0 && D[i][j] === D[i - 1][j - 1] + (aehnlich(erwartet[i - 1].t, gehoert[j - 1].t) ? 0 : 1)) { if (!aehnlich(erwartet[i - 1].t, gehoert[j - 1].t)) anders.push({ erwartet: erwartet[i - 1].text, gehoert: gehoert[j - 1].text, s: erwartet[i - 1].s }); i--; j--; }
      else if (i > 0 && D[i][j] === D[i - 1][j] + 1) { fehlend.push(erwartet[i - 1]); i--; }
      else { extra.push(gehoert[j - 1]); j--; }
    }
    const nahSchnitt = (s) => zk.slice(0, -1).some((z) => Math.abs(z.schnitt_ende - s) < 0.6);
    const quote = 1 - (fehlend.length + extra.length + anders.length) / Math.max(1, m);
    // Untertitel (nach Korrekturen) exakt gegen das im Export Gehörte – zeitlich zugeordnet.
    const utFehler = [];
    for (const c of ut?.chunks || []) for (const w of c.woerter) {
      const t = norm(w.text);
      if (!t) continue;
      const nah = gehoert.filter((g) => g.s >= w.s - 0.45 && g.s <= w.e + 0.45);
      const zusammen = nah.map((g) => g.t).join("");
      if (!nah.some((g) => g.t === t) && !zusammen.includes(t) && !nah.some((g) => t.includes(g.t) && g.t.length >= 4))
        utFehler.push(`${c.id} @${w.s}s „${w.text}“ ≠ gehört „${nah.map((g) => g.text).join(" ") || "–"}“`);
    }
    add("untertitel", "Untertitel = Gehörtes (exakt)", utFehler.length ? "WARNUNG" : "OK", utFehler.length ? utFehler.join("; ") + " → Sichtung: Hörfehler von whisper oder falscher Untertitel?" : `${(ut?.chunks || []).reduce((s, c) => s + c.woerter.length, 0)} Wörter stimmen`);
    transkript = { erwartet: m, gehoert: n, uebereinstimmung: r3(quote), fehlend: fehlend.map((w) => ({ ...w, am_schnitt: nahSchnitt(w.s) })), extra, anders };
    add("transkript", "Wortfolge Export = Plan", quote >= 0.9 && !fehlend.some((w) => nahSchnitt(w.s)) ? "OK" : "WARNUNG", `${Math.round(quote * 100)} % übereinstimmend; fehlend ${fehlend.length} (davon am Schnitt ${fehlend.filter((w) => nahSchnitt(w.s)).length}), zusätzlich ${extra.length}, abweichend ${anders.length}`);
  }
}

// ---------- Bericht ----------
const zaehl = (s) => checks.filter((c) => c.status === s).length;
const gesamtStatus = zaehl("FEHLER") ? "FEHLER" : zaehl("WARNUNG") ? "WARNUNG" : "OK";
const offen = [
  "Anhören: klingt jeder Schnitt natürlich (Atem, Satzmelodie, kein abgehackter Ausklang)?",
  "Untertitel lesen: stimmt jeder Block mit dem Gesprochenen überein (v. a. Produkt-/Markennamen)?",
  "Produkt: wirkt es im Export exakt wie in der Aufnahme (Farbe, Form, Teile) – nichts verdeckt oder abgeschnitten?",
  "Gesichter und Produkt nicht von Text verdeckt? Text in der Safe Zone?",
  "Aussagen in Einblendungen: alles im Video gesagt oder belegt? Keine Preise/Rabatte/Superlative?",
];
const bericht = { job, plan: name, export: video, geprueft: new Date().toISOString(), status: gesamtStatus, checks, transkript,
  kontaktboegen: { schnitte: kSchnitte, untertitel: kUT }, untertitel: ut?.chunks.map((c) => ({ id: c.id, start: c.start, ende: c.ende, text: c.text })), offen_fuer_menschliche_sichtung: offen };
writeJSON(path.join(qaDir, "bericht.json"), bericht);
const md = [`# QA-Bericht ${base}`, "", `**Gesamt: ${gesamtStatus}** · Plan \`${name}\` · ${new Date().toLocaleString("de-DE")}`, "",
  "| Bereich | Prüfung | Status | Messwert |", "|---|---|---|---|", ...checks.map((c) => `| ${c.bereich} | ${c.pruefung} | ${c.status} | ${c.detail} |`), "",
  ...(transkript ? ["## Wortvergleich (Neu-Transkription des Exports)", "", `Fehlend: ${transkript.fehlend.map((w) => `„${w.text}“ @${w.s}s${w.am_schnitt ? " ⚠ am Schnitt" : ""}`).join(", ") || "–"}`, "", `Zusätzlich gehört: ${transkript.extra.map((w) => `„${w.text}“ @${r3(w.s)}s`).join(", ") || "–"}`, "", `Abweichend (oft nur Hörfehler von whisper): ${transkript.anders.map((a) => `„${a.erwartet}“→„${a.gehoert}“`).join(", ") || "–"}`, ""] : []),
  "## Kontaktbögen", "", `- Schnitte (je Schnitt: letztes Bild davor | erstes danach): ${kSchnitte ? path.relative(dir, kSchnitte) : "–"}`, `- Untertitel: ${kUT ? path.relative(dir, kUT) : "–"}`, "",
  "## Offen – braucht menschliche Sichtung", "", ...offen.map((o) => `- [ ] ${o}`), ""].join("\n");
fs.writeFileSync(path.join(qaDir, "bericht.md"), md);
console.log(`${gesamtStatus === "OK" ? "✓" : gesamtStatus === "WARNUNG" ? "⚠" : "✗"} QA ${base}: ${gesamtStatus} (${zaehl("OK")} OK, ${zaehl("WARNUNG")} Warnungen, ${zaehl("FEHLER")} Fehler, ${zaehl("OFFEN")} offen)`);
for (const c of checks.filter((c) => c.status !== "OK")) console.log(`  ${c.status}: ${c.bereich} – ${c.pruefung}: ${c.detail}`);
console.log(`  → ${path.relative(process.cwd(), path.join(qaDir, "bericht.md"))}`);
if (gesamtStatus === "FEHLER") process.exitCode = 2;
