# AGENTS.md – Snova Studio Monorepo

**Last updated:** 2026-04-26  
**Repository:** `C:/Users/rober/ki-app/` (monorepo)  
**Tech Stack:** Node.js, Expo, Next.js, Vite, SQLite, Kie.ai API

---

## Project Overview

Snova Studio is a multi-project system for AI-powered character creation and video generation.

| Project | Type | Language | Purpose | Port |
|---|---|---|---|---|
| **backend** | Express.js + Node.js | JS | API server, video jobs, authentication | 3000 |
| **mobile** | React Native + Expo | TypeScript | iOS/Android consumer app | (via Expo Go) |
| **snova-studio** | Next.js 14 | TypeScript | Web studio, character DNA, video gen | 3000 (dev) |
| **snova-admin** | Next.js 14 | TypeScript | Admin panel, coin management | 3002 |
| **sora-warrior** | Vite + React + Express | TypeScript | Video generator UI, render pipeline | 5173 (Vite) |

---

## Architecture Notes

### Data Flow
1. **Authentication:** JWT tokens (30-day expiry) issued by `backend/src/routes/auth.js`
2. **Video Jobs:** Submitted to Kie.ai API → job ID stored in SQLite → client polls `/api/videos/{jobId}/status`
3. **Database:** SQLite (`backend/database.sqlite`) — initialized on first server start
4. **Coins:** User account balance, decremented on video generation, only admins can add coins

### API Base
All frontend projects call `http://localhost:3000/api` (dev) or production URL.

### Key Models
- **Characters:** User-created AI characters with reference images
- **Stories:** Projects that group scenes and generate video sequences
- **Videos:** Generated from scenes using Grok, Sora 2, or Veo 3.1
- **Users:** Admin flag determines coin allocation and user management rights

---

## Setup

### Prerequisites
- Node.js 18+
- Kie.ai API key (contact Kie.ai)
- Optional: EAS CLI for Expo builds

### First-time Setup
```bash
# 1. Backend
cd backend
npm install
cp .env.example .env
# Edit .env: add KIE_API_KEY, JWT_SECRET, admin credentials
npm start

# 2. Mobile (if using Expo Go)
cd ../mobile
npm install
# Edit constants/Config.ts: set API_BASE_URL to your local IP:3000
npm start

# 3. Web Studio (if using Next.js)
cd ../snova-studio
npm install
npm run dev
```

### Environment Files
**Do NOT commit `.env` files.** Check `.env.example` for required variables.

#### `backend/.env`
```
PORT=3000
JWT_SECRET=<long-random-string>
KIE_API_KEY=<kie.ai-api-key>
ADMIN_EMAIL=admin@ki-app.com
ADMIN_PASSWORD=<secure-password>
DATABASE_PATH=./database.sqlite
NODE_ENV=development
```

#### `mobile/constants/Config.ts`
```typescript
export const API_BASE_URL = 'http://192.168.x.x:3000/api';
// Use ipconfig on Windows to find your PC's IPv4 address
```

---

## Run / Dev Commands

### Backend
```bash
cd backend
npm start         # Production (uses node:sqlite directly)
npm run dev       # Development with nodemon
```

### Mobile (Expo)
```bash
cd mobile
npm start         # Starts Expo dev server, shows QR code
npx expo start --android    # Direct Android build
npx expo start --ios        # Direct iOS build
```

### Snova Studio (Next.js)
```bash
cd snova-studio
npm run dev       # Runs on port 3000 (production uses different port)
npm start         # Production mode
```

### Snova Admin (Next.js)
```bash
cd snova-admin
npm run dev       # Runs on port 3002
npm start         # Production mode
```

### Sora Warrior (Vite + Express)
```bash
cd sora-warrior
npm run dev       # Vite dev server (port 5173) + Express backend
npm start         # Production (Express server only)
npm run build     # Build React app
```

---

## Build Commands

### Backend
No build step — runs directly with Node.js.

### Mobile (Expo)
```bash
cd mobile
npm run build:android    # Creates APK via EAS
npm run build:ios        # Requires Apple Developer account
```

### Next.js Projects
```bash
# snova-studio
npm run build
npm start

# snova-admin
npm run build
npm start
```

### Sora Warrior (Vite)
```bash
npm run build        # Outputs to dist/
npm run preview      # Preview built app locally
npm start            # Run Express server (for production)
```

---

## Test Commands

**No formal test suite is currently configured.**

### Manual Testing Workflow
1. **Backend:** Start server, verify logs show "✅ Datenbank bereit" and "🚀 Server läuft auf Port 3000"
2. **Mobile:** Scan QR code with Expo Go, verify login works with admin credentials
3. **Web Studio:** `npm run dev`, test character creation → image upload → video generation
4. **Coin System:** Admin adds coins → user generates video → balance decrements
5. **Video Polling:** Submit video job, poll `/api/videos/{jobId}/status` until status changes from "processing"

