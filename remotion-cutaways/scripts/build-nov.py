#!/usr/bin/env python3
"""
November 2026 talking heads in the approved templates (Dr. CK picked: decisions = Creator Hype, quiet-space = Quiet
Authority, who-owns = Analyst, paste-ai = Glass). Times are seconds in the clean cut (public/raw/<slug>.mp4) and come
from her own word times, so every effect lands on the word she says.

  python3 scripts/build-nov.py            # writes content/n-<slug>.scene.json (+ captions and words copies)
"""
import json, shutil, subprocess

SONG1, SONG2 = 'music/leveled/empires.mp3', 'music/leveled/make-it-look-easy.mp3'
BOX = {'T': 935, 'O': 735}


class Clip:
    def __init__(self, slug):
        self.slug = slug
        self.W = [(w, float(a), float(b)) for w, a, b in (l.rstrip('\n').split('\t') for l in open(f'content/{slug}.words.tsv') if l.strip())]
        cl = json.load(open(f'work/{slug}.cutlist.json'))
        t, self.cuts = 0.0, []
        for s in cl['segments']:
            t += s['to'] - s['from']
            self.cuts.append(round(t, 3))
        self.cuts = [c for c in self.cuts if c < self.W[-1][2] - 0.2]
        self.dur = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f'public/raw/{slug}.mp4']))
        self.end = round(self.W[-1][2] + 0.18, 3)

    def at(self, word, after=0.0):
        for w, a, b in self.W:
            if a >= after - 0.001 and w.lower().strip('.,?!') == word.lower().strip('.,?!'):
                return round(a, 2)
        raise KeyError(f'{self.slug}: {word} after {after}')

    def b(self, word, after=0.0):
        """Cut point just before a word: halfway through the breath between it and the word before."""
        for i, (w, a, e) in enumerate(self.W):
            if a >= after - 0.001 and w.lower().strip('.,?!') == word.lower().strip('.,?!'):
                return 0.0 if i == 0 else round((self.W[i - 1][2] + a) / 2, 2)
        raise KeyError(f'{self.slug}: {word} after {after}')

    def say(self, s, e):
        ws = [(w, a) for w, a, b in self.W if s - 0.02 <= a < e]
        return ' '.join(w for w, _ in ws), [round(a, 2) for _, a in ws]

    def full(self, sid, s, e, close=1.5, mood='dark', cap='bottom', first_close=False):
        """Her full frame, split at every jump cut: wide and close alternate as hard cuts (punch-ins)."""
        pts = [s] + [c for c in self.cuts if s + 0.15 < c < e - 0.15] + [e]
        segs = []
        for k in range(len(pts) - 1):
            is_close = (k % 2 == 1) != first_close
            seg = {'start': pts[k], 'end': pts[k + 1], 'layout': 'A', 'captionPos': cap, 'graphics': [], 'focus': {'y': 24, 'zoom': close} if is_close else {'y': 40, 'zoom': 1.0}}
            if k:
                seg['cut'] = True
            segs.append(seg)
        return {'id': sid, 'mood': mood, 'segments': segs}

    def scene(self, sid, s, e, layout, graphics=(), mood='dark', avatar=None, cap='bottom', focus=None, captionY=None):
        seg = {'start': s, 'end': e, 'layout': layout, 'captionPos': cap, 'graphics': list(graphics)}
        if captionY or layout in BOX:
            seg['captionY'] = captionY or BOX[layout]
        if avatar:
            seg['avatar'] = avatar
        if focus:
            seg['focus'] = focus
        return {'id': sid, 'mood': mood, 'segments': [seg]}

    def statement(self, s, e, em=(), mood='dark'):
        text, times = self.say(s, e)
        g = {'type': 'statement-card', 'at': s, 'until': e, 'box': {'y': 150, 'h': 900, 'center': True}, 'props': {'text': text, 'emphasis': list(em), 'wordTimes': times}}
        return self.scene('st%d' % int(s * 10), s, e, 'E', [g], mood=mood, avatar='hidden')

    def plan(self, name, caption, song, scenes, fx, emphasis, **kw):
        p = {
            'slug': f'n-{self.slug}', 'template': name, 'video': f'raw/{self.slug}.mp4', 'durationSec': round(self.dur, 3), 'matte': self.slug,
            'theme': {'field': 'black', 'sans': 'DM Sans'}, 'captionStyle': caption, 'emphasis': emphasis,
            'hero': [], 'boxed': [], 'finish': kw.get('finish', {'grain': 0.0, 'lightLeaks': 0.0}), 'scrim': kw.get('scrim', 0.55),
            'scenes': scenes, 'fx': fx, 'fxSound': kw.get('sound', 'minimal'),
            'endCard': {'variant': 'link-pill', 'startAt': self.end, 'label': 'LINK BELOW OR IN MY BIO', 'url': 'bio.c3global.co'},
            'music': {'src': song, 'volume': 0.42, 'duckTo': 0.2, 'fadeInSec': 1.5, 'fadeOutSec': 2.5, 'startFromSec': 0},
        }
        json.dump(p, open(f'content/n-{self.slug}.scene.json', 'w'), indent=1)
        shutil.copy(f'content/{self.slug}.captions.json', f'content/n-{self.slug}.captions.json')
        shutil.copy(f'content/{self.slug}.words.tsv', f'content/n-{self.slug}.words.tsv')


