// DATEIAUSTAUSCH über Vattos Google-Drive-Ordner „Snova-Videos“ (rclone, Originalqualität, beide Richtungen).
//   node tools/drive.mjs test                      → Schlüssel + Verbindung prüfen, Ordner anlegen, Produkte zeigen
//   node tools/drive.mjs neu                       → Produktordner mit Dateien, die noch nicht lokal sind
//   node tools/drive.mjs liste <produkt>           → Dateien eines Produktordners
//   node tools/drive.mjs holen <produkt> [projekt] → 01-Rohmaterial/<produkt> → projekte/<projekt>/roh + manifest.json
//   node tools/drive.mjs abgeben <projekt> [produkt] → Finals → 02-Fertig/<produkt>
// Sicherheit: nur innerhalb von Snova-Videos · nur kopieren, nie löschen/synchronisieren · Schlüssel nie ausgeben.
// Schlüssel: Umgebungsvariable VATTO_DRIVE_TOKEN (Ausgabe von `rclone authorize "drive"`), siehe START-HIER.md Kapitel 7.
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { ROOT, readJSON, writeJSON, parseArgs, fail } from "./lib.mjs";

const BASIS = "vd:Snova-Videos";
const ROH = `${BASIS}/01-Rohmaterial`, FERTIG = `${BASIS}/02-Fertig`;
const { pos } = parseArgs(process.argv.slice(2));
const [befehl, a1, a2] = pos;

