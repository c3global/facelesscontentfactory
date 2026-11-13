#!/usr/bin/env python3
"""
Tolerance (Nov 16) in all 8 talking-head templates, so Dr. CK can compare them on the same words.
Writes content/tol-<template>.scene.json and copies the captions. Card text is her script or her Notion on-screen text only.
Times are real word times from content/tolerance.words.tsv (clean cut, 37.33 s).
"""
import json, shutil

DUR = 37.33
END = 34.95  # end card: after "Follow for more thoughts on belonging online."
CUTS = [3.82, 5.62, 7.25, 9.03, 10.89, 12.68, 14.49, 16.0, 18.39, 21.65, 24.86, 28.65, 32.64]
VEL = 'backdrops/red-velvet.jpg'
W = [(w, float(a), float(b)) for w, a, b in (l.rstrip('\n').split('\t') for l in open('content/tolerance.words.tsv') if l.strip())]


def wt(s, e):
    return [round(a, 2) for w, a, b in W if s - 0.02 <= a < e]


def at(word, after=0.0):
    for w, a, b in W:
        if a >= after and w.lower().strip('.,?') == word.lower().strip('.,?'):
            return round(a, 2)
    raise KeyError(word)


def full(sid, s, e, zooms=(1.0, 1.09), y=40, mood='dark', cap='bottom', bg=None):
    """Her full frame from s to e, split at every jump cut with an alternating punch-in (hard cut)."""
    pts = [s] + [c for c in CUTS if s < c < e] + [e]
    segs = []
    for k in range(len(pts) - 1):
        seg = {'start': pts[k], 'end': pts[k + 1], 'layout': 'A', 'captionPos': cap, 'graphics': [], 'focus': {'y': y, 'zoom': zooms[k % len(zooms)]}}
        if k:
            seg['cut'] = True
        segs.append(seg)
    sc = {'id': sid, 'mood': mood, 'segments': segs}
    if bg:
        sc['bg'] = bg
    return sc


def scene(sid, s, e, layout, graphics=(), mood='dark', avatar=None, cap='bottom', captions='on', bg=None, focus=None):
    seg = {'start': s, 'end': e, 'layout': layout, 'captionPos': cap, 'graphics': list(graphics)}
    if avatar:
        seg['avatar'] = avatar
    if captions == 'off':
        seg['captions'] = 'off'
    if focus:
        seg['focus'] = focus
    sc = {'id': sid, 'mood': mood, 'segments': [seg]}
    if bg:
        sc['bg'] = bg
    return sc


def statement(s, e, text, em, mood='dark', bg=None):
    g = {'type': 'statement-card', 'at': s, 'until': e, 'box': {'y': 360, 'h': 1200, 'center': True}, 'props': {'text': text, 'emphasis': em, 'wordTimes': wt(s, e)}}
    assert len(g['props']['wordTimes']) == len(text.split()), (text, len(g['props']['wordTimes']))
    return scene('st%d' % int(s), s, e, 'E', [g], mood=mood, avatar='hidden', captions='off', bg=bg)


def plan(name, caption, scenes, fx, **kw):
    p = {
        'slug': f'tol-{name}', 'template': name, 'video': 'raw/tolerance.mp4', 'durationSec': DUR, 'matte': 'tolerance',
        'theme': {'field': kw.get('field', 'black'), 'sans': 'DM Sans'}, 'captionStyle': caption,
        'emphasis': kw.get('emphasis', ['belongs', 'unwritten', 'Tolerance', 'newcomer', 'left']),
        'hero': [], 'boxed': [], 'finish': kw.get('finish', {'grain': 0.0, 'lightLeaks': 0.0}), 'scrim': kw.get('scrim', 0.6),
        'scenes': scenes, 'fx': fx, 'fxSound': kw.get('sound', 'minimal'),
        'endCard': {'variant': 'link-pill', 'startAt': END, 'label': 'LINK BELOW OR IN MY BIO', 'url': 'bio.c3global.co'},
        'music': {'src': 'music/leveled/lofi-ferraz-squady.mp3', 'volume': 0.5, 'duckTo': 0.26, 'fadeInSec': 1.5, 'fadeOutSec': 2.5, 'startFromSec': 0},
    }
    json.dump(p, open(f'content/tol-{name}.scene.json', 'w'), indent=1)
    shutil.copy('content/tolerance.captions.json', f'content/tol-{name}.captions.json')
    shutil.copy('content/tolerance.words.tsv', f'content/tol-{name}.words.tsv')


ZOOM = lambda s, e, z=1.06: {'type': 'digital-zoom', 'at': s, 'until': e, 'props': {'creepTo': z, 'snapTo': z}}
t_signals = [at('replies'), at('name'), at('reaction'), at('holidays')]

