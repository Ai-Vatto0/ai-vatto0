# SNOVA STUDIO — SESSION MEMORY
> Letzte Aktualisierung: 2026-05-16
> REGEL: Nur Snova App aktiv — kein anderes Projekt bis auf Weiteres.

---

## [2026-05-16] Session-Log — Vollständiger Projekt-Scan

- **Aufgabe:** Alle Dateien geprüft, Projektstruktur dokumentiert, MEMORY.md neu erstellt
- **Status:** ✓ abgeschlossen
- **Nächster Schritt:** Mobile App Screens prüfen & fehlende Features ergänzen

---

## AKTUELLER BACKEND-STAND (Node.js + SQLite)

### Geänderte Dateien am 16. Mai 2026:
| Datei | Beschreibung |
|---|---|
| `backend/src/validation/schemas.js` | Zod-Schemas: login, video, admin, character — NEU |
| `backend/src/database/db.js` | SQLite-Schema + Migration (is_banned) — AKTUALISIERT |
| `backend/src/middleware/auth.js` | JWT-Auth-Middleware — AKTUALISIERT |
| `backend/src/middleware/adminOnly.js` | Admin-Guard — AKTUALISIERT |
| `backend/src/middleware/rateLimit.js` | In-Memory Sliding Window Limiter — NEU |
| `backend/src/middleware/validate.js` | Zod-Validierung-Middleware — NEU |
| `backend/src/routes/admin.js` | Admin-Routes: Users, Coins, Stats — AKTUALISIERT |
| `backend/src/routes/videos.js` | Video-Generierung: Grok + Veo31 + Queue — AKTUALISIERT |
| `backend/src/routes/auth.js` | Login + Magic Link + JWT — AKTUALISIERT |

### Geänderte Dateien am 11. Mai 2026:
| Datei | Beschreibung |
|---|---|
| `backend/src/routes/stories.js` | Szenen-Generierung mit LLM |
| `backend/src/routes/images.js` | Referenzbild-Upload |
| `mobile/app/(tabs)/` | Tab-Navigation der App |

---

## DATENBANK-SCHEMA (SQLite — node:sqlite built-in)

Tabellen: `users`, `characters`, `character_images`, `projects`, `scenes`, `video_jobs`, `coin_transactions`, `magic_links`

Migration: `is_banned` Column auf `users` → automatisch bei Start.

---

## INTEGRIERTE FEATURES (Stand 16.05.2026)

### Backend ✓
- Login mit E-Mail/Passwort (JWT 30 Tage)
- Magic Link Login (Email → Token → JWT)
- Rate Limiting: Login 5/min, Video 3/min, Admin 30/min
- Zod-Validierung auf allen POST-Endpoints
- Video-Generierung: Grok (6/10/15s, 480p/720p) + Veo 3.1 Fast
- Coin-System: Abzug + Rückerstattung (atomar per Transaktion)
- Kie.ai Credit-Check vor jeder Generierung
- Job-Queue (verhindert parallele API-Überlastung)
- Admin: User anlegen, Coins vergeben/entfernen, Stats, Passwort reset
- Charakter-System: Erstellen + Referenzbilder

### Mobile (React Native / Expo SDK 54) ✓
- Login-Screen
- Tab-Navigation: character, story, video, admin
- Axios API-Service (`mobile/services/api.ts`)
- Zustand Store

---

## BEKANNTE OFFENE PUNKTE / NÄCHSTE SCHRITTE

- [ ] Mobile Screens vollständig? → `mobile/app/(tabs)/` prüfen
- [ ] Kie.ai Service-Datei prüfen (`backend/src/services/kieai.js`)
- [ ] Email-Service prüfen (`backend/src/services/emailService.js`)
- [ ] `.env` vorhanden & korrekt konfiguriert?
- [ ] GitHub Push nach letzten Änderungen vom 16.05. ausstehend
- [ ] Coin-Preistabelle im Frontend sichtbar? (Kostenvorschau vor Generierung)

---

## STACK (FEST — KEINE ALTERNATIVEN)

| Layer | Tech |
|---|---|
| Frontend | React Native / Expo SDK 54 |
| Backend | Node.js 24, Express |
| DB | SQLite (node:sqlite built-in) |
| Auth | JWT + Magic Link |
| KI-Video | Kie.ai (Grok, Veo 3.1 Fast) |
| Payments | Stripe (noch nicht integriert) |
| Email | Resend (Magic Link) |

---

## PREISTABELLE (Coins = interne Währung)

| Modell | Dauer | Auflösung | Coins | USD |
|---|---|---|---|---|
| Grok | 6s | 480p | 10 | 0,05 |
| Grok | 6s | 720p | 20 | 0,10 |
| Grok | 10s | 720p | 30 | 0,15 |
| Grok | 15s | 720p | 40 | 0,20 |
| Veo 3.1 Fast | 8s | — | 60 | 0,30 |
| Nano Banana Pro | 2K Bild | — | 18 | 0,09 |

---

## PFADE

- Projekt-Root: `C:/Users/rober/ki-app/`
- Backend: `C:/Users/rober/ki-app/backend/`
- Mobile: `C:/Users/rober/ki-app/mobile/`
- GitHub: https://github.com/ai-vatto0/ai-vatto0

---

## SESSION-REGELN

1. Vor Löschen/Überschreiben IMMER fragen
2. Coin-Kostenvorschau VOR jeder Generierung
3. Fehler = Stopp + Erklärung — kein Raten
4. GitHub Push nach jedem stabilen Schritt
5. MEMORY.md am Session-Ende aktualisieren
6. Nur 1 klar definierte Aufgabe pro Session
