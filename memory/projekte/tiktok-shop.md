# PROJEKT: TIKTOK SHOP / LYRA ADS

**Rolle:** Vatto ist TikTok-Shop-**Creator** – er produziert KI-generierte
Produktwerbung für Shop-Artikel und verdient über Provision.
**Status:** Kerngeschäft, aktuell durch Richtlinienlage stark eingeschränkt.

---

## AKTIVE REGELN

→ `memory/regeln/tiktok-video-maschine.md` – **Faruks Weg = Standard**
→ `memory/regeln/tiktok-compliance.md` – strengere Regel gewinnt
→ `memory/regeln/lyra-ads-v4.1-aktiv.md` – nur für klassische KI-Produkt-Renders auf Wunsch

## STANDARDS AUF EINEN BLICK (Faruk)

| Parameter | Wert |
|---|---|
| Bestes Format | **A) UGC-Overlay**: KI-Creator unten, echtes Shop-Bild oben |
| Immer bevorzugen | **D) Echtes Video**, wenn Material da ist |
| Format | 9:16, Export 1080×1920 |
| Länge | 8–11 s (TikTok-One-Aufgaben oft ≥ 15 s) |
| VO | 25–32 Wörter für 10 s, Gefühl statt Datenblatt |
| Produkt in KI-Szene | **nie** |
| CTA | „Jetzt im TikTok Shop." gelb, groß, allein am Ende |
| Caption | „Werbung · [Hook] [Emoji]" + 1 Zeile Nutzen + genau 5 Hashtags |
| Safe Zone | oben 150, rechts 140, unten 400 px |
| Frequenz | 2–3 Videos/Tag, nie zwei zum selben Produkt hintereinander |

## MODELL-SETUP

| Zweck | Weg | Kosten |
|---|---|---|
| KI-Creator-Clip | MiniMax H3 Max Turbo über fal.ai, 10 s, 768P, 9:16 | ≈ 0,20 $ / Clip (Faruk) |
| alternativ | MiniMax H3 über Yapper | ≈ 35 Credits / 10 s |
| Voiceover | Yapper eleven_v3 | kostenlos (Faruk) |
| klassischer Produkt-Render (nur auf Wunsch) | Grok Imagine 1.5 / GPT Image 2 über Kie.ai | vor Render nennen |

Kosten vor jedem bezahlten Render **aktuell** nennen – Faruks Werte sind Stand 27.09.2026.

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
