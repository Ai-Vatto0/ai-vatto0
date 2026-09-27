# PROJEKT: TIKTOK SHOP / LYRA ADS

**Rolle:** Vatto ist TikTok-Shop-**Creator** – er produziert KI-generierte
Produktwerbung für Shop-Artikel und verdient über Provision.
**Status:** Kerngeschäft, aktuell durch Richtlinienlage stark eingeschränkt.

---

## AKTIVE REGELN

→ `memory/regeln/lyra-ads-v4.1-aktiv.md` (Stufe 2, verbindlich)
→ `memory/regeln/lyra-ads-master-v4.0.md` (Stufe 3, Arbeitsdetails)
→ `memory/regeln/tiktok-compliance.md` (⚠️ noch zu füllen)

## STANDARDS AUF EINEN BLICK

| Parameter | Wert |
|---|---|
| Format | 9:16 vertikal |
| Länge | 13 s Standard (bis 15 s nur Outro/CTA) |
| Inhalt | 1 Produkt, 1 Use Case, 1 Haupt-Proof |
| Schnitt | max. 3 Shots / 2 Schnitte |
| Dialog | Deutsch, ca. max. 26 Wörter inkl. CTA |
| Prompt | Englisch, max. 2.300 Zeichen (Grok) |
| Standard-CTA | „Jetzt im TikTok Shop." |
| Hashtags | genau 5 |

## MODELL-SETUP

**Render-Plattform:** Kie.ai

| Zweck | Modell |
|---|---|
| Bild (Startframe) | GPT Image 2 via KIE |
| Bild-Alternative | Flux 2 Pro / Seedream 5 Lite – nur Test oder klarer Vorteil |
| **Video-Standard** | **Grok Imagine Video 1.5** – 13 s, 9:16, 720p |
| Video-Alternative | Seedance 2 Fast/Mini – nur bei Multireferenz, Insert, Grok-Problem |
| Auf Wunsch | Kling, Veo 3.1 – mit eigenem Profil, Syntax nie blind kopieren |

**GPT Image 1.5 ist nie ein Ersatz für GPT Image 2.**

**Renderkosten sind hier absichtlich nicht fixiert** – Preise ändern sich. Vor jedem
Bezahlrender aktuelle Kosten nennen oder ehrlich sagen, dass sie nicht sicher
verfügbar sind.

---

## VORHANDENES MATERIAL IM REPO

- `TIKTOK-SHOP/FRAMEWORK.md` – Standalone Prompt-Generator mit **Character-DNA Library**
  und **Product-DNA Library**. Enthält u. a. den Charakter „Trusted Guy 40-50"
  (45–50 J., graues Haar, Arbeitskleidung, Werkstatt-Setting, vertrauenswürdig,
  kompetent, nicht schauspielernd) und ein Produktbeispiel „Bohrer Pro 20V".
  Die Referenzbild-URLs sind noch Platzhalter.
- `TIKTOK_PRODUCT_VIDEO_SYSTEM.md` (Repo-Root)

## BEVORZUGTE SALES-PERSONAS (Patch 4.1)

Priorisiert: **Autohändler** · **Marktschreier Light** · **Kumpel** · **Skeptiker**

Creator-Sprache darf natürlich sein: „Ey", „Boah", „mega", „geil", „Hammer",
„Warte, warte", „Bruder".

**Hauptad = immer sichtbarer, deutsch sprechender Creator**, außer Vatto sagt
ausdrücklich etwas anderes. Silent, ASMR, Packshot oder Musik-only nie automatisch.

---

## OFFENE ARBEITSPUNKTE

- [ ] Compliance-Zusammenfassung einarbeiten
- [ ] Verstoß-Log aufbauen – die real kassierten Verstöße sind die wertvollsten Daten
- [x] Videoschnitt-Workflow definieren → `memory/regeln/video-schnitt-workflow.md`
- [ ] Safe-Zone-Werte an echten Screenshots aus Vattos Uploads prüfen
- [ ] KI-Anbieter für Bild/Video anbinden (nach Abschluss Setup)
- [ ] Character-DNA: echte Referenzbild-URLs eintragen
- [ ] Learning V4.0 nachladen → belegte Winner/Fehler sind derzeit unbekannt
