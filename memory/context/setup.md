---
name: Snova Studio Setup
description: Projekt-Konfiguration, Befehle, Start-Prozedur
type: reference
---

# Snova Studio Setup

## Backend starten
```bash
cd C:\Users\rober\ki-app\backend
npx kill-port 3000
node --experimental-sqlite server.js
```

## Mobile starten
```bash
cd C:\Users\rober\ki-app\mobile
npx expo start
```
→ QR-Code mit Expo Go scannen

## .env Backend
```
PORT=3000
JWT_SECRET=snova-studio-geheim-schluessel-2026
KIE_API_KEY=<api-key>
ADMIN_EMAIL=<email>
ADMIN_PASSWORD=<pwd>
DATABASE_PATH=./database.sqlite
NODE_ENV=development
```

## Mobile Config (`constants/Config.ts`)
```ts
export const API_BASE_URL = 'http://192.168.178.109:3000/api';
// IP = lokale PC-IP (ipconfig)
```

## API-Basis
- POST /api/auth/login
- GET /api/auth/me
- POST /api/characters
- GET /api/stories
- POST /api/videos/generate

## Admin
- Nur Admin: Coins + User-Verwaltung
- Admin-Panel: Profil → Admin Panel

