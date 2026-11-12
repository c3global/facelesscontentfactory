import React from 'react';
import {Img, OffthreadVideo, staticFile, useVideoConfig} from 'remotion';
import {serifFamily} from '../fonts';
import {Cutout} from './behind';
import {Caret, typedSlice, useSpan} from './fourth';
import type {Fx} from './schema';
import {C3} from './theme';
import {anchorPx, pop, tw, useFxEnv} from './util';

/**
 * Seventh FX batch (C3 skin), batch 1 of the three-reel build (Nov 2026): live cursor, clone row, day dial,
 * predict keys, letter orbit, code body, post wall, letter dive. Copper first, gold second, cream paper for the print looks.
 */
type Of<T extends Fx['type']> = Extract<Fx, {type: T}>;
const FILL: React.CSSProperties = {position: 'absolute', left: 0, top: 0, width: 1080, height: 1920};
const MONO = '"SF Mono", "Menlo", "Courier New", monospace';
const CREAM = '#F3EBDD';
const INK = '#2B2420';
const COPPER_DARK = '#A5551F';

// ---------------------------------------------------------------- live cursor
// Like a design canvas: the named cursor drags a small box around her head, then pulls it out into a big rectangle
// (any size: width/height in px), live size readout, a center guide flashes, and the box nudges her a little.
export const LiveCursor: React.FC<{fx: Of<'live-cursor'>}> = ({fx}) => {
  const {t, abs, fps, len, outK, a} = useSpan(fx);
  const {anchors, video, videoStyle} = useFxEnv();
  const {label, width, height, nudge} = fx.props;
  const head = anchorPx(anchors, Math.round(abs * fps), 'head');
  const ease = (x: number) => 1 - (1 - x) ** 3;
  // phase 1: small head box drawn from its top-left corner
  const draw = tw(t, 0.25, 0.6, 0, 1, ease);
  // phase 2: pulled out to the full rectangle
  const grow = tw(t, 0.7, 1.25, 0, 1, ease);
  const w0 = 300;
  const h0 = 340;
  const w = w0 + (width - w0) * grow;
  const h = h0 + (height - h0) * grow;
  // phase 3: nudge sideways and back
  // phase 3: the cursor grabs the box and drags it sideways; whatever is inside the box moves with it, then it is dropped back
  const nx = nudge * Math.sin(Math.PI * tw(t, 1.4, len - 0.3, 0, 1, (x) => x * x * (3 - 2 * x)));
  const x = head.x - w / 2 + nx;
  const y = head.y - h0 * 0.45;
  const bw = w * Math.min(1, draw * 1.2);
  const bh = h * draw;
  const live = (v: number, k: number) => Math.round(v + (grow > 0 && grow < 1 ? Math.sin(abs * 40 + k) * 6 : 0));
  // the cursor rides the bottom-right handle; before it arrives it travels in from the left
  const enter = tw(t, 0, 0.3, 0, 1, ease);
  const cx = (x + bw) * enter + 120 * (1 - enter);
  const cy = (y + bh) * enter + (y - 80) * (1 - enter);
  const guide = tw(t, 1.3, 1.45) * (1 - tw(t, 1.9, 2.1));
  const handles: [number, number][] = [[x, y], [x + bw / 2, y], [x + bw, y], [x, y + bh / 2], [x + bw, y + bh / 2], [x, y + bh], [x + bw / 2, y + bh], [x + bw, y + bh]];
  const bx0 = head.x - width / 2;
  const moving = Math.abs(nx) > 0.5;
  // over effects play inside a Sequence that starts at `a`, so the clip starts there too
  const from = Math.round(a * fps);
  return (
    <div style={{...FILL, opacity: outK}}>
      {moving && (
        <>
          {/* the spot the box left: a soft, darker blur of the same frame, so nothing is doubled */}
          <div style={{position: 'absolute', left: bx0, top: y, width, height, overflow: 'hidden'}}>
            <OffthreadVideo src={staticFile(video)} muted startFrom={from} style={{...videoStyle, position: 'absolute', left: -bx0, top: -y, width: 1080, height: 1920, objectFit: 'cover', filter: 'blur(26px) brightness(0.55)'}} />
          </div>
          {/* the box's contents, carried along by the drag */}
          <div style={{position: 'absolute', left: bx0 + nx, top: y, width, height, overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.55)'}}>
            <OffthreadVideo src={staticFile(video)} muted startFrom={from} style={{...videoStyle, position: 'absolute', left: -bx0, top: -y, width: 1080, height: 1920, objectFit: 'cover'}} />
          </div>
        </>
      )}
      <div style={{position: 'absolute', left: 540 + nx - 1.5, top: 0, width: 3, height: 1920, background: '#FF5A4E', opacity: guide * 0.9}} />
      {draw > 0 && <div style={{position: 'absolute', left: x, top: y, width: bw, height: bh, border: `3px solid ${C3.gold}`, boxSizing: 'border-box', background: 'rgba(227,191,99,0.05)'}} />}
      {draw > 0.95 && handles.map(([hx, hy], i) => <div key={i} style={{position: 'absolute', left: hx - 10, top: hy - 10, width: 20, height: 20, background: '#fff', border: `3px solid ${C3.gold}`, boxSizing: 'border-box'}} />)}
      {draw > 0.95 && (
        <div style={{position: 'absolute', left: x + bw / 2 - 120, top: y - 62, width: 240, textAlign: 'center'}}>
          <span style={{display: 'inline-block', padding: '6px 16px', borderRadius: 8, background: C3.gold, color: '#2a1d06', fontFamily: MONO, fontWeight: 700, fontSize: 26}}>{live(w, 1)} × {live(h, 2)}</span>
        </div>
      )}
      <div style={{position: 'absolute', left: cx - 4, top: cy - 4}}>
        <svg width={64} height={78} viewBox="0 0 23 28" style={{filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))'}}>
          <path d="M1 1 L1 22 L7 17 L11 27 L15 25 L11 15 L19 15 Z" fill="#fff" stroke="#111" strokeWidth={1.2} strokeLinejoin="round" />
        </svg>
        <div style={{position: 'absolute', left: 52, top: 64, padding: '8px 20px', borderRadius: 10, background: C3.copperGrad, color: '#2a1206', fontFamily: C3.sans, fontWeight: 700, fontSize: 30, whiteSpace: 'nowrap', boxShadow: '0 6px 16px rgba(0,0,0,0.4)'}}>{label}</div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- clone row (copies of her fan out in a row behind her, smaller toward the edges)
export const CloneRowCopies: React.FC<{fx: Of<'clone-row'>}> = ({fx}) => {
  const {t, a, outK} = useSpan(fx);
  const {fps} = useVideoConfig();
  const n = fx.props.count;
  const copies = Array.from({length: n * 2}, (_, i) => {
    const side = i % 2 ? 1 : -1;
    const rank = Math.floor(i / 2) + 1;
    return {side, rank};
  }).sort((p, q) => q.rank - p.rank);
  return (
    <>
      {copies.map(({side, rank}, i) => {
        const k = tw(t, 0.08 * rank, 0.08 * rank + 0.4, 0, 1, pop) * outK;
        if (k <= 0.01) return null;
        const scale = Math.pow(0.82, rank);
        const dx = side * (rank * 250 - (rank - 1) * rank * 18) * k;
        return <Cutout key={i} plain from={Math.round(a * fps)} style={{transformOrigin: '50% 30%', transform: `translateX(${dx}px) scale(${scale})`, opacity: k, filter: `brightness(${1 - rank * 0.12})`}} />;
      })}
    </>
  );
};

// ---------------------------------------------------------------- day dial (a cream clock face swings in behind her, its hand ticks through the days)
export const DayDialPlate: React.FC<{fx: Of<'day-dial'>}> = ({fx}) => {
  const {t, len, outK} = useSpan(fx);
  const {word, marks, label} = fx.props;
  const swing = tw(t, 0, 0.6);
  const R = 560;
  const cx = 820 - (1 - swing) * 400;
  const cy = 700;
  const turn = tw(t, 0.4, len - 0.3, 0, 1, (x) => x) * 330;
  return (
    <div style={{...FILL, opacity: outK, overflow: 'hidden', background: CREAM}}>
      <div style={{position: 'absolute', left: cx - R, top: cy - R, width: R * 2, height: R * 2, borderRadius: R, border: `6px solid ${INK}`, boxSizing: 'border-box', transform: `rotate(${(1 - swing) * -40}deg)`, background: 'radial-gradient(circle,#FBF6EC 0%,#EFE4D1 100%)'}}>
        {Array.from({length: 60}, (_, i) => (
          <div key={i} style={{position: 'absolute', left: R - 2, top: 10, width: i % 5 ? 3 : 6, height: i % 5 ? 22 : 44, background: INK, transformOrigin: `50% ${R - 10}px`, transform: `rotate(${i * 6}deg)`}} />
        ))}
        {Array.from({length: marks}, (_, i) => {
          const th = (i / marks) * Math.PI * 2;
          const r = R - 130;
          return (
            <div key={i} style={{position: 'absolute', left: R + r * Math.sin(th) - 60, top: R - r * Math.cos(th) - 40, width: 120, textAlign: 'center', fontFamily: serifFamily, fontSize: 76, color: INK, lineHeight: '80px'}}>{i + 1}</div>
          );
        })}
        {Array.from({length: marks}, (_, i) => {
          const th = ((i + 0.5) / marks) * 360;
          return (
            <div key={`w${i}`} style={{position: 'absolute', left: R - 80, top: R - (R - 250) - 30, width: 160, textAlign: 'center', transformOrigin: `50% ${R - 250 + 30}px`, transform: `rotate(${th}deg)`, fontFamily: serifFamily, fontStyle: 'italic', fontSize: 46, color: COPPER_DARK}}>{word}</div>
          );
        })}
        <div style={{position: 'absolute', left: R - 7, top: 120, width: 14, height: R - 120, background: INK, borderRadius: 7, transformOrigin: '50% 100%', transform: `rotate(${turn}deg)`}} />
        <div style={{position: 'absolute', left: R - 22, top: R - 22, width: 44, height: 44, borderRadius: 22, background: C3.copperGrad}} />
      </div>
      {label && <div style={{position: 'absolute', left: 60, top: 140, fontFamily: serifFamily, fontStyle: 'italic', fontSize: 64, color: INK, opacity: tw(t, 0.4, 0.7)}}>{label}</div>}
    </div>
  );
};

// ---------------------------------------------------------------- predict keys (a phone keyboard types her word, the suggestion bar guesses ahead)
const ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];
export const PredictKeys: React.FC<{fx: Of<'predict-keys'>}> = ({fx}) => {
  const {t, abs, frame, outK} = useSpan(fx);
  const {text, suggestions, y} = fx.props;
  const rise = tw(t, 0, 0.35);
  const typeFrom = fx.at + 0.4;
  const typeTo = typeFrom + Math.max(0.8, text.length * 0.09);
  const shown = typedSlice(text, abs, typeFrom, typeTo);
  const next = text[shown.length]?.toLowerCase() ?? '';
  const W = 1000;
  const key = 84;
  return (
    <div style={{...FILL, opacity: outK}}>
      <div style={{position: 'absolute', left: 40, top: y + (1 - rise) * 500, width: W, borderRadius: 34, background: 'rgba(28,28,30,0.94)', border: C3.hair, padding: '18px 14px 26px', boxSizing: 'border-box', boxShadow: '0 24px 60px rgba(0,0,0,0.55)'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14, padding: '10px 20px', margin: '0 6px 14px', borderRadius: 26, background: 'rgba(255,255,255,0.08)'}}>
          <div style={{flex: 1, fontFamily: C3.sans, fontWeight: 600, fontSize: 40, color: '#fff'}}>{shown}<Caret frame={frame} h={38} /></div>
          <div style={{width: 52, height: 52, borderRadius: 26, background: C3.copperGrad, color: '#2a1206', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, fontWeight: 700}}>↑</div>
        </div>
        <div style={{display: 'flex', justifyContent: 'space-around', fontFamily: C3.sans, fontWeight: 600, fontSize: 32, color: 'rgba(255,255,255,0.85)', paddingBottom: 14, borderBottom: '1px solid rgba(255,255,255,0.12)', marginBottom: 14}}>
          {suggestions.slice(0, 3).map((s, i) => (
            <span key={i} style={i === 1 ? {color: C3.copper} : undefined}>{s}</span>
          ))}
        </div>
        {ROWS.map((r, ri) => (
          <div key={ri} style={{display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 12}}>
            {r.split('').map((c) => {
              const hot = c === next && abs >= typeFrom && abs < typeTo;
              return (
                <div key={c} style={{width: key, height: key * 1.12, borderRadius: 12, background: hot ? C3.copperGrad : 'rgba(255,255,255,0.16)', color: hot ? '#2a1206' : '#fff', fontFamily: C3.sans, fontSize: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: hot ? 'translateY(-8px) scale(1.12)' : undefined}}>{c}</div>
              );
            })}
          </div>
        ))}
        <div style={{display: 'flex', justifyContent: 'center', gap: 10}}>
          <div style={{width: 170, height: 84, borderRadius: 12, background: 'rgba(255,255,255,0.1)', color: '#fff', fontFamily: C3.sans, fontSize: 28, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>123</div>
          <div style={{width: 520, height: 84, borderRadius: 12, background: 'rgba(255,255,255,0.16)', color: '#fff', fontFamily: C3.sans, fontSize: 28, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>space</div>
          <div style={{width: 200, height: 84, borderRadius: 12, background: 'rgba(255,255,255,0.1)', color: '#fff', fontFamily: C3.sans, fontSize: 28, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>return</div>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- letter orbit (the letters of one word ring her head; the near half passes in front of her)
export const LetterOrbit: React.FC<{fx: Of<'letter-orbit'>; half: 'back' | 'front'}> = ({fx, half}) => {
  const {t, abs, fps, inK, outK} = useSpan(fx);
  const {anchors} = useFxEnv();
  const {word, radius, tilt} = fx.props;
  const head = anchorPx(anchors, Math.round(abs * fps), 'head');
  const letters = `${word.toUpperCase()} · `.split('');
  const n = letters.length;
  return (
    <div style={{...FILL, pointerEvents: 'none'}}>
      {letters.map((ch, i) => {
        const th = t * 1.3 + (i / n) * Math.PI * 2;
        const depth = Math.sin(th);
        if ((half === 'front') !== depth > 0) return null;
        const k = (depth + 1) / 2;
        return (
          <div key={i} style={{position: 'absolute', left: head.x + radius * Math.cos(th) - 40, top: head.y - 40 + tilt * depth, width: 80, textAlign: 'center', fontFamily: serifFamily, fontWeight: 600, fontSize: 92, color: half === 'front' ? C3.goldBright : C3.gold, opacity: inK * outK * (0.45 + 0.55 * k), transform: `scale(${0.7 + 0.45 * k})`, textShadow: '0 4px 14px rgba(0,0,0,0.55)'}}>{ch}</div>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------- code body (her room goes dark and code scrolls over her)
const codeLines = (seed: string) => {
  const words = ['const', 'frame', 'cut', 'render', '=>', 'caption', 'zoom', 'return', 'clip', 'await', 'beat', 'scene', '{', '}', 'fx', 'matte', 'export', 'style', 'true', '0.42'];
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return Array.from({length: 120}, () => {
    let line = '';
    while (line.length < 60) {
      h = (h * 1103515245 + 12345) >>> 0;
      line += `${words[h % words.length]} `;
    }
    return line;
  });
};
export const CodeBodyPlate: React.FC<{fx: Of<'code-body'>}> = ({fx}) => {
  const {outK, inK} = useSpan(fx);
  return <div style={{...FILL, background: '#07100b', opacity: outK * Math.min(1, inK * 1.4)}} />;
};
export const CodeBodyFront: React.FC<{fx: Of<'code-body'>}> = ({fx}) => {
  const {t, outK} = useSpan(fx);
  const lines = React.useMemo(() => codeLines(fx.props.seed), [fx.props.seed]);
  const k = tw(t, 0, 0.35) * outK;
  return (
    <div style={{...FILL, overflow: 'hidden', mixBlendMode: 'overlay', opacity: k}}>
      <div style={{transform: `translateY(${-t * 140}px)`, fontFamily: MONO, fontSize: 26, lineHeight: '30px', color: C3.goldBright, whiteSpace: 'pre', padding: '0 10px'}}>
        {lines.map((l, i) => <div key={i}>{l}</div>)}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- post wall (real-looking posts land behind her in a feed grid, a counter climbs)
// `images`: post thumbnails in public/ (her real posts, or stills from her clip). Between them sit branded quote cards from `quotes`.
const PostTile: React.FC<{i: number; size: number; images: string[]; quotes: string[]}> = ({i, size, images, quotes}) => {
  const useQuote = quotes.length > 0 && (images.length === 0 || i % 4 === 2);
  const likes = ((i * 7919) % 900) + 40;
  const multi = i % 5 === 1;
  if (useQuote) {
    const q = quotes[i % quotes.length];
    const tones = [{bg: C3.copperGrad, fg: '#2a1206'}, {bg: 'linear-gradient(160deg,#1b1d1f,#0b0c0d)', fg: '#F4B08A'}, {bg: CREAM, fg: INK}];
    const tone = tones[i % tones.length];
    return (
      <div style={{width: size, height: size, background: tone.bg, padding: size * 0.1, boxSizing: 'border-box', display: 'flex', alignItems: 'center', fontFamily: serifFamily, fontStyle: 'italic', fontWeight: 600, fontSize: size * 0.13, lineHeight: 1.15, color: tone.fg}}>{q}</div>
    );
  }
  const src = images[i % images.length];
  const zoom = 1 + ((i * 37) % 30) / 100;
  return (
    <div style={{width: size, height: size, overflow: 'hidden', position: 'relative', background: '#111'}}>
      <Img src={staticFile(src)} style={{width: size * zoom, height: size * zoom, objectFit: 'cover', marginLeft: -((zoom - 1) * size) * ((i % 3) / 2), filter: i % 3 === 0 ? 'saturate(0.85) contrast(1.05)' : undefined}} />
      {multi && <div style={{position: 'absolute', right: size * 0.06, top: size * 0.06, width: size * 0.13, height: size * 0.13, border: '2px solid #fff', borderRadius: 3, boxShadow: '3px -3px 0 -1px rgba(255,255,255,0.85)'}} />}
      <div style={{position: 'absolute', left: size * 0.06, bottom: size * 0.05, fontFamily: C3.sans, fontWeight: 700, fontSize: size * 0.1, color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.8)'}}>♥ {likes}</div>
    </div>
  );
};
export const PostWallPlate: React.FC<{fx: Of<'post-wall'>}> = ({fx}) => {
  const {t, len, outK} = useSpan(fx);
  const {count, label, images, quotes} = fx.props;
  const cols = 6;
  const gap = 6;
  const size = (1080 - gap * (cols + 1)) / cols;
  const rows = Math.ceil(1920 / (size + gap)) + 1;
  const total = cols * rows;
  const fill = tw(t, 0.15, Math.max(0.8, len - 0.6), 0, 1, (x) => x * (2 - x));
  const shown = Math.round(fill * count);
  // the feed scrolls up slowly while posts land
  const scroll = t * 40;
  return (
    <div style={{...FILL, background: '#0d0e0f', opacity: outK, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 0, top: -scroll, width: 1080}}>
        {Array.from({length: total}, (_, i) => {
          const r = Math.floor(i / cols);
          const c = i % cols;
          const order = (r * 1.6 + Math.abs(c - (cols - 1) / 2) + ((c * 7 + r * 13) % 5) * 0.4) / (rows * 1.6 + cols);
          const k = tw(fill, order * 0.9, order * 0.9 + 0.1, 0, 1, pop);
          return (
            <div key={i} style={{position: 'absolute', left: gap + c * (size + gap), top: gap + r * (size + gap), width: size, height: size, borderRadius: 8, overflow: 'hidden', opacity: k, transform: `scale(${0.6 + 0.4 * k})`, background: 'rgba(255,255,255,0.04)'}}>
              <PostTile i={i} size={size} images={images} quotes={quotes} />
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', right: 40, top: 110, textAlign: 'right', padding: '14px 26px', borderRadius: 20, background: 'rgba(10,10,12,0.82)', border: C3.hair}}>
        <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 80, color: '#fff'}}>{shown.toLocaleString('en-US')}</div>
        <div style={{fontFamily: C3.sans, fontWeight: 700, fontSize: 26, letterSpacing: 5, color: C3.copper, textTransform: 'uppercase'}}>{label}</div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- letter dive (a giant serif word on cream, her clip plays inside the letters, the camera dives into one)
export const LetterDive: React.FC<{fx: Of<'letter-dive'>}> = ({fx}) => {
  const {t, len, a, outK} = useSpan(fx);
  const {video} = useFxEnv();
  const {fps} = useVideoConfig();
  const {word, diveLetter} = fx.props;
  const inK = tw(t, 0, 0.3);
  const dive = tw(t, len - 0.9, len - 0.1, 0, 1, (x) => x * x * x);
  const fs = Math.min(560, 1900 / Math.max(2, word.length));
  const n = word.length;
  const idx = Math.min(n - 1, Math.max(0, diveLetter));
  // the dive zooms toward the chosen letter's center
  const ox = ((idx + 0.5) / n) * 100;
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='1080' height='1920'><text x='540' y='1130' text-anchor='middle' font-family='Playfair Display, Georgia, serif' font-size='${fs}' font-weight='700'>${word.replace(/[<&>]/g, '')}</text></svg>`;
  const mask = `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
  const sc = 1 + 0.08 * tw(t, 0, len) + 14 * dive;
  return (
    <div style={{...FILL, opacity: outK * inK, background: CREAM, overflow: 'hidden'}}>
      <div style={{...FILL, transformOrigin: `${ox}% 52%`, transform: `scale(${sc})`}}>
        <div style={{...FILL, WebkitMaskImage: mask, maskImage: mask, WebkitMaskSize: '1080px 1920px', maskSize: '1080px 1920px'}}>
          <OffthreadVideo src={staticFile(video)} muted startFrom={Math.round(a * fps)} style={{...FILL, objectFit: 'cover', transform: 'scale(1.25)', filter: 'contrast(1.1)'}} />
        </div>
        <div style={{position: 'absolute', left: 0, width: 1080, top: 1180, textAlign: 'center', fontFamily: C3.sans, fontWeight: 700, fontSize: 26, letterSpacing: 8, color: COPPER_DARK, textTransform: 'uppercase', opacity: 1 - dive}}>{fx.props.label ?? ''}</div>
      </div>
      <div style={{...FILL, background: '#000', opacity: tw(t, len - 0.25, len)}} />
    </div>
  );
};

// ---------------------------------------------------------------- dispatch
export const seventhPlate = (fx: Fx): React.ReactNode => {
  switch (fx.type) {
    case 'day-dial': return <DayDialPlate fx={fx} />;
    case 'code-body': return <CodeBodyPlate fx={fx} />;
    case 'post-wall': return <PostWallPlate fx={fx} />;
    case 'letter-orbit': return <LetterOrbit fx={fx} half="back" />;
    default: return null;
  }
};
export const seventhFront = (fx: Fx): React.ReactNode => {
  switch (fx.type) {
    case 'letter-orbit': return <LetterOrbit fx={fx} half="front" />;
    case 'code-body': return <CodeBodyFront fx={fx} />;
    default: return null;
  }
};
export const seventhOver = (fx: Fx): React.ReactNode => {
  switch (fx.type) {
    case 'live-cursor': return <LiveCursor fx={fx} />;
    case 'predict-keys': return <PredictKeys fx={fx} />;
    case 'letter-dive': return <LetterDive fx={fx} />;
    default: return null;
  }
};
