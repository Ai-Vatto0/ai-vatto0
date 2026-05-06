# 🚀 FEVZI CLAUDE SETUP – Anfängerleitfaden

Willkommen! Hier ist dein **kompletter Startleitfaden für Cowork + Claude**.

---

## Phase 1: Cowork & Claude Code Installation (5 min)

### 1.1 Claude Desktop installieren
- Download: https://claude.ai/download
- Nach Installation: **Cowork-Mode** aktivieren (rechts oben "Cowork")

### 1.2 Claude Code starten
```bash
# Powershell / Terminal
npx @anthropic-ai/claude-code --setup
```
- Verbindung mit deinem Claude-Account bestätigen
- Projekt-Ordner auswählen: `C:\Users\[dein-name]\ki-app\`

---

## Phase 2: Dein CLAUDE.md Setup (10 min)

### 2.1 Dein Projekt-Verzeichnis erstellen
```bash
mkdir C:\Users\[dein-name]\ki-app\
cd C:\Users\[dein-name]\ki-app\
```

### 2.2 CLAUDE.md kopieren
→ Kopiere **FEVZI_CLAUDE.md** → umbenennen zu **CLAUDE.md** in deinem Projekt-Root

Inhalt anpassen:
```markdown
## IDENTITÄT
Ich bin FEVZI.

## PROJEKT
Name: [Dein App-Name]
Pfad: C:\Users\[dein-name]\ki-app\
GitHub Repo: [deine-repo-url]
```

---

## Phase 3: MCPs + Skills aktivieren (15 min)

### 3.1 **Essenzielle MCPs für KI-Video-Apps**

| MCP | Zweck | Aktivieren in Cowork |
|---|---|---|
| **Higgsfield MCP** | Promo-Videos generieren | ✓ Install |
| **Supabase MCP** | Datenbank + Auth | ✓ Install |
| **GitHub MCP** | Code-Versionierung | ✓ Install |

**Installation:**
```
Cowork → Settings → MCP Servers → Add Server
→ @higgsfield/mcp, @supabase/mcp, github (Octokit)
```

### 3.2 **Wichtigste Skills für Anfänger**

```
Cowork → Plugins → Skill Store → Installieren:
```

1. **setup-cowork** (Guided setup)
2. **productivity:start** (Deine Task-Liste starten)
3. **productivity:task-management** (Tasks tracken)
4. **skill-creator** (Neue Skills bauen)
5. **pptx** / **docx** / **xlsx** (Dokumente erstellen)

---

## Phase 4: Backend-Stack aufsetzen (20 min)

### 4.1 Node.js + Express installieren
```bash
# Node.js 24 herunterladen
https://nodejs.org/ → LTS

# Im Projekt:
mkdir backend
cd backend
npm init -y
npm install express sqlite3 dotenv bcryptjs jsonwebtoken axios
```

### 4.2 .env Datei erstellen
```
# backend/.env
PORT=3000
JWT_SECRET=dein-geheim-schluessel-2026
KIE_API_KEY=<dein-kie.ai-key>
ADMIN_EMAIL=admin@deinapp.de
ADMIN_PASSWORD=<sicheres-passwort>
DATABASE_PATH=./database.sqlite
NODE_ENV=development
```

### 4.3 Server starten
```bash
node --experimental-sqlite server.js
```

---

## Phase 5: Mobile App (React Native + Expo) (25 min)

### 5.1 Expo Projekt erstellen
```bash
cd ..
npx create-expo-app mobile
cd mobile
npm install axios zustand expo-router
```

### 5.2 Config anpassen
```ts
// mobile/constants/Config.ts
export const API_BASE_URL = 'http://192.168.178.109:3000/api';
// ↑ WICHTIG: Deine lokale PC-IP nutzen (ipconfig in Terminal)
```

### 5.3 App starten
```bash
npx expo start
# QR-Code mit Expo Go scannen (Android/iOS)
```

---

## Phase 6: Kie.ai API Setup (für Video-Generierung) (10 min)

### 6.1 API-Key holen
- https://kie.ai → Account erstellen
- API-Key kopieren → in `backend/.env` einfügen

### 6.2 Video-Modelle & Preise
```
Grok (480p, 6s): 10 Coins / 0,05 USD
Sora 2 (720p, 10s): 30 Coins / 0,15 USD
Veo 3.1 Fast (8s): 60 Coins / 0,30 USD
Nano Banana (2K Bild): 18 Coins / 0,09 USD
```

### 6.3 Backend-Endpoint für Video-Generierung
```js
// backend/server.js
app.post('/api/videos/generate', async (req, res) => {
  const { prompt, model, duration } = req.body;
  
  const response = await fetch('https://api.kie.ai/v1/generate', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.KIE_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt,
      model, // grok, sora2, veo31
      duration
    })
  });
  
  return res.json(await response.json());
});
```

---

## Phase 7: GitHub Integration (Continuous Deployment)

### 7.1 Repo erstellen
```bash
git init
git remote add origin https://github.com/[dein-name]/[repo].git
git add .
git commit -m "Initial commit: Backend + Mobile setup"
git push -u origin main
```

### 7.2 Nach jedem stabilen Feature pushen
```bash
# Nach erfolgreichem Test:
git add .
git commit -m "Feature: [was neu ist]"
git push
```

---

## Phase 8: Claude-Integration in Cowork

### 8.1 **Prompt für Claude eingeben:**
```
Ich baue eine KI-Video-App mit:
- React Native Frontend
- Node.js Backend
- Kie.ai Video-API
- Supabase für Nutzer-Authentifizierung

