# Snova Studio – CLAUDE.md

## ⚠️ AKTIVER FOKUS
**NUR Snova App** — kein anderes Projekt bis auf Weiteres (egal ob Claude App, Browser, PowerShell oder VSCode).
Vor jeder Session: **MEMORY.md lesen** → `C:/Users/rober/ki-app/MEMORY.md`
Nach jeder Session: **MEMORY.md aktualisieren** mit Datum, Änderungen, nächstem Schritt.

---

## Projektübersicht
KI-basierte Mobile App für konsistente Charakter-Erstellung und Story-Video-Generierung.
Plattform: React Native (Expo) + Node.js Backend + Kie.ai API

## Projektstruktur
```
ki-app/
├── backend/          Node.js + Express + SQLite (node:sqlite built-in)
├── mobile/           React Native + Expo (SDK 54)
└── CLAUDE.md
```

---

## Backend starten
```bash
cd C:\Users\rober\ki-app\backend
npx kill-port 3000
node --experimental-sqlite server.js
```
- Läuft auf Port 3000
- SQLite-Datenbank: `backend/database.sqlite`
- Beim ersten Start wird Admin-User automatisch erstellt

## Mobile App starten
```bash
cd C:\Users\rober\ki-app\mobile
npx expo start
```
- QR-Code im Terminal → mit Expo Go scannen
- Expo Go auf Android/iOS installieren

---

## Konfiguration

### Backend: `backend/.env`
```
PORT=3000
JWT_SECRET=snova-studio-geheim-schluessel-2026
KIE_API_KEY=<kie.ai api key>
ADMIN_EMAIL=<admin email>
ADMIN_PASSWORD=<admin passwort>
DATABASE_PATH=./database.sqlite
NODE_ENV=development
```

### Mobile: `mobile/constants/Config.ts`
```ts
export const API_BASE_URL = 'http://192.168.178.109:3000/api';
// IP muss die lokale PC-IP sein (ipconfig)
```

---

## Admin
- Nur Admin kann Coins vergeben und User anlegen
- Admin-Panel in der App unter Profil → Admin Panel
- Neue User nur über Admin anlegen (kein offenes Register)

## Coins
- 1 Credit (Kie.ai) = 0,005 USD
- Coins nur vom Admin vergebbar
- Automatische Rückerstattung bei fehlgeschlagenen Generierungen

---

## API-Endpunkte
| Route | Beschreibung |
|---|---|
| POST /api/auth/login | Login |
| GET /api/auth/me | Aktueller User |
| GET /api/characters | Alle Charaktere |
| POST /api/characters | Charakter erstellen |
| POST /api/characters/:id/images | Referenzbild hochladen |
| GET /api/stories | Alle Projekte |
| POST /api/stories/:id/generate-scenes | Szenen mit LLM generieren |
| POST /api/videos/generate | Video generieren (Grok/Sora2/Veo31) |
| GET /api/videos/:jobId/status | Video-Status abfragen |
| GET /api/coins/balance | Coin-Guthaben |
| POST /api/admin/coins/add | Coins vergeben (Admin only) |
| POST /api/admin/users | User erstellen (Admin only) |
| GET /api/admin/stats | Statistiken (Admin only) |

---

## Video-Modelle & Preise (Kie.ai)
| Modell | Dauer | Preis |
|---|---|---|
| Grok | 6s 480p | 10 Coins / 0,05 USD |
| Grok | 6s 720p | 20 Coins / 0,10 USD |
| Grok | 10s 720p | 30 Coins / 0,15 USD |
| Grok | 15s 720p | 40 Coins / 0,20 USD |
| Sora 2 | 10s | 30 Coins / 0,15 USD |
| Sora 2 | 15s | 35 Coins / 0,175 USD |
| Veo 3.1 Fast | 8s | 60 Coins / 0,30 USD |
| Nano Banana Pro | 2K Bild | 18 Coins / 0,09 USD |

---

## Technologie-Stack
- **Backend:** Node.js 24, Express, node:sqlite (built-in), bcryptjs, jsonwebtoken
- **Mobile:** React Native 0.81, Expo SDK 54, expo-router, zustand, axios
- **Datenbank:** SQLite (node:sqlite, kein externes Paket nötig)
- **KI-Video:** Kie.ai (Charakter-Videos: Grok, Sora 2, Veo 3.1 Fast; Bild: Nano Banana Pro)
- **KI-Promo:** Higgsfield MCP + Seedance 2.0 (App-Promo-Videos mit B-Roll & iPhone-Mockups)

---

## Higgsfield MCP – Promo-Video-Autopilot

**Zweck:** Automatische Generierung von App-Promo-Videos (separate Pipeline, unabhängig von Kie.ai)

### Setup
1. **Higgsfield Account** → https://higgsfield.ai → API-Key kopieren
2. **MCP Config in Claude Code:**
   - Öffne Claude Code → Settings → MCP Servers → Add Server
   - URL: `@higgsfield/mcp`
   - Env-Var: `HIGGSFIELD_API_KEY=<dein_api_key>`
   - Oder nutze: `higgsfield-mcp-config.json` (im Projekt-Root)

3. **In Claude Code / Chat nutzen:**
   ```
   Erstelle ein Promo-Video für [URL oder Screenshot].
   Nutze Higgsfield MCP: B-Roll + iPhone-Mockup + Seedance 2.0.
   ```

### Output
- **Format:** MP4 (fertig für Instagram, TikTok, App Store)
- **Dauer:** ~2 Min Setup, Minuten Generierung
- **Elemente:** Cinematic B-Roll + deine App im iPhone-Frame + Animationen

### Wichtig
- **Kie.ai = Charakter-Videos** (Snova Feature) – bleibt unverändert
- **Higgsfield = Promo-Videos** (App-Marketing) – komplett getrennt
- API-Keys liegen in separaten .env / Config-Dateien

---

## Sicherheit
- Kie.ai API-Key liegt NUR in `backend/.env` – nie im Frontend
- JWT-Tokens mit 30 Tagen Laufzeit
- Passwörter bcrypt-gehashed
- Admin-Routen mit adminOnly-Middleware geschützt
- `.env` niemals committen

## Team
- **Vatto (Robert):** Backend, Architektur, Deployment
- **Yuna:** UI/UX Design, Charakter-Assets, App-Look
