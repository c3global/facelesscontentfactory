import React from 'react';
import {Easing, interpolate} from 'remotion';
import {sansFamily} from '../fonts';

/** Shared palette and small helpers for the stick-figure explainers. White field, black line work. */
export const C = {ink: '#000000', cast: '#3A3F42', crimson: '#C91B19', soft: '#D9DCDE', mid: '#9BA1A5', white: '#FFFFFF'} as const;
export const SANS = sansFamily('DM Sans');

export const ease = Easing.bezier(0.16, 1, 0.3, 1);
export const clampX = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
/** 0 to 1 over `d` seconds starting at `a`. */
export const prog = (t: number, a: number, d = 0.5, e: (x: number) => number = ease) => interpolate(t, [a, a + d], [0, 1], {...clampX, easing: e});
/** 1 between a and b, with `f` seconds of fade at both ends. */
export const between = (t: number, a: number, b: number, f = 0.25) => Math.min(prog(t, a, f, (x) => x), 1 - prog(t, b, f, (x) => x));
export const bounce = Easing.out(Easing.back(1.8));

/** A task card: checkbox plus a label (or two grey lines when blank). */
export const Card: React.FC<{
  x: number;
  y: number;
  w?: number;
  h?: number;
  rot?: number;
  label?: string;
  opacity?: number;
  scale?: number;
  check?: number;
  accent?: boolean;
}> = ({x, y, w = 400, h = 72, rot = 0, label, opacity = 1, scale = 1, check = 0, accent = false}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale})`} opacity={opacity}>
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={16} fill="#FFFFFF" stroke={C.ink} strokeWidth={5} />
    <rect x={-w / 2 + 18} y={-13} width={26} height={26} rx={6} fill="none" stroke={accent ? C.crimson : C.ink} strokeWidth={4} />
    {check > 0 && (
      <path d={`M ${-w / 2 + 23} 0 L ${-w / 2 + 29} 7 L ${-w / 2 + 40} -9`} fill="none" stroke={C.crimson} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={40} strokeDashoffset={40 * (1 - check)} />
    )}
    {label ? (
      <text x={-w / 2 + 62} y={10} fontFamily={SANS} fontWeight={700} fontSize={28} fill={C.ink}>
        {label}
      </text>
    ) : (
      <>
        <line x1={-w / 2 + 62} y1={-8} x2={w / 2 - 28} y2={-8} stroke={C.soft} strokeWidth={8} strokeLinecap="round" />
        <line x1={-w / 2 + 62} y1={12} x2={w / 2 - 90} y2={12} stroke={C.soft} strokeWidth={8} strokeLinecap="round" />
      </>
    )}
  </g>
);

const JIT_X = [0, 9, -8, 6, -10, 4, -5, 8];
const JIT_R = [0, 2.2, -2, 1.4, -2.6, 1.8, -1.2, 2.4];
/** Position of card number i in a stack that grows upward from baseY. */
export const stackAt = (i: number, cx: number, baseY: number, gap = 74) => ({x: cx + JIT_X[i % 8], y: baseY - i * gap, rot: JIT_R[i % 8]});

export const Window: React.FC<{x: number; y: number; w: number; h: number; title?: string; opacity?: number; dim?: number}> = ({x, y, w, h, title, opacity = 1, dim = 0}) => (
  <g opacity={opacity}>
    <rect x={x} y={y} width={w} height={h} rx={26} fill="#FFFFFF" stroke={dim ? C.mid : C.ink} strokeWidth={5} />
    <line x1={x} y1={y + 58} x2={x + w} y2={y + 58} stroke={dim ? C.mid : C.ink} strokeWidth={5} />
    {[0, 1, 2].map((k) => (
      <circle key={k} cx={x + 34 + k * 30} cy={y + 29} r={8} fill="none" stroke={dim ? C.mid : C.ink} strokeWidth={4} />
    ))}
    {title && (
      <text x={x + w - 28} y={y + 38} textAnchor="end" fontFamily={SANS} fontWeight={700} fontSize={22} letterSpacing={2} fill={dim ? C.mid : C.ink}>
        {title}
      </text>
    )}
  </g>
);

export const Chair: React.FC<{x: number; y: number; s?: number; opacity?: number; dashed?: boolean}> = ({x, y, s = 1, opacity = 1, dashed = true}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity} fill="none" stroke={C.ink} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={dashed ? '12 12' : undefined}>
    <rect x={-42} y={-150} width={84} height={92} rx={12} />
    <rect x={-58} y={-46} width={116} height={28} rx={10} />
    <path d="M -46 -18 L -46 62 M 46 -18 L 46 62" />
  </g>
);

export const Gauge: React.FC<{x: number; y: number; h?: number; level: number; limit: number; opacity?: number; label?: string}> = ({x, y, h = 300, level, limit, opacity = 1, label}) => (
  <g opacity={opacity}>
    <rect x={x - 28} y={y - h} width={56} height={h} rx={28} fill="#FFFFFF" stroke={C.ink} strokeWidth={5} />
    <rect x={x - 17} y={y - 11 - (h - 22) * level} width={34} height={(h - 22) * level} rx={17} fill={level > limit ? C.crimson : C.ink} />
    <line x1={x - 46} y1={y - 11 - (h - 22) * limit} x2={x + 46} y2={y - 11 - (h - 22) * limit} stroke={C.ink} strokeWidth={5} strokeDasharray="10 8" />
    {label && (
      <text x={x} y={y + 40} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={22} letterSpacing={2} fill={C.ink}>
        {label}
      </text>
    )}
  </g>
);

export const Tag: React.FC<{x: number; y: number; text: string; opacity?: number; fill?: string; color?: string; size?: number}> = ({x, y, text, opacity = 1, fill = C.ink, color = '#FFFFFF', size = 24}) => {
  const w = text.length * size * 0.78 + 44;
  return (
    <g opacity={opacity}>
      <rect x={x - w / 2} y={y - size * 0.95} width={w} height={size * 1.9} rx={size * 0.95} fill={fill} />
      <text x={x} y={y + size * 0.36} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={size} letterSpacing={2.5} fill={color}>
        {text}
      </text>
    </g>
  );
};

export const Cross: React.FC<{x: number; y: number; r?: number; p: number}> = ({x, y, r = 34, p}) => (
  <g opacity={Math.min(1, p * 3)} transform={`translate(${x} ${y})`}>
    <circle r={r + 14} fill="#FFFFFF" stroke={C.crimson} strokeWidth={7} />
    <path d={`M ${-r * 0.55} ${-r * 0.55} L ${r * 0.55} ${r * 0.55} M ${r * 0.55} ${-r * 0.55} L ${-r * 0.55} ${r * 0.55}`} stroke={C.crimson} strokeWidth={9} strokeLinecap="round" strokeDasharray={90} strokeDashoffset={90 * (1 - p)} />
  </g>
);

export const Dots: React.FC<{x: number; y: number; t: number}> = ({x, y, t}) => (
  <g>
    {[0, 1, 2].map((k) => (
      <circle key={k} cx={x + k * 26} cy={y - Math.max(0, Math.sin(t * 5 - k * 0.8)) * 7} r={8} fill={C.ink} />
    ))}
  </g>
);

export const Bubble: React.FC<{x: number; y: number; w: number; h: number; opacity?: number; children?: React.ReactNode}> = ({x, y, w, h, opacity = 1, children}) => (
  <g opacity={opacity}>
    <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={h / 2} fill="#FFFFFF" stroke={C.ink} strokeWidth={5} />
    {children}
  </g>
);

/** A white board with a soft offset shadow: the "chart space" behind a diagram. */
export const Panel: React.FC<{x: number; y: number; w: number; h: number; opacity?: number}> = ({x, y, w, h, opacity = 1}) => (
  <g opacity={opacity}>
    <rect x={x + 12} y={y + 14} width={w} height={h} rx={34} fill={C.soft} />
    <rect x={x} y={y} width={w} height={h} rx={34} fill="#FFFFFF" stroke={C.ink} strokeWidth={5} />
  </g>
);
