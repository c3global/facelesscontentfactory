import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame} from 'remotion';
import {z} from 'zod';
import {brand} from './brand';
import {Backdrop} from './backdrops';
import {handFamilies, loadBrandFonts, sansFamily} from './fonts';
import {MetalRim, metalFill} from './metal';
import {Sparkle} from './sparkle';

loadBrandFonts();

const FPS = 24;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const easeOut = Easing.out(Easing.cubic);

/* ============ G06 Comment bubble ============ */
export const lsCommentSchema = z.object({
  comments: z.array(z.object({handle: z.string(), initial: z.string(), text: z.string(), atSec: z.number()})).min(1).max(3),
});
export type LSCommentProps = z.infer<typeof lsCommentSchema>;

const Heart: React.FC<{size: number; pop: number}> = ({size, pop}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{transform: `scale(${pop})`, filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.45))'}}>
    <path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 2.9 4.9 6.4 4.9c2 0 3.6 1.1 4.6 2.6 1-1.5 2.6-2.6 4.6-2.6 3.5 0 5.5 3.5 4 6.9C19.5 16.4 12 21 12 21z" fill="#FFFFFF" stroke="#E9A87A" strokeWidth="1.2" />
  </svg>
);

export const LSComment: React.FC<LSCommentProps> = ({comments}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      {comments.map((c, i) => {
        const at = Math.round(c.atSec * FPS);
        if (f < at - 1) return null;
        const s = spring({frame: f - at, fps: FPS, config: {damping: 11, stiffness: 170, mass: 0.7}});
        const o = interpolate(f, [at, at + 4], [0, 1], clamp);
        const heartAt = at + 20;
        const heartPop = f < heartAt ? 0 : spring({frame: f - heartAt, fps: FPS, config: {damping: 7, stiffness: 220, mass: 0.5}});
        const top = 1070 + i * 200;
        return (
          <div key={i} style={{position: 'absolute', left: 100, top, opacity: o, transform: `scale(${0.55 + 0.45 * s})`, transformOrigin: '0% 100%', display: 'flex', alignItems: 'flex-end', gap: 20}}>
            {/* avatar */}
            <div style={{position: 'relative', width: 92, height: 92, borderRadius: 46, overflow: 'hidden', flexShrink: 0, boxShadow: '0 8px 22px rgba(0,0,0,0.4)'}}>
              <div style={{position: 'absolute', inset: 0}}>
                <Backdrop kind="crimson" frame={f} />
              </div>
              <MetalRim radius={46} thickness={4} kind="copper" variant="bright" seed={61 + i} />
              <div style={{position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: handFamilies.covered, color: '#fff', fontSize: 56}}>{c.initial}</div>
            </div>
            {/* bubble */}
            <div style={{position: 'relative', borderRadius: '34px 34px 34px 8px', overflow: 'hidden', boxShadow: '0 12px 34px rgba(0,0,0,0.4)'}}>
              <div style={{position: 'absolute', inset: 0, opacity: 0.9}}>
                <Backdrop kind="crimson" frame={f} />
              </div>
              <MetalRim radius="34px 34px 34px 8px" thickness={5} kind="copper" variant="bright" seed={67 + i} />
              <Sparkle left="7%" top={10} size={26} phase={i * 0.8} />
              <div style={{position: 'relative', padding: '16px 34px 24px 34px', display: 'flex', alignItems: 'flex-end', gap: 22}}>
                <div>
                  <div style={{fontFamily: sansFamily('DM Sans'), fontWeight: 700, fontSize: 26, color: 'rgba(255,255,255,0.88)', marginBottom: 2}}>{c.handle}</div>
                  <div style={{fontFamily: handFamilies.covered, fontSize: 54, lineHeight: 1.1, color: '#fff', whiteSpace: 'nowrap', textShadow: '0 2px 10px rgba(60,0,0,0.45)'}}>{c.text}</div>
                </div>
                <div style={{width: 46, height: 46, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 4}}>
                  <Heart size={42} pop={heartPop} />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* ============ G07 Timeline burn ============ */
export const lsTimelineSchema = z.object({
  items: z.array(z.string()).min(3).max(5),
  startSec: z.number(),
  endSec: z.number(),
});
export type LSTimelineProps = z.infer<typeof lsTimelineSchema>;

const TL_LEFT = 190;
const TL_RIGHT = 890;
const TL_Y = 1245;

export const LSTimeline: React.FC<LSTimelineProps> = ({items, startSec, endSec}) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const cardIn = interpolate(f, [Math.round(startSec * FPS) - 12, Math.round(startSec * FPS)], [0, 1], {...clamp, easing: easeOut});
  if (f < Math.round(startSec * FPS) - 12) return null;
  const progress = (tt: number) => interpolate(tt, [startSec + 0.3, endSec], [0, 1], {...clamp, easing: Easing.inOut(Easing.quad)});
  const p = progress(t);
  const xAt = (pp: number) => TL_LEFT + (TL_RIGHT - TL_LEFT) * pp;
  const headX = xAt(p);
  const n = items.length;
  const burning = p > 0 && p < 1;
  // embers: each one is born at the head's position at its birth time, then drifts up and fades
  const embers = Array.from({length: 14}).map((_, j) => {
    const life = 0.8;
    const age = (((t - j * 0.07) % life) + life) % life;
    const birth = t - age;
    const bp = progress(birth);
    if (bp <= 0 || bp >= 1) return null;
    const jitter = Math.sin(j * 12.9898) * 43758.5453;
    const r = jitter - Math.floor(jitter);
    const x = xAt(bp) + (r - 0.5) * 18 - age * 30;
    const y = TL_Y - age * (60 + r * 70) + 0.5 * 120 * age * age * 0.4;
    const o = (1 - age / life) * 0.95;
    const size = 5 + r * 5;
    return <div key={j} style={{position: 'absolute', left: x, top: y, width: size, height: size, borderRadius: size, background: r > 0.5 ? '#FFD6B4' : '#F8E8B4', opacity: o, boxShadow: '0 0 10px rgba(255,170,100,0.9)'}} />;
  });
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 120, top: 1080, width: 840, height: 330, opacity: cardIn, transform: `translateY(${(1 - cardIn) * 30}px)`}}>
        <div style={{position: 'absolute', inset: 0, borderRadius: 30, background: 'rgba(20,22,23,0.92)', boxShadow: '0 16px 40px rgba(0,0,0,0.45)'}} />
        <MetalRim radius={30} thickness={4} kind="gold" variant="bright" seed={71} />
        <Sparkle left="96%" top={12} size={28} phase={0.5} />
      </div>
      <div style={{position: 'absolute', inset: 0, opacity: cardIn}}>
        {/* unlit line */}
        <div style={{position: 'absolute', left: TL_LEFT, top: TL_Y - 3, width: TL_RIGHT - TL_LEFT, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.22)'}} />
        {/* burnt trail: copper metal with a glow */}
        <div style={{position: 'absolute', left: TL_LEFT, top: TL_Y - 4, width: Math.max(0, headX - TL_LEFT), height: 8, borderRadius: 4, boxShadow: '0 0 16px rgba(255,150,80,0.75)', ...metalFill({kind: 'copper', variant: 'bright', frame: f, seed: 73})}} />
        {/* nodes and labels */}
        {items.map((label, i) => {
          const pp = n === 1 ? 0 : i / (n - 1);
          const reachedAt = startSec + 0.3 + (endSec - startSec - 0.3) * (pp === 0 ? 0 : 0); // first node lights at start
          void reachedAt;
          const lit = interpolate(p, [pp - 0.001, pp + 0.04], [0, 1], clamp);
          const labelIn = interpolate(p, [pp, pp + 0.07], [0, 1], {...clamp, easing: easeOut});
          const x = xAt(pp);
          const above = i % 2 === 0;
          return (
            <React.Fragment key={i}>
              <div style={{position: 'absolute', left: x - 19, top: TL_Y - 19, width: 38, height: 38, borderRadius: 19, boxSizing: 'border-box', border: '4px solid rgba(255,255,255,0.45)', background: '#101112'}}>
                <div style={{position: 'absolute', inset: -4, borderRadius: 19, opacity: lit, boxShadow: '0 0 20px rgba(255,150,80,0.9)', ...metalFill({kind: 'copper', variant: 'bright', frame: f, seed: 79 + i})}} />
              </div>
              <div
                style={{
                  position: 'absolute',
                  left: x - 150,
                  width: 300,
                  textAlign: 'center',
                  top: above ? TL_Y - 112 : TL_Y + 40,
                  opacity: labelIn,
                  transform: `translateY(${(above ? 1 : -1) * (1 - labelIn) * 16}px)`,
                  fontFamily: handFamilies.covered,
                  fontSize: 50,
                  color: '#fff',
                  whiteSpace: 'nowrap',
                }}
              >
                {label}
              </div>
            </React.Fragment>
          );
        })}
        {/* the ember at the head of the burn */}
        {burning && (
          <div style={{position: 'absolute', left: headX - 26, top: TL_Y - 26, width: 52, height: 52, borderRadius: 26, background: 'radial-gradient(circle, #FFFFFF 0%, #FFD6B4 28%, rgba(255,140,60,0.75) 55%, rgba(255,120,40,0) 75%)', opacity: 0.85 + 0.15 * Math.sin(f * 1.7)}} />
        )}
        {embers}
      </div>
    </AbsoluteFill>
  );
};
