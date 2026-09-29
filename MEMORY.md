# MEMORY – Laufendes Arbeitsprotokoll

> Einstieg: `MASTER-MEMORY.md`. Diese Datei = was passiert ist und was ansteht.
> Neueste Einträge oben.

---

## AKTUELLER ARBEITSSTAND

**Datum:** 2026-09-29
**Aktiver Fokus:** DJI Neo 2 – Serie echter Werbevideos aus Vattos Eigenmaterial
(HyperFrames). 5 Videos gebaut, Generator `tools/hyperframes-neo2/`, Faktenblatt `memory/projekte/dji-neo-2.md`.

### Offene Punkte
- [ ] Neo 2: Link/Screenshot des verlinkten Shop-Artikels (Variante → Product Match)
- [ ] Neo 2: 20 Videos posten (Plan in export/neo2/POSTING.md), nach 3 Tagen Sekunde-6-Werte auswerten
- [ ] TikTok-Compliance-Zusammenfassung von Vatto einlesen → `memory/regeln/tiktok-compliance.md`
- [ ] `02_LYRA_ADS_MASTER_V4.1.txt`, `03_COMPLIANCE_V4.0`, `04_LEARNING_V4.0` nachladen
- [ ] Erster Remotion-Schnitt mit echtem Clip (Faruks Ablauf: Schnittplan → Freigabe → Vorschau → Frame-QA)
- [ ] KI-Anbieter für Bild- und Videogenerierung anbinden (fal.ai-Weg aus Faruks Maschine steht)
- [ ] Hosts in der Cloud freischalten, Keys als Umgebungsvariablen setzen
- [ ] Erstes Produkt nach Faruks Format A (UGC-Overlay) bauen
- [ ] Optional: Gedächtnis vom alten PC übernehmen (`C:\Users\rober\ki-app\`)

---

## SESSION-LOG

### 2026-09-29 – DJI Neo 2: Runde 2 – 15 weitere Videos (insgesamt 20)

- Vatto: „gute Arbeit“, will so viele Videos wie möglich (~20), mehr Skript, Fotos mit Zoom,
  **Gesicht zeigen ist ok**, **Drohne-trifft-Drohne-Clips (app_*) ausdrücklich freigegeben**, mehr Hügel.
- 15 neue Skripte (v06–v20), jedes eigener Hook/Einstieg/Ablauf gegen Massenvarianten-Drosselung:
  3 Gründe · Drohnen-Date · Speed-Unboxing · Ein Knopf (Dronie) · Hausberg · Wald · Feierabend · Akku leer ·
  Modi · Hochformat · Gesten · Von oben · Joysticks · Ich gegen die Drohne · Auspacken und losfliegen.
- Neu im Generator: Breitbild-Layout `w_*` (4:3 mittig, unscharfer Rand) für 720p-/Weitwinkel-Clips,
  `batch.sh` (Render → Final → Chat → Roh löschen), `pair_qa.py`. Ca. 3 min pro Video.
- QA-Funde und Fixes: Hook über Plakat-Schrift (v06), zu lange Zeilen (v09, v11, v16), Passanten/Kind im
  Hintergrund (v10, v19), DJI-Tutorial mit fremder Person in App-Aufnahme (v14), Standbild 1,7 s (v18).
- Posting-Paket: `export/neo2/POSTING.md` (Captions, Reihenfolge, Regeln). Ein Foto = DJI-Plakat
  (file_png) – als Shop-/Herstellerbild wie bei Faruk genutzt, Hinweis an Vatto.

### 2026-09-29 – DJI Neo 2: 5 Werbevideos aus Eigenmaterial (HyperFrames)

- Vatto: 5 Videos, max. 20 s, Hook in Sekunde 1, wenig Gesicht (von hinten/seitlich), knallige Texte,
  lustige Sprüche. Rohmaterial aus Drive-Ordner „Drohne“ (64 Dateien, 3,1 GB, nur Kopien geladen).
- Desktop-Pfade (`file://SKYNET2000/...`) sind aus der Cloud **nicht** erreichbar → immer Drive + Link-Freigabe.
- Generator `tools/hyperframes-neo2/`: Poppins Bold (Faruk), Akzent #FFD400, keine Doppelpunkte,
  Sprechblasen, Weißblitz auf Schnitten, 144-BPM-Raster, stille AAC-Spur. Render ~2 min/Video.
- Videos: v1 Unboxing mit Action · v2 Kameramann (hinten/vorne/seitlich) · v3 Zuckerbuckel ·
  v4 Nur dein Handy + Akku leer · v5 Wenn deine Drohne reden könnte.
- Aussortiert: fremde Drohne in App-Clips, Kinder auf Balkon, Brücke (Gesicht), DJI-Werbeplakat.
- Offen: Shop-Variante (Product Match), Helm fehlt in Fahrszenen.

### 2026-09-29 – DJI Neo 2 recherchiert

- Vatto will aus viel Eigenmaterial (Scooter, Follow, Rocket, Drohne filmt Drohne,
  Handy-Steuerung, Akku leer, POV, Unboxing) möglichst viele Kurzwerbefilme mit
  Text/Infos bauen – mit Remotion (+ HyperFrames). **Rohdateien dürfen nie gelöscht
  werden.**
- Technische Daten recherchiert, abgeglichen, als Claim-Ampel abgelegt.
- dji.com und Wikipedia sind aus der Cloud gesperrt → nur Websuche möglich.
- Wichtigste Fallen: 2000 m = Starthöhe ü. NN, nicht Flughöhe; 10 km nur mit
  Transceiver + RC; Registrierung/Versicherung trotz C0 Pflicht; Product Match je Variante.

### 2026-09-29 – HyperFrames installiert, 3 Scooter-Videos gerendert

- **HyperFrames** (heygen-com/hyperframes, CLI 0.8.86) per `npx skills add` projektweit installiert
  (`.agents/skills/`, Symlinks in `.claude/skills/`). Skripte geprüft: nur ffmpeg/Aufräumen, kein Nachladen.
  Telemetrie **abgeschaltet** (`npx hyperframes telemetry disable`). Render-Chrome per `browser ensure`.
- Cloud-Stolpersteine: jsdelivr gesperrt → GSAP lokal (`assets/vendor/gsap.min.js`); Asset-Pfade in
  Unter-Kompositionen **root-relativ** (`assets/…`, nicht `../assets/`), sonst Lint-Fehler.
- Aufteilung: `tools/hyperframes-scooter/mezzanine.py` (HDR→SDR, 9:16-Ausschnitt, dem Fahrer folgend) →
  `build.py` erzeugt pro Video `index.html` + `compositions/picture.html` + `captions.html` →
  HyperFrames check (alle grün) → render (beginframe, ~2 min/Video) → stille AAC-Spur → `export/`.
- Ergebnis: `export/video1_ueberarbeitet.mp4` (20,9 s), `video2_gefuehl.mp4` (19,2 s), `video3_proof.mp4` (20,5 s).
  Eine Akzentfarbe #FFD400, Permanent Marker, Text-Pop 0,25 s, keine Dauerbewegung, Schnitt 144 BPM.
- Waldfahrt von hinten existiert echt (DJI_0029) → kein KI-Ersatz nötig.
- Speicher-Falle: ganze Einstellungen als Rohframes puffern → „No space left" → Export jetzt Bild für Bild.
- Sicherung vor dem Umbau: `backup_2026-09-29/` (gitignored, nur lokal in der Session).

### 2026-09-28 – Scooter FUE V10: 3 Echt-Videos geschnitten

- Material über Google-Drive-Freigabe geladen (Netzwerkliste: `drive.google.com`,
  `drive.usercontent.google.com`). Drive-Connector nur zum Auflisten, Download per curl.
- **Product Match:** DJI_0024 zeigt einen anderen Roller → aussortiert. DJI_0029 laut Vatto korrekt.
- Fertiges Video AVLX0403: Unboxing + KI-Clips mit TikTok-Logo raus, nur echte Fahrten/Details.
- „Luftreifen" (Video) vs. „Vollgummireifen" (Shop) widersprüchlich → Reifenart weglassen.
- Ergebnis: V1 Brücke 15 s, V2 Drohne 30 s, V3 Details 15 s, Schnitt auf 144 BPM (Beat aus
  Vattos Video gemessen), Schrift Permanent Marker bunt, ohne Musik (macht Vatto selbst).
- Werkzeug: `tools/beat-schnitt/` (render.py = Engine, videos.py = Schnittlisten).
- **Feedback Vatto (Runde 2):** zu hektisch/wackelig, Roller nie ganz zu sehen, Details zu kurz.
  → Lernpunkte: Echt-Videos **ruhig** schneiden (Einstellungen 2–3,3 s = 6–8 Beats, keine
  Zoom-Stöße/Wackeln/Blitze, nur stabile Drohnen-Passagen), **ganzer Roller am Anfang und
  Ende** (Foto im Vollbild-Modus mit weichgezeichnetem Rand), Details mind. 2 s.
- KI-Renderbilder aus dem alten Video (Logo verfälscht „FUIIIS", „Luftreifen", TikTok-Logo)
  nicht verwendet – Product-Match-Risiko. Upload über „+" beschneidet Videos → immer Drive.
- Chat-Upload max. 30 MB → Upload-Fassungen per 2-Pass (15 s: 12 Mbit/s, 30 s: 6,8 Mbit/s).

### 2026-09-27 – Einrichtung vereinfacht

- Vatto ist Einsteiger und will nur reinkopieren → alles Automatisierbare automatisiert.
- **Perplexity entfernt:** nur Pro-Abo, keine API. Websuche ist eingebaut.
- **Setup-Skript überflüssig:** SessionStart-Hook `cloud-setup.cjs` installiert in der
  Cloud selbst ffmpeg und Python-Pakete.
- Netzwerk hat Vatto bereits auf „Benutzerdefiniert" umgestellt (geprüft: prompts.chat,
  fal.media, huggingface erreichbar).
