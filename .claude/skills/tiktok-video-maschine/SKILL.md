---
name: tiktok-video-maschine
description: |
  TikTok-Shop-Affiliate-Videos nach Faruks Video-Maschine produzieren: Produkt-Screenshots
  auswerten, Format wählen (UGC-Overlay, C1 Bild-Schnitt, C2 Sprecher-Ecke, Echtes Video),
  mit ffmpeg schneiden, Voiceover, Captions in Poppins Bold, Sound, Export 1080×1920, Posting-Paket.
  Nutze diesen Skill IMMER bei den Befehlen Money, UGC, C1, C2, Echt, VO, Render, Posting,
  Lernupdate, sowie wenn Vatto ein TikTok-Shop-Werbevideo bauen, schneiden oder posten will.
---

# TikTok-Shop-Video-Maschine

**Standard für jedes TikTok-Shop-Video** (Entscheidung Vatto, 27.09.2026).

## Vor jedem Auftrag lesen

1. `memory/regeln/tiktok-video-maschine.md` – Faruks System, inkl. Zuständigkeit gegenüber Lyra
2. `memory/regeln/tiktok-compliance.md` – aktuelle Verstoßlage und harte Stopps
3. Nur bei klassischem KI-Produkt-Render mit Startframe: `memory/regeln/lyra-ads-v4.1-aktiv.md`

Bei Widerspruch gilt die Tabelle „Widersprüche und Standard" in Datei 1.
Bei Evidenz, Claims und Compliance gewinnt immer die strengere Regel.

## Befehle

| Befehl | Tun |
|---|---|
| `Money` | Screenshots wirklich lesen → Evidenz → Lizenz-Check → Business-Gate → Format-Empfehlung. Noch nichts rendern. |
| `UGC` | Format A: KI-Creator unten, echtes Shop-Bild oben. Creator-Prompt nach Kapitel 6. |
| `C1` | Format B: Shop-Fotos randlos 9:16 + Kamerafahrten + VO + Captions. Nur wenn das Produkt allein fesselt. |
| `C2` | Format C: Bild-Schnitt + kleiner KI-Sprecher unten rechts. |
| `Echt` | Format D: echtes Seller-/Handyvideo schneiden, Produktton behalten. Immer bevorzugen, wenn Material da ist. |
| `VO` | Skript (Gefühl statt Datenblatt, 25–32 Wörter / 10 s) + Stimmwahl Yapper. |
| `Render` | Nur nach Kostenfreigabe. Modell, Dauer, Auflösung, Kosten nennen, Freigabe abwarten. |
| `Posting` | „Werbung · [Hook] [Emoji]" + 1 Zeile Nutzen + genau 5 Hashtags + erster Kommentar. |
| `Lernupdate` | Nur belegte, wiederholbare Erkenntnisse in `MEMORY.md` bzw. die Regeldatei. |

## Werkzeuge

| Was | Wo |
|---|---|
| Einrichtung (ffmpeg, Pillow, numpy, faster-whisper) | `bash tools/video-maschine/setup.sh` |
| Kamerafahrt über Standbild | `tools/video-maschine/zp.sh` |
| Schrift | `assets/fonts/Poppins-Bold.ttf` |
| Arbeitsordner pro Produkt | `produktion/<produkt>/` – `work/` und `out/` sind gitignored |
| Motion Design / Text-Animation | Remotion in `video-edit/`, Ablauf `memory/regeln/video-schnitt-workflow.md` |

Vor dem ersten Schnitt einer Session prüfen: `command -v ffmpeg` – fehlt es, zuerst `setup.sh`.

## Harte Regeln

- **Nichts erfinden.** Was nicht auf Screenshot oder Shop steht = UNVERIFIZIERT = nicht ins Video.
- **Produkt nie in der KI-Szene** – nicht halten, nicht öffnen. Produkt kommt aus dem echten Shop-Bild.
- Shop-Screenshot nur als Bildquelle: **Bildbereich ausschneiden**, nie Preis, Badges oder Shop-Oberfläche.
- Creator nur Meinung („find ich mega"), nie „hab ich gekauft/getestet".
- Keine Preise im Video, keine Fake-Knappheit, kein „viral", keine Heilversprechen.
- AIGC an bei KI-Mensch, „KI-Stimme" bei KI-Voiceover, „Werbung" in der Caption.
- Captions: Textbreite mit Pillow messen, max. 920 px, keine Doppelpunkte, Safe Zone 150/140/400 px.

## API-Keys

**Nie in Dateien, Commits, Logs oder Chat-Ausgaben schreiben.**

- **Cloud:** fal.ai-Aufrufe an `queue.fal.run` **ohne** Authorization-Header senden –
  der Agent-Proxy hängt den Key als API-Anmeldedatum an. Die Session sieht ihn nie.
- **Lokal:** Key aus der Umgebungsvariable `FAL_KEY` lesen, Header `Authorization: Key $FAL_KEY`.
- Fehlt der Zugang: auf `memory/projekte/werkzeuge-und-konnektoren.md` verweisen.
  **Nie** darum bitten, einen Key in den Chat zu kopieren.

## QA vor Übergabe (5.12)

Kontaktbogen mehrerer Frames ansehen · Randcheck (keine schwarzen Streifen) ·
Lautstärke ≈ -14 LUFS · Dauer · Transkript wortgleich mit Skript.
