# PROJEKT: HIGGSFIELD (APP-PROMO-VIDEOS)

**Was:** MCP-basierte Pipeline für App-Promo-Videos – cinematic B-Roll +
iPhone-Mockups + Seedance-2.0-Animationen.
**Ort:** `HIGGSFIELD_SETUP.md`, `higgsfield-mcp-config.json`
**Status:** dokumentiert; MCP-Server in dieser Session **nicht** verbunden

---

## STRIKTE TRENNUNG

| Pipeline | Zweck |
|---|---|
| **Kie.ai** | Produkt-/Charaktervideos für TikTok Shop – das Geschäft |
| **Higgsfield** | App-Marketing-Promos – komplett getrennt |

API-Keys liegen in **getrennten** Config-/`.env`-Dateien. Nie vermischen.

## SETUP

1. Account auf `https://higgsfield.ai` → Dashboard → API Keys → `HIGGSFIELD_API_KEY`
2. MCP-Server in Claude Code eintragen:
   - Command: `npx`
   - Args: `@higgsfield/mcp`
   - Env: `HIGGSFIELD_API_KEY=<key>`
   - oder `higgsfield-mcp-config.json` verwenden
3. Nutzung: „Erstelle ein Promo-Video für [URL oder Screenshot]. Nutze Higgsfield MCP:
   B-Roll + iPhone-Mockup + Seedance 2.0."

## OUTPUT

MP4, fertig für Instagram, TikTok und App Store. Setup ca. 2 Minuten,
Generierung dauert Minuten.

## HINWEIS

Aktuell sekundär. Erst relevant, wenn eine eigene App beworben werden soll.
Für TikTok-Shop-Produktwerbung ist das der **falsche** Weg – dort gilt Kie.ai
und Lyra Ads.
