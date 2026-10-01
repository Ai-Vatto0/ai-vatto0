# TEXT-EINBLENDUNGEN – Vattos Standard-Look

**Status:** AKTIV – Lernupdate von Vatto, 01.10.2026 („die Texteinblendungen gefallen mir sehr gut")
**Gilt für:** jedes TikTok-Video mit Texteinblendungen (HyperFrames, Remotion oder ffmpeg)
**Referenz-Umsetzung:** `tools/hyperframes-scooter/build.py` (CSS `CAP_CSS`, Funktionen `fit_size`, `line_html`)
**Referenz-Videos:** Scooter FUE V10, `videos/scooter-v1-ueberarbeitet`, `-v2-gefuehl`, `-v3-proof`

---

## LOOK

| Element | Wert |
|---|---|
| Schrift | **Permanent Marker** (Graffiti-/Marker-Stil, Apache-Lizenz, `assets/fonts/PermanentMarker.ttf`) – lokal einbetten |
| Grundfarbe | warmes Weiß `#FFF7E8` |
| Akzent | **eine** Akzentfarbe pro Video, aus dem Produkt abgeleitet (Scooter: Gelb `#FFD400`) |
| Kontur | dunkel `#140F05`, Stärke ≈ 11 % der Schriftgröße (`-webkit-text-stroke`, `paint-order: stroke fill`) |
| Schatten | harter Versatzschatten `0 10px 0 rgba(12,9,3,.55)` |
| Neigung | ganze Textgruppe −2° gedreht |
| Größe | 104–190 px, automatisch so gewählt, dass jede Zeile ≤ 850 px breit ist (in Safe Zone) |
| Aufbau | 1–3 kurze Zeilen, max. 5–6 Wörter; Schlüsselwort/2. Zeile in Akzentfarbe |
| Aufzählung | Nummern-Badge: Akzent-Fläche mit dunkler Ziffer (① ② ③) vor der Zeile |
| Großschreibung | ALLES IN GROSSBUCHSTABEN |

## BEWEGUNG

- Pop-in **0,25 s**: Deckkraft 0→1, Skalierung 0,86→1, 24 px von unten, Ease `power3.out`, **kein Überschwingen**
- Ausblenden 0,15 s; Wechsel immer auf dem Beat (Musik-BPM)
- **Kein** Pulsieren, Wackeln, Dauerblinken, hüpfender Pfeil (Vatto: „zu wackelig")
- Hook-Zeile steht **komplett** ab ~0,2 s – nicht Wort für Wort aufbauen

## PLATZIERUNG

- Safe Zone 1080×1920: oben 150, rechts 140, unten 400, links 60 px
- Standard oben (top ≈ 165–250 px); unten (≈ 1180–1250 px) nur, wenn das Motiv oben liegt
- Text verdeckt nie Roller/Produkt oder Gesicht – vor dem Render Standbilder prüfen
- **Endkarte:** ganzes Produkt verkleinert in der Mitte, weichgezeichneter Rand aus demselben Foto,
  „JETZT IM / TIKTOK SHOP." oben in Akzent, kleiner Pfeil nach unten links (statisch)

## INHALT

- Eine Nutzen-Zeile pro Szene, passend zum Bild (Display-Szene → „LED-DISPLAY")
- Nur belegte Aussagen (Shop-Screenshots oder klar im Bild) – siehe `tiktok-compliance.md`
- Text ergänzt das gesprochene VO, wiederholt es nicht (siehe `video-cutter/tools/pruefe-spec.mjs`)
- Keine Preise, Rabatte, Dringlichkeit
