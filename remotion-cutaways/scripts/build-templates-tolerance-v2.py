#!/usr/bin/env python3
"""
Tolerance in all 8 templates, version 2 (after Dr. CK's review, Nov 13 2026).

What changed from version 1:
- captions: every word appears as she says it; words already written on screen are never captioned (src/TemplateCaptions.tsx)
- illustrated examples of what she says (graphic `examples`), with her exact words as the heading
- picture-in-picture windows (D corner, O circle, F large window) back in every template
- strong punch-ins on jump cuts: wide (1.0) and close on the face, no slow drift underneath
- effects behind her from the library (high-quality cutout: public/matte/tolerance.webm)
- no letterbox on Cinematic; glass text effects in Glass Lab; wall effects in Creator Hype
- music: Empires for quiet, glass, analyst, cinematic, teach; Make It Look Easy for hype, magazine, scrapbook
Card text is her script, her Notion on-screen text, or generic illustration text only.
"""
import json, shutil

# The layout below was written against the first clean cut (content/tolerance.v1cut.words.tsv). Every time in a plan is
# remapped word by word onto the current cut (content/tolerance.words.tsv), so a re-cut never needs the plans rewritten.
OLD = [(w, float(a), float(b)) for w, a, b in (l.rstrip('\n').split('\t') for l in open('content/tolerance.v1cut.words.tsv') if l.strip())]
NEW = [(w, float(a), float(b)) for w, a, b in (l.rstrip('\n').split('\t') for l in open('content/tolerance.words.tsv') if l.strip())]
assert [w for w, _, _ in OLD] == [w for w, _, _ in NEW], 'the two cuts must have the same words'
PAIRS = [(0.0, 0.0)] + [(o[1], n[1]) for o, n in zip(OLD, NEW)] + [(OLD[-1][2], NEW[-1][2])]


def remap(t):
    if t <= 0:
        return t
    for (o0, n0), (o1, n1) in zip(PAIRS, PAIRS[1:]):
        if o0 <= t <= o1:
            return round(n0 + (n1 - n0) * (t - o0) / (o1 - o0 or 1), 3)
    return round(t - PAIRS[-1][0] + PAIRS[-1][1], 3)


def unmap(t):
    for (o0, n0), (o1, n1) in zip(PAIRS, PAIRS[1:]):
        if n0 <= t <= n1:
            return round(o0 + (o1 - o0) * (t - n0) / (n1 - n0 or 1), 3)
    return round(t - PAIRS[-1][1] + PAIRS[-1][0], 3)


import subprocess
DUR_NEW = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', 'public/raw/tolerance.mp4']))
_cl = json.load(open('work/tolerance.cutlist.json'))
_t, _cuts = 0.0, []
for _s in _cl['segments']:
    _t += _s['to'] - _s['from']
    _cuts.append(_t)
END = round(unmap(NEW[-1][2] + 0.18), 3)
CUTS = [unmap(c) for c in _cuts if c < NEW[-1][2] - 0.2]
DUR = round(unmap(DUR_NEW), 3)
TIME_KEYS = {'at', 'until', 'start', 'end', 'startAt', 'knockAt', 'popAt', 'revealAt'}


def remap_plan(o):
    if isinstance(o, dict):
        return {k: (remap(v) if k in TIME_KEYS and isinstance(v, (int, float)) else [remap(x) for x in v] if k in ('wordTimes', 'stopAt') else remap_plan(v)) for k, v in o.items()}
    if isinstance(o, list):
        return [remap_plan(x) for x in o]
    return o


VEL = 'backdrops/red-velvet.jpg'
W = OLD
SONG1, SONG2 = 'music/leveled/empires.mp3', 'music/leveled/make-it-look-easy.mp3'


def words(s, e):
    return [(w, a) for w, a, b in W if s - 0.02 <= a < e]


def say(s, e):
    ws = words(s, e)
    return ' '.join(w for w, _ in ws), [round(a, 2) for _, a in ws]


def at(word, after=0.0):
    for w, a, b in W:
        if a >= after and w.lower().strip('.,?') == word.lower().strip('.,?'):
            return round(a, 2)
    raise KeyError(word)


