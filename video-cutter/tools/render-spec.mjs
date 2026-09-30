// VORSCHAU/FINAL + QA für Skript-Videos. Exporte werden nie überschrieben (vNNN).
// node tools/render-spec.mjs <projekt> <video> [--final --freigabe "…"] [--ohne-transkript]
// QA: Datei (1080x1920, 30 fps, Dauer, 1 Video-/1 Tonspur) · Lautheit/True Peak · Voiceover = Skript (Neu-Transkription)
//     · Safe Zone per transparentem Grafik-Render (Alpha außerhalb 150/140/400/60) · Kontaktbogen je Übergang
import fs from "node:fs";
import path from "node:path";
import { ROOT, readJSON, writeJSON, parseArgs, fail, run, hf, ffprobe, nextVersion, r3, fraction } from "./lib.mjs";

const { pos, opt } = parseArgs(process.argv.slice(2));
const [projekt, video] = pos;
const vdir = path.join(ROOT, "projekte", projekt || "", "videos", video || "");
const komp = path.join(vdir, "komposition");
if (!fs.existsSync(path.join(komp, "index.html"))) fail("Aufruf: node tools/render-spec.mjs <projekt> <video> (vorher baue-spec.mjs)");
const final = Boolean(opt.final);
if (final && (typeof opt.freigabe !== "string" || opt.freigabe.length < 10)) fail('Final nur mit --freigabe "wer, welche Vorschau, wann"');
const spec = readJSON(path.join(vdir, "spec.json"));
const meta = readJSON(path.join(komp, "meta.json"));
const exp = path.join(vdir, "exporte");

// --qa <export.mp4>: nur die QA für einen vorhandenen Export wiederholen (kein neuer Render)
let ziel, renderzeit = null;
if (typeof opt.qa === "string") {
  ziel = path.resolve(opt.qa);
  if (!fs.existsSync(ziel)) fail(`Export nicht gefunden: ${ziel}`);
  const alt = ziel.replace(/\.mp4$/, ".json");
  if (fs.existsSync(alt)) renderzeit = readJSON(alt).renderzeit_s ?? null;
} else {
  const c = hf(["check"], { cwd: komp, allowFail: true });
  if (c.status !== 0) fail(`check nicht bestanden:\n${(c.stdout + c.stderr).slice(-2500)}`);
  console.log("✓ hyperframes check bestanden");
  ziel = nextVersion(exp, `${final ? "final" : "vorschau"}-${video}`, "mp4");
  const t0 = Date.now();
  const r = hf(["render", "-o", ziel, "--fps", "30", "-q", final ? "high" : "draft", "--strict", "--quiet"], { cwd: komp, allowFail: true });
  if (r.status !== 0 || !fs.existsSync(ziel)) fail(`Render fehlgeschlagen:\n${(r.stdout + r.stderr).slice(-2500)}`);
  renderzeit = Math.round((Date.now() - t0) / 1000);
  console.log(`✓ ${path.relative(vdir, ziel)} in ${renderzeit} s`);
  writeJSON(ziel.replace(/\.mp4$/, ".json"), { export: path.basename(ziel), art: final ? "final" : "vorschau", freigabe: final ? opt.freigabe : null, renderzeit_s: renderzeit });
}

const checks = [];
const add = (p, st, d) => checks.push({ pruefung: p, status: st, detail: d });
const m = ffprobe(ziel);
const streams = JSON.parse(run("ffprobe", ["-v", "error", "-print_format", "json", "-show_streams", ziel]).stdout).streams;
const nV = streams.filter((s) => s.codec_type === "video").length, nA = streams.filter((s) => s.codec_type === "audio").length;
add("Spuren", nV === 1 && nA === 1 ? "OK" : "FEHLER", `${nV} Video, ${nA} Ton`);
add("Auflösung", m.video.breite_angezeigt === 1080 && m.video.hoehe_angezeigt === 1920 ? "OK" : "FEHLER", `${m.video.breite_angezeigt}x${m.video.hoehe_angezeigt}`);
add("Bildrate", Math.abs(fraction(streams.find((s) => s.codec_type === "video").r_frame_rate) - 30) < 0.01 ? "OK" : "WARNUNG", streams.find((s) => s.codec_type === "video").r_frame_rate);
add("Dauer", Math.abs(m.dauer_s - meta.dauer_s) < 0.1 ? "OK" : "FEHLER", `${r3(m.dauer_s)} s (Plan ${meta.dauer_s} s)`);
const lr = run("ffmpeg", ["-hide_banner", "-nostats", "-i", ziel, "-af", "ebur128=peak=true", "-f", "null", "-"]).stderr;
const I = Number(lr.match(/I:\s+(-?[\d.]+) LUFS/g)?.pop()?.match(/-?[\d.]+/)[0]);
const TP = Number(lr.match(/Peak:\s+(-?[\d.]+) dBFS/g)?.pop()?.match(/-?[\d.]+/)[0]);
add("Lautheit", Math.abs(I + 14) <= 2 ? "OK" : "WARNUNG", `${I} LUFS (Ziel -14 ±2)`);
add("True Peak", TP <= -1 ? "OK" : "WARNUNG", `${TP} dBTP`);