def card(c, s, e, box, em=()):
    """A statement graphic inside a window layout: the words land as she says them (the card is the caption)."""
    text, times = c.say(s, e)
    return {'type': 'statement-card', 'at': s, 'until': e, 'box': box, 'props': {'text': text, 'emphasis': list(em), 'wordTimes': times}}


# ---------------------------------------------------------------- decisions (Nov 17): Creator Hype
# Round 2 (Dr. CK, Nov 16): alternate layouts (window + card, split, full card), punch-ins kept gentle for sharpness,
# the "ASK" caption sits under the slot machine, not on it.
TOPB, LOWB = {'y': 0, 'h': 560, 'center': True}, {'y': -370, 'h': 720, 'center': True}
CLOSE = 1.25
d = Clip('decisions')
at, b = d.at, d.b
d_ask = d.scene('ask', b('Before'), b('What', 21), 'T', captionY=1390)
d_ask['segments'][0]['cut'] = True
d_last = d.scene('lasts', b('A', 25.5), b('Follow'), 'S', [card(d, b('A', 25.5), b('Follow'), LOWB, ('owner', 'date.'))], focus={'y': 8, 'zoom': 1.1})
d_last['segments'][0]['cut'] = True
d.plan('hype', 'punch', SONG2, [
    d.full('hook', 0, b('Too'), close=CLOSE),
    d.full('owns', b('Too'), b('so', 13), close=CLOSE, first_close=True),
    d.full('back', b('so', 13), b('A', 15), close=CLOSE),
    d.full('shared', b('A', 15), b('Before'), close=CLOSE, first_close=True),
    d_ask,
    d.statement(b('What', 21), b('Then'), em=('decide,', 'doing', 'check?')),
    d.full('post', b('Then'), b('A', 25.5), close=CLOSE, first_close=True),
    d_last,
    d.full('end', b('Follow'), d.dur, close=CLOSE),
], [
    {'type': 'giant-caption', 'at': 0.0, 'until': 0.8, 'props': {'version': 2, 'text': "Don't", 'accent': 'panic.', 'y': 1120}},
    {'type': 'clone', 'at': 1.6, 'until': 3.95, 'props': {'version': 2, 'copies': [{'at': at('just'), 'side': 'left'}, {'at': at('get'), 'side': 'right'}, {'at': at('call,'), 'side': 'left'}]}},
    {'type': 'flash-frame', 'at': 4.2, 'props': {'version': 2}},
    {'type': 'type-wall', 'at': 4.25, 'until': round(b('Too') - 0.04, 2), 'props': {'words': [{'text': 'fast', 'at': at('fast,')}, {'text': 'ends', 'at': at('ends,')}, {'text': 'heads', 'at': at('heads.')}]}},
    {'type': 'knockout-tiles', 'at': round(b('Too') + 0.06, 2), 'until': round(b('so', 13) - 0.01, 2), 'props': {'names': [{'text': 'DECIDED?', 'knockAt': at('written')}, {'text': 'OWNER?', 'knockAt': round(at('written') + 0.25, 2)}, {'text': 'CHECK-IN?', 'knockAt': at('down,')}]}},
    {'type': 'impact-frame', 'at': at('same'), 'until': round(b('A', 15) - 0.08, 2), 'props': {'word': 'Same call'}},
    {'type': 'orbit', 'at': round(b('A', 15) + 0.07, 2), 'until': round(b('Before') - 0.03, 2), 'props': {'items': ['hype-media/substack-home.png', 'hype-media/drck-fx-1.jpg', 'hype-media/clip-a.mp4', 'hype-media/substack-four-places.png', 'hype-media/drck-fx-5.jpg']}},
    {'type': 'slot-machine', 'at': round(at('ask') - 0.05, 2), 'until': round(b('What', 21) - 0.03, 2), 'props': {'words': ['WHAT', 'WHO', 'WHEN'], 'stopAt': [round(at('ask') + 0.3, 2), round(at('ask') + 0.5, 2), round(at('ask') + 0.7, 2)], 'label': '3 questions', 'y': 960}},
    {'type': 'couch-wall', 'at': round(b('Then') + 0.05, 2), 'until': round(b('A', 25.5) - 0.02, 2), 'props': {'tiles': ['What did we decide?', 'hype-media/drck-fx-3.jpg', 'Who is doing it?', 'hype-media/clip-b.mp4', 'When will we check?', 'hype-media/substack-home.png']}},
], ['panic.', 'decision', 'owner', 'date.', 'stick.'], finish={'grain': 0.3, 'lightLeaks': 0.0}, sound='full', scrim=0.65)


