import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {z} from 'zod';
import {brand} from './brand';
import {Backdrop} from './backdrops';
import {MetalRim} from './metal';
import {Sparkle} from './sparkle';
import {handFamilies, loadBrandFonts, sansFamily} from './fonts';

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
  /** text face: handwriting options or the plain brand sans */
  font: z.enum(['covered', 'caveat', 'swanky', 'dmsans']).default('covered'),
  durationSec: z.number(),
  lines: z.array(lineSchema),
});
export type LifeSceneTextProps = z.infer<typeof lifeSceneTextSchema>;

const FACES = {
  covered: {family: handFamilies.covered, weight: 400, size: 78, lineHeight: 1.16},
  caveat: {family: handFamilies.caveat, weight: 700, size: 78, lineHeight: 1.1},
  swanky: {family: handFamilies.swanky, weight: 400, size: 62, lineHeight: 1.2},
  dmsans: {family: sansFamily('DM Sans'), weight: 700, size: 52, lineHeight: 1.22},
} as const;

const Card: React.FC<{lines: string[]; from: number; to: number; top: number; font: keyof typeof FACES}> = ({lines, from, to, top, font}) => {
  const face = FACES[font];
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
        {/* shiny penny copper rim with a few glints */}
        <MetalRim radius={R} thickness={5} kind="copper" variant="bright" seed={3} />
        <Sparkle left="7%" top={9} size={30} phase={0} />
        <Sparkle left="93%" top="88%" size={26} phase={1.3} />
        <Sparkle left="52%" top="96%" size={22} phase={2.2} />
        <div
          style={{
            position: 'relative',
            padding: '26px 46px 28px',
            color: brand.white,
            fontFamily: face.family,
            fontWeight: face.weight,
            fontSize: face.size,
            lineHeight: face.lineHeight,
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
export const LifeSceneText: React.FC<LifeSceneTextProps> = ({lines, font}) => (
  <AbsoluteFill>
    {lines.map((l, i) => (
      <Card key={i} lines={l.text} from={Math.round(l.fromSec * LS_FPS)} to={Math.round(l.toSec * LS_FPS)} top={l.top} font={font} />
    ))}
  </AbsoluteFill>
);