// Voiceover = Skript
const qa = path.join(vdir, "qa", path.basename(ziel, ".mp4"));
fs.mkdirSync(qa, { recursive: true });
if (!opt["ohne-transkript"]) {
  const t = hf(["transcribe", ziel, "--engine", "whisper", "--model", "small", "--language", "de", "--dir", qa, "--json"], { allowFail: true });
  if (t.status !== 0 || !fs.existsSync(path.join(qa, "transcript.json"))) add("Voiceover = Skript", "OFFEN", "Neu-Transkription nicht möglich");
  else {
    const norm = (s) => s.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
    const soll = spec.voiceover.map((x) => x.satz).join(" ").split(/\s+/).map(norm).filter(Boolean);
    const ist = readJSON(path.join(qa, "transcript.json")).map((w) => norm(w.text)).filter(Boolean);
    const setIst = new Set(ist);
    const fehlt = soll.filter((w) => !setIst.has(w) && !/^\d/.test(w));
    add("Voiceover = Skript", fehlt.length <= 2 ? "OK" : "WARNUNG", fehlt.length ? `nicht wiedergefunden: ${fehlt.join(", ")}` : `${soll.length} Wörter wiedergefunden`);
  }
}

// Safe Zone: Grafik-Ebene transparent rendern, Alpha außerhalb der Zone zählen (10 Bilder/s)
const ov = path.join(qa, "grafik.webm");
const ro = hf(["render", "--format", "webm", "-o", ov, "--fps", "30", "-q", "draft", "--quiet"], { cwd: path.join(vdir, "komposition-grafik"), allowFail: true });
if (ro.status !== 0 || !fs.existsSync(ov)) add("Safe Zone", "OFFEN", `Grafik-Render fehlgeschlagen: ${(ro.stderr || "").slice(-300)}`);
else {
  const SW = 540, SH = 960, F = 2;
  const raw = run("ffmpeg", ["-v", "error", "-c:v", "libvpx-vp9", "-i", ov, "-vf", `fps=10,scale=${SW}:${SH},format=yuva420p,alphaextract,format=gray`, "-f", "rawvideo", "-"], { binary: true }).stdout;
  const fs_ = SW * SH, zone = { l: 60 / F, r: (1080 - 140) / F, o: 150 / F, u: (1920 - 400) / F };
  const verst = [];
  let maxA = 0;
  for (let f = 0; f * fs_ < raw.length; f++) {
    let n = 0, box = [SW, SH, 0, 0];
    for (let y = 0; y < SH; y++) for (let x = 0; x < SW; x++) {
      const a = raw[f * fs_ + y * SW + x];
      if (a > maxA) maxA = a;
      if (a < 64 || (x >= zone.l && x <= zone.r && y >= zone.o && y <= zone.u)) continue;
      n++; box = [Math.min(box[0], x), Math.min(box[1], y), Math.max(box[2], x), Math.max(box[3], y)];
    }
    if (n > 3) verst.push(`${r3(f / 10)} s: x ${box[0] * F}–${box[2] * F}, y ${box[1] * F}–${box[3] * F}`);
  }
  if (maxA < 64) add("Safe Zone", "OFFEN", "Grafik-Render enthält keine sichtbaren Pixel – Alpha-Kanal prüfen");
  else add("Safe Zone", verst.length ? "FEHLER" : "OK", verst.length ? verst.slice(0, 6).join("; ") + (verst.length > 6 ? ` … (${verst.length} Bilder)` : "") : `${Math.floor(raw.length / fs_)} Bilder geprüft, nichts außerhalb`);
}

// Kontaktbogen: je Übergang letztes Bild davor | Mitte des Übergangs | erstes Bild danach, plus Szenenmitten
const zeiten = [];
meta.szenen.slice(1).forEach((s) => zeiten.push(r3(s.start - 0.1), r3(s.start + 0.05), r3(s.start + 0.2)));
const tmp = fs.mkdtempSync(path.join(qa, ".f-"));
zeiten.forEach((t, i) => run("ffmpeg", ["-v", "error", "-y", "-ss", String(Math.max(0, t)), "-i", ziel, "-frames:v", "1", "-vf", `scale=240:-2,drawtext=text='${t.toFixed(2)}s':x=6:y=6:fontsize=20:fontcolor=white:box=1:boxcolor=black@0.6`, path.join(tmp, `f${String(i).padStart(3, "0")}.png`)]));
run("ffmpeg", ["-v", "error", "-y", "-i", path.join(tmp, "f%03d.png"), "-vf", `tile=6x${Math.ceil(zeiten.length / 6)}:padding=4:color=0x222222`, "-frames:v", "1", path.join(qa, "kontakt-uebergaenge.jpg")]);
fs.rmSync(tmp, { recursive: true, force: true });

const st = checks.some((x) => x.status === "FEHLER") ? "FEHLER" : checks.some((x) => x.status !== "OK") ? "WARNUNG" : "OK";
const md = [`# QA ${path.basename(ziel)}`, "", `**${st}** · Renderzeit ${renderzeit} s · ${(m.bytes / 1e6).toFixed(1)} MB`, "", "| Prüfung | Status | Messwert |", "|---|---|---|",
  ...checks.map((x) => `| ${x.pruefung} | ${x.status} | ${x.detail} |`), "", "Kontaktbogen Übergänge: `kontakt-uebergaenge.jpg`", "",
  "## Offen – braucht menschliche Sichtung", "- [ ] Klang: Voiceover natürlich? Sinus-Schnitte zu laut/leise?", "- [ ] Produktfarben nach HDR→SDR (farbcheck-*.jpg in zwischen/)", "- [ ] Wirkung der Zeitlupe / Speed-Ramps", "- [ ] Personen/Kennzeichen im Bild ok?", ""].join("\n");
fs.writeFileSync(path.join(qa, "bericht.md"), md);
writeJSON(ziel.replace(/\.mp4$/, ".json"), { ...(fs.existsSync(ziel.replace(/\.mp4$/, ".json")) ? readJSON(ziel.replace(/\.mp4$/, ".json")) : {}), export: path.basename(ziel), renderzeit_s: renderzeit, status: st, checks });
console.log(md);
if (st === "FEHLER") process.exitCode = 2;