def ex(s, e, kind):
    text, times = say(s, e)
    return {'say': text, 'wordTimes': times, 'kind': kind, 'at': round(times[0], 2)}


def examples(s, e, skin, items, y=720, h=760):
    return {'type': 'examples', 'at': s, 'until': e, 'props': {'skin': skin, 'items': items, 'y': y, 'height': h, 'emphasis': ['unwritten', 'newcomer', 'left', 'belongs']}}


def examplesT(s, e, skin, items):
    return examples(s, e, skin, items, y=1010, h=470)


SIG_B = [7.25, 9.1, 11.0, 12.92, 14.49]
BOX = {'S': (250, 720), 'T': (1010, 470), 'O': (800, 680)}


def seq(sid, items, bounds, skin, layouts, mood='dark', bg=None):
    """One scene per example; she swaps between top and bottom (or circle and bottom) as each new example lands."""
    out = []
    for i, it in enumerate(items):
        lay = layouts[i % len(layouts)]
        y, h = BOX[lay]
        s0, e0 = bounds[i], bounds[i + 1]
        sc = scene(f'{sid}{i}', s0, e0, lay, [examples(s0, e0, skin, [it], y=y, h=h)], mood=mood, bg=bg, focus={'y': 8, 'zoom': 1.1} if lay == 'S' else None)
        sc['segments'][0]['cut'] = True
        out.append(sc)
    return out


def full(sid, s, e, close=1.5, mood='dark', cap='bottom', bg=None, first_close=False):
    """Her full frame, split at every jump cut: wide and close on the face alternate, as hard cuts."""
    pts = [s] + [c for c in CUTS if s + 0.15 < c < e - 0.15] + [e]
    segs = []
    for k in range(len(pts) - 1):
        is_close = (k % 2 == 1) != first_close
        seg = {'start': pts[k], 'end': pts[k + 1], 'layout': 'A', 'captionPos': cap, 'graphics': [], 'focus': {'y': 24, 'zoom': close} if is_close else {'y': 40, 'zoom': 1.0}}
        if k:
            seg['cut'] = True
        segs.append(seg)
    sc = {'id': sid, 'mood': mood, 'segments': segs}
    if bg:
        sc['bg'] = bg
    return sc


def scene(sid, s, e, layout, graphics=(), mood='dark', avatar=None, cap='bottom', bg=None, focus=None):
    seg = {'start': s, 'end': e, 'layout': layout, 'captionPos': cap, 'graphics': list(graphics)}
    # captions sit in the empty space between her window and the card, never on either
    if layout == 'T':
        seg['captionY'] = 935
    elif layout == 'O':
        seg['captionY'] = 735
    if avatar:
        seg['avatar'] = avatar
    if focus:
        seg['focus'] = focus
    sc = {'id': sid, 'mood': mood, 'segments': [seg]}
    if bg:
        sc['bg'] = bg
    return sc


def statement(s, e, mood='dark', bg=None, em=('Tolerance',)):
    text, times = say(s, e)
    g = {'type': 'statement-card', 'at': s, 'until': e, 'box': {'y': 150, 'h': 900, 'center': True}, 'props': {'text': text, 'emphasis': list(em), 'wordTimes': times}}
    return scene('st%d' % int(s), s, e, 'E', [g], mood=mood, avatar='hidden', bg=bg)


