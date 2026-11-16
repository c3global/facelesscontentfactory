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


# ---------------------------------------------------------------- decisions (Nov 17): Creator Hype
d = Clip('decisions')
at = d.at
d.plan('hype', 'punch', SONG2, [
    d.full('hook', 0, 8.34, close=1.7),
    d.full('owns', 8.34, 13.11, close=1.7, first_close=True),
    d.full('back', 13.11, 14.98, close=1.7),
    d.full('shared', 14.98, 18.83, close=1.7, first_close=True),
    d.full('ask', 18.83, 21.82, close=1.7),
    d.statement(21.82, 24.45, em=('decide,', 'doing', 'check?')),
    d.full('post', 24.45, 26.2, close=1.7, first_close=True),
    d.full('lasts', 26.2, 29.0, close=1.7),
    d.full('end', 29.0, d.dur, close=1.7, first_close=True),
], [
    {'type': 'giant-caption', 'at': 0.0, 'until': 0.8, 'props': {'version': 2, 'text': "Don't", 'accent': 'panic.', 'y': 1120}},
    {'type': 'clone', 'at': 1.6, 'until': 3.95, 'props': {'version': 2, 'copies': [{'at': at('just'), 'side': 'left'}, {'at': at('get'), 'side': 'right'}, {'at': at('call,'), 'side': 'left'}]}},
    {'type': 'flash-frame', 'at': 4.2, 'props': {'version': 2}},
    {'type': 'type-wall', 'at': 4.25, 'until': 8.3, 'props': {'words': [{'text': 'fast', 'at': at('fast,')}, {'text': 'ends', 'at': at('ends,')}, {'text': 'heads', 'at': at('heads.')}]}},
    {'type': 'knockout-tiles', 'at': 8.4, 'until': 13.1, 'props': {'names': [{'text': 'DECIDED?', 'knockAt': at('written')}, {'text': 'OWNER?', 'knockAt': round(at('written') + 0.25, 2)}, {'text': 'CHECK-IN?', 'knockAt': at('down,')}]}},
    {'type': 'impact-frame', 'at': at('same'), 'until': 14.9, 'props': {'word': 'Same call'}},
    {'type': 'orbit', 'at': 15.05, 'until': 18.8, 'props': {'items': ['hype-media/substack-home.png', 'hype-media/drck-fx-1.jpg', 'hype-media/clip-a.mp4', 'hype-media/substack-four-places.png', 'hype-media/drck-fx-5.jpg']}},
    {'type': 'slot-machine', 'at': 20.55, 'until': 21.85, 'props': {'words': ['WHAT', 'WHO', 'WHEN'], 'stopAt': [20.85, 21.15, 21.45], 'label': '3 questions', 'y': 1150}},
    {'type': 'couch-wall', 'at': 24.5, 'until': 26.2, 'props': {'tiles': ['What did we decide?', 'hype-media/drck-fx-3.jpg', 'Who is doing it?', 'hype-media/clip-b.mp4', 'When will we check?', 'hype-media/substack-home.png']}},
    {'type': 'type-wall', 'at': 26.25, 'until': 29.0, 'props': {'words': [{'text': 'owner', 'at': at('owner')}, {'text': 'date', 'at': at('date.')}]}},
], ['panic.', 'decision', 'owner', 'date.', 'stick.'], finish={'grain': 0.3, 'lightLeaks': 0.0}, sound='full', scrim=0.65)


def card(c, s, e, box, em=()):
    """A statement graphic inside a window layout: the words land as she says them (the card is the caption)."""
    text, times = c.say(s, e)
    return {'type': 'statement-card', 'at': s, 'until': e, 'box': box, 'props': {'text': text, 'emphasis': list(em), 'wordTimes': times}}


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
    q.full('hook', 0, 3.42, close=1.35),
    q1, q2, q3,
    q.full('reason', 15.98, 18.93, close=1.35, first_close=True),
    q.statement(18.93, 22.86, em=('happening', 'expecting')),
    q.full('week', 22.86, 27.51, close=1.35),
    q.full('end', 27.51, q.dur, close=1.35, first_close=True),
], [
    {'type': 'rack-focus', 'at': 0.0, 'until': 1.2, 'props': {}},
    {'type': 'spotlight', 'at': 22.9, 'until': 27.5, 'props': {'dim': 0.86, 'words': [{'text': 'one small event', 'at': at('small')}, {'text': 'by name', 'at': at('by')}]}},
], ['check', 'one,', 'two,', 'three,', 'reason.', 'happening', 'expecting', 'name.'], scrim=0.5)

