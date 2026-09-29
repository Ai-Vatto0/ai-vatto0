#!/usr/bin/env python3
"""Erzeugt HyperFrames-Kompositionen (index.html + compositions/) für die DJI-Neo-2-Serie.

Aufteilung der Arbeit (wie beim Scooter, tools/hyperframes-scooter/):
  - mezzanine.py (ffmpeg): nur Ausschnitt 9:16, HDR->SDR, einheitlich 30 fps. Keine Farb-/Formänderung am Produkt.
  - HyperFrames (dieses HTML): Schnitt (data-media-start), Reihenfolge, Zooms, Texte, Sprechblasen, CTA, Render.

Regeln (Projekt + Auftrag Vatto 29.09.2026):
  - Max. 20 s, Hook steht ab Frame 0 komplett, Drohne in der ersten Sekunde sichtbar.
  - Nur Aussagen aus memory/projekte/dji-neo-2.md (Claim-Ampel grün). Keine Preise/Rabatte/Dringlichkeit.
  - Safe Zone 1080x1920: oben 150, rechts 140, unten 400, links 60 px.
  - Faruk-Captions: Poppins Bold, weiß mit schwarzer Kontur, Akzent/CTA #FFD400, keine Doppelpunkte.
  - Text-Pop-in 0,2 s, kein Dauer-Wackeln. Schnitte auf dem 144-BPM-Raster, damit Vattos Musik sitzt.
"""
import html
import os
import shutil
import subprocess
import sys
from pathlib import Path

from PIL import ImageFont

sys.path.insert(0, str(Path(__file__).parent))
from specs import VIDEOS  # noqa: E402

REPO = Path("/home/user/ai-vatto0")
MEDIA = REPO / "videos/_media_neo2"
FONT = REPO / "assets/fonts/Poppins-Bold.ttf"
GSAP = REPO / ".agents/skills/talking-head-recut/assets/vendor/gsap.min.js"

FPS = 30
BPM = 143.55
BEAT = 60.0 / BPM
W, H = 1080, 1920
SAFE = dict(top=150, right=140, bottom=400, left=60)
TEXT_W = W - SAFE["left"] - SAFE["right"]      # 880 px nutzbare Breite
ACCENT = "#FFD400"
INK = "#FFFFFF"
STROKE = "#000000"

_pil = {}


def t(beats):
    """Beat -> Sekunde, auf ganze Frames gerundet."""
    return round(round(beats * BEAT * FPS) / FPS, 4)


def text_width(txt, size):
    if size not in _pil:
        _pil[size] = ImageFont.truetype(str(FONT), size)
    stroke = max(6, round(size * 0.09))
    return _pil[size].getlength(txt) + 2 * stroke


def fit_size(lines, want, max_w=TEXT_W - 20):
    """Größte Schriftgröße <= want, bei der jede Zeile in die Safe-Zone-Breite passt."""
    size = want
    while size > 36:
        if all(text_width(" ".join(w for w, _ in ln), size) <= max_w for ln in lines):
            return size
        size -= 2
    return size


PIC_CSS = """
#pic { position: absolute; inset: 0; overflow: hidden; background: #000; }
.shot { position: absolute; inset: 0; overflow: hidden; }
.inner { position: absolute; inset: 0; transform-origin: 50% 50%; will-change: transform; }
.shot video { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; object-fit: cover; }
.photo .bg { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; object-fit: cover; }
.photo .fg { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; object-fit: contain; }
.photo.fill .fg { object-fit: cover; }
.flash { position: absolute; inset: 0; background: #fff; opacity: 0; }
"""

