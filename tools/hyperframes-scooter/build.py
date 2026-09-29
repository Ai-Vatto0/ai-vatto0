#!/usr/bin/env python3
"""Erzeugt die drei HyperFrames-Kompositionen (index.html) für den Scooter FUE V10.

Aufteilung der Arbeit:
  - tools/…/mezzanine.py (Python/ffmpeg): nur HDR->SDR und 9:16-Ausschnitt, der dem Fahrer folgt.
  - HyperFrames (dieses HTML): Schnitt (data-media-start), Reihenfolge, Zooms/Ken-Burns (GSAP),
    Texte, CTA, Render.

Regeln (Projekt + Auftrag):
  - Nur Aussagen aus den Shop-Screenshots bzw. klar im Bild sichtbar. Keine Preise/Rabatte/Dringlichkeit.
  - Safe Zone 1080x1920: oben 150, rechts 140, unten 400, links 60 px.
  - Eine Schrift (Permanent Marker, lokal eingebettet), eine Akzentfarbe #FFD400
    (Gelb des Seitenreflektors, zugleich Faruks CTA-Farbe).
  - Text-Pop-in <= 0,3 s, kein Wackeln, kein Dauer-Blinken.
  - Schnitte auf dem 144-BPM-Raster (gemessen aus Vattos Video), damit seine Musik sitzt.
"""
import html
import json
import os
import shutil
import subprocess
import sys
from pathlib import Path

from PIL import ImageFont

REPO = Path("/home/user/ai-vatto0")
MEDIA = REPO / "videos/_media"
FONT = REPO / "assets/fonts/PermanentMarker.ttf"
GSAP = REPO / ".agents/skills/talking-head-recut/assets/vendor/gsap.min.js"

FPS = 30
BPM = 143.55
BEAT = 60.0 / BPM
W, H = 1080, 1920
SAFE = dict(top=150, right=140, bottom=400, left=60)
TEXT_W = W - SAFE["left"] - SAFE["right"]      # 880 px nutzbare Breite
ACCENT = "#FFD400"
INK = "#FFF7E8"      # warmes Weiß (kein reines #fff)
STROKE = "#140F05"   # dunkle Kontur, zum Akzent hin getönt

_pil = {}


def t(beats):
    """Beat -> Sekunde, auf ganze Frames gerundet."""
    return round(round(beats * BEAT * FPS) / FPS, 4)


def text_width(txt, size):
    if size not in _pil:
        _pil[size] = ImageFont.truetype(str(FONT), size)
    stroke = max(8, round(size * 0.11))
    return _pil[size].getlength(txt) + 2 * stroke + size * 0.04


def fit_size(lines, want, max_w=TEXT_W - 30):
    """Größte Schriftgröße <= want, bei der jede Zeile in die Safe-Zone-Breite passt."""
    size = want
    while size > 40:
        if all(text_width(" ".join(w for w, _ in ln), size) <= max_w for ln in lines):
            return size
        size -= 2
    return size


# --------------------------------------------------------------------------------------------
# Schnittlisten. Zeit in Beats (1 Beat = 0,418 s). media = Startpunkt im Mezzanine-Clip (s).
# zoom: (Start, Ende) Skalierung des inneren Rahmens; punch: kurzer Zoom-Stoß am Anfang.
# Text: (von_beat, bis_beat, Zeilen, top_px, Wunschgröße, Art)
#   Zeile = Liste von (Wort, Farbe) mit Farbe "w" (weiß) oder "a" (Akzent); Art: cap | num | cta
# --------------------------------------------------------------------------------------------
L = lambda s: [(w, "w") for w in s.split()]            # noqa: E731
A = lambda s: [(w, "a") for w in s.split()]            # noqa: E731

