import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {z} from 'zod';
import {brand} from './brand';
import {Backdrop} from './backdrops';
import {handFamilies, loadBrandFonts, sansFamily} from './fonts';
import {MetalRim, metalFill} from './metal';
import {Sparkle} from './sparkle';

loadBrandFonts();

const FPS = 24;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const RIM = ['#B76E79', '#F8E8B4', '#FFFFFF', '#E9B3B4', '#B76E79'];
const easeOut = Easing.out(Easing.cubic);

/** small crimson velvet square used as an app icon / highlight */
const VelvetChip: React.FC<{size: number; radius: number; frame: number; children?: React.ReactNode}> = ({size, radius, frame, children}) => (
  <div style={{position: 'relative', width: size, height: size, borderRadius: radius, overflow: 'hidden', flexShrink: 0}}>
    <div style={{position: 'absolute', inset: 0}}>
      <Backdrop kind="crimson" frame={frame} />
    </div>
    <MetalRim radius={radius} thickness={3} kind="copper" variant="bright" seed={23} />
    <div style={{position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: handFamilies.covered, color: '#fff', fontSize: size * 0.62}}>{children}</div>
  </div>
);

/* ============ G03 The stack: notification cards pile up ============ */
export const lsStackSchema = z.object({
  cards: z.array(z.object({initial: z.string(), title: z.string(), body: z.string(), atSec: z.number()})).min(1).max(5),
});
export type LSStackProps = z.infer<typeof lsStackSchema>;

