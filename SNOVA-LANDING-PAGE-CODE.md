# Snova Studio – Landing Page Code

**Status:** ✅ Live auf https://snova-studio.vercel.app  
**Pfad:** C:/Users/rober/ki-app/snova-studio  
**Type:** Next.js 14 + React 18 + TypeScript + Tailwind CSS  
**Database:** Supabase (rzedpgrjqgjeyhlzbrok.supabase.co)

---

## 📁 Projektstruktur

```
snova-studio/
├── src/
│   ├── app/
│   │   ├── (app)/                    # Geschützte Routes (mit Auth)
│   │   │   ├── page.tsx              # 🏠 HOME/DASHBOARD
│   │   │   ├── characters/
│   │   │   │   ├── page.tsx          # 📚 CHARACTER LIBRARY
│   │   │   │   ├── create/
│   │   │   │   │   └── page.tsx      # ✨ CHARACTER SETUP (Character DNA Flow)
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx      # Character Detail
│   │   │   ├── create-studio/
│   │   │   │   └── page.tsx          # 🎬 CREATE STUDIO (Herzstück)
│   │   │   ├── projects/
│   │   │   │   └── page.tsx          # 📹 PROJECTS TIMELINE
│   │   │   ├── profile/
│   │   │   │   └── page.tsx          # 👤 PROFILE & WALLET
│   │   │   ├── admin/                # Admin-Panel
│   │   │   ├── layout.tsx            # App-Layout (TopBar + BottomNav)
│   │   │   └── maintenance/
│   │   │
│   │   ├── (auth)/                   # Login/Register (keine Auth nötig)
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   │
│   │   ├── api/                      # API Routes
│   │   │   ├── generate/             # Generate (Image/Video/Story)
│   │   │   ├── prompt-assist/        # Anthropic Prompt Studio
│   │   │   └── jobs/[jobId]/         # Job Status Query
│   │   │
│   │   ├── layout.tsx                # Root Layout (Fonts, Meta, PWA)
│   │   └── auth/callback/            # Magic Link Callback
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── TopBar.tsx            # Funken-Balance + User Menu
│   │   │   └── BottomNav.tsx         # Navigation (Home, Create, Projects, Profile)
│   │   │
│   │   ├── characters/
│   │   │   ├── CharacterCard.tsx
│   │   │   ├── CharacterCreationScreen.tsx
│   │   │   ├── CharacterCreateWizard.tsx
│   │   │   └── ReferenceImageGrid.tsx
│   │   │
│   │   ├── create/
│   │   │   ├── CreateStudioClient.tsx
│   │   │   └── SceneGenerator.tsx
│   │   │
│   │   ├── projects/
│   │   │   └── ProjectCard.tsx
│   │   │
│   │   ├── profile/
│   │   │   ├── SetPasswordForm.tsx
│   │   │   ├── TopupRequestForm.tsx
│   │   │   └── TransactionList.tsx
│   │   │
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   └── ConfirmLoginButton.tsx
│   │   │
│   │   ├── admin/
│   │   │   ├── BanButton.tsx
│   │   │   ├── TokenSenderForm.tsx
│   │   │   └── SettingsToggle.tsx
│   │   │
│   │   └── wallet/
│   │       └── WalletTopupSection.tsx
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts             # Server Component Client
│   │   │   └── server.ts             # Service Role (privat)
│   │   │
│   │   ├── actions/
│   │   │   ├── character-actions.ts
│   │   │   ├── scene-actions.ts
│   │   │   ├── admin-actions.ts
│   │   │   ├── profile-actions.ts
│   │   │   └── settings-actions.ts
│   │   │
│   │   ├── kie-api.ts               # Kie.ai API Calls
│   │   └── utils.ts
│   │
│   ├── styles/
│   │   └── globals.css              # Design System (Farben, Components)
│   │
│   └── types/
│       └── index.ts                 # TypeScript Types
│
├── public/
│   ├── favicon.svg
│   ├── icon.svg
│   ├── manifest.json
│   └── images/                      # Character Ambient Assets
│
├── .env.local                        # Credentials (nicht in Git!)
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── next.config.mjs
└── CLAUDE.md                         # Project Guidelines

```

---

## 🎨 Design System

