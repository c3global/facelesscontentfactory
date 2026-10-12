import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {z} from 'zod';
import {brand} from './brand';
import {loadBrandFonts} from './fonts';

loadBrandFonts();

export const LS_FPS = 24;

const lineSchema = z.object({
  /** one string per rendered line (the box breaks exactly where you split) */
  text: z.array(z.string()).min(1),
  fromSec: z.number(),
  toSec: z.number(),
  /** top edge of the box in px on the 1080x1920 canvas */
  top: z.number(),
});

export const lifeSceneTextSchema = z.object({
  durationSec: z.number(),
  lines: z.array(lineSchema),
});
export type LifeSceneTextProps = z.infer<typeof lifeSceneTextSchema>;

const Card: React.FC<{lines: string[]; from: number; to: number; top: number}> = ({lines, from, to, top}) => {
  const f = useCurrentFrame();
  const inP = interpolate(f, [from, from + 8], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  const outP = interpolate(f, [to - 6, to], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const o = Math.min(inP, outP);
  if (f < from || f > to) return null;
  return (
    <div style={{position: 'absolute', top, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: o, transform: `translateY(${(1 - inP) * 14}px)`}}>
      <div
        style={{
          backgroundColor: brand.crimson,
          color: brand.white,
          padding: '26px 40px 28px',
          borderRadius: 6,
          boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
          fontFamily: '"Montserrat", sans-serif',
          fontWeight: 700,
          fontSize: 54,
          lineHeight: 1.22,
          letterSpacing: 0.3,
          textAlign: 'center',
          maxWidth: 900,
        }}
      >
        {lines.map((l, i) => (
          <div key={i}>{l}</div>
        ))}
      </div>
    </div>
  );
};

/** Transparent overlay: render as a PNG sequence and composite over the finished clip. */
export const LifeSceneText: React.FC<LifeSceneTextProps> = ({lines}) => (
  <AbsoluteFill>
    {lines.map((l, i) => (
      <Card key={i} lines={l.text} from={Math.round(l.fromSec * LS_FPS)} to={Math.round(l.toSec * LS_FPS)} top={l.top} />
    ))}
  </AbsoluteFill>
);
