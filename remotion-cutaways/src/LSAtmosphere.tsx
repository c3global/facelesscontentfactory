import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {z} from 'zod';

const FPS = 24;
const W = 1080;
const H = 1920;

/** Small deterministic random so every render is identical. */
const rnd = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export const lsDustSchema = z.object({
  /** how many particles */
  count: z.number(),
});

/**
 * M14 Floating dust. Transparent overlay: tiny soft motes drifting slowly up and across,
 * brighter near a warm light zone on the right. Keep them small and few so it reads as air, not snow.
 */
export const LSDust: React.FC<z.infer<typeof lsDustSchema>> = ({count}) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  return (
    <AbsoluteFill>
      {Array.from({length: count}).map((_, i) => {
        const depth = rnd(i + 1); // 0 far, 1 near
        const size = 3 + depth * 9;
        const speed = 8 + depth * 26; // px per second
        const baseX = rnd(i + 50) * W;
        const baseY = rnd(i + 90) * H;
        const x = (baseX + t * (speed * 0.35) + Math.sin(t * 0.6 + i) * (14 + depth * 22)) % (W + 40);
        const y = (((baseY - t * speed) % H) + H) % H;
        const light = interpolate(x, [0, W], [0.45, 1]);
        const twinkle = 0.65 + 0.35 * Math.sin(t * (1.1 + rnd(i + 7)) + i * 3);
        const op = (0.12 + depth * 0.4) * light * twinkle;
        const warm = rnd(i + 20) > 0.5;
        const core = warm ? '255,226,190' : '255,255,255';
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x - size,
              top: y - size,
              width: size * 2,
              height: size * 2,
              borderRadius: '50%',
              background: `radial-gradient(circle, rgba(${core},${op}) 0%, rgba(${core},${op * 0.45}) 40%, rgba(${core},0) 70%)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

export const lsLeaksSchema = z.object({
  /** overall strength, 0 to 1 */
  strength: z.number(),
});

/**
 * M10 Light leaks. OPAQUE picture on black: finish with ls_finish.py --leaks (screen blend), never as a normal overlay.
 * Warm amber, rose gold and a touch of crimson bleeding in from the right edge and drifting, swelling and ebbing.
 */
export const LSLeaks: React.FC<z.infer<typeof lsLeaksSchema>> = ({strength}) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const blob = (cx: number, cy: number, rx: number, ry: number, rgb: string, a: number) => (
    <div
      style={{
        position: 'absolute',
        left: cx - rx,
        top: cy - ry,
        width: rx * 2,
        height: ry * 2,
        borderRadius: '50%',
        background: `radial-gradient(ellipse at center, rgba(${rgb},${a}) 0%, rgba(${rgb},${a * 0.5}) 38%, rgba(${rgb},0) 72%)`,
      }}
    />
  );
  // each leak swells and fades on its own slow cycle, so the frame is never evenly lit
  const swell = (period: number, phase: number) => 0.2 + 0.8 * Math.max(0, Math.sin((t / period) * Math.PI * 2 + phase)) ** 1.3;
  const a1 = swell(6.5, 0) * strength;
  const a2 = swell(8.5, 2.1) * strength;
  const a3 = swell(5.2, 4.0) * strength;
  const drift1 = interpolate(Math.sin(t * 0.5), [-1, 1], [-70, 70]);
  const drift2 = interpolate(Math.sin(t * 0.38 + 1), [-1, 1], [-90, 90]);
  return (
    <AbsoluteFill style={{backgroundColor: '#000'}}>
      {blob(W - 40, 520 + drift1, 620, 860, '255,150,60', a1)}
      {blob(W - 80, 1380 + drift2, 560, 700, '240,150,120', a2)}
      {blob(-60, 900 - drift1, 520, 760, '201,27,25', a3 * 0.8)}
    </AbsoluteFill>
  );
};
