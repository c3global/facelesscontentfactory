#!/usr/bin/env python3
"""Cleaner cutout edges for behind-her effects (spotlight, type wall, orbit, ...).

  npm run matte:refine -- <slug> <fromSec> <toSec>

`npm run matte` cuts her out at half resolution with a basic segmenter, which leaves a pale halo around curly hair and
keeps bits of the room lit. This re-cuts only the seconds you name (the span an effect runs, plus its fade) with
closed-form alpha matting at full size, then writes the result back into public/matte/<slug>.webm. Frames outside the
span keep the old cutout. About 25 to 40 seconds per frame on one core, so run it for the effect span only.

Needs: pip install pymatting (and the packages `npm run matte` needs). Run `npm run matte -- <slug>` first.
"""
import os, subprocess, sys
import cv2, numpy as np
from multiprocessing import Pool

ROOT = os.getcwd()
slug, t0, t1 = sys.argv[1], float(sys.argv[2]), float(sys.argv[3])
raw = os.path.join(ROOT, 'public', 'raw', f'{slug}.mp4')
webm = os.path.join(ROOT, 'public', 'matte', f'{slug}.webm')
tmp = os.path.join(ROOT, 'work', f'refine-{slug}')
os.makedirs(tmp, exist_ok=True)
OW, OH = 1080, 1920  # the cutout is always stored at output size

cap = cv2.VideoCapture(raw)
fps = cap.get(cv2.CAP_PROP_FPS) or 30
n_total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
f0, f1 = max(0, int(t0 * fps)), min(n_total, int(t1 * fps))
cap.release()

_seg = None


def segmenter():
    global _seg
    if _seg is None:
        import mediapipe as mp
        from mediapipe.tasks import python as mpp
        from mediapipe.tasks.python import vision
        model = os.path.join(ROOT, 'scripts', 'models', 'selfie_segmenter.tflite')
        _seg = vision.ImageSegmenter.create_from_options(vision.ImageSegmenterOptions(
            base_options=mpp.BaseOptions(model_asset_path=model), output_category_mask=False,
            output_confidence_masks=True, running_mode=vision.RunningMode.IMAGE))
    return _seg


def refine(i):
    out = os.path.join(tmp, f'{i:05d}.npy')
    if os.path.exists(out):
        return i
    import mediapipe as mp
    from pymatting import estimate_alpha_cf
    cap = cv2.VideoCapture(raw)
    cap.set(cv2.CAP_PROP_POS_FRAMES, i)
    ok, bgr = cap.read()
    cap.release()
    bgr = cv2.resize(bgr, (OW, OH), interpolation=cv2.INTER_CUBIC)
    small = cv2.resize(bgr, (540, 960), interpolation=cv2.INTER_AREA)
    res = segmenter().segment(mp.Image(image_format=mp.ImageFormat.SRGB, data=cv2.cvtColor(small, cv2.COLOR_BGR2RGB)))
    m = cv2.resize(res.confidence_masks[0].numpy_view().astype(np.float32), (OW, OH), interpolation=cv2.INTER_CUBIC)
    k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (25, 25))
    sure_fg = cv2.erode((m > 0.9).astype(np.uint8), k)
    sure_bg = cv2.erode((m < 0.1).astype(np.uint8), k)
    tri = np.full((OH, OW), 0.5, np.float64)
    tri[sure_fg > 0] = 1.0
    tri[sure_bg > 0] = 0.0
    img = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB).astype(np.float64) / 255
    a = np.clip(estimate_alpha_cf(img, tri), 0, 1).astype(np.float32)
    np.save(out, a)
    print('refined frame', i, flush=True)
    return i


if __name__ == '__main__':
    frames = list(range(f0, f1))
    print(f'refining {len(frames)} frames ({t0}s to {t1}s) of {slug}', flush=True)
    with Pool(int(os.environ.get('REFINE_PROCS', '3'))) as p:
        for _ in p.imap_unordered(refine, frames):
            pass
    load = lambda i: np.load(os.path.join(tmp, f'{i:05d}.npy'))
    # old cutout's alpha stream, frame by frame; refined frames replace it, lightly smoothed over time
    dec = subprocess.Popen(['ffmpeg', '-v', 'error', '-c:v', 'libvpx-vp9', '-i', webm, '-vf', 'alphaextract,format=gray', '-f', 'rawvideo', '-pix_fmt', 'gray', '-'], stdout=subprocess.PIPE)
    alpha_mp4 = os.path.join(tmp, 'alpha.mp4')
    enc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'gray', '-s', f'{OW}x{OH}', '-r', str(fps), '-i', '-', '-c:v', 'libx264', '-crf', '8', '-pix_fmt', 'yuv420p', alpha_mp4], stdin=subprocess.PIPE)
    size = OW * OH
    i = 0
    while True:
        buf = dec.stdout.read(size)
        if len(buf) < size:
            break
        if f0 <= i < f1:
            a = load(i)
            nb = [load(j) for j in (i - 1, i + 1) if f0 <= j < f1]
            a = 0.5 * a + 0.5 * sum(nb) / len(nb) if nb else a
            frame = (np.clip(a, 0, 1) * 255).astype(np.uint8)
        else:
            frame = np.frombuffer(buf, np.uint8).reshape(OH, OW)
        enc.stdin.write(frame.tobytes())
        i += 1
    enc.stdin.close()
    enc.wait()
    dec.wait()
    out_tmp = os.path.join(ROOT, 'public', 'matte', f'{slug}.refined.webm')
    subprocess.check_call(['ffmpeg', '-v', 'error', '-y', '-i', raw, '-i', alpha_mp4, '-filter_complex',
                           f'[1:v]scale={OW}:{OH}:flags=bicubic,format=gray[a];[0:v]scale={OW}:{OH},format=yuv420p[v];[v][a]alphamerge',
                           '-c:v', 'libvpx-vp9', '-pix_fmt', 'yuva420p', '-b:v', '5M', '-deadline', 'good', '-cpu-used', '4', '-row-mt', '1', '-auto-alt-ref', '0', '-an', out_tmp])
    os.replace(out_tmp, webm)
    print(f'wrote {webm} ({i} frames, {f1 - f0} refined)')
