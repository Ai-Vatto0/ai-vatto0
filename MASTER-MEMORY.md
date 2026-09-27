# MASTER-MEMORY – Vatto (Robert)

> **Zweck:** Zentraler Gedächtnis-Index. Erste Datei, die bei einer neuen Session gelesen wird.
> **Regel:** Diese Datei bleibt kurz. Details liegen in `memory/`. Keine Duplikate.
> **Letzte Pflege:** 2026-09-27

---

## 1. WER UND WAS

- **Person:** Vatto (Robert), vatto0202@googlemail.com
- **Hauptaktivität:** TikTok-Shop **Creator** – KI-generierte Produktwerbung (Affiliate/Provision)
- **Partner:** Faruk (@terrortalesstudio) – arbeitet viel mit Claude; seine Arbeitsweisen gelten als Vorgabe
- **Arbeitssprache:** Deutsch. Prompts/Code dürfen Englisch sein.
- **Grundhaltung (von ihm gesetzt):** Wahrheit vor Zustimmung. Wirkung vor Dekoration.
  Einfachheit vor unnötiger Technik. Klare Empfehlung statt Optionsliste. Tokens sparen.

---

## 2. AKTIVE PROJEKTE

| Projekt | Ort | Zweck | Detail |
|---|---|---|---|
| **TikTok Shop / Lyra Ads** | `TIKTOK-SHOP/`, `memory/regeln/` | KI-Werbevideos für TikTok Shop – **Kerngeschäft** | `memory/projekte/tiktok-shop.md` |
| **Prompt-Master** | `prompt-master/SKILL.md` | Claude-Skill: Copy-ready Prompts für 15+ AI-Tools | `memory/projekte/prompt-master.md` |
| **Higgsfield** | `HIGGSFIELD_SETUP.md` | MCP-Pipeline für App-Promo-Videos (getrennt von Kie.ai) | `memory/projekte/higgsfield.md` |
| **Video-Maschine (Faruk)** | `tools/video-maschine/`, Skill `tiktok-video-maschine` | Formate, ffmpeg-Schnitt, VO, Captions, Posting | `memory/regeln/tiktok-video-maschine.md` |
| **Werkzeuge & Konnektoren** | `.mcp.json`, `.claude/settings.json` | Plugins, MCP-Server, Keys, gesperrte Hosts | `memory/projekte/werkzeuge-und-konnektoren.md` |
| **Video-Schnitt (Remotion)** | `video-edit/` | KI-Clips zu fertigem TikTok montieren, Hook-/CTA-Overlays | `memory/regeln/video-schnitt-workflow.md` |

**Bewusst NICHT im Gedächtnis** (auf Wunsch von Vatto, 27.09.2026):
Snova Studio, menu-wall-app, sora-warrior. Die Ordner bleiben im Repo, werden aber
nicht als Kontext geladen. `CLAUDE.md` beschreibt weiterhin Snova Studio – das ist
die Repo-Doku, nicht das Gedächtnis.

---

## 3. AKTIVE REGELWERKE (Hierarchie)

**Entscheidung Vatto, 27.09.2026: Faruks Werbe-Weg ist der Standard.**

1. **Aktuelle Anweisung im Chat**
2. `memory/regeln/tiktok-video-maschine.md` – **Faruks Video-Maschine = Standard** für
   jedes TikTok-Shop-Video (Formate, Länge, Modell, VO, Schnitt, Captions, Posting)
3. `memory/regeln/tiktok-compliance.md` – Compliance. **Hier gewinnt immer die
   strengere Regel**, egal aus welchem System
4. `memory/regeln/video-schnitt-workflow.md` – Remotion-Ablauf (Schnittplan → Freigabe → Vorschau → Frame-QA)
5. `memory/regeln/lyra-ads-v4.1-aktiv.md` + `lyra-ads-master-v4.0.md` – **nur noch** für
   klassische KI-Produkt-Renders mit Startframe, wenn Vatto das ausdrücklich will,
   und als Quelle für Evidenz-, QA- und Gate-Details, die Faruk nicht regelt
6. `memory/archiv/` – historisch, **nie** mit aktiven Regeln mischen oder reaktivieren

---

## 4. AKTUELLER STATUS UND SCHMERZPUNKT

**Stand 27.09.2026 (Aussage Vatto):**
TikTok-Richtlinien machen KI-generierte Werbung aktuell **kaum noch möglich** –
es gibt Verstöße bereits bei minimalster Abweichung. Das ist derzeit das
**Hauptproblem**, nicht die Creative-Qualität.

**Konsequenz für die Arbeit:** Compliance ist nicht länger ein Häkchen am Ende,
sondern das begrenzende Nadelöhr. Vor jedem Render ist die Frage nicht
„verkauft das?", sondern **„übersteht das die Prüfung?"**.

**Videoschnitt:** Remotion installiert und verifiziert (27.09.2026).
**Danach geplant:** Anbindung an KI-Anbieter für Bild- und Videogenerierung.

---

## 5. OFFENE LÜCKEN (ehrlich)

| Fehlt | Auswirkung | Behebung |
|---|---|---|
| `02_LYRA_ADS_MASTER_V4.1.txt` | Nur V4.0 vorhanden; Patch 4.1 überschreibt sie punktuell | Datei nachladen |
| `03_COMPLIANCE_LYRA_ADS_V4.0.txt` | Compliance-Detailregeln fehlen | Vatto lädt Zusammenfassung nach |
| `04_LEARNING_LYRA_ADS_V4.0.txt` | Belegte Winner/Fehler aus der Vergangenheit fehlen | Datei nachladen |
| Gedächtnis vom alten PC | Alles vor 27.09.2026 ist verloren | `MEMORY.md`, `MASTER-MEMORY.md`, `memory\` von `C:\Users\rober\ki-app\` holen |
| ~~KIE-Key~~ | ✅ funktioniert seit 27.09.2026 | – |
| ~~Yapper-Konnektor~~ | ✅ verbunden 27.09.2026 | – |
| `Lyra_Ads_Creative_Engine_V1.0_skill.pdf` | nicht auslesbar (kein extrahierbarer Text) | als `.md`/`.txt` nachladen, falls aktiv gebraucht |

---

## 6. WIE DIESES GEDÄCHTNIS GEPFLEGT WIRD

- **`MEMORY.md`** = laufendes Arbeitsprotokoll. Was zuletzt gemacht wurde, was als
  Nächstes kommt, welche Entscheidungen gefallen sind.
- **`memory/regeln/`** = dauerhafte Regeln. Änderung nur auf ausdrückliches
  **„Lernupdate"** von Vatto.
- **`memory/sessions/`** = Übergaben bei Chatwechsel (`CHATRESET`).
- **`memory/archiv/`** = überholte Versionen. Lesen erlaubt, anwenden nicht.

**Nur belegte, wiederholbare Erkenntnisse werden dauerhaft gespeichert.**
Ein schönes Video, viele Views oder ein Einzelausreißer ist keine Regel.