# ---------------------------------------------------------------- quiet-space (Nov 18): Quiet Authority
q = Clip('quiet-space')
at = q.at
# box y is measured from the layout's graphic area (T: 900, S: 600)
TOPB, LOWB = {'y': 0, 'h': 560, 'center': True}, {'y': -370, 'h': 720, 'center': True}
q1 = q.scene('q1', 3.42, 7.47, 'T', [card(q, 3.42, 7.47, TOPB, ('one,',))], captionY=1480)
q2 = q.scene('q2', 7.47, 11.27, 'S', [card(q, 7.47, 11.27, LOWB, ('two,',))], focus={'y': 8, 'zoom': 1.1})
q3 = q.scene('q3', 11.27, 15.98, 'T', [card(q, 11.27, 15.98, TOPB, ('three,',))], captionY=1480)
for sc in (q2, q3):
    sc['segments'][0]['cut'] = True
q.plan('quiet', 'quiet', SONG1, [
    q.full('hook', 0, 3.42, close=1.25),
    q1, q2, q3,
    q.full('reason', 15.98, 18.93, close=1.25, first_close=True),
    q.statement(18.93, 22.86, em=('happening', 'expecting')),
    q.full('week', 22.86, 27.51, close=1.25),
    q.full('end', 27.51, q.dur, close=1.25, first_close=True),
], [
    {'type': 'rack-focus', 'at': 0.0, 'until': 1.2, 'props': {}},
    {'type': 'spotlight', 'at': 22.9, 'until': 28.0, 'props': {'dim': 0.86, 'words': [{'text': 'one small event', 'at': at('small')}, {'text': 'by name', 'at': at('by')}]}},
], ['check', 'one,', 'two,', 'three,', 'reason.', 'happening', 'expecting', 'name.'], scrim=0.5)