VIDEOS = {
    # ---------------- VIDEO 1: Überarbeitung des Remotion-Schnitts ----------------
    "scooter-v1-ueberarbeitet": dict(
        title="Scooter V1 – Überarbeitung",
        shots=[
            dict(kind="video", src="m01_bruecke_fahrt.mp4", media=0.5, beats=6, zoom=(1.0, 1.05), punch=1.22),
            dict(kind="photo", src="p11_ganz_front.jpg", beats=6, zoom=(1.0, 1.04)),
            dict(kind="video", src="m07_details_0208.mp4", media=7.2, beats=6, zoom=(1.04, 1.1)),
            dict(kind="video", src="m07_details_0208.mp4", media=12.6, beats=6, zoom=(1.0, 1.06)),
            dict(kind="video", src="m08_display_9412.mp4", media=3.4, beats=6, zoom=(1.0, 1.07)),
            dict(kind="video", src="m03_strasse_drohne.mp4", media=4.0, beats=6, zoom=(1.0, 1.04)),
            dict(kind="video", src="m09_kurve_ganz.mp4", media=0.5, beats=6, zoom=(1.0, 1.05)),
            dict(kind="photo", src="p12_ganz_seite.jpg", beats=8, zoom=(0.76, 0.8), shift=190),
        ],
        texts=[
            (0.0, 6, [A("POV:"), L("DEIN ARBEITSWEG"), A("AB JETZT")], 230, 128, "cap"),
            (6.2, 12, [A("350 W") + L("MOTOR")], 165, 110, "cap"),
            (12.2, 18, [L("DUALES"), A("BREMSSYSTEM")], 240, 116, "cap"),
            (18.2, 24, [A("FEDERUNG"), L("VORNE")], 240, 130, "cap"),
            (24.2, 30, [L("LED-DISPLAY:"), A("TEMPO IM BLICK")], 1180, 106, "cap"),
            (30.2, 36, [L("BIS"), A("20 KM/H")], 240, 140, "cap"),
            (36.2, 42, [L("MIT"), A("ABE-ZULASSUNG")], 240, 110, "cap"),
            (43.2, 50, [A("JETZT IM"), A("TIKTOK SHOP.")], 175, 128, "cta"),
        ],
    ),
    # ---------------- VIDEO 2: Gefühl / Freiheit ----------------
    "scooter-v2-gefuehl": dict(
        title="Scooter V2 – Gefühl",
        shots=[
            dict(kind="video", src="m02_wald_fahrt.mp4", media=1.0, beats=8, zoom=(1.0, 1.08)),
            dict(kind="video", src="m15_drohne_seg6.mp4", media=2.2, beats=2, zoom=(1.0, 1.06)),
            dict(kind="video", src="m02_wald_fahrt.mp4", media=8.0, beats=6, zoom=(1.0, 1.05)),
            dict(kind="video", src="m04_abend_fahrt_a.mp4", media=2.5, beats=6, zoom=(1.0, 1.05)),
            dict(kind="video", src="m10_details_avlx.mp4", media=7.0, beats=1, zoom=(1.1, 1.1)),
            dict(kind="video", src="m03_strasse_drohne.mp4", media=10.0, beats=6, zoom=(1.0, 1.04)),
            dict(kind="video", src="m02_wald_fahrt.mp4", media=14.5, beats=6, zoom=(1.0, 1.06)),
            dict(kind="video", src="m12_drohne_seg2.mp4", media=3.0, beats=5, zoom=(1.0, 1.06)),
            dict(kind="photo", src="p12_ganz_seite.jpg", beats=6, zoom=(0.8, 0.76), shift=190),
        ],
        texts=[
            (0.0, 8, [L("FEIERABEND."), A("AB IN DEN WALD.")], 250, 150, "cap"),
            (16.2, 22, [L("EINFACH"), A("LOSFAHREN.")], 250, 150, "cap"),
            (29.2, 35, [L("DEIN"), A("WEG.")], 250, 170, "cap"),
            (40.2, 46, [A("JETZT IM"), A("TIKTOK SHOP.")], 175, 128, "cta"),
        ],
    ),
    # ---------------- VIDEO 3: Proof / Details ----------------
    "scooter-v3-proof": dict(
        title="Scooter V3 – Proof",
        shots=[
            dict(kind="video", src="m13_drohne_seg4.mp4", media=10.2, beats=5, zoom=(1.0, 1.06), punch=1.15),
            dict(kind="video", src="m01_bruecke_fahrt.mp4", media=1.8, beats=6, zoom=(1.15, 1.2)),
            dict(kind="video", src="m02_wald_fahrt.mp4", media=4.5, beats=6, zoom=(1.0, 1.05)),
            dict(kind="video", src="m10_details_avlx.mp4", media=10.0, beats=6, zoom=(1.0, 1.06)),
            dict(kind="video", src="m07_details_0208.mp4", media=9.3, beats=6, zoom=(1.0, 1.06)),
            dict(kind="video", src="m10_details_avlx.mp4", media=0.6, beats=6, zoom=(1.0, 1.07)),
            dict(kind="video", src="m16_drohne_seg8.mp4", media=1.0, beats=6, zoom=(1.0, 1.05)),
            dict(kind="photo", src="p11_ganz_front.jpg", beats=8, zoom=(0.76, 0.8), shift=190),
        ],
        texts=[
            (0.0, 5, [L("SCHOTTER"), A("STATT ASPHALT?")], 230, 140, "cap"),
            (5.2, 11, [A("LÄUFT.")], 250, 190, "cap"),
            (11.2, 17, [L("AUCH IM"), A("WALD.")], 250, 150, "cap"),
            (17.2, 23, [[("1", "n")] + A("FEDERUNG"), L("VORNE")], 240, 124, "num"),
            (23.2, 29, [[("2", "n")] + A("DUALES"), L("BREMSSYSTEM")], 240, 112, "num"),
            (29.2, 35, [[("3", "n")] + A("LED-DISPLAY")], 1200, 104, "num"),
            (35.2, 41, [L("MIT"), A("ABE-ZULASSUNG")], 240, 104, "cap"),
            (42.2, 49, [A("JETZT IM"), A("TIKTOK SHOP.")], 175, 128, "cta"),
        ],
    ),
}

