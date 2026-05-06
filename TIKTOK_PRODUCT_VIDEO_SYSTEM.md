# TikTok Product-Video System für Snova Studio
**One-Click Prompt für konsistente Produkt-Werbung mit Character-DNA**

---

## 1. Datenmodell: Character + Product + Hook

### 1.1 Character-DNA Table
```sql
CREATE TABLE character_dna_tiktok (
  id INTEGER PRIMARY KEY,
  name TEXT,
  age_range TEXT,         -- "40-50"
  appearance TEXT,        -- "mittleres graues Haar, Arbeitskleidung"
  archetype TEXT,         -- "vertrauenswürdiger Nachbartyp"
  voice_tone TEXT,        -- "direkt, authentisch, seriös"
  reference_images TEXT,  -- JSON array URLs
  prompt_snippet TEXT,    -- "ein 45-50j Mann mit grauem Haar in Arbeitskluft..."
  created_at TIMESTAMP
);
```

### 1.2 Product-DNA Table
```sql
CREATE TABLE product_dna_tiktok (
  id INTEGER PRIMARY KEY,
  product_name TEXT,      -- "Bohrer XY"
  product_id TEXT,        -- z.B. "drill_pro_2026"
  description TEXT,       -- "Profi-Akkubohrer, 20V, LED-Display"
  key_features JSON,      -- ["20V Akku", "LED", "Ergonomisch"]
  visual_rules TEXT,      -- "immer von vorne/rechts, niemals beschädigt"
  reference_images TEXT,  -- JSON array URLs (Produkt aus verschiedenen Winkeln)
  brand_color TEXT,       -- "#FF6B35"
  prompt_snippet TEXT,    -- "hochwertiger Bohrer, Details sichtbar, keine Fehler"
  created_at TIMESTAMP
);
```

### 1.3 Video-Hook-Templates Table
```sql
CREATE TABLE video_hook_templates (
  id INTEGER PRIMARY KEY,
  hook_type TEXT,         -- "problem-solution", "demo", "testimonial"
  duration_seconds INT,   -- 6, 10, 15
  hook_prompt TEXT,       -- "0-1s: Problem zeigen / Hook-Text"
  person_prompt TEXT,     -- "1-4s: Person spricht / macht was"
  product_prompt TEXT,    -- "4-6s: Produkt Zora-style zeigen"
  end_prompt TEXT,        -- optional weitere Sekunden
  hook_keywords JSON,     -- ["mega Hook", "Aufmerksamkeit", "sofort"]
  created_at TIMESTAMP
);
```

---

## 2. One-Click Master-Prompt Generator