# ---------------------------------------------------------------- who-owns (Nov 21): Analyst
# Round 2: layouts alternate (full, window + card, full card, split, large window, circle); the vote lights "No" only
# when she says "It isn't"; cards sit in the space under or over her window so nothing overlaps the captions.
w = Clip('who-owns')
at, b = w.at, w.b
w_easy = w.scene('easy', b('The', 3.5), b('So'), 'T', captionY=1480)
w_q12 = w.scene('q12', b('Who'), b('And', 13.2), 'T', captionY=1480)
w_q34 = w.scene('q34', b('And', 13.2), b('If'), 'S', focus={'y': 8, 'zoom': 1.1}, captionY=880)
w_sit = w.scene('sit', b('If'), b('Pick'), 'F', captionY=1290)
w_pick = w.scene('pick', b('Pick'), b('Follow'), 'O', captionY=1480)
for sc in (w_easy, w_q12, w_q34, w_sit, w_pick):
    sc['segments'][0]['cut'] = True
w.plan('analyst', 'ticker', SONG1, [
    w.full('hook', 0, b('The', 3.5), close=CLOSE),
    w_easy,
    w.scene('three', b('So'), b('Who'), 'E', avatar='hidden'),
    w_q12, w_q34, w_sit, w_pick,
    w.full('end', b('Follow'), w.dur, close=CLOSE),
], [
    {'type': 'vote-pill', 'at': 0.9, 'until': round(b('The', 3.5) - 0.05, 2), 'props': {'question': 'Is the hard part over?', 'a': 'Yes', 'b': 'No', 'pick': 'b', 'pickAt': at('It'), 'y': 820}},
    {'type': 'compare', 'at': round(b('The', 3.5) + 0.05, 2), 'until': round(b('So') - 0.03, 2), 'props': {'left': 'The tool', 'right': 'People using it', 'leftText': 'The easy part', 'rightText': 'The hard part', 'winner': 'right', 'badge': 'Starts here', 'y': 920}},
    {'type': 'giant-caption', 'at': round(b('So') + 0.02, 2), 'until': round(b('Who') - 0.02, 2), 'props': {'version': 2, 'text': '3', 'accent': 'questions', 'y': 700}},
    {'type': 'focus-list', 'at': round(b('Who') + 0.03, 2), 'until': round(b('And', 13.2) - 0.02, 2), 'props': {'title': 'Ask', 'items': [
        {'text': 'Who do employees go to?', 'at': at('Who')}, {'text': 'What is it allowed for?', 'at': at('What')}], 'y': 930}},
    {'type': 'focus-list', 'at': round(b('And', 13.2) + 0.03, 2), 'until': round(b('If') - 0.02, 2), 'props': {'title': 'Also ask', 'items': [
        {'text': 'What is off limits?', 'at': at('what', 13.4)}, {'text': 'How will you know it helps?', 'at': at('how')}], 'y': 330}},
    {'type': 'checklist', 'at': round(b('Pick') + 0.03, 2), 'until': round(b('Follow') - 0.03, 2), 'props': {'version': 2, 'y': 760, 'items': [{'text': 'Pick one owner', 'at': at('Pick')}, {'text': 'Write the answers down', 'at': at('write')}]}},
], ['hard', 'easy', 'three', 'owner', 'AI.'], scrim=0.55)