PIC_CSS = """
#pic { position: absolute; inset: 0; overflow: hidden; background: #0d0b07; }
.shot { position: absolute; inset: 0; overflow: hidden; }
.inner { position: absolute; inset: 0; transform-origin: 50% 50%; will-change: transform; }
.shot video { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; object-fit: cover; }
.photo .bg { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; object-fit: cover; }
.photo .fg { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; object-fit: contain; }
"""

CAP_CSS = """
@font-face { font-family: "Permanent Marker"; src: url("assets/fonts/PermanentMarker.ttf") format("truetype"); font-weight: 400; font-style: normal; }
#cap { position: absolute; inset: 0; overflow: hidden; }
.cap { position: absolute; left: 60px; width: 880px; display: flex; justify-content: center; transform: rotate(-2deg); }
.cap-in { display: flex; flex-direction: column; align-items: center; gap: 4px; will-change: transform, opacity; }
.line { display: block; font-family: "Permanent Marker"; line-height: 1.04; color: INK; text-align: center;
  white-space: nowrap; letter-spacing: 0.01em; -webkit-text-stroke: var(--sw) STROKE; paint-order: stroke fill;
  text-shadow: 0 10px 0 rgba(12, 9, 3, 0.55); }
.line .a { color: ACCENT; }
.line .n { display: inline-block; min-width: 1.05em; margin-right: 0.28em; padding: 0 0.16em; border-radius: 0.18em;
  background: ACCENT; color: STROKE; -webkit-text-stroke: 0; text-shadow: none; text-align: center; }
.arrow { position: absolute; left: 80px; width: 150px; height: 150px; }
.arrow-in { width: 150px; height: 150px; }
""".replace("INK", INK).replace("STROKE", STROKE).replace("ACCENT", ACCENT)

ARROW_SVG = (
    '<svg viewBox="0 0 100 100" width="150" height="150" aria-hidden="true">'
    '<path d="M78 14 L28 70 M22 36 L24 76 L62 80" fill="none" stroke="#140F05" stroke-width="20" '
    'stroke-linecap="round" stroke-linejoin="round"/>'
    '<path d="M78 14 L28 70 M22 36 L24 76 L62 80" fill="none" stroke="#FFD400" stroke-width="11" '
    'stroke-linecap="round" stroke-linejoin="round"/></svg>'
)