CAP_CSS = """
@font-face { font-family: "Poppins"; src: url("assets/fonts/Poppins-Bold.ttf") format("truetype"); font-weight: 700; font-style: normal; }
#cap { position: absolute; inset: 0; overflow: hidden; }
.cap { position: absolute; left: 60px; width: 880px; display: flex; justify-content: center; }
.cap-in { display: flex; flex-direction: column; align-items: center; gap: 0px; will-change: transform, opacity; }
.line { display: block; font-family: "Poppins"; font-weight: 700; line-height: 1.08; color: INK; text-align: center;
  white-space: nowrap; letter-spacing: -0.01em; -webkit-text-stroke: var(--sw) STROKE; paint-order: stroke fill;
  text-shadow: 0 6px 18px rgba(0, 0, 0, 0.45); }
.line .a { color: ACCENT; }
.line .n { display: inline-block; min-width: 1.05em; margin-right: 0.28em; padding: 0 0.16em; border-radius: 0.18em;
  background: ACCENT; color: STROKE; -webkit-text-stroke: 0; text-shadow: none; text-align: center; }
.bubble { position: absolute; }
.bubble-in { position: relative; background: #fff; color: #111; font-family: "Poppins"; font-weight: 700;
  border-radius: 34px; padding: 18px 30px 20px; line-height: 1.12; text-align: left; white-space: nowrap;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.35); will-change: transform, opacity; transform-origin: var(--ox) 100%; }
.bubble-in .a { color: #D9A900; }
.bubble-in::after { content: ""; position: absolute; bottom: -26px; left: var(--tail); width: 0; height: 0;
  border-left: 18px solid transparent; border-right: 18px solid transparent; border-top: 30px solid #fff; }
.bubble-in.up::after { bottom: auto; top: -26px; border-top: 0; border-bottom: 30px solid #fff; }
.arrow { position: absolute; left: 80px; width: 150px; height: 150px; }
.arrow-in { width: 150px; height: 150px; }
""".replace("INK", INK).replace("STROKE", STROKE).replace("ACCENT", ACCENT)

