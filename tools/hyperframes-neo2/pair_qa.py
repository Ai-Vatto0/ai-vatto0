#!/usr/bin/env python3
"""Zwei QA-Kontaktbögen (nur belegte Zeilen) untereinander in ein Bild: pair_qa.py a b out.jpg"""
import sys
from PIL import Image
Q = "/home/user/ai-vatto0/export/neo2/qa/"
ims = [Image.open(f"{Q}neo2_{n}_kontakt.jpg").crop((0, 0, 2187, 1160)) for n in sys.argv[1:-1]]
s = Image.new("RGB", (2187, 1170 * len(ims)))
for k, im in enumerate(ims):
    s.paste(im, (0, k * 1170))
s.save(sys.argv[-1], quality=78)
