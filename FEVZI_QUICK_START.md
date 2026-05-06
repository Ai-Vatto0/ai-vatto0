# ⚡ FEVZI QUICK START (15 Minuten)

Kopiere diese Befehle 1:1 → fertig ist die Basis!

---

## Schritt 1: Ordner erstellen (1 min)
```powershell
# PowerShell als Admin öffnen

mkdir C:\Users\[DEIN_NAME]\ki-app
cd C:\Users\[DEIN_NAME]\ki-app

# Bestätigung:
pwd
# → sollte zeigen: C:\Users\[DEIN_NAME]\ki-app
```

---

## Schritt 2: Backend (5 min)
```bash
# Backend-Ordner + Node-Projekt
mkdir backend
cd backend
npm init -y

# Dependencies installieren
npm install express sqlite3 dotenv bcryptjs jsonwebtoken axios cors

# .env Datei erstellen → öffne editor:
# Pfad: C:\Users\[DEIN_NAME]\ki-app\backend\.env
```

### Copy-Paste in `.env`:
```env
PORT=3000
JWT_SECRET=fevzi-geheim-2026
KIE_API_KEY=dein-kie-key
ADMIN_EMAIL=admin@fevzi.app
ADMIN_PASSWORD=test123456
DATABASE_PATH=./database.sqlite
NODE_ENV=development
```

### Server-Datei erstellen:
**Datei:** `backend/server.js`
```javascript
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Test-Endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend läuft! 🚀' });
});

app.listen(process.env.PORT, () => {
  console.log(`✓ Server läuft auf Port ${process.env.PORT}`);
});
```

### Backend starten:
```bash
# Im backend/ Ordner:
node --experimental-sqlite server.js

# Output sollte sein:
# ✓ Server läuft auf Port 3000
```

**Behalte dieses Terminal offen!** (nur minimieren)

---

## Schritt 3: Mobile App (5 min)
```bash
# Neues Terminal öffnen! (Backend läuft in anderem)

cd C:\Users\[DEIN_NAME]\ki-app

# Expo-Projekt erstellen
npx create-expo-app mobile
cd mobile

# Dependencies
npm install axios zustand

# Config-Datei erstellen:
# Pfad: mobile/constants/Config.ts
```

### Copy-Paste in `mobile/constants/Config.ts`:
```typescript
export const API_BASE_URL = 'http://192.168.178.109:3000/api';
// ⚠️ 192.168.178.109 mit deiner lokaler IP ersetzen!
// Kommando: ipconfig (Windows) → IPv4-Adresse
```

### App starten:
```bash
# Im mobile/ Ordner:
npx expo start

# Output: QR-Code erscheint
# 1. Expo Go App auf handy installieren
# 2. QR-Code scannen
# FERTIG!
```

---

## Schritt 4: Cowork Setup (3 min)

1. **Claude Desktop öffnen**
2. **Rechts oben → "Cowork" aktivieren**
3. **Settings → MCP Servers**
   - Add: `@higgsfield/mcp` (Higgsfield API-Key)
   - Add: `github` (GitHub Token)
   - Add: `@supabase/mcp` (optional)

4. **Plugins → Skills:**
   - `setup-cowork`
   - `productivity:start`
   - `productivity:task-management`
   - `docx`, `pptx`, `xlsx`

---

## Schritt 5: Erster Prompt (1 min)

**Kopiere in Cowork-Chat:**

```
Ich bin Fevzi, Anfänger, und baue eine KI-Video-App!

✓ Backend läuft auf Port 3000
✓ Mobile App startet mit Expo
✓ Node.js 24 installiert
✓ Cowork + Skills ready

MEIN STACK:
- Frontend: React Native + Expo
- Backend: Node.js + Express
- Database: SQLite
- Videos: Kie.ai (später)
- Auth: JWT

ERSTE AUFGABE:
Erstelle mir die komplette Auth-Struktur:
1. Login-Endpoint (POST /api/auth/login)
2. Register-Endpoint (POST /api/auth/register)
3. JWT-Token-Management
4. Admin-Check für Backend

Gib mir Code zum kopieren + SQL zum ausführen.
```

**SEND!** ✓

Claude startet automat. mit dir! 🤖

---

## Status-Check: ✓ FERTIG?

```
[ ] Backend läuft auf localhost:3000
[ ] http://localhost:3000/api/health zeigt: {"status":"Backend läuft! 🚀"}
[ ] Expo QR-Code gescannt
[ ] Cowork aktiviert
[ ] 4+ Skills installiert
[ ] Erster Prompt geschrieben

JA? → **DU BIST STARTKLAR!** 🎉
```

---

## Was jetzt?

Claude wird in Cowork:
- ✓ Dein Projekt strukturieren
- ✓ Code-Snippets geben
- ✓ Fehler debuggen
- ✓ Features implementieren

**Einfach losschreiben, was du brauchst!**

Beispiele:
- "Erstelle einen Login-Screen"
- "Wie verbinde ich Frontend mit Backend?"
- "Erklär mir das Coin-System"
- "Helft mir mit diesem Error: ..."

---

## Kontakt

**Fragen?** → Vatto (dein Bruder): vatto0202@googlemail.com

**Viel Erfolg!** 💪🚀
