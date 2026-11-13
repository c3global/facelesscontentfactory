#!/usr/bin/env python3
"""
Preview stills for every effect and graphic, rendered by the plug-in runtime in a given brand (Faceless48 for the
Creator Studio). One real example of each effect is taken from the lab and demo plans in content/, moved onto the
Tolerance clip (which has a high-quality cutout for the behind-the-presenter effects), and captured mid-effect.

  python3 scripts/build-effect-previews.py <runtime dir>      # writes <runtime>/content/pv-*.scene.json and work/previews.json

Then render each pv plan's stills in the runtime and shrink them (see work/previews.json for slug -> [(effect, second)]).
"""
import glob, json, os, re, shutil, sys

RT = sys.argv[1]
names = json.load(open('work/fxnames.json'))
fxsrc, gsrc = {}, {}
for f in sorted(glob.glob('content/*.scene.json')):
    if os.path.basename(f).startswith(('tol', 'tolerance')):
        continue
    try:
        p = json.load(open(f))
    except Exception:
        continue
    for x in p.get('fx', []):
        fxsrc.setdefault(x['type'], x)
    for sc in p.get('scenes', []):
        for sg in sc['segments']:
            for g in sg.get('graphics', []):
                gsrc.setdefault(g['type'], (g, sg, sc))

u = open('src/fx/util.tsx').read()
BEHIND = set(re.findall(r"'([a-z0-9-]+)'", u[u.index('export const BEHIND'):u.index('export const NEEDS_MATTE')])) | {'freeze-sticker'}
LEN = {k: float(v) for k, v in re.findall(r"'([a-z0-9-]+)': ([\d.]+),", u[u.index('const LEN'):u.index('};', u.index('const LEN'))])}
MEDIA_KEYS = {'src', 'media', 'images', 'plate', 'iconSrc', 'photo', 'image', 'poster', 'video'}
# the clip has the high-quality cutout in these windows (seconds)
WINDOWS = [(0.1, 3.6), (7.0, 10.3), (15.3, 31.0)]


def shift(o, d, a0):
    """Move absolute times by d. Relative numbers (like flipAt 1.1) sit below the effect's start and stay."""
    if isinstance(o, dict):
        out = {}
        for k, v in o.items():
            if k in MEDIA_KEYS:
                # the plug-in's own placeholder pictures and clips stand in for the member's media
                if k == 'images':
                    out[k] = ['collage/1.png', 'collage/2.png', 'collage/3.png', 'collage/4.png', 'collage/5.png', 'collage/6.png'][:max(1, len(v) if isinstance(v, list) else 4)]
                elif k == 'media':
                    out[k] = 'media/clip-1.mp4'
                elif k in ('src', 'image', 'photo', 'poster') and isinstance(v, str):
                    out[k] = 'media/clip-2.mp4' if v.endswith(('.mp4', '.mov', '.webm')) else 'collage/%d.png' % (1 + len(out) % 8)
                continue
            if isinstance(v, (int, float)) and not isinstance(v, bool) and (k in ('at', 'until') or k.endswith('At')) and v >= a0 - 0.6:
                out[k] = round(v + d, 3)
            elif k in ('stopAt', 'wordTimes') and isinstance(v, list):
                out[k] = [round(x + d, 3) for x in v]
            else:
                out[k] = shift(v, d, a0)
        return out
    if isinstance(o, list):
        return [shift(x, d, a0) for x in o]
    if isinstance(o, str):
        # previews are for Faceless48 members: no C3 Global or Dr. CK text from the lab plans
        for x, y in (('The C3 Times', 'The Daily Edit'), ('Dr. CK', 'Your Name'), ('Dr. CiCi', 'Your Name'), ('C3 GLOBAL', 'FACELESS48'), ('C3 Global', 'Faceless48'), ('c3global.co', 'faceless48.com'), ('c3global', 'faceless48'), ('C3G', 'F48'), ('C3 ', 'F48 ')):
            o = o.replace(x, y)
        if o.strip() == 'C3':
            o = 'F48'
    return o


def slots(n, behind):
    """n start times, 3 s apart, inside the cutout windows for behind effects, anywhere otherwise."""
    out = []
    spans = WINDOWS if behind else [(0.2, 33.0)]
    for a, b in spans:
        t = a
        while t + 2.8 <= b and len(out) < n:
            out.append(round(t, 2))
            t += 3.0
    return out


fx_b = [t for t in names['fx'] if t in BEHIND]
fx_n = [t for t in names['fx'] if t not in BEHIND]
g_all = [t for t in names['g'] if t in gsrc]
plans, index = [], {}
dur = 35.6


def base(slug):
    return {'slug': slug, 'video': 'raw/tolerance.mp4', 'durationSec': dur, 'matte': 'tolerance', 'fxSound': 'off', 'captionStyle': 'editorial',
            'scenes': [{'id': 'a', 'mood': 'dark', 'segments': [{'start': 0, 'end': dur, 'layout': 'A', 'captions': 'off', 'graphics': []}]}], 'fx': []}


def chunk(items, behind, prefix):
    k = 0
    while items:
        ts = slots(len(items), behind)
        take, items = items[:len(ts)], items[len(ts):]
        slug = f'pv-{prefix}{k}'
        p = base(slug)
        for typ, t in zip(take, ts):
            x = fxsrc[typ]
            a0 = x['at']
            y = shift(x, t - a0, a0)
            y['at'] = t
            ln = (x['until'] - a0) if 'until' in x else LEN.get(typ, 2.5)
            y['until'] = round(t + min(2.8, ln), 3)
            p['fx'].append(y)
            index.setdefault(slug, []).append((typ, round(t + min(1.6, 0.65 * min(2.8, ln)), 2)))
        plans.append(p)
        k += 1


chunk(fx_b, True, 'b')
chunk(fx_n, False, 'n')
# graphics: one plan per graphic, in the layout it was designed for
for typ in g_all:
    g, sg, sc = gsrc[typ]
    slug = f'pv-g-{typ}'
    p = base(slug)
    a0 = g['at']
    y = shift(g, 2.0 - a0, a0)
    y['at'] = 2.0
    y['until'] = 6.0
    seg = {'start': 0, 'end': 8.0, 'layout': sg['layout'], 'captions': 'off', 'graphics': [y]}
    if sg.get('avatar'):
        seg['avatar'] = sg['avatar']
    p['scenes'] = [{'id': 'g', 'mood': sc.get('mood', 'dark'), 'segments': [seg, {'start': 8.0, 'end': dur, 'layout': 'A', 'captions': 'off', 'graphics': []}]}]
    plans.append(p)
    index[slug] = [(typ, 4.2)]

os.makedirs(os.path.join(RT, 'content'), exist_ok=True)
for p in plans:
    json.dump(p, open(os.path.join(RT, 'content', p['slug'] + '.scene.json'), 'w'), indent=1)
    json.dump([], open(os.path.join(RT, 'content', p['slug'] + '.captions.json'), 'w'))
json.dump(index, open('work/previews.json', 'w'), indent=1)
print(len(plans), 'plans,', sum(len(v) for v in index.values()), 'previews')
