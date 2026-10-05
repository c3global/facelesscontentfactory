import React from 'react';
import {AbsoluteFill} from 'remotion';
import {brand} from './brand';

/**
 * Animated backdrops, one per field. Everything is slow and low contrast so the foreground graphic stays
 * the focus: drifting light blooms in palette tints, faint fine grain, and gentle parallax. The rose gold
 * field adds a slow light sweep and caustic-style highlights; the light field adds studio-light blooms and a
 * very faint charcoal line texture while still reading as white.
 */
export type BackdropKind = 'crimson' | 'charcoal' | 'rosegold' | 'light';
const FPS = 30;

const svgUri = (svg: string) => `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;

/** Fine grain tile. `rgb` is 0..1 (1 = white grain, 0 = dark grain). */
const grain = (rgb: number) =>
  svgUri(
    `<svg xmlns='http://www.w3.org/2000/svg' width='260' height='260'><filter id='n' x='0' y='0' width='100%' height='100%'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='matrix' values='0 0 0 0 ${rgb} 0 0 0 0 ${rgb} 0 0 0 0 ${rgb} 1.8 0 0 0 -0.7'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`,
  );

/** Thin bright veins, caustic-style highlights. */
const caustics = svgUri(
  `<svg xmlns='http://www.w3.org/2000/svg' width='1000' height='1600'><filter id='c' x='0' y='0' width='100%' height='100%'><feTurbulence type='turbulence' baseFrequency='0.0075 0.011' numOctaves='2' seed='11' stitchTiles='stitch'/><feColorMatrix type='matrix' values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 -26 0 0 0 3.5'/><feGaussianBlur stdDeviation='1.3'/></filter><rect width='100%' height='100%' filter='url(#c)'/></svg>`,
);

type BloomSpec = {
  rgb: string;
  alpha: number;
  size: number;
  x: number;
  y: number;
  ax: number;
  ay: number;
  sx: number;
  sy: number;
  ph: number;
};

const Bloom: React.FC<{spec: BloomSpec; t: number; blend: 'screen' | 'normal'}> = ({spec, t, blend}) => {
  const cx = spec.x + Math.sin(t * spec.sx + spec.ph) * spec.ax;
  const cy = spec.y + Math.cos(t * spec.sy + spec.ph * 1.3) * spec.ay;
  return (
    <div
      style={{
        position: 'absolute',
        left: cx - spec.size / 2,
        top: cy - spec.size / 2,
        width: spec.size,
        height: spec.size,
        borderRadius: '50%',
        background: `radial-gradient(circle, rgba(${spec.rgb},${spec.alpha}) 0%, rgba(${spec.rgb},${spec.alpha * 0.45}) 38%, rgba(${spec.rgb},0) 70%)`,
        mixBlendMode: blend,
      }}
    />
  );
};

const ROSE = '212,138,140';
const GOLD = '213,170,74';
const WHITE = '255,255,255';
const DEEP_CRIMSON = '111,13,15';
const DEEP_ROSE = '122,60,71';

const BLOOMS: Record<BackdropKind, BloomSpec[]> = {
  crimson: [
    {rgb: WHITE, alpha: 0.13, size: 1150, x: 260, y: 520, ax: 170, ay: 230, sx: 0.3, sy: 0.22, ph: 0},
    {rgb: ROSE, alpha: 0.28, size: 950, x: 860, y: 1120, ax: 150, ay: 210, sx: 0.26, sy: 0.34, ph: 2},
    {rgb: WHITE, alpha: 0.08, size: 720, x: 900, y: 300, ax: 120, ay: 160, sx: 0.4, sy: 0.3, ph: 4},
  ],
  charcoal: [
    {rgb: ROSE, alpha: 0.16, size: 1050, x: 240, y: 520, ax: 160, ay: 220, sx: 0.28, sy: 0.2, ph: 1},
    {rgb: GOLD, alpha: 0.13, size: 920, x: 880, y: 1180, ax: 150, ay: 210, sx: 0.24, sy: 0.32, ph: 3},
    {rgb: WHITE, alpha: 0.06, size: 760, x: 860, y: 320, ax: 120, ay: 150, sx: 0.36, sy: 0.28, ph: 5},
  ],
  rosegold: [
    {rgb: WHITE, alpha: 0.15, size: 1050, x: 280, y: 480, ax: 170, ay: 230, sx: 0.3, sy: 0.22, ph: 0.5},
    {rgb: GOLD, alpha: 0.2, size: 900, x: 840, y: 1100, ax: 150, ay: 200, sx: 0.25, sy: 0.33, ph: 2.5},
    {rgb: WHITE, alpha: 0.09, size: 720, x: 880, y: 340, ax: 120, ay: 160, sx: 0.4, sy: 0.3, ph: 4.5},
  ],
  light: [
    {rgb: ROSE, alpha: 0.13, size: 1150, x: 220, y: 420, ax: 150, ay: 210, sx: 0.22, sy: 0.18, ph: 0},
    {rgb: GOLD, alpha: 0.11, size: 1050, x: 880, y: 1200, ax: 140, ay: 200, sx: 0.2, sy: 0.27, ph: 2},
    {rgb: ROSE, alpha: 0.08, size: 820, x: 760, y: 320, ax: 120, ay: 150, sx: 0.3, sy: 0.24, ph: 4},
  ],
};

