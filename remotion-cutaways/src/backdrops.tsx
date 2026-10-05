import React from 'react';
import {AbsoluteFill} from 'remotion';
import {brand} from './brand';

/**
 * Animated backdrops, one per field. Everything is slow and low contrast so the foreground graphic stays
 * the focus: drifting light blooms in palette tints, faint fine grain, and gentle parallax. The rose gold
 * field adds a slow light sweep and caustic-style highlights; the light field adds studio-light blooms and a
 * very faint charcoal line texture while still reading as white.
 */
export type BackdropKind = 'black' | 'crimson' | 'charcoal' | 'rosegold' | 'light' | 'marble-black' | 'marble-white' | 'marble-red';
const FPS = 30;

const svgUri = (svg: string) => `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;

/** Fine grain tile. `rgb` is 0..1 (1 = white grain, 0 = dark grain). */
const grain = (rgb: number) =>
  svgUri(
    `<svg xmlns='http://www.w3.org/2000/svg' width='260' height='260'><filter id='n' x='0' y='0' width='100%' height='100%'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='matrix' values='0 0 0 0 ${rgb} 0 0 0 0 ${rgb} 0 0 0 0 ${rgb} 1.8 0 0 0 -0.7'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`,
  );

/** Thin bright veins, caustic-style highlights. `rgb` is the vein color as 0..1 floats. */
const causticsTint = (r: number, g: number, b: number, seed: number, freq: string) =>
  svgUri(
    `<svg xmlns='http://www.w3.org/2000/svg' width='1000' height='1600'><filter id='c' x='0' y='0' width='100%' height='100%'><feTurbulence type='turbulence' baseFrequency='${freq}' numOctaves='2' seed='${seed}' stitchTiles='stitch'/><feColorMatrix type='matrix' values='0 0 0 0 ${r} 0 0 0 0 ${g} 0 0 0 0 ${b} -40 0 0 0 4.3'/><feGaussianBlur stdDeviation='1.6'/></filter><rect width='100%' height='100%' filter='url(#c)'/></svg>`,
  );
const caustics = causticsTint(1, 1, 1, 11, '0.0075 0.011');
// the black field: light catching metal, taken from the rose gold and gold highlight stops (#E9B3B4, #F8E8B4)
const causticsRose = causticsTint(0.914, 0.702, 0.706, 11, '0.0075 0.011');
const causticsGold = causticsTint(0.973, 0.91, 0.706, 29, '0.0062 0.0095');

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

const DEEP_CRIMSON_RGB = '111,13,15';
/**
 * Marble. Veins are the zero-crossings of Perlin turbulence: where the noise value is near 0 the alpha rises,
 * which draws thin branching veins. A soft mottle sits underneath, and two vein layers drift in opposite
 * directions so the stone feels alive without moving fast.
 */
/**
 * Veins are contour lines of smooth fractal noise: a transfer table turns the noise value into a thin spike
 * at chosen levels, so each level becomes a long, branching, hairline vein (the way real marble veins read).
 * `levels` are noise values near 0.5; `w` is the spike half-width in noise units.
 */
const veinTile = (r: number, g: number, b: number, seed: number, freq: string, levels: number[], w: number, blur: number) => {
  const N = 400;
  const table = Array.from({length: N + 1}, (_, i) => {
    const v = i / N;
    return Math.max(...levels.map((L) => Math.max(0, 1 - Math.abs(v - L) / w))).toFixed(3);
  }).join(' ');
  return svgUri(
    `<svg xmlns='http://www.w3.org/2000/svg' width='1000' height='1600'><filter id='m' x='0' y='0' width='100%' height='100%' color-interpolation-filters='sRGB'><feTurbulence type='fractalNoise' baseFrequency='${freq}' numOctaves='3' seed='${seed}' stitchTiles='stitch'/><feColorMatrix type='matrix' values='0 0 0 0 ${r} 0 0 0 0 ${g} 0 0 0 0 ${b} 1 0 0 0 0'/><feComponentTransfer><feFuncA type='table' tableValues='${table}'/></feComponentTransfer><feGaussianBlur stdDeviation='${blur}'/></filter><rect width='100%' height='100%' filter='url(#m)'/></svg>`,
  );
};
const mottleTile = (r: number, g: number, b: number, seed: number, gain: number, bias: number) =>
  svgUri(
    `<svg xmlns='http://www.w3.org/2000/svg' width='1000' height='1600'><filter id='o' x='0' y='0' width='100%' height='100%'><feTurbulence type='fractalNoise' baseFrequency='0.0028 0.0042' numOctaves='4' seed='${seed}' stitchTiles='stitch'/><feColorMatrix type='matrix' values='0 0 0 0 ${r} 0 0 0 0 ${g} 0 0 0 0 ${b} ${gain} 0 0 0 ${bias}'/></filter><rect width='100%' height='100%' filter='url(#o)'/></svg>`,
  );

type MarbleSpec = {
  base: string;
  mottle: Array<{img: string; opacity: number}>;
  veins: Array<{img: string; opacity: number; scale: number; dir: 1 | -1; speed: number}>;
  sweep: string;
  vignette: string;
};
const MARBLES: Record<'marble-black' | 'marble-white' | 'marble-red', MarbleSpec> = {
  'marble-black': {
    base: 'linear-gradient(180deg, #101112 0%, #070708 40%, #020202 100%)',
    mottle: [{img: mottleTile(0.23, 0.25, 0.26, 5, 1.2, -0.42), opacity: 0.35}],
    veins: [
      {img: veinTile(1, 1, 1, 7, '0.0022 0.0042', [0.47, 0.545], 0.012, 0.7), opacity: 0.58, scale: 1.3, dir: 1, speed: 6},
      {img: veinTile(0.9, 0.9, 0.93, 19, '0.0035 0.006', [0.42, 0.6], 0.008, 0.6), opacity: 0.3, scale: 1.2, dir: -1, speed: 4},
      {img: veinTile(0.96, 0.9, 0.88, 33, '0.009 0.014', [0.5], 0.01, 0.5), opacity: 0.16, scale: 1.1, dir: 1, speed: 3},
    ],
    sweep: 'rgba(255,255,255,0.06)',
    vignette: 'radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 42%, rgba(0,0,0,0.65) 100%)',
  },
  'marble-white': {
    base: 'linear-gradient(180deg, #FFFFFF 0%, #FCFCFC 60%, #F6F6F6 100%)',
    mottle: [{img: mottleTile(0.23, 0.25, 0.26, 9, 0.8, -0.26), opacity: 0.12}],
    veins: [
      {img: veinTile(0.23, 0.25, 0.26, 7, '0.0022 0.0042', [0.47, 0.545], 0.012, 0.7), opacity: 0.42, scale: 1.3, dir: 1, speed: 6},
      {img: veinTile(0.72, 0.43, 0.47, 13, '0.0035 0.006', [0.43, 0.59], 0.008, 0.6), opacity: 0.24, scale: 1.2, dir: -1, speed: 5},
      {img: veinTile(0.23, 0.25, 0.26, 33, '0.009 0.014', [0.5], 0.01, 0.5), opacity: 0.16, scale: 1.1, dir: 1, speed: 3},
    ],
    sweep: 'rgba(58,63,66,0.04)',
    vignette: 'radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0) 58%, rgba(58,63,66,0.08) 100%)',
  },
  'marble-red': {
    base: `linear-gradient(170deg, ${brand.crimson} 0%, ${brand.crimsonMid} 50%, ${brand.crimsonDeep} 100%)`,
    mottle: [
      {img: mottleTile(0.435, 0.05, 0.059, 3, 1.4, -0.46), opacity: 0.5},
      {img: mottleTile(1, 0.45, 0.43, 14, 1.0, -0.5), opacity: 0.12},
    ],
    veins: [
      {img: veinTile(1, 1, 1, 7, '0.0022 0.0042', [0.47, 0.545], 0.012, 0.7), opacity: 0.55, scale: 1.3, dir: 1, speed: 6},
      {img: veinTile(0, 0, 0, 19, '0.0035 0.006', [0.42, 0.6], 0.01, 0.6), opacity: 0.4, scale: 1.2, dir: -1, speed: 4},
    ],
    sweep: 'rgba(255,255,255,0.12)',
    vignette: `radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 45%, rgba(${DEEP_CRIMSON_RGB},0.55) 100%)`,
  },
};

/** Marble is a quiet texture, not a pattern: every vein layer is scaled down by this. */
const MARBLE_STRENGTH = 0.3;

const MarbleBackdrop: React.FC<{kind: 'marble-black' | 'marble-white' | 'marble-red'; frame: number}> = ({kind, frame}) => {
  const t = frame / FPS;
  const m = MARBLES[kind];
  const layer = (img: string, opacity: number, tx: number, ty: number, scale: number, rot = 0, blend?: React.CSSProperties['mixBlendMode']) => (
    <div
      style={{
        position: 'absolute',
        left: -250,
        top: -400,
        width: 1600,
        height: 2560,
        backgroundImage: img,
        backgroundSize: '1000px 1600px',
        transform: `rotate(${rot}deg) translate(${tx}px, ${ty}px) scale(${scale})`,
        opacity,
        mixBlendMode: blend,
      }}
    />
  );
  return (
    <AbsoluteFill style={{background: m.base, overflow: 'hidden'}}>
      {m.mottle.map((l, i) => (
        <React.Fragment key={`m${i}`}>{layer(l.img, l.opacity * 0.6, Math.sin(t * 0.05 + i) * 40, Math.cos(t * 0.04 + i) * 50 + t * 2, 1.3)}</React.Fragment>
      ))}
      {m.veins.map((l, i) => (
        <React.Fragment key={`v${i}`}>
          {layer(l.img, l.opacity * MARBLE_STRENGTH, l.dir * (Math.sin(t * 0.08 + i * 2) * 70), l.dir * t * l.speed, l.scale + Math.sin(t * 0.06 + i) * 0.03, i % 2 === 0 ? -32 : 24)}
        </React.Fragment>
      ))}
      {/* polished stone: a slow broad sheen crossing the surface */}
      <div
        style={{
          position: 'absolute',
          left: -900 + ((t % 12) / 12) * 2900,
          top: -200,
          width: 760,
          height: 2400,
          transform: 'rotate(15deg)',
          background: `linear-gradient(90deg, rgba(255,255,255,0) 0%, ${m.sweep} 50%, rgba(255,255,255,0) 100%)`,
        }}
      />
      <div style={{position: 'absolute', inset: 0, background: m.vignette}} />
    </AbsoluteFill>
  );
};

const ROSE = '212,138,140';
const GOLD = '213,170,74';
const WHITE = '255,255,255';
const DEEP_CRIMSON = '111,13,15';
const DEEP_ROSE = '122,60,71';
const ROSE_HI = '233,179,180'; // rose gold highlight stop
const GOLD_HI = '248,232,180'; // gold highlight stop

const BLOOMS: Record<Exclude<BackdropKind, 'marble-black' | 'marble-white' | 'marble-red'>, BloomSpec[]> = {
  // soft metallic light, low opacity, slow. Warm glints on black, never a pink or gray wash.
  black: [
    {rgb: ROSE_HI, alpha: 0.085, size: 980, x: 260, y: 520, ax: 170, ay: 230, sx: 0.27, sy: 0.2, ph: 0.8},
    {rgb: GOLD_HI, alpha: 0.065, size: 880, x: 860, y: 1120, ax: 150, ay: 210, sx: 0.23, sy: 0.3, ph: 2.6},
    {rgb: ROSE_HI, alpha: 0.055, size: 720, x: 880, y: 330, ax: 120, ay: 160, sx: 0.33, sy: 0.25, ph: 4.4},
  ],
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

const baseFor = (kind: Exclude<BackdropKind, 'marble-black' | 'marble-white' | 'marble-red'>, alt: number, t: number) => {
  const drift = Math.sin(t * 0.16) * 6;
  switch (kind) {
    case 'black':
      // vertical: charcoal at the very top, true black by the middle, so most of the frame is rich black
      return `linear-gradient(180deg, ${brand.charcoal} 0%, #1A1C1D 11%, #070808 26%, ${brand.black} 46%, ${brand.black} 100%)`;
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

export const Backdrop: React.FC<{kind: BackdropKind; alt?: number; frame: number}> = ({kind: anyKind, alt = 0, frame}) => {
  if (anyKind === 'marble-black' || anyKind === 'marble-white' || anyKind === 'marble-red') {
    return <MarbleBackdrop kind={anyKind} frame={frame} />;
  }
  const kind = anyKind;
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

      {kind === 'black' && (
        <>
          {/* caustic-style veins, rose gold highlight, drifting slowly (parallax B) */}
          <div
            style={{
              position: 'absolute',
              left: -200,
              top: -300,
              width: 1500,
              height: 2400,
              backgroundImage: causticsRose,
              backgroundSize: '1000px 1600px',
              transform: `translate(${-px * 3 + Math.sin(t * 0.09) * 60}px, ${-py * 3 + t * 8}px) scale(1.2)`,
              mixBlendMode: 'screen',
              opacity: 0.05,
            }}
          />
          {/* second layer in the gold highlight, different scale and direction */}
          <div
            style={{
              position: 'absolute',
              left: -250,
              top: -400,
              width: 1500,
              height: 2400,
              backgroundImage: causticsGold,
              backgroundSize: '1000px 1600px',
              transform: `translate(${px * 2.5 + Math.cos(t * 0.07) * 80}px, ${py * 2 - t * 6}px) scale(1.35)`,
              mixBlendMode: 'screen',
              opacity: 0.035,
            }}
          />
          {/* a slow, faint sweep of metallic light */}
          <div
            style={{
              position: 'absolute',
              left: -900 + ((t % 11) / 11) * 2800,
              top: -200,
              width: 700,
              height: 2400,
              transform: 'rotate(14deg)',
              background: `linear-gradient(90deg, rgba(${ROSE_HI},0) 0%, rgba(${ROSE_HI},0.05) 50%, rgba(${ROSE_HI},0) 100%)`,
              mixBlendMode: 'screen',
            }}
          />
          {/* soft vignette: edges fall off to pure black */}
          <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 38%, rgba(0,0,0,0.82) 100%)'}} />
        </>
      )}

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

      {kind !== 'rosegold' && kind !== 'black' && dark && (
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
          // overlay blend: pure black stays pure black, so grain never lifts the blacks into gray haze
          mixBlendMode: kind === 'black' ? 'overlay' : 'normal',
          opacity: kind === 'black' ? 0.07 : dark ? (kind === 'rosegold' ? 0.12 : 0.09) : 0.1,
        }}
      />
    </AbsoluteFill>
  );
};
