#!/usr/bin/env python3
"""Bakes a styled outline into her cutout. Usage: outline.py <slug> <white|copper|gold> [px]
Reads public/matte/<slug>.webm, writes public/matte/<slug>.<kind>.webm. Baked in, so renders cost the same as the plain cutout.
Metal outlines use the brand metal stops (shadow, mid, highlight, mid, shadow) in diagonal bands plus the slow 3.5 s shimmer sweep."""
import os, subprocess, sys
import cv2, numpy as np
slug, kind = sys.argv[1], sys.argv[2]
px = int(sys.argv[3]) if len(sys.argv) > 3 else 15
W, H = 1080, 1920
src = os.path.join('public', 'matte', f'{slug}.webm')
tmp = os.path.join('public', 'matte', f'{slug}.{kind}.tmp.webm')
dst = os.path.join('public', 'matte', f'{slug}.{kind}.webm')
STOPS = {
    'copper': ['#B5622C', '#E08A57', '#FFD9BD', '#E08A57', '#B5622C'],
    'gold': ['#B38A32', '#E3BF63', '#FFF3C9', '#E3BF63', '#B38A32'],
}
OFFS = [0, 0.28, 0.5, 0.72, 1.0]
def rgb(h): return np.array([int(h[i:i+2], 16) for i in (1, 3, 5)], np.float32)
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
u = (xx * 0.55 + yy * 0.45) / (W * 0.55 + H * 0.45)
def metal(frame):
    if kind == 'white': return np.full((H, W, 3), 255, np.float32)
    cols = [rgb(c) for c in STOPS[kind]]
    v = (u * 2.2) % 1.0
    out = np.zeros((H, W, 3), np.float32)
    for i in range(4):
        m = (v >= OFFS[i]) & (v < OFFS[i + 1])
        t = ((v - OFFS[i]) / (OFFS[i + 1] - OFFS[i]))[..., None]
        seg = cols[i] * (1 - t) + cols[i + 1] * t
        out = np.where(m[..., None], seg, out)
    # slow specular sweep every 105 frames (3.5 s), visible for about a third of the cycle
    ph = (frame % 105) / 105.0
    if ph < 0.34:
        pos = -0.15 + (ph / 0.34) * 1.3
        band = np.exp(-((u - pos) / 0.05) ** 2)[..., None]
        out = out + (255 - out) * band * 0.7
    return out
k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (px * 2 + 1, px * 2 + 1))
dec = subprocess.Popen(['ffmpeg', '-v', 'error', '-c:v', 'libvpx-vp9', '-i', src, '-f', 'rawvideo', '-pix_fmt', 'rgba', '-'], stdout=subprocess.PIPE)
enc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', f'{W}x{H}', '-r', '30', '-i', '-', '-c:v', 'libvpx-vp9', '-pix_fmt', 'yuva420p', '-b:v', '6M', '-deadline', 'good', '-cpu-used', '4', '-row-mt', '1', '-auto-alt-ref', '0', '-an', tmp], stdin=subprocess.PIPE)
n = 0
size = W * H * 4
while True:
    buf = dec.stdout.read(size)
    if len(buf) < size: break
    f = np.frombuffer(buf, np.uint8).reshape(H, W, 4)
    a = f[..., 3]
    # dilated alpha = outer edge of the outline; soften it slightly so it is not jagged
    d = cv2.dilate(a, k)
    d = cv2.GaussianBlur(d, (3, 3), 0).astype(np.float32) / 255.0
    af = a.astype(np.float32) / 255.0
    col = metal(n)
    # person over ring: ring color where the dilated alpha is present, person pixels on top by their own alpha
    out_rgb = col * (1 - af[..., None]) + f[..., :3].astype(np.float32) * af[..., None]
    out_a = np.maximum(d, af)
    o = np.dstack([np.clip(out_rgb, 0, 255), np.clip(out_a * 255, 0, 255)]).astype(np.uint8)
    enc.stdin.write(o.tobytes())
    n += 1
enc.stdin.close(); enc.wait(); dec.wait()
os.replace(tmp, dst)
print('wrote', dst, n, 'frames')