def line_html(line):
    parts = []
    for word, col in line:
        w = html.escape(word)
        if col == "a":
            parts.append(f'<span class="a">{w}</span>')
        elif col == "n":
            parts.append(f'<span class="n">{w}</span>')
        else:
            parts.append(w)
    return " ".join(parts)


def blurred_bg(src):
    """Hintergrund für Fotos im Vollbild-Modus: eigene, weichgezeichnete und abgedunkelte Datei."""
    bg = src.replace(".jpg", "_bg.jpg")
    if not (MEDIA / bg).exists():
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(MEDIA / src), "-vf",
                        "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,"
                        "gblur=sigma=45,eq=brightness=-0.2:saturation=1.05", "-q:v", "3", str(MEDIA / bg)],
                       check=True)
    return bg


def link(assets, src):
    target = assets / src
    if not target.exists():
        os.link(MEDIA / src, target)          # Hardlink: kein doppelter Speicher


def subcomp(comp_id, root_id, total, css, body, tl):
    return f"""<!doctype html>
<html lang="de">
  <head>
    <meta charset="UTF-8" />
  </head>
  <body>
    <template id="{comp_id}">
      <style>{css}</style>
      <div id="{root_id}" data-composition-id="{comp_id}" data-start="0" data-duration="{total}" data-width="1080" data-height="1920">
        {chr(10).join("        " + b for b in body).lstrip()}
      </div>
      <script>
        const tl = gsap.timeline({{ paused: true }});
        {chr(10).join("        " + x for x in tl).lstrip()}
        window.__timelines["{comp_id}"] = tl;
      </script>
    </template>
  </body>
</html>
"""


