import React from 'react';
import {C, SANS} from './kit';

/** Shared line-art props for the November explainers. All are drawn around (x, y), scaled by `s`. */
type P = {x?: number; y?: number; s?: number; opacity?: number};
const W = (x: number, y: number, s: number, o: number, children: React.ReactNode) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    {children}
  </g>
);
const st = {fill: '#FFFFFF', stroke: C.ink, strokeWidth: 6, strokeLinecap: 'round', strokeLinejoin: 'round'} as const;

export const Bot: React.FC<P & {blink?: boolean}> = ({x = 0, y = 0, s = 1, opacity = 1, blink}) =>
  W(x, y, s, opacity, (
    <>
      <line x1={0} y1={-62} x2={0} y2={-44} stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
      <circle cx={0} cy={-68} r={8} fill={C.crimson} />
      <rect x={-48} y={-44} width={96} height={78} rx={22} {...st} />
      <circle cx={-18} cy={-8} r={7} fill={C.ink} />
      <circle cx={18} cy={-8} r={7} fill={C.ink} />
      <path d={blink ? 'M -16 14 L 16 14' : 'M -18 12 Q 0 26 18 12'} fill="none" stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
      <rect x={-30} y={38} width={60} height={22} rx={8} {...st} />
    </>
  ));

export const Cloud: React.FC<P & {rain?: number}> = ({x = 0, y = 0, s = 1, opacity = 1, rain = 0}) =>
  W(x, y, s, opacity, (
    <>
      <path d="M -52 14 Q -74 14 -70 -8 Q -66 -28 -40 -26 Q -34 -52 -4 -50 Q 26 -50 32 -26 Q 62 -28 64 -2 Q 66 14 44 14 Z" {...st} />
      {[-30, -4, 22].map((dx, k) => (
        <line key={k} x1={dx} y1={28 + ((rain * 40 + k * 14) % 40) * 0.3} x2={dx - 6} y2={42 + ((rain * 40 + k * 14) % 40) * 0.3} stroke={C.mid} strokeWidth={6} strokeLinecap="round" />
      ))}
    </>
  ));

export const Receipt: React.FC<P> = ({x = 0, y = 0, s = 1, opacity = 1}) =>
  W(x, y, s, opacity, (
    <>
      <path d="M -44 -62 L 44 -62 L 44 62 L 30 52 L 15 62 L 0 52 L -15 62 L -30 52 L -44 62 Z" {...st} />
      <text y={-14} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={44} fill={C.ink}>
        $
      </text>
      <line x1={-26} y1={12} x2={26} y2={12} stroke={C.soft} strokeWidth={7} strokeLinecap="round" />
      <line x1={-26} y1={30} x2={10} y2={30} stroke={C.soft} strokeWidth={7} strokeLinecap="round" />
    </>
  ));

export const Clock: React.FC<P & {hand?: number}> = ({x = 0, y = 0, s = 1, opacity = 1, hand = 0.2}) => {
  const a = hand * Math.PI * 2 - Math.PI / 2;
  return W(x, y, s, opacity, (
    <>
      <circle r={50} {...st} />
      <line x1={0} y1={0} x2={Math.cos(a) * 34} y2={Math.sin(a) * 34} stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
      <line x1={0} y1={0} x2={0} y2={-24} stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
      <circle r={5} fill={C.ink} />
    </>
  ));
};

export const Magnifier: React.FC<P> = ({x = 0, y = 0, s = 1, opacity = 1}) =>
  W(x, y, s, opacity, (
    <>
      <circle r={44} fill="rgba(255,255,255,0.35)" stroke={C.ink} strokeWidth={8} />
      <line x1={32} y1={32} x2={74} y2={74} stroke={C.ink} strokeWidth={13} strokeLinecap="round" />
    </>
  ));

export const ThumbsUp: React.FC<P & {color?: string}> = ({x = 0, y = 0, s = 1, opacity = 1, color = C.crimson}) =>
  W(x, y, s, opacity, (
    <>
      <rect x={-44} y={-4} width={20} height={44} rx={5} fill={color} />
      <path d="M -18 38 L -18 -2 L 6 -34 Q 16 -42 22 -32 Q 24 -20 16 -6 L 40 -6 Q 52 -4 50 8 L 44 32 Q 42 40 32 40 Z" fill="#FFFFFF" stroke={color} strokeWidth={6} strokeLinejoin="round" />
    </>
  ));

