#!/usr/bin/env node
/**
 * Plattformneutraler Starter fuer die MCP-Server aus .mcp.json.
 *
 * - playwright: nutzt in Cloud-Sessions den vorinstallierten Chromium, lokal
 *   den normalen Chrome.
 * Firecrawl, Rube und Yapper laufen als claude.ai-Konnektoren, nicht ueber diese Datei.
 * Perplexity entfernt (27.09.2026): Vatto hat Perplexity Pro, aber keinen API-Zugang.
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
};

const name = process.argv[2];
const server = SERVERS[name];
if (!server) {
  console.error(`[mcp-launch] Unbekannter Server "${name}". Erlaubt: ${Object.keys(SERVERS).join(", ")}`);
  process.exit(2);
}

const env = { ...process.env };

// Cloud: Agent-Proxy haengt den echten Key an, die Session bekommt ihn nie zu sehen.
const agentProxy = /^(1|true)$/i.test(env.CCR_AGENT_PROXY_ENABLED || "");
if (server.key && !env[server.key] && agentProxy) {
  env[server.key] = "via-agent-proxy";
}

if (server.key && !env[server.key]) {
  console.error(
    `[mcp-launch] ${name}: Umgebungsvariable ${server.key} fehlt. ` +
      `Server wird nicht gestartet. Key als Umgebungsvariable setzen ` +
      `(lokal als Systemvariable; in der Cloud als API-Anmeldedatum der Umgebung).`,
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
