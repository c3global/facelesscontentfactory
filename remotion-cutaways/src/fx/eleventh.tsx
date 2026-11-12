import React from 'react';
import {handFamily, serifFamily} from '../fonts';
import {useSpan} from './fourth';
import type {Fx} from './schema';
import {C3} from './theme';
import {pop, tw} from './util';

/**
 * Eleventh FX batch (beta 11): the carousel slides as video effects. Proof card, focus list, A vs B with a winner,
 * glowing trend graph, freebie doc, and a handwritten note with an arrow. Each sits on a frosted glass panel over the video.
 */
type Of<T extends Fx['type']> = Extract<Fx, {type: T}>;
const FILL: React.CSSProperties = {position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, pointerEvents: 'none'};
const SANS = C3.sans;

export const Panel: React.FC<{y: number; k: number; out: number; w?: number; children: React.ReactNode}> = ({y, k, out, w = 920, children}) => (
  <div style={{position: 'absolute', left: (1080 - w) / 2, width: w, top: y, transform: `translateY(${(1 - k) * 60}px) scale(${0.94 + 0.06 * k})`, opacity: k * out, borderRadius: 34, padding: '40px 46px', boxSizing: 'border-box', background: 'linear-gradient(160deg, rgba(40,42,52,0.78), rgba(14,15,20,0.86))', border: '1.5px solid rgba(255,255,255,0.22)', boxShadow: '0 30px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.18)', backdropFilter: 'blur(22px) saturate(1.3)', color: '#fff', fontFamily: SANS}}>
    {children}
  </div>
);
export const Title: React.FC<{text?: string; k: number}> = ({text, k}) => {
  if (!text) return null;
  const parts = text.split(' ');
  const last = parts.pop();
  return (
    <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 64, marginBottom: 26, opacity: k, textShadow: '0 4px 24px rgba(0,0,0,0.9), 0 0 4px rgba(0,0,0,0.6)'}}>
      {parts.join(' ')} <span style={{fontFamily: serifFamily, fontStyle: 'italic', color: C3.goldBright}}>{last}</span>
    </div>
  );
};
export const Label: React.FC<{text: string}> = ({text}) => <div style={{fontSize: 26, letterSpacing: 4, textTransform: 'uppercase', opacity: 0.75, fontWeight: 700}}>{text}</div>;

// ---------------------------------------------------------------- proof card: a number counts up, an underline draws in
export const ProofCard: React.FC<{fx: Of<'proof-card'>}> = ({fx}) => {
  const {t, inK, outK} = useSpan(fx);
  const {label, value, prefix, suffix, sub, y, title} = fx.props;
  const c = tw(t, 0.35, 1.5, 0, 1, (x) => 1 - Math.pow(1 - x, 3));
  const n = Math.round(value * c).toLocaleString('en-US');
  return (
    <div style={FILL}>
      <Panel y={y} k={inK} out={outK}>
        <Title text={title} k={inK} />
        <Label text={label} />
        <div style={{fontWeight: 700, fontSize: 170, lineHeight: 1.05, letterSpacing: -4}}>{prefix}{n}{suffix}</div>
        <div style={{height: 7, borderRadius: 4, background: C3.copper, width: `${tw(t, 1.2, 1.7) * 100}%`, maxWidth: 620}} />
        {sub && <div style={{fontFamily: serifFamily, fontStyle: 'italic', fontSize: 44, marginTop: 18, opacity: tw(t, 1.4, 1.8) * 0.9}}>{sub}</div>}
      </Panel>
    </div>
  );
};

