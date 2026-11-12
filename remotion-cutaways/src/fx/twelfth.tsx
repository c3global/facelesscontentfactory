import React from 'react';
import {useVideoConfig} from 'remotion';
import {serifFamily} from '../fonts';
import {Cutout} from './behind';
import {Label, NoteInk, Panel, Scrim, Title, noteBox} from './eleventh';
import {useSpan} from './fourth';
import type {Fx} from './schema';
import {C3} from './theme';
import {anchorPx, pop, tw, useFxEnv} from './util';

/**
 * Twelfth FX batch (beta 11): second versions. Each one is the same effect with the same timing props and a newer look,
 * switched on with `version: 2` in its props. The originals stay the default and are never replaced.
 *   odometer v2         the rolling number on a frosted proof card
 *   chart-grow v2       a glowing line on a frosted card, the end dot pulses
 *   pointer-callout v2  handwritten notes with arrows that follow her
 *   clone v2            the copies fan out in a row behind her, on her words
 */
type Of<T extends Fx['type']> = Extract<Fx, {type: T}>;
const FILL: React.CSSProperties = {position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, pointerEvents: 'none'};
const SANS = C3.sans;

// ---------------------------------------------------------------- odometer v2: digits roll on a proof card, an underline draws in
const Roll: React.FC<{pos: number; h: number; dim: boolean}> = ({pos, h, dim}) => (
  <div style={{height: h, width: h * 0.6, overflow: 'hidden', position: 'relative', opacity: dim ? 0.28 : 1}}>
    <div style={{transform: `translateY(${-pos * h}px)`}}>
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((d, i) => (
        <div key={i} style={{height: h, lineHeight: `${h}px`, textAlign: 'center'}}>{d}</div>
      ))}
    </div>
  </div>
);
export const OdometerV2: React.FC<{fx: Of<'odometer'>}> = ({fx}) => {
  const {t, inK, outK} = useSpan(fx);
  const {from, to, prefix, suffix, label, sub} = fx.props;
  const y = fx.props.y ?? 1100;
  const v = from + (to - from) * tw(t, 0.3, 2.2, 0, 1, (x) => 1 - Math.pow(1 - x, 3));
  const places = String(Math.round(Math.max(Math.abs(to), Math.abs(from)))).length;
  const h = Math.min(190, 760 / (places * 0.6 + Math.floor((places - 1) / 3) * 0.3 + (prefix.length + suffix.length) * 0.62));
  const done = tw(t, 2.1, 2.6);
  return (
    <>
      <Scrim fx={fx} top={y} />
      <div style={FILL}>
        <Panel y={y} k={inK} out={outK}>
          {label && <Label text={label} />}
          <div style={{display: 'flex', alignItems: 'center', fontWeight: 700, fontSize: h * 0.9, letterSpacing: -2, marginTop: 6}}>
            {prefix && <span style={{marginRight: 8}}>{prefix}</span>}
            {Array.from({length: places}).map((_, i) => {
              const unit = Math.pow(10, places - 1 - i);
              const x = Math.abs(v) / unit;
              const whole = Math.floor(x);
              const pos = unit === 1 ? x % 10 : (whole % 10) + Math.max(0, (x - whole - 0.9) * 10);
              const comma = (places - i) % 3 === 0 && i > 0;
              return (
                <React.Fragment key={i}>
                  {comma && <span style={{opacity: Math.abs(v) >= unit * 10 ? 1 : 0.28}}>,</span>}
                  <Roll pos={pos} h={h} dim={Math.abs(v) < unit && unit > 1} />
                </React.Fragment>
              );
            })}
            {suffix && <span style={{marginLeft: 10}}>{suffix}</span>}
          </div>
          <div style={{height: 7, borderRadius: 4, background: C3.copper, width: `${done * 100}%`, maxWidth: 620, marginTop: 10}} />
          {sub && <div style={{fontFamily: serifFamily, fontStyle: 'italic', fontSize: 44, marginTop: 18, opacity: tw(t, 2.3, 2.7) * 0.9}}>{sub}</div>}
        </Panel>
      </div>
    </>
  );
};