// Schlüssel lesen: rclone gibt je nach Version JSON oder einen Base64-Text aus (ggf. mit Feld "token"); Anführungszeichen tolerieren
const liesToken = (roh) => {
  const t = roh.replace(/\s+/g, "").replace(/^(['"])(.*)\1$/, "$2");
  const versuche = [() => JSON.parse(t), () => JSON.parse(Buffer.from(t, "base64").toString("utf8"))];
  for (const v of versuche) {
    try {
      let o = v();
      if (typeof o?.token === "string") o = JSON.parse(o.token);
      else if (o?.token?.refresh_token) o = o.token;
      if (o?.refresh_token) return JSON.stringify(o);
    } catch {}
  }
  return null;
};
if (!process.env.VATTO_DRIVE_TOKEN) fail("Drive-Schlüssel fehlt (Umgebungsvariable VATTO_DRIVE_TOKEN). Einrichtung: video-cutter/START-HIER.md, Kapitel 7.");
const token = liesToken(process.env.VATTO_DRIVE_TOKEN);
if (!token) fail("Drive-Schlüssel unvollständig kopiert. Im schwarzen Fenster ALLES zwischen ---> und <---End paste markieren, kopieren und VATTO_DRIVE_TOKEN ersetzen.");
if (spawnSync("rclone", ["version"], { stdio: "ignore" }).status !== 0) fail("rclone fehlt → bash tools/setup.sh");

// Remote nur über Umgebung (keine Konfigurationsdatei, Schlüssel nie in Argumenten/Logs)
const env = { ...process.env, RCLONE_CONFIG: "/dev/null", RCLONE_CONFIG_VD_TYPE: "drive", RCLONE_CONFIG_VD_SCOPE: "drive", RCLONE_CONFIG_VD_TOKEN: token };
const rc = (args, { zeigen = false, erlaubt = false } = {}) => {
  const r = spawnSync("rclone", args, { env, encoding: "utf8", stdio: zeigen ? ["ignore", "inherit", "inherit"] : "pipe", maxBuffer: 256 * 1024 * 1024 });
  if (r.status !== 0 && !erlaubt && /invalid_grant|couldn't fetch token/.test(r.stderr || ""))
    fail("Drive-Schlüssel abgelaufen oder widerrufen → am Laptop neu erzeugen (rclone authorize \"drive\") und VATTO_DRIVE_TOKEN ersetzen.");
  if (r.status !== 0 && !erlaubt) fail(`rclone ${args[0]} fehlgeschlagen${zeigen ? "" : `:\n${(r.stderr || "").replaceAll(token, "***").slice(-1500)}`}`);
  return r;
};
const json = (args) => JSON.parse(rc(args).stdout || "[]");
const slug = (s) => s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/ß/g, "ss").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const mb = (b) => `${(b / 1e6).toFixed(1)} MB`;
const VIDEO = /\.(mp4|mov|m4v|mts|lrf)$/i;
const lokalVorhanden = (projekt, datei, bytes) => {
  const p = path.join(ROOT, "projekte", projekt, "roh", datei);
  return fs.existsSync(p) && fs.statSync(p).size === bytes;
};
const produkte = () => json(["lsjson", "--dirs-only", ROH]).map((d) => d.Name).sort();
const dateien = (produkt) => json(["lsjson", "-R", "--files-only", "--no-mimetype", `${ROH}/${produkt}`]).filter((f) => VIDEO.test(f.Name) && !/\.lrf$/i.test(f.Name));

if (befehl === "test") {
  rc(["mkdir", ROH]); rc(["mkdir", FERTIG]);
  const p = produkte();
  console.log(`✓ Drive verbunden · Ordner Snova-Videos/01-Rohmaterial + 02-Fertig bereit · ${p.length} Produktordner${p.length ? `: ${p.join(", ")}` : ""}`);
} else if (befehl === "neu") {
  let leer = true;
  for (const p of produkte()) {
    const f = dateien(p), fehlt = f.filter((x) => !lokalVorhanden(slug(p), x.Path, x.Size));
    if (!fehlt.length) continue;
    leer = false;
    console.log(`• ${p} → projekt „${slug(p)}“: ${fehlt.length} neue von ${f.length} Videos (${mb(fehlt.reduce((s, x) => s + x.Size, 0))})`);
  }
  if (leer) console.log("Keine neuen Videos im Drive.");
} else if (befehl === "liste") {
  if (!a1) fail("Aufruf: node tools/drive.mjs liste <produkt>");
  for (const f of dateien(a1)) console.log(`${f.Path}\t${mb(f.Size)}\t${f.ModTime.slice(0, 16)}`);
} else if (befehl === "holen") {
  if (!a1) fail("Aufruf: node tools/drive.mjs holen <produkt> [projekt]");
  const projekt = a2 || slug(a1);
  const dir = path.join(ROOT, "projekte", projekt), roh = path.join(dir, "roh");
  fs.mkdirSync(roh, { recursive: true });
  const f = dateien(a1);
  if (!f.length) fail(`Keine Videos in Snova-Videos/01-Rohmaterial/${a1}`);
  console.log(`▶ ${f.length} Videos (${mb(f.reduce((s, x) => s + x.Size, 0))}) → projekte/${projekt}/roh/`);
  rc(["copy", `${ROH}/${a1}`, roh, "--transfers", "4", "--checkers", "8", "--drive-chunk-size", "64M", "--exclude", "*.{LRF,lrf}",
    "--stats", "20s", "--stats-one-line", "--stats-log-level", "NOTICE"], { zeigen: true });
  // Prüfung: Größe + MD5 (Drive liefert MD5) für jede Datei
  const chk = rc(["check", `${ROH}/${a1}`, roh, "--one-way", "--exclude", "*.{LRF,lrf}"], { erlaubt: true });
  if (chk.status !== 0) fail(`Prüfung nach dem Kopieren fehlgeschlagen:\n${chk.stderr.slice(-1500)}`);
  // manifest.json ergänzen (Format wie bibliothek.mjs; vorhandene Einträge/Anmerkungen bleiben)
  const mPfad = path.join(dir, "manifest.json");
  const m = fs.existsSync(mPfad) ? readJSON(mPfad) : { projekt, quelle: `Google Drive Snova-Videos/01-Rohmaterial/${a1} (Vatto), nur lesen`, clips: [] };
  const ids = new Set(m.clips.map((c) => c.id));
  let neu = 0;
  for (const x of f) {
    if (m.clips.some((c) => c.datei === x.Path)) continue;
    let id = slug(x.Path.replace(/\.[^.]+$/, "")).slice(0, 40) || "clip", n = 2;
    while (ids.has(id)) id = `${id.replace(/-\d+$/, "")}-${n++}`;
    ids.add(id);
    m.clips.push({ id, drive_id: x.ID, datei: x.Path, bytes: x.Size });
    neu++;
  }
  m.aktualisiert = new Date().toISOString();
  writeJSON(mPfad, m);
  console.log(`✓ ${f.length} Videos lokal und geprüft (Größe + MD5) · manifest.json: ${neu} neu, ${m.clips.length} gesamt\n  weiter: node tools/bibliothek.mjs ${projekt} sichten`);
} else if (befehl === "abgeben") {
  if (!a1) fail("Aufruf: node tools/drive.mjs abgeben <projekt> [produktordner]");
  const vdir = path.join(ROOT, "projekte", a1, "videos");
  const finals = fs.existsSync(vdir) ? fs.readdirSync(vdir).flatMap((v) => {
    const e = path.join(vdir, v, "exporte");
    return fs.existsSync(e) ? fs.readdirSync(e).filter((n) => /^final-.*\.mp4$/.test(n)).map((n) => path.join(e, n)) : [];
  }) : [];
  if (!finals.length) fail(`Keine Finals in projekte/${a1}/videos/*/exporte/`);
  const ziel = `${FERTIG}/${a2 || a1}`;
  // flach in den Zielordner (Namen eindeutig: final-<video>-vNNN[-tiktok].mp4); --ignore-existing = nie etwas im Drive überschreiben
  for (const f of finals) rc(["copyto", f, `${ziel}/${path.basename(f)}`, "--drive-chunk-size", "64M", "--ignore-existing"], { zeigen: true });
  console.log(`✓ ${finals.length} Finals in Snova-Videos/02-Fertig/${a2 || a1}/ (iPhone: Drive-App → Datei → ⋮ → Kopie senden → Video sichern)\n  ${finals.map((f) => `${path.basename(f)} ${mb(fs.statSync(f).size)}`).join("\n  ")}`);
} else {
  fail("Befehle: test · neu · liste <produkt> · holen <produkt> [projekt] · abgeben <projekt> [produkt]");
}