### Colors (CSS Variables)
```css
--color-bg-primary:    #0a0612      /* Tiefes Dunkel-Violett */
--color-bg-secondary:  #110d1f      /* Karten-Hintergrund */
--color-bg-tertiary:   #1a1330      /* Erhöhte Panels */
--color-accent-purple: #7c3aed      /* Haupt-Violett */
--color-accent-blue:   #2563eb      /* Neon-Blau */
--color-accent-pink:   #ec4899      /* Sakura-Pink */
--color-accent-glow:   #a78bfa      /* Glow-Violett hell */
--color-text-primary:  #f1f0f5      /* Haupttext */
--color-text-secondary:#9ca3af      /* Sekundärtext */
--color-text-muted:    #6b7280      /* Dezenter Text */
--color-border:        #2d1f4a      /* Borders */
--color-border-glow:   rgba(124, 58, 237, 0.25)
```

### Fonts
- **Display/Headlines:** Cinzel (Google Fonts) – edel, anime-artig
- **Body:** Inter – lesbar, clean
- **Mono:** JetBrains Mono – für Codes/Prompts

### Components
- `.glass-panel` – Glassmorphism (backdrop blur + borders)
- `.btn-primary` – Gradient Button (Purple→Blue)
- `.btn-secondary` – Secondary Button
- `.btn-ghost` – Ghost Button
- `.input-snova` – Custom Input
- `.card-snova` – Card Container
- `.funken-badge` – Funken Badge
- `.tag-snova` – Anime Tag

---

## 🔐 Sicherheit

### API-Keys (`.env.local` – NIEMALS in Git!)
```
NEXT_PUBLIC_SUPABASE_URL=https://rzedpgrjqgjeyhlzbrok.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
KIE_API_KEY=2e3296d23d6cfdff98baf97361035764
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_APP_URL=https://snova-studio.vercel.app
```

### Architektur-Prinzip
- **Frontend** → `createClient()` (Supabase SSR) → respektiert RLS
- **Server Actions** → geschützte Mutations
- **API-Keys nur Server-seitig** – Frontend hat keinen Zugriff

---

## 💰 Funken-System

| Aktion | Kosten |
|--------|--------|
| Character erstellen (3 Ref-Bilder) | 50 Funken |
| Bild generieren (Ideogram) | 10 Funken |
| Bild generieren (Nano Banana) | 8 Funken |
| Video 6s (Grok) | 40 Funken |
| Video 8s (Veo 3.1 Fast) | 60 Funken |
| Prompt Studio Assist | 5 Funken |
| Story generieren | 15 Funken |

**Nutzer sehen IMMER nur "Funken"** – Provider-Namen werden versteckt.

---

## 🚀 Commands

```bash
npm run dev         # Dev-Server (Port 3000)
npm run build       # Production Build
npm run start       # Start Production Server
npm run lint        # ESLint
npm run type-check  # TypeScript Type-Check
```

---

## 🌐 Deployment

**Vercel (Production)**
- Auto-Deploy bei Git Push
- Environment Variables in Vercel Dashboard setzen

**URL:** https://snova-studio.vercel.app

---

## 📊 Supabase Datenmodell

### Haupttabellen
- `auth.users` – Supabase Auth
- `profiles` – User Profile (display_name, is_banned, role)
- `wallets` – Funken-Balance
- `wallet_ledger` – Transaktionsverlauf
- `characters` – Character DNA (name, visual_style, personality_traits, etc.)
- `character_images` – Referenzbilder (position 1-8, signed URLs)
- `story_scenes` – Generierte Szenen
- `generation_jobs` – Alle KI-Jobs mit Status-Tracking
- `generation_cost_rules` – Kosten-Konfiguration
- `app_settings` – Feature Flags (maintenance_mode, etc.)

### Row Level Security (RLS)
Nutzer sehen **NUR ihre eigenen Daten** – alles andere blockiert.

---

## ✅ Next Steps

1. Ändere API-Keys in `.env.local`
2. `npm install`
3. `npm run dev`
4. Öffne http://localhost:3000
5. Login mit Magic Link
6. Erstelle ersten Anime-Character
7. Teste Character DNA Flow
8. Generiere Bilder/Videos

---

**Kontakt:** ai-vatto0@gmx.de
**Version:** 0.1.0 Beta
