/**
 * Note: When using the Node.JS APIs, the config file
 * doesn't apply. Instead, pass options directly to the APIs.
 *
 * All configuration options: https://remotion.dev/docs/config
 */

import fs from "fs";
import { Config } from "@remotion/cli/config";
import { enableTailwind } from "@remotion/tailwind-v4";

Config.setRspack(true);
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.overrideBundlerConfig(enableTailwind);

// Remotion lädt seinen Browser sonst von remotion.media – in Cloud-Sessions ist
// dieser Host gesperrt. Vorinstallierten Chromium nutzen, falls vorhanden.
// Lokal (Windows/Mac) greift das nicht, dann lädt Remotion seinen eigenen Browser.
const browserCandidates = [
  process.env.REMOTION_BROWSER_EXECUTABLE,
  "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell",
];
const browser = browserCandidates.find((p) => p && fs.existsSync(p));
if (browser) {
  Config.setBrowserExecutable(browser);
}