// ---------------------------------------------------------------- chart-grow v2: a glowing line draws itself, the end label lands with the dot
export const ChartGrowV2: React.FC<{fx: Of<'chart-grow'>}> = ({fx}) => {
  const {t, inK, outK} = useSpan(fx);
  const {points, label, endLabel} = fx.props;
  const y = fx.props.y ?? 1080;
  const W = 828;
  const H = 320;
  const mx = Math.max(...points);
  const mn = Math.min(...points);
  const pts = points.map((p, i) => [(i / (points.length - 1)) * W, H - 24 - ((p - mn) / Math.max(1e-6, mx - mn)) * (H - 60)]);
  const d = pts.map((p, i) => `${i ? 'L' : 'M'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  const k = tw(t, 0.4, 2.1, 0, 1, (x) => x * (2 - x));
  const end = pts[pts.length - 1];
  const land = tw(t, 2.0, 2.35, 0, 1, pop);
  const id = `cg2${String(fx.at).replace('.', '_')}`;
  return (
    <>
      <Scrim fx={fx} top={y} />
      <div style={FILL}>
        <Panel y={y} k={inK} out={outK}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', minHeight: 96}}>
            {label ? <Label text={label} /> : <span />}
            {endLabel && <div style={{fontWeight: 700, fontSize: 92, lineHeight: 0.9, color: C3.goldBright, transform: `scale(${land})`, transformOrigin: '100% 50%', opacity: Math.min(1, land * 2)}}>{endLabel}</div>}
          </div>
          <svg width={W} height={H} style={{overflow: 'visible', marginTop: 14, display: 'block'}}>
            <defs>
              <linearGradient id={id} x1="0" x2="1">
                <stop offset="0" stopColor={C3.accent} />
                <stop offset="1" stopColor={C3.goldBright} />
              </linearGradient>
              <linearGradient id={`${id}a`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor={C3.gold} stopOpacity="0.32" />
                <stop offset="1" stopColor={C3.gold} stopOpacity="0" />
              </linearGradient>
              <filter id={`${id}g`} x="-10%" y="-30%" width="120%" height="160%"><feGaussianBlur stdDeviation="6" /></filter>
            </defs>
            {[0.25, 0.5, 0.75, 1].map((g) => (
              <line key={g} x1={0} x2={W} y1={H * g} y2={H * g} stroke="rgba(255,255,255,0.09)" strokeWidth={2} />
            ))}
            <path d={`${d} L ${W} ${H} L 0 ${H} Z`} fill={`url(#${id}a)`} style={{clipPath: `inset(0 ${(1 - k) * 100}% 0 0)`}} />
            <path d={d} fill="none" stroke={`url(#${id})`} strokeWidth={14} opacity={0.5} filter={`url(#${id}g)`} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - k} />
            <path d={d} fill="none" stroke={`url(#${id})`} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - k} />
            {k > 0.98 && <circle cx={end[0]} cy={end[1]} r={13 + 3 * Math.sin(t * 6)} fill="#fff" stroke={C3.gold} strokeWidth={4} />}
          </svg>
        </Panel>
      </div>
    </>
  );
};

// ---------------------------------------------------------------- pointer-callout v2: handwritten notes, each arrow follows her
export const PointerCalloutV2: React.FC<{fx: Of<'pointer-callout'>}> = ({fx}) => {
  const {abs, fps, outK} = useSpan(fx);
  const {anchors} = useFxEnv();
  const {cards, size} = fx.props;
  return (
    <div style={{...FILL, opacity: outK}}>
      {cards.map((c, i) => {
        const p = anchorPx(anchors, Math.round(abs * fps), c.target);
        const left = i % 2 === 0;
        const {bw, bh} = noteBox(c.text, size);
        const x = left ? 56 : 1080 - 56 - bw;
        const y = 290 + i * 250;
        // stop the arrow short of the point so the tip sits beside her, not on her face
        const dx = p.x - (x + bw / 2);
        const dy = p.y - (y + bh / 2);
        const dist = Math.max(1, Math.hypot(dx, dy));
        const short = Math.min(70, dist * 0.25);
        const to: [number, number] = [p.x - (dx / dist) * short, p.y - (dy / dist) * short];
        return <NoteInk key={i} text={c.text} x={x} y={y} to={to} from={left ? 'right' : 'left'} snug size={size} w={tw(abs, c.at, c.at + 0.55)} k={tw(abs, c.at + 0.4, c.at + 0.85)} />;
      })}
    </div>
  );
};

// ---------------------------------------------------------------- clone v2: copies fan out in a row behind her, each on its own second
export const CloneFan: React.FC<{fx: Of<'clone'>}> = ({fx}) => {
  const {abs, a, outK} = useSpan(fx);
  const {fps} = useVideoConfig();
  const seen = {left: 0, right: 0};
  const copies = fx.props.copies.map((c) => ({...c, rank: ++seen[c.side]})).sort((p, q) => q.rank - p.rank);
  return (
    <>
      {copies.map((c, i) => {
        const k = tw(abs, c.at, c.at + 0.4, 0, 1, pop) * outK;
        if (k <= 0.01) return null;
        const dir = c.side === 'left' ? -1 : 1;
        const scale = Math.pow(0.82, c.rank);
        const dx = dir * (c.rank * 250 - (c.rank - 1) * c.rank * 18) * k;
        return <Cutout key={i} plain from={Math.round(a * fps)} style={{transformOrigin: '50% 100%', transform: `translateX(${dx}px) rotate(${dir * c.rank * 3.5 * k}deg) scale(${scale})`, opacity: Math.min(1, k * 1.4), filter: `brightness(${1 - c.rank * 0.12})`}} />;
      })}
    </>
  );
};
