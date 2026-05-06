# FEVZI – CLAUDE.md (Template)

Kopiere diese Datei in dein Projekt-Root und passe die Werte an!

---

## Projektübersicht
KI-basierte Mobile App für Video-Generierung mit Character-System.  
Plattform: React Native (Expo) + Node.js Backend + Kie.ai API

## Projektstruktur
```
ki-app/
├── backend/          Node.js + Express + SQLite
├── mobile/           React Native + Expo (SDK 54)
├── CLAUDE.md         Diese Datei
└── MEMORY.md         Session-Logs
```

---

## ⚡ Backend starten
```bash
cd C:\Users\[dein-name]\ki-app\backend
npx kill-port 3000
node --experimental-sqlite server.js
```
- Läuft auf **Port 3000**
- SQLite-DB: `backend/database.sqlite`
- Admin-User wird beim ersten Start automatisch erstellt

## 📱 Mobile App starten
```bash
cd C:\Users\[dein-name]\ki-app\mobile
npx expo start
```
- QR-Code im Terminal → mit **Expo Go** scannen
- Expo Go: https://expo.dev/client (Android/iOS)

---

## 🔧 Konfiguration

### Backend: `backend/.env`
```env
PORT=3000
JWT_SECRET=dein-geheim-schluessel-2026
KIE_API_KEY=<dein-kie.ai-api-key>
ADMIN_EMAIL=admin@deinapp.de
ADMIN_PASSWORD=<sicheres-passwort>
DATABASE_PATH=./database.sqlite
NODE_ENV=development
```

### Mobile: `mobile/constants/Config.ts`
```ts
export const API_BASE_URL = 'http://192.168.178.109:3000/api';
// ⚠️ WICHTIG: Deine lokale PC-IP nutzen!
// Kommando: ipconfig (Windows) → IPv4-Adresse kopieren
```

---

## 👤 Admin & User-Management
- **Nur Admin** kann Coins vergeben und User anlegen
- Admin-Panel in App unter **Profil → Admin Panel**
- Neue User nur über Admin (kein offenes Register)
- Login beim Start: `admin@deinapp.de` / `<password>`

## 💰 Coin-System
- **1 Credit (Kie.ai) = 0,005 USD**
- Coins nur vom Admin vergebbar
- Automatische Rückerstattung bei fehlgeschlagenen Generierungen
- **Kostenvorschau VOR jeder Generierung zeigen!**

---

## 🎬 Video-Modelle & Preise (Kie.ai)

| Modell | Dauer | Resolution | Coins | USD |
|---|---|---|---|---|
| **Grok** | 6s | 480p | 10 | 0,05 |
| **Grok** | 6s | 720p | 20 | 0,10 |
| **Grok** | 10s | 720p | 30 | 0,15 |
| **Grok** | 15s | 720p | 40 | 0,20 |
| **Sora 2** | 10s | 1080p | 30 | 0,15 |
| **Sora 2** | 15s | 1080p | 35 | 0,175 |
| **Veo 3.1 Fast** | 8s | 1080p | 60 | 0,30 |
| **Nano Banana Pro** | - | 2K Bild | 18 | 0,09 |

---

## 🔌 API-Endpunkte

### Auth
```
POST   /api/auth/login          → JWT-Token
POST   /api/auth/register       → Neuer User
GET    /api/auth/me             → Aktueller User
```

### Characters & Images
```
GET    /api/characters          → Alle Charaktere
POST   /api/characters          → Charakter erstellen
POST   /api/characters/:id/images → Referenzbild hochladen
GET    /api/characters/:id      → Charakter-Details
```

### Stories & Scenes
```
GET    /api/stories             → Alle Projekte
POST   /api/stories             → Projekt erstellen
POST   /api/stories/:id/scenes  → Szenen generieren (LLM)
```

### Video-Generierung
```
POST   /api/videos/generate     → Video generieren
GET    /api/videos/:jobId/status → Status abfragen
GET    /api/videos/:id/download  → Video herunterladen
```

