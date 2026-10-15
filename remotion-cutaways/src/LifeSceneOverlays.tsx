import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {z} from 'zod';
import {brand} from './brand';
import {Backdrop} from './backdrops';
import {handFamilies, loadBrandFonts, sansFamily} from './fonts';
import {MetalRim, MetalText, metalFill} from './metal';
import {Sparkle} from './sparkle';

loadBrandFonts();

const FPS = 24;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/* ---------- shared: crimson velvet surface with a holographic rim ---------- */
const Velvet: React.FC<{frame: number; radius: number | string}> = ({frame, radius}) => {
  const t = frame / FPS;
  return (
    <>
      <div style={{position: 'absolute', inset: 0, opacity: 0.88}}>
        <Backdrop kind="crimson" frame={frame} />
      </div>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'linear-gradient(115deg, rgba(255,255,255,0) 32%, rgba(255,255,255,0.17) 48%, rgba(255,255,255,0) 64%)',
          backgroundSize: '260% 100%',
          backgroundPosition: `${120 - ((t * 38) % 140)}% 0`,
        }}
      />
      <MetalRim radius={radius} thickness={5} kind="copper" variant="bright" seed={5} />
      <Sparkle left="8%" top={10} size={28} phase={0} />
      <Sparkle left="94%" top="86%" size={24} phase={1.5} />
    </>
  );
};

/* ---------- STYLE 1: text message ---------- */
export const lsMessageSchema = z.object({
  /** what she sends (types out) */
  sent: z.string(),
  /** the reply that comes back */
  reply: z.string(),
  typeFromSec: z.number(),
  replyFromSec: z.number(),
});
export type LSMessageProps = z.infer<typeof lsMessageSchema>;

const Dots: React.FC<{f: number}> = ({f}) => (
  <div style={{display: 'flex', gap: 10, padding: '4px 6px'}}>
    {[0, 1, 2].map((i) => {
      const o = 0.35 + 0.65 * Math.max(0, Math.sin((f / FPS) * 7 - i * 0.9));
      return <div key={i} style={{width: 16, height: 16, borderRadius: 8, background: '#fff', opacity: o}} />;
    })}
  </div>
);

