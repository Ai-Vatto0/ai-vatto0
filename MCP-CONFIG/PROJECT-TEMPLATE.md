# npx create-vatto-project – Projekt-Template Skizze

**Ziel:** Schnelles Bootstrapping neuer Vatto0-Projekte mit vordefinierten Stack, Memory, und MCP-Integration.

---

## 📦 NPM Package Structure

```bash
npx create-vatto-project my-new-app --type=mobile
```

### Package.json (Template)
```json
{
  "name": "create-vatto-project",
  "version": "1.0.0",
  "bin": "bin/cli.js",
  "dependencies": {
    "chalk": "^5.3.0",
    "inquirer": "^9.x",
    "fs-extra": "^11.x"
  }
}
```

---

## 🎯 Projekt-Typen

| Typ | Stack | Template-Inhalt |
|---|---|---|
| `mobile` | React Native + Expo + Node.js + Supabase | Full app scaffold |
| `ios` | Swift + SwiftUI | iOS-only scaffold |
| `backend` | Node.js + Express + SQLite | API scaffold |
| `research` | Python + Jupyter + Claude API | ML/LLM research |

---

## 🏗️ Scaffold-Struktur (mobile)

```
my-new-app/
├── backend/
│   ├── package.json
│   ├── .env (template)
│   ├── server.js (minimal Express)
│   └── database.sqlite (empty)
├── mobile/
│   ├── app.json
│   ├── package.json
│   ├── constants/Config.ts (template)
│   └── app/
│       ├── (tabs)/
│       └── (auth)/
├── MEMORY.md (session log template)
├── CLAUDE.md (project instructions)
├── .mcp.json (local MCP config)
└── .env.template
```

---

## 🔧 CLI Wizard Steps

1. **Project Name:** Interactive prompt
2. **Type Selection:** Mobile, iOS, Backend, Research
3. **Stack Confirmation:** Show default stack for type
4. **MCP Setup:** Ask if GitHub token available → auto-connect
5. **Create & Init Git:** Run `git init` + first commit
6. **Start Dev Env:** Show startup commands

---

## 📝 Auto-Generated Files

### CLAUDE.md (auto-filled)
```markdown
# {{PROJECT_NAME}} – CLAUDE.md

## Projektübersicht
{{USER_DESCRIPTION}}

## Technologie-Stack
- Frontend: {{FRONTEND}}
- Backend: {{BACKEND}}
- Database: {{DATABASE}}

## Startup
\`\`\`bash
npm run dev
\`\`\`

## Memory Log
[Session logs go here]
```

### MEMORY.md (empty template)
```markdown
## [YYYY-MM-DD] Session Log
- **Aufgabe:** 
- **Geänderte Dateien:** 
- **Status:** ✓abgeschlossen
- **Nächster Schritt:** 
```

### .env.template
```
NODE_ENV=development
PORT=3000
DATABASE_PATH=./database.sqlite
# Add project-specific vars below
```

---

## 🚀 CLI Commands (Pseudo-Code)

```bash
#!/usr/bin/env node

const inquirer = require('inquirer');
const fs = require('fs-extra');
const path = require('path');

async function main() {
  const answers = await inquirer.prompt([
    { type: 'input', name: 'projectName', message: 'Project Name?' },
    { type: 'list', name: 'type', choices: ['mobile', 'ios', 'backend', 'research'] },
    { type: 'confirm', name: 'hasGithubToken', message: 'Have GitHub token?' }
  ]);

  // Copy template
  const templateDir = path.join(__dirname, '../templates/', answers.type);
  fs.copySync(templateDir, `./${answers.projectName}`);

  // Update CLAUDE.md
  updateClaudeFile(answers.projectName, answers.type);

  // Git init
  execSync(`cd ./${answers.projectName} && git init && git add . && git commit -m "Initial scaffold"`);

  console.log('✓ Project created!');
  console.log(`Next steps: cd ${answers.projectName} && npm install && npm run dev`);
}

main();
```

---

## 🔗 Integration mit Global MCP Hub

Beim Erstellen wird das neue Projekt automatisch:
1. ✅ In `MASTER-MEMORY.md` hinzugefügt
2. ✅ GitHub Repo-Struktur entdeckt (falls vorhanden)
3. ✅ Supabase Schema-Template bereitgestellt
4. ✅ Memory MCP mit lokalem MEMORY.md verbunden

---

## 📌 MVP Roadmap

| Phase | Deliverable | ETA |
|---|---|---|
| **Phase 1** | CLI bin + inquirer setup | 2026-05-07 |
| **Phase 2** | Mobile template (full scaffold) | 2026-05-08 |
| **Phase 3** | Backend + iOS templates | 2026-05-10 |
| **Phase 4** | NPM publish (public) | 2026-05-15 |

---

**Owner:** Vatto | **Status:** 🔧 In Design | **Last Updated:** 2026-05-06