# 1. Quiet Authority: calm, few moves, wide margins, statement cards on plain black, no film texture
plan('quiet', 'quiet', [
    full('hook', 0, 7.25, zooms=(1.0, 1.06)),
    full('watch', 7.25, 14.49, zooms=(1.0, 1.06)),
    full('little', 14.49, 18.39, zooms=(1.0, 1.06)),
    statement(18.39, 21.65, 'Today is the International Day for Tolerance, so try this.', ['Tolerance']),
    full('try', 21.65, 28.65, zooms=(1.0, 1.06)),
    statement(28.65, 32.64, 'Those are the places where people feel left out without anyone meaning to leave them out.', ['left', 'out']),
    full('end', 32.64, DUR),
], [ZOOM(0, 3.8, 1.05), ZOOM(14.5, 18.3, 1.05)], scrim=0.55)

# 2. Magazine: white pages, cover and front page, poster type, serif pull-quote captions
plan('magazine', 'magazine', [
    full('hook', 0, 7.25, mood='light'),
    scene('signals', 7.25, 14.49, 'A', mood='light'),
    full('little', 14.49, 16.0, mood='light'),
    scene('belongs', 16.0, 18.39, 'A', mood='light', captions='off'),
    scene('today', 18.39, 21.65, 'E', mood='light', avatar='hidden', captions='off'),
    scene('try', 21.65, 28.65, 'S', [
        {'type': 'headline-card', 'at': 21.65, 'until': 24.86, 'props': {'label': 'TRY THIS', 'line': 'Write down 5 unwritten rules.', 'emphasis': ['unwritten']}},
        {'type': 'headline-card', 'at': 24.86, 'until': 28.65, 'props': {'label': 'THEN ASK', 'line': 'Which would a newcomer not know?', 'emphasis': ['newcomer']}},
    ], mood='light', cap='top', focus={'y': 8, 'zoom': 1.1}),
    full('left', 28.65, DUR, mood='light'),
], [
    {'type': 'cover-frame', 'at': 0.1, 'until': 3.8, 'props': {'masthead': 'BELONGING', 'headline': 'Who belongs here?', 'issue': 'No. 16|Nov 2026', 'tilt': 'in', 'scale': 0.78}},
    {'type': 'press-front', 'at': 7.25, 'until': 12.6, 'props': {'masthead': 'The Community Times', 'headline': 'Replies, names, reactions: the unwritten signals', 'date': 'November 16', 'scale': 0.62}},
    {'type': 'giant-caption', 'at': 16.0, 'until': 18.39, 'props': {'version': 2, 'text': 'but a lot of it tells people who belongs here', 'accent': 'belongs'}},
    {'type': 'kinetic-hook', 'at': 18.39, 'until': 21.65, 'props': {'version': 2, 'lines': [
        {'text': 'Today is the', 'face': 'sans', 'at': at('Today')}, {'text': 'International Day', 'face': 'italic', 'at': at('International')},
        {'text': 'for Tolerance,', 'face': 'serif', 'at': at('for', 20.0)}, {'text': 'so try this.', 'face': 'sans', 'at': at('so', 20.5)}]}},
], finish={'grain': 0.25, 'lightLeaks': 0.0}, scrim=0.0)

# 3. Glass Lab: dark, frosted glass floating around her, glass captions, cool glow
plan('glass', 'glass', [
    full('hook', 0, 7.25),
    full('signals', 7.25, 14.49, zooms=(1.0, 1.04)),
    full('little', 14.49, 21.65),
    full('try', 21.65, 28.65),
    scene('left', 28.65, 32.64, 'E', mood='dark', avatar='hidden', captions='off'),
    full('end', 32.64, DUR),
], [
    {'type': 'layer-explode', 'at': 0.2, 'until': 3.7, 'props': {'title': '', 'labels': ['Replies', 'Names', 'Reactions', 'Holidays']}},
    {'type': 'glass-cards', 'at': 7.3, 'until': 14.45, 'props': {'cards': [
        {'label': 'Who gets', 'value': 'Replies', 'at': t_signals[0], 'side': 'left'}, {'label': 'Whose', 'value': 'Name', 'at': t_signals[1], 'side': 'right'},
        {'label': 'Which posts get', 'value': 'Reactions', 'at': t_signals[2], 'side': 'left'}, {'label': 'Which', 'value': 'Holidays', 'at': t_signals[3], 'side': 'right'}]}},
    {'type': 'grade', 'at': 0, 'until': DUR, 'props': {'look': 'cool', 'strength': 0.35}},
    {'type': 'spatial-glass', 'at': 21.7, 'until': 24.85, 'props': {'title': 'Try this', 'text': 'Write down 5 unwritten rules', 'y': 1560}},
    {'type': 'holo-phone', 'at': 24.9, 'until': 28.6, 'props': {'title': 'Newcomer', 'lines': ['Which rules', 'would I not know?']}},
    {'type': 'glass-type', 'at': 28.65, 'until': 32.64, 'props': {'words': [{'text': 'Those are the places', 'at': at('Those')}, {'text': 'where people feel', 'at': at('where', 29.5)}, {'text': 'left out', 'at': at('left')}, {'text': 'without anyone meaning to', 'at': at('without')}, {'text': 'leave them out.', 'at': at('leave')}], 'y': 0.5}},
], scrim=0.5)

