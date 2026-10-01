// MATERIAL-BIBLIOTHEK für den Skript-Workflow (mehrere Clips pro Projekt).
// node tools/bibliothek.mjs <projekt> laden            → lädt alle Clips aus manifest.json (nur fehlende), prüft sha256
// node tools/bibliothek.mjs <projekt> sichten [ids…]    → ffprobe-Werte + Kontaktbogen (1 Bild/s) je Clip → bibliothek.json
// Originale in Drive werden nur gelesen. Lokale Kopien liegen in projekte/<p>/roh/ (gitignored) und werden nie überschrieben.
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { ROOT, readJSON, writeJSON, parseArgs, fail, run, ffprobe, sha256, r3 } from "./lib.mjs";

const { pos } = parseArgs(process.argv.slice(2));
const [projekt, befehl, ...ids] = pos;
if (!projekt || !/^[a-z0-9-]+$/.test(projekt) || !befehl) fail("Aufruf: node tools/bibliothek.mjs <projekt> laden|sichten [ids…]");
const dir = path.join(ROOT, "projekte", projekt);
const manifest = readJSON(path.join(dir, "manifest.json"));
const roh = path.join(dir, "roh");
fs.mkdirSync(roh, { recursive: true });
const bibPfad = path.join(dir, "bibliothek.json");
const bib = fs.existsSync(bibPfad) ? readJSON(bibPfad) : { projekt, clips: {} };
const auswahl = manifest.clips.filter((c) => !ids.length || ids.includes(c.id));

if (befehl === "laden") {
  for (const c of auswahl) {
    const ziel = path.join(roh, c.datei);
    if (fs.existsSync(ziel) && fs.statSync(ziel).size === c.bytes) { console.log(`= ${c.id} vorhanden`); continue; }
    const tmp = `${ziel}.teil`;
    const r = spawnSync("curl", ["-sS", "-L", "--fail", "--retry", "3", "-o", tmp, `https://drive.usercontent.google.com/download?id=${c.drive_id}&export=download&confirm=t`], { encoding: "utf8" });
    if (r.status !== 0) { console.log(`✗ ${c.id}: Download fehlgeschlagen ${r.stderr.trim()}`); continue; }
    const groesse = fs.statSync(tmp).size;
    if (groesse !== c.bytes) { fs.rmSync(tmp); console.log(`✗ ${c.id}: ${groesse} statt ${c.bytes} Bytes (Freigabe/Zugriff prüfen)`); continue; }
    fs.renameSync(tmp, ziel);
    console.log(`✓ ${c.id} ${(groesse / 1e6).toFixed(1)} MB`);
  }
} else if (befehl === "sichten") {
  const kontakt = path.join(dir, "kontakt");
  fs.mkdirSync(kontakt, { recursive: true });
  for (const c of auswahl) {
    const datei = path.join(roh, c.datei);
    if (!fs.existsSync(datei)) { console.log(`- ${c.id}: noch nicht geladen`); continue; }
    const m = ffprobe(datei);
    const v = JSON.parse(run("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=color_transfer,color_primaries", "-of", "json", datei]).stdout).streams[0] || {};
    const hdr = ["arib-std-b67", "smpte2084"].includes(v.color_transfer);
    const typ = m.video.orientierung === "quer" ? "quer" : m.video.breite_angezeigt < 1300 && m.video.hoehe_angezeigt > 2000 ? "screen?" : "hochkant";
    // Kontaktbogen: 1 Bild pro Sekunde, Zeitstempel eingebrannt, max. 40 Bilder
    const n = Math.min(40, Math.max(1, Math.floor(m.dauer_s)));
    const schritt = m.dauer_s / n;
    const bild = path.join(kontakt, `${c.id}.jpg`);
    const tm = hdr ? "zscale=t=linear:npl=203,format=gbrpf32le,zscale=p=bt709,tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p," : "";
    const breite = m.video.orientierung === "quer" ? 320 : 180;
    run("ffmpeg", ["-v", "error", "-y", "-i", datei, "-vf", `${tm}fps=1/${schritt.toFixed(3)},scale=${breite}:-2,drawtext=text='%{eif\\:t\\:d}s':x=6:y=6:fontsize=20:fontcolor=white:box=1:boxcolor=black@0.6,tile=8x${Math.ceil(n / 8)}:padding=4:color=0x222222`, "-frames:v", "1", bild]);
    bib.clips[c.id] = {
      ...(bib.clips[c.id] || {}),
      datei: path.relative(dir, datei), drive_id: c.drive_id, sha256: sha256(datei),
      dauer_s: r3(m.dauer_s), breite: m.video.breite_angezeigt, hoehe: m.video.hoehe_angezeigt,
      orientierung: m.video.orientierung, typ, fps: m.video.fps, variable_bildrate: m.video.variable_bildrate,
      hdr, farbe: v.color_transfer || null, ton: m.audio.length > 0,
      zeitlupe_moeglich: m.video.fps >= 49 ? `bis ${r3(30 / m.video.fps)}x ohne doppelte Bilder` : "nein (< 50 fps)",
      kontaktbogen: path.relative(dir, bild),
      tags: bib.clips[c.id]?.tags || null,
    };
    console.log(`✓ ${c.id}: ${m.video.breite_angezeigt}x${m.video.hoehe_angezeigt} ${m.video.fps} fps ${hdr ? "HDR " : ""}${r3(m.dauer_s)} s`);
  }
  writeJSON(bibPfad, bib);
} else fail(`Unbekannter Befehl ${befehl}`);
