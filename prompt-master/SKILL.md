---
name: prompt-master
description: |
  Optimierte Copy-Ready Prompts für 15+ AI-Tools in Sekunden generieren. Unterstützt Claude, ChatGPT, Gemini, Cursor, Windsurf, Midjourney, DALL-E, v0, Lovable, Bolt, n8n, Zapier, Make, Sora, Runway, ComfyUI und mehr. Nutze diesen Skill IMMER wenn du einen Prompt schreiben, optimieren oder für ein spezifisches AI-Tool anpassen möchtest — egal ob eigene Idee oder Überarbeitung eines bestehenden Prompts. Der Skill stellt 1-2 Fragen wenn nötig, liefert sonst direkt copy-ready Output mit Markdown-Sections (Framework + Prompt + Pro-Tips) wo es Sinn macht.
---

# Prompt-Master

## Ziel
Liefere copy-ready Prompts für 15+ AI-Tools in unter 30 Sekunden — iterativ smart, schnell präzise.

## Workflow

### Phase 1: Input verstehen (5-10 Sekunden)
Lese den User-Input:
- **Klar & spezifisch?** → direkt zu Phase 2
- **Zu vage** (z.B. "Schreib mir einen Prompt") → 1-2 Smart-Fragen:
  - "Welches Tool? (z.B. ChatGPT, Midjourney, n8n)"
  - "Welches Thema/Problem?" (falls nicht klar)
- **Bestehendes Tool/Prompt wird erwähnt?** → adaptieren, nicht neu schreiben

### Phase 2: Framework wählen (automatisch)
Basierend auf Tool + Usecase: Framework aus `references/frameworks.json` laden.

Tool-Kategorien:
- **LLMs:** Claude, ChatGPT, Gemini
- **Code/IDE:** Cursor, Windsurf
- **Images:** Midjourney, DALL-E
- **Web/UI:** v0, Lovable, Bolt
- **Automation:** n8n, Zapier, Make
- **Video:** Sora, Runway
- **Workflows:** ComfyUI

### Phase 3: Copy-Ready Output (10-20 Sekunden)
**Format für jeden Tool-Typ:**

```
# [Tool-Name] Prompt
## Framework
[1-2 Sätze: Die Logik hinter diesem Prompt]

## Prompt (kopieren & einfügen)
[EXACT COPY-READY TEXT]

## Pro-Tips
- Tip 1 (konkret, messbar)
- Tip 2 (häufige Fehler vermeiden)
- Tip 3 (Optimierungsmöglichkeiten)
```

### Phase 4: Optional Iterieren
User gibt Feedback → Revision in Phase 3.

---

## Tool-spezifische Regeln

### Claude
- **Style:** Detailed, step-by-step, Denken erlauben
- **Anti-Pattern:** Zu viele Constraints gleichzeitig
- **Pro:** XML Tags, Examples in Context

### ChatGPT
- **Style:** Clear, structured, Persona optional
- **Anti-Pattern:** Zu lange Prompts (>500 Wörter)
- **Pro:** Role-playing, Few-shot Examples

### Gemini
- **Style:** Conversational, nuance-aware
- **Anti-Pattern:** Ambiguity
- **Pro:** Multimodal context (Text + Images + Tables)

### Cursor / Windsurf
- **Style:** Code-first, Fehlerbehandlung wichtig
- **Anti-Pattern:** Fehlende Kontextwerte
- **Pro:** Codebase-Context, Refactoring-Instructions

### Midjourney
- **Style:** Beschreibung + Stil + Parameter
- **Anti-Pattern:** Zu viele Adjektive (Spam)
- **Pro:** "/imagine", "--ar", "--quality", "--niji"

### DALL-E
- **Style:** Detailliert, stilistisch, Photorealism/Art
- **Anti-Pattern:** Copyright-Namen, Zu viele Negatives
- **Pro:** Style Keywords, Lighting Details

### v0 / Lovable / Bolt
- **Style:** UI-Intent + Tech Stack + Constraints
- **Anti-Pattern:** Vague Designs ("make it nice")
- **Pro:** Component Lists, Tailwind Classes, Accessibility

### n8n / Zapier / Make
- **Style:** Trigger → Action → Bedingungen
- **Anti-Pattern:** Zu komplexe Workflows ohne Breakpoints
- **Pro:** Error Handling, Data Mapping, Logging

### Sora / Runway
- **Style:** Scene Descriptions, Motion Keywords, Duration
- **Anti-Pattern:** Conflicting Actions
- **Pro:** Camera Movements, Lighting, Pacing

### ComfyUI
- **Style:** Node-Logic, Sampler-Settings, Seed-Info
- **Anti-Pattern:** Zu viele Node-Chains ohne Failsafes
- **Pro:** Negative Prompts, Model Stacking, LoRA Loading

---

## Output-Template (Universal)

```markdown
# [Tool] Prompt für [Usecase]

## Framework
[Kurze Logik]

## Copy-Ready Prompt
[EXACT CODE]

## Pro-Tips
- [Konkret + Messbar]
- [Häufiger Fehler + Fix]
- [Optimierungshebel]

## Optional: Varianten
[Wenn sinnvoll: A/B Alternativen für unterschiedliche Outputs]
```

---

## Trigger-Beispiele (Wann benutzen?)

✓ "Optimier diesen ChatGPT-Prompt: ..."
✓ "Schreib mir einen n8n-Workflow-Prompt für ..."
✓ "Midjourney: Wie beschreibe ich ein Charakter-Design?"
✓ "Make einen Cursor-Refactoring-Prompt aus dieser Code-Base"
✓ "/prompt-master Ich brauch einen DALL-E-Prompt für ..."

❌ Einfache Fragen (z.B. "Was ist ein Prompt?") → normale Antwort
❌ Code-Debugging ohne Prompt-Kontext → Cursor/Windsurf direkter

---

## Fehlerbehandlung

| Problem | Lösung |
|---------|--------|
| User nennt Tool nicht | "Welches Tool? (Claude, ChatGPT, Midjourney...)" |
| Usecase zu vage | "Was genau soll der Prompt bewirken?" |
| Bestehender Prompt → Neuer Tool | "Adaptiere den Prompt: [alter] → neuer Tool: [Tool]" |
| User unzufrieden | "Was passt nicht? (Länge? Stil? Output-Format?)" |

---

## Performance
- **Ziel:** <30 Sekunden bis Copy-Ready Output
- **Fragen:** Nur wenn zwingend nötig (max. 2)
- **Iterationen:** 1 Revision im Basis-Prompt, dann User muss Details klären

✓done wenn User sagt "passt" oder Prompt kopiert hat.
