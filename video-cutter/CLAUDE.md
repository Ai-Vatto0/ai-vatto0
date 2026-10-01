# Video-Cutting-Agent – Arbeitsanweisung

Vattos eigener Schnitt-Agent für **TikTok-Shop-Werbung (9:16)**. HyperFrames ist nur das Werkzeug für
Komposition, Vorschau und Export. **Die Schnittlogik machen unsere Werkzeuge in `tools/` – und sie wird geprüft.**
Einstieg für Vatto: `START-HIER.md`. Sprache: Deutsch.

## Feste Grundlagen
- HyperFrames **0.8.77** (fest in `package.json`, nie ungeprüft anheben), whisper.cpp lokal, Modell `small`, Sprache `de`.
- Offizielle Skills: `/general-video` (Schnitt-Komposition) + `/hyperframes-core` (Clip-Attribute:
  `data-start`, `data-duration`, `data-media-start`), `/motion-graphics` (animierte B-Roll). Weitere Referenzen nur bei konkretem Bedarf.
- Regeln fürs Geschäft: `../memory/regeln/tiktok-video-maschine.md` (Faruk = Standard) und
  `../memory/regeln/tiktok-compliance.md`. Bei Widerspruch gewinnt die strengere Regel.

## Ablauf (jeder Schritt ist ein Werkzeug; Hauptchat koordiniert)
| # | Werkzeug | Wer | Ergebnis |
|---|---|---|---|
| 1 | `node tools/quelle.mjs <job> <datei> [--start s --ende s]` | Hauptchat | `quellen.json` (ffprobe, SHA-256, Offset), Arbeitskopie |
| 2 | `node tools/transkript.mjs <job>` | Hauptchat | `transcript.json` + Prüfung (ok, Wortzeiten, Bindung an Prüfsumme) |
| 3 | `node tools/schnittplan.mjs <job>` → Agent **schnittplaner** → `node tools/pruefe-plan.mjs <job>` | schnittplaner | `schnittplan.json`, Zeitkarte, Untertitel auf Schnittzeit |
| 4 | Agent **broll-gestalter** → `broll-<plan>.json` → `node tools/baue.mjs <job>` | broll-gestalter | HyperFrames-Projekt `komposition-<plan>/` |
| 5 | `node tools/render.mjs <job>` (check + Vorschau + QA) | Hauptchat | `exporte/vorschau-<plan>-vNNN.mp4` |
| 6 | Agent **qualitaetspruefer** | qualitaetspruefer | Befundliste mit Zeiten, offene Sichtungspunkte |
| 7 | Nach **Vattos Vorschau-Freigabe**: `node tools/render.mjs <job> --final --freigabe "…"` → erneut QA | Hauptchat | `exporte/final-<plan>-vNNN.mp4` |

Varianten aus langem Material: `node tools/varianten.mjs <job> --saetze | --neu variante-01 | (Vergleich)`, danach Schritte 3–7 mit `--plan variante-01`.
Unteragenten nicht verfügbar? Dann die Rollen nacheinander im Hauptchat ausführen – ihre Anweisungen stehen in
`../.claude/agents/video-schnitt/*.md`, und der Qualitätsprüfer-Schritt wird trotzdem getrennt und ohne Reparatur gemacht.

## Harte Regeln
1. **Originale nie verändern, verschieben oder löschen.** Nur lesen; Prüfsumme vorher/nachher (quelle.mjs).
2. **Stoppgründe:** Transkript fehlt / `ok ≠ true` / unplausibel · Prüfsummen passen nicht · `pruefe-plan` meldet Fehler · `check` scheitert.
3. Zeiten nie zwischen Dateien mischen. Transkript- und Planzeiten = Arbeitskopie. Offset zum Original steht in `quellen.json`.
4. Nur Belegtes schneiden (Versprecher, verworfene Takes, störende Pausen). Unklares → `pruefen`, Vatto fragen.
   Grenzen nur in Stille; Wortzeiten sind Schätzungen, der Tonpegel entscheidet.
5. Stil: keine toten Stellen, aber keine hektischen Schnitte (Stücke ≥ ~1,2 s). Verkaufsstark: Hook → Nutzen → Beweis → CTA.
6. **Produkt nie verändern** (keine Filter, keine KI-Nachbauten). Keine erfundenen Zahlen, Eigenschaften, Preise, Rabatte, Superlative.
7. B-Roll: höchstens 3 pro Video, jede mit Zweck und Zeitraum, nacheinander (nie gleichzeitig), zeitlich per Wort-Anker (`"wort": "w26"`);
   Safe Zone oben 150 / rechts 140 / unten 400 / links 60 px (QA prüft per Pixelvergleich); Gesicht und Produkt frei lassen.
8. Kostenpflichtige KI (Bild/Video/Stimme) nur nach Kostenfreigabe. Keine Medien an zusätzliche Cloud-Dienste.
9. Exporte nie überschreiben (Werkzeuge vergeben `vNNN`). Änderungswunsch = neue Version, gemeldeten Fehler danach gezielt nachprüfen.
10. Nie einen bestandenen Test behaupten, der nicht gelaufen ist. Was nicht messbar ist (Klang, Produktfarbe im Detail) → Vatto sichten lassen.

