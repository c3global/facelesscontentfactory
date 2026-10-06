import React, {CSSProperties} from 'react';
import {useCurrentFrame} from 'remotion';
import {MetalKind, MetalVariant, STOP_OFFSETS, metalGradient, metalStops} from './brand';

/**
 * Metal system. Rose gold and gold are only ever drawn through these helpers, so they are always a
 * multi-stop metallic gradient and always carry the slow specular shimmer: a soft highlight band that
 * sweeps across every 3.5 seconds, staggered per element with `seed` so nothing glints at the same time.
 */
export const SHIMMER_PERIOD = 105; // frames: 3.5 s at 30 fps
const SWEEP_SHARE = 0.34; // the band is visible for about 1.2 s of each 3.5 s cycle

/** 0..1 while the band is sweeping, -1 while idle. */
export const shimmerPhase = (frame: number, seed: number) => {
  const offset = Math.floor(seed * 37) % SHIMMER_PERIOD;
  const t = ((frame + offset) % SHIMMER_PERIOD) / SHIMMER_PERIOD;
  return t < SWEEP_SHARE ? t / SWEEP_SHARE : -1;
};

type MetalOpts = {
  kind?: MetalKind;
  variant: MetalVariant;
  frame: number;
  seed?: number;
  angle?: number;
  shimmer?: boolean;
};

/** CSS background layers for any metal surface (fills, badges, rims, bars). */
export const metalFill = ({kind = 'rose', variant, frame, seed = 1, angle = 135, shimmer = true}: MetalOpts): CSSProperties => {
  const base = metalGradient(kind, variant, angle);
  const p = shimmer ? shimmerPhase(frame, seed) : -1;
  if (p < 0) return {backgroundImage: base};
  const strength = variant === 'deep' ? 0.62 : 0.72;
  const pos = 130 - p * 160;
  return {
    backgroundImage: `linear-gradient(105deg, rgba(255,255,255,0) 40%, rgba(255,255,255,${strength}) 50%, rgba(255,255,255,0) 60%), ${base}`,
    backgroundSize: '300% 100%, 100% 100%',
    backgroundPosition: `${pos}% 0, 0 0`,
    backgroundRepeat: 'no-repeat',
  };
};

/** Metal for text via background-clip. Do not combine with text-shadow (it paints over the fill); use filter instead. */
export const metalTextStyle = (opts: MetalOpts): CSSProperties => ({
  ...metalFill(opts),
  color: 'transparent',
  WebkitTextFillColor: 'transparent',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
});

export const MetalText: React.FC<{
  kind?: MetalKind;
  variant: MetalVariant;
  seed?: number;
  style?: CSSProperties;
  children: React.ReactNode;
}> = ({kind = 'rose', variant, seed = 1, style, children}) => {
  const frame = useCurrentFrame();
  return <span style={{...metalTextStyle({kind, variant, frame, seed}), ...style}}>{children}</span>;
};

/** A metal rim around a rounded box (cards, rings). Absolutely positioned, ignores pointer events. */
export const MetalRim: React.FC<{
  radius: number | string;
  thickness: number;
  kind?: MetalKind;
  variant: MetalVariant;
  seed?: number;
  opacity?: number;
  style?: CSSProperties;
}> = ({radius, thickness, kind = 'rose', variant, seed = 1, opacity = 1, style}) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius: radius,
        padding: thickness,
        opacity,
        ...metalFill({kind, variant, frame, seed}),
        WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
        WebkitMaskComposite: 'xor',
        pointerEvents: 'none',
        ...style,
      }}
    />
  );
};

/** A solid metal shape (badges, chips, bars, dots). */
export const MetalBox: React.FC<{
  kind?: MetalKind;
  variant: MetalVariant;
  seed?: number;
  angle?: number;
  style?: CSSProperties;
  children?: React.ReactNode;
}> = ({kind = 'rose', variant, seed = 1, angle = 135, style, children}) => {
  const frame = useCurrentFrame();
  return <div style={{...metalFill({kind, variant, frame, seed, angle}), ...style}}>{children}</div>;
};

/**
 * SVG gradient for strokes and fills (hub connector lines, check marks, arrows, icons).
 * userSpaceOnUse so vertical and horizontal lines work. The highlight scrolls along the vector once per
 * shimmer period, so the glint travels along the stroke.
 */
export const MetalGradient: React.FC<{
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  kind?: MetalKind;
  variant: MetalVariant;
  seed?: number;
}> = ({id, x1, y1, x2, y2, kind = 'rose', variant, seed = 1}) => {
  const frame = useCurrentFrame();
  const stops = metalStops(kind, variant);
  const len = Math.max(1, Math.hypot(x2 - x1, y2 - y1));
  const ux = (x2 - x1) / len;
  const uy = (y2 - y1) / len;
  const span = len * 2;
  const offset = Math.floor(seed * 37) % SHIMMER_PERIOD;
  const travel = (((frame + offset) % SHIMMER_PERIOD) / SHIMMER_PERIOD) * span;
  const sx = x1 + ux * (travel - span);
  const sy = y1 + uy * (travel - span);
  return (
    <linearGradient
      id={id}
      gradientUnits="userSpaceOnUse"
      spreadMethod="repeat"
      x1={sx}
      y1={sy}
      x2={sx + ux * span}
      y2={sy + uy * span}
    >
      {stops.map((c, i) => (
        <stop key={i} offset={STOP_OFFSETS[i]} stopColor={c} />
      ))}
    </linearGradient>
  );
};

/** Metal check mark in a ring, used for completion states. */
export const MetalCheck: React.FC<{size: number; id: string; seed?: number; variant?: MetalVariant; progress?: number}> = ({
  size,
  id,
  seed = 1,
  variant = 'deep',
  progress = 1,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <defs>
      <MetalGradient id={id} x1={0} y1={0} x2={24} y2={24} kind="gold" variant={variant} seed={seed} />
    </defs>
    <circle cx="12" cy="12" r="10" fill="none" stroke={`url(#${id})`} strokeWidth="2.2" strokeDasharray={63} strokeDashoffset={63 * (1 - progress)} />
    <path
      d="M7.5 12.5l3 3 6-6.5"
      fill="none"
      stroke={`url(#${id})`}
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={20}
      strokeDashoffset={20 * (1 - Math.max(0, progress * 2 - 1))}
    />
  </svg>
);

/** Metal arrow (down), used by end cards. */
export const MetalArrow: React.FC<{size: number; id: string; seed?: number; variant?: MetalVariant; style?: CSSProperties}> = ({
  size,
  id,
  seed = 1,
  variant = 'bright',
  style,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={style}>
    <defs>
      <MetalGradient id={id} x1={4} y1={4} x2={20} y2={20} kind="rose" variant={variant} seed={seed} />
    </defs>
    <path d="M12 4v15m0 0l-6-6m6 6l6-6" fill="none" stroke={`url(#${id})`} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
