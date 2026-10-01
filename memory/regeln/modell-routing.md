# Modell-Routing & Delegation

> **Gesetzt von Vatto, 01.10.2026.** Gilt in jeder Session, automatisch geladen über `CLAUDE.md`.
> Originaltext von Vatto (Englisch), darunter verbindliche Ergänzungen.

## Core Operating Rule

Do not perform substantial implementation work yourself if the task can be delegated effectively.

Use sub-agents for:
- independent workstreams
- parallelizable research or implementation
- repository exploration across multiple areas
- isolated tasks that do not require the full conversation context
- tasks where delegation reduces the main agent's context usage

For trivial tasks, single-file edits, simple lookups, or work that depends heavily on the current context, work directly instead of spawning a sub-agent.

## Model Routing

Do not default to the most expensive or most capable model for every task.

Choose the cheapest model that can reliably complete the task:

- **Haiku / lightweight model:** simple searches, file discovery, formatting, summaries, repetitive edits, straightforward transformations, basic checks
- **Sonnet / mid-tier model:** normal coding tasks, debugging, implementation, refactoring, repository analysis, most sub-agent work
- **Opus / highest-capability model:** complex architecture, difficult debugging, ambiguous multi-step reasoning, high-stakes decisions, or tasks where weaker models have already failed

When creating a sub-agent, explicitly select an appropriate model whenever model selection is available.

Prefer cheaper models for sub-agents unless the task clearly requires stronger reasoning.

## Delegation Strategy

Before starting a substantial task:

1. Break the task into independent workstreams.
2. Decide which workstreams can be delegated.
3. Assign each delegated task the lowest-cost model capable of completing it well.
4. Run independent sub-agents in parallel when possible.
5. Keep the main agent focused on orchestration, synthesis, validation, and final integration.

Avoid unnecessary agent spawning. Delegation should reduce cost, context usage, or execution time — not add overhead.

## Escalation

Start with the lowest reasonable model.

Escalate to a stronger model only when:
- the task requires deeper reasoning,
- the result is incomplete or unreliable,
- the sub-agent reports uncertainty,
- multiple attempts have failed,
- architectural or cross-system judgment is required.

Do not use Opus merely because it is available.

## Final Validation

The main agent remains responsible for:
- reviewing delegated output
- checking consistency
- catching obvious errors
- integrating changes
- ensuring the final result satisfies the original request

Optimize for:
1. correctness
2. low unnecessary token/context usage
3. low model cost
4. fast execution

---

## ERGÄNZUNGEN (verbindlich, gehen dem Originaltext vor)

1. **Modell immer explizit setzen.** Ein Sub-Agent ohne `model`-Angabe erbt das
   Hauptmodell (meist Opus). Dann spart die Delegation nichts.
2. **Faustregel für die Schwelle:** Auslagern erst, wenn die Teilaufgabe voraussichtlich
   **mehr als ca. 5 Dateien zu lesen** oder **mehrere unabhängige Suchen** braucht, oder
   wenn sie parallel zu anderer Arbeit laufen kann. Darunter: selbst erledigen. Jeder
   Sub-Agent startet kalt und erarbeitet sich den Kontext neu.
3. **Kein Haiku für Kreatives oder Urteile.** Hooks, Werbewinkel, Bild- und Videoprompts,
   Compliance-Prüfung (`tiktok-compliance.md`) und Produkttreue: mindestens Sonnet,
   Endabnahme immer im Hauptagenten.
4. **Kostenpflichtige Aktionen nie durch Sub-Agents.** KIE-, fal-, Yapper- und
   Higgsfield-Renders, Käufe sowie Pushes nach außen startet nur der Hauptagent, und zwar
   erst nach Freigabe durch Vatto (Regel aus `lyra-ads-v4.1-aktiv.md` und
   `tiktok-video-maschine.md`).
5. **Grenze:** Das Modell des Hauptchats lässt sich nicht von innen ändern. Das macht
   Vatto beim Start mit `/model`. Für reine Routine-Sessions lohnt sich Sonnet als
   Hauptmodell mehr als jedes Routing.