// ---------------------------------------------------------------- focus list, timed: every item has its own second, and its switch turns on right then
const ROW = 'linear-gradient(160deg, rgba(40,42,52,0.78), rgba(14,15,20,0.86))';
const FocusListTimed: React.FC<{fx: Of<'focus-list'>; items: {text: string; at: number}[]}> = ({fx, items}) => {
  const {abs, inK, outK} = useSpan(fx);
  const {y, title} = fx.props;
  return (
    <div style={{...FILL, opacity: outK}}>
      <div style={{position: 'absolute', left: 80, width: 920, top: y, transform: `translateY(${(1 - inK) * 50}px)`, opacity: inK, fontFamily: SANS, color: '#fff'}}>
        <Title text={title} k={inK} />
        {items.map((it, i) => {
          const next = items[i + 1]?.at ?? 1e6;
          const on = tw(abs, it.at, it.at + 0.25);
          const seen = tw(abs, it.at - 0.2, it.at + 0.1);
          const focus = seen * (1 - tw(abs, next - 0.2, next + 0.1));
          return (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: 22, height: 92 + 20 * focus, marginBottom: 16, padding: '0 34px', borderRadius: 60, background: ROW, border: `1.5px solid rgba(255,255,255,${0.16 + 0.19 * focus})`, boxShadow: '0 16px 40px rgba(0,0,0,0.4)', backdropFilter: 'blur(18px)', filter: `blur(${5 * (1 - seen)}px)`, opacity: 0.6 + 0.4 * seen}}>
              <span style={{fontWeight: 700, fontSize: 34, color: C3.copper}}>{String(i + 1).padStart(2, '0')}</span>
              <span style={{flex: 1, fontWeight: 700, fontSize: 38 + 8 * focus}}>{it.text}</span>
              <span style={{flex: 'none', width: 92, height: 50, borderRadius: 25, background: on > 0.5 ? C3.accent : `rgba(255,255,255,${0.15 + 0.2 * on})`, position: 'relative'}}>
                <span style={{position: 'absolute', top: 5, left: 5 + 42 * on, width: 40, height: 40, borderRadius: 20, background: '#fff'}} />
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- focus list: switches turn on one row at a time; the current row is sharp, the rest soft
export const FocusList: React.FC<{fx: Of<'focus-list'>}> = ({fx}) => {
  const {t, len, inK, outK} = useSpan(fx);
  const {y, title} = fx.props;
  const timed = fx.props.items.filter((it): it is {text: string; at: number} => typeof it !== 'string');
  const items = fx.props.items.map((it) => (typeof it === 'string' ? it : it.text));
  const step = Math.max(0.45, (len - 1.2) / items.length);
  const cur = Math.min(items.length - 1, Math.floor(Math.max(0, t - 0.5) / step));
  if (timed.length === fx.props.items.length) return <FocusListTimed fx={fx} items={timed} />;
  return (
    <div style={{...FILL, opacity: outK}}>
      <div style={{position: 'absolute', left: 80, width: 920, top: y, transform: `translateY(${(1 - inK) * 50}px)`, opacity: inK, fontFamily: SANS, color: '#fff'}}>
        <Title text={title} k={inK} />
        {items.map((it, i) => {
          const on = i < cur || (i === cur && t - 0.5 - i * step > step * 0.5);
          const active = i === cur;
          const sw = tw(t, 0.5 + i * step + step * 0.45, 0.5 + i * step + step * 0.7);
          const blur = active ? 0 : i > cur ? 5 : 0;
          return (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: 22, height: active ? 112 : 92, marginBottom: 16, padding: '0 34px', borderRadius: 60, background: 'linear-gradient(160deg, rgba(40,42,52,0.78), rgba(14,15,20,0.86))', border: `1.5px solid rgba(255,255,255,${active ? 0.35 : 0.16})`, boxShadow: '0 16px 40px rgba(0,0,0,0.4)', backdropFilter: 'blur(18px)', filter: `blur(${blur}px)`, opacity: i > cur ? 0.6 : 1}}>
              <span style={{fontWeight: 700, fontSize: 34, color: C3.copper}}>{String(i + 1).padStart(2, '0')}</span>
              <span style={{flex: 1, fontWeight: 700, fontSize: active ? 46 : 38}}>{it}</span>
              <span style={{width: 92, height: 50, borderRadius: 25, background: on ? C3.accent : `rgba(255,255,255,${0.15 + 0.2 * sw})`, position: 'relative'}}>
                <span style={{position: 'absolute', top: 5, left: 5 + 42 * (on ? 1 : sw), width: 40, height: 40, borderRadius: 20, background: '#fff'}} />
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- A vs B: two panels, then the pick jumps to the winner
export const Compare: React.FC<{fx: Of<'compare'>}> = ({fx}) => {
  const {t, inK, outK} = useSpan(fx);
  const {left, right, leftText, rightText, winner, y, title, badge} = fx.props;
  const pick = tw(t, 1.3, 1.7, 0, 1, pop);
  const card = (head: string, body: string, win: boolean, i: number) => {
    const k = tw(t, 0.1 + i * 0.2, 0.5 + i * 0.2, 0, 1, pop);
    return (
      <div style={{flex: 1, minHeight: 360, borderRadius: 30, padding: '34px 34px', boxSizing: 'border-box', background: 'linear-gradient(160deg, rgba(40,42,52,0.78), rgba(14,15,20,0.86))', border: win ? `3px solid rgba(227,191,99,${0.3 + 0.7 * pick})` : '1.5px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(18px)', boxShadow: win ? `0 0 ${50 * pick}px rgba(227,191,99,0.35)` : '0 16px 40px rgba(0,0,0,0.4)', transform: `translateY(${(1 - k) * 50}px) scale(${win ? 1 + 0.04 * pick : 1 - 0.03 * pick})`, opacity: k * (win ? 1 : 1 - 0.35 * pick)}}>
        <div style={{fontSize: 26, letterSpacing: 4, fontWeight: 700, color: win ? C3.gold : 'rgba(255,255,255,0.75)'}}>{head.toUpperCase()}</div>
        <div style={{fontSize: 40, lineHeight: 1.25, marginTop: 18}}>{body}</div>
        {win && <div style={{display: 'inline-block', marginTop: 24, background: C3.accent, borderRadius: 40, padding: '8px 26px', fontWeight: 700, fontSize: 32, transform: `scale(${pick})`}}>{badge}</div>}
      </div>
    );
  };
  return (
    <div style={{...FILL, opacity: outK}}>
      <div style={{position: 'absolute', left: 70, width: 940, top: y, fontFamily: SANS, color: '#fff'}}>
        <Title text={title} k={inK} />
        <div style={{display: 'flex', gap: 26}}>
          {card(left, leftText, winner === 'left', 0)}
          {card(right, rightText, winner === 'right', 1)}
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- trend graph: a glowing line draws itself, the end dot pulses, the number counts up
export const TrendGraph: React.FC<{fx: Of<'trend-graph'>}> = ({fx}) => {
  const {t, inK, outK} = useSpan(fx);
  const {label, value, suffix, points, y, title} = fx.props;
  const W = 820;
  const H = 300;
  const mx = Math.max(...points);
  const mn = Math.min(...points);
  const pts = points.map((p, i) => [(i / (points.length - 1)) * W, H - 20 - ((p - mn) / Math.max(1e-6, mx - mn)) * (H - 50)]);
  const d = pts.map((p, i) => `${i ? 'L' : 'M'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  const k = tw(t, 0.4, 1.8, 0, 1, (x) => x * (2 - x));
  const end = pts[pts.length - 1];
  const id = `tg${fx.at}`;
  return (
    <div style={FILL}>
      <Panel y={y} k={inK} out={outK}>
        <Title text={title} k={inK} />
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
          <Label text={label} />
          <div style={{fontWeight: 700, fontSize: 96, lineHeight: 0.9}}>{Math.round(value * k)}{suffix}</div>
        </div>
        <svg width={W} height={H} style={{overflow: 'visible', marginTop: 10}}>
          <defs>
            <linearGradient id={id} x1="0" x2="1">
              <stop offset="0" stopColor={C3.accent} />
              <stop offset="1" stopColor={C3.goldBright} />
            </linearGradient>
            <filter id={`${id}g`}><feGaussianBlur stdDeviation="6" /></filter>
          </defs>
          <path d={d} fill="none" stroke={`url(#${id})`} strokeWidth={14} opacity={0.5} filter={`url(#${id}g)`} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - k} />
          <path d={d} fill="none" stroke={`url(#${id})`} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - k} />
          {k > 0.98 && <circle cx={end[0]} cy={end[1]} r={13 + 3 * Math.sin(t * 6)} fill="#fff" stroke={C3.gold} strokeWidth={4} />}
        </svg>
      </Panel>
    </div>
  );
};

// ---------------------------------------------------------------- freebie doc: a document whose lines fill in, then a comment bar types the keyword
export const FreebieDoc: React.FC<{fx: Of<'freebie-doc'>}> = ({fx}) => {
  const {t, inK, outK, frame} = useSpan(fx);
  const {title, keyword, y} = fx.props;
  const typed = `Comment ${keyword}`.slice(0, Math.floor(tw(t, 1.4, 2.2, 0, `Comment ${keyword}`.length + 0.99, (x) => x)));
  return (
    <div style={FILL}>
      <div style={{position: 'absolute', left: 190, width: 700, top: y, transform: `translateY(${(1 - inK) * 70}px) rotate(${(1 - inK) * -4}deg)`, opacity: inK * outK, fontFamily: SANS}}>
        <div style={{background: '#fbf8f2', borderRadius: 22, padding: '40px 44px', boxShadow: '0 30px 80px rgba(0,0,0,0.5)'}}>
          <div style={{fontWeight: 700, fontSize: 46, color: '#1d1a17'}}>{title}</div>
          <div style={{height: 5, width: 120, background: C3.accent, margin: '16px 0 26px'}} />
          {Array.from({length: 7}, (_, i) => (
            <div key={i} style={{height: 14, borderRadius: 7, background: 'rgba(29,26,23,0.18)', marginBottom: 16, width: `${(i % 3 === 2 ? 62 : 92) * tw(t, 0.4 + i * 0.1, 0.7 + i * 0.1)}%`}} />
          ))}
        </div>
        <div style={{marginTop: 26, display: 'flex', alignItems: 'center', gap: 16, background: 'rgba(14,15,20,0.8)', border: '1.5px solid rgba(255,255,255,0.2)', borderRadius: 50, padding: '18px 26px', color: '#fff', fontSize: 36, opacity: tw(t, 1.2, 1.4), backdropFilter: 'blur(16px)'}}>
          <span style={{flex: 1}}>{typed}<span style={{opacity: Math.floor(frame / 8) % 2 ? 0 : 1}}>|</span></span>
          <span style={{width: 54, height: 54, borderRadius: 27, background: C3.accent, display: 'grid', placeItems: 'center', fontSize: 30}}>↑</span>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- handwritten note with an arrow that starts outside the words and curves away from them
/** the size of a handwritten note's text block, so a caller can place it (right-align it, for example) */
export const noteBox = (text: string, size: number) => {
  const cw = size * 0.45;
  const maxW = size * 8;
  let lines = 1;
  let cur = 0;
  let widest = 0;
  for (const w of text.split(' ')) {
    const ww = w.length * cw + cw * 0.5;
    if (cur + ww > maxW && cur > 0) { lines++; widest = Math.max(widest, cur); cur = ww; } else cur += ww;
  }
  widest = Math.max(widest, cur);
  return {maxW, bw: Math.min(maxW, widest), bh: lines * size * 1.05 + 6};
};
/** the ink itself: `w` writes the words in (0..1), `k` draws the arrow (0..1) */
export const NoteInk: React.FC<{text: string; x: number; y: number; to?: readonly [number, number]; from?: 'auto' | 'left' | 'right' | 'top' | 'bottom'; bend?: number; size: number; w: number; k: number; ink?: string; /** wrap the words at the measured width (for a note placed against the right edge) */ snug?: boolean}> = ({text, x, y, to, from = 'auto', bend, size, w, k, ink = C3.gold, snug}) => {
  const {maxW, bw, bh} = noteBox(text, size);
  const cx = x + bw / 2;
  const cy = y + bh / 2;
  const gap = 18;
  const [tx, ty] = to ?? [cx, cy];
  const side = from !== 'auto' ? from : Math.abs(tx - cx) / bw > Math.abs(ty - cy) / bh ? (tx > cx ? 'right' : 'left') : ty > cy ? 'bottom' : 'top';
  const sx = side === 'left' ? x - gap : side === 'right' ? x + bw + gap : Math.max(x + 20, Math.min(x + bw - 20, tx));
  const sy = side === 'top' ? y - gap : side === 'bottom' ? y + bh + gap : cy;
  const nx = -(ty - sy);
  const ny = tx - sx;
  const autoSign = ((sx + tx) / 2 + nx * 0.1 - cx) * nx + ((sy + ty) / 2 + ny * 0.1 - cy) * ny >= 0 ? 1 : -1;
  const b = (bend ?? autoSign * 0.6) * 0.42;
  const mx = (sx + tx) / 2 + nx * b;
  const my = (sy + ty) / 2 + ny * b;
  const ang = Math.atan2(ty - my, tx - mx);
  return (
    <>
      <div style={{position: 'absolute', left: x, top: y, width: snug ? bw + 14 : maxW, fontFamily: handFamily, fontWeight: 700, fontSize: size, lineHeight: 1.05, color: ink, transform: 'rotate(-4deg)', transformOrigin: '0 0', clipPath: `inset(0 ${100 - w * 100}% 0 0)`, textShadow: '0 2px 10px rgba(0,0,0,0.5)'}}>{text}</div>
      {to && (
        <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
          <path d={`M ${sx} ${sy} Q ${mx} ${my} ${tx} ${ty}`} fill="none" stroke={ink} strokeWidth={5} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - k} style={{filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.5))'}} />
          <path d={`M ${tx - 26 * Math.cos(ang - 0.5)} ${ty - 26 * Math.sin(ang - 0.5)} L ${tx} ${ty} L ${tx - 26 * Math.cos(ang + 0.5)} ${ty - 26 * Math.sin(ang + 0.5)}`} fill="none" stroke={ink} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" opacity={k > 0.95 ? 1 : 0} />
        </svg>
      )}
    </>
  );
};
export const NoteArrow: React.FC<{fx: Of<'note-arrow'>}> = ({fx}) => {
  const {t, outK} = useSpan(fx);
  const {text, x, y, to, from, bend, size} = fx.props;
  return (
    <div style={{...FILL, opacity: outK}}>
      <NoteInk text={text} x={x} y={y} to={to} from={from} bend={bend} size={size} w={tw(t, 0.1, 0.8)} k={tw(t, 0.7, 1.2)} />
    </div>
  );
};

export const Scrim: React.FC<{fx: Fx; top: number}> = ({fx, top}) => {
  const {inK, outK} = useSpan(fx);
  return <div style={{...FILL, top: top - 260, height: 1920 - top + 260, background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.62) 30%, rgba(0,0,0,0.72) 100%)', opacity: inK * outK}} />;
};
export const withScrim = (fx: Fx, y: number, node: React.ReactNode) => <><Scrim fx={fx} top={y} />{node}</>;

export const eleventhOver = (fx: Fx): React.ReactNode => {
  switch (fx.type) {
    case 'proof-card': return withScrim(fx, fx.props.y, <ProofCard fx={fx} />);
    case 'focus-list': return withScrim(fx, fx.props.y, <FocusList fx={fx} />);
    case 'compare': return withScrim(fx, fx.props.y, <Compare fx={fx} />);
    case 'trend-graph': return withScrim(fx, fx.props.y, <TrendGraph fx={fx} />);
    case 'freebie-doc': return withScrim(fx, fx.props.y, <FreebieDoc fx={fx} />);
    case 'note-arrow': return <NoteArrow fx={fx} />;
    default: return null;
  }
};
