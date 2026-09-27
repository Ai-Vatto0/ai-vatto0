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

## MCP-SERVER UND KONNEKTOREN

| Was | Wo eingerichtet | Key | Status |
|---|---|---|---|
| `playwright` – echter Browser | `.mcp.json` | keiner | ✅ getestet |
| `perplexity` – Recherche mit Quellen | `.mcp.json` | API-Anmeldedatum (Cloud) / `PERPLEXITY_API_KEY` (lokal) | ✅ Server startet · wartet auf Key |
| **Firecrawl** – Webseiten lesen | **claude.ai-Konnektor** (offiziell, Login) | keiner, Login | ⏳ von Vatto zu verbinden |
| **Rube / Composio** – 500+ Apps | **claude.ai-Konnektor** (eigene URL) | Login | ⏳ von Vatto zu verbinden |
| `claude-flow` – Agenten-Framework (alt) | `.mcp.json` | – | ⚠️ Timeout, ungenutzt |

**Warum Firecrawl und Rube als claude.ai-Konnektor statt lokal:** Konnektoren laufen
über Anthropics Server → funktionieren in Desktop-App, Handy, Cloud und Claude Code,
brauchen **keine** Netzwerkfreigabe und **keinen** Key in einer Datei. Rube braucht
außerdem einen Browser-Login, der in einer Cloud-Session lokal nicht klappt.

**Starter `.claude/helpers/mcp-launch.cjs`:** Playwright nutzt in der Cloud den
vorinstallierten Chromium. Perplexity startet lokal nur mit Key; in der Cloud mit
Platzhalter, weil dort der Agent-Proxy den echten Key anhängt (Session sieht ihn nie).
⚠️ Noch nicht mit echtem Key geprüft, ob der Proxy den Platzhalter-Header ersetzt.

**Fehler in der Original-Anleitung:** `npx -y @composio/rube-mcp` ist **kein**
MCP-Server, sondern ein interaktiver Installations-Assistent (Code geprüft).

**Kontext-Warnung:** Jeder aktive Server kostet Arbeitsgedächtnis. Firecrawl hat
29 Werkzeuge. Nicht Gebrauchtes deaktivieren statt löschen.

---

## EINRICHTUNG DER CLOUD-UMGEBUNG „Vatto0-Matrix"

Titelleiste → Cloud-Symbol → Umgebung bearbeiten. **Das kann nur Vatto, Claude hat
darauf keinen Zugriff.**

### 1. Netzwerkzugriff → **Benutzerdefiniert**
Häkchen bei „Standardliste gängiger Paketmanager einschließen" setzen.
Erlaubte Domains, **eine pro Zeile**:
```
prompts.chat
huggingface.co
*.huggingface.co
*.hf.co
*.fal.media
```
(Perplexity und fal.ai-API brauchen hier keinen Eintrag – ihre Hosts werden über
die API-Anmeldedaten automatisch erreichbar.)

### 2. Umgebungsvariablen → **leer lassen**
Dieses Feld ist für alle sichtbar, die die Umgebung nutzen → **keine Keys**.

### 3. API-Anmeldedaten → „Zugangsdaten hinzufügen", Typ **Bearer**

| Name | Erlaubte Websites | Header-Name | Präfix | Wert |
|---|---|---|---|---|
| Perplexity | `api.perplexity.ai` | `Authorization` | `Bearer` | Perplexity-Key |
| fal.ai | `fal.run` und `*.fal.run` | `Authorization` | `Key` | fal-Key |

Der Key erreicht nie die Session, nie Claude, nie eine Datei.

### 4. Setup-Skript
```bash
#!/bin/bash
apt-get update -qq && apt-get install -y -qq ffmpeg || true
pip install --quiet Pillow numpy faster-whisper || true
exit 0
```
Läuft einmal, danach wird der Stand zwischengespeichert (ca. 7 Tage).

### 5. claude.ai → Anpassen → Konnektoren
- **Firecrawl**: im Verzeichnis suchen → Verbinden
- **Rube**: „Benutzerdefinierten Konnektor hinzufügen" → URL `https://rube.app/mcp` → Apps freigeben

### 6. Neue Session starten
Laufende Sessions lesen geänderte Einstellungen nicht neu ein.

---

## VIDEO-WERKZEUGE

| Werkzeug | Wo | Status |
|---|---|---|
| ffmpeg 6.1 + ffprobe | System | ✅ alle nötigen Filter vorhanden |
| Pillow, numpy, faster-whisper | Python | ✅ |
| Poppins Bold | `assets/fonts/` (OFL-Lizenz) | ✅ |
| Kamerafahrt | `tools/video-maschine/zp.sh` | ✅ getestet |
| Einrichtung neue Session | `tools/video-maschine/setup.sh` | ✅ |
| faster-whisper-Modelle | laden von huggingface.co | ⛔ in Cloud gesperrt |

## LOKAL (Windows)

Netzwerksperre und API-Anmeldedaten gibt es nur in der Cloud. Lokal:
`PERPLEXITY_API_KEY` und `FAL_KEY` als Windows-Systemvariablen setzen, ffmpeg
installieren, Video-Maschine am besten in WSL 2 (`bash tools/video-maschine/setup.sh`).