def plan(name, caption, song, scenes, fx, **kw):
    p = {
        'slug': f'tol2-{name}', 'template': name, 'video': 'raw/tolerance.mp4', 'durationSec': DUR, 'matte': 'tolerance',
        'theme': {'field': kw.get('field', 'black'), 'sans': 'DM Sans'}, 'captionStyle': caption,
        'emphasis': ['belongs', 'unwritten', 'Tolerance', 'newcomer', 'left'],
        'hero': [], 'boxed': [], 'finish': kw.get('finish', {'grain': 0.0, 'lightLeaks': 0.0}), 'scrim': kw.get('scrim', 0.55),
        'scenes': scenes, 'fx': fx, 'fxSound': kw.get('sound', 'minimal'),
        'endCard': {'variant': 'link-pill', 'startAt': END, 'label': 'LINK BELOW OR IN MY BIO', 'url': 'bio.c3global.co'},
        'music': {'src': song, 'volume': 0.42, 'duckTo': 0.2, 'fadeInSec': 1.5, 'fadeOutSec': 2.5, 'startFromSec': 0},
    }
    p = remap_plan(p)
    p['durationSec'] = round(DUR_NEW, 3)
    json.dump(p, open(f'content/tol2-{name}.scene.json', 'w'), indent=1)
    shutil.copy('content/tolerance.captions.json', f'content/tol2-{name}.captions.json')
    shutil.copy('content/tolerance.words.tsv', f'content/tol2-{name}.words.tsv')


# the four signals, each with her exact words as the heading
SIG = [ex(7.25, 9.1, 'replies'), ex(9.1, 11.0, 'name'), ex(11.0, 12.92, 'reaction'), ex(12.92, 14.49, 'holidays')]
CHAT = [ex(3.82, 7.25, 'chat')]
RULES = [ex(21.65, 24.86, 'rules')]
NEW = [ex(24.86, 28.65, 'newcomer')]
LEFT = [ex(28.65, 32.64, 'leftout')]
spot_left = {'type': 'spotlight', 'at': 28.65, 'until': 32.64, 'props': {'dim': 0.86, 'words': [{'text': 'left out', 'at': at('left')}]}}

# 1. Quiet Authority: calm, white cards on black, corner window, one spotlight
plan('quiet', 'quiet', SONG1, [
    full('hook', 0, 3.82, close=1.35),
    scene('chat', 3.82, 7.25, 'T', [examplesT(3.82, 7.25, 'light', CHAT)]),
    *seq('signals', SIG, SIG_B, 'light', 'TS'),
    full('little', 14.49, 18.39, close=1.35),
    statement(18.39, 21.65),
    scene('rules', 21.65, 24.86, 'O', [examples(21.65, 24.86, 'light', RULES, y=800, h=680)]),
    full('ask', 24.86, 28.65, close=1.35, first_close=True),
    full('left', 28.65, 32.64, close=1.35),
    full('end', 32.64, DUR, close=1.35),
], [spot_left], scrim=0.5)

# 2. Magazine: cover story with her head over the masthead, editorial pages, wall type
plan('magazine', 'magazine', SONG2, [
    full('hook', 0, 3.82),
    scene('chat', 3.82, 7.25, 'S', [examples(3.82, 7.25, 'editorial', CHAT, y=250, h=720)], mood='light'),
    *seq('signals', SIG, SIG_B, 'editorial', 'ST', mood='light'),
    full('little', 14.49, 16.0, first_close=True),
    scene('belongs', 16.0, 18.39, 'A', mood='light'),
    scene('today', 18.39, 21.65, 'E', mood='light', avatar='hidden'),
    full('rules', 21.65, 24.86),
    scene('new', 24.86, 28.65, 'S', [examples(24.86, 28.65, 'editorial', NEW, y=250, h=720)], mood='light'),
    scene('left', 28.65, 32.64, 'S', [examples(28.65, 32.64, 'editorial', LEFT, y=250, h=720)], mood='light'),
    full('end', 32.64, DUR),
], [
    {'type': 'press-front', 'at': 0.1, 'until': 3.8, 'props': {'masthead': 'The Common Room', 'headline': 'Who belongs here?', 'subhead': 'Replies, names, reactions: the unwritten signals', 'date': 'Sunday, November 16, 2026', 'caption': 'International Day for Tolerance', 'scale': 0.62}},
    {'type': 'giant-caption', 'at': 16.0, 'until': 18.39, 'props': {'version': 2, 'text': say(16.0, 18.39)[0], 'accent': 'belongs'}},
    {'type': 'kinetic-hook', 'at': 18.39, 'until': 21.65, 'props': {'version': 2, 'lines': [
        {'text': 'Today is the', 'face': 'sans', 'at': at('Today')}, {'text': 'International Day', 'face': 'italic', 'at': at('International')},
        {'text': 'for Tolerance,', 'face': 'serif', 'at': at('for', 20.0)}, {'text': 'so try this.', 'face': 'sans', 'at': at('so', 20.5)}]}},
    {'type': 'headline-wall', 'at': 21.65, 'until': 24.86, 'props': {'lines': ['Five unwritten rules', 'Which would a newcomer not know?', 'Who belongs here?', 'The unwritten signals']}},
], finish={'grain': 0.25, 'lightLeaks': 0.0}, scrim=0.0)

