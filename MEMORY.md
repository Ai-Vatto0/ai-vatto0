# MEMORY – Laufendes Arbeitsprotokoll

> Einstieg: `MASTER-MEMORY.md`. Diese Datei = was passiert ist und was ansteht.
> Neueste Einträge oben.

---

## AKTUELLER ARBEITSSTAND

**Datum:** 2026-09-27
**Aktiver Fokus:** Setup abgeschlossen (Gedächtnis + Remotion). Als Nächstes:
erster echter Schnitt mit Vattos Material, danach KI-Anbieter anbinden.

### Offene Punkte
- [ ] TikTok-Compliance-Zusammenfassung von Vatto einlesen → `memory/regeln/tiktok-compliance.md`
- [ ] `02_LYRA_ADS_MASTER_V4.1.txt`, `03_COMPLIANCE_V4.0`, `04_LEARNING_V4.0` nachladen
- [ ] Erster Remotion-Schnitt mit echtem Clip (Faruks Ablauf: Schnittplan → Freigabe → Vorschau → Frame-QA)
- [ ] KI-Anbieter für Bild- und Videogenerierung anbinden (fal.ai-Weg aus Faruks Maschine steht)
- [ ] Hosts in der Cloud freischalten, Keys als Umgebungsvariablen setzen
- [ ] Erstes Produkt nach Faruks Format A (UGC-Overlay) bauen
- [ ] Optional: Gedächtnis vom alten PC übernehmen (`C:\Users\rober\ki-app\`)

---

## SESSION-LOG

### 2026-09-27 – Faruks Video-Maschine, Konnektoren, prompts.chat

**Integriert:**
- Faruks „TikTok-Shop-Video-Maschine" wortgetreu als Regelwerk + eigener Skill
  `tiktok-video-maschine` + Werkzeuge (`zp.sh` getestet, `setup.sh`)
- ffmpeg 6.1, Pillow, numpy, faster-whisper installiert; Poppins Bold ins Repo
- MCP: Playwright (voll getestet), Perplexity, Firecrawl (starten, brauchen Key), Rube
- Plugin prompts.chat projektweit installiert

**Entscheidungen:**
- Zuständigkeit Faruk vs. Lyra festgelegt statt mitteln: Formate/Schnitt → Faruk,
  KI-Produkt-Render → Lyra, Compliance → strengere Regel
- **Produkt nie in der KI-Szene** als Standard (Faruk) – Hypothese: senkt
  Product-Match-Verstöße. Noch unbelegt, Verstoß-Log klärt es.
- Safe Zone unten 420 → 400 px (Faruks Praxiswert)
- Perplexity/Firecrawl starten nur mit Key (Kontext sparen)

**Korrigiert:** `@composio/rube-mcp` aus der Anleitung ist kein MCP-Server,
sondern ein Installer → HTTP-Konnektor `https://rube.app/mcp` eingetragen.

**Blockiert:** Cloud-Netzwerk sperrt prompts.chat, rube.app, Perplexity, Firecrawl,
fal.ai, huggingface.co. Keys fehlen.

### 2026-09-27 – Remotion installiert (Faruks Vorgabe)

**Vorgabe von Faruk:** Remotion für Motion Design, claude-shorts für das Zerlegen
langer Videos. Start mit dem offiziellen Remotion-Plugin.

**Gemacht:**
- Offizielles Plugin `remotion@remotion` (v4.0.529, MIT) **projektweit** installiert –
  steht in `.claude/settings.json`, reist also mit dem Repo
- Remotion-Projekt `video-edit/` angelegt, 9:16-Testvideo gerendert und per
  Standbild geprüft (1080×1920, 30 fps)
- Fehler im eigenen Test gefunden und behoben: `AbsoluteFill` überschreibt Ränder mit
  `width/height: 100%` → Safe-Zone-Rahmen saß falsch. Merken für alle Overlays.
- Cloud-Blocker gelöst: `remotion.media` gesperrt → `remotion.config.ts` nutzt
  automatisch den vorinstallierten Chromium
- Faruks Ablauf als verbindliche Regel: `memory/regeln/video-schnitt-workflow.md`

**Bewusst nicht gemacht:** claude-shorts – installiert PyTorch (GB-schwer), landet
außerhalb des Repos, und ist für langes Material gedacht, nicht für 13-s-Clips.

### 2026-09-27 – Gedächtnis von Null aufgebaut

**Ausgangslage:** Claude-Setup auf dem alten PC (claude-flow + Memory-MCP) war zwar
im Repo konfiguriert, aber komplett funktionslos:

1. Alles auf Windows verdrahtet (`cmd /c`, `%CLAUDE_PROJECT_DIR%`) → in Linux-/Cloud-
   Sessions scheitert der claude-flow MCP-Server mit `ENOENT: cmd`, alle Hooks laufen
   still ins Leere.
2. Die eigentlichen Gedächtnisdateien (`MEMORY.md`, `MASTER-MEMORY.md`, `memory/`)
   zeigten auf absolute Pfade unter `C:\Users\rober\ki-app\` und waren **nie
   committet** → Inhalt existierte nur auf dem alten, nicht mehr genutzten Rechner.

**Entscheidung:** Gedächtnis als normale Markdown-Dateien **im Repo**, nicht über
einen MCP-Server. Begründung: reist auf jeden Rechner und in jede Cloud-Session mit,
kein Setup, keine Windows-Abhängigkeit, keine laufenden Kosten. Der claude-flow-
Apparat (15 Agenten, HNSW, Neural, Daemon) bleibt ungenutzt – für diesen Zweck
überdimensioniert.

**Gemacht:**
- `MASTER-MEMORY.md` + `MEMORY.md` + `memory/`-Struktur angelegt
- Lyra Ads V4.1 als aktives Regelwerk aufgenommen, V4.0-Master + V1.1-Engine als Archiv
- Projektnotizen: TikTok Shop, Prompt-Master, Higgsfield
- MCP- und Hook-Konfiguration plattformneutral gemacht, Windows-Variante als Vorlage
- Verweis in `CLAUDE.md` eingetragen

**Projekt-Scope auf Wunsch reduziert:** Snova Studio, menu-wall-app und sora-warrior
sind bewusst **nicht** im Gedächtnis. Ordner bleiben im Repo unangetastet.

**Von Vatto festgehalten:** TikTok-Richtlinien lassen KI-Werbung derzeit kaum zu,
Verstöße bereits bei minimalster Abweichung.

---

## BELEGTE ERKENNTNISSE (Lernupdate-Bereich)

*Noch leer – die Historie vom alten PC fehlt.*

Aufnahme nur bei echtem Beleg: reale Zahlen, wiederholbares Muster oder klare
Nutzerbeobachtung. Kein Einzelausreißer, keine Vermutung.

| Datum | Erkenntnis | Beleg | Typ |
|---|---|---|---|
| – | – | – | – |
