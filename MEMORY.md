# MEMORY – Laufendes Arbeitsprotokoll

> Einstieg: `MASTER-MEMORY.md`. Diese Datei = was passiert ist und was ansteht.
> Neueste Einträge oben.

---

## AKTUELLER ARBEITSSTAND

**Datum:** 2026-10-01
**Aktiver Fokus:** TikTok-Verkaufsvideos aus Rohmaterial mit dem Skript-Workflow
(`video-cutter/`, „Weg 2“). Engine = HyperFrames. Nächster Schritt: Zahlen der 2 Neo-2-Videos auswerten,
dann nächstes Produkt – mit **verschiedenen Formaten** statt nur verschiedener Clips.

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

### 2026-10-01 (Abend) – RCB D5 Pro: F, G, H von Vatto abgenommen („richtig gut“)

- Finals A, B, H (ohne Ton, Vattos Song) + F, G (Stimme Markus) in `02-Fertig/RCB-D5-Pro`; Captions in `video-cutter/projekte/rcb-d5-pro/POSTING.md`.
- Was gewirkt hat: neues iPhone-Material (POV mit Display, Felsen-Rundgang, Füße auf dem Trittbrett), **Slam-Hook** (Weißblitz +
  Wackler + Punch-In), **Daten-Karten** mit Hochzählen, Szenen ≥ 3 s (Vatto: „tack, tack, tack – man sieht nichts“), Endkarten.
