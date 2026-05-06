# TikTok Shop Product Video Framework
**Standalone Prompt-Generator für Produkt-Werbung**
**Zu nutzen mit Claude + KIE.ai**

---

## Schnellstart: So funktioniert es

Du schreibst mir:
> "Charakter: Trusted Guy 40-50, Produkt: Bohrer Pro 20V, Action: Drilling, Hook: Problem-Solution, Dauer: 6s"

Ich generiere dir:
> [Ein perfekter, ein-Klick-Prompt für KIE.ai Grok Imagine Multi-Image]

Du kopierst → in KIE.ai paste → Video fertig.

---

## Part 1: CHARACTER-DNA LIBRARY

### Character #1: "Trusted Guy 40-50"
```
Name: Trusted Guy 40-50
Age: 40-50 Jahre
Look: Mittleres graues Haar, Arbeitskleidung (Werkstatt/Handwerk)
Archetype: Vertrauenswürdiger Nachbartyp, der weiß, was er tut
Voice: Direkt, authentisch, seriös, keine Schauspielerei
Mood: Ruhig, kompetent, ehrlich

PROMPT-SNIPPET:
"Ein 45-50-jähriger Mann mit grauem Haar, legerer Arbeitskleidung 
(Hemd + Weste), steht in einer Werkstatt/Home-Setting. 
Er schaut direkt zur Kamera. Sein Ausdruck: vertrauenswürdig, kompetent, ehrlich.
NICHT zu jung. NICHT zu emotional. NICHT schauspielernisch."

REF-IMAGES: [add your URLs]
- front_view_casual.jpg
- side_view_working.jpg
- closeup_face.jpg
```

### Character #2: [Add more as needed]

---

## Part 2: PRODUCT-DNA LIBRARY

### Product #1: "Bohrer Pro 20V"
```
Product Name: Bohrer Pro 20V
Product ID: drill_pro_20v_2026
Category: Power Tools

Description: Profi-Akkubohrer, 20V, LED-Display, ergonomisches Design

KEY FEATURES (müssen sichtbar sein):
- 20V Akku (entnehmbar, gut sichtbar)
- LED-Display/Anzeige
- Ergonomische Griff-Form
- Schlagbohr-Funktion (optional)
- Charger-Port

VISUAL RULES (ABSOLUT):
- Immer von vorne oder rechts filmen
- Niemals beschädigt, keine Kratzer
- LED-Display IMMER klar sichtbar
- Akku gut positioniert (damit man sieht, dass es austauschbar ist)
- Farben authentisch (keine Farb-Shifts)
- Hintergrund neutral (werkstatt oder grauer Background)

BRAND COLOR: #FF6B35 (optional im UI)

PROMPT-SNIPPET:
"Ein hochwertiger 20V Akkubohrer. Alle Details sichtbar: 
LED-Display oben, ergonomischer Griff, 20V Akku deutlich sichtbar. 
Professionelle Renderqualität, 4K-Details, KEINE Fehler, KEINE Kratzer."

REF-IMAGES: [add your URLs]
- front_view.jpg
- side_view.jpg
- detail_display.jpg
- detail_akku.jpg
```

### Product #2: [Add more products]

---

## Part 3: VIDEO-HOOK-TEMPLATES

### Hook Template 1: "Problem-Solution" (6 Sekunden)
```
Duration: 6 Sekunden
Format: Problem gezeigt → Charakter spricht → Lösung (Produkt)

TIMING BREAKDOWN:
0-1s: MEGA-HOOK (absolute Aufmerksamkeit)
1-4s: Charakter erklärt/spricht
4-6s: Produkt Zora-Quality zeigen

HOOK EXAMPLES (0-1s):
- Charakter sagt: "Ich brauch einen Bohrer, der hält."
- Oder: Bohrer fahrt durch Material → SPLITTER (schlechter Bohrer) vs. SAUBER (guter Bohrer)
- Oder: Close-up auf beschädigten alten Bohrer → "Nicht mehr."

PERSON SECTION (1-4s):
Charakter: [Character Name]
Action: [z.B. "working with drill" oder "explaining"]
Script-Beispiel:
"Ich nutze täglich Bohrer. Billige? Halten zwei Wochen.
Dieser hier? Seit zwei Jahren, kein Problem. Warum?
Schau dir diese 20V an. Diese Kraft. Und das LED-Display – ich seh sofort, 
wie viel Akku ich noch hab."

PRODUCT SECTION (4-6s):
Slow 360°-Rotation oder Detail-Zoom des Produkts.
Alle Features sichtbar (LED, Akku, Griff).
Musik: Energetisch, Hook-unterstützend.
ZORA-QUALITÄT: 4K, keine Fehler.

END (optional, wenn Zeit):
"Link in Bio" oder Produktlink.
```

### Hook Template 2: "Demo" (10 Sekunden)
```
0-1s: MEGA-HOOK (z.B. Bohrer durchbohrt Material perfekt)
1-3s: Setup (Charakter zeigt, was er tun wird)
3-7s: DEMO (Bohrer in Aktion, saubere Ergebnisse)
7-10s: Produkt-Close-Up + CTA
```

### Hook Template 3: "Testimonial" (15 Sekunden)
```
0-1s: Hook (Charakter sagt: "Ich vertrau diesem Bohrer")
1-8s: Charakter redet über Erfahrung (persönlich, echt)
8-12s: Produkt-Details
12-15s: CTA + Verkaufslink
```

---

## Part 4: GLOBALE CONSTRAINTS (immer gelten)

