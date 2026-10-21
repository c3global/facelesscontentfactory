#!/usr/bin/env python3
"""Higher quality person cutout with BiRefNet (MIT license), for dark-on-dark or busy footage where the default
cutout leaks into the sofa or wobbles at the edges.

  python3 scripts/matte-hq.py <slug> [<startSec> <endSec>] [--every 2] [--out-slug <slug>] [--size 1080x1920] [--model path.onnx]

Reads public/raw/<slug>.mp4, writes public/matte/<out-slug>.webm (transparent VP9, same size as the video) with the
person visible only from startSec to endSec (the whole clip if you give no times) and fully transparent elsewhere. Frames in between the computed ones are
blended, so --every 2 halves the time (CPU: about 18 s per computed frame; a GPU is much faster).

Needs: pip install onnxruntime opencv-python-headless numpy, and the model file (about 220 MB, one-time download):
https://huggingface.co/onnx-community/BiRefNet_lite-ONNX/resolve/main/onnx/model.onnx  ->  models/birefnet_lite.onnx
Ask before downloading. Keep per-frame anchors from `npm run matte` (the .anchors.json) next to the output.
"""
import os, subprocess, sys, time
import cv2
import numpy as np

import argparse

ap = argparse.ArgumentParser(description='High quality person cutout (BiRefNet)')
ap.add_argument('slug')
ap.add_argument('times', nargs='*', type=float, help='startSec endSec (the whole clip if left out)')
ap.add_argument('--every', type=int, default=2)
ap.add_argument('--out-slug')
ap.add_argument('--size', default='1080x1920')
ap.add_argument('--model', default=os.path.join('models', 'birefnet_lite.onnx'))
ns = ap.parse_args()
if len(ns.times) not in (0, 2):
    ap.error('give both startSec and endSec, or neither')
args = [ns.slug] + [str(t) for t in ns.times]
slug = ns.slug
every = max(1, ns.every)
out_slug = ns.out_slug or slug
OW, OH = [int(v) for v in ns.size.split('x')]  # the cutout is always stored at output size
model = ns.model
if not os.path.exists(model):
    print(f'Model not found: {model}. See the note at the top of this file (one-time download, ask first).')
    sys.exit(1)

import onnxruntime as ort

so = ort.SessionOptions()
so.intra_op_num_threads = os.cpu_count() or 4
sess = ort.InferenceSession(model, so, providers=['CPUExecutionProvider'])
name = sess.get_inputs()[0].name
MEAN = np.array([0.485, 0.456, 0.406], np.float32)
STD = np.array([0.229, 0.224, 0.225], np.float32)

cap = cv2.VideoCapture(os.path.join('public', 'raw', f'{slug}.mp4'))
fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
W, H = OW, OH
total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
t0 = float(args[1]) if len(args) > 2 else 0.0
t1 = float(args[2]) if len(args) > 2 else total / fps
f0, f1 = max(0, int(t0 * fps)), min(total, int(t1 * fps))


def mask_of(bgr):
    x = cv2.resize(bgr[:, :, ::-1], (1024, 1024), interpolation=cv2.INTER_AREA).astype(np.float32) / 255
    x = ((x - MEAN) / STD).transpose(2, 0, 1)[None].astype(np.float32)
    o = sess.run(None, {name: x})[-1][0, 0]
    m = 1 / (1 + np.exp(-o))
    m = cv2.resize(m, (W, H), interpolation=cv2.INTER_CUBIC)  # mask at output size
    m = cv2.GaussianBlur(m, (0, 0), 1.1)  # soft edge, no halo
    return np.clip(m * 255, 0, 255).astype(np.uint8)


cap.set(cv2.CAP_PROP_POS_FRAMES, f0)
masks, picks = {}, [i for i in range(f0, f1) if (i - f0) % every == 0]
if picks and picks[-1] != f1 - 1:
    picks.append(f1 - 1)
start = time.time()
last = f0
for i in range(f0, f1):
    ok, fr = cap.read()
    if not ok:
        break
    if i in picks:
        masks[i] = mask_of(fr)
        done = len(masks)
        print(f'cutout {done}/{len(picks)}  {time.time() - start:.0f}s', flush=True)
keys = sorted(masks)


def alpha(i):
    if i in masks:
        return masks[i]
    lo = max(k for k in keys if k < i)
    hi = min(k for k in keys if k > i)
    w = (i - lo) / (hi - lo)
    return cv2.addWeighted(masks[lo], 1 - w, masks[hi], w, 0)


out = os.path.join('public', 'matte', f'{out_slug}.webm')
os.makedirs(os.path.dirname(out), exist_ok=True)
tmp = out + '.tmp.webm'
enc = subprocess.Popen(
    ['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', f'{W}x{H}', '-r', str(fps), '-i', '-',
     '-c:v', 'libvpx-vp9', '-pix_fmt', 'yuva420p', '-b:v', '0', '-crf', '26', '-auto-alt-ref', '0', '-row-mt', '1', tmp],
    stdin=subprocess.PIPE)
blank = np.zeros((H, W, 4), np.uint8).tobytes()
cap.set(cv2.CAP_PROP_POS_FRAMES, f0)  # read the frames again instead of keeping them all in memory
for i in range(total):
    if i < f0 or i >= f1:
        enc.stdin.write(blank)
        continue
    ok, fr = cap.read()
    if not ok:
        enc.stdin.write(blank)
        continue
    rgba = np.dstack([cv2.resize(fr, (W, H), interpolation=cv2.INTER_CUBIC)[:, :, ::-1], alpha(i)])
    enc.stdin.write(rgba.tobytes())
enc.stdin.close()
enc.wait()
os.replace(tmp, out)
print(f'wrote {out} (person visible {t0}s to {t1}s)')
