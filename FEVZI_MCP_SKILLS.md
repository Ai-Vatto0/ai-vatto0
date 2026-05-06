# 🔌 FEVZI – MCP & Skills Checkliste

**Für KI-Video-App + Website wie Vatto's Stack**

---

## Phase 1: **ESSENZIELLE MCPs** (für KI-Video-App)

Aktiviere in **Cowork → Settings → MCP Servers**

### 🎬 Video-Generierung & Media
```
✓ @higgsfield/mcp
  Zweck: Promo-Videos generieren (B-Roll + iPhone-Mockup)
  API-Key: https://higgsfield.ai
  
✓ kie.ai (integriert über Backend API)
  Zweck: Character-Videos (Grok, Sora 2, Veo 3.1 Fast)
  API-Key: https://kie.ai
```

### 🗄️ Datenbank & Auth
```
✓ @supabase/mcp (alternativ zu SQLite)
  Zweck: Nutzer-Authentifizierung, Datenbank
  Falls du Supabase statt SQLite nutzen willst
  
✓ github (Octokit)
  Zweck: Code-Versionierung, Commits, Deployments
  GitHub Token: https://github.com/settings/tokens
```

### 🛠️ Backend-Tools
```
✓ @anthropic-ai/claude-code
  Zweck: Code-Editor Integration, direkt von CLI
  
✓ npm / Node.js
  Zweck: Package Management
  Automatisch bei Node-Installation
```

### 📊 Monitoring & Logging
```
⚠️ Optional:
✓ @honeycomb/mcp (bei Production)
  Zweck: Analytics + Error Tracking
```

---

## Phase 2: **WICHTIGSTE SKILLS** (für Anfänger)

Installiere in **Cowork → Plugins → Skill Store**

### 🎯 Onboarding & Setup
```
1. ✓ setup-cowork
   ├─ Guided Setup (Role-Matching)
   ├─ Tool-Verbindungen herstellen
   └─ Erste Skills testen
   
2. ✓ productivity:start
   ├─ Deine Task-Liste initialisieren
   ├─ CLAUDE.md + MEMORY.md
   └─ Session-System starten
```

### 📋 Task & Projekt-Management
```
3. ✓ productivity:task-management
   ├─ Tasks in TASKS.md tracken
   ├─ Abhängigkeiten definieren
   └─ Progress überblicken
   
4. ✓ productivity:memory-management
   ├─ Shorthand/Acronyms lernen
   ├─ Projekt-Kontext persistieren
   └─ Knowledge Base aufbauen
```

### 📝 Dokument-Skills
```
5. ✓ docx (für Reports, Design-Docs)
   └─ Professionelle Word-Dokumente
   
6. ✓ pptx (für Präsentationen)
   └─ Pitch-Decks, Roadmaps
   
7. ✓ xlsx (für Datenmanagement)
   └─ Coin-Ledger, User-Stats, Budgets
```

### 🎨 Code & Development
```
8. ✓ skill-creator
   ├─ Neue Custom-Skills bauen
   ├─ Skills optimieren
   └─ Performance messen
   
9. ✓ schedule
   ├─ Recurring Tasks automatisieren
   ├─ Nightlies, Backups, Reports
   └─ Scheduled Deployments
```

### 📊 Advanced (später)
```
10. ✓ security-review (für Code)
    └─ API-Sicherheit prüfen
    
11. ✓ review (für Pull Requests)
    └─ Code-Reviews automatisieren
```

---

## Phase 3: **INTEGRATION IN CLAUDE**

### Startup-Prompt (copy-paste in Cowork)
```markdown
🚀 Ich bin Anfänger und baue eine KI-Video-App!

MEIN SETUP:
- Frontend: React Native + Expo
- Backend: Node.js + Express
- Database: SQLite
- Video-API: Kie.ai (Grok, Sora 2, Veo 3.1 Fast)
- Authentifizierung: JWT
- Version Control: GitHub

INSTALLATION ERFOLGREICH:
✓ Cowork aktiviert
✓ Node.js 24 installiert
✓ MCPs: Higgsfield, GitHub, Kie.ai verbunden
✓ Skills: setup-cowork, productivity, docx, pptx, xlsx
✓ Backend läuft auf Port 3000
✓ Mobile App startet im Emulator

ERSTE AUFGABE:
Erstelle eine vollständige Projektstruktur für:
1. User-Authentication (Login/Register)
2. Charakter-Datenbank (mit Bildern)
3. Video-Generierungs-Endpoint (Kie.ai)
4. Coin-System (Admin-Vergabe)
5. API-Dokumentation

Stack: React Native + Node.js + SQLite
```

