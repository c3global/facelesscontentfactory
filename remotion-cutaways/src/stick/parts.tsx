import React from 'react';
import {C, SANS} from './kit';

/** Small line icons shared by the explainers. All are centred on (0,0) and sized for a 1000 x 700 stage. */
const line = {fill: 'none', stroke: C.ink, strokeLinecap: 'round', strokeLinejoin: 'round'} as const;

export const Target: React.FC<{s?: number; accent?: boolean}> = ({s = 1, accent}) => (
  <g transform={`scale(${s})`} {...line}>
    <circle r={40} strokeWidth={6} fill="#FFFFFF" />
    <circle r={25} strokeWidth={6} />
    <circle r={9} strokeWidth={6} fill={accent ? C.crimson : C.ink} stroke={accent ? C.crimson : C.ink} />
  </g>
);

export const Book: React.FC<{s?: number}> = ({s = 1}) => (
  <g transform={`scale(${s})`} {...line} strokeWidth={6}>
    <path d="M 0 -26 Q -26 -38 -52 -30 L -52 28 Q -26 20 0 32 Z" fill="#FFFFFF" />
    <path d="M 0 -26 Q 26 -38 52 -30 L 52 28 Q 26 20 0 32 Z" fill="#FFFFFF" />
    <path d="M -38 -10 Q -26 -14 -14 -10 M -38 6 Q -26 2 -14 6 M 14 -10 Q 26 -14 38 -10 M 14 6 Q 26 2 38 6" strokeWidth={4} />
  </g>
);

export const Bulb: React.FC<{s?: number}> = ({s = 1}) => (
  <g transform={`scale(${s})`} {...line} strokeWidth={6}>
    <circle cy={-8} r={30} fill="#FFFFFF" />
    <path d="M -14 22 L 14 22 M -10 34 L 10 34" />
    <path d="M 0 -62 L 0 -74 M -44 -40 L -54 -48 M 44 -40 L 54 -48" strokeWidth={5} />
  </g>
);

export const Heart: React.FC<{s?: number}> = ({s = 1}) => (
  <g transform={`scale(${s})`} {...line} strokeWidth={6}>
    <path d="M 0 30 C -52 -6 -34 -46 -4 -26 L 0 -20 L 4 -26 C 34 -46 52 -6 0 30 Z" fill="#FFFFFF" />
  </g>
);

export const Shield: React.FC<{s?: number}> = ({s = 1}) => (
  <g transform={`scale(${s})`} {...line} strokeWidth={7}>
    <path d="M 0 -50 L 40 -34 L 40 8 Q 40 40 0 58 Q -40 40 -40 8 L -40 -34 Z" fill="#FFFFFF" />
    <path d="M 0 -30 L 0 38" strokeWidth={4} stroke={C.soft} />
  </g>
);

export const Coin: React.FC<{x?: number; y?: number; s?: number; opacity?: number}> = ({x = 0, y = 0, s = 1, opacity = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity} {...line}>
    <circle r={22} strokeWidth={5} fill="#FFFFFF" />
    <circle r={12} strokeWidth={3} stroke={C.mid} />
  </g>
);

/** A building block; `unnamed` draws the dashed "nobody counted this" version with a question mark. */
export const Block: React.FC<{x?: number; y?: number; w?: number; h?: number; unnamed?: boolean; opacity?: number; rot?: number; scale?: number}> = ({x = 0, y = 0, w = 64, h = 44, unnamed, opacity = 1, rot = 0, scale = 1}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale})`} opacity={opacity}>
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={8} fill={unnamed ? '#FFFFFF' : C.soft} stroke={C.ink} strokeWidth={5} strokeDasharray={unnamed ? '9 8' : undefined} />
    {unnamed && (
      <text y={11} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={30} fill={C.ink}>
        ?
      </text>
    )}
  </g>
);

/** An open ledger: two pages with ruled lines. */
export const Ledger: React.FC<{x?: number; y?: number; s?: number; opacity?: number; dashed?: boolean}> = ({x = 0, y = 0, s = 1, opacity = 1, dashed}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity}>
    <path d="M 0 -48 Q -50 -66 -100 -52 L -100 52 Q -50 38 0 58 Z" fill="#FFFFFF" stroke={C.ink} strokeWidth={6} strokeLinejoin="round" strokeDasharray={dashed ? '12 10' : undefined} />
    <path d="M 0 -48 Q 50 -66 100 -52 L 100 52 Q 50 38 0 58 Z" fill="#FFFFFF" stroke={C.ink} strokeWidth={6} strokeLinejoin="round" strokeDasharray={dashed ? '12 10' : undefined} />
    {[-24, -4, 16].map((yy) => (
      <g key={yy} stroke={C.soft} strokeWidth={6} strokeLinecap="round">
        <line x1={-78} y1={yy} x2={-22} y2={yy + 4} />
        <line x1={22} y1={yy + 4} x2={78} y2={yy} />
      </g>
    ))}
  </g>
);

/** A comment bubble with three dots. */
export const CommentIcon: React.FC<{x?: number; y?: number; s?: number; opacity?: number}> = ({x = 0, y = 0, s = 1, opacity = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity}>
    <path d="M -70 -44 L 70 -44 Q 90 -44 90 -24 L 90 24 Q 90 44 70 44 L 0 44 L -30 74 L -30 44 L -70 44 Q -90 44 -90 24 L -90 -24 Q -90 -44 -70 -44 Z" fill="#FFFFFF" stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
    {[-36, 0, 36].map((dx) => (
      <circle key={dx} cx={dx} cy={0} r={9} fill={C.ink} />
    ))}
  </g>
);

/** End-card icon for "Follow and subscribe": a rounded button with a plus and a bell. */
export const FollowIcon: React.FC<{x?: number; y?: number; s?: number; opacity?: number}> = ({x = 0, y = 0, s = 1, opacity = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity}>
    <rect x={-150} y={-52} width={300} height={104} rx={52} fill={C.crimson} />
    <circle cx={-98} cy={0} r={30} fill="#FFFFFF" />
    <path d="M -98 -14 L -98 14 M -112 0 L -84 0" stroke={C.crimson} strokeWidth={8} strokeLinecap="round" />
    <text x={20} y={13} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={36} letterSpacing={3} fill="#FFFFFF">
      FOLLOW
    </text>
  </g>
);

/** A notification bell. */
export const Bell: React.FC<{x?: number; y?: number; s?: number; opacity?: number; ring?: number}> = ({x = 0, y = 0, s = 1, opacity = 1, ring = 0}) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${Math.sin(ring * 18) * 12 * Math.max(0, 1 - ring)})`} opacity={opacity}>
    <path d="M -46 28 Q -46 -10 -34 -30 Q -24 -50 0 -52 Q 24 -50 34 -30 Q 46 -10 46 28 Z" fill="#FFFFFF" stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
    <line x1={-58} y1={28} x2={58} y2={28} stroke={C.ink} strokeWidth={7} strokeLinecap="round" />
    <circle cx={0} cy={48} r={11} fill={C.ink} />
  </g>
);
