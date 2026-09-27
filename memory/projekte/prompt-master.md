# PROJEKT: PROMPT-MASTER

**Was:** Claude-Skill, der copy-ready Prompts für 15+ AI-Tools generiert.
**Ort:** `prompt-master/SKILL.md` (+ `prompt-master.skill`)
**Status:** vorhanden und einsatzfähig

---

## ZWECK

Optimierte, direkt kopierbare Prompts in unter 30 Sekunden – für eigene Ideen oder
zur Überarbeitung bestehender Prompts.

## UNTERSTÜTZTE TOOL-KATEGORIEN

| Kategorie | Tools |
|---|---|
| LLMs | Claude, ChatGPT, Gemini |
| Code/IDE | Cursor, Windsurf |
| Bilder | Midjourney, DALL-E |
| Web/UI | v0, Lovable, Bolt |
| Automation | n8n, Zapier, Make |
| Video | Sora, Runway |
| Workflows | ComfyUI |

## WORKFLOW

1. **Input verstehen** – klar? → direkt weiter. Zu vage? → 1–2 Smart-Fragen
   (welches Tool, welches Thema). Bestehender Prompt? → adaptieren, nicht neu schreiben.
2. **Framework wählen** – automatisch aus `references/frameworks.json`, passend zu
   Tool + Usecase
3. **Copy-Ready Output** – Framework (1–2 Sätze Logik) + Prompt + Pro-Tips

## VERBINDUNG ZUM HAUPTGESCHÄFT

Nützlich für TikTok-Shop-Arbeit, **aber:** bei Werbeprompts gelten immer die
Lyra-Ads-Regeln vor der allgemeinen Prompt-Master-Logik. Insbesondere das
Zeichenlimit von 2.300 für Grok und der Product Lock.
