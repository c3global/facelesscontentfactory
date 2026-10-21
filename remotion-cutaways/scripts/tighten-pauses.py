#!/usr/bin/env python3
"""
Cut the long pauses out of a clip and write a tightened copy with matching word times, captions and plan.

  python3 scripts/tighten-pauses.py <slug> [maxGapSec=0.3]

Reads public/raw/<slug>.mp4, content/<slug>.words.tsv, .captions.json and .scene.json.
Writes public/raw/<slug>-tight.mp4 and content/<slug>-tight.* (words, captions, plan with its effect times remapped).
Any silence longer than maxGapSec between two words is shortened to maxGapSec; shorter pauses stay as spoken.
"""
import json, subprocess, sys
from pathlib import Path

root = Path(__file__).resolve().parent.parent
slug = sys.argv[1]
max_gap = float(sys.argv[2]) if len(sys.argv) > 2 else 0.3
tight = f'{slug}-tight'

rows = [l.rstrip('\n').split('\t') for l in (root / f'content/{slug}.words.tsv').read_text().splitlines() if l.strip()]
words = [(w, float(a), float(b)) for w, a, b in rows if not w.startswith('[')]
end_of_speech = words[-1][2]
tail = 0.7

# segments to keep and the pauses removed between them
segs, cuts = [], []  # cuts: (cut_start, cut_end) in source time
seg_start = 0.0
for prev, nxt in zip(words, words[1:]):
    gap = nxt[1] - prev[2]
    if gap > max_gap + 0.02:
        keep = max_gap / 2
        cut_a, cut_b = prev[2] + keep, nxt[1] - keep
        segs.append((seg_start, cut_a))
        cuts.append((cut_a, cut_b))
        seg_start = cut_b
segs.append((seg_start, end_of_speech + tail))

def remap(t):
    return t - sum(min(b, t) - a for a, b in cuts if t > a)

# video and audio, one segment at a time, with a 20 ms audio fade so a cut never clicks
parts = []
for i, (a, b) in enumerate(segs):
    d = b - a
    parts.append(f'[0:v]trim={a:.3f}:{b:.3f},setpts=PTS-STARTPTS[v{i}]')
    parts.append(f'[0:a]atrim={a:.3f}:{b:.3f},asetpts=PTS-STARTPTS,afade=t=in:d=0.02,afade=t=out:st={max(0, d - 0.02):.3f}:d=0.02[a{i}]')
concat = ''.join(f'[v{i}][a{i}]' for i in range(len(segs))) + f'concat=n={len(segs)}:v=1:a=1[v][a]'
flt = ';'.join(parts + [concat])
out = root / f'public/raw/{tight}.mp4'
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', str(root / f'public/raw/{slug}.mp4'), '-filter_complex', flt, '-map', '[v]', '-map', '[a]',
                '-r', '30', '-c:v', 'libx264', '-crf', '17', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', str(out)], check=True)
new_len = remap(end_of_speech + tail)

# word times
(root / f'content/{tight}.words.tsv').write_text('\n'.join(f'{w}\t{remap(a):.3f}\t{remap(b):.3f}' for w, a, b in words) + '\n')
caps = json.loads((root / f'content/{slug}.captions.json').read_text())
for c in caps:
    for k in ('startMs', 'endMs', 'timestampMs'):
        if k in c and c[k] is not None:
            c[k] = round(remap(c[k] / 1000) * 1000)
(root / f'content/{tight}.captions.json').write_text(json.dumps(caps, indent=2))

# plan: new slug, new clip, effect times remapped
plan = json.loads((root / f'content/{slug}.scene.json').read_text())
plan['slug'] = tight
plan['video'] = f'raw/{tight}.mp4'
plan['durationSec'] = round(new_len, 2)
for sc in plan['scenes']:
    for sg in sc['segments']:
        sg['start'], sg['end'] = round(remap(sg['start']), 2), round(min(remap(sg['end']), new_len), 2)
for f in plan.get('fx', []):
    f['at'] = round(remap(f['at']), 2)
    if 'until' in f:
        f['until'] = round(remap(f['until']), 2)
(root / f'content/{tight}.scene.json').write_text(json.dumps(plan, indent=1))
print(f'{len(cuts)} pauses shortened, removed {sum(b - a for a, b in cuts):.1f} s; new length {new_len:.1f} s -> {tight}')
