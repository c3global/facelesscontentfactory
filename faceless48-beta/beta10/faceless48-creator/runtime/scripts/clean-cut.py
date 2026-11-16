#!/usr/bin/env python3
"""
Clean cut for talking heads made from several clips: join the parts, drop retakes and stumbles,
and shorten every pause to a breath, measured from the audio itself (not from Whisper word times,
which stretch across silences).

  npm run clean-cut -- content/edits/<slug>.cut.json

Cut file:
  {
    "slug": "tolerance",
    "parts": [
      {"src": "work/src/tol1.mp4"},
      {"src": "work/src/tol2.mp4", "from": 0, "to": 16.7, "drop": [[3.2, 3.6]]}
    ],
    "breath": 0.18,        # pause length left between phrases (seconds)
    "minPause": 0.22,      # silences shorter than this stay as spoken
    "noiseDb": -30,
    "tail": 2.6            # footage kept after the last word (under the end card); padded if the clip is short
  }

Writes public/raw/<slug>.mp4 (1080x1920, 30 fps) and work/<slug>.cutlist.json.
Transcribe the result afterwards: word times then match the cleaned clip exactly.
"""
import json, re, subprocess, sys
from pathlib import Path

root = Path(__file__).resolve().parent.parent
spec = json.loads(Path(sys.argv[1]).read_text())
slug = spec['slug']
breath = spec.get('breath', 0.18)
min_pause = spec.get('minPause', 0.22)
noise = spec.get('noiseDb', -30)
tail = spec.get('tail', 2.6)


def duration(src):
    return float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', src]).decode())


def silences(src):
    log = subprocess.run(['ffmpeg', '-hide_banner', '-i', src, '-af', f'silencedetect=noise={noise}dB:d=0.12', '-f', 'null', '-'],
                         capture_output=True, text=True).stderr
    st = [float(x) for x in re.findall(r'silence_start: ([\d.]+)', log)]
    en = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', log)]
    out = list(zip(st, en))
    if len(st) > len(en):
        out.append((st[-1], duration(src)))
    # merge touching silences
    merged = []
    for a, b in out:
        if merged and a - merged[-1][1] < 0.02:
            merged[-1] = (merged[-1][0], b)
        else:
            merged.append((a, b))
    return merged


segs = []  # (src_index, a, b)
srcs = []
nparts = len(spec['parts'])
for pi, part in enumerate(spec['parts']):
    src = str(root / part['src'])
    srcs.append(src)
    dur = duration(src)
    lo, hi = part.get('from', 0.0), min(part.get('to', dur), dur)
    sil = silences(src)
    # speech = [lo, hi] minus silences and minus drops
    removed = [(a, b) for a, b in sil] + [tuple(d) for d in part.get('drop', [])]
    removed.sort()
    speech, cur = [], lo
    for a, b in removed:
        if b <= cur or a >= hi:
            continue
        if a > cur:
            speech.append([cur, a])
        cur = max(cur, b)
    if cur < hi:
        speech.append([cur, hi])
    speech = [s for s in speech if s[1] - s[0] > 0.06]
    # rejoin across short silences (natural rhythm stays), pad each kept run by half a breath
    runs = []
    for a, b in speech:
        if runs and a - runs[-1][1] < min_pause and not any(d[0] < a and d[1] > runs[-1][1] for d in part.get('drop', [])):
            runs[-1][1] = b
        else:
            runs.append([a, b])
    half = breath / 2
    last_part = pi == nparts - 1
    drops = [tuple(d) for d in part.get('drop', [])]
    for ri, (a, b) in enumerate(runs):
        a2 = max(lo, a - half)
        b2 = b + (tail if (last_part and ri == len(runs) - 1) else half)
        for d0, d1 in drops:  # padding never reaches back into a dropped retake or stumble
            if d0 < a <= d1 + half:
                a2 = max(a2, d1)
            if d0 - half <= b < d1:
                b2 = min(b2, d0)
        segs.append((pi, a2, min(b2, hi)))
    if last_part:
        want_end = runs[-1][1] + tail
        pad = max(0.0, want_end - hi)
    print(f'{Path(src).name}: {len(runs)} phrases kept from {lo:.2f}-{hi:.2f}')

# build filter
parts, labels = [], []
for i, (pi, a, b) in enumerate(segs):
    d = b - a
    parts.append(f'[{pi}:v]trim={a:.3f}:{b:.3f},setpts=PTS-STARTPTS,fps=30,scale=1080:1920:flags=lanczos,setsar=1[v{i}]')
    parts.append(f'[{pi}:a]atrim={a:.3f}:{b:.3f},asetpts=PTS-STARTPTS,aresample=48000,'
                 f'afade=t=in:d=0.012,afade=t=out:st={max(0, d - 0.012):.3f}:d=0.012[a{i}]')
    labels.append(f'[v{i}][a{i}]')
flt = ';'.join(parts) + ';' + ''.join(labels) + f'concat=n={len(segs)}:v=1:a=1[vc][ac]'
if pad > 0.01:
    flt += f';[vc]tpad=stop_mode=clone:stop_duration={pad:.3f}[v];[ac]apad=pad_dur={pad:.3f}[a]'
else:
    flt += ';[vc]null[v];[ac]anull[a]'
out = root / f'public/raw/{slug}.mp4'
out.parent.mkdir(parents=True, exist_ok=True)
cmd = ['ffmpeg', '-y', '-loglevel', 'error']
for s in srcs:
    cmd += ['-i', s]
cmd += ['-filter_complex', flt, '-map', '[v]', '-map', '[a]', '-r', '30', '-c:v', 'libx264', '-crf', '17',
        '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', str(out)]
subprocess.run(cmd, check=True)
orig = sum(duration(s) for s in srcs)
new = duration(str(out))
(root / 'work').mkdir(exist_ok=True)
(root / f'work/{slug}.cutlist.json').write_text(json.dumps({'segments': [{'part': p, 'from': round(a, 3), 'to': round(b, 3)} for p, a, b in segs], 'pad': round(pad, 3)}, indent=1))
print(f'{slug}: {len(segs)} pieces, {orig:.1f} s of clips -> {new:.1f} s ({out.relative_to(root)})')
