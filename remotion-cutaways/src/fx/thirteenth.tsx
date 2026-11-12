import React from 'react';
import {Img, OffthreadVideo, staticFile} from 'remotion';
import {heavyFamily, serifFamily} from '../fonts';
import {useSpan} from './fourth';
import type {Fx} from './schema';
import {C3, CheckMark, ROSE, ROSE_TEXT} from './theme';
import {anchorPx, easeInC, easeOutC, fxRange, pop, tw, useFxEnv, useFxTime} from './util';

/**
 * Thirteenth FX batch (beta 11): the reel effects.
 *   shoulder-steps    the shot pushes in over her shoulder and step cards float beside her in depth
 *   iris              a round iris closes on her face, holds, and opens again (or just closes, or just opens)
 *   match-cut         hard cuts between framings with her face held on the same spot, a word per cut
 *   demo-cursor       an app window floats in; a cursor glides to the button and clicks it
 *   glass-cards       small frosted cards float around her and bob
 *   pixel-monitor     starts as a close-up of a pixel screen, then pulls back and sharpens into her clip
 *   slot-machine      three reels spin and stop one by one on her words
 *   holo-phone        a see-through hologram phone turns beside her
 *   silhouette-shift  she turns into a dark silhouette on a color field, a word lands, then the light comes back (needs the cutout)
 */
type Of<T extends Fx['type']> = Extract<Fx, {type: T}>;
const FILL: React.CSSProperties = {position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, pointerEvents: 'none'};
const SANS = C3.sans;
const GLASS = 'linear-gradient(160deg, rgba(52,54,66,0.62), rgba(14,15,20,0.78))';
const smooth = (x: number) => x * x * (3 - 2 * x);

/** a second copy of her clip, lined up with the one underneath, for effects that move or treat the picture */
const Clip: React.FC<{from: number; style?: React.CSSProperties}> = ({from, style}) => {
  const {video, videoStyle} = useFxEnv();
  return <OffthreadVideo src={staticFile(video)} muted startFrom={from} style={{...FILL, objectFit: 'cover', ...videoStyle, ...style}} />;
};
const Cursor: React.FC<{x: number; y: number; press?: number; size?: number}> = ({x, y, press = 0, size = 64}) => (
  <svg width={size} height={size} viewBox="0 0 28 28" style={{position: 'absolute', left: x, top: y, transform: `scale(${1 - 0.14 * press})`, transformOrigin: '0 0', filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.5))'}}>
    <path d="M1 1 L1 22 L7 17 L11 27 L15 25 L11 15 L19 15 Z" fill="#fff" stroke="#111" strokeWidth={1.4} strokeLinejoin="round" />
  </svg>
);