- **Yapper-MCP braucht keinen Key**, nur Login → claude.ai-Konnektor.
- Offen, und nur von Vatto machbar: 2 API-Anmeldedaten (KIE, fal) + Yapper-Konnektor.
- Keys ausdrücklich **nicht** im Chat angenommen (Chat gespeichert, Repo auf GitHub).

### 2026-09-27 – Faruks Weg = Standard, Cloud-Einrichtung korrigiert

- **Entscheidung Vatto:** Faruks Video-Maschine ist Standard für jedes TikTok-Shop-Video.
  Lyra nur noch für klassische KI-Produkt-Renders auf Wunsch; Compliance: strengere Regel.
- Vatto hatte die Domains ins Feld **Umgebungsvariablen** eingetragen → Parse-Fehler.
  Richtig: Netzwerkzugriff „Benutzerdefiniert" (eine Domain pro Zeile), Keys als
  **API-Anmeldedaten** (Proxy hängt sie an, Session sieht sie nie). Umgebungsvariablen
  sind für alle sichtbar → keine Keys dort.
- Firecrawl (offizieller Konnektor) und Rube → claude.ai-Konnektoren statt `.mcp.json`.
- Perplexity-Starter startet in der Cloud mit Platzhalter, weil der Proxy den Key anhängt.
- Claude kann Umgebung und Konnektoren **nicht** selbst ändern – nur Vatto.

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
