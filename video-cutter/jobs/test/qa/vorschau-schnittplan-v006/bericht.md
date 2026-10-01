# QA-Bericht vorschau-schnittplan-v006

**Gesamt: WARNUNG** · Plan `schnittplan` · 30.9.2026, 17:26:43

| Bereich | Prüfung | Status | Messwert |
|---|---|---|---|
| datei | Spuren | OK | 1 Video, 1 Ton |
| datei | Auflösung | OK | 1080x1920 |
| datei | Bildrate | OK | 29.97 fps (Quelle 29.97) |
| datei | Dauer | OK | 14.681 s (Plan 14.681 s, Abweichung 0 s) |
| datei | Lautheit | OK | -14.7 LUFS (Ziel -14 ±2) |
| datei | True Peak | OK | -1.9 dBTP (Ziel ≤ -1) |
| b1 | Ton-Versatz | OK | 0 ms, Korrelation 1.00 |
| b1 | Ton einfach (nicht doppelt) | OK | Pegel Export−Quelle -0.1 dB (doppelte Spur ≈ +6 dB) |
| b1 | Bild-Versatz | OK | 0 Frames (Unterschied 4.55/4.63/4.39/4.36/4.57/4.20/4.39/4.49/4.93/4.95/4.91) |
| b2 | Ton-Versatz | OK | 0 ms, Korrelation 1.00 |
| b2 | Ton einfach (nicht doppelt) | OK | Pegel Export−Quelle -0.0 dB (doppelte Spur ≈ +6 dB) |
| b2 | Bild-Versatz | OK | 0 Frames (Unterschied 7.70/7.32/7.39/7.99/7.65/6.26/7.58/7.16/7.08/7.71/7.56) |
| b3 | Ton-Versatz | OK | 0 ms, Korrelation 1.00 |
| b3 | Ton einfach (nicht doppelt) | OK | Pegel Export−Quelle -0.0 dB (doppelte Spur ≈ +6 dB) |
| b3 | Bild-Versatz | OK | 0 Frames (Unterschied 7.59/7.46/6.45/7.53/7.68/6.05/7.65/7.49/6.89/7.59/7.55) |
| b4 | Ton-Versatz | OK | 0 ms, Korrelation 1.00 |
| b4 | Ton einfach (nicht doppelt) | OK | Pegel Export−Quelle -0.0 dB (doppelte Spur ≈ +6 dB) |
| b4 | Bild-Versatz | OK | 0 Frames (Unterschied 9.38/9.19/8.51/9.35/9.49/7.82/9.50/9.22/8.82/9.65/9.63) |
| b5 | Ton-Versatz | OK | 0 ms, Korrelation 1.00 |
| b5 | Ton einfach (nicht doppelt) | OK | Pegel Export−Quelle -0.1 dB (doppelte Spur ≈ +6 dB) |
| b5 | Bild-Versatz | OK | 0 Frames (Unterschied 1.95/1.89/2.19/2.36/2.63/1.55/2.43/2.53/2.01/2.52/2.47) |
| schnitt 1 (b1→b2) | Stille am Schnitt | OK | max -120.0 dB bei 4.104 s (Sprachschwelle -39.331 dB) |
| schnitt 2 (b2→b3) | Stille am Schnitt | OK | max -120.0 dB bei 7.007 s (Sprachschwelle -39.331 dB) |
| schnitt 3 (b3→b4) | Stille am Schnitt | OK | max -120.0 dB bei 9.376 s (Sprachschwelle -39.331 dB) |
| schnitt 4 (b4→b5) | Stille am Schnitt | OK | max -120.0 dB bei 12.379 s (Sprachschwelle -39.331 dB) |
| grafik | Safe Zone (oben 150, rechts 140, unten 400, links 60) | OK | 124 Zeitpunkte geprüft |
| untertitel | Untertitel = Gehörtes (exakt) | WARNUNG | ut10 @10.896s „Getränkehalter“ ≠ gehört „meinen Getränkealter im Auto.“ → Sichtung: Hörfehler von whisper oder falscher Untertitel? |
| transkript | Wortfolge Export = Plan | OK | 95 % übereinstimmend; fehlend 0 (davon am Schnitt 0), zusätzlich 1, abweichend 1 |

## Wortvergleich (Neu-Transkription des Exports)

Fehlend: –

Zusätzlich gehört: „TikTok“ @13.04s

Abweichend (oft nur Hörfehler von whisper): „Ticktockshop.“→„Shop!“

## Kontaktbögen

- Schnitte (je Schnitt: letztes Bild davor | erstes danach): qa/vorschau-schnittplan-v006/kontakt-schnitte.jpg
- Untertitel: qa/vorschau-schnittplan-v006/kontakt-untertitel.jpg

## Offen – braucht menschliche Sichtung

- [ ] Anhören: klingt jeder Schnitt natürlich (Atem, Satzmelodie, kein abgehackter Ausklang)?
- [ ] Untertitel lesen: stimmt jeder Block mit dem Gesprochenen überein (v. a. Produkt-/Markennamen)?
- [ ] Produkt: wirkt es im Export exakt wie in der Aufnahme (Farbe, Form, Teile) – nichts verdeckt oder abgeschnitten?
- [ ] Gesichter und Produkt nicht von Text verdeckt? Text in der Safe Zone?
- [ ] Aussagen in Einblendungen: alles im Video gesagt oder belegt? Keine Preise/Rabatte/Superlative?