/** a vertical meter that fills from the bottom */
export const Meter: React.FC<P & {h?: number; level?: number; label?: string}> = ({x = 0, y = 0, s = 1, opacity = 1, h = 300, level = 0}) =>
  W(x, y, s, opacity, (
    <>
      <rect x={-26} y={-h} width={52} height={h} rx={26} {...st} />
      <rect x={-18} y={-h * level + 8 - 8 + (level > 0 ? 0 : h)} width={36} height={h * level - (level > 0 ? 8 : 0)} rx={18} fill={C.crimson} opacity={level > 0 ? 1 : 0} transform={`translate(0 ${-8})`} />
    </>
  ));

export const Calendar: React.FC<P & {shade?: number[]; cols?: number; rows?: number; w?: number; h?: number}> = ({x = 0, y = 0, s = 1, opacity = 1, shade = [], cols = 7, rows = 4, w = 280, h = 200}) =>
  W(x, y, s, opacity, (
    <>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={16} {...st} />
      <rect x={-w / 2} y={-h / 2} width={w} height={36} rx={16} fill={C.ink} />
      <rect x={-w / 2} y={-h / 2 + 22} width={w} height={14} fill={C.ink} />
      {Array.from({length: rows * cols}).map((_, i) => {
        const cx = -w / 2 + 20 + (i % cols) * ((w - 40) / (cols - 1));
        const cy = -h / 2 + 62 + Math.floor(i / cols) * ((h - 84) / (rows - 1));
        return shade.includes(i) ? <rect key={i} x={cx - 14} y={cy - 11} width={28} height={22} rx={5} fill={C.crimson} opacity={0.9} /> : <circle key={i} cx={cx} cy={cy} r={5} fill={C.soft} />;
      })}
    </>
  ));

/** a blank name tag on a lanyard */
export const NameTag: React.FC<P> = ({x = 0, y = 0, s = 1, opacity = 1}) =>
  W(x, y, s, opacity, (
    <>
      <rect x={-34} y={-22} width={68} height={44} rx={8} {...st} />
      <line x1={-20} y1={0} x2={20} y2={0} stroke={C.soft} strokeWidth={7} strokeLinecap="round" />
      <line x1={-20} y1={10} x2={6} y2={10} stroke={C.soft} strokeWidth={5} strokeLinecap="round" />
    </>
  ));

export const Envelope: React.FC<P> = ({x = 0, y = 0, s = 1, opacity = 1}) =>
  W(x, y, s, opacity, (
    <>
      <rect x={-56} y={-38} width={112} height={76} rx={10} {...st} />
      <path d="M -56 -30 L 0 10 L 56 -30" fill="none" stroke={C.ink} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
    </>
  ));

export const Megaphone: React.FC<P> = ({x = 0, y = 0, s = 1, opacity = 1}) =>
  W(x, y, s, opacity, (
    <>
      <path d="M -50 -20 L 20 -56 L 20 56 L -50 20 Z" {...st} />
      <rect x={-72} y={-20} width={26} height={40} rx={8} {...st} />
      <path d="M -40 24 L -28 62 L -6 62 L -14 32" {...st} />
      <path d="M 40 -22 Q 60 0 40 22 M 56 -40 Q 88 0 56 40" fill="none" stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
    </>
  ));

export const Lantern: React.FC<P & {glow?: number}> = ({x = 0, y = 0, s = 1, opacity = 1, glow = 1}) =>
  W(x, y, s, opacity, (
    <>
      <circle r={70} fill={C.crimson} opacity={0.12 * glow} />
      <line x1={0} y1={-64} x2={0} y2={-48} stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
      <path d="M -20 -48 L 20 -48 L 30 -36 L -30 -36 Z" fill={C.ink} />
      <rect x={-30} y={-36} width={60} height={68} rx={12} {...st} />
      <ellipse cx={0} cy={-2} rx={11} ry={16} fill={C.crimson} />
      <rect x={-34} y={32} width={68} height={12} rx={6} fill={C.ink} />
    </>
  ));

export const Globe: React.FC<P> = ({x = 0, y = 0, s = 1, opacity = 1}) =>
  W(x, y, s, opacity, (
    <>
      <circle r={78} {...st} />
      <ellipse rx={32} ry={78} fill="none" stroke={C.ink} strokeWidth={5} />
      <line x1={-78} y1={0} x2={78} y2={0} stroke={C.ink} strokeWidth={5} />
      <path d="M -66 -38 Q 0 -22 66 -38 M -66 38 Q 0 22 66 38" fill="none" stroke={C.ink} strokeWidth={5} />
    </>
  ));
