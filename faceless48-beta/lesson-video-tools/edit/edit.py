"""One-pass lesson editor: cuts, pause tightening, blur boxes and pill captions.

usage: python3 edit.py <spec.json> [--stills t1,t2,...] [--limit seconds]
spec: {"n":2,"src":"t2.mp4","out":"out/lesson2.mp4","words":"words2.tsv","audio":"a2.wav",
       "cuts":[[a,b],...], "fix":{...}, "blur":[...], "captions":true, "tighten":true, "keep_all":false}
"""
import sys, json, subprocess, re, os
import numpy as np, cv2
from PIL import Image, ImageDraw, ImageFont

FPS = 30
W, H = 1920, 1080
SR = 48000
SPF = SR // FPS  # 1600 samples per frame
FONT = '/tmp/claude-0/lessons/fonts/DMSans-700.ttf'


# ---------------------------------------------------------------- words
def load_words(path):
    return [(float(a), float(b), w) for a, b, w in (l.rstrip('\n').split('\t') for l in open(path) if l.strip())]


def energy_frames(wav16):
    import wave
    w = wave.open(wav16)
    x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
    hop = 160
    n = len(x) // hop
    return np.array([np.sqrt(np.mean(x[i * hop:(i + 1) * hop] ** 2)) for i in range(n)])  # 10 ms frames


def quiet_point(rms, lo, hi):
    """time (s) of the quietest 10 ms inside [lo,hi]"""
    a, b = max(0, int(lo * 100)), max(1, min(len(rms), int(hi * 100) + 1))
    if b <= a:
        return (lo + hi) / 2
    return (a + int(np.argmin(rms[a:b]))) / 100 + 0.005


def build_keep(words, cuts, dur, rms, tighten=True, pre=0.12, post=0.18, joint_gap=0.14, thr=0.42, tail=0.7):
    """Return keep ranges (source seconds) and the kept words."""
    def cut(t0, t1):
        return any(a - 0.02 <= t0 and t1 <= b + 0.02 for a, b in cuts)
    kept = [w for w in words if not cut(w[0], w[1])]
    # words that touch a cut edge but are not fully inside are dropped when most of their time is inside
    kept = [w for w in kept if not any(min(w[1], b) - max(w[0], a) > 0.5 * (w[1] - w[0]) for a, b in cuts)]
    ranges = []
    for i, w in enumerate(kept):
        s, e = w[0], w[1]
        prev = kept[i - 1] if i else None
        if prev is None:
            ranges.append([max(0, s - 0.15), e + post, False])
            continue
        gap = s - prev[1]
        crossed_cut = any(prev[1] - 0.05 <= a <= s + 0.05 or prev[1] - 0.05 <= b <= s + 0.05 or (a >= prev[1] - 0.05 and b <= s + 0.05) for a, b in cuts)
        if (not tighten and gap < 3) or (gap <= thr and not crossed_cut):
            ranges[-1][1] = e + post
        else:
            if crossed_cut:
                # joint inside speech: keep a very short, quiet seam
                end = quiet_point(rms, prev[1], prev[1] + 0.25)
                start = quiet_point(rms, s - 0.25, s)
                ranges[-1][1] = min(max(end, prev[1] + 0.03), prev[1] + 0.12)
                ranges.append([max(start, s - 0.08), e + post, True])
            else:
                ranges[-1][1] = prev[1] + post
                ranges.append([s - pre, e + post, False])
    ranges[-1][1] = min(dur, kept[-1][1] + tail)
    # merge overlaps, snap to frame grid
    out = []
    for a, b, j in ranges:
        fa, fb = int(round(a * FPS)), int(round(b * FPS))
        if out and fa <= out[-1][1]:
            out[-1][1] = max(out[-1][1], fb)
        else:
            out.append([max(0, fa), fb])
    return out, kept