# 3. Glass Lab: words hanging in the room, glass windows, glass text, a hologram phone
plan('glass', 'glass', SONG1, [
    full('hook', 0, 3.82, close=1.4),
    scene('window', 3.82, 7.25, 'F'),
    *seq('signals', SIG, SIG_B, 'glass', 'TS'),
    full('little', 14.49, 18.39, close=1.4),
    full('today', 18.39, 21.65, close=1.4, first_close=True),
    scene('rules', 21.65, 24.86, 'O', [examples(21.65, 24.86, 'glass', RULES, y=800, h=680)]),
    full('ask', 24.86, 28.65, close=1.4),
    scene('left', 28.65, 32.64, 'E', avatar='hidden'),
    full('end', 32.64, DUR, close=1.4),
], [
    {'type': 'depth-scatter', 'at': 0.1, 'until': 3.8, 'props': {'words': ['replies', 'names', 'reactions', 'holidays', 'mentions']}},
    {'type': 'grade', 'at': 0, 'until': DUR, 'props': {'look': 'cool', 'strength': 0.3}},
    {'type': 'text-pop', 'at': at('who', 17.0) - 0.1, 'until': at('International') - 0.1, 'props': {'text': 'who belongs here', 'look': 'glass', 'y': 1000, 'size': 84}},
    {'type': 'spatial-glass', 'at': at('International') - 0.1, 'until': 21.6, 'props': {'title': 'November 16', 'text': 'International Day for Tolerance', 'y': 880}},
    {'type': 'holo-phone', 'at': 24.9, 'until': 28.6, 'props': {'title': 'Newcomer', 'lines': ['Which would a', 'newcomer not know?'], 'y': 140}},
    {'type': 'glass-type', 'at': 28.65, 'until': 32.64, 'props': {'words': [{'text': 'Those are the places', 'at': at('Those')}, {'text': 'where people feel', 'at': at('where', 29.5)}, {'text': 'left out', 'at': at('left')}, {'text': 'without anyone meaning to', 'at': at('without')}, {'text': 'leave them out.', 'at': at('leave')}], 'y': 0.5}},
], scrim=0.5)

# 4. Scrapbook: torn paper, taped polaroid examples, pen marks, paper cut-outs behind her
plan('scrapbook', 'tape', SONG2, [
    full('hook', 0, 7.25),
    *seq('signals', SIG, SIG_B, 'paper', 'OS', bg=VEL),
    full('little', 14.49, 18.39),
    full('today', 18.39, 21.65, first_close=True),
    full('rules', 21.65, 24.86),
    scene('new', 24.86, 28.65, 'T', [examplesT(24.86, 28.65, 'paper', NEW)], bg=VEL),
    full('left', 28.65, 32.64),
    full('end', 32.64, DUR),
], [
    {'type': 'paper-tear', 'at': 0.0, 'until': 1.3, 'props': {'text': 'Who belongs here?'}},
    {'type': 'doodle-boil', 'at': 1.4, 'until': 3.8, 'props': {'marks': [{'kind': 'circle', 'target': 'head', 'at': at('belong'), 'color': 'red'}]}},
    {'type': 'pen-circle', 'at': 16.6, 'until': 18.35, 'props': {'note': 'who belongs?', 'target': 'head'}},
    {'type': 'sketch-words', 'at': 19.7, 'until': 21.65, 'props': {'small': 'Today is the', 'big': 'Tolerance'}},
    {'type': 'paper-cut', 'at': 21.65, 'until': 24.86, 'props': {'tone': 'kraft', 'label': '5 unwritten rules'}},
    {'type': 'framed-clip', 'at': 28.65, 'until': 32.64, 'props': {'side': 'center', 'width': 400, 'height': 470, 'tilt': -3, 'y': 760, 'notes': [{'text': 'left out', 'x': 430, 'y': 610, 'align': 'center', 'size': 88, 'to': [470, 790], 'from': 'bottom', 'at': at('left')}]}},
    {'type': 'grade', 'at': 0, 'until': DUR, 'props': {'look': 'warm', 'strength': 0.3}},
], finish={'grain': 0.45, 'lightLeaks': 0.2}, scrim=0.55)

