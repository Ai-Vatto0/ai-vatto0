#!/usr/bin/env node
/**
 * Plattformneutraler Starter fuer die MCP-Server aus .mcp.json.
 *
 * - playwright: nutzt in Cloud-Sessions den vorinstallierten Chromium, lokal
 *   den normalen Chrome.
 * - perplexity / firecrawl: starten nur, wenn der API-Key als Umgebungsvariable
 *   gesetzt ist. Ohne Key beendet sich der Starter mit einer klaren Meldung,
 *   statt einen Server zu starten, dessen Werkzeuge Kontext kosten, aber
 *   jeden Aufruf mit einem Auth-Fehler beantworten.
 *
 * Keys stehen NIE in dieser Datei oder in .mcp.json.
 */
const { spawn } = require("child_process");
const fs = require("fs");

const SERVERS = {
  playwright: {
    pkg: "@playwright/mcp@latest",
    args: ["--headless", "--isolated"],
  },
  perplexity: {
    pkg: "@perplexity-ai/mcp-server",
    key: "PERPLEXITY_API_KEY",
  },
  firecrawl: {
    pkg: "firecrawl-mcp",
    key: "FIRECRAWL_API_KEY",
  },
};

const name = process.argv[2];
const server = SERVERS[name];
if (!server) {
  console.error(`[mcp-launch] Unbekannter Server "${name}". Erlaubt: ${Object.keys(SERVERS).join(", ")}`);
  process.exit(2);
}

const env = { ...process.env };

if (server.key && !env[server.key]) {
  console.error(
    `[mcp-launch] ${name}: Umgebungsvariable ${server.key} fehlt. ` +
      `Server wird nicht gestartet. Key als Umgebungsvariable setzen ` +
      `(lokal im System, in der Cloud in den Environment-Einstellungen).`,
  );
  process.exit(1);
}

if (name === "playwright" && !env.PLAYWRIGHT_MCP_EXECUTABLE_PATH) {
  const cloudChromium = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
  if (fs.existsSync(cloudChromium)) {
    env.PLAYWRIGHT_MCP_BROWSER = "chromium";
    env.PLAYWRIGHT_MCP_EXECUTABLE_PATH = cloudChromium;
  }
}

const npx = process.platform === "win32" ? "npx.cmd" : "npx";
const child = spawn(npx, ["-y", server.pkg, ...(server.args || [])], {
  env,
  stdio: "inherit",
  shell: process.platform === "win32",
});
child.on("exit", (code) => process.exit(code ?? 0));
child.on("error", (err) => {
  console.error(`[mcp-launch] ${name}: Start fehlgeschlagen: ${err.message}`);
  process.exit(1);
});