```
🔴 ABSOLUT RULES:
1. HOOK 0-1s: Mega. Keine langsamen Starts. User muss sofort aufpassen.
2. CHARACTER KONSISTENZ: Dieser Mann ist IMMER dieser Mann.
   Gleiche Haarfarbe, Kleidung, Stimme, Ausstrahlung.
   KEINE Variationen von Video zu Video.
3. PRODUKT KONSISTENZ: Das Produkt sieht EXAKT gleich aus in jedem Video.
   KEINE Farbveränderungen, KEINE fehlenden Details, KEINE neuen Kratzer.
4. VIDEO FORMAT: 9:16 vertical, 720p minimum, 24fps.
5. NO ERRORS: Keine Glitches, keine Artefakte, keine beschädigten Assets.
6. AUTHENTIZITÄT: Charakter spricht DIREKT, nicht schauspielernisch.
   Vertrauenswürdig, nicht zu emotional.
7. MUSIK: Hook-unterstützend, energetisch, nicht ablenkend.
8. TEXT-OVERLAYS: Max 2-3 Wörter, groß, gut lesbar.
9. KEINE SCHNITTE: Kontinuierlicher Flow.
10. ANTI-DRIFT: Maximal 2-3 Videos pro Produkt mit gleichem Character.
    Dann: Neuer Character oder neues Produkt.
```

---

## Part 5: VERWENDUNG - PROMPT FÜR CLAUDE

### Du schreibst:
```
Charakter: Trusted Guy 40-50
Produkt: Bohrer Pro 20V
Hook: Problem-Solution
Aktion: Explaining/Working
Szene: Werkstatt
Dauer: 6s
```

### Ich generiere (Beispiel):
```
[MEGA-HOOK 0-1s]
Ein 45-50-jähriger Mann mit grauem Haar, legerer Arbeitskleidung, 
steht in einer Werkstatt. Er schaut direkt zur Kamera und sagt:
"Ich brauch einen Bohrer, der hält. Dieser hier? Seit zwei Jahren täglich."

[PERSON-SECTION 1-4s]
Character: Trusted Guy 40-50
Action: Explaining
Script: "Ich nutze täglich Bohrer. Billige halten zwei Wochen. Dieser hier, 
schau die 20V an. Diese Kraft. Und das LED-Display – ich seh sofort, 
wie viel Akku übrig ist."
Ton: Direkt, authentisch, vertrauenswürdig.

[PRODUKT-SECTION 4-6s - ZORA QUALITÄT]
Produkt: Bohrer Pro 20V
Visuelle Regeln: Immer von vorne/rechts, LED-Display sichtbar, Akku deutlich, 
KEINE Fehler, 4K-Qualität.
Kamera: Langsame 360°-Rotation oder Detail-Zoom auf LED + Akku.
Musik: Energetisch, Hook-unterstützend.
Reference Images: [front_view.jpg, side_view.jpg, detail_display.jpg]

[KIE.AI API READY]
Model: grok-imagine/reference-to-video
Reference Images: 4 URLs (Character + Product)
Aspect Ratio: 9:16
Duration: 6s
Resolution: 720p
```

---

## Part 6: DATENBANK (einfach lokal)

Speichere diese Datei als `TIKTOK_SHOP_ASSETS.json`:

```json
{
  "characters": [
    {
      "id": "trusted_guy_40_50",
      "name": "Trusted Guy 40-50",
      "age": "40-50",
      "description": "Vertrauenswürdiger Handwerker, grau, Arbeitskleidung",
      "ref_images": ["url1", "url2", "url3"],
      "prompt_snippet": "Ein 45-50-jähriger Mann mit grauem Haar..."
    }
  ],
  "products": [
    {
      "id": "drill_pro_20v",
      "name": "Bohrer Pro 20V",
      "category": "Power Tools",
      "features": ["20V", "LED-Display", "Ergonomisch"],
      "visual_rules": "Immer von vorne/rechts, keine Fehler",
      "ref_images": ["front.jpg", "side.jpg", "detail.jpg"],
      "prompt_snippet": "Hochwertiger 20V Akkubohrer, alle Details sichtbar..."
    }
  ],
  "hooks": [
    {
      "id": "problem_solution_6s",
      "name": "Problem-Solution",
      "duration": 6,
      "structure": "Hook 0-1s → Person 1-4s → Product 4-6s"
    }
  ]
}
```

---

## Part 7: WORKFLOW

```
1. Du sagst mir: "Charakter: X, Produkt: Y, Hook: Z, Aktion: A"
2. Ich lese FRAMEWORK + ASSETS.json
3. Ich baue den finalen Prompt (mit allen Constraints, References)
4. Ich gebe dir: KIE.ai-ready Prompt
5. Du kopierst → KIE.ai Grok Imagine → Video
6. Ich helfe bei Iterationen (zu langsam? zu schnell? mehr Emphasis?)
```

---

## Quick Reference

| Charakter | Produkt | Hook | Dauer | Coins (KIE) |
|-----------|---------|------|-------|-------------|
| Trusted Guy 40-50 | Bohrer Pro 20V | Problem-Solution | 6s | 100 |
| Trusted Guy 40-50 | Bohrer Pro 20V | Demo | 10s | 150 |
| [Add more] | [Add more] | [Add more] | [Add more] | [Add more] |

---

**STATUS:** Framework ready. Add Characters, Products, Hooks → tell Claude what you want → I generate Prompt.

Ready to create TikTok Shop ads?
