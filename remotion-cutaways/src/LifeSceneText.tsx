import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {z} from 'zod';
import {brand} from './brand';
import {Backdrop} from './backdrops';
import {loadBrandFonts, sansFamily} from './fonts';

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

const RIM = ['#B76E79', '#F8E8B4', '#FFFFFF', '#E9B3B4', '#B76E79'];

const Card: React.FC<{lines: string[]; from: number; to: number; top: number}> = ({lines, from, to, top}) => {
  const f = useCurrentFrame();
  const inP = interpolate(f, [from, from + 8], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  const outP = interpolate(f, [to - 6, to], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const o = Math.min(inP, outP);
  if (f < from || f > to) return null;
  const t = f / LS_FPS;
  const R = 22;
  return (
    <div style={{position: 'absolute', top, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: o, transform: `translateY(${(1 - inP) * 14}px)`}}>
      <div style={{position: 'relative', borderRadius: R, overflow: 'hidden', boxShadow: '0 12px 36px rgba(0,0,0,0.38)', maxWidth: 820}}>
        {/* crimson velvet field, cut from the brand backdrop, slightly see-through */}
        <div style={{position: 'absolute', inset: 0, opacity: 0.86}}>
          <Backdrop kind="crimson" frame={f} />
        </div>
        {/* slow sheen across the surface */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'linear-gradient(115deg, rgba(255,255,255,0) 32%, rgba(255,255,255,0.17) 48%, rgba(255,255,255,0) 64%)',
            backgroundSize: '260% 100%',
            backgroundPosition: `${120 - ((t * 38) % 140)}% 0`,
          }}
        />
        {/* holographic foil rim */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: R,
            padding: 3,
            background: `linear-gradient(${(t * 60) % 360}deg, ${RIM.join(',')})`,
            WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
            opacity: 0.8,
          }}
        />
        <div
          style={{
            position: 'relative',
            padding: '26px 46px 28px',
            color: brand.white,
            fontFamily: sansFamily('DM Sans'),
            fontWeight: 700,
            fontSize: 52,
            lineHeight: 1.22,
            textAlign: 'center',
            whiteSpace: 'nowrap',
            textShadow: '0 2px 10px rgba(60,0,0,0.45)',
          }}
        >
          {lines.map((l, i) => (
            <div key={i}>{l}</div>
          ))}
        </div>
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
