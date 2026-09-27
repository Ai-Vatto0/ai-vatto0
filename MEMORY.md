# MEMORY – Laufendes Arbeitsprotokoll

> Einstieg: `MASTER-MEMORY.md`. Diese Datei = was passiert ist und was ansteht.
> Neueste Einträge oben.

---

## AKTUELLER ARBEITSSTAND

**Datum:** 2026-09-27
**Aktiver Fokus:** Gedächtnis aufgebaut. Als Nächstes: **Videoschneiden**.

### Offene Punkte
- [ ] TikTok-Compliance-Zusammenfassung von Vatto einlesen → `memory/regeln/tiktok-compliance.md`
- [ ] `02_LYRA_ADS_MASTER_V4.1.txt`, `03_COMPLIANCE_V4.0`, `04_LEARNING_V4.0` nachladen
- [ ] Videoschnitt-Workflow klären: welches Tool, welches Ausgangsmaterial, welches Ziel
- [ ] Optional: Gedächtnis vom alten PC übernehmen (`C:\Users\rober\ki-app\`)

---

## SESSION-LOG

### 2026-09-27 – Gedächtnis von Null aufgebaut

**Ausgangslage:** Claude-Setup auf dem alten PC (claude-flow + Memory-MCP) war zwar
im Repo konfiguriert, aber komplett funktionslos:

1. Alles auf Windows verdrahtet (`cmd /c`, `%CLAUDE_PROJECT_DIR%`) → in Linux-/Cloud-
   Sessions scheitert der claude-flow MCP-Server mit `ENOENT: cmd`, alle Hooks laufen
   still ins Leere.
2. Die eigentlichen Gedächtnisdateien (`MEMORY.md`, `MASTER-MEMORY.md`, `memory/`)
   zeigten auf absolute Pfade unter `C:\Users\rober\ki-app\` und waren **nie
   committet** → Inhalt existierte nur auf dem alten, nicht mehr genutzten Rechner.

**Entscheidung:** Gedächtnis als normale Markdown-Dateien **im Repo**, nicht über
einen MCP-Server. Begründung: reist auf jeden Rechner und in jede Cloud-Session mit,
kein Setup, keine Windows-Abhängigkeit, keine laufenden Kosten. Der claude-flow-
Apparat (15 Agenten, HNSW, Neural, Daemon) bleibt ungenutzt – für diesen Zweck
überdimensioniert.

**Gemacht:**
- `MASTER-MEMORY.md` + `MEMORY.md` + `memory/`-Struktur angelegt
- Lyra Ads V4.1 als aktives Regelwerk aufgenommen, V4.0-Master + V1.1-Engine als Archiv
- Projektnotizen: TikTok Shop, Prompt-Master, Higgsfield
- MCP- und Hook-Konfiguration plattformneutral gemacht, Windows-Variante als Vorlage
- Verweis in `CLAUDE.md` eingetragen

**Projekt-Scope auf Wunsch reduziert:** Snova Studio, menu-wall-app und sora-warrior
sind bewusst **nicht** im Gedächtnis. Ordner bleiben im Repo unangetastet.

**Von Vatto festgehalten:** TikTok-Richtlinien lassen KI-Werbung derzeit kaum zu,
Verstöße bereits bei minimalster Abweichung.

---

## BELEGTE ERKENNTNISSE (Lernupdate-Bereich)

*Noch leer – die Historie vom alten PC fehlt.*

Aufnahme nur bei echtem Beleg: reale Zahlen, wiederholbares Muster oder klare
Nutzerbeobachtung. Kein Einzelausreißer, keine Vermutung.

| Datum | Erkenntnis | Beleg | Typ |
|---|---|---|---|
| – | – | – | – |
