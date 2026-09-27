#!/usr/bin/env node
/**
 * SessionStart-Hook: richtet in Cloud-Sessions die Video-Maschine automatisch ein
 * (ffmpeg, Pillow, numpy, faster-whisper), damit Vatto kein Setup-Skript pflegen muss.
 *
 * - Lokal (Windows/Mac) tut der Hook nichts.
 * - Ist alles schon da, endet er sofort.
 * - Sonst startet er tools/video-maschine/setup.sh im Hintergrund, damit der
 *   Session-Start nicht blockiert. Protokoll: /tmp/video-maschine-setup.log
 */
const { spawn, spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

if (process.env.CLAUDE_CODE_REMOTE !== "true") process.exit(0);

const has = (cmd, args) => spawnSync(cmd, args, { stdio: "ignore" }).status === 0;
const ready =
  has("ffmpeg", ["-version"]) &&
  has("python3", ["-c", "import PIL, numpy, faster_whisper"]);
if (ready) process.exit(0);

const root = process.env.CLAUDE_PROJECT_DIR || path.resolve(__dirname, "../..");
const log = fs.openSync("/tmp/video-maschine-setup.log", "a");
const child = spawn("bash", [path.join(root, "tools/video-maschine/setup.sh")], {
  detached: true,
  stdio: ["ignore", log, log],
});
child.unref();
console.log("[cloud-setup] Video-Maschine wird im Hintergrund eingerichtet (Log: /tmp/video-maschine-setup.log)");