// ---------------------------------------------------------------- shoulder steps
export const ShoulderSteps: React.FC<{fx: Of<'shoulder-steps'>}> = ({fx}) => {
  const {a, t, abs, fps, len} = useSpan(fx);
  const {anchors} = useFxEnv();
  const {steps, side, zoom, title} = fx.props;
  const k = tw(t, 0, 0.7, 0, 1, smooth) * (1 - tw(t, len - 0.5, len, 0, 1, smooth));
  const dir = side === 'left' ? -1 : 1;
  const p = anchorPx(anchors, Math.round(a * fps), 'chest');
  const cardX = side === 'left' ? 560 : 40;
  return (
    <div style={{...FILL, overflow: 'hidden', opacity: tw(t, 0, 0.12) * (1 - tw(t, len - 0.1, len))}}>
      {/* a soft, enlarged copy fills the strip the slide would otherwise uncover */}
      <Clip from={Math.round(a * fps)} style={{transform: 'scale(1.5)', filter: 'blur(36px) brightness(0.6)'}} />
      <div style={{...FILL, transformOrigin: `${p.x}px ${p.y - 260}px`, transform: `translateX(${dir * Math.min(290, (zoom - 1) * 540 - 6) * k}px) scale(${1 + (zoom - 1) * k})`}}>
        <Clip from={Math.round(a * fps)} />
      </div>
      <div style={{...FILL, background: `linear-gradient(${side === 'left' ? 270 : 90}deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.35) 45%, rgba(0,0,0,0) 70%)`, opacity: k}} />
      <div style={{position: 'absolute', left: cardX, top: 330, width: 480, perspective: 1400, opacity: Math.min(1, k * 1.4)}}>
        {title && <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 30, letterSpacing: 5, textTransform: 'uppercase', ...ROSE_TEXT, marginBottom: 26}}>{title}</div>}
        {steps.map((s, i) => {
          const c = tw(abs, s.at, s.at + 0.45, 0, 1, pop);
          const bob = Math.sin(t * 1.6 + i * 1.3) * 7;
          return (
            <div key={i} style={{marginBottom: 30, marginLeft: (side === 'left' ? 1 : -1) * i * -14 + 20, transform: `translate3d(${(1 - c) * -dir * 160}px, ${bob}px, 0) rotateY(${-dir * (16 - 3 * i)}deg) scale(${0.86 + 0.14 * c})`, transformOrigin: side === 'left' ? '100% 50%' : '0 50%', opacity: c, display: 'flex', alignItems: 'center', gap: 22, padding: '26px 30px', borderRadius: 30, background: GLASS, border: '1.5px solid rgba(255,255,255,0.26)', boxShadow: '0 26px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.2)', backdropFilter: 'blur(20px) saturate(1.3)', color: '#fff', fontFamily: SANS}}>
              <span style={{flex: 'none', width: 64, height: 64, borderRadius: 32, background: ROSE.grad, color: '#2a1206', fontWeight: 700, fontSize: 34, display: 'grid', placeItems: 'center'}}>{i + 1}</span>
              <span style={{fontWeight: 700, fontSize: 36, lineHeight: 1.15}}>{s.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- iris
export const Iris: React.FC<{fx: Of<'iris'>}> = ({fx}) => {
  const {a, t, abs, fps, len} = useSpan(fx);
  const {anchors} = useFxEnv();
  const {mode, holdRadius, color, word} = fx.props;
  const p = anchorPx(anchors, Math.round(abs * fps), fx.props.target);
  const FULL = 2300;
  let r = FULL;
  if (mode === 'close') r = tw(t, 0, len, FULL, 0, smooth);
  else if (mode === 'open') r = tw(t, 0, len, 0, FULL, smooth);
  else {
    const inEnd = Math.min(0.6, len * 0.3);
    const outStart = len - Math.min(0.6, len * 0.3);
    r = t < inEnd ? tw(t, 0, inEnd, FULL, holdRadius, easeOutC) : t > outStart ? tw(t, outStart, len, holdRadius, FULL, easeInC) : holdRadius + Math.sin((t - inEnd) * 3) * 6;
  }
  const held = mode === 'peek' ? tw(t, 0.5, 0.8) * (1 - tw(t, len - 0.8, len - 0.55)) : 0;
  void a;
  return (
    <div style={{...FILL, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: p.x - r, top: p.y - r, width: r * 2, height: r * 2, borderRadius: '50%', boxShadow: `0 0 0 3200px ${color}`}} />
      {r < FULL - 50 && r > 4 && <div style={{position: 'absolute', left: p.x - r - 5, top: p.y - r - 5, width: r * 2 + 10, height: r * 2 + 10, borderRadius: '50%', border: `5px solid ${ROSE.mid}`, boxSizing: 'border-box', opacity: 0.9}} />}
      {word && <div style={{position: 'absolute', left: 0, width: 1080, top: Math.min(1560, p.y + holdRadius + 90), textAlign: 'center', fontFamily: serifFamily, fontStyle: 'italic', fontWeight: 700, fontSize: 96, color: '#fff', opacity: held, transform: `translateY(${(1 - held) * 24}px)`}}>{word}</div>}
    </div>
  );
};

// ---------------------------------------------------------------- match cut
export const MatchCut: React.FC<{fx: Of<'match-cut'>}> = ({fx}) => {
  const {a, abs, fps, frame} = useSpan(fx);
  const {anchors} = useFxEnv();
  const cuts = fx.props.cuts;
  let cur = -1;
  cuts.forEach((c, i) => { if (abs >= c.at) cur = i; });
  if (cur < 0) return null;
  const c = cuts[cur];
  const cutFrame = Math.round((c.at - a) * fps);
  const since = frame - cutFrame;
  // her face is pinned to one spot for every cut, so only the framing jumps
  const p = anchorPx(anchors, Math.round(c.at * fps), 'head');
  const drift = 1 + 0.02 * Math.min(1, since / (fps * 1.2));
  return (
    <div style={{...FILL, overflow: 'hidden', background: '#000'}}>
      <div style={{...FILL, transformOrigin: `${p.x}px ${p.y}px`, transform: `translate(${540 - p.x}px, ${fx.props.faceY - p.y}px) scale(${c.zoom * drift})`, filter: c.mono ? 'grayscale(1) contrast(1.15)' : undefined}}>
        <Clip from={Math.round(a * fps)} />
      </div>
      {since < 2 && <div style={{...FILL, background: '#fff', opacity: since === 0 ? 0.85 : 0.35}} />}
      {c.word && (
        <div style={{position: 'absolute', left: 40, width: 1000, top: 1330, textAlign: 'center', fontFamily: heavyFamily, fontSize: Math.min(300, 1500 / Math.max(4, c.word.length)), lineHeight: 0.95, letterSpacing: 2, color: '#fff', textTransform: 'uppercase', textShadow: '0 6px 30px rgba(0,0,0,0.7)', transform: `scale(${since < 3 ? 1.12 - since * 0.04 : 1})`}}>{c.word}</div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------- demo cursor
export const DemoCursor: React.FC<{fx: Of<'demo-cursor'>}> = ({fx}) => {
  const {t, abs, inK, outK} = useSpan(fx);
  const {title, lines, button, doneLabel, src, y} = fx.props;
  const clickAt = fx.props.clickAt ?? fx.at + 1.9;
  const W = 900;
  const bodyH = src ? 560 : 150 + lines.length * 92;
  const [nx, ny] = fx.props.click ?? [0.5, 0];
  const bx = src ? nx * W : W / 2;
  const by = src ? 86 + ny * bodyH : 86 + bodyH - 76;
  const move = tw(abs, clickAt - 1.1, clickAt - 0.12, 0, 1, smooth);
  const cx = W + 80 + (bx - W - 80) * move;
  const cy = 86 + bodyH + 160 + (by - 86 - bodyH - 160) * move - Math.sin(move * Math.PI) * 90;
  const press = tw(abs, clickAt - 0.1, clickAt, 0, 1) * (1 - tw(abs, clickAt, clickAt + 0.18));
  const done = tw(abs, clickAt, clickAt + 0.3, 0, 1, pop);
  const ring = tw(abs, clickAt, clickAt + 0.5);
  return (
    <div style={{...FILL, perspective: 1800, opacity: outK}}>
      <div style={{position: 'absolute', left: (1080 - W) / 2, top: y, width: W, transform: `translateY(${(1 - inK) * 80}px) rotateX(${8 - 5 * inK}deg) rotateY(${-5 * (1 - inK) - 2}deg) scale(${0.92 + 0.08 * inK})`, opacity: inK, transformStyle: 'preserve-3d'}}>
        <div style={{borderRadius: 30, overflow: 'hidden', background: 'rgba(16,17,22,0.9)', border: '1.5px solid rgba(255,255,255,0.22)', boxShadow: '0 40px 100px rgba(0,0,0,0.6)', backdropFilter: 'blur(22px)', fontFamily: SANS, color: '#fff'}}>
          <div style={{height: 86, display: 'flex', alignItems: 'center', gap: 12, padding: '0 28px', background: 'rgba(255,255,255,0.07)', borderBottom: '1px solid rgba(255,255,255,0.1)'}}>
            {[C3.accent, ROSE.mid, '#9aa0a3'].map((c, i) => <span key={i} style={{width: 20, height: 20, borderRadius: 10, background: c}} />)}
            <span style={{marginLeft: 16, fontWeight: 700, fontSize: 30}}>{title}</span>
          </div>
          <div style={{position: 'relative', height: bodyH}}>
            {src ? (
              <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block'}} />
            ) : (
              <div style={{padding: '30px 34px 0'}}>
                {lines.map((l, i) => {
                  const lk = tw(t, 0.35 + i * 0.15, 0.65 + i * 0.15);
                  return (
                    <div key={i} style={{height: 72, marginBottom: 20, borderRadius: 18, background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', padding: '0 24px', fontWeight: 500, fontSize: 32, opacity: lk, transform: `translateX(${(1 - lk) * 24}px)`}}>{l}</div>
                  );
                })}
                <div style={{position: 'absolute', left: W / 2 - 230, top: bodyH - 122, width: 460, height: 92, borderRadius: 46, background: done > 0.5 ? ROSE.grad : C3.accent, color: done > 0.5 ? '#2a1206' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, fontWeight: 700, fontSize: 36, transform: `scale(${1 - 0.06 * press + 0.05 * done})`, boxShadow: '0 10px 26px rgba(0,0,0,0.4)'}}>
                  {done > 0.5 && <CheckMark size={38} color="#2a1206" />}
                  {done > 0.5 ? doneLabel : button}
                </div>
              </div>
            )}
          </div>
        </div>
        {ring > 0 && ring < 1 && <div style={{position: 'absolute', left: bx - 70 * ring - 6, top: by - 70 * ring - 6, width: 140 * ring + 12, height: 140 * ring + 12, borderRadius: '50%', border: `5px solid ${ROSE.light}`, boxSizing: 'border-box', opacity: 1 - ring}} />}
        <div style={{opacity: tw(abs, clickAt - 1.15, clickAt - 0.95)}}><Cursor x={cx} y={cy} press={press} /></div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- glass cards
const SPOTS: Record<'left' | 'right', [number, number][]> = {left: [[44, 300], [30, 1010], [70, 1420]], right: [[730, 330], [640, 1130], [600, 1500]]};
export const GlassCards: React.FC<{fx: Of<'glass-cards'>}> = ({fx}) => {
  const {t, abs, outK} = useSpan(fx);
  const used = {left: 0, right: 0};
  return (
    <div style={{...FILL, perspective: 1500, opacity: outK}}>
      {fx.props.cards.map((c, i) => {
        const side = c.side ?? (i % 2 ? 'right' : 'left');
        const [x, y] = c.x !== undefined && c.y !== undefined ? [c.x, c.y] : SPOTS[side][used[side]++ % 3];
        const k = tw(abs, c.at, c.at + 0.5, 0, 1, pop);
        const bob = Math.sin(t * 1.5 + i * 1.7) * 10;
        const sway = Math.sin(t * 1.1 + i) * 3;
        const sheen = ((t * 0.35 + i * 0.3) % 1.6) * 100 - 30;
        const dir = side === 'left' ? 1 : -1;
        return (
          <div key={i} style={{position: 'absolute', left: x, top: y + bob, minWidth: 300, maxWidth: 420, transform: `translate3d(${(1 - k) * -dir * 120}px, ${(1 - k) * 40}px, 0) rotateY(${dir * 14 + sway}deg) rotateX(${4}deg) scale(${0.8 + 0.2 * k})`, opacity: k, borderRadius: 28, padding: '24px 28px', overflow: 'hidden', background: 'linear-gradient(150deg, rgba(255,255,255,0.22), rgba(255,255,255,0.07))', border: '1.5px solid rgba(255,255,255,0.42)', boxShadow: '0 26px 60px rgba(0,0,0,0.42), inset 0 1px 0 rgba(255,255,255,0.5)', backdropFilter: 'blur(22px) saturate(1.5)', color: '#fff', fontFamily: SANS, textShadow: '0 2px 10px rgba(0,0,0,0.45)'}}>
            <div style={{position: 'absolute', left: `${sheen}%`, top: -20, width: 90, height: '160%', background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.22), rgba(255,255,255,0))', transform: 'rotate(18deg)'}} />
            <div style={{display: 'flex', alignItems: 'center', gap: 12, fontWeight: 700, fontSize: 24, letterSpacing: 3, textTransform: 'uppercase', opacity: 0.9}}>
              <span style={{width: 14, height: 14, borderRadius: 7, background: i % 2 ? ROSE.grad : C3.accent, boxShadow: `0 0 12px ${i % 2 ? ROSE.mid : C3.accent}`}} />
              {c.label}
            </div>
            {c.value && <div style={{fontWeight: 700, fontSize: 62, lineHeight: 1.1, marginTop: 6}}>{c.value}</div>}
            {c.bar !== undefined && (
              <div style={{height: 12, borderRadius: 6, background: 'rgba(255,255,255,0.22)', marginTop: 14, overflow: 'hidden'}}>
                <div style={{height: '100%', width: `${Math.max(0, Math.min(100, c.bar)) * tw(abs, c.at + 0.3, c.at + 1.2)}%`, borderRadius: 6, background: ROSE.grad}} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------- pixel monitor
export const PixelMonitor: React.FC<{fx: Of<'pixel-monitor'>}> = ({fx}) => {
  const {a, t, fps, len} = useSpan(fx);
  const {anchors} = useFxEnv();
  const {zoom, cell, holdSec, label} = fx.props;
  const k = 1 - tw(t, holdSec, len - 0.15, 0, 1, smooth);
  const p = anchorPx(anchors, Math.round(a * fps), 'head');
  const c = Math.max(2, Math.round(cell * k));
  const id = `px${String(fx.at).replace('.', '_')}`;
  const z = 1 + (zoom - 1) * k;
  const pitch = Math.max(6, c);
  if (k <= 0.001) return null;
  return (
    <div style={{...FILL, overflow: 'hidden', background: '#000', opacity: tw(t, len - 0.15, len, 1, 0)}}>
      <svg width={0} height={0} style={{position: 'absolute'}}>
        <filter id={id} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feFlood x={c / 2 - 1} y={c / 2 - 1} width={2} height={2} />
          <feComposite width={c} height={c} />
          <feTile result="grid" />
          <feComposite in="SourceGraphic" in2="grid" operator="in" />
          <feMorphology operator="dilate" radius={c / 2} />
        </filter>
      </svg>
      <div style={{...FILL, transformOrigin: `${p.x}px ${p.y}px`, transform: `scale(${z})`}}>
        <div style={{...FILL, filter: c > 2 ? `url(#${id}) saturate(${1 + 0.5 * k}) contrast(${1 + 0.2 * k})` : undefined}}>
          <Clip from={Math.round(a * fps)} />
        </div>
        {/* the screen's own grid: red, green and blue stripes plus dark gaps between rows */}
        <div style={{...FILL, mixBlendMode: 'multiply', opacity: Math.min(1, k * 1.3), backgroundImage: `repeating-linear-gradient(90deg, #ff5a5a 0, #ff5a5a ${pitch / 3}px, #5aff6e ${pitch / 3}px, #5aff6e ${(pitch * 2) / 3}px, #6a7bff ${(pitch * 2) / 3}px, #6a7bff ${pitch}px), repeating-linear-gradient(0deg, rgba(0,0,0,0) 0, rgba(0,0,0,0) ${pitch - 2}px, #000 ${pitch - 2}px, #000 ${pitch}px)`, backgroundBlendMode: 'multiply'}} />
      </div>
      <div style={{...FILL, background: `repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0, rgba(255,255,255,0.05) 2px, rgba(0,0,0,0) 2px, rgba(0,0,0,0) 6px)`, transform: `translateY(${(t * 60) % 6}px)`, opacity: k}} />
      <div style={{...FILL, background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.6) 100%)', opacity: k}} />
      {label && (
        <div style={{position: 'absolute', left: 54, top: 250, display: 'flex', alignItems: 'center', gap: 14, fontFamily: 'ui-monospace, Menlo, monospace', fontWeight: 700, fontSize: 40, color: '#fff', opacity: Math.min(1, k * 2), textShadow: '0 0 12px rgba(255,255,255,0.6)'}}>
          <span style={{width: 22, height: 22, borderRadius: 11, background: '#ff3b30', opacity: Math.floor(t * 2) % 2 ? 0.25 : 1}} />
          {label}
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------- slot machine
const FILLER = ['IDEAS', 'HOOKS', 'VIEWS', 'CLIPS', 'STORY', 'POSTS', 'REELS'];
export const SlotMachine: React.FC<{fx: Of<'slot-machine'>}> = ({fx}) => {
  const {t, abs, inK, outK} = useSpan(fx);
  const {words, label, y} = fx.props;
  const pool = fx.props.pool?.length ? fx.props.pool : FILLER;
  const n = words.length;
  const W = 940;
  const colW = (W - 60 - (n - 1) * 16) / n;
  const longest = Math.max(...words.map((w) => w.length), ...pool.map((w) => w.length));
  const fs = Math.min(120, (colW - 20) / (longest * 0.5));
  const H = 190;
  const stops = words.map((_, i) => fx.props.stopAt?.[i] ?? fx.at + 1.1 + i * 0.5);
  const allDone = tw(abs, stops[n - 1] + 0.05, stops[n - 1] + 0.4, 0, 1, pop);
  return (
    <div style={{...FILL, opacity: outK}}>
      <div style={{position: 'absolute', left: (1080 - W) / 2, top: y, width: W, transform: `translateY(${(1 - inK) * 60}px) scale(${0.94 + 0.06 * inK})`, opacity: inK}}>
        <div style={{borderRadius: 40, padding: 30, boxSizing: 'border-box', background: 'linear-gradient(170deg, rgba(44,46,56,0.9), rgba(12,13,17,0.94))', border: `2px solid rgba(${ROSE.glow},${0.45 + 0.55 * allDone})`, boxShadow: `0 30px 80px rgba(0,0,0,0.55), 0 0 ${60 * allDone}px rgba(${ROSE.glow},0.5)`, backdropFilter: 'blur(20px)'}}>
          {label && <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 26, letterSpacing: 5, textTransform: 'uppercase', ...ROSE_TEXT, textAlign: 'center', marginBottom: 20}}>{label}</div>}
          <div style={{display: 'flex', gap: 16}}>
            {words.map((w, i) => {
              const strip = [...Array.from({length: 9}, (_, j) => pool[(j * 3 + i * 2) % pool.length]), w];
              // spin fast, then ease onto the last word with a small overshoot
              const spin = tw(abs, fx.at + 0.2, stops[i], 0, 1, (x) => 1 - Math.pow(1 - x, 2.4));
              const settle = tw(abs, stops[i], stops[i] + 0.22, 0, 1);
              const pos = spin * (strip.length - 1) + Math.sin(settle * Math.PI) * 0.08;
              const moving = abs < stops[i] ? (1 - spin) * 14 : 0;
              const landed = abs >= stops[i];
              return (
                <div key={i} style={{width: colW, height: H, borderRadius: 24, overflow: 'hidden', position: 'relative', background: 'linear-gradient(180deg, #0a0a0c 0%, #26272e 50%, #0a0a0c 100%)', border: '1.5px solid rgba(255,255,255,0.16)'}}>
                  <div style={{transform: `translateY(${-pos * H}px)`, filter: moving > 0.6 ? `blur(${moving}px)` : undefined}}>
                    {strip.map((s, j) => (
                      <div key={j} style={{height: H, lineHeight: `${H}px`, textAlign: 'center', fontFamily: heavyFamily, fontSize: fs, letterSpacing: 1, textTransform: 'uppercase', ...(j === strip.length - 1 && landed ? {...ROSE_TEXT, filter: 'none', paddingRight: 0} : {color: '#fff'})}}>{s}</div>
                    ))}
                  </div>
                  <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 28%, rgba(0,0,0,0) 72%, rgba(0,0,0,0.7) 100%)'}} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div style={{display: 'none'}}>{t}</div>
    </div>
  );
};

// ---------------------------------------------------------------- hologram phone
export const HoloPhone: React.FC<{fx: Of<'holo-phone'>}> = ({fx}) => {
  const {t, frame, inK, outK} = useSpan(fx);
  const {side, title, lines, color, y} = fx.props;
  const right = side === 'right';
  const turn = (right ? -22 : 22) + Math.sin(t * 1.2) * 14;
  const flick = 0.86 + 0.14 * Math.sin(frame * 1.9) * Math.sin(frame * 0.37);
  const W = 380;
  const H = 780;
  const glow = `0 0 18px ${color}, 0 0 60px ${color}66`;
  const line: React.CSSProperties = {border: `3px solid ${color}`, boxShadow: `${glow}, inset 0 0 22px ${color}55`};
  return (
    <div style={{...FILL, perspective: 1500, opacity: outK}}>
      <div style={{position: 'absolute', [right ? 'right' : 'left']: 60, top: y, width: W, height: H + 200, opacity: inK * flick, transform: `translateY(${(1 - inK) * 60 + Math.sin(t * 1.7) * 10}px)`, transformStyle: 'preserve-3d'}}>
        {/* the light cone and its base ring */}
        <div style={{position: 'absolute', left: -40, top: H - 60, width: W + 80, height: 260, background: `linear-gradient(180deg, ${color}00 0%, ${color}44 100%)`, clipPath: 'polygon(18% 0, 82% 0, 62% 100%, 38% 100%)', filter: 'blur(6px)'}} />
        <div style={{position: 'absolute', left: W / 2 - 110, top: H + 150, width: 220, height: 50, borderRadius: '50%', ...line}} />
        <div style={{position: 'absolute', left: 0, top: 0, width: W, height: H, transform: `rotateY(${turn}deg) rotateX(6deg) scaleY(${0.2 + 0.8 * inK})`, transformStyle: 'preserve-3d'}}>
          {/* two shells a little apart give the phone thickness as it turns */}
          <div style={{position: 'absolute', inset: 0, borderRadius: 60, ...line, opacity: 0.45, transform: 'translateZ(-26px)'}} />
          <div style={{position: 'absolute', inset: 0, borderRadius: 60, ...line, background: `linear-gradient(180deg, ${color}40, ${color}1f)`, backdropFilter: 'blur(3px) brightness(0.8)', overflow: 'hidden'}}>
            <div style={{position: 'absolute', left: W / 2 - 60, top: 20, width: 120, height: 24, borderRadius: 12, border: `2px solid ${color}`}} />
            <div style={{position: 'absolute', left: 30, right: 30, top: 80, fontFamily: SANS, fontWeight: 700, fontSize: 30, letterSpacing: 4, textTransform: 'uppercase', color: '#fff', textShadow: glow}}>{title}</div>
            <div style={{position: 'absolute', left: 30, right: 30, top: 140, height: 250, borderRadius: 26, border: `2px solid ${color}`, background: `${color}18`}}>
              <div style={{position: 'absolute', left: '50%', top: '50%', transform: 'translate(-40%,-50%)', width: 0, height: 0, borderTop: '26px solid transparent', borderBottom: '26px solid transparent', borderLeft: `44px solid ${color}`, filter: `drop-shadow(0 0 10px ${color})`}} />
            </div>
            {lines.map((l, i) => {
              const lk = tw(t, 0.7 + i * 0.22, 1.0 + i * 0.22);
              return <div key={i} style={{position: 'absolute', left: 30, right: 30, top: 420 + i * 82, padding: '14px 18px', borderRadius: 18, border: `1.5px solid ${color}aa`, fontFamily: SANS, fontWeight: 700, fontSize: 28, color: '#fff', background: `${color}22`, textShadow: glow, opacity: lk, transform: `translateX(${(1 - lk) * 20}px)`}}>{l}</div>;
            })}
            <div style={{position: 'absolute', inset: 0, backgroundImage: `repeating-linear-gradient(0deg, ${color}33 0, ${color}33 2px, transparent 2px, transparent 7px)`, transform: `translateY(${(frame * 1.2) % 7}px)`}} />
            <div style={{position: 'absolute', left: 0, right: 0, top: `${((t * 0.45) % 1.2) * 100 - 10}%`, height: 60, background: `linear-gradient(180deg, transparent, ${color}66, transparent)`}} />
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- silhouette shift (behind her: the plate, and the cutout's own style)
const shiftK = (fx: Of<'silhouette-shift'>, abs: number) => {
  const [a, b] = fxRange(fx);
  const revealAt = fx.props.revealAt ?? b - 1.1;
  return {a, b, revealAt, dark: tw(abs, a, a + 0.35, 0, 1, smooth) * (1 - tw(abs, revealAt, revealAt + 0.5, 0, 1, smooth)), plate: tw(abs, a, a + 0.3) * (1 - tw(abs, b - 0.4, b))};
};
export const silhouetteCutout = (fx: Of<'silhouette-shift'>, abs: number): React.CSSProperties => {
  const {dark, revealAt} = shiftK(fx, abs);
  const flash = tw(abs, revealAt, revealAt + 0.15) * (1 - tw(abs, revealAt + 0.15, revealAt + 0.7));
  return {filter: `brightness(${1 - dark + flash * 0.5}) contrast(${1 + dark * 0.4}) drop-shadow(0 0 ${30 * flash}px rgba(255,243,201,${flash}))`};
};
export const SilhouettePlate: React.FC<{fx: Of<'silhouette-shift'>}> = ({fx}) => {
  const {abs} = useFxTime(fx.at);
  const {plate, dark, revealAt, a} = shiftK(fx, abs);
  const {from, to} = fx.props;
  void a;
  const sweep = tw(abs, revealAt - 0.1, revealAt + 0.7);
  return (
    <div style={{...FILL, opacity: plate, overflow: 'hidden', background: `linear-gradient(180deg, ${from} 0%, ${to} 100%)`}}>
      <div style={{position: 'absolute', left: 240, top: 220, width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 70%)', opacity: 0.5 + 0.5 * dark}} />
      <div style={{position: 'absolute', left: -400 + sweep * 1900, top: -200, width: 300, height: 2400, background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.7), rgba(255,255,255,0))', transform: 'rotate(14deg)', opacity: sweep > 0 && sweep < 1 ? 1 : 0}} />
    </div>
  );
};

/** the word sits in front of her, low in the frame, so her silhouette never hides it */
export const SilhouetteWord: React.FC<{fx: Of<'silhouette-shift'>}> = ({fx}) => {
  const {abs} = useFxTime(fx.at);
  const {a, revealAt} = shiftK(fx, abs);
  const word = fx.props.word;
  if (!word) return null;
  const wk = tw(abs, a + 0.3, a + 0.7, 0, 1, pop) * (1 - tw(abs, revealAt + 0.25, revealAt + 0.6));
  return <div style={{...FILL, top: 1330, height: 400, textAlign: 'center', fontFamily: heavyFamily, fontSize: Math.min(360, 1700 / Math.max(3, word.length)), lineHeight: 1, color: '#fff', textTransform: 'uppercase', opacity: wk, transform: `scale(${0.8 + 0.2 * wk})`, textShadow: '0 8px 40px rgba(0,0,0,0.6)'}}>{word}</div>;
};
export const thirteenthFront = (fx: Fx): React.ReactNode => (fx.type === 'silhouette-shift' ? <SilhouetteWord fx={fx} /> : null);
export const thirteenthPlate = (fx: Fx): React.ReactNode => (fx.type === 'silhouette-shift' ? <SilhouettePlate fx={fx} /> : null);
export const thirteenthOver = (fx: Fx): React.ReactNode => {
  switch (fx.type) {
    case 'shoulder-steps': return <ShoulderSteps fx={fx} />;
    case 'iris': return <Iris fx={fx} />;
    case 'match-cut': return <MatchCut fx={fx} />;
    case 'demo-cursor': return <DemoCursor fx={fx} />;
    case 'glass-cards': return <GlassCards fx={fx} />;
    case 'pixel-monitor': return <PixelMonitor fx={fx} />;
    case 'slot-machine': return <SlotMachine fx={fx} />;
    case 'holo-phone': return <HoloPhone fx={fx} />;
    default: return null;
  }
};
