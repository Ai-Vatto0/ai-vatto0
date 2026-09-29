#!/usr/bin/env python3
"""POSTING.md -> POSTING.pdf (A4, echter Text, für ChatGPT lesbar). Aufruf: python3 posting_pdf.py"""
import html
import re
import subprocess
from pathlib import Path

CHROME = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"
SRC = Path("/home/user/ai-vatto0/export/neo2/POSTING.md")
OUT = SRC.with_suffix(".pdf")
FONT = Path("/home/user/ai-vatto0/assets/fonts/Poppins-Bold.ttf")


def inline(t):
    t = html.escape(t, quote=False)
    t = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", t)
    t = re.sub(r"`(.+?)`", r"<code>\1</code>", t)
    return t


def md_to_html(md):
    out, in_ul, in_ol, quote = [], False, False, []

    def close_lists():
        nonlocal in_ul, in_ol
        if in_ul:
            out.append("</ul>")
            in_ul = False
        if in_ol:
            out.append("</ol>")
            in_ol = False

    def flush_quote():
        if quote:
            out.append('<div class="prompt">' + "<br>".join(inline(q) for q in quote) + "</div>")
            quote.clear()

    for raw in md.splitlines():
        line = raw.rstrip()
        if line.startswith("> ") or line == ">":
            close_lists()
            quote.append(line[2:] if line.startswith("> ") else "")
            continue
        flush_quote()
        if not line.strip():
            close_lists()
            continue
        if line.startswith("# "):
            close_lists()
            out.append(f"<h1>{inline(line[2:])}</h1>")
        elif line.startswith("## "):
            close_lists()
            out.append(f"<h2>{inline(line[3:])}</h2>")
        elif line.startswith("- "):
            if not in_ul:
                close_lists()
                out.append("<ul>")
                in_ul = True
            out.append(f"<li>{inline(line[2:])}</li>")
        elif line.startswith("  ") and (in_ul or in_ol):
            out[-1] = out[-1][:-5] + " " + inline(line.strip()) + "</li>"
        elif line.startswith("**") and " · " in line[:40]:
            close_lists()
            out.append(f'<div class="video"><div class="vhead">{inline(line)}</div>')
        elif line.startswith("Werbung · "):
            out.append(f'<div class="cap">{inline(line)}</div></div>')
        else:
            close_lists()
            out.append(f"<p>{inline(line)}</p>")
    flush_quote()
    close_lists()
    return "\n".join(out)


CSS = """
@font-face { font-family: "Poppins"; src: url("file://%s"); font-weight: 700; }
@page { size: A4; margin: 16mm 15mm 16mm 15mm; }
body { font-family: "DejaVu Sans", "Noto Sans", Arial, sans-serif; font-size: 10.2pt; line-height: 1.45; color: #1a1a1a; }
h1 { font-family: "Poppins", sans-serif; font-size: 20pt; margin: 0 0 4pt; }
h1 + p { color: #555; margin-top: 0; }
h2 { font-family: "Poppins", sans-serif; font-size: 13pt; margin: 16pt 0 6pt; padding-bottom: 3pt; border-bottom: 2.5pt solid #FFD400; }
p { margin: 3pt 0; }
ul { margin: 3pt 0 3pt 14pt; padding: 0; } li { margin: 2pt 0; }
code { font-family: "DejaVu Sans Mono", monospace; font-size: 9pt; background: #f2f2f2; padding: 0 3pt; border-radius: 3pt; }
.prompt { background: #fffbe6; border-left: 4pt solid #FFD400; padding: 8pt 10pt; margin: 6pt 0; font-size: 9.8pt; }
.video { break-inside: avoid; border: 1pt solid #e2e2e2; border-radius: 6pt; padding: 6pt 9pt; margin: 6pt 0; }
.vhead { color: #444; font-size: 9.4pt; }
.vhead strong { color: #111; }
.cap { margin-top: 3pt; font-size: 10.4pt; }
"""


def main():
    body = md_to_html(SRC.read_text(encoding="utf-8"))
    doc = f'<!doctype html><html lang="de"><head><meta charset="utf-8"><title>DJI Neo 2 – Posting-Paket</title>' \
          f"<style>{CSS % FONT}</style></head><body>{body}</body></html>"
    tmp = SRC.with_suffix(".html")
    tmp.write_text(doc, encoding="utf-8")
    # Vorinstallierter Chromium (Headless-Druck); Ränder kommen aus @page im CSS
    subprocess.run([CHROME, "--headless", "--no-sandbox", "--disable-gpu", "--no-pdf-header-footer",
                    f"--print-to-pdf={OUT}", f"file://{tmp}"], check=True, capture_output=True)
    tmp.unlink()
    print(OUT)


if __name__ == "__main__":
    main()