Mein Stack:
Frontend: React Native/Expo
Backend: Node.js/Express
DB: Supabase
Video-API: kie.ai

Ich benötige:
1. Schema für Charakter-Videos
2. Auth-Flow (Login/Register)
3. Coin-System für API-Credits
4. Video-Generierungs-Endpoint
```

Claude wird dann:
- ✓ Dir Code-Snippets geben
- ✓ API-Struktur erklären
- ✓ Fehler debuggen
- ✓ Features implementieren

---

## Phase 9: Checkliste für ersten Tag

- [ ] Cowork installiert + aktiviert
- [ ] CLAUDE.md in dein Projekt kopiert & angepasst
- [ ] 3-4 MCPs + Skills installiert
- [ ] Backend (Node.js) läuft auf Port 3000
- [ ] Frontend (Expo) startet im Emulator
- [ ] Kie.ai API-Key in .env eingetragen
- [ ] GitHub Repo erstellt + erstes Commit gepusht
- [ ] Erste Aufgabe mit Claude definiert

---

## Wichtige Regeln

| Regel | Aktion |
|---|---|
| **Vor Löschen/Überschreiben** | Claude fragen, nicht silent machen |
| **API-Endpoints** | Offizielle Doku prüfen, nicht raten |
| **Externe APIs** | Erst Kosten kalkulieren, dann generieren |
| **Fehler** | Stopp + kurze Erklärung, nicht weitermachen |
| **GitHub Push** | Nach jedem stabilen Schritt |
| **Session-Memory** | MEMORY.md am Ende jeder Session updaten |

---

## Quickstart (TL;DR – 15 Min)

```bash
# 1. Node.js installieren (nodejs.org)

# 2. Projekt-Ordner
mkdir C:\Users\[dein-name]\ki-app\
cd ki-app

# 3. Backend
mkdir backend && cd backend
npm init -y && npm install express sqlite3 dotenv bcryptjs jsonwebtoken axios
# Erstelle backend/.env (siehe Phase 4.2)
# Starte: node --experimental-sqlite server.js

# 4. Frontend
cd ..
npx create-expo-app mobile
cd mobile && npm install axios zustand
# Starte: npx expo start

# 5. Cowork
# Claude Desktop installieren
# Cowork aktivieren → Setup-Skill starten
# CLAUDE.md in Projekt kopieren

# FERTIG! 🎉
```

---

## Hilfe benötigt?

**In Cowork eingeben:**
```
Ich bin Anfänger und brauche Hilfe mit [Problem].
Mein Stack ist: React Native + Node.js + Kie.ai
```

Claude wird step-by-step helfen! 🤖

---

**Viel Erfolg, Bruder!** 
– Vatto