const baseFor = (kind: BackdropKind, alt: number, t: number) => {
  const drift = Math.sin(t * 0.16) * 6;
  switch (kind) {
    case 'crimson':
      return `linear-gradient(${165 + drift}deg, ${brand.crimson} 0%, ${brand.crimsonMid} 52%, ${brand.crimsonDeep} 100%)`;
    case 'charcoal':
      // alternates between #000000 and #3A3F42 across scenes
      return alt % 2 === 0
        ? `linear-gradient(${165 + drift}deg, ${brand.charcoal} 0%, #1D2022 52%, ${brand.black} 100%)`
        : `linear-gradient(${165 + drift}deg, ${brand.black} 0%, #1D2022 48%, ${brand.charcoal} 100%)`;
    case 'rosegold':
      return `linear-gradient(${158 + drift}deg, #7A3C47 0%, #B76E79 16%, #E9B3B4 30%, #B76E79 45%, #8A4651 60%, #D48A8C 74%, #F6D5D2 85%, #B76E79 100%)`;
    case 'light':
      return brand.white;
  }
};

export const Backdrop: React.FC<{kind: BackdropKind; alt?: number; frame: number}> = ({kind, alt = 0, frame}) => {
  const t = frame / FPS;
  const dark = kind !== 'light';
  const blend = dark ? 'screen' : 'normal';
  const px = Math.sin(t * 0.15) * 16;
  const py = Math.cos(t * 0.12) * 22;

  return (
    <AbsoluteFill
      style={{
        background: baseFor(kind, alt, t),
        backgroundSize: kind === 'rosegold' ? '100% 280%' : undefined,
        backgroundPosition: kind === 'rosegold' ? `0% ${50 + 28 * Math.sin(t * 0.18)}%` : undefined,
        overflow: 'hidden',
      }}
    >
      {/* blooms (parallax group A) */}
      <div style={{position: 'absolute', inset: 0, transform: `translate(${px}px, ${py}px)`}}>
        {BLOOMS[kind].map((b, i) => (
          <Bloom key={i} spec={b} t={t} blend={blend} />
        ))}
      </div>

      {kind === 'crimson' && (
        <div
          style={{
            position: 'absolute',
            left: -300 + Math.sin(t * 0.2 + 1) * 120,
            top: 1250 + Math.cos(t * 0.17) * 160,
            width: 1500,
            height: 1100,
            borderRadius: '50%',
            background: `radial-gradient(circle, rgba(${DEEP_CRIMSON},0.55) 0%, rgba(${DEEP_CRIMSON},0) 68%)`,
          }}
        />
      )}

      {kind === 'rosegold' && (
        <>
          {/* caustic-style highlights, parallax group B drifting the other way */}
          <div
            style={{
              position: 'absolute',
              left: -200,
              top: -300,
              width: 1500,
              height: 2400,
              backgroundImage: caustics,
              backgroundSize: '1000px 1600px',
              transform: `translate(${-px * 4 + Math.sin(t * 0.1) * 70}px, ${-py * 4 + t * 10}px) scale(1.2)`,
              mixBlendMode: 'screen',
              opacity: 0.15,
            }}
          />
          {/* slow light sweep */}
          <div
            style={{
              position: 'absolute',
              left: -900 + ((t % 9) / 9) * 2800,
              top: -200,
              width: 800,
              height: 2400,
              transform: 'rotate(14deg)',
              background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.34) 50%, rgba(255,255,255,0) 100%)',
              mixBlendMode: 'screen',
            }}
          />
          <div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 55%, rgba(${DEEP_ROSE},0) 40%, rgba(${DEEP_ROSE},0.5) 100%)`}} />
        </>
      )}

      {kind === 'light' && (
        <>
          {/* very faint charcoal-tinted line texture and a slow tonal shift */}
          <div
            style={{
              position: 'absolute',
              inset: -40,
              backgroundImage:
                'repeating-linear-gradient(118deg, rgba(58,63,66,0.042) 0px, rgba(58,63,66,0.042) 1px, rgba(255,255,255,0) 1px, rgba(255,255,255,0) 10px)',
              backgroundPosition: `${t * 6}px 0`,
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: -700 + ((t % 14) / 14) * 2500,
              top: -200,
              width: 700,
              height: 2400,
              transform: 'rotate(16deg)',
              background: 'linear-gradient(90deg, rgba(58,63,66,0) 0%, rgba(58,63,66,0.05) 50%, rgba(58,63,66,0) 100%)',
            }}
          />
        </>
      )}

      {kind !== 'rosegold' && dark && (
        <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.30) 100%)'}} />
      )}

      {/* fine grain, shifted every other frame so it feels filmic */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: grain(dark ? 1 : 0.2),
          backgroundSize: '260px 260px',
          backgroundPosition: `${(Math.floor(frame / 2) * 47) % 260}px ${(Math.floor(frame / 2) * 91) % 260}px`,
          opacity: dark ? (kind === 'rosegold' ? 0.12 : 0.09) : 0.1,
        }}
      />
    </AbsoluteFill>
  );
};