# 4. Scrapbook: paper, tape, handwriting; framed clip with notes, doodles that follow her
plan('scrapbook', 'tape', [
    full('hook', 0, 7.25),
    scene('signals', 7.25, 14.49, 'A', mood='dark', bg=VEL),
    full('little', 14.49, 21.65),
    scene('try', 21.65, 28.65, 'S', [{'type': 'notes-card', 'at': 21.65, 'until': 28.65, 'props': {'label': 'Notes', 'title': 'Try this', 'items': [{'text': 'Write down 5 unwritten rules', 'at': at('Write'), 'checkAfter': 0.5}, {'text': 'Which would a newcomer not know?', 'at': at('newcomer'), 'checkAfter': 0.5}]}}], mood='light', cap='top', focus={'y': 8, 'zoom': 1.1}),
    full('end', 28.65, DUR),
], [
    {'type': 'paper-tear', 'at': 0.0, 'until': 1.3, 'props': {'text': 'Who belongs here?'}},
    {'type': 'doodle-boil', 'at': 1.4, 'until': 7.2, 'props': {'marks': [{'kind': 'circle', 'target': 'head', 'at': at('belong'), 'color': 'red'}, {'kind': 'text', 'target': 'right', 'at': at('belong') + 0.3, 'text': 'do I belong?', 'color': 'white'}]}},
    {'type': 'framed-clip', 'at': 7.25, 'until': 14.49, 'props': {'side': 'center', 'width': 560, 'height': 720, 'tilt': -3, 'y': 900, 'notes': [
        {'text': 'replies', 'x': 150, 'y': 420, 'to': [300, 600], 'at': t_signals[0]}, {'text': 'names', 'x': 860, 'y': 470, 'to': [760, 650], 'at': t_signals[1]},
        {'text': 'reactions', 'x': 150, 'y': 1420, 'to': [320, 1200], 'at': t_signals[2]}, {'text': 'holidays', 'x': 840, 'y': 1450, 'to': [740, 1220], 'at': t_signals[3]}]}},
    {'type': 'pen-circle', 'at': 16.6, 'until': 18.35, 'props': {'note': 'who belongs?', 'target': 'head'}},
    {'type': 'doodle-boil', 'at': 30.3, 'until': 32.6, 'props': {'marks': [{'kind': 'underline', 'target': 'chest', 'at': at('left'), 'color': 'red'}, {'kind': 'text', 'target': 'left', 'at': at('left'), 'text': 'left out', 'color': 'white'}]}},
    {'type': 'grade', 'at': 0, 'until': DUR, 'props': {'look': 'warm', 'strength': 0.35}},
], finish={'grain': 0.5, 'lightLeaks': 0.2}, scrim=0.55)

# 5. The Analyst: data panels and a ticker; only real numbers from her script (5 rules)
plan('analyst', 'ticker', [
    full('hook', 0, 7.25, zooms=(1.0, 1.07)),
    full('signals', 7.25, 14.49, cap='bottom'),
    full('little', 14.49, 18.39),
    full('today', 18.39, 21.65),
    full('five', 21.65, 24.86, cap='top'),
    scene('ask', 24.86, 28.65, 'E', avatar='hidden'),
    full('end', 28.65, DUR),
], [
    {'type': 'date-stamp', 'at': 0.3, 'until': 3.7, 'props': {'text': 'NOVEMBER 16', 'position': 'top'}},
    {'type': 'focus-list', 'at': 7.3, 'until': 14.45, 'props': {'title': 'The unwritten signals', 'items': [{'text': 'Who gets replies', 'at': t_signals[0]}, {'text': 'Whose name is spelled right', 'at': t_signals[1]}, {'text': 'Which posts get a reaction', 'at': t_signals[2]}, {'text': 'Which holidays get mentioned', 'at': t_signals[3]}], 'y': 760}},
    {'type': 'big-stat', 'at': at('five') - 0.2, 'until': 24.8, 'props': {'value': 5, 'label': 'UNWRITTEN RULES', 'sub': 'in your community or team', 'size': 420, 'y': 1150}},
    {'type': 'checklist', 'at': 24.9, 'until': 28.6, 'props': {'version': 2, 'title': 'Then ask', 'items': [{'text': 'Which ones would a newcomer', 'at': at('newcomer') - 0.3}, {'text': 'have no way of knowing?', 'at': at('knowing')}], 'y': 620}},
], field='charcoal', scrim=0.55)