# ---------------------------------------------------------------- who-owns (Nov 21): Analyst
w = Clip('who-owns')
at = w.at
qs = w.scene('questions', 8.55, 17.47, 'T', captionY=1480)
w.plan('analyst', 'ticker', SONG1, [
    w.full('hook', 0, 3.53, close=1.45),
    w.full('easy', 3.53, 7.41, close=1.45, first_close=True),
    w.scene('three', 7.41, 8.55, 'E', avatar='hidden'),
    qs,
    w.full('sit', 17.47, 22.25, close=1.45),
    w.full('pick', 22.25, 24.83, close=1.45, first_close=True),
    w.full('end', 24.83, w.dur, close=1.45),
], [
    {'type': 'vote-pill', 'at': 1.0, 'until': 3.5, 'props': {'question': 'Is the hard part over?', 'a': 'Yes', 'b': 'No', 'pick': 'b', 'pickAt': at('isn\'t.'), 'y': 1180}},
    {'type': 'compare', 'at': 3.6, 'until': 7.4, 'props': {'left': 'The tool', 'right': 'People using it', 'leftText': 'The easy part', 'rightText': 'The hard part', 'winner': 'right', 'badge': 'Starts here', 'y': 980}},
    {'type': 'big-stat', 'at': 7.45, 'until': 8.5, 'props': {'value': 3, 'label': 'QUESTIONS', 'size': 560, 'y': 470, 'align': 'center'}},
    {'type': 'focus-list', 'at': 8.55, 'until': 17.45, 'props': {'title': 'Ask', 'items': [
        {'text': 'Who do employees go to?', 'at': at('Who')}, {'text': 'What is it allowed for?', 'at': at('What')},
        {'text': 'What is off limits?', 'at': at('what', 13.4)}, {'text': 'How will you know it helps?', 'at': at('how')}], 'y': 900}},
    {'type': 'checklist', 'at': 22.3, 'until': 24.8, 'props': {'version': 2, 'y': 640, 'items': [{'text': 'Pick one owner', 'at': at('Pick')}, {'text': 'Write the answers down', 'at': at('write')}]}},
], ['hard', 'easy', 'three', 'owner', 'AI.'], scrim=0.55)

# ---------------------------------------------------------------- paste-ai (Nov 23): Glass
p = Clip('paste-ai')
at = p.at
p.plan('glass', 'glass', SONG1, [
    p.full('hook', 0, 3.27, close=1.4),
    p.full('control', 3.27, 8.27, close=1.4, first_close=True),
    p.statement(8.27, 10.74, em=('simple', 'three')),
    p.full('groups', 10.74, 21.01, close=1.4),
    p.full('end', 21.01, p.dur, close=1.4, first_close=True),
], [
    {'type': 'grade', 'at': 0, 'until': p.dur, 'props': {'look': 'cool', 'strength': 0.3}},
    {'type': 'prompt-bar', 'at': 0.1, 'until': 3.2, 'props': {'text': 'Summarize this client file', 'label': 'AI assistant', 'typeAt': 0.3, 'sendAt': 2.4, 'y': 780}},
    {'type': 'spatial-glass', 'at': round(at('may') - 0.1, 2), 'until': 8.2, 'props': {'title': 'Once you paste it in', 'text': 'you may not control where it goes', 'y': 880}},
    {'type': 'glass-cards', 'at': 10.8, 'until': 20.95, 'props': {'cards': [
        {'label': 'Safe to paste', 'value': 'Public information', 'at': at('Safe'), 'side': 'left', 'x': 30, 'y': 300},
        {'label': 'Ask first', 'value': 'Clients or the business', 'at': at('Ask'), 'side': 'right', 'x': 690, 'y': 520},
        {'label': 'Do not paste', 'value': 'Passwords, private details', 'at': at('Do'), 'side': 'left', 'x': 30, 'y': 760}]}},
], ['paste', 'control', 'three', 'Safe', 'Ask', 'not', 'safely'], scrim=0.5)

print('plans written')
