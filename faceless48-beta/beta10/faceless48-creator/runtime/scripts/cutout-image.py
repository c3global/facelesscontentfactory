"""Cut a person (the member or their AI avatar) out of a photo: transparent PNG for carousels and cards.

  npm run cutout -- path/to/photo.jpg            -> public/cutouts/<name>.png
  npm run cutout -- photo.jpg public/cutouts/me.png

Uses the high-quality cutout model that `npm run setup` downloads (models/birefnet_lite.onnx). The result is
trimmed to the person, so it can be placed anywhere.
"""
import os
import sys

import cv2
import numpy as np
import onnxruntime as ort

if len(sys.argv) < 2:
    sys.exit('Usage: npm run cutout -- <photo> [output.png]')
src = sys.argv[1]
name = os.path.splitext(os.path.basename(src))[0]
out = sys.argv[2] if len(sys.argv) > 2 else os.path.join('public', 'cutouts', f'{name}.png')
model = os.path.join('models', 'birefnet_lite.onnx')
if not os.path.exists(model):
    sys.exit('The cutout model is missing. Run: npm run setup')
img = cv2.imread(src, cv2.IMREAD_COLOR)
if img is None:
    sys.exit(f'Could not read the image: {src}')
H, W = img.shape[:2]
sess = ort.InferenceSession(model, providers=['CPUExecutionProvider'])
MEAN = np.array([0.485, 0.456, 0.406], np.float32)
STD = np.array([0.229, 0.224, 0.225], np.float32)
x = cv2.resize(img[:, :, ::-1], (1024, 1024), interpolation=cv2.INTER_AREA).astype(np.float32) / 255
x = ((x - MEAN) / STD).transpose(2, 0, 1)[None].astype(np.float32)
o = sess.run(None, {sess.get_inputs()[0].name: x})[-1][0, 0]
m = cv2.resize(1 / (1 + np.exp(-o)), (W, H), interpolation=cv2.INTER_CUBIC)
m = np.clip(cv2.GaussianBlur(m, (0, 0), 1.0) * 255, 0, 255).astype(np.uint8)
rgba = np.dstack([img, m])
ys, xs = np.where(m > 20)
if len(xs) == 0:
    sys.exit('No person found in that photo. Try a clearer photo with one person.')
pad = 12
y0, y1, x0, x1 = max(0, ys.min() - pad), min(H, ys.max() + pad), max(0, xs.min() - pad), min(W, xs.max() + pad)
os.makedirs(os.path.dirname(out) or '.', exist_ok=True)
cv2.imwrite(out, rgba[y0:y1, x0:x1])
print(f'Saved {out} ({x1 - x0} x {y1 - y0}). Use it as the presenter: "presenter": {{"src": "{out.replace("public/", "", 1)}"}}')