# ---------------------------------------------------------------- captions
GLOSSARY = [
    (r"\bclawed code\b", "Claude Code"), (r"\bclaude code\b", "Claude Code"), (r"\bcloud code\b", "Claude Code"),
    (r"\bcodecs\b", "Codex"), (r"\bcodex\b", "Codex"), (r"\bchat gpt\b", "ChatGPT"),
    (r"\bfaceless 48\b", "Faceless48"), (r"\bfaceless48\b", "Faceless48"),
    (r"\bcontent ?os\b", "ContentOS"), (r"\bnotion\b", "Notion"),
    (r"\byak\b", "yap"), (r"\bYAP\b", "yap"), (r"\bfFmpeg\b", "FFmpeg"), (r"\bffmpeg\b", "FFmpeg"),
]


def clean_text(s, extra=()):
    for pat, rep in list(extra) + GLOSSARY:
        s = re.sub(pat, rep, s, flags=re.I)
    return s



def _norm(t):
    return re.sub(r"[^a-z0-9\-]", "", t.lower())


def apply_seqfix(cw, rules):
    """cw: list of (start,end,text). rules: [[pattern tokens],[replacement tokens]]"""
    for pat, rep in rules:
        i = 0
        pn = [_norm(p) for p in pat]
        out = []
        while i < len(cw):
            if i + len(pn) <= len(cw) and all(_norm(cw[i + k][2]) == pn[k] for k in range(len(pn))):
                last = cw[i + len(pn) - 1][2]
                trail = re.search(r"[^A-Za-z0-9\-]*$", last).group(0)
                lead = re.match(r"^[^A-Za-z0-9\-]*", cw[i][2]).group(0)
                s0, e0 = cw[i][0], cw[i + len(pn) - 1][1]
                m = len(rep)
                for k, r in enumerate(rep):
                    ts = s0 + (e0 - s0) * k / m
                    te = s0 + (e0 - s0) * (k + 1) / m
                    txt = (lead if k == 0 else '') + r + (trail if k == m - 1 and not re.search(r"[^A-Za-z0-9\-]$", r) else '')
                    out.append((ts, te, txt))
                i += len(pn)
            else:
                out.append(cw[i])
                i += 1
        cw = out
    return cw


def chunk_words(words, max_chars=38, max_dur=3.2, gap=0.55):
    chunks, cur = [], []
    for w in words:
        if cur:
            text = ' '.join(x[2] for x in cur + [w])
            if len(text) > max_chars or w[0] - cur[-1][1] > gap or w[1] - cur[0][0] > max_dur or cur[-1][2][-1:] in '.?!':
                chunks.append(cur)
                cur = []
        cur.append(w)
    if cur:
        chunks.append(cur)
    return chunks


