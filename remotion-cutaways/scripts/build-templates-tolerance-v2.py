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

DUR = 37.33
END = 34.95
CUTS = [3.82, 5.62, 7.25, 9.03, 10.89, 12.68, 14.49, 16.0, 18.39, 21.65, 24.86, 28.65, 32.64]
VEL = 'backdrops/red-velvet.jpg'
W = [(w, float(a), float(b)) for w, a, b in (l.rstrip('\n').split('\t') for l in open('content/tolerance.words.tsv') if l.strip())]
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


def full(sid, s, e, close=1.5, mood='dark', cap='bottom', bg=None, first_close=False):
    """Her full frame, split at every jump cut: wide and close on the face alternate, as hard cuts."""
    pts = [s] + [c for c in CUTS if s < c < e] + [e]
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
    g = {'type': 'statement-card', 'at': s, 'until': e, 'box': {'y': 360, 'h': 1200, 'center': True}, 'props': {'text': text, 'emphasis': list(em), 'wordTimes': times}}
    return scene('st%d' % int(s), s, e, 'E', [g], mood=mood, avatar='hidden', bg=bg)


def plan(name, caption, song, scenes, fx, **kw):
    p = {
        'slug': f'tol2-{name}', 'template': name, 'video': 'raw/tolerance.mp4', 'durationSec': DUR, 'matte': 'tolerance',
        'theme': {'field': kw.get('field', 'black'), 'sans': 'DM Sans'}, 'captionStyle': caption,
        'emphasis': ['belongs', 'unwritten', 'Tolerance', 'newcomer', 'left'],
        'hero': [], 'boxed': [], 'finish': kw.get('finish', {'grain': 0.0, 'lightLeaks': 0.0}), 'scrim': kw.get('scrim', 0.55),
        'scenes': scenes, 'fx': fx, 'fxSound': kw.get('sound', 'minimal'),
        'endCard': {'variant': 'link-pill', 'startAt': END, 'label': 'LINK BELOW OR IN MY BIO', 'url': 'bio.c3global.co'},
        'music': {'src': song, 'volume': 0.5, 'duckTo': 0.26, 'fadeInSec': 1.5, 'fadeOutSec': 2.5, 'startFromSec': 0},
    }
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
    scene('chat', 3.82, 7.25, 'D', [examples(3.82, 7.25, 'light', CHAT)]),
    scene('signals', 7.25, 14.49, 'D', [examples(7.25, 14.49, 'light', SIG)]),
    full('little', 14.49, 18.39, close=1.35),
    statement(18.39, 21.65),
    scene('rules', 21.65, 24.86, 'O', [examples(21.65, 24.86, 'light', RULES, y=720, h=740)]),
    full('ask', 24.86, 28.65, close=1.35, first_close=True),
    full('left', 28.65, 32.64, close=1.35),
    full('end', 32.64, DUR, close=1.35),
], [spot_left], scrim=0.5)

# 2. Magazine: cover story with her head over the masthead, editorial pages, wall type
plan('magazine', 'magazine', SONG2, [
    full('hook', 0, 3.82),
    scene('chat', 3.82, 7.25, 'S', [examples(3.82, 7.25, 'editorial', CHAT, y=250, h=720)], mood='light'),
    scene('signals', 7.25, 14.49, 'S', [examples(7.25, 14.49, 'editorial', SIG, y=250, h=720)], mood='light'),
    full('little', 14.49, 16.0, first_close=True),
    scene('belongs', 16.0, 18.39, 'A', mood='light'),
    scene('today', 18.39, 21.65, 'E', mood='light', avatar='hidden'),
    full('rules', 21.65, 24.86),
    scene('new', 24.86, 28.65, 'S', [examples(24.86, 28.65, 'editorial', NEW, y=250, h=720)], mood='light'),
    scene('left', 28.65, 32.64, 'S', [examples(28.65, 32.64, 'editorial', LEFT, y=250, h=720)], mood='light'),
    full('end', 32.64, DUR),
], [
    {'type': 'cover-story', 'at': 0.1, 'until': 3.8, 'props': {'masthead': 'BELONGING', 'headline': 'Who belongs here?', 'kicker': 'NOVEMBER 16', 'lines': []}},
    {'type': 'giant-caption', 'at': 16.0, 'until': 18.39, 'props': {'version': 2, 'text': say(16.0, 18.39)[0], 'accent': 'belongs'}},
    {'type': 'kinetic-hook', 'at': 18.39, 'until': 21.65, 'props': {'version': 2, 'lines': [
        {'text': 'Today is the', 'face': 'sans', 'at': at('Today')}, {'text': 'International Day', 'face': 'italic', 'at': at('International')},
        {'text': 'for Tolerance,', 'face': 'serif', 'at': at('for', 20.0)}, {'text': 'so try this.', 'face': 'sans', 'at': at('so', 20.5)}]}},
    {'type': 'wall-text', 'at': 21.65, 'until': 24.86, 'props': {'lines': [{'text': 'five unwritten', 'at': at('five')}, {'text': 'rules', 'at': at('rules')}], 'side': 'left'}},
], finish={'grain': 0.25, 'lightLeaks': 0.0}, scrim=0.0)

