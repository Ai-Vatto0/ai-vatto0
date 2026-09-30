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
const root = process.env.CLAUDE_PROJECT_DIR || path.resolve(__dirname, "../..");
const home = require("os").homedir();
const maschineReady =
  has("ffmpeg", ["-version"]) &&
  has("python3", ["-c", "import PIL, numpy, faster_whisper"]);
// Video-Cutting-Agent (video-cutter/): npm-Pakete, whisper.cpp, Modell, Render-Chrome
const cutterReady =
  fs.existsSync(path.join(root, "video-cutter/node_modules/hyperframes")) &&
  fs.existsSync(path.join(home, ".cache/hyperframes/whisper/whisper.cpp/build/bin/whisper-cli")) &&
  fs.existsSync(path.join(home, ".cache/hyperframes/whisper/models/ggml-small.bin")) &&
  fs.existsSync(path.join(home, ".claude/skills/general-video"));
if (maschineReady && cutterReady) process.exit(0);

const log = fs.openSync("/tmp/video-maschine-setup.log", "a");
// Nacheinander: erst ffmpeg & Co., dann der Video-Cutting-Agent (braucht ffmpeg).
const cmd = `bash "${path.join(root, "tools/video-maschine/setup.sh")}"; bash "${path.join(root, "video-cutter/tools/setup.sh")}" > /tmp/video-cutter-setup.log 2>&1`;
const child = spawn("bash", ["-c", cmd], {
  detached: true,
  stdio: ["ignore", log, log],
});
child.unref();
console.log("[cloud-setup] Video-Maschine wird im Hintergrund eingerichtet (Log: /tmp/video-maschine-setup.log)");