Claude wird dann automat. helfen! ✓

---

## Phase 4: **CHECKLIST – 1. Tag**

```
[] Cowork installiert + startklar
[] 4-5 MCPs verbunden (Higgsfield, GitHub, Kie.ai, etc.)
[] 6-8 Skills installiert + getestet
[] setup-cowork Skill einmal durchlaufen
[] Backend auf Port 3000 läuft
[] Mobile App im Expo Go startet
[] GitHub Repo erstellt + erstes Commit
[] CLAUDE.md + MEMORY.md in Projekt
[] Erster Prompt an Claude geschrieben
[] Erste Task in TASKS.md definiert
```

---

## Phase 5: **Montags-Routine (Recurring)**

Lass Claude diese Tasks jeden Montag um 9 Uhr starten:

```bash
# Schedule einstellen:
Cowork → Schedule Skill
├─ Task: "Wochencheck: Code Review + API-Tests"
├─ Cron: 0 9 * * 1 (jeden Montag 9:00)
└─ Action: GitHub-Repo scannen, Tests laufen, Report generieren
```

---

## Phase 6: **Umgebungsvariablen (alle MCPs)**

Erstelle `C:\Users\[dein-name]\ki-app\.env.mcp`:

```env
# Higgsfield (Promo-Videos)
HIGGSFIELD_API_KEY=<dein-higgsfield-key>

# Kie.ai (Character-Videos)
KIE_API_KEY=<dein-kie-key>

# GitHub
GITHUB_TOKEN=<dein-github-token>

# Supabase (wenn genutzt)
SUPABASE_URL=<dein-project-url>
SUPABASE_KEY=<dein-anon-key>

# Firebase/Stripe (später)
# FIREBASE_KEY=...
# STRIPE_KEY=...
```

**WICHTIG: `.env.mcp` NIE committen! → .gitignore**

---

## Phase 7: **Troubleshooting**

### MCP verbindet nicht?
```
1. Token/API-Key prüfen
2. Netzwerk-Verbindung testen
3. Cowork → Settings → Verbose Logging
4. Logs checken: ~/.cowork/logs/
5. Im Zweifel: MCP neu verbinden
```

### Backend startet nicht?
```
1. Port 3000 noch belegt?
   → npx kill-port 3000
2. Node.js 24?
   → node --version
3. Dependencies installiert?
   → npm install (im backend/)
4. .env Datei existiert?
   → check: backend/.env
```

### Mobile App crasht?
```
1. Expo Go aktuell?
2. API_BASE_URL in Config.ts korrekt?
   → ipconfig checken, lokal IP eintragen
3. Backend läuft?
4. Expo Cache clearen:
   → expo start --clear
```

---

## 🎓 Learning Path (Optional)

**Woche 1:**
- Basics: Auth-Flow + Coin-System
- Database: Character-Tabellen
- API: Video-Generierungs-Endpoint

**Woche 2:**
- Frontend: Video-Upload + Generierung
- UI: Charakter-Verwaltung
- Testing: API-Endpoints

**Woche 3:**
- Admin-Panel
- Analytics + Logging
- Deployment (GitHub Actions)

**Woche 4:**
- Website (separate React App)
- App-Promo (Higgsfield Videos)
- Marketing-Setup

---

## 📞 Support

**Fragen?** → `vatto0202@googlemail.com` (Vatto)

**Claude Hilfe:**
Einfach in Cowork schreiben:
```
Ich brauch Hilfe mit [Problem].
Fehler: [Error-Message]
Context: Kie.ai Video-API, Node.js Backend
```

Claude debuggt mit dir! 🤖

---

**FERTIG ZUM STARTEN!** 🚀

Viel Spaß, Bruder! 💪