### Coin Management
```
GET    /api/coins/balance       → Guthaben abfragen
POST   /api/admin/coins/add     → Coins vergeben (Admin)
GET    /api/admin/stats         → Statistiken (Admin)
```

---

## 🛠️ Technology Stack (FEST – keine Alternativen)

| Layer | Technologie | Version |
|---|---|---|
| **Frontend** | React Native / Expo | SDK 54 |
| **Backend** | Node.js + Express | 24 LTS |
| **Database** | SQLite (node:sqlite) | built-in |
| **Auth** | JWT + bcryptjs | - |
| **Video-API** | Kie.ai (Grok/Sora2/Veo31) | v1 |
| **Images** | Nano Banana Pro | - |
| **Version Control** | GitHub | - |

---

## 📋 Wichtige Regeln

| Regel | Details |
|---|---|
| **Frag VOR Löschen** | Niemals silent Dateien überschreiben |
| **APIs: Doku first** | Erst offizielle Doku prüfen, nicht raten |
| **Coins-Vorschau** | IMMER Kosten zeigen VOR Generierung |
| **Fehler = STOPP** | Keine Vermutungen, kurze Erklärung + warten |
| **Design** | Neon-Pink/Cyan/Grün, Blueprint-Style (NO Dark) |
| **1 Task pro Session** | Klar definiert, nicht mehrere parallel |
| **GitHub Push** | Nach jedem stabilen Schritt pushen |
| **Token-Effizienz** | Nur relevanten Kontext laden |

---

## 💾 Session-Memory

**Bei Sessionstart prüfen:**
- Was war letzte abgeschlossene Aufgabe?
- Welche Dateien wurden zuletzt geändert?
- Welche Fehler/Blockaden bestanden?

**Am Sessionende updaten:**
```markdown
## [2026-05-05] Session-Log
- Aufgabe: [was wurde gemacht]
- Geänderte Dateien: [liste]
- Status: ✓abgeschlossen / ⚠ offen
- Nächster Schritt: [konkret]
```

→ Speichern in: `C:\Users\[dein-name]\ki-app\MEMORY.md`

---

## 🤖 Agent-Rollen (bei komplexen Aufgaben)

Rolle klar trennen:
- **Frontend-Agent**: React Native / Expo / UI
- **Backend-Agent**: Node.js / Express / Datenbank
- **QA-Agent**: Tests / Fehlerprüfung
- **Deploy-Agent**: GitHub Push / Builds

---

## 🔐 Sicherheit

| Punkt | Aktion |
|---|---|
| **API-Keys** | NUR in `backend/.env` – nie im Frontend |
| **JWT-Tokens** | 30 Tage Laufzeit |
| **Passwörter** | bcrypt-gehashed speichern |
| **Admin-Routes** | adminOnly-Middleware schützt |
| **.env Datei** | NIEMALS committen (in .gitignore) |

---

## 🚀 Starter-Prompt für Claude

Kopiere in Cowork ein und Claude startet mit dir:

```
Ich baue eine KI-Video-App mit:

STACK:
- Frontend: React Native + Expo SDK 54
- Backend: Node.js 24 + Express
- Database: SQLite (node:sqlite)
- Video-API: Kie.ai (Grok, Sora 2, Veo 3.1 Fast)
- Image-API: Nano Banana Pro

FEATURES:
1. Character creation + reference images
2. Story projects with AI scene generation
3. Video generation with coin system
4. Admin panel for user & coin management
5. JWT-based auth

Erste Aufgabe:
[Beschreib konkret was du brauchst]
```

Claude wird dann:
- ✓ Code-Struktur planen
- ✓ API-Endpoints designen
- ✓ Datenbank-Schema erstellen
- ✓ Features implementieren
- ✓ Bugs debuggen

---

## 📞 Fragen?

Kontakt: vatto0202@googlemail.com (Vatto – dein Bruder)

**Happy Coding!** 🎉