# ---------------------------------------------------------------- paste-ai (Nov 23): Glass
# Round 2: "you may, you may not" cut to one; layouts alternate (full, circle, full card, window + glass card, split,
# window + glass card) and the three groups are glass quote cards that fill in as she says them.
p = Clip('paste-ai')
at, b = p.at, p.b
p_ctl = p.scene('control', b('With'), b('So'), 'O', captionY=1480)
p_safe = p.scene('safe', b('Safe'), b('Ask'), 'T', [card(p, b('Safe'), b('Ask'), TOPB, ('Safe',))], captionY=1480)
p_ask = p.scene('askf', b('Ask'), b('Do'), 'S', [card(p, b('Ask'), b('Do'), LOWB, ('Ask', 'first,'))], focus={'y': 8, 'zoom': 1.1})
p_dont = p.scene('dont', b('Do'), b('Follow'), 'T', [card(p, b('Do'), b('Follow'), TOPB, ('not', 'paste,'))], captionY=1480)
for sc in (p_ctl, p_safe, p_ask, p_dont):
    sc['segments'][0]['cut'] = True
p.plan('glass', 'glass', SONG1, [
    p.full('hook', 0, b('With'), close=CLOSE),
    p_ctl,
    p.statement(b('So'), b('Safe'), em=('simple', 'three')),
    p_safe, p_ask, p_dont,
    p.full('end', b('Follow'), p.dur, close=CLOSE),
], [
    {'type': 'grade', 'at': 0, 'until': p.dur, 'props': {'look': 'cool', 'strength': 0.3}},
    {'type': 'prompt-bar', 'at': 0.1, 'until': round(b('With') - 0.05, 2), 'props': {'text': 'Summarize this client file', 'label': 'AI assistant', 'typeAt': 0.3, 'sendAt': 2.4, 'y': 780}},
    {'type': 'spatial-glass', 'at': round(at('may') - 0.1, 2), 'until': round(b('So') - 0.05, 2), 'props': {'title': 'Once you paste it in', 'text': 'you may not control where it goes', 'y': 860}},
], ['paste', 'control', 'three', 'Safe', 'Ask', 'not', 'safely'], scrim=0.5)


# ---------------------------------------------------------------- change-ai: Teach Board (date to be set by Dr. CK)
def board(c, sid, s, e, title, items, y=880, h=500, cap=1472, layout='T'):
    """Her window and a whiteboard list: T puts her on top and the board under; S puts the board on top and her under."""
    sc = c.scene(sid, s, e, layout, captionY=cap, focus={'y': 8, 'zoom': 1.1} if layout == 'S' else None)
    return sc, {'type': 'lesson-board', 'at': s, 'until': e, 'props': {'title': title, 'items': items, 'y': y, 'height': h}}


g = Clip('change-ai')
at, b = g.at, g.b
_b1, _f1 = board(g, 'covered', b('The', 6.5), b('So'), 'The announcement covered', [
    {'text': 'what was changing', 'at': at('what')},
    {'text': 'not what to do on day one', 'at': at('not')},
    {'text': 'not where to go when stuck', 'at': at('where')}])
_b2, _f2 = board(g, 'rollout', b('So'), b('Follow'), 'Before your next rollout', [
    {'text': 'Walk through day one on paper', 'at': at('walk')},
    {'text': 'Find what will confuse people', 'at': at('Find')},
    {'text': 'Put an AI guide right there', 'at': at('put')}], y=250, h=540, cap=905, layout='S')
for sc in (_b1, _b2):
    sc['segments'][0]['cut'] = True
g.plan('teach', 'karaoke', SONG1, [
    g.full('hook', 0, b('The', 6.5), close=CLOSE),
    _b1, _b2,
    g.full('end', b('Follow'), g.dur, close=CLOSE, first_close=True),
], [
    {'type': 'doodle-boil', 'at': 0.3, 'until': round(b('The', 6.5) - 0.1, 2), 'props': {'marks': [{'kind': 'text', 'text': "Today's lesson", 'target': 'head', 'at': 0.4, 'side': 'right', 'color': 'white'}, {'kind': 'underline', 'target': 'chest', 'at': at('scattered'), 'side': 'left', 'color': 'white', 'x': 540, 'y': 1378}]}},
    _f1, _f2,
], ['change', 'day', 'one', 'paper.', 'AI'], scrim=0.55)

print('plans written')