## Technische Notizen (geprüft mit 0.8.77)
- Schnitt = pro Bereich `<video muted>` + `<audio>` mit identischem `data-start`/`data-duration`/`data-media-start` (Rezept „Hard cut“) → genau eine Tonspur.
- Der Audio-Mix liegt ohne Ausgleich ~2 dB unter der Quelle → `MIX_KORREKTUR` in `baue.mjs`; QA misst „Pegel Export−Quelle“ bei jedem Export.
- QA-Wortvergleich allein reicht nicht: `qa.mjs` prüft Untertitel zusätzlich exakt gegen das Gehörte – Warnungen dort sind oft whisper-Hörfehler, trotzdem immer sichten.
- whisper dehnt Wortzeiten über Pausen → `schnittplan.mjs` ordnet Wörter Sprechinseln aus dem Tonpegel zu.
- `komposition-*/index.html` und `compositions/*.html` sind generiert – Änderungen immer über Plan/B-Roll-JSON + `baue.mjs`.
- Eigene Jobs unter `jobs/` und `material/` sind gitignored (privat). Nur `jobs/test/` (synthetischer Testclip) ist versioniert.

## Weg 2: Skript-Workflow (viel Rohmaterial → mehrere unterschiedliche Videos mit KI-Voiceover)
Für Produkt-Footage ohne Sprache (z. B. Drohnen-Clips). Ordner `projekte/<projekt>/` (Beispiel: `projekte/neo2/`).
| # | Werkzeug | Ergebnis |
|---|---|---|
| 1 | „Videos sind im Drive“ → `node tools/drive.mjs neu` → `node tools/drive.mjs holen <Produktordner>` (Rückfall ohne Schlüssel: öffentlicher Link + `bibliothek.mjs <p> laden`) | Kopien in `roh/` (gitignored), Größe + MD5 geprüft, `manifest.json` |
| 2 | `node tools/bibliothek.mjs <p> sichten` + Sichtungs-Agenten → `bibliothek.json` (Tags) | echte fps/HDR, 1-fps-Kontaktbögen, Rolle, beste Sekunden, Risiken |
| 3 | Specs `videos/<v>/spec.json` (Winkel, Hook, VO-Sätze mit Belegen aus `fakten.json`, Szenen mit `ab_wort`) → `node tools/pruefe-spec.mjs <p>` | Belege, Sperrwörter, Diversität A↔B + gegen alte Videos, Abdeckung |
| 4 | **Vatto gibt Skripte frei** → Yapper eleven_v3 (dryRun, 0 Credits) → `node tools/vo-ausrichten.mjs <p> <v> <mp3>` | VO -14 LUFS, Wortzeiten, Untertitel = Skripttext |
| 5 | `node tools/produziere.mjs <p> <v>` (= pruefe-spec → timing → zwischenclip → baue-spec → render-spec) | Vorschau + automatische QA in **einem** Befehl; Schnitte 0,12 s vor dem Wort-Anker, CTA 1,4 s nach dem letzten Wort |
| 6 | Vatto sichtet → `node tools/produziere.mjs <p> <v> --final --freigabe "…"` | Final, nie überschrieben, **lädt automatisch** nach `Snova-Videos/02-Fertig/<p>` hoch inkl. automatischer `-tiktok.mp4`-Kopie, wenn > 30 MB |
Regeln zusätzlich: Produkt in Sekunde 0 sichtbar · **Schlagzeile ergänzt das VO, wiederholt es nie** (pruefe-spec blockiert, sonst steht der Satz doppelt im Bild) ·
KI-Stimme nie in Ich-Form (kein Fake-Testimonial) · nur Stimmen aus der Bibliothek oder mit Einwilligung geklonte (nie Film-/Promi-Stimmen) ·
Zeitlupe nur aus ≥ 50 fps und nur als dokumentierte Ausnahme (Faruk: „keine Zeitlupe“) · private Stellen per `bis_max` sperren ·
Standard-Look `nacht` (Vatto mag die Farben).

**Drive-Ordner (`tools/drive.mjs`, Schlüssel `VATTO_DRIVE_TOKEN`):** nur innerhalb `Snova-Videos` · nur kopieren, nie löschen,
nie `sync`/`move` · Schlüssel nie ausgeben · holen und abgeben ohne Rückfrage (Vatto will es automatisch) · für Videoinhalte nie den
Google-Drive-Konnektor nutzen (schiebt Daten durch den Chat). Fehlt der Schlüssel → Vatto auf START-HIER Kapitel 7 verweisen.

**Sparsam arbeiten (Zeit + Tokens):** Engine ist **nur HyperFrames** (Remotion-`SpecVideo` in `video-edit/` = Archiv, nicht nutzen).
Qualitätsprüfer-Agent nur auf Wunsch oder bei QA-WARNUNG, die man nicht selbst klären kann. Kontaktbögen statt Einzelbilder ansehen.
Lange Renders im Hintergrund starten und währenddessen nichts anderes neu bauen.

**Echte Unterschiede zwischen Videos:** Andere Clips + anderer Look reichen nicht (Neo-2-Test: „kaum Unterschied“).
Jedes Video bekommt ein **anderes Format**: KI-VO-Montage · App-Screen-Demo · POV ohne Stimme, nur Text + Produktton ·
Vattos eigene Sprecheraufnahme (Weg 1) · Vorher/Nachher · Einwand-Antwort. Format im Skript-Vorschlag nennen.
