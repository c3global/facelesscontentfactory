#!/usr/bin/env python3
"""Puts one of Kai's head-only expressions onto one of Dr. CiCi's front-facing body poses.

  python3 scripts/compose-faces.py                      # builds every combo listed in COMBOS
  python3 scripts/compose-faces.py <pose> <face> [out]  # one combo, e.g. pose-hands-on-hips face-one-eyebrow

How it works: the glasses are found by colour on the expression, and read off a gridded crop of the body
(BODY_GLASSES). The expression is scaled and moved so the two pairs of glasses coincide, then a soft elliptical
patch of the expression replaces the face on the body. Only works for poses that face the camera.

Output goes to public/stick/composed/<pose>__<face>.png (git-ignored with the rest of public/stick).
Pillow and numpy are required.
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

STICK = Path(__file__).resolve().parent.parent / "public" / "stick"
OUT = STICK / "composed"

# glasses box on the body pose: (x0, y0, x1, y1) in the 1024x1536 sprite
BODY_GLASSES = {
    "pose-front-neutral": (322, 285, 702, 422),
    "pose-standing-hands-clasped": (325, 272, 700, 428),
    "pose-hands-on-hips": (375, 275, 735, 440),
}

COMBOS = [
    ("pose-standing-hands-clasped", "face-concerned"),
    ("pose-hands-on-hips", "face-one-eyebrow"),
    ("pose-front-neutral", "face-surprised"),
]


def load(name):
    return Image.open(STICK / f"{name}.png").convert("RGBA")


def face_glasses(face):
    a = np.array(face)
    r, g, b = (a[..., i].astype(int) for i in range(3))
    m = (a[..., 3] > 200) & (r > 230) & (g > 180) & (b < 120)
    ys, xs = np.where(m)
    return (int(np.percentile(xs, 1)), int(np.percentile(ys, 1)), int(np.percentile(xs, 99)), int(np.percentile(ys, 99)))


def compose(pose, face_name, feather=8, k=0.36):
    body, face = load(pose), load(face_name)
    bg, fg = BODY_GLASSES[pose], face_glasses(face)
    s = (bg[2] - bg[0]) / (fg[2] - fg[0])
    f2 = face.resize((int(face.width * s), int(face.height * s)), Image.LANCZOS)
    bcx, bcy = (bg[0] + bg[2]) / 2, (bg[1] + bg[3]) / 2
    fcx, fcy = (fg[0] + fg[2]) / 2 * s, (fg[1] + fg[3]) / 2 * s
    layer = Image.new("RGBA", body.size, (0, 0, 0, 0))
    layer.paste(f2, (int(bcx - fcx), int(bcy - fcy)))
    w = bg[2] - bg[0]
    mask = Image.new("L", body.size, 0)
    md = ImageDraw.Draw(mask)
    # inner face ellipse (boundary sits in flat skin, where a seam cannot show) plus the whole glasses box
    rx = w * k
    md.ellipse((bcx - rx, bcy - w * 0.30, bcx + rx, bcy + w * 0.33), fill=255)
    pad = 10
    md.rectangle((bg[0] - pad, bg[1] - pad, bg[2] + pad, bg[3] + pad), fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(feather))
    out = body.copy()
    out.paste(layer, (0, 0), Image.composite(layer.getchannel("A"), Image.new("L", body.size, 0), mask))
    return out


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    combos = [tuple(sys.argv[1:3])] if len(sys.argv) >= 3 else COMBOS
    for pose, face in combos:
        dest = Path(sys.argv[3]) if len(sys.argv) >= 4 else OUT / f"{pose}__{face}.png"
        compose(pose, face).save(dest)
        print("wrote", dest)