ARROW_SVG = (
    '<svg viewBox="0 0 100 100" width="150" height="150" aria-hidden="true">'
    '<path d="M78 14 L28 70 M22 36 L24 76 L62 80" fill="none" stroke="#000000" stroke-width="20" '
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
    """Hintergrund für Fotos im Hochformat-Rahmen: weichgezeichnet und abgedunkelt."""
    bg = Path(src).stem + "_bg.jpg"
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
    shutil.copy2(FONT, assets / "fonts/Poppins-Bold.ttf")
    shutil.copy2(GSAP, assets / "vendor/gsap.min.js")

    # ---------------- Bildspur ----------------
    body, tl = [], []
    pos = 0.0
    starts = []
    for i, sh in enumerate(spec["shots"], 1):
        start, end = t(pos), t(pos + sh["beats"])
        starts.append(start)
        dur = round(end - start, 4)
        pos += sh["beats"]
        src = sh["src"]
        link(assets, src)
        sid = f"pic-s{i}"
        z0, z1 = sh.get("zoom", (1.0, 1.04))
        if sh.get("kind", "video") == "video":
            body.append(
                f'<div class="shot" id="{sid}"><div class="inner" id="{sid}-in" data-layout-allow-overflow>'
                f'<video id="{sid}-v" class="clip" src="assets/{src}" data-start="{start}" data-duration="{dur}" '
                f'data-media-start="{sh["media"]}" data-track-index="0" muted playsinline></video></div></div>'
            )
        else:
            fill = " fill" if sh.get("fill") else ""
            bg = ""
            if not fill:
                bgf = blurred_bg(src)
                link(assets, bgf)
                bg = f'<img class="bg" src="assets/{bgf}" alt="" />'
            body.append(
                f'<div class="shot photo{fill} clip" id="{sid}" data-start="{start}" data-duration="{dur}" data-track-index="0">'
                f'{bg}<div class="inner" id="{sid}-in" data-layout-allow-overflow>'
                f'<img class="fg" src="assets/{src}" alt="DJI Neo 2" /></div></div>'
            )
        xx, yy = sh.get("x", 0), sh.get("y", 0)
        if sh.get("punch"):
            p = sh["punch"]
            tl.append(f'tl.fromTo("#{sid}-in", {{ scale: {p}, x: {xx}, y: {yy} }}, {{ scale: {z0}, x: {xx}, y: {yy}, duration: 0.35, ease: "power3.out" }}, {start});')
            tl.append(f'tl.fromTo("#{sid}-in", {{ scale: {z0} }}, {{ scale: {z1}, duration: {round(dur - 0.35, 4)}, ease: "none", immediateRender: false }}, {round(start + 0.35, 4)});')
        else:
            tl.append(f'tl.fromTo("#{sid}-in", {{ scale: {z0}, x: {xx}, y: {yy} }}, {{ scale: {z1}, x: {xx}, y: {yy}, duration: {dur}, ease: "none" }}, {start});')
    total = t(pos)
    # Weißer Blitz (2-3 Frames) auf ausgewählten Schnitten – sparsam, max. 3 pro Video
    for k, idx in enumerate(spec.get("flash", []), 1):
        s0 = starts[idx - 1]
        fid = f"pic-f{k}"
        body.append(f'<div class="flash clip" id="{fid}" data-start="{s0}" data-duration="0.2" data-track-index="1"></div>')
        tl.append(f'tl.fromTo("#{fid}", {{ opacity: 0.75 }}, {{ opacity: 0, duration: 0.12, ease: "power2.out" }}, {s0});')
    (comps / "picture.html").write_text(subcomp("picture", "pic", total, PIC_CSS, body, tl), encoding="utf-8")

    # ---------------- Textspur ----------------
    body, tl = [], []
    for j, tx in enumerate(spec["texts"], 1):
        b0, b1, lines, top, want, kind = tx[:6]
        opt = tx[6] if len(tx) > 6 else {}
        start, end = t(b0), t(b1)
        dur = round(end - start, 4)
        tid = f"cap-t{j}"
        track = 1
        if kind == "bubble":
            size = want
            left = opt.get("left", 120)
            tail = opt.get("tail", 60)
            up = " up" if opt.get("up") else ""
            inner = "<br>".join(line_html(ln) for ln in lines)
            body.append(
                f'<div class="bubble clip" id="{tid}" data-start="{start}" data-duration="{dur}" data-track-index="2" '
                f'style="top:{top}px;left:{left}px"><div class="bubble-in{up}" id="{tid}-in" '
                f'style="font-size:{size}px;--tail:{tail}px;--ox:{tail + 18}px">{inner}</div></div>'
            )
            tl.append(f'tl.fromTo("#{tid}-in", {{ opacity: 0, scale: 0.6 }}, '
                      f'{{ opacity: 1, scale: 1, duration: 0.22, ease: "back.out(2)" }}, {start});')
            if end < total - 0.01:
                tl.append(f'tl.to("#{tid}-in", {{ opacity: 0, scale: 0.9, duration: 0.12, ease: "power1.in" }}, {round(end - 0.12, 4)});')
            continue
        size = fit_size(lines, want)
        sw = max(6, round(size * 0.09))
        inner = "".join(f'<div class="line" style="font-size:{size}px;--sw:{sw}px">{line_html(ln)}</div>' for ln in lines)
        body.append(
            f'<div class="cap clip" id="{tid}" data-start="{start}" data-duration="{dur}" data-track-index="{track}" '
            f'style="top:{top}px"><div class="cap-in" id="{tid}-in">{inner}</div></div>'
        )
        if b0 == 0:
            # Hook: steht ab Frame 0 komplett, nur ein kurzer Skalier-Stoß
            tl.append(f'tl.fromTo("#{tid}-in", {{ scale: 1.12 }}, {{ scale: 1, duration: 0.2, ease: "power3.out" }}, 0);')
        else:
            tl.append(f'tl.fromTo("#{tid}-in", {{ opacity: 0, scale: 0.8, y: 20 }}, '
                      f'{{ opacity: 1, scale: 1, y: 0, duration: 0.2, ease: "power3.out" }}, {start});')
        if end < total - 0.01:
            tl.append(f'tl.to("#{tid}-in", {{ opacity: 0, duration: 0.12, ease: "power1.in" }}, {round(end - 0.12, 4)});')
        if kind == "cta":
            aid = f"{tid}-arrow"
            a0 = round(start + 0.2, 4)
            body.append(
                f'<div class="arrow clip" id="{aid}" data-start="{a0}" data-duration="{round(end - a0, 4)}" style="top:{opt.get("arrow_top", 1330)}px" '
                f'data-track-index="3"><div class="arrow-in" id="{aid}-in">{ARROW_SVG}</div></div>'
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
      html, body {{ width: 1080px; height: 1920px; overflow: hidden; background: #000; }}
      #root {{ position: relative; width: 100%; height: 100%; overflow: hidden; background: #000; }}
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
    for f in ("package.json", "hyperframes.json"):
        src = REPO / "videos/scooter-v2-gefuehl" / f
        txt = src.read_text(encoding="utf-8").replace("scooter-v2-gefuehl", name)
        (proj / f).write_text(txt, encoding="utf-8")
    print(f"{name}: {len(spec['shots'])} Szenen, {len(spec['texts'])} Texte, {total:.2f} s")
    return total


if __name__ == "__main__":
    names = sys.argv[1:] or list(VIDEOS)
    for n in names:
        build(n, VIDEOS[n])
