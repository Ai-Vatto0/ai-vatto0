# QA-Bericht vorschau-schnittplan-v004

**Gesamt: WARNUNG** · Plan `schnittplan` · 30.9.2026, 17:10:29

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
| b2 | Bild-Versatz | OK | 0 Frames (Unterschied 8.37/7.98/8.05/8.65/8.31/6.92/8.24/7.82/7.75/8.37/8.22) |
| b3 | Ton-Versatz | OK | 0 ms, Korrelation 1.00 |
| b3 | Ton einfach (nicht doppelt) | OK | Pegel Export−Quelle -0.0 dB (doppelte Spur ≈ +6 dB) |
| b3 | Bild-Versatz | OK | 0 Frames (Unterschied 8.39/8.27/7.25/8.34/8.49/6.85/8.45/8.30/7.69/8.39/8.35) |
| b4 | Ton-Versatz | OK | 0 ms, Korrelation 1.00 |
| b4 | Ton einfach (nicht doppelt) | OK | Pegel Export−Quelle -0.0 dB (doppelte Spur ≈ +6 dB) |
| b4 | Bild-Versatz | OK | 0 Frames (Unterschied 9.73/9.55/8.86/9.70/9.84/8.17/9.85/9.56/9.17/10.00/9.98) |
| b5 | Ton-Versatz | OK | 0 ms, Korrelation 1.00 |
| b5 | Ton einfach (nicht doppelt) | OK | Pegel Export−Quelle -0.1 dB (doppelte Spur ≈ +6 dB) |
| b5 | Bild-Versatz | OK | 0 Frames (Unterschied 2.09/1.93/2.42/2.71/3.02/1.55/2.80/2.92/2.13/2.94/2.92) |
| schnitt 1 (b1→b2) | Stille am Schnitt | OK | max -120.0 dB bei 4.104 s (Sprachschwelle -39.331 dB) |
| schnitt 2 (b2→b3) | Stille am Schnitt | OK | max -120.0 dB bei 7.007 s (Sprachschwelle -39.331 dB) |
| schnitt 3 (b3→b4) | Stille am Schnitt | OK | max -120.0 dB bei 9.376 s (Sprachschwelle -39.331 dB) |
| schnitt 4 (b4→b5) | Stille am Schnitt | OK | max -120.0 dB bei 12.379 s (Sprachschwelle -39.331 dB) |
| grafik | Safe Zone (oben 150, rechts 140, unten 400, links 60) | OK | 18 Zeitpunkte geprüft |
| untertitel | Untertitel = Gehörtes (exakt) | WARNUNG | ut10 @10.896s „Getränkehalter“ ≠ gehört „meinen Getränkealter im Auto.“ → Sichtung: Hörfehler von whisper oder falscher Untertitel? |
| transkript | Wortfolge Export = Plan | OK | 95 % übereinstimmend; fehlend 0 (davon am Schnitt 0), zusätzlich 1, abweichend 1 |

## Wortvergleich (Neu-Transkription des Exports)

Fehlend: –

Zusätzlich gehört: „TikTok“ @13.04s

Abweichend (oft nur Hörfehler von whisper): „Ticktockshop.“→„Shop!“

## Kontaktbögen

- Schnitte (je Schnitt: letztes Bild davor | erstes danach): qa/vorschau-schnittplan-v004/kontakt-schnitte.jpg
- Untertitel: qa/vorschau-schnittplan-v004/kontakt-untertitel.jpg

## Offen – braucht menschliche Sichtung

- [ ] Anhören: klingt jeder Schnitt natürlich (Atem, Satzmelodie, kein abgehackter Ausklang)?
- [ ] Untertitel lesen: stimmt jeder Block mit dem Gesprochenen überein (v. a. Produkt-/Markennamen)?
- [ ] Produkt: wirkt es im Export exakt wie in der Aufnahme (Farbe, Form, Teile) – nichts verdeckt oder abgeschnitten?
- [ ] Gesichter und Produkt nicht von Text verdeckt? Text in der Safe Zone?
- [ ] Aussagen in Einblendungen: alles im Video gesagt oder belegt? Keine Preise/Rabatte/Superlative?
