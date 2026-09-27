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

## DIENSTE UND WIE SIE ANGEBUNDEN SIND

| Dienst | Zweck | Anbindung | Key | Status |
|---|---|---|---|---|
| **KIE.ai** | Bild-/Videorender (Grok, GPT Image 2 …) | REST-API `api.kie.ai` | API-Anmeldedatum, `Authorization: Bearer` | ⏳ Vatto trägt Key ein |
| **fal.ai** | MiniMax-H3-Creator-Clips | REST-API `queue.fal.run` | API-Anmeldedatum, `Authorization: Key` | ⏳ Vatto trägt Key ein |
| **Yapper** | Voiceover, Videos | **claude.ai-Konnektor** (MCP, Login statt Key) | keiner | ⏳ URL aus Vattos MCP-Datei |
| **Playwright** | echter Browser | `.mcp.json` | keiner | ✅ getestet |
| **prompts.chat** | Prompt-Bibliothek | Plugin | keiner | ✅ verbunden |
| Firecrawl | Webseiten lesen | claude.ai-Konnektor (optional) | Login | optional |
| Rube/Composio | 500+ Apps | claude.ai-Konnektor (optional) | Login | optional |
| ~~Perplexity~~ | – | entfernt | – | Vatto hat nur Pro, keine API. Websuche ist eingebaut. |

**Keys nie in den Chat, nie in Dateien, nie ins Repo.** Grund: Der Chat wird
gespeichert, das Repo liegt auf GitHub – wer den Key hat, rendert auf Vattos Kosten.
Der einzig richtige Ort ist **API-Anmeldedaten** der Umgebung: Der Proxy hängt den
Key an, Claude sieht ihn nie.

**Starter `.claude/helpers/mcp-launch.cjs`:** nur noch Playwright (Cloud: vorinstallierter Chromium).
**Auto-Setup `.claude/helpers/cloud-setup.cjs`:** SessionStart-Hook, installiert in der
Cloud ffmpeg + Python-Pakete im Hintergrund. Kein Setup-Skript in der Umgebung nötig.

**Fehler in der Original-Anleitung:** `npx -y @composio/rube-mcp` ist kein MCP-Server,
sondern ein Installations-Assistent (Code geprüft).

---

## WAS VATTO NOCH TUN MUSS (einmalig)

**Erledigt am 27.09.2026:** Netzwerkzugriff „Benutzerdefiniert" mit den Domains.

**1. Zwei Keys eintragen** – Umgebung „Vatto0-Matrix" bearbeiten → API-Anmeldedaten →
„Zugangsdaten hinzufügen", Typ Bearer, zweimal:

| Name | Erlaubte Websites | Header-Name | Präfix | Wert |
|---|---|---|---|---|
| KIE | `api.kie.ai` | `Authorization` | `Bearer` | KIE-Key |
| fal | `*.fal.run` | `Authorization` | `Key` | fal-Key |

**2. Yapper** – claude.ai → Einstellungen → Konnektoren → „Benutzerdefinierten
Konnektor hinzufügen" → Name `Yapper`, URL aus der MCP-Datei → Verbinden → einloggen.

**3. Neue Session starten.**

**Falls später nötig:** Liegen KIE-Ergebnisse auf einer anderen Domain als
`api.kie.ai`, beim ersten Render diese Domain zur Netzwerkliste hinzufügen.

---

## VIDEO-WERKZEUGE

| Werkzeug | Wo | Status |
|---|---|---|
| ffmpeg 6.1 + ffprobe | System | ✅ alle nötigen Filter vorhanden |
| Pillow, numpy, faster-whisper | Python | ✅ |
| Poppins Bold | `assets/fonts/` (OFL-Lizenz) | ✅ |
| Kamerafahrt | `tools/video-maschine/zp.sh` | ✅ getestet |
| Einrichtung neue Session | automatisch per `cloud-setup.cjs` → `setup.sh` | ✅ |
| faster-whisper-Modelle | laden von huggingface.co | ⛔ in Cloud gesperrt |

## LOKAL (Windows)

Netzwerksperre und API-Anmeldedaten gibt es nur in der Cloud. Lokal:
`KIE_API_KEY` und `FAL_KEY` als Windows-Systemvariablen setzen, ffmpeg
installieren, Video-Maschine am besten in WSL 2 (`bash tools/video-maschine/setup.sh`).