# 3. Glass Lab: words hanging in the room, glass windows, glass text, a hologram phone
plan('glass', 'glass', SONG1, [
    full('hook', 0, 3.82, close=1.4),
    scene('window', 3.82, 7.25, 'F'),
    scene('signals', 7.25, 14.49, 'D', [examples(7.25, 14.49, 'glass', SIG)]),
    full('little', 14.49, 18.39, close=1.4),
    full('today', 18.39, 21.65, close=1.4, first_close=True),
    scene('rules', 21.65, 24.86, 'O', [examples(21.65, 24.86, 'glass', RULES, y=720, h=740)]),
    full('ask', 24.86, 28.65, close=1.4),
    scene('left', 28.65, 32.64, 'E', avatar='hidden'),
    scene('end', 32.64, DUR, 'F'),
], [
    {'type': 'depth-scatter', 'at': 0.1, 'until': 3.8, 'props': {'words': ['replies', 'names', 'reactions', 'holidays', 'mentions']}},
    {'type': 'grade', 'at': 0, 'until': DUR, 'props': {'look': 'cool', 'strength': 0.3}},
    {'type': 'text-pop', 'at': at('who', 17.0) - 0.1, 'until': 18.39, 'props': {'text': 'who belongs here', 'look': 'glass', 'y': 1300, 'size': 104}},
    {'type': 'spatial-glass', 'at': 18.45, 'until': 21.6, 'props': {'title': 'November 16', 'text': 'International Day for Tolerance', 'y': 1230}},
    {'type': 'holo-phone', 'at': 24.9, 'until': 28.6, 'props': {'title': 'Newcomer', 'lines': ['Which would a', 'newcomer not know?']}},
    {'type': 'glass-type', 'at': 28.65, 'until': 32.64, 'props': {'words': [{'text': 'Those are the places', 'at': at('Those')}, {'text': 'where people feel', 'at': at('where', 29.5)}, {'text': 'left out', 'at': at('left')}, {'text': 'without anyone meaning to', 'at': at('without')}, {'text': 'leave them out.', 'at': at('leave')}], 'y': 0.5}},
], scrim=0.5)

# 4. Scrapbook: torn paper, taped polaroid examples, pen marks, paper cut-outs behind her
plan('scrapbook', 'tape', SONG2, [
    full('hook', 0, 7.25),
    scene('signals', 7.25, 14.49, 'O', [examples(7.25, 14.49, 'paper', SIG)], bg=VEL),
    full('little', 14.49, 18.39),
    full('today', 18.39, 21.65, first_close=True),
    full('rules', 21.65, 24.86),
    scene('new', 24.86, 28.65, 'D', [examples(24.86, 28.65, 'paper', NEW)], bg=VEL),
    full('left', 28.65, 32.64),
    full('end', 32.64, DUR),
], [
    {'type': 'paper-tear', 'at': 0.0, 'until': 1.3, 'props': {'text': 'Who belongs here?'}},
    {'type': 'doodle-boil', 'at': 1.4, 'until': 3.8, 'props': {'marks': [{'kind': 'circle', 'target': 'head', 'at': at('belong'), 'color': 'red'}]}},
    {'type': 'pen-circle', 'at': 16.6, 'until': 18.35, 'props': {'note': 'who belongs?', 'target': 'head'}},
    {'type': 'sketch-words', 'at': 19.7, 'until': 21.65, 'props': {'small': 'Today is the', 'big': 'Tolerance'}},
    {'type': 'paper-cut', 'at': 21.65, 'until': 24.86, 'props': {'tone': 'kraft', 'label': '5 unwritten rules'}},
    {'type': 'framed-clip', 'at': 28.65, 'until': 32.64, 'props': {'side': 'center', 'width': 600, 'height': 760, 'tilt': -3, 'y': 860, 'notes': [{'text': 'left out', 'x': 170, 'y': 1340, 'to': [380, 1120], 'at': at('left')}]}},
    {'type': 'grade', 'at': 0, 'until': DUR, 'props': {'look': 'warm', 'strength': 0.3}},
], finish={'grain': 0.45, 'lightLeaks': 0.2}, scrim=0.55)