def build(name, spec):
    proj = REPO / "videos" / name
    assets = proj / "assets"
    comps = proj / "compositions"
    for d in (assets / "fonts", assets / "vendor", comps):
        d.mkdir(parents=True, exist_ok=True)
    shutil.copy2(FONT, assets / "fonts/PermanentMarker.ttf")
    shutil.copy2(GSAP, assets / "vendor/gsap.min.js")

    # ---------------- Bildspur ----------------
    body, tl = [], []
    pos = 0.0
    for i, sh in enumerate(spec["shots"], 1):
        start, end = t(pos), t(pos + sh["beats"])
        dur = round(end - start, 4)
        pos += sh["beats"]
        src = sh["src"]
        link(assets, src)
        sid = f"pic-s{i}"
        z0, z1 = sh["zoom"]
        if sh["kind"] == "video":
            body.append(
                f'<div class="shot" id="{sid}"><div class="inner" id="{sid}-in" data-layout-allow-overflow>'
                f'<video id="{sid}-v" class="clip" src="assets/{src}" data-start="{start}" data-duration="{dur}" '
                f'data-media-start="{sh["media"]}" data-track-index="0" muted playsinline></video></div></div>'
            )
        else:
            bg = blurred_bg(src)
            link(assets, bg)
            body.append(
                f'<div class="shot photo clip" id="{sid}" data-start="{start}" data-duration="{dur}" data-track-index="0">'
                f'<img class="bg" src="assets/{bg}" alt="" />'
                f'<div class="inner" id="{sid}-in" data-layout-allow-overflow><img class="fg" src="assets/{src}" alt="Scooter" /></div></div>'
            )
        if sh.get("punch"):
            p = sh["punch"]
            tl.append(f'tl.fromTo("#{sid}-in", {{ scale: {p} }}, {{ scale: {z0}, duration: 0.45, ease: "power3.out" }}, {start});')
            tl.append(f'tl.fromTo("#{sid}-in", {{ scale: {z0} }}, {{ scale: {z1}, duration: {round(dur - 0.45, 4)}, ease: "none", immediateRender: false }}, {round(start + 0.45, 4)});')
        else:
            yy = sh.get("shift", 0)
            tl.append(f'tl.fromTo("#{sid}-in", {{ scale: {z0}, y: {yy} }}, {{ scale: {z1}, y: {yy}, duration: {dur}, ease: "none" }}, {start});')
    total = t(pos)
    (comps / "picture.html").write_text(subcomp("picture", "pic", total, PIC_CSS, body, tl), encoding="utf-8")

    # ---------------- Textspur ----------------
    body, tl = [], []
    for j, (b0, b1, lines, top, want, kind) in enumerate(spec["texts"], 1):
        start, end = t(b0), t(b1)
        dur = round(end - start, 4)
        size = fit_size(lines, want)
        sw = max(8, round(size * 0.11))
        tid = f"cap-t{j}"
        inner = "".join(f'<div class="line" style="font-size:{size}px;--sw:{sw}px">{line_html(ln)}</div>' for ln in lines)
        body.append(
            f'<div class="cap clip" id="{tid}" data-start="{start}" data-duration="{dur}" data-track-index="1" '
            f'style="top:{top}px"><div class="cap-in" id="{tid}-in">{inner}</div></div>'
        )
        # Pop-in 0,25 s (Deckkraft + leichte Skalierung + 24 px Weg), kein Überschwingen; Ausblenden 0,15 s
        tl.append(f'tl.fromTo("#{tid}-in", {{ opacity: 0, scale: 0.86, y: 24 }}, '
                  f'{{ opacity: 1, scale: 1, y: 0, duration: 0.25, ease: "power3.out" }}, {start});')
        if end < total - 0.01:
            tl.append(f'tl.to("#{tid}-in", {{ opacity: 0, duration: 0.15, ease: "power1.in" }}, {round(end - 0.15, 4)});')
        if kind == "cta":
            aid = f"{tid}-arrow"
            a0 = round(start + 0.2, 4)
            body.append(
                f'<div class="arrow clip" id="{aid}" data-start="{a0}" data-duration="{round(end - a0, 4)}" style="top:{top + 300}px" '
                f'data-track-index="2"><div class="arrow-in" id="{aid}-in">{ARROW_SVG}</div></div>'
            )
            tl.append(f'tl.fromTo("#{aid}-in", {{ opacity: 0, x: 40, y: -40 }}, '
                      f'{{ opacity: 1, x: 0, y: 0, duration: 0.3, ease: "power3.out" }}, {a0});')
    (comps / "captions.html").write_text(subcomp("captions", "cap", total, CAP_CSS, body, tl), encoding="utf-8")

    # ---------------- Wurzel ----------------
    doc = f"""<!doctype html>
<html lang="de" data-resolution="portrait">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1080, height=1920" />
    <title>{html.escape(spec["title"])}</title>
    <script src="assets/vendor/gsap.min.js"></script>
    <style>
      * {{ margin: 0; padding: 0; box-sizing: border-box; }}
      html, body {{ width: 1080px; height: 1920px; overflow: hidden; background: #0d0b07; }}
      #root {{ position: relative; width: 100%; height: 100%; overflow: hidden; background: #0d0b07; }}
      .host {{ position: absolute; inset: 0; }}
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="{total}" data-width="1080" data-height="1920">
      <div id="picture-host" class="host" data-composition-id="picture" data-composition-src="compositions/picture.html" data-start="0" data-duration="{total}" data-track-index="0" data-width="1080" data-height="1920"></div>
      <div id="captions-host" class="host" data-composition-id="captions" data-composition-src="compositions/captions.html" data-track-kind="captions" data-start="0" data-duration="{total}" data-track-index="1" data-width="1080" data-height="1920"></div>
    </div>
    <script>
      const tl = gsap.timeline({{ paused: true }});
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
"""
    (proj / "index.html").write_text(doc, encoding="utf-8")
    print(f"{name}: {len(spec['shots'])} Szenen, {len(spec['texts'])} Texte, {total:.2f} s")
    return total


if __name__ == "__main__":
    names = sys.argv[1:] or list(VIDEOS)
    for n in names:
        build(n, VIDEOS[n])