### 2.1 Cloud Code Function: `buildTikTokProductPrompt()`
```typescript
interface TikTokProductVideoInput {
  character_id: number;
  product_id: number;
  hook_template_id: number;
  action: string;          // z.B. "drilling", "explaining", "showing"
  scene_context?: string;  // "workshop", "home", "outdoor"
}

async function buildTikTokProductPrompt(input: TikTokProductVideoInput): Promise<string> {
  // 1. Daten laden
  const character = await getCharacterDNA(input.character_id);
  const product = await getProductDNA(input.product_id);
  const template = await getHookTemplate(input.hook_template_id);

  // 2. Mega-Hook (0-1s)
  const hookSection = `
    HOOK (0-1 SEKUNDE - MAXIMUM ATTENTION):
    Ein 45-50-jähriger Mann mit grauem Haar, Arbeitskleidung, steht in einer ${input.scene_context || 'Werkstatt'}.
    ER SAGT SOFORT: "${template.hook_keywords[0]}" oder zeigt eine starke visuelle Hook (z.B. Bohrer durch Holz fahren).
    ZIEL: Zuschauer stoppt scrolling in 0.5 Sekunden.
    MEGA-HOOK-REGEL: Bewegung, Überraschung oder starker Satz. NICHT langsam starten.
  `;

  // 3. Person-Section (1-4s)
  const personSection = `
    PERSON-SECTION (1-4 SEKUNDEN):
    Character: ${character.prompt_snippet}
    Aktion: ${input.action}
    Authentizität: Der Mann spricht direkt zur Kamera, keine Skripte, vertrauenswürdig.
    BEISPIEL: "Ich brauch nen Bohrer, der hält. Dieser hier? Ganz ehrlich..."
    Ton: ${character.voice_tone} - direkt, nicht zu schnell.
  `;

  // 4. Produkt-Section (4-6s) - ZORA-STYLE
  const productSection = `
    PRODUKT-SEKTION (4-6 SEKUNDEN - ZORA-STYLE, KEIN FEHLER):
    Produkt: ${product.product_name}
    Visuelle Regeln: ${product.visual_rules}
    Detailsicht: Alle Key-Features sichtbar: ${product.key_features.join(", ")}
    Kamera: Langsame 360°-Drehung oder Detail-Zoom, professionell.
    Farben: Authentisch, Brand-Color ${product.brand_color} unterstützen.
    KONSISTENZ: Dieses Produkt sieht EXAKT so aus wie in allen anderen Videos. KEINE Fehler, keine Variationen.
    ZORA-QUALITÄT: Professionelle Renderqualität, 4K-Details, keine Artefakte.
  `;

  // 5. Optional: Outro/CTA (6+ Sekunden)
  const outroSection = template.end_prompt ? `
    OUTRO (6+ SEKUNDEN, OPTIONAL):
    ${template.end_prompt}
    CTA: "Link in Bio" oder "Jetzt kaufen" oder ähnlich.
  ` : '';

  // 6. Constraints & Qualitätsregeln
  const constraints = `
    ===== GLOBALE CONSTRAINTS =====
    1. HOOK ABSOLUTE RULE: Sekunde 0-1 muss mega sein. Keine Einführung.
    2. CHARACTER KONSISTENZ: Dieser Mann ist IMMER dieser Mann. Gleicher Look, Stimme, Ausstrahlung.
    3. PRODUKT KONSISTENZ: Das Produkt sieht IMMER exakt gleich aus. Keine Color-Shifts, keine fehlenden Details.
    4. VERTICAL VIDEO: 9:16, native mobile format.
    5. MUSIK/SOUND: Hook-Sound muss SOFORT Aufmerksamkeit erzeugen.
    6. TEXT-OVERLAY: Max 2-3 Wörter, groß, gut lesbar, Hook-Supporting.
    7. DURATION: ${template.duration_seconds} Sekunden exakt.
    8. KEINE SCHNITTE, KEINE ÜBERTREIBUNGEN: Authentisch, real, vertrauenswürdig.
    9. KEINE FEHLER IM PRODUKT: Kratzer, Beschädigungen, fehlende Details sind ausgeschlossen.
  `;

  // 7. Zusammensetzen
  const finalPrompt = `
    ${hookSection}
    ${personSection}
    ${productSection}
    ${outroSection}
    ${constraints}
    
    VIDEO MODEL: Grok Imagine reference-to-video oder Veo 3.1 Fast
    REFERENCE IMAGES:
    - Character Ref 1: ${character.reference_images[0]}
    - Character Ref 2: ${character.reference_images[1]}
    - Product Ref 1: ${product.reference_images[0]}
    - Product Ref 2: ${product.reference_images[1]}
    
    ASPECT RATIO: 9:16
    RESOLUTION: 720p minimum
  `;

  return finalPrompt;
}
```

---

## 3. Backend API Endpoints

### 3.1 POST `/api/tiktok/videos/create`
```json
{
  "character_id": 1,
  "product_id": 1,
  "hook_template_id": 1,
  "action": "drilling",
  "scene_context": "workshop"
}

RESPONSE:
{
  "video_id": "video_tiktok_12345",
  "task_id": "kie_task_xyz",
  "status": "generating",
  "estimated_duration": "60 seconds",
  "prompt_used": "... (full prompt above)"
}
```

### 3.2 POST `/api/tiktok/character-dna/create`
```json
{
  "name": "Trusted Neighbor Type",
  "age_range": "40-50",
  "appearance": "mittleres graues Haar, Arbeitskleidung",
  "archetype": "vertrauenswürdiger Nachbartyp",
  "voice_tone": "direkt, authentisch, seriös",
  "reference_images": ["url1", "url2"],
  "prompt_snippet": "ein 45-50j Mann mit grauem Haar..."
}
```

### 3.3 POST `/api/tiktok/product-dna/create`
```json
{
  "product_name": "Bohrer Pro 20V",
  "product_id": "drill_pro_2026",
  "description": "Profi-Akkubohrer, 20V",
  "key_features": ["20V Akku", "LED-Display", "Ergonomisch"],
  "visual_rules": "immer von vorne/rechts, niemals beschädigt",
  "reference_images": ["url_front", "url_side"],
  "brand_color": "#FF6B35"
}
```

### 3.4 GET `/api/tiktok/videos/:video_id/status`
Zeigt Status, Final Video URL, Metrics.

---

## 4. Frontend: One-Click UI

