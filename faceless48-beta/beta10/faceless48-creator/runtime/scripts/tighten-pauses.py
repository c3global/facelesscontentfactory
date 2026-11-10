#!/usr/bin/env python3
"""
Cut the long pauses out of a talking video and write a tightened copy with a matching plan (used for yaps).

  python3 scripts/tighten-pauses.py content/<plan>.json [maxGapSec=0.3]

Reads the talking-head plan (its video in public/ and its word-level captions) and writes:
  public/raw/<slug>-tight.mp4   the clip with every silence longer than maxGapSec shortened to maxGapSec
  content/<slug>-tight.json     the plan with its slug, clip, duration, segments, effects, end card and captions remapped
Pauses shorter than maxGapSec stay as spoken. 0.4 is a looser pace, 0.2 a tighter one. These are jump cuts: watch the
person's pose at each cut, and cover an ugly one with a cutaway or a slow zoom. Existing files are never overwritten.
If the plan uses a cutout (matte), rebuild it for the -tight clip: the old one no longer matches.
"""
import json, subprocess, sys
from pathlib import Path

if len(sys.argv) < 2:
    print(__doc__)
    sys.exit(1)
root = Path.cwd()
plan_path = Path(sys.argv[1])
max_gap = float(sys.argv[2]) if len(sys.argv) > 2 else 0.3
doc = json.loads(plan_path.read_text())
if doc.get('kind') != 'talking-head':
    sys.exit('This tool works on talking-head plans ("kind": "talking-head").')
plan, caps = doc['plan'], doc.get('captions') or []
words = [(c['startMs'] / 1000, c['endMs'] / 1000) for c in caps if c.get('text', '').strip()]
if len(words) < 2:
    sys.exit('The plan needs word-level captions (run the transcription first).')
slug = f"{plan['slug']}-tight"
src = root / 'public' / plan['video']
out_video = root / 'public' / 'raw' / f'{slug}.mp4'
out_plan = root / 'content' / f'{slug}.json'
for p in (out_video, out_plan):
    if p.exists():
        sys.exit(f'{p} already exists. Move it or change the plan slug first.')
if not src.exists():
    sys.exit(f'Video not found: {src}')

end_of_speech = words[-1][1]
first_word = words[0][0]
tail = 0.7  # a short breath after the last word, then stop (before a hand reaches for the camera)
end_t = min(end_of_speech + tail, float(plan['durationSec']))
# Silences come from the audio itself (word times from transcription run end to end and hide the pauses).
probe = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', str(src), '-vn', '-af', f'silencedetect=noise=-35dB:d={max_gap + 0.05}', '-f', 'null', '-'],
                       capture_output=True, text=True).stderr
starts = [float(x.split(':')[1].split()[0]) for x in probe.splitlines() if 'silence_start' in x]
ends = [float(x.split('silence_end:')[1].split()[0]) for x in probe.splitlines() if 'silence_end' in x]
segs, cuts, seg_start = [], [], 0.0
keep = max_gap / 2
for s0, e0 in zip(starts, ends):
    if s0 < first_word or e0 > end_of_speech or e0 - s0 <= max_gap + 0.02:
        continue  # leave the lead-in and the ending alone
    a, b = s0 + keep, e0 - keep
    segs.append((seg_start, a))
    cuts.append((a, b))
    seg_start = b
segs.append((seg_start, end_t))


def remap(t):
    return t - sum(min(b, t) - a for a, b in cuts if t > a)


parts = []
for i, (a, b) in enumerate(segs):
    d = b - a
    parts.append(f'[0:v]trim={a:.3f}:{b:.3f},setpts=PTS-STARTPTS[v{i}]')
    # a 20 ms fade at each cut so it never clicks
    parts.append(f'[0:a]atrim={a:.3f}:{b:.3f},asetpts=PTS-STARTPTS,afade=t=in:d=0.02,afade=t=out:st={max(0, d - 0.02):.3f}:d=0.02[a{i}]')
flt = ';'.join(parts + [''.join(f'[v{i}][a{i}]' for i in range(len(segs))) + f'concat=n={len(segs)}:v=1:a=1[v][a]'])
out_video.parent.mkdir(parents=True, exist_ok=True)
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', str(src), '-filter_complex', flt, '-map', '[v]', '-map', '[a]',
                '-r', '30', '-c:v', 'libx264', '-crf', '17', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', str(out_video)], check=True)
new_len = remap(end_t)

TIME_KEYS = {'at', 'until', 'start', 'end', 'startAt', 'from'}
SKIP = {'durationSec'}


def walk(node, in_card_flip=False):
    if isinstance(node, dict):
        flip = in_card_flip or node.get('type') == 'card-flip'
        for k, v in list(node.items()):
            if k in SKIP:
                continue
            is_time = (k in TIME_KEYS or k.endswith('At')) and not (k == 'flipAt' and flip)
            if k == 'wordTimes' and isinstance(v, list):
                node[k] = [round(remap(x), 2) for x in v]
            elif is_time and isinstance(v, (int, float)) and not isinstance(v, bool):
                node[k] = round(min(remap(v), new_len), 2)
            else:
                walk(v, flip)
    elif isinstance(node, list):
        for x in node:
            walk(x, in_card_flip)


for key in ('scenes', 'fx', 'endCard'):
    if key in plan:
        walk(plan[key])
plan['slug'] = slug
plan['video'] = f'raw/{slug}.mp4'
plan['durationSec'] = round(new_len, 2)
for c in caps:
    for k in ('startMs', 'endMs', 'timestampMs'):
        if c.get(k) is not None:
            c[k] = round(remap(c[k] / 1000) * 1000)
caps[:] = [c for c in caps if c['endMs'] > c['startMs']]
out_plan.write_text(json.dumps(doc, indent=1))
print(f'{len(cuts)} pauses shortened, removed {sum(b - a for a, b in cuts):.1f} s; new length {new_len:.1f} s -> {out_plan}')
if plan.get('matte'):
    print('NOTE: this plan uses a cutout. Rebuild it for the -tight clip before rendering.')