export const LSMessage: React.FC<LSMessageProps> = ({sent, reply, typeFromSec, replyFromSec}) => {
  const f = useCurrentFrame();
  const typeFrom = Math.round(typeFromSec * FPS);
  const cps = 13;
  const typed = Math.max(0, Math.min(sent.length, Math.floor(((f - typeFrom) / FPS) * cps)));
  const typingEnd = typeFrom + Math.ceil((sent.length / cps) * FPS);
  const popIn = interpolate(f, [typeFrom - 6, typeFrom], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const sentTagO = interpolate(f, [typingEnd + 6, typingEnd + 12], [0, 1], clamp);

  const dotsFrom = Math.round((replyFromSec - 1.2) * FPS);
  const replyFrom = Math.round(replyFromSec * FPS);
  const dotsPop = interpolate(f, [dotsFrom, dotsFrom + 6], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const replyPop = interpolate(f, [replyFrom, replyFrom + 6], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});

  const bubbleFont = {fontFamily: handFamilies.covered, fontSize: 52, lineHeight: 1.2, color: '#fff', whiteSpace: 'nowrap' as const};

  return (
    <AbsoluteFill>
      {/* outgoing, right side, inside the safe band */}
      {f >= typeFrom - 6 && (
        <div style={{position: 'absolute', right: 130, top: 1080, opacity: popIn, transform: `scale(${0.92 + 0.08 * popIn})`, transformOrigin: 'right bottom'}}>
          <div style={{position: 'relative', borderRadius: '34px 34px 8px 34px', overflow: 'hidden', boxShadow: '0 12px 34px rgba(0,0,0,0.38)'}}>
            <Velvet frame={f} radius="34px 34px 8px 34px" />
            <div style={{position: 'relative', padding: '22px 38px 26px', ...bubbleFont, textShadow: '0 2px 10px rgba(60,0,0,0.45)'}}>
              <span>{sent.slice(0, typed)}</span>
              <span style={{opacity: 0}}>{sent.slice(typed)}</span>
            </div>
          </div>
          <div style={{textAlign: 'right', marginTop: 10, marginRight: 8, fontFamily: sansFamily('DM Sans'), fontWeight: 700, fontSize: 28, opacity: sentTagO, filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.7))'}}>
            <MetalText kind="gold" variant="bright" seed={13}>Sent</MetalText>
          </div>
        </div>
      )}
      {/* incoming, left side: typing dots, then the reply */}
      {f >= dotsFrom && f < replyFrom && (
        <div style={{position: 'absolute', left: 90, top: 1250, opacity: dotsPop, transform: `scale(${0.92 + 0.08 * dotsPop})`, transformOrigin: 'left bottom'}}>
          <div style={{position: 'relative', background: 'rgba(58,63,66,0.9)', borderRadius: '34px 34px 34px 8px', padding: '24px 34px', boxShadow: '0 12px 34px rgba(0,0,0,0.38)'}}>
            <MetalRim radius="34px 34px 34px 8px" thickness={4} kind="gold" variant="bright" seed={11} />
            <Dots f={f} />
          </div>
        </div>
      )}
      {f >= replyFrom && (
        <div style={{position: 'absolute', left: 90, top: 1250, opacity: replyPop, transform: `scale(${0.92 + 0.08 * replyPop})`, transformOrigin: 'left bottom'}}>
          <div style={{position: 'relative', background: 'rgba(58,63,66,0.9)', borderRadius: '34px 34px 34px 8px', padding: '22px 38px 26px', maxWidth: 640, boxShadow: '0 12px 34px rgba(0,0,0,0.38)', ...bubbleFont}}>
            <MetalRim radius="34px 34px 34px 8px" thickness={4} kind="gold" variant="bright" seed={11} />
            {reply}
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

/* ---------- STYLE 2: handwritten note ---------- */
export const lsNoteSchema = z.object({
  lines: z.array(z.string()).min(1).max(4),
  fromSec: z.number(),
});
export type LSNoteProps = z.infer<typeof lsNoteSchema>;

export const LSNote: React.FC<LSNoteProps> = ({lines, fromSec}) => {
  const f = useCurrentFrame();
  const from = Math.round(fromSec * FPS);
  const pop = interpolate(f, [from - 8, from], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const perLine = 28; // frames to "write" one line
  const startWrite = from + 6;
  const lastEnd = startWrite + lines.length * perLine;
  const underline = interpolate(f, [lastEnd, lastEnd + 12], [0, 1], clamp);
  if (f < from - 8) return null;
  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: 100,
          top: 1090,
          width: 560,
          opacity: pop,
          transform: `rotate(-3deg) translateY(${(1 - pop) * 24}px)`,
          transformOrigin: 'left bottom',
        }}
      >
        {/* white paper */}
        <div style={{background: brand.white, padding: '54px 46px 42px', boxShadow: '0 16px 40px rgba(0,0,0,0.42)', borderRadius: 4, position: 'relative'}}>
          {/* crimson velvet tape */}
          <div style={{position: 'absolute', top: -20, left: '50%', marginLeft: -90, width: 180, height: 44, overflow: 'hidden', transform: 'rotate(2deg)', opacity: 0.95, boxShadow: '0 4px 10px rgba(0,0,0,0.3)'}}>
            <Backdrop kind="crimson" frame={f} />
            <MetalRim radius={2} thickness={3} kind="copper" variant="bright" seed={19} />
          </div>
          {lines.map((l, i) => {
            const p = interpolate(f, [startWrite + i * perLine, startWrite + (i + 1) * perLine], [0, 1], clamp);
            return (
              <div key={i} style={{clipPath: `inset(-10% ${100 - p * 100}% -10% 0)`, fontFamily: handFamilies.covered, fontSize: 64, lineHeight: 1.22, color: brand.charcoal, whiteSpace: 'nowrap'}}>
                {l}
              </div>
            );
          })}
          <div style={{height: 6, marginTop: 8, width: `${underline * 62}%`, borderRadius: 3, ...metalFill({kind: 'copper', variant: 'deep', frame: f, seed: 17})}} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
