# Snova Studio – Startanleitung

## Voraussetzungen

- Node.js 18+ installiert: https://nodejs.org
- Git installiert (optional)
- Expo Go App auf deinem Handy (App Store / Play Store)

---

## 1. Backend starten

```bash
cd C:\Users\rober\ki-app\backend
npm install
```

Dann die `.env` Datei öffnen und deinen Kie.ai API-Key eintragen:
```
KIE_API_KEY=HIER_DEINEN_KIE_AI_KEY_EINTRAGEN
```

Server starten:
```bash
npm start
```

Wenn alles klappt siehst du:
```
✅ Datenbank bereit
🚀 Server läuft auf Port 3000
👤 Admin-User erstellt: admin@ki-app.com
🔑 Passwort: Admin123!
```

---

## 2. Deine IP-Adresse herausfinden

Der Server muss von deinem Handy erreichbar sein.

**Windows:**
```
ipconfig
```
Suche nach "IPv4-Adresse" → z.B. `192.168.1.100`

---

## 3. Mobile App konfigurieren

Öffne: `C:\Users\rober\ki-app\mobile\constants\Config.ts`

Trage deine IP ein:
```typescript
export const API_URL = 'http://192.168.1.100:3000';
```

---

## 4. Mobile App starten

```bash
cd C:\Users\rober\ki-app\mobile
npm install
npm start
```

Du siehst einen QR-Code. Scanne ihn mit:
- **Android:** Expo Go App → QR scannen
- **iPhone:** Kamera App → QR scannen → Expo Go öffnen

---

## 5. Einloggen

- **Admin E-Mail:** admin@ki-app.com
- **Passwort:** Admin123!

⚠️ Ändere das Passwort nach dem ersten Login!

---

## 6. Neue Nutzer anlegen (nur Admin)

1. In der App → Profil Tab → "Nutzer verwalten"
2. + Button → Neuen Nutzer erstellen
3. Coins hinzufügen: auf den grünen + Button beim Nutzer tippen

---

## 7. App auf anderen Handys nutzen

### Option A: Expo Go (einfachst, nur im gleichen WLAN)
Alle Handys müssen im gleichen WLAN sein.
QR-Code teilen → Expo Go App → fertig.

### Option B: Richtige App (für alle, überall)
Dafür brauchst du EAS Build (Expo):
```bash
npm install -g eas-cli
eas login
eas build --platform android  # für APK
eas build --platform ios       # für iPhone (braucht Apple Developer Account)
```

---

## 8. Backend online hosten (damit die App überall funktioniert)

Empfehlung: **Railway.app** (kostenlos starten)

1. Konto erstellen auf railway.app
2. Neues Projekt → "Deploy from GitHub" oder direkt uploaden
3. Environment Variables setzen (dein KIE_API_KEY etc.)
4. URL kopieren → in Config.ts als API_URL eintragen

---

## Coin-System

| Modell | Dauer | Coins |
|--------|-------|-------|
| Grok   | 6s 720p | 20 |
| Grok   | 10s 720p | 30 |
| Grok   | 15s 720p | 40 |
| Sora 2 | 10s | 30 |
| Sora 2 | 15s | 35 |
| Veo 3.1 Fast | 8s | 60 |
| Bild (Nano Banana) | 2K | 18 |
| Szenen-Gen (pro Szene) | – | 5 |

**Coins kannst NUR DU als Admin verteilen.**
Nutzer können keine Coins kaufen.

---

## Datei-Struktur

```
ki-app/
├── backend/           ← Node.js Server
│   ├── .env           ← API-Key hier eintragen!
│   ├── src/
│   │   ├── routes/    ← alle API-Endpunkte
│   │   ├── services/  ← Kie.ai API-Calls
│   │   └── database/  ← SQLite Datenbank
│   └── uploads/       ← hochgeladene Bilder
└── mobile/            ← React Native App
    ├── constants/
    │   └── Config.ts  ← Server-URL hier eintragen!
    └── app/           ← alle Screens
```

---

## Wichtig zur Sicherheit

- Den API-Key niemals in den App-Code schreiben
- Den API-Key niemals in einem Chat oder per E-Mail teilen
- Der Key liegt NUR in: `backend/.env`
- Die `.env` Datei niemals in Git committen