# 5. The Analyst: data panels, a corner window, one real number, signals knocked out on "left out"
plan('analyst', 'ticker', SONG1, [
    full('hook', 0, 3.82, close=1.45),
    scene('chat', 3.82, 7.25, 'T', [examplesT(3.82, 7.25, 'data', CHAT)]),
    *seq('signals', SIG, SIG_B, 'data', 'TS'),
    full('little', 14.49, 18.39, close=1.45),
    scene('today', 18.39, 21.65, 'F'),
    scene('five', 21.65, 24.86, 'E', avatar='hidden'),
    scene('new', 24.86, 28.65, 'T', [examplesT(24.86, 28.65, 'data', NEW)]),
    full('left', 28.65, 32.64, close=1.45),
    full('end', 32.64, DUR, close=1.45),
], [
    {'type': 'date-stamp', 'at': 0.3, 'until': 3.7, 'props': {'text': 'NOVEMBER 16', 'position': 'top'}},
    {'type': 'big-stat', 'at': at('five') - 0.2, 'until': 24.8, 'props': {'value': 5, 'label': 'UNWRITTEN RULES', 'sub': 'in your community or team', 'size': 560, 'y': 470, 'align': 'center'}},
    {'type': 'knockout-tiles', 'at': 28.65, 'until': 32.64, 'props': {'names': [{'text': 'Replies', 'knockAt': at('left')}, {'text': 'Names', 'knockAt': at('without')}, {'text': 'Reactions', 'knockAt': at('meaning')}, {'text': 'Holidays', 'knockAt': at('leave')}]}},
], field='charcoal', scrim=0.55)

# 6. Cinematic: dolly zoom, rack focus, iris, silhouette, vertigo, spotlight; golden grade and dust; no bars
plan('cinematic', 'film', SONG1, [
    full('hook', 0, 7.25, close=1.4),
    *seq('signals', SIG, SIG_B, 'dark', 'TS', bg=VEL),
    full('little', 14.49, 18.39, close=1.4),
    statement(18.39, 21.65, bg=VEL),
    full('rules', 21.65, 24.86, close=1.4, cap='top'),
    full('ask', 24.86, 28.65, close=1.4),
    full('left', 28.65, DUR, close=1.4),
], [
    {'type': 'dust', 'at': 0, 'until': DUR, 'props': {'count': 18, 'strength': 0.3}},
    {'type': 'glow', 'at': 0, 'until': DUR, 'props': {'strength': 0.2}},
    {'type': 'zoom-through', 'at': 14.49, 'props': {'diveSec': 0.45}},
    {'type': 'freeze-hold', 'at': at('left') + 0.05, 'until': at('left') + 0.85, 'props': {}},
    {'type': 'dolly-zoom', 'at': 0.2, 'until': 3.8, 'props': {'to': 1.5}},
    {'type': 'rack-focus', 'at': 3.82, 'until': 5.2, 'props': {}},
    {'type': 'iris', 'at': at('who', 17.0) - 0.2, 'until': 18.38, 'props': {'mode': 'peek', 'target': 'head'}},
    {'type': 'silhouette-shift', 'at': 21.65, 'until': 24.86, 'props': {'word': 'unwritten', 'revealAt': 24.4}},
    {'type': 'vertigo', 'at': 25.0, 'until': 27.6, 'props': {'to': 1.4}},
    spot_left,
], finish={'grain': 0.55, 'lightLeaks': 0.8}, scrim=0.45)

