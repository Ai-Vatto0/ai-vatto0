// EIN BEFEHL für ein Spec-Video (spart Zeit und Tokens): Timing → Zwischenclips → Komposition → Render + QA.
// node tools/produziere.mjs <projekt> <video>                         → Vorschau
// node tools/produziere.mjs <projekt> <video> --final --freigabe "…" [--drive <Ordner in 02-Fertig>]  → Final (nur nach Vattos Freigabe)
// Voraussetzung: pruefe-spec grün, vo/woerter.json vorhanden (vo-ausrichten.mjs). Bricht beim ersten Fehler ab.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { ROOT, parseArgs, fail } from "./lib.mjs";

const { pos, opt } = parseArgs(process.argv.slice(2));
const [projekt, video] = pos;
if (!projekt || !video) fail("Aufruf: node tools/produziere.mjs <projekt> <video> [--final --freigabe \"…\"]");
const extra = opt.final ? ["--final", "--freigabe", String(opt.freigabe || "")] : [];
const schritte = [
  ["pruefe-spec.mjs", [projekt]],
  ["timing.mjs", [projekt, video]],
  ["zwischenclip.mjs", [projekt, video]],
  ["baue-spec.mjs", [projekt, video]],
  ["render-spec.mjs", [projekt, video, ...extra]],
];
for (const [tool, args] of schritte) {
  console.log(`\n▶ ${tool} ${args.join(" ")}`);
  try {
    execFileSync("node", [path.join(ROOT, "tools", tool), ...args], { cwd: ROOT, stdio: "inherit" });
  } catch {
    fail(`${tool} fehlgeschlagen – Kette gestoppt`);
  }
}
// Final > 30 MB → zusätzlich kleinere Kopie zum Teilen/Posten (H.264 9 Mbit/s, Ton unverändert)
if (opt.final) {
  const ex = path.join(ROOT, "projekte", projekt, "videos", video, "exporte");
  const f = fs.readdirSync(ex).filter((n) => /^final-.*-v\d+\.mp4$/.test(n)).sort().pop();
  if (f && fs.statSync(path.join(ex, f)).size > 30e6) {
    const ziel = path.join(ex, f.replace(/\.mp4$/, "-tiktok.mp4"));
    execFileSync("ffmpeg", ["-v", "error", "-y", "-i", path.join(ex, f), "-c:v", "libx264", "-preset", "slow", "-b:v", "9M", "-maxrate", "11M",
      "-bufsize", "18M", "-pix_fmt", "yuv420p", "-c:a", "copy", "-movflags", "+faststart", ziel], { stdio: "inherit" });
    console.log(`✓ ${path.basename(ziel)} ${(fs.statSync(ziel).size / 1e6).toFixed(1)} MB`);
  }
}
// Final fertig → automatisch in Vattos Drive-Ordner 02-Fertig/<projekt> (nur wenn der Schlüssel eingerichtet ist)
if (opt.final && process.env.VATTO_DRIVE_TOKEN) {
  console.log("\n▶ drive.mjs abgeben");
  try { execFileSync("node", [path.join(ROOT, "tools", "drive.mjs"), "abgeben", projekt, ...(opt.drive ? [String(opt.drive)] : [])], { cwd: ROOT, stdio: "inherit" }); }
  catch { console.log("⚠ Hochladen ins Drive fehlgeschlagen – Final liegt lokal, später: node tools/drive.mjs abgeben " + projekt); }
}
