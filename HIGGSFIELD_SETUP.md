# Higgsfield MCP Setup – Schnellstart

## Was ist Higgsfield?
KI-Video-Generator für App-Promo-Videos (B-Roll + iPhone-Mockups + Seedance 2.0 Animationen).
**Unabhängig von Kie.ai** – nur für Marketing/Promo-Videos.

---

## 1️⃣ Account & API-Key

```
https://higgsfield.ai
→ Sign up (kostenlos)
→ Dashboard → API Keys
→ Kopiere: HIGGSFIELD_API_KEY
```

---

## 2️⃣ MCP in Claude Code eintragen

**Option A: Über UI**
```
Claude Code → Settings → MCP Servers → Add Server
Name: higgsfield
Command: npx
Args: @higgsfield/mcp
Env-Variable: HIGGSFIELD_API_KEY = <dein_key_hier>
```

**Option B: Config-Datei (empfohlen)**
```
Datei: C:\Users\rober\ki-app\higgsfield-mcp-config.json
Nutze die fertige Config-Datei (siehe oben)
API-Key eintragen und fertig
```

---

## 3️⃣ In Claude Code / Chat nutzen

**Prompt-Template:**
```
Erstelle ein App-Promo-Video für meine Snova-App.
- App-URL: [URL eintragen]
- Oder: [Screenshot hochladen]
- Nutze Higgsfield MCP
- Output: MP4 mit B-Roll + iPhone-Mockup
```

**Claude wird dann:**
1. Deine App analysieren
2. Video-Prompts automatisch schreiben
3. Seedance 2.0 triggern
4. MP4 in Output-Folder speichern

---

## 4️⃣ Video-Ausgabe

**Output-Ordner:**
```
C:\Users\rober\ki-app\promo-videos\
```
(Wird automatisch erstellt)

**Fertige MP4s ready für:**
- Instagram Reels
- TikTok
- YouTube Shorts
- App Store Listings

---

## ⚡ Wichtig: Trennung der Pipelines

| Feature | API | Zweck |
|---|---|---|
| **Charakter-Videos** | Kie.ai | In-App Story-Videos (Snova Feature) |
| **Promo-Videos** | Higgsfield | Marketing der App selbst |

**Beide laufen parallel, beeinflussen sich nicht.**

---

## 🐛 Troubleshooting

**MCP lädt nicht?**
```
Claude Code neu starten
oder
npx @higgsfield/mcp --version
(Test ob Package installiert)
```

**API-Key invalid?**
```
Higgsfield-Dashboard prüfen
Key neu generieren
Config-Datei aktualisieren
```

**Kein Output?**
```
Output-Ordner manuell erstellen:
mkdir C:\Users\rober\ki-app\promo-videos\
```

---

## 📝 Nächster Schritt

```bash
# 1. Higgsfield Account erstellen
# 2. API-Key in higgsfield-mcp-config.json eintragen
# 3. Claude Code neu starten
# 4. Prompt mit App-URL geben

Fertig – Videos generieren sich selbst! 🎬
```
