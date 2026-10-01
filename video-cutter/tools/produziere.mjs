// EIN BEFEHL für ein Spec-Video (spart Zeit und Tokens): Timing → Zwischenclips → Komposition → Render + QA.
// node tools/produziere.mjs <projekt> <video>                         → Vorschau
// node tools/produziere.mjs <projekt> <video> --final --freigabe "…"  → Final (nur nach Vattos Freigabe)
// Voraussetzung: pruefe-spec grün, vo/woerter.json vorhanden (vo-ausrichten.mjs). Bricht beim ersten Fehler ab.
import { execFileSync } from "node:child_process";
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