# 5. The Analyst: data panels, a corner window, one real number, signals knocked out on "left out"
plan('analyst', 'ticker', SONG1, [
    full('hook', 0, 3.82, close=1.45),
    scene('chat', 3.82, 7.25, 'D', [examples(3.82, 7.25, 'data', CHAT)]),
    scene('signals', 7.25, 14.49, 'D', [examples(7.25, 14.49, 'data', SIG)]),
    full('little', 14.49, 18.39, close=1.45),
    scene('today', 18.39, 21.65, 'F'),
    scene('five', 21.65, 24.86, 'E', avatar='hidden', cap='top'),
    scene('new', 24.86, 28.65, 'D', [examples(24.86, 28.65, 'data', NEW)]),
    full('left', 28.65, 32.64, close=1.45),
    full('end', 32.64, DUR, close=1.45),
], [
    {'type': 'date-stamp', 'at': 0.3, 'until': 3.7, 'props': {'text': 'NOVEMBER 16', 'position': 'top'}},
    {'type': 'big-stat', 'at': at('five') - 0.2, 'until': 24.8, 'props': {'value': 5, 'label': 'UNWRITTEN RULES', 'sub': 'in your community or team', 'size': 440, 'y': 1000}},
    {'type': 'knockout-tiles', 'at': 28.65, 'until': 32.64, 'props': {'names': [{'text': 'Replies', 'knockAt': at('left')}, {'text': 'Names', 'knockAt': at('without')}, {'text': 'Reactions', 'knockAt': at('meaning')}, {'text': 'Holidays', 'knockAt': at('leave')}]}},
], field='charcoal', scrim=0.55)

# 6. Cinematic: dolly zoom, rack focus, iris, silhouette, vertigo, spotlight; golden grade and dust; no bars
plan('cinematic', 'film', SONG1, [
    full('hook', 0, 7.25, close=1.4),
    scene('signals', 7.25, 14.49, 'D', [examples(7.25, 14.49, 'dark', SIG)], bg=VEL),
    full('little', 14.49, 18.39, close=1.4),
    statement(18.39, 21.65, bg=VEL),
    full('rules', 21.65, 24.86, close=1.4),
    full('ask', 24.86, 28.65, close=1.4),
    full('left', 28.65, DUR, close=1.4),
], [
    {'type': 'grade', 'at': 0, 'until': DUR, 'props': {'look': 'golden-hour', 'strength': 0.45}},
    {'type': 'dust', 'at': 0, 'until': DUR, 'props': {'count': 40, 'strength': 0.5}},
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
    scene('signals', 10.89, 14.49, 'O', [examples(10.89, 14.49, 'light', SIG[2:])]),
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
    scene('rules', 21.65, 24.86, 'O', [examples(21.65, 24.86, 'light', RULES, y=720, h=740)]),
    scene('new', 24.86, 28.65, 'D', [examples(24.86, 28.65, 'light', NEW)]),
    scene('left', 28.65, 32.64, 'O', [examples(28.65, 32.64, 'light', LEFT, y=720, h=740)]),
    full('end', 32.64, DUR, close=1.4),
], [
    {'type': 'shoulder-steps', 'at': 7.25, 'until': 14.49, 'props': {'title': 'They watch', 'steps': [{'text': say(7.8, 9.1)[0], 'at': at('who')}, {'text': say(9.1, 11.0)[0], 'at': at('whose')}, {'text': say(11.0, 12.92)[0], 'at': at('which')}, {'text': say(12.92, 14.49)[0], 'at': at('holidays') - 0.4}], 'side': 'left', 'zoom': 1.5}},
], scrim=0.55)
print('8 v2 plans written')
