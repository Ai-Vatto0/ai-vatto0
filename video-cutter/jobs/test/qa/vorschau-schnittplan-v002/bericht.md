# QA-Bericht vorschau-schnittplan-v002

**Gesamt: OK** · Plan `schnittplan` · 30.9.2026, 16:58:28

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
| b1 | Bild-Versatz | OK | 0 Frames (Unterschied 5.57/5.65/5.41/5.38/5.59/5.22/5.41/5.51/5.95/5.97/5.93) |
| b2 | Ton-Versatz | OK | 0 ms, Korrelation 1.00 |
| b2 | Ton einfach (nicht doppelt) | OK | Pegel Export−Quelle -0.0 dB (doppelte Spur ≈ +6 dB) |
| b2 | Bild-Versatz | OK | 0 Frames (Unterschied 10.33/10.18/10.22/10.62/10.29/9.98/10.30/10.15/10.12/10.38/10.26) |
| b3 | Ton-Versatz | OK | 0 ms, Korrelation 1.00 |
| b3 | Ton einfach (nicht doppelt) | OK | Pegel Export−Quelle -0.0 dB (doppelte Spur ≈ +6 dB) |
| b3 | Bild-Versatz | OK | 0 Frames (Unterschied 8.90/8.92/8.83/8.86/9.16/8.65/9.06/9.09/9.14/9.18/9.14) |
| b4 | Ton-Versatz | OK | 0 ms, Korrelation 1.00 |
| b4 | Ton einfach (nicht doppelt) | OK | Pegel Export−Quelle -0.0 dB (doppelte Spur ≈ +6 dB) |
| b4 | Bild-Versatz | OK | 0 Frames (Unterschied 10.50/10.40/10.31/10.47/10.70/10.06/10.62/10.56/10.60/10.78/10.81) |
| b5 | Ton-Versatz | OK | 0 ms, Korrelation 1.00 |
| b5 | Ton einfach (nicht doppelt) | OK | Pegel Export−Quelle -0.1 dB (doppelte Spur ≈ +6 dB) |
| b5 | Bild-Versatz | OK | 0 Frames (Unterschied 3.14/2.97/3.48/3.75/4.07/2.60/3.85/3.97/3.17/3.99/3.96) |
| schnitt 1 (b1→b2) | Stille am Schnitt | OK | max -120.0 dB bei 4.104 s (Sprachschwelle -39.331 dB) |
| schnitt 2 (b2→b3) | Stille am Schnitt | OK | max -120.0 dB bei 7.007 s (Sprachschwelle -39.331 dB) |
| schnitt 3 (b3→b4) | Stille am Schnitt | OK | max -120.0 dB bei 9.376 s (Sprachschwelle -39.331 dB) |
| schnitt 4 (b4→b5) | Stille am Schnitt | OK | max -120.0 dB bei 12.379 s (Sprachschwelle -39.331 dB) |
| transkript | Wortfolge Export = Plan | OK | 95 % übereinstimmend; fehlend 0 (davon am Schnitt 0), zusätzlich 1, abweichend 1 |

## Wortvergleich (Neu-Transkription des Exports)

Fehlend: –

Zusätzlich gehört: „TikTok“ @13.04s

Abweichend (oft nur Hörfehler von whisper): „Ticktockshop.“→„Shop!“

## Kontaktbögen

- Schnitte (je Schnitt: letztes Bild davor | erstes danach): qa/vorschau-schnittplan-v002/kontakt-schnitte.jpg
- Untertitel: qa/vorschau-schnittplan-v002/kontakt-untertitel.jpg

## Offen – braucht menschliche Sichtung

- [ ] Anhören: klingt jeder Schnitt natürlich (Atem, Satzmelodie, kein abgehackter Ausklang)?
- [ ] Untertitel lesen: stimmt jeder Block mit dem Gesprochenen überein (v. a. Produkt-/Markennamen)?
- [ ] Produkt: wirkt es im Export exakt wie in der Aufnahme (Farbe, Form, Teile) – nichts verdeckt oder abgeschnitten?
- [ ] Gesichter und Produkt nicht von Text verdeckt? Text in der Safe Zone?
- [ ] Aussagen in Einblendungen: alles im Video gesagt oder belegt? Keine Preise/Rabatte/Superlative?
