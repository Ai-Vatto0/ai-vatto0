# VIDEO-SCHNITT-WORKFLOW (Remotion)

**Quelle:** Anleitung von Farouk (Vattos Partner, arbeitet viel mit Claude), übernommen am 27.09.2026
**Status:** AKTIV – verbindlicher Ablauf für jeden Schnitt
**Werkzeug:** Offizielles Remotion-Plugin für Claude Code + Projekt `video-edit/`

---

## GRUNDSATZ

Kein Tool macht Videos „nachweislich viral". Remotion verbessert Schnitt,
Texteinblendungen und Präsentation – **Reichweite garantiert es nicht.**
Passt zu Lyra: Sek. 6 ist ein Messsignal, keine Push-Garantie.

## WERKZEUGWAHL

| Ziel | Werkzeug | Status |
|---|---|---|
| vorhandene KI-Clips zu fertigem TikTok montieren, Hook- und CTA-Texte, Motion Graphics, Branding | **Remotion (offizielles Plugin)** | ✅ installiert, Render verifiziert |
| langes Video (Podcast, Gespräch, Screen-Recording) automatisch in mehrere Shorts schneiden | claude-shorts (Community) | ❌ bewusst nicht installiert, siehe unten |
| noch ausgefeilteres Motion Design | Claude Remotion Skill (Community) | nicht geprüft, erst bei Bedarf |

---

## ABLAUF – VERBINDLICH

1. **Material sichten.** Nur Vattos bereitgestelltes Material verwenden. Dauer,
   Auflösung und Inhalt jedes Clips erfassen.
2. **Schnittplan zuerst.** Reihenfolge, Timing je Clip, Hook-Text, Texteinblendungen,
   CTA, Übergänge. **Noch kein Render.**
3. **Freigabe durch Vatto abwarten.**
4. **Vorschau-Render** nach Freigabe.
5. **Frame-QA:** mehrere Frames als Standbild prüfen – Lesbarkeit, Safe Zone,
   Schnittfehler, Product Match, Text-Tippfehler.
6. **Final-Render** erst, wenn Frame-QA sauber ist.

## FAROUKS STANDARD-AUFTRAG

> Erstelle aus meinen vorhandenen Videoclips einen vertikalen TikTok-Edit im Format
> 9:16. Nutze nur mein bereitgestelltes Material. Setze in den ersten Sekunden einen
> klar lesbaren Hook, schneide auf die stärksten Bildmomente, ergänze dynamische,
> aber gut lesbare deutsche Texteinblendungen und passende Motion-Graphics. Halte
> Text von den typischen Bedienflächen am rechten und unteren Bildrand fern. Zeige
> mir zuerst einen Schnittplan mit Reihenfolge und Timing; rendere erst nach meiner
> Freigabe eine Vorschau und prüfe anschließend mehrere Frames auf Lesbarkeit und
> Schnittfehler.

---

## VERZAHNUNG MIT LYRA ADS

Lyra verlangt ausdrücklich: *„Auffällige Hook-/CTA-Texte als echte Overlays planen"*
und *„später echt in TikTok/Schnitt einfügen"*. **Remotion ist genau dieses Werkzeug.**
Text wird hier sauber gesetzt statt vom KI-Videomodell verzerrt generiert.

Im Schnitt gilt trotzdem:
- **Keine TikTok-Logos, Badges oder nachgebaute Shop-UI** – auch nicht als Overlay
- **Keine Preise, Coupons, Rabatte** eingebrannt, außer aktuell verifiziert und stabil;
  bei schwankendem Preis nie
- keine erfundenen Claims in Texteinblendungen – dieselben Regeln wie im Dialog
- Hook-Text ergänzt die gesprochene Zeile, wiederholt sie nicht wörtlich
- Text kurz, groß, mobil lesbar: meist 3–5 Wörter pro Zeile
- Standard-CTA: „Jetzt im TikTok Shop."
- AIGC-Kennzeichnung über TikTok selbst, nicht durch ein eigenes Fake-Label

## SAFE ZONE (1080 × 1920)

| Rand | Freihalten | Grund |
|---|---|---|
| oben | 150 px | Status- und Suchleiste |
| rechts | 140 px | Like-, Kommentar-, Teilen-Buttons |
| unten | 420 px | Caption, Nutzername, Sound, Shop-Link |
| links | 60 px | Randabstand |

⚠️ **Arbeitswerte, keine offiziellen TikTok-Zahlen.** TikTok veröffentlicht keine
exakten Pixelmaße. Bei Shop-Videos mit Produktanker unten eher großzügiger planen.
Anpassen, sobald echte Screenshots aus Vattos Uploads vorliegen.

---

## TECHNIK

**Projekt:** `video-edit/` (Remotion 4.0.529, React 19, TypeScript)

| Aufgabe | Befehl (in `video-edit/`) |
|---|---|
| Abhängigkeiten installieren | `npm i` |
| Vorschau im Browser | `npx remotion studio` |
| Video rendern | `npx remotion render <CompositionId> out/<name>.mp4` |
| Einzelframe prüfen | `npx remotion still <CompositionId> out/f.png --frame=<n>` |
| Typprüfung | `npx tsc --noEmit` |

- Eigene Clips gehören nach `video-edit/public/`, Ausgaben landen in `video-edit/out/`
  (gitignored).
- **Cloud-Sessions:** Remotion will seinen Browser von `remotion.media` laden – dieser
  Host ist dort gesperrt. `remotion.config.ts` nutzt deshalb automatisch den
  vorinstallierten Chromium, wenn vorhanden. Lokal greift das nicht, dort lädt
  Remotion seinen eigenen Browser.
- Eigener Browserpfad möglich über `REMOTION_BROWSER_EXECUTABLE`.
- Remotion bringt eigenes ffmpeg mit – System-ffmpeg ist nicht nötig.
- Plugin ist **projektweit** in `.claude/settings.json` eingetragen
  (`enabledPlugins` + `extraKnownMarketplaces`) → wird auf jedem Rechner mit diesem
  Repo angeboten.

## LIZENZ

Remotion ist **kostenlos für Einzelpersonen und Teams bis 3 Personen**. Firmen mit
mehr Personen brauchen eine Company License (remotion.pro/license).
Vatto + Farouk = 2 → aktuell im kostenlosen Rahmen. Bei Wachstum neu prüfen.

---

## CLAUDE-SHORTS – GEPRÜFT, NICHT INSTALLIERT

**Geprüft am 27.09.2026.** Setup-Skripte gelesen: unbedenklich (kein `sudo`, kein
Löschen), aber:

- installiert **PyTorch** (mehrere GB), faster-whisper, mediapipe, OpenCV
- braucht System-ffmpeg und jq
- installiert sich nach `~/.claude/skills/` → außerhalb des Repos, in Cloud-Sessions
  nach jedem Container-Neustart verloren
- Zweck: **langes** Material in Shorts zerlegen – Vattos Material sind 13-s-KI-Clips

**Wieder aufgreifen, wenn:** Vatto längeres Material hat (Livestream, Podcast,
Produkttest-Aufnahme) und daraus mehrere Clips schneiden will.
Installation dann: `git clone https://github.com/AgriciDaniel/claude-shorts.git`,
`bash setup.sh`, `bash install.sh`, danach `/shorts`. Unter Windows WSL 2.