- Vatto mag nicht: Landstraße, Draufsicht, Brücke, Lauf-ins-Bild-Stativszene, Stakkato-Schnitte, Stimme „Patrick“, leere Bilder.
- Werkzeuge neu: `stumm-vo.mjs` (Videos ohne Sprecher), `spec.hook_effekt: "slam"`, `szenen[].stat`, `spec.schrift_alt`, `produziere --drive`.
- Regeln neu: Caption (Keywords, 5 Hashtags, #RCB zuerst, #AIGC zuletzt) · Tacho 22 ok, nie unter „20 km/h“-Aussage ·
  Neo-2-Vorbeiflüge zeigen Fremd-Roller → gesperrt · Vatto will nur die großen Finals im Drive.

### 2026-10-01 – RCB D5 Pro: 5 Videos aus Originalmaterial (erster Test der neuen Cut-Linie)

- Material aus Drive (51 Dateien, MD5 geprüft) → `video-cutter/projekte/rcb-d5-pro/`. Faktenblatt: `memory/projekte/rcb-d5-pro.md`.
- **Fund:** TikTok-Verstoß vom 26.09. (−24 Punkte, „inkonsistente Produktwerbung“) liegt im Material → Varianten-Frage (NFC/Blinker) an Vatto.
- Werkzeug: `baue-spec.mjs` kann jetzt Marker-Looks `rcb`, `rcb_tag`, `rcb_dunkel` (Permanent Marker, Orange #FF7B1C) und `spec.logo`
  (klein oben rechts, optional groß als Intro); bei Marker-Looks liegen alle Texte in der oberen Bildhälfte (Produkt unten frei).
- Fotos als 6-s-Standbild-Clips (`stills/`) in der Bibliothek → Ken Burns über den normalen Spec-Weg.
- Lehre: Drohnen-Footage 9:16 → Roller sitzt im unteren Drittel; Headline bei 1150 px lag über dem Produkt (v001 von Video a verworfen).
- Vorschauen a v004 · b v002 · c v003 · d v001 · e v003 im Drive `02-Fertig/RCB-D5-Pro/Vorschau`. Selbst gefundene Fehler: Kind im Bild (a),
  Gesicht zu lange frontal (b, c, e), Passanten (c, e), Text-Überlauf (lange Einzelwörter → Schrift passt sich jetzt an).
- Vatto: Link = Version ohne NFC/Blinker, IMG_7963 ist seiner, WILD-MAN-Tasche ok.
- **Offen:** Sperrstatus (Produkt wieder verlinkbar?) + Sichtung/Freigabe je Video → dann Finals (`produziere.mjs … --final`).
- Lehre: frontale Drohnen-Verfolgung = Gesicht dauerhaft im Bild; Kontaktbögen mit 1 Bild/s täuschen bei Distanz → Stichbild in voller Größe prüfen.

### 2026-10-01 – Fester Drive-Ordner für Videos (beide Richtungen)

- Austausch über `Snova-Videos/01-Rohmaterial/<Produkt>` (Vatto lädt hoch) und `02-Fertig/<Produkt>` (Finals automatisch).
  Werkzeug `video-cutter/tools/drive.mjs` (rclone, Größe + MD5 geprüft), Schlüssel = **eine** Umgebungsvariable `VATTO_DRIVE_TOKEN`.
- Vatto-Entscheidung: Hauptkonto (Risiko bewusst: Schlüssel könnte ganzes Drive lesen; wir arbeiten nur im Ordner, nie löschen).
- **Offen:** Vatto richtet nach START-HIER Kapitel 7 ein (Drive für Desktop, `rclone authorize "drive"`, Variable) → neue Sitzung → `drive.mjs test`.
- Der alte Weg (Ordner „Jeder mit Link“) entfällt; der Neo-2-Ordner kann wieder auf „Eingeschränkt“.

### 2026-10-01 – Skript-Workflow fertig, 2 Neo-2-Videos final

- **Ergebnis:** `video-cutter/projekte/neo2/videos/{a,b}/exporte/final-*-v001.mp4` (+ `-tiktok.mp4` < 30 MB zum Teilen).
  Vatto: beide gut, **aber kaum Unterschied**; Farben/Look von B („nacht“) besser → jetzt Standard.
- **Fehler in A:** Schlagzeile wiederholte das gesprochene VO (Headline + Untertitel = doppelter Text).
  → `pruefe-spec.mjs` blockiert das jetzt („Text muss ergänzen, nicht doppeln“). Die Specs a/b sind dadurch nachträglich ROT (bewusst stehen gelassen).
- **Lehre Diversität:** Andere Clips + anderer Look reichen nicht – gleicher Baukasten (Headline + Untertitel + KI-Stimme
  + gleiche Übergänge) wirkt gleich. Nächstes Mal pro Video ein **anderes Format** wählen (z. B. KI-VO-Montage,
  App-Screen-Demo, Text-only/POV ohne Stimme, eigene Sprecheraufnahme/UGC, Vorher-Nachher).
- **Engine-Entscheidung:** HyperFrames bleibt (eigene Werkzeuge, QA, Lautheit stimmt; Remotion war nur gleich gut,
  langsamer, braucht Extra-Schritt). `video-edit/` SpecVideo bleibt nur als Archiv.
- **Schneller/günstiger:** `node tools/produziere.mjs <p> <v>` = Timing → Clips → Bau → Render + QA in einem Befehl.
  Qualitätsprüfer-Agent nur noch bei Bedarf (kostet viele Tokens), automatische QA läuft immer.
- **Stimme:** Vattos Yapper-Stimme „Wayne“ ist aus einem Batman-Filmausschnitt (Synchronsprecher) geklont →
  **nicht für Werbung nutzen** (Persönlichkeits-/Urheberrecht, ElevenLabs-Regeln). Legale Alternativen: „Hans – Deep and
  Dominant“ (`WPbK7Qv9rbyhvUDiwJ0A`), „Peter – Deep, calm German narrator“ (`TVGn2JVJHeMuzxos8a3h`) oder Vattos eigene Aufnahme klonen.
- Yapper eleven_v3 kostete 0 Credits (dryRun geprüft).

### 2026-09-30 – Video-Cutting-Agent (HyperFrames) gebaut

- Neues Projekt `video-cutter/`: HyperFrames 0.8.77 (gepinnt) + whisper.cpp lokal (Modell small, de).
- Werkzeuge `tools/*.mjs`: quelle (ffprobe, SHA-256, Offset) → transkript (ok/Plausibilität) → schnittplan
  (Pausen/Takes aus dem Tonpegel, nicht aus whisper-Zeiten) → pruefe-plan (Zeitkarte, Untertitel auf Schnittzeit)
  → baue (Komposition, animierte Textgrafiken) → render (check + Vorschau/Final, nie überschreiben) → qa (Messwerte).
- Spezialisten `.claude/agents/video-schnitt/`: schnittplaner, broll-gestalter, qualitaetspruefer (neue Sitzung nötig).
- Getestet nur mit **synthetischem** Clip (`jobs/test/`). Befunde: whisper dehnt Wortzeiten über Pausen;
  HyperFrames-Audiomix −2 dB (ausgeglichen, QA misst nach).
- Qualitätsprüfer-Agent fand in 3 Runden echte Fehler (Untertitel „Kennt“, CTA außerhalb Safe Zone, Wort-Anker-Bug) → behoben, QA-Werkzeug erweitert; Testvorschau v006.
- **Offen:** erster Schnitt mit Vattos echter Aufnahme (30–90 s) + Sichtung durch Vatto.
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
