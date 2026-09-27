# video-edit – TikTok-Schnitt mit Remotion

Ablauf, Regeln und Safe Zone: `../memory/regeln/video-schnitt-workflow.md`

```bash
npm i                                                   # einmalig
npx remotion studio                                     # Vorschau im Browser
npx remotion render SmokeTest out/test.mp4              # rendern
npx remotion still SmokeTest out/f.png --frame=45       # Einzelframe prüfen
```

- Eigene Clips → `public/` · Ausgaben → `out/` (nicht im Git)
- `SmokeTest` ist nur der Funktionstest (9:16 + Safe-Zone-Rahmen)
- Remotion ist kostenlos für Einzelpersonen und Teams bis 3 Personen
