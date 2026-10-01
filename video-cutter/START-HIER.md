# START HIER – Dein Video-Cutting-Agent

Du gibst eine eigene Aufnahme rein → der Agent schneidet Versprecher, verworfene Takes und tote Pausen raus,
setzt Untertitel und bis zu 3 animierte Textgrafiken, zeigt dir eine **Vorschau** und rendert das fertige
TikTok-Video (1080×1920) **erst nach deiner Freigabe**. Bei viel Material schlägt er mehrere **unterschiedliche** Clips vor.

---

## 1. Der eine Auftrag (kopieren, ausfüllen, abschicken)

```
Neues Video mit dem Video-Cutting-Agenten (video-cutter/CLAUDE.md).
Aufnahme: <Pfad zur Datei oder Google-Drive-Link>
Ausschnitt: <ganzes Video | von 0:12 bis 1:05>
Produkt: <Name> – Shop-Link oder Screenshot: <…>
Freigegebene Produktbilder: <keine | Pfade>
Wünsche: <optional, z. B. „Hook: Problem zuerst“, „mehrere Varianten“>
```

Der Agent arbeitet dann so und **fragt dich an drei Stellen**:
1. **Schnittplan** – was rausfliegt und warum, plus unklare Stellen („Versprecher oder gewollt?“).
2. **Einblendungen** – höchstens 3 Vorschläge (Text, Zeitpunkt, Zweck).
3. **Vorschau** – du schaust sie an und sagst „freigegeben“ oder was anders soll (jede Änderung = neue Version).

Erst dann kommt das finale Video: `video-cutter/jobs/<name>/exporte/final-…-v001.mp4`.

---

## 1b. Viel Rohmaterial → mehrere verschiedene Videos (Skript-Weg)

Neuer Chat im Repo `ai-vatto0`, dann einfach (Kurzform reicht):
```
Neue Videos von <Produkt> sind im Drive. Mach coole TikTok-Verkaufsvideos mit Hook und Skript.
```
Ausführlich:
```
Neue Videos aus Rohmaterial (Skript-Workflow, video-cutter/CLAUDE.md „Weg 2“).
Material: <Produktordner in Snova-Videos/01-Rohmaterial, z. B. „Mixer“ – oder Drive-Link>
Produkt: <Name> – Faktenblatt/Shop-Link: <…>
Anzahl Videos: <z. B. 2>
Wünsche: <z. B. „einmal Lifestyle, einmal Funktionen erklären“>
```
Du bekommst zuerst die **Skripte als Tabelle** (Hook, Voiceover-Text, Shotliste) zur Freigabe,
dann Vorschauen mit Zoom, Speed-Ramps, Übergängen, animierten Texten und KI-Voiceover, dann die Finals.
Jedes Video bekommt ein **anderes Format** (z. B. Voiceover-Montage, App-Demo, POV ohne Stimme), damit sie sich wirklich unterscheiden.
Beispiel-Projekt mit allen Dateien: `projekte/neo2/` (DJI Neo 2, Okt. 2026).

## 2. Einmalig einrichten

**Cloud-Sitzung (claude.ai/code):** passiert automatisch beim Start (Log: `/tmp/video-cutter-setup.log`).
Beim allerersten Mal dauert es ein paar Minuten (whisper.cpp wird gebaut, Sprachmodell ~470 MB geladen).

**Eigener PC:** Linux oder Windows mit **WSL 2** (unter reinem Windows lässt sich whisper.cpp nur mit Zusatzaufwand bauen):
```
cd video-cutter
bash tools/setup.sh
```
Braucht: Node.js 22+, ffmpeg, git, cmake + C-Compiler.

**Die drei Spezialisten** liegen in `.claude/agents/video-schnitt/` und werden automatisch geladen:
`schnittplaner`, `broll-gestalter`, `qualitaetspruefer`. Siehst du sie nicht (Befehl `/agents`), **starte eine neue
Claude-Code-Sitzung** – neue Agenten-Ordner werden erst beim Sitzungsstart erkannt.

---

## 3. Wie kommt mein Video rein?

- **Am PC (empfohlen):** Datei irgendwo ablegen und den Pfad in den Auftrag schreiben, z. B. `video-cutter/material/becher.mp4`.
  Der Ordner `material/` wird **nicht** zu GitHub hochgeladen.
- **Cloud-Sitzung (empfohlen):** in deinen festen Drive-Ordner `Snova-Videos/01-Rohmaterial/<Produkt>` legen → Kapitel 7.
  Keine Freigabe-Links, keine Größenbeschränkung, Originalqualität.
- Das Original wird **nie verändert**: Der Agent merkt sich eine Prüfsumme und arbeitet mit einer Kopie.

---

## 4. Was du von mir bekommst

