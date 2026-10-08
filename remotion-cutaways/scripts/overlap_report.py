#!/usr/bin/env python3
"""Reads the <t>-cap.png / <t>-art.png pairs written by check-stick.mjs and lists the times where the
captions come within CLEARANCE pixels of the art. Usage: python3 -I scripts/overlap_report.py <dir>"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

CLEARANCE = 22      # px at full size
THRESHOLD = 25      # shared pixels at quarter size that count as a collision
Q = 4


def mask(path):
    im = Image.open(path).convert("L")
    im = im.resize((im.width // Q, im.height // Q), Image.BILINEAR)
    return im.point(lambda v: 255 if v < 215 else 0)


d = Path(sys.argv[1])
bad = []
for cap in sorted(d.glob("*-cap.png")):
    art = d / cap.name.replace("-cap", "-art")
    c = mask(cap).filter(ImageFilter.MaxFilter(2 * (CLEARANCE // Q) + 1))
    a = mask(art)
    n = int(((np.array(c) > 0) & (np.array(a) > 0)).sum())
    if n > THRESHOLD:
        bad.append((cap.name.split("-")[0], n))
print(f"{len(bad)} collisions" if bad else "no collisions")
for t, n in bad:
    print(f"  t={t}s  overlap={n}")