### Debugging
- **Backend logs:** `npm run dev` shows Express request logs + database operations
- **Mobile logs:** Expo terminal shows React Native logs + API calls
- **Browser DevTools:** Check network tab for API calls, console for React errors

---

## Lint / Format Commands

### Backend
```bash
# No linter configured
# Manual code review in PR
```

### Mobile
```bash
# No ESLint configured
# Use TypeScript for type-checking
tsc --noEmit
```

### Next.js Projects
```bash
cd snova-studio
npm run lint        # ESLint + Next.js default rules

cd ../snova-admin
npm run lint        # ESLint + Next.js default rules
```

### Sora Warrior
```bash
# No linter configured
# TypeScript check:
tsc --noEmit
```

---

## File and Folder Conventions

### Backend (`backend/`)
```
backend/
├── server.js              ← Entry point
├── src/
│   ├── app.js             ← Express app setup
│   ├── routes/            ← API endpoints (auth, characters, videos, etc.)
│   ├── middleware/        ← adminOnly, auth validation
│   ├── services/          ← Kie.ai API calls, video job logic
│   ├── database/          ← SQLite initialization and queries
│   └── models/            ← Data schema definitions
├── database.sqlite        ← SQLite file (auto-created)
├── .env                   ← Secrets (NOT in git)
└── package.json
```

### Mobile (`mobile/`)
```
mobile/
├── app/                   ← Expo Router screens (app/index.tsx, app/(tabs)/, etc.)
├── components/            ← Reusable UI (Button, Card, etc.)
├── constants/
│   └── Config.ts          ← API_BASE_URL, model pricing
├── hooks/                 ← Custom React hooks
├── services/              ← API calls
├── store/                 ← Zustand state management
└── assets/                ← Images, fonts, icons
```

### Snova Studio (`snova-studio/`)
```
snova-studio/
├── src/
│   ├── app/               ← Next.js app directory pages
│   ├── components/        ← Radix UI + custom components
│   ├── lib/               ← Utilities, API clients
│   └── types/             ← TypeScript interfaces
├── public/                ← Static files
└── package.json
```

### Snova Admin (`snova-admin/`)
```
snova-admin/
├── src/
│   ├── app/               ← Next.js admin pages
│   ├── components/        ← Admin UI
│   └── lib/               ← Supabase client, auth
├── public/
└── package.json
```

### Sora Warrior (`sora-warrior/`)
```
sora-warrior/
├── src/
│   ├── components/        ← React UI (Vite)
│   └── server.js          ← Express backend
├── dist/                  ← Built React app (after npm run build)
├── vite.config.ts
└── package.json
```

---

## Coding Rules

### Mandatory
1. **Secrets:** Never hardcode API keys, JWTs, or database URLs. Use `.env` only.
2. **Database:** SQLite is the source of truth. No in-memory caches without invalidation strategy.
3. **API Responses:** Return `{ success: true, data: {...} }` or `{ success: false, error: "msg" }` for consistency.
4. **Error Handling:** Catch and log errors; return meaningful HTTP status codes (400, 401, 403, 500).
5. **Authentication:** All non-public routes require valid JWT in Authorization header.
6. **Admin Checks:** Use `adminOnly` middleware for routes that modify coins or users.

### Preferred (but not enforced)
- TypeScript where used (mobile, web projects)
- Named exports over default exports
- Functional components (React) with hooks
- Zustand for mobile state (no Redux)
- Supabase row-level security (RLS) on web studio (if using Supabase)

---

## Safety Rules

### Secrets & Environment
- **Never commit `.env` files.** Use `.env.example` for templates.
- **Kie.ai API Key:** Only in backend `.env`. Frontend calls backend endpoints, never the API directly.
- **Database:** SQLite file (`database.sqlite`) is auto-created; do not commit it.
- **JWT Secret:** Change from default in production; use a long random string.

### Destructive Actions
- **Database Reset:** `rm backend/database.sqlite` (loses all user, coin, and video data)
- **User Deletion:** Currently no soft-delete; data is permanently lost
- **Force Deployments:** Use git tags before force-pushing to avoid losing commits

### API Limits
- **Kie.ai:** Rate-limited; cache results where possible
- **Video Jobs:** Can take 5-30 minutes; always use polling with exponential backoff, not tight loops
- **Coins:** Deduct only AFTER successful API response; refund on failure

### Cross-Project Sync
- **Mobile + Web Studio:** Both use same backend; changes to DB schema affect both clients
- **Admin Panel:** Has separate Next.js instance; ensure coin additions are reflected in main backend DB

