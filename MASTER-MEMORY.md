# MASTER-MEMORY.md – Global Project Index

**Owner:** Vatto (Robert) | **Email:** vatto0202@googlemail.com | **Hub:** C:/Users/rober/ki-app/

---

## 📊 Projekt-Übersicht

| Projekt | Stack | Status | Last Update | Next Task |
|---|---|---|---|---|
| **Snova Studio** | React Native + Node.js + Supabase | 🔵 Active | 2026-05-05 | MCP Hub Integration |
| **Menu Wall App** | iOS Swift | 🟢 Stable | 2026-04-28 | UI Polish |
| **Prompt Master** | Research + LLM | 🔵 Active | 2026-04-30 | Benchmark Suite |

---

## 🏢 SNOVA STUDIO – Showcase-App

### Core Features
- 🎬 Charakter-Erstellung mit Referenzbildern
- 📹 Video-Generierung (Grok/Sora2/Veo31 via Kie.ai)
- 💰 Coin-System (Admin-verwaltet)
- 👨‍💼 Admin-Panel

### Tech Stack
- **Frontend:** React Native 0.81 + Expo SDK 54 + zustand (state)
- **Backend:** Node.js 24 + Express + node:sqlite
- **Auth:** JWT (30d) + bcryptjs
- **API Integration:** Kie.ai (Characters + Videos)
- **Promo:** Higgsfield MCP (B-Roll + iPhone Mockups)

### Critical Paths
```
Backend Startup:
  cd backend/ → npx kill-port 3000 → node --experimental-sqlite server.js

Mobile Startup:
  cd mobile/ → npx expo start → Scan QR mit Expo Go
```

### API Routes (17 endpoints)
- Auth: `/api/auth/login`, `/api/auth/me`
- Characters: `GET/POST /api/characters`, POST `/api/characters/:id/images`
- Stories: `GET/POST /api/stories`, POST `/api/stories/:id/generate-scenes`
- Videos: POST `/api/videos/generate`, GET `/api/videos/:jobId/status`
- Coins: GET `/api/coins/balance`, POST `/api/admin/coins/add` (admin)
- Admin: POST `/api/admin/users`, GET `/api/admin/stats`

---

## 📚 Cross-Project Knowledge Base

### Shared Assets
- **Colors:** Neon Pink (#FF1493), Cyan (#00FFFF), Neon Green (#39FF14)
- **Design:** Blueprint-Style, no dark themes
- **Naming:** snake_case (DB), camelCase (Code)

### Credential Management
| Service | Env Var | Location | Rotate |
|---|---|---|---|
| Kie.ai | `KIE_API_KEY` | `backend/.env` | Monthly |
| GitHub | `GITHUB_TOKEN` | Cowork MCP | Quarterly |
| Supabase | `SUPABASE_KEY` | `backend/.env` | On leak |

### Session Memory Constraints
- Token budget: **80% efficiency goal** (no duplicate reads, task-relevant context only)
- Max context per session: **80 words** (Claude-A) + **30 words** (Claude-B audit)
- One task per session (clear definition required)

---

## 🚀 MCP Integration Status

| MCP | Status | Config File | Purpose |
|---|---|---|---|
| **GitHub** | ⚙️ Setup | `MCP-CONFIG/github-mcp.json` | Repo sync + PR workflow |
| **Supabase** | ⚙️ Setup | `MCP-CONFIG/supabase-mcp.json` | DB schema + Auth |
| **Memory** | 🔧 Integrating | `MCP-CONFIG/memory-mcp.json` | Cross-project memory |
| **Context7** | 📋 Planned | `MCP-CONFIG/context7-mcp.json` | 7-step context encoding |
| **Higgsfield** | ✅ Active | `.env: HIGGSFIELD_API_KEY` | Promo video generation |

---

## 📝 Session Log Template

```markdown
## [YYYY-MM-DD] Session Log
- **Aufgabe:** [was wurde gemacht]
- **Geänderte Dateien:** [liste]
- **Status:** ✓abgeschlossen / ⚠ offen
- **Nächster Schritt:** [konkret]
```

---

## 🎯 Global Prinzipien

1. **Token-Effizienz:** Nur task-relevanten Kontext laden
2. **Keine Duplikate:** Keine Datei zweimal lesen
3. **Git Flow:** Auto-push nach jedem stabilen Schritt
4. **Memory:** MASTER-MEMORY.md + projekt-lokale MEMORY.md
5. **Deutsch:** Alle Dokumentation auf Deutsch
6. **Sicherheit:** Secrets niemals in Repos, nur ENV

---

**Last Updated:** 2026-05-06 | **Next Review:** 2026-05-13
