# SNOVA + Memory MCP Integration Plan

**Ziel:** Snova Studio nutzt Global Memory MCP für persistente Session-Context.

---

## 🔗 Integration Points

### 1. Local Memory (Snova-spezifisch)
**File:** `C:\Users\rober\ki-app\MEMORY.md`
```markdown
## Snova Studio – Session Memory

### Aktive Features (2026-05-06)
- ✅ Backend API (17 endpoints, fully tested)
- ✅ Mobile UI (Home, Characters, Create Studio, Projects)
- ✅ Kie.ai Integration (Characters + Videos working)
- 🟡 Coin System (Basic logic, needs Admin UI polish)
- 🟡 Higgsfield MCP (Promo videos, not yet integrated)

### Known Blockers
- IPv4 hardcoded in Config.ts → need auto-detect
- SQLite pragma needed for concurrent writes
- Video job polling needs real-time upgrade

### API Status
- Auth: ✓ JWT working
- Characters: ✓ CRUD working
- Stories: ✓ CRUD working
- Videos: ✓ Generate + polling working
- Coins: 🟡 Admin endpoints exist, UI missing
- Admin: ✓ User creation + stats working
```

### 2. Global Memory (Cross-Project)
**File:** `C:\Users\rober\ki-app\MASTER-MEMORY.md`
- Snova listed as **Showcase-App**
- Stack documented (React Native + Node.js + Supabase)
- Critical paths mapped
- API routes indexed (17 total)

### 3. MCP Config (Hub Integration)
**File:** `C:\Users\rober\ki-app\MCP-CONFIG\memory-mcp.json`
```json
{
  "projects_mapping": {
    "snova_studio": {
      "local_memory": "C:\\Users\\rober\\ki-app\\MEMORY.md",
      "stack_key": "react-native-node-supabase"
    }
  }
}
```

---

## 📊 Session Memory Flow (Snova)

```
Session Start
  ↓ Read MASTER-MEMORY.md (Snova section)
  ↓ Read MEMORY.md (latest session log)
  ↓ Decode: "Fix coin Admin UI"
  ↓ Load context: API routes, current blockers
  ↓ Task execution (80-word budget)
  ↓
Session End
  ↓ Update MEMORY.md (what was done)
  ↓ Commit to GitHub (git push)
  ↓ Update MASTER-MEMORY.md (project status)
```

---

## 🎯 Implementation Checklist

| Task | Status | Notes |
|---|---|---|
| Create MCP-CONFIG/ | ✅ Done | github, supabase, memory, context7 templates |
| MASTER-MEMORY.md | ✅ Done | Cross-project index, Snova as showcase |
| memory-mcp.json | ✅ Done | Snova project mapping + shortcuts |
| Create MEMORY.md (Snova) | 🔧 Next | Session log template + current status |
| Integrate with .mcp.json | 🔧 Next | Add memory-mcp to mcpServers |
| Create PROJECT-TEMPLATE | ✅ Done | npx create-vatto-project skizziert |
| Test End-to-End | 📋 Pending | Start session, read memory, execute task |

---

## 🚀 Next Session: Memory Test

1. Create `C:\Users\rober\ki-app\MEMORY.md` with first session log
2. Update `.mcp.json` to include memory-mcp server
3. Start new Snova task: "Fix Coin Admin UI"
4. Verify: Memory MCP loads context automatically
5. End: Commit changes + update MEMORY.md

---

**Owner:** Vatto | **Status:** 🟢 Ready for Integration | **ETA:** 2026-05-07