# 6. Cinematic: letterbox, grade, dust, slow pushes, an iris; film subtitles; few words on screen
plan('cinematic', 'film', [
    full('hook', 0, 14.49, zooms=(1.0, 1.05)),
    full('little', 14.49, 18.39),
    statement(18.39, 21.65, 'Today is the International Day for Tolerance, so try this.', ['Tolerance'], bg=VEL),
    full('try', 21.65, 28.65),
    full('left', 28.65, DUR),
], [
    {'type': 'letterbox', 'at': 0, 'until': DUR, 'props': {'heightPx': 200}},
    {'type': 'grade', 'at': 0, 'until': DUR, 'props': {'look': 'golden-hour', 'strength': 0.45}},
    {'type': 'dust', 'at': 0, 'until': DUR, 'props': {'count': 40, 'strength': 0.5}},
    {'type': 'rack-focus', 'at': 0.0, 'until': 1.6, 'props': {}},
    ZOOM(1.6, 7.2, 1.1),
    {'type': 'iris', 'at': at('who', 17.0) - 0.2, 'until': 18.38, 'props': {'mode': 'peek', 'target': 'head', 'word': 'who belongs here'}},
    {'type': 'blackout', 'at': 28.65, 'until': 29.2, 'props': {'holdSec': 0.25}},
    ZOOM(29.2, 32.6, 1.12),
], finish={'grain': 0.55, 'lightLeaks': 0.8}, scrim=0.45)

# 7. Creator Hype: hard punch-ins on every cut, word punches, pops and hits
plan('hype', 'punch', [
    full('hook', 0, 7.25, zooms=(1.0, 1.16)),
    full('signals', 7.25, 14.49, zooms=(1.16, 1.0), cap='top'),
    full('little', 14.49, 21.65, zooms=(1.0, 1.16)),
    full('try', 21.65, 28.65, zooms=(1.16, 1.0)),
    full('end', 28.65, DUR, zooms=(1.0, 1.16)),
], [
    {'type': 'text-pop', 'at': 0.15, 'until': 2.3, 'props': {'text': 'Who belongs here?', 'look': 'badge', 'y': 520, 'size': 76}},
    {'type': 'slot-machine', 'at': 7.3, 'until': 14.45, 'props': {'words': ['replies', 'names', 'reactions'], 'stopAt': t_signals[:3], 'y': 1500}},
    {'type': 'flash-frame', 'at': 14.49, 'props': {'version': 2}},
    {'type': 'impact-frame', 'at': at('Tolerance'), 'until': 21.0, 'props': {'word': 'Tolerance'}},
    {'type': 'flash-frame', 'at': 21.65, 'props': {'version': 2}},
    {'type': 'text-pop', 'at': at('left') - 0.1, 'until': 32.6, 'props': {'text': 'left out', 'look': 'glitch', 'y': 560, 'size': 140}},
], finish={'grain': 0.3, 'lightLeaks': 0.4}, sound='full', scrim=0.65)

# 8. Teach Board: clear structure; steps beside her, chips for the two actions, karaoke captions
plan('teach', 'karaoke', [
    full('hook', 0, 7.25),
    full('signals', 7.25, 14.49, cap='bottom'),
    full('little', 14.49, 18.39),
    scene('today', 18.39, 21.65, 'S', [{'type': 'headline-card', 'at': 18.39, 'until': 21.65, 'props': {'label': 'NOVEMBER 16', 'line': 'International Day for Tolerance', 'emphasis': ['Tolerance']}}], mood='light', cap='top', focus={'y': 8, 'zoom': 1.1}),
    full('try', 21.65, 28.65),
    full('end', 28.65, DUR),
], [
    {'type': 'shoulder-steps', 'at': 7.25, 'until': 14.49, 'props': {'title': 'The unwritten signals', 'steps': [{'text': 'Who gets replies', 'at': t_signals[0]}, {'text': 'Whose name is spelled right', 'at': t_signals[1]}, {'text': 'Which posts get a reaction', 'at': t_signals[2]}, {'text': 'Which holidays get mentioned', 'at': t_signals[3]}], 'side': 'left', 'zoom': 1.45}},
    {'type': 'step-chips', 'at': 21.7, 'until': 28.6, 'props': {'steps': [{'label': '01 Write down 5 unwritten rules', 'at': at('Write')}, {'label': '02 Which would a newcomer not know?', 'at': at('Then')}], 'y': 1470}},
], field='black', scrim=0.6)
print('8 plans written')