---

## Definition of Done

A feature is complete when:

1. **Code Written & Type-Safe**
   - TypeScript compiles with no errors (`tsc --noEmit` or build succeeds)
   - No `any` types unless justified

2. **Tested Locally**
   - Feature works end-to-end (e.g., login → create character → upload image → generate video)
   - No console errors in browser or terminal
   - API calls visible in Network tab with correct status codes

3. **No Breaking Changes**
   - Existing API endpoints unchanged or deprecated gracefully
   - Database schema backwards-compatible (add columns, don't delete)

4. **Secrets Not Leaked**
   - No `.env` files in git
   - No API keys in comments, logs, or frontend code

5. **Documented**
   - Updated `.env.example` if new variables added
   - Added/updated comments for non-obvious logic
   - New API endpoints documented in CLAUDE.md

6. **Committed & Pushed**
   - Commit message format: `type(project): brief description`
   - Example: `feat(mobile): add character DNA flow`, `fix(backend): handle video polling timeout`
   - Push to GitHub branch (or create PR for review)

---

## PR / Commit Expectations

### Commit Message Format
```
type(project): short description

Optional body explaining the why, not the what.
```

**Types:** `feat`, `fix`, `refactor`, `docs`, `chore`, `test`  
**Projects:** `backend`, `mobile`, `snova-studio`, `snova-admin`, `sora-warrior`

### Examples
```
feat(backend): add coin refund on failed video generation
fix(mobile): resolve Config.ts API URL binding error
refactor(snova-studio): extract video polling into hook
docs(root): update AGENTS.md setup instructions
```

### PR Review Checklist
- [ ] No `.env` files or secrets in diff
- [ ] API responses follow `{ success, data/error }` format
- [ ] Database changes backwards-compatible
- [ ] New endpoints documented in CLAUDE.md
- [ ] Cross-project impacts considered (mobile ↔ web, admin ↔ backend)

### Before Merging
1. Run `npm run build` (or `npm run dev` + manual test) in affected projects
2. Verify database schema migration (if applicable)
3. Test on mobile with Expo Go (if touching shared backend)
4. Clear any feature flags or TODOs that were temp workarounds

---

## Video Generation Workflow

### Client → Backend → Kie.ai
1. Client submits video request (`POST /api/videos/generate`) with scene data
2. Backend calls `kie.ai/v1/video/submit` API
3. Backend stores job ID + status (`processing`) in SQLite
4. Client polls `GET /api/videos/{jobId}/status` every 5s (with backoff)
5. Backend queries Kie.ai for job status, updates SQLite
6. When complete, client downloads video from Kie.ai public URL

### Important
- **No sync waiting.** Video jobs are async; client must poll or subscribe to updates.
- **Coin Deduction:** Only after successful API submission, NOT after polling.
- **Refund:** If job fails, add coins back to user balance.
- **Polling Timeout:** If job has no status update for 30+ minutes, fail gracefully (don't infinite loop).

---

## Known Limitations & TODOs

- [ ] No automated test suite (manual testing only)
- [ ] Web studio (`snova-studio`) not fully integrated with admin panel (different deployments)
- [ ] Video polling uses naive interval; consider websockets for live updates
- [ ] No rate limiting on backend endpoints (add before production)
- [ ] No audit logs for admin coin additions
- [ ] Sora Warrior is POC; production pipeline not finalized

---

## Deployment Checklist

**Before pushing to production:**

1. **Backend**
   - [ ] `NODE_ENV=production` in `.env`
   - [ ] `JWT_SECRET` changed from default
   - [ ] Database backed up
   - [ ] Port 3000 accessible via domain (not localhost)
   - [ ] CORS configured for production domain

2. **Mobile**
   - [ ] `API_BASE_URL` points to production backend
   - [ ] Build signed APK/IPA via EAS
   - [ ] Test on actual device before release

3. **Web Projects**
   - [ ] `npm run build` passes without errors
   - [ ] Environment variables set in hosting platform
   - [ ] Database connection string updated
   - [ ] HTTPS enabled

4. **All Projects**
   - [ ] No `.env` files in git history (check `git log -p .env`)
   - [ ] All secrets rotated or regenerated
   - [ ] Documentation (CLAUDE.md, README) up-to-date

---

## Getting Help

- **Backend Issues:** Check `server.js` logs, verify `.env` is set correctly
- **Mobile Issues:** Run `npm run dev`, check Expo terminal output
- **API Issues:** Use Postman or `curl` to test endpoints directly
- **Database Issues:** Inspect `database.sqlite` with SQLite browser or check `backend/src/database/db.js`

---

*Last revised: 2026-04-26 by Claude*
