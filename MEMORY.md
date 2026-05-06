# SNOVA STUDIO – SESSION MEMORY

---

## [2026-05-06] Session: Global MCP Hub Setup

**Aufgabe:** Global MCP Hub für alle Vatto0-Projekte + Snova-Integration

**Geänderte Dateien:**
- `MCP-CONFIG/github-mcp.json` (neu)
- `MCP-CONFIG/supabase-mcp.json` (neu)
- `MCP-CONFIG/memory-mcp.json` (neu)
- `MCP-CONFIG/hub.json` (neu)
- `MCP-CONFIG/PROJECT-TEMPLATE.md` (neu)
- `MASTER-MEMORY.md` (neu)
- `SNOVA-MEMORY-INTEGRATION.md` (neu)
- `MEMORY.md` (neu – this file)

**Status:** ✓ abgeschlossen

**Deliverables:**
1. ✅ MCP-CONFIG/ erstellt (5 Dateien, GitHub + Supabase unified)
2. ✅ MASTER-MEMORY.md strukturiert (3-Projekt Index, Snova Showcase)
3. ✅ Memory MCP Skizze (Shortcuts, Project Mapping, Token Efficiency)
4. ✅ PROJECT-TEMPLATE.md (npx create-vatto-project, 4 types, MVP roadmap)

**Nächster Schritt:** Update .mcp.json → test end-to-end → git push

---

## Snova Studio – Current Status (2026-05-06)

### ✅ Aktive Features
- Backend: 17 API endpoints (Auth, Characters, Stories, Videos, Coins, Admin)
- Mobile: React Native + Expo (Home, Characters, Create Studio, Projects)
- Kie.ai: Character + Video generation working
- Higgsfield: Promo videos (B-Roll + iPhone Mockups)
- Admin: User creation, coin management, stats

### 🟡 In Progress
- Coin Admin UI: Logic done, UI polish needed
- Real-time Video Polling: Works, needs upgrade

### 🎬 Tech Stack
- Frontend: React Native 0.81 + Expo SDK 54
- Backend: Node.js 24 + Express + node:sqlite
- Auth: JWT (30d) + bcryptjs
- API: Kie.ai + Higgsfield MCP

### 💰 Pricing (Kie.ai)
- Grok 6s 480p: 10 Coins | Sora 2 10s: 30 Coins | Veo 3.1: 60 Coins

---

## MCP Integration

### Local Mapping
```json
{
  "snova_studio": {
    "local_memory": "MEMORY.md",
    "master_memory": "MASTER-MEMORY.md",
    "mcp_config": "MCP-CONFIG/",
    "stack_key": "react-native-node-supabase"
  }
}
```

### Shortcuts
- `start_backend`: `cd backend && npx kill-port 3000 && node --experimental-sqlite server.js`
- `start_mobile`: `cd mobile && npx expo start`
- `git_push`: `git add . && git commit -m 'Stable' && git push`

---

**Owner:** Vatto | **Last Update:** 2026-05-06 | **Next Review:** 2026-05-13
