# WERKZEUGE, PLUGINS UND KONNEKTOREN

**Stand:** 27.09.2026 · Alles projektweit eingetragen → gilt auf jedem Rechner mit diesem Repo.

---

## PLUGINS (`.claude/settings.json`)

| Plugin | Zweck | Status |
|---|---|---|
| `remotion@remotion` | Motion Design, Text-Animation, Schnitt in React | ✅ läuft, Render verifiziert |
| `prompts.chat@prompts.chat` | Community-Prompt-Bibliothek, Befehle `/prompts.chat:prompts` und `/prompts.chat:skills` | ✅ installiert · ⛔ in der Cloud Host `prompts.chat` gesperrt |

**Regel für prompts.chat:** Community-Inhalte von fremden Leuten. Prompts und vor allem
Skills **erst lesen, dann nutzen**. Der mitgelieferte Skill `skill-lookup` kann Skills
direkt in `.claude/skills/` installieren – nur nach Durchsicht und Vattos Okay.
Lyra- und Maschinen-Regeln gehen jedem Community-Prompt vor.

## MCP-SERVER (`.mcp.json`)

| Server | Zweck | Key | Test 27.09.2026 |
|---|---|---|---|
| `playwright` | echter Browser: klicken, tippen, Screenshots | keiner | ✅ Seite geöffnet, Titel gelesen |
| `perplexity` | aktuelle Recherche mit Quellen | `PERPLEXITY_API_KEY` | ✅ Server startet (4 Werkzeuge) · ⛔ API in Cloud gesperrt |
| `firecrawl` | Webseiten als Text, Crawls | `FIRECRAWL_API_KEY` | ✅ Server startet (29 Werkzeuge) · ⛔ API in Cloud gesperrt |
| `rube` | Composio: 500+ Apps über eine Verbindung | Login (OAuth) | ⛔ Host `rube.app` in Cloud gesperrt |
| `claude-flow` | Agenten-Framework (alt) | – | ⚠️ Verbindung läuft in Timeout, ungenutzt |

**Start über `.claude/helpers/mcp-launch.cjs`:**
- Playwright nutzt in der Cloud den vorinstallierten Chromium, lokal Chrome.
- Perplexity und Firecrawl starten **nur mit Key**. Ohne Key: klare Meldung, keine
  Werkzeuge im Kontext. Grund: Firecrawl lädt 29 Werkzeuge – ohne Key reiner Ballast.

**Fehler in der Original-Anleitung korrigiert:** `npx -y @composio/rube-mcp` ist
**kein** MCP-Server, sondern ein interaktiver Installations-Assistent (Code geprüft).
Richtig ist der HTTP-Konnektor `https://rube.app/mcp`.

**Kontext-Warnung (aus der Anleitung, stimmt):** Jeder aktive Server kostet Platz im
Arbeitsgedächtnis. Nicht gebrauchte Server deaktivieren statt löschen (`/mcp`).

## VIDEO-WERKZEUGE

| Werkzeug | Wo | Status |
|---|---|---|
| ffmpeg 6.1 + ffprobe | System | ✅ alle nötigen Filter vorhanden |
| Pillow, numpy, faster-whisper | Python | ✅ |
| Poppins Bold | `assets/fonts/` (OFL-Lizenz) | ✅ |
| Kamerafahrt | `tools/video-maschine/zp.sh` | ✅ getestet |
| Einrichtung neue Session | `tools/video-maschine/setup.sh` | ✅ |
| faster-whisper-Modelle | laden von huggingface.co | ⛔ in Cloud gesperrt |

## ⛔ IN DER CLOUD GESPERRTE HOSTS

Freischalten in den Environment-Einstellungen → Network access → erlaubte Domains:

| Host | Gebraucht für |
|---|---|
| `prompts.chat` | prompts.chat-Bibliothek |
| `rube.app` | Composio/Rube |
| `api.perplexity.ai` | Perplexity |
| `api.firecrawl.dev` | Firecrawl |
| `queue.fal.run` (+ `fal.run`, `fal.media`) | MiniMax-H3-Clips über fal.ai |
| `huggingface.co` | faster-whisper-Modelle (Transkription) |
| `remotion.media` | nicht nötig – Workaround aktiv |

## 🔑 KEYS (als Umgebungsvariablen, nie in Dateien oder Chat)

`PERPLEXITY_API_KEY` · `FIRECRAWL_API_KEY` · `FAL_KEY`
Cloud: Environment-Einstellungen → Umgebungsvariablen. Lokal: Systemvariablen.