```
┌─────────────────────────────────────────┐
│      TikTok Product Video Generator      │
├─────────────────────────────────────────┤
│                                         │
│  Step 1: Choose Character               │
│  ┌─────────────┐                        │
│  │ Trusted Guy │  (40-50, grau, Auth) │
│  └─────────────┘                        │
│                                         │
│  Step 2: Choose Product                 │
│  ┌──────────────┐                       │
│  │ Bohrer Pro   │  (20V, LED, etc.)    │
│  └──────────────┘                       │
│                                         │
│  Step 3: Choose Hook Template            │
│  ⚪ Problem-Solution (6s)               │
│  ⚪ Demo (10s)                          │
│  ⚪ Testimonial (15s)                   │
│                                         │
│  Step 4: Choose Action                   │
│  ⚪ Drilling  ⚪ Explaining  ⚪ Showing │
│                                         │
│  Step 5: Scene (Optional)                │
│  [Workshop] ▼                           │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │  🎬 GENERATE VIDEO - ONE CLICK   │  │
│  └──────────────────────────────────┘  │
│                                         │
│  Cost: 100 Coins (KIE.ai Auto)          │
└─────────────────────────────────────────┘
```

---

## 5. Implementierungsplan

### Phase 1: Backend (diese Woche)
- [ ] SQL Schema in Supabase erstellen
- [ ] `buildTikTokProductPrompt()` Cloud Code schreiben
- [ ] Drei API-Endpoints implementieren (/create, /product-dna, /character-dna)
- [ ] KIE.ai Multi-Image Integration testen

### Phase 2: Frontend (nächste Woche)
- [ ] React Native UI 5-Step Form bauen
- [ ] Video-Status-Polling implementieren
- [ ] Download/Share-Button

### Phase 3: Daten seeden (laufend)
- [ ] Character-DNA: "Trusted Neighbor 40-50" eintragen
- [ ] Product-DNA: Deine Bohrer etc. eintragen
- [ ] Hook Templates: 5-10 Varianten

---

## 6. Kostenstruktur (Coins)

| Action | Coins | USD |
|--------|-------|-----|
| Neues 6s Video (Grok) | 100 | 0,50 |
| Neues 10s Video (Grok) | 150 | 0,75 |
| Veo 3.1 Fast (8s) | 80 | 0,40 |
| Extend +10s (Grok) | 60 | 0,30 |

**Strategy:** Character + Product einmal speichern → unbegrenzt wiederverwendbar. Nur Videorender = Coins.

---

## 7. Qualitätssicherung: Anti-Drift Rules

Damit der Charakter und das Produkt IMMER gleich aussehen:

1. **Character Constraints im Prompt (fest):**
   - Alter, Haarfarbe, Kleidung IMMER identisch
   - Voice/Ton: "direkt, nicht schauspielernisch"
   - Gesichtsausdruck: vertrauenswürdig, nicht zu emotional

2. **Product Constraints im Prompt (fest):**
   - "DIESES Produkt sieht EXAKT so aus wie [Video 1, Video 2, Video 3]"
   - Reference Images IMMER mitgegeben (Multi-Image)
   - "KEINE Farbveränderungen, KEINE neuen Details, KEINE Fehler"

3. **Max 2-3 Videos pro Product**: Dann Kampagne für neues Produkt starten

4. **Monitoring:** Nach jedem Video kurz prüfen: Charakter erkennbar? Produkt konsistent?

---

## 8. Master-Prompt für Zora (Kopier-Passt in Zora-Editor)

```
MEGA-HOOK (0-1s): Ein 45-50-jähriger Mann mit grauem Haar steht in einer Werkstatt.
Er SAGT sofort: "Dieser Bohrer? Hält ewig." oder ähnlich.
KEINE langsamen Intros.

PERSON (1-4s): Der Mann spricht DIREKT zur Kamera.
Beispiel: "Ich brauch einen Bohrer, der nicht nach drei Wochen kaputt ist.
Diesen Bohrer hier? Ich nutz den seit 2 Jahren täglich."
Ton: Authentisch, vertrauenswürdig, seriös. Kein Schauspielerei.

PRODUKT (4-6s): [ZORA QUALITÄT - KEINE FEHLER]
Bohrer Pro 20V wird gezeigt.
Frontal, langsam rotierend. Alle Details sichtbar: 20V Akku, LED-Display, Akku-Slot.
Farbe: Authentisch. Keine Kratzer. Keine Fehler.
Musik: Hook-Sound, energetisch.

CONSTRAINTS:
- Vertical 9:16
- 6 Sekunden exakt
- Character & Produkt exakt konsistent mit Video 1, 2, 3
- Keine Text-Overlays (nur optionaler 2-Wort-Hook-Text)
```

---

## Next: Backend Implementation Start?