class Pill:
    def __init__(self, size=44):
        self.font = ImageFont.truetype(FONT, size)
        self.size = size
        self.cache = {}

    def render(self, ws, active):
        key = (tuple(ws), active)
        if key in self.cache:
            return self.cache[key]
        ss = 2
        f = ImageFont.truetype(FONT, self.size * ss)
        space = f.getlength(' ')
        widths = [f.getlength(w) for w in ws]
        tw = sum(widths) + space * (len(ws) - 1)
        padx, pady = 36 * ss, 15 * ss
        asc, desc = f.getmetrics()
        h = asc + desc + 2 * pady
        w = int(tw + 2 * padx)
        im = Image.new('RGBA', (w, h), (0, 0, 0, 0))
        d = ImageDraw.Draw(im)
        d.rounded_rectangle((0, 0, w - 1, h - 1), radius=h // 2, fill=(14, 12, 22, 214), outline=(183, 110, 121, 190), width=2 * ss)
        x = padx
        for i, wd in enumerate(ws):
            col = (242, 196, 194, 255) if i == active else (255, 255, 255, 255)
            d.text((x, pady), wd, font=f, fill=col)
            x += widths[i] + space
        im = im.resize((w // ss, h // ss), Image.LANCZOS)
        arr = np.asarray(im).astype(np.float32)
        self.cache[key] = arr
        return arr


def paste_rgba(frame, arr, cx, bottom):
    h, w = arr.shape[:2]
    x0 = int(cx - w / 2)
    y0 = int(bottom - h)
    x0 = max(0, min(W - w, x0))
    roi = frame[y0:y0 + h, x0:x0 + w].astype(np.float32)
    a = arr[:, :, 3:4] / 255.0
    rgb = arr[:, :, 2::-1]  # RGBA -> BGR
    frame[y0:y0 + h, x0:x0 + w] = (roi * (1 - a) + rgb * a).astype(np.uint8)


# ---------------------------------------------------------------- blur
def blur_box(frame, b, sigma=22):
    x0, y0, x1, y1 = [int(v) for v in b]
    x0, y0, x1, y1 = max(0, x0), max(0, y0), min(W, x1), min(H, y1)
    if x1 <= x0 or y1 <= y0:
        return
    roi = frame[y0:y1, x0:x1]
    small = cv2.resize(roi, (max(1, (x1 - x0) // 8), max(1, (y1 - y0) // 8)), interpolation=cv2.INTER_AREA)
    roi2 = cv2.resize(small, (x1 - x0, y1 - y0), interpolation=cv2.INTER_LINEAR)
    frame[y0:y1, x0:x1] = cv2.GaussianBlur(roi2, (0, 0), sigma / 2)


def boxes_at(blur, t):
    out = []
    for item in blur:
        if item['t0'] <= t <= item['t1']:
            if 'box' in item:
                out.append(item['box'])
            else:  # tracked: {"track": {sec: box}}
                tr = item['track']
                keys = sorted(int(k) for k in tr)
                k = min(keys, key=lambda s: abs(s - t))
                out.append(tr[str(k)] if str(k) in tr else tr[k])
    return out


# ---------------------------------------------------------------- main
def run(spec, stills=(), limit=None):
    n = spec['n']
    src = spec['src']
    dur = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', src]).decode())
    nframes_src = int(dur * FPS)
    words = load_words(spec['words']) if spec.get('words') else []
    blur = spec.get('blur', [])
    cuts = spec.get('cuts', [])
    fixes = [tuple(x) for x in spec.get('fix', [])]
    rms = energy_frames(spec['audio']) if spec.get('audio') else None

    if spec.get('keep_all'):
        keep = [[0, nframes_src]]
        kept = words
    else:
        keep, kept = build_keep(words, cuts, dur, rms, tighten=spec.get('tighten', True))
    if limit:
        lim = int(limit * FPS)
        out = []
        acc = 0
        for a, b in keep:
            if acc >= lim:
                break
            b2 = min(b, a + (lim - acc))
            out.append([a, b2])
            acc += b2 - a
        keep = out
    keep_frames = np.zeros(nframes_src + FPS * 5, dtype=bool)
    src_to_out = np.full(nframes_src + FPS * 5, -1, dtype=np.int64)
    k = 0
    for a, b in keep:
        keep_frames[a:b] = True
        src_to_out[a:b] = np.arange(k, k + (b - a))
        k += b - a
    nout = k
    print(f'lesson {n}: {dur:.1f}s -> {nout / FPS:.1f}s, {len(keep)} segments, {len(kept)} words')

    # audio: assemble from the source in exact frame windows with tiny fades at every join
    audio_out = spec['out'].replace('.mp4', '.wav')
    if not os.path.exists(audio_out) or spec.get('redo_audio', True):
        raw = subprocess.check_output(['ffmpeg', '-v', 'error', '-i', src, '-vn', '-ac', '2', '-ar', str(SR), '-f', 's16le', '-'])
        x = np.frombuffer(raw, dtype=np.int16).reshape(-1, 2).astype(np.float32)
        parts = []
        fade = 240
        for a, b in keep:
            seg = x[a * SPF:b * SPF].copy()
            if len(seg) > 2 * fade and not spec.get('keep_all'):
                seg[:fade] *= np.linspace(0, 1, fade)[:, None]
                seg[-fade:] *= np.linspace(1, 0, fade)[:, None]
            parts.append(seg)
        y = np.concatenate(parts).astype(np.int16)
        import wave
        wf = wave.open(audio_out, 'wb')
        wf.setnchannels(2); wf.setsampwidth(2); wf.setframerate(SR)
        wf.writeframes(y.tobytes()); wf.close()

    # captions on the new timeline
    chunks = []
    pill = Pill()
    if spec.get('captions') and kept:
        def new_t(t):
            f = int(round(t * FPS))
            f = min(max(f, 0), len(src_to_out) - 1)
            # nearest kept frame at or after f
            while f < len(src_to_out) - 1 and src_to_out[f] < 0:
                f += 1
            return src_to_out[f] / FPS
        cw = []
        nocap = spec.get('nocap', [])
        for s, e, w in kept:
            if any(a <= s < b for a, b in nocap):
                continue
            ns = new_t(s)
            ne = new_t(e)
            cw.append((ns, max(ne, ns + 0.12), clean_text(w, fixes)))
        cw = apply_seqfix(cw, spec.get('seqfix', []))
        cw = [w for w in cw if w[2].strip()]
        for ch in chunk_words(cw):
            chunks.append(ch)
        spans = []
        for i, ch in enumerate(chunks):
            t0 = ch[0][0] - 0.05
            t1 = (chunks[i + 1][0][0] - 0.02) if i + 1 < len(chunks) else ch[-1][1] + 0.4
            t1 = min(t1, ch[-1][1] + 0.5)
            spans.append((t0, t1))

    still_set = set(int(round(float(s) * FPS)) for s in stills)
    dec = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', src, '-vf', f'fps={FPS}', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-'], stdout=subprocess.PIPE, bufsize=W * H * 3 * 4)
    enc = None
    if not stills:
        enc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-', '-i', audio_out,
                                '-c:v', 'libx264', '-preset', 'fast', '-crf', '18', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11' if spec.get('loudnorm', True) else 'anull',
                                '-movflags', '+faststart', '-shortest', spec['out']], stdin=subprocess.PIPE)
    fsz = W * H * 3
    i = 0
    o = 0
    ci = 0
    stills_out = {}
    while True:
        buf = dec.stdout.read(fsz)
        if len(buf) < fsz:
            break
        if i < len(keep_frames) and keep_frames[i]:
            fr = np.frombuffer(buf, dtype=np.uint8).reshape(H, W, 3).copy()
            t = i / FPS
            for b in boxes_at(blur, t):
                blur_box(fr, b)
            if chunks:
                ot = o / FPS
                while ci < len(spans) and ot > spans[ci][1]:
                    ci += 1
                if ci < len(spans) and spans[ci][0] <= ot <= spans[ci][1]:
                    ch = chunks[ci]
                    act = 0
                    for j, w in enumerate(ch):
                        if ot >= w[0] - 0.02:
                            act = j
                    arr = pill.render([w[2] for w in ch], act)
                    paste_rgba(fr, arr, spec.get('cap_cx', 1160), spec.get('cap_bottom', 1022))
            if i in still_set or o in still_set and False:
                stills_out[i] = fr
            if enc:
                enc.stdin.write(fr.tobytes())
            o += 1
            if o >= nout:
                break
        i += 1
        if stills and i > max(still_set) + 2:
            break
    dec.stdout.close(); dec.kill()
    if enc:
        enc.stdin.close(); enc.wait()
    for fi, fr in stills_out.items():
        cv2.imwrite(f'stills/l{n}_src{fi / FPS:.1f}.png', fr)
    print('done', spec.get('out'), o, 'frames')


if __name__ == '__main__':
    spec = json.load(open(sys.argv[1]))
    stills = []
    limit = None
    if '--stills' in sys.argv:
        stills = sys.argv[sys.argv.index('--stills') + 1].split(',')
    if '--limit' in sys.argv:
        limit = float(sys.argv[sys.argv.index('--limit') + 1])
    os.makedirs('stills', exist_ok=True)
    os.makedirs('out', exist_ok=True)
    run(spec, stills, limit)