| Datei (im Ordner `jobs/<name>/`) | Wofür |
|---|---|
| `schnittplan.json` | jeder behaltene Bereich mit Start, Ende, Grund, Unsicherheit + was entfernt wurde |
| `exporte/vorschau-…-vNNN.mp4` | Vorschau zum Anschauen |
| `qa/…/bericht.md` | Prüfbericht mit Messwerten + Kontaktbögen jeder Schnittstelle |
| `exporte/final-…-vNNN.mp4` | fertiges Video nach deiner Freigabe |

---

## 5. Regeln, die immer gelten

- Produkt wird **nie** verändert (keine Filter, keine KI-Nachbauten).
- Keine erfundenen Zahlen, Eigenschaften, Preise, Rabatte oder „viral/garantiert“.
- Unklare Stellen werden **gefragt, nicht weggeschnitten**.
- Kostenpflichtige KI (Bild/Video/Stimme) nur nach deiner ausdrücklichen Kostenfreigabe.
- Deine Aufnahmen gehen an **keinen** zusätzlichen Cloud-Dienst; transkribiert wird lokal.

---

## 6. Selbsttest (für Technik-Check)

```
cd video-cutter && bash tools/selbsttest.sh
```
Baut einen synthetischen Testclip (Computerstimme mit Versprecher und langen Pausen) und schickt ihn durch die ganze Kette.
Beispiel-Ergebnis liegt in `jobs/test/` (Schnittplan, Komposition, QA-Bericht).

---

## 7. Dateien austauschen: dein fester Drive-Ordner (einmal einrichten, ca. 10 Min.)

So sieht es danach aus – **nie mehr Freigaben, nie mehr WeTransfer:**
```
Google Drive (dein Konto)
└── Snova-Videos/
    ├── 01-Rohmaterial/<Produkt>/   ← du legst Videos rein (Laptop oder iPhone)
    └── 02-Fertig/<Produkt>/        ← hier landen die fertigen Videos automatisch
```

**Einmalig am Laptop (Windows):**
1. **Google Drive für Desktop** installieren (google.com/drive/download) und mit deinem Konto anmelden.
   Im Explorer erscheint Laufwerk `G:` → `Meine Ablage`. Alles, was du dort hineinziehst, lädt automatisch hoch.
2. **Schlüssel für mich erzeugen:** Eingabeaufforderung öffnen und eintippen:
   ```
   winget install Rclone.Rclone
   rclone authorize "drive"
   ```
   (nach der Installation das Fenster einmal schließen und neu öffnen). Der Browser geht auf → mit deinem Google-Konto
   anmelden → „Zulassen“. Im Fenster erscheint danach ein Text, der mit `{"access_token":` beginnt und mit `}` endet.
   Diesen ganzen Text kopieren. **Nicht in den Chat einfügen.**
3. **Schlüssel hinterlegen:** in Claude Code oben in der Titelleiste auf die Cloud-Umgebung → **Bearbeiten** →
   Umgebungsvariablen → eine neue Zeile:
   ```
   VATTO_DRIVE_TOKEN=<hier den kopierten Text einfügen>
   ```
   Speichern → **neue Sitzung starten**. Den Ordner `Snova-Videos` lege ich beim ersten Mal selbst an.

**iPhone (Google-Drive-App):**
- **Hochladen:** Drive-App → `Snova-Videos/01-Rohmaterial` → Produktordner anlegen/öffnen → **+** → **Hochladen** → **Fotos und Videos**.
  Drive speichert das Original (4K, HDR) – anders als Google Fotos im Speichersparmodus. Großes Material im WLAN hochladen.
- **Fertige Videos aufs iPhone:** Drive-App → `Snova-Videos/02-Fertig/<Produkt>` → bei der Datei **⋮** → **Kopie senden** → **Video sichern**
  → liegt in deiner Fotos-App, bereit für TikTok.
- Tipp: die beiden Ordner in der Drive-App mit ⭐ markieren, dann sind sie unter „Markiert“ sofort da.

**Drohne → Laptop:** Dateien direkt in `G:\Meine Ablage\Snova-Videos\01-Rohmaterial\<Produkt>` ziehen – fertig.

**Im Chat reicht dann:** „Neue Videos von <Produkt> sind im Drive.“ Ich hole sie, prüfe jede Datei (Größe + Prüfsumme),
schneide, und nach deiner Freigabe liegen die Finals in `02-Fertig/<Produkt>` – in voller Qualität und zusätzlich als kleinere `-tiktok.mp4`.

**Sicherheit (ehrlich):** Der Schlüssel könnte technisch dein ganzes Drive lesen. Ich arbeite nur in `Snova-Videos`,
kopiere nur und lösche nie. Widerrufen jederzeit: myaccount.google.com → Sicherheit → Drittanbieter-Zugriff → „rclone“ entfernen.
Speicher: 15 GB sind gratis – fertige Projekte im Drive aufräumen (das machst du, ich lösche nichts).

