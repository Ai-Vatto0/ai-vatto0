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