export const LSStack: React.FC<LSStackProps> = ({cards}) => {
  const f = useCurrentFrame();
  const baseTop = 1190; // newest card sits here, older ones peek out above it
  const shown = cards.filter((c) => f >= Math.round(c.atSec * FPS) - 2);
  return (
    <AbsoluteFill>
      {shown.map((c, i) => {
        const at = Math.round(c.atSec * FPS);
        const newer = shown.length - 1 - i; // 0 = newest
        const enter = interpolate(f, [at - 2, at + 9], [0, 1], {...clamp, easing: easeOut});
        // each newer card pushes this one up and back
        const pushed = shown.slice(i + 1).reduce((acc, n) => acc + interpolate(f, [Math.round(n.atSec * FPS) - 2, Math.round(n.atSec * FPS) + 9], [0, 1], {...clamp, easing: easeOut}), 0);
        const lift = pushed * 34;
        const scale = Math.pow(0.955, pushed);
        const dim = Math.max(0.55, 1 - pushed * 0.2);
        const y = baseTop - lift + (1 - enter) * -90;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: 140,
              top: y,
              width: 800,
              opacity: enter * dim,
              transform: `scale(${scale})`,
              transformOrigin: '50% 100%',
              zIndex: i,
            }}
          >
            <div style={{position: 'relative', display: 'flex', alignItems: 'center', gap: 22, padding: '22px 30px', borderRadius: 34, background: '#1A1C1D', boxShadow: '0 14px 36px rgba(0,0,0,0.42)'}}>
              <MetalRim radius={34} thickness={4} kind="gold" variant="bright" seed={29 + i} />
              {newer === 0 && <Sparkle left="94%" top={8} size={26} phase={i * 0.7} />}
              <div style={{display: 'contents', opacity: 1}} />
              <div style={{opacity: Math.max(0, 1 - pushed * 1.8), display: 'flex', alignItems: 'center', gap: 22, width: '100%'}}>
              <VelvetChip size={78} radius={20} frame={f}>{c.initial}</VelvetChip>
              <div style={{flex: 1, minWidth: 0}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
                  <div style={{fontFamily: handFamilies.covered, fontSize: 46, color: '#fff', whiteSpace: 'nowrap'}}>{c.title}</div>
                  <div style={{fontFamily: sansFamily('DM Sans'), fontWeight: 500, fontSize: 24, color: 'rgba(255,255,255,0.6)'}}>now</div>
                </div>
                <div style={{fontFamily: handFamilies.covered, fontSize: 40, color: 'rgba(255,255,255,0.88)', whiteSpace: 'nowrap'}}>{c.body}</div>
              </div>
              </div>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* ============ G04 Phone mockup: an inset phone with a screen ============ */
export const lsPhoneSchema = z.object({
  header: z.string(),
  rows: z.array(z.object({title: z.string(), meta: z.string()})).min(2).max(5),
  highlight: z.number(),
  fromSec: z.number(),
  toSec: z.number(),
});
export type LSPhoneProps = z.infer<typeof lsPhoneSchema>;

export const LSPhone: React.FC<LSPhoneProps> = ({header, rows, highlight, fromSec, toSec}) => {
  const f = useCurrentFrame();
  const from = Math.round(fromSec * FPS);
  const to = Math.round(toSec * FPS);
  if (f < from || f > to) return null;
  const inP = interpolate(f, [from, from + 12], [0, 1], {...clamp, easing: easeOut});
  const outP = interpolate(f, [to - 8, to], [1, 0], clamp);
  const o = Math.min(inP, outP);
  const W = 340;
  const H = 700;
  const hi = interpolate(f, [from + 30, from + 40], [0, 1], clamp);
  const bars = Array.from({length: 26});
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 90, top: 780, width: W, height: H, opacity: o, transform: `translateY(${(1 - inP) * 60}px) rotate(-4deg)`, transformOrigin: '50% 100%', filter: 'drop-shadow(0 22px 34px rgba(0,0,0,0.5))'}}>
        {/* body */}
        <div style={{position: 'absolute', inset: 0, borderRadius: 54, background: 'linear-gradient(145deg,#3A3F42,#0b0c0c 60%)', padding: 11}}>
          <MetalRim radius={54} thickness={6} kind="copper" variant="bright" seed={31} />
          <Sparkle left="12%" top="4%" size={30} phase={0.4} />
          <Sparkle left="90%" top="94%" size={26} phase={1.9} />
          {/* screen */}
          <div style={{position: 'relative', width: '100%', height: '100%', borderRadius: 44, background: '#050505', overflow: 'hidden'}}>
            {/* island */}
            <div style={{position: 'absolute', top: 12, left: '50%', marginLeft: -48, width: 96, height: 28, borderRadius: 14, background: '#000', zIndex: 3}} />
            <div style={{padding: '66px 22px 0'}}>
              <div style={{fontFamily: handFamilies.covered, fontSize: 44, color: '#fff', marginBottom: 14}}>{header}</div>
              {rows.map((r, i) => {
                const rowIn = interpolate(f, [from + 12 + i * 5, from + 22 + i * 5], [0, 1], {...clamp, easing: easeOut});
                const isHi = i === highlight;
                return (
                  <div key={i} style={{position: 'relative', opacity: rowIn, transform: `translateX(${(1 - rowIn) * 24}px)`, marginBottom: 10, borderRadius: 18, overflow: 'hidden'}}>
                    {isHi && (
                      <div style={{position: 'absolute', inset: 0, opacity: hi}}>
                        <Backdrop kind="crimson" frame={f} />
                        <MetalRim radius={18} thickness={3} kind="copper" variant="bright" seed={37} />
                      </div>
                    )}
                    <div style={{position: 'relative', padding: '10px 16px'}}>
                      <div style={{fontFamily: handFamilies.covered, fontSize: 34, color: '#fff'}}>{r.title}</div>
                      <div style={{fontFamily: sansFamily('DM Sans'), fontWeight: 500, fontSize: 20, color: 'rgba(255,255,255,0.6)'}}>{r.meta}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            {/* waveform + play */}
            <div style={{position: 'absolute', left: 22, right: 22, bottom: 34, opacity: hi}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 4, height: 60, justifyContent: 'space-between'}}>
                {bars.map((_, i) => {
                  const h = 10 + 38 * Math.abs(Math.sin(i * 0.9 + (f / FPS) * 6)) * (0.5 + 0.5 * Math.sin(i * 0.37 + 1));
                  return <div key={i} style={{width: 6, height: h, borderRadius: 3, background: i / bars.length < ((f - from) / (to - from)) * 1.2 ? '#D8895A' : 'rgba(255,255,255,0.55)'}} />;
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ============ G05 Checklist: items tick off one by one ============ */
export const lsChecklistSchema = z.object({
  items: z.array(z.string()).min(2).max(5),
  fromSec: z.number(),
  everySec: z.number(),
});
export type LSChecklistProps = z.infer<typeof lsChecklistSchema>;

export const LSChecklist: React.FC<LSChecklistProps> = ({items, fromSec, everySec}) => {
  const f = useCurrentFrame();
  const from = Math.round(fromSec * FPS);
  const step = Math.round(everySec * FPS);
  const cardIn = interpolate(f, [from - 8, from], [0, 1], {...clamp, easing: easeOut});
  if (f < from - 8) return null;
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 150, top: 1090, width: 780, opacity: cardIn, transform: `translateY(${(1 - cardIn) * 30}px)`}}>
        <div style={{position: 'relative', padding: '30px 38px 26px', borderRadius: 30, background: 'rgba(22,24,25,0.92)', boxShadow: '0 16px 40px rgba(0,0,0,0.45)'}}>
          <MetalRim radius={30} thickness={4} kind="gold" variant="bright" seed={41} />
          <Sparkle left="95%" top={10} size={28} phase={0.2} />
          {items.map((t, i) => {
            const start = from + 10 + i * step;
            const tick = interpolate(f, [start, start + 10], [0, 1], {...clamp, easing: easeOut});
            const strike = interpolate(f, [start + 4, start + 14], [0, 1], clamp);
            return (
              <div key={i} style={{display: 'flex', alignItems: 'center', gap: 26, padding: '8px 0'}}>
                <div style={{position: 'relative', width: 52, height: 52, borderRadius: 26, flexShrink: 0, overflow: 'hidden'}}>
                  <MetalRim radius={26} thickness={3} kind="copper" variant="bright" seed={43 + i} />
                  <div style={{position: 'absolute', inset: 0, opacity: tick}}>
                    <Backdrop kind="crimson" frame={f} />
                  </div>
                  <svg width="52" height="52" viewBox="0 0 52 52" style={{position: 'absolute', inset: -3}}>
                    <path d="M14 27 L23 36 L39 17" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="44" strokeDashoffset={44 * (1 - tick)} />
                  </svg>
                </div>
                <div style={{position: 'relative', fontFamily: handFamilies.covered, fontSize: 56, color: '#fff', opacity: 1 - 0.35 * tick, whiteSpace: 'nowrap'}}>
                  {t}
                  <div style={{position: 'absolute', left: 0, top: '56%', height: 5, width: `${strike * 100}%`, borderRadius: 2, ...metalFill({kind: 'copper', variant: 'bright', frame: f, seed: 47 + i})}} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