# 7. Creator Hype: clones, orbit, couch wall, type wall, frame break, impact; hard punch-ins
plan('hype', 'punch', SONG2, [
    full('hook', 0, 7.25, close=1.7),
    full('orbit', 7.25, 10.89, close=1.7),
    *seq('signals', SIG[2:], [10.89, 12.92, 14.49], 'light', 'OS'),
    full('little', 14.49, 18.39, close=1.7, first_close=True),
    full('today', 18.39, 21.65, close=1.7),
    full('rules', 21.65, 24.86, close=1.7),
    full('ask', 24.86, 28.65, close=1.7, first_close=True),
    full('left', 28.65, DUR, close=1.7),
], [
    {'type': 'clone', 'at': 0.5, 'until': 3.8, 'props': {'version': 2, 'copies': [{'at': at('people'), 'side': 'left'}, {'at': at('decide'), 'side': 'right'}, {'at': at('belong'), 'side': 'left'}]}},
    {'type': 'text-pop', 'at': 0.15, 'until': 2.3, 'props': {'text': 'Who belongs here?', 'look': 'badge', 'y': 520, 'size': 76}},
    {'type': 'flash-frame', 'at': 3.82, 'props': {'version': 2}},
    {'type': 'orbit', 'at': 7.25, 'until': 10.89, 'props': {'items': ['replies', 'names', 'reactions', 'holidays', 'mentions']}},
    {'type': 'couch-wall', 'at': 16.0, 'until': 18.39, 'props': {'tiles': ['Who gets replies', 'Whose name', 'Which posts', 'Which holidays', 'Who belongs here']}},
    {'type': 'impact-frame', 'at': at('Tolerance'), 'until': 21.0, 'props': {'word': 'Tolerance'}},
    {'type': 'type-wall', 'at': 21.65, 'until': 24.86, 'props': {'words': [{'text': 'five', 'at': at('five')}, {'text': 'unwritten', 'at': at('unwritten')}, {'text': 'rules', 'at': at('rules')}]}},
    {'type': 'frame-break', 'at': 24.86, 'until': 28.65, 'props': {'popAt': at('newcomer'), 'label': 'NEWCOMER'}},
    {'type': 'type-wall', 'at': 28.65, 'until': 32.64, 'props': {'words': [{'text': 'places', 'at': at('places')}, {'text': 'left out', 'at': at('left')}]}},
], finish={'grain': 0.3, 'lightLeaks': 0.4}, sound='full', scrim=0.65)

# 8. Teach Board: steps beside her, then clear example boards with her in a window
plan('teach', 'karaoke', SONG1, [
    full('hook', 0, 3.82, close=1.4),
    scene('window', 3.82, 7.25, 'F'),
    full('signals', 7.25, 14.49, close=1.0),
    full('little', 14.49, 18.39, close=1.4),
    scene('today', 18.39, 21.65, 'S', [{'type': 'headline-card', 'at': 18.39, 'until': 21.65, 'props': {'label': 'NOVEMBER 16', 'line': 'International Day for Tolerance', 'emphasis': ['Tolerance']}}], mood='light', cap='top', focus={'y': 8, 'zoom': 1.1}),
    scene('rules', 21.65, 24.86, 'O', [examples(21.65, 24.86, 'light', RULES, y=800, h=680)]),
    scene('new', 24.86, 28.65, 'T', [examplesT(24.86, 28.65, 'light', NEW)]),
    scene('left', 28.65, 32.64, 'O', [examples(28.65, 32.64, 'light', LEFT, y=800, h=680)]),
    full('end', 32.64, DUR, close=1.4),
], [
    {'type': 'shoulder-steps', 'at': 7.25, 'until': 14.49, 'props': {'title': 'They watch', 'steps': [{'text': say(7.8, 9.1)[0], 'at': at('who')}, {'text': say(9.1, 11.0)[0], 'at': at('whose')}, {'text': say(11.0, 12.92)[0], 'at': at('which')}, {'text': say(12.92, 14.49)[0], 'at': at('holidays') - 0.4}], 'side': 'left', 'zoom': 1.5}},
], scrim=0.55)
print('8 v2 plans written')
