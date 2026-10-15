#!/usr/bin/env python3
"""Person matte: video in, soft alpha out. Usage: matte.py <video> <out_dir> [--max-seconds N]
Writes <out_dir>/alpha.mp4 (gray, 540x960 soft matte) and <out_dir>/anchors.json (per-frame head top, center x, chest y, left/right extents, normalized 0..1)."""
import sys, json, subprocess, os, cv2, numpy as np, mediapipe as mp
from mediapipe.tasks import python as mpp
from mediapipe.tasks.python import vision
video, out = sys.argv[1], sys.argv[2]
maxs = float(sys.argv[sys.argv.index('--max-seconds')+1]) if '--max-seconds' in sys.argv else None
model = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'models', 'selfie_segmenter.tflite')
os.makedirs(out, exist_ok=True)
cap = cv2.VideoCapture(video)
fps = cap.get(cv2.CAP_PROP_FPS) or 30
W, H = int(cap.get(3)), int(cap.get(4))
mw, mh = 540, 960
seg = vision.ImageSegmenter.create_from_options(vision.ImageSegmenterOptions(
    base_options=mpp.BaseOptions(model_asset_path=model), output_category_mask=False, output_confidence_masks=True,
    running_mode=vision.RunningMode.VIDEO))
ff = subprocess.Popen(['ffmpeg','-v','error','-y','-f','rawvideo','-pix_fmt','gray','-s',f'{mw}x{mh}','-r',str(fps),'-i','-',
                       '-c:v','libx264','-crf','12','-pix_fmt','yuv420p',os.path.join(out,'alpha.mp4')], stdin=subprocess.PIPE)
anchors = []; prev = None; i = 0
def guided(p, I, r=8, eps=1e-3):
    mean = lambda x: cv2.boxFilter(x, -1, (r, r))
    mI, mp_ = mean(I), mean(p)
    cov = mean(I*p) - mI*mp_; var = mean(I*I) - mI*mI
    a = cov/(var+eps); b = mp_ - a*mI
    return mean(a)*I + mean(b)
while True:
    ok, bgr = cap.read()
    if not ok or (maxs and i/fps > maxs): break
    small = cv2.resize(bgr, (mw, mh), interpolation=cv2.INTER_AREA)
    rgb = cv2.cvtColor(small, cv2.COLOR_BGR2RGB)
    res = seg.segment_for_video(mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb), int(i*1000/fps))
    m = res.confidence_masks[0].numpy_view().astype(np.float32)
    m = cv2.resize(m, (mw, mh))
    # guided filter sharpens the soft edge against the real image (hair)
    g = cv2.cvtColor(small, cv2.COLOR_BGR2GRAY).astype(np.float32)/255
    m = np.clip(guided(m, g), 0, 1)
    # temporal smoothing
    if prev is not None: m = 0.65*m + 0.35*prev
    prev = m
    # choke the edge a little: drops the gray-room halo around curly hair without losing the body
    m8 = (np.clip((m-0.22)/0.60, 0, 1)*255).astype(np.uint8)
    m8 = cv2.erode(m8, np.ones((3, 3), np.uint8))
    m8 = cv2.GaussianBlur(m8, (3, 3), 0)
    ff.stdin.write(m8.tobytes())
    ys, xs = np.where(m8 > 128)
    if len(ys) > 200:
        top = float(ys.min())/mh
        rows = np.where((m8 > 128).sum(axis=1) > 5)[0]
        # head center: mean x of the top 12% of the figure
        h0 = int(ys.min()); band = (ys < h0 + 0.12*mh)
        cx = float(xs[band].mean())/mw if band.any() else 0.5
        chest = min(1.0, top + 0.33)
        anchors.append([round(top,4), round(cx,4), round(chest,4), round(float(xs.min())/mw,4), round(float(xs.max())/mw,4)])
    else:
        anchors.append(anchors[-1] if anchors else [0.1,0.5,0.4,0.2,0.8])
    i += 1
ff.stdin.close(); ff.wait()
json.dump({'fps': fps, 'frames': i, 'anchors': anchors}, open(os.path.join(out,'anchors.json'),'w'))
print('frames', i)
