import React from 'react';
import {Freeze, Img, OffthreadVideo, staticFile, useVideoConfig} from 'remotion';
import {brand} from '../brand';
import {handFamily, heavyFamily, sansFamily, serifFamily} from '../fonts';
import {metalFill, metalTextStyle} from '../metal';
import type {Fx} from './schema';
import {easeOutC, fxRange, pop, tw, useFxEnv, useFxTime} from './util';

type Of<T extends Fx['type']> = Extract<Fx, {type: T}>;
const FILL: React.CSSProperties = {position: 'absolute', left: 0, top: 0, width: 1080, height: 1920};
const SANS = sansFamily('DM Sans');
const GLASS = 'rgba(12,13,15,0.84)';
const HAIR = '1.5px solid rgba(213,170,74,0.75)';

const useSpan = (fx: Fx) => {
  const [a, b] = fxRange(fx);
  const {t, abs, frame, fps} = useFxTime(a);
  const len = b - a;
  return {a, b, len, t, abs, frame, fps, inK: tw(t, 0, 0.3, 0, 1, pop), outK: 1 - tw(t, len - 0.3, len)};
};
const rand = (i: number, salt = 1) => {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// ---------------------------------------------------------------- flash frame
export const FlashFrame: React.FC<{fx: Of<'flash-frame'>}> = ({fx}) => {
  const {frame} = useFxTime(fx.at);
  const n = fx.props.frames;
  const o = frame < n ? 1 - (frame / n) * 0.55 : 0;
  return <div style={{...FILL, background: fx.props.color === 'warm' ? '#FFE9C7' : '#ffffff', opacity: o}} />;
};

// ---------------------------------------------------------------- freeze and hold
export const FreezeHold: React.FC<{fx: Of<'freeze-hold'>}> = ({fx}) => {
  const {a, t, fps, outK} = useSpan(fx);
  const {video} = useFxEnv();
  const k = tw(t, 0.25, 0.55, 0, 1, pop);
  return (
    <div style={{...FILL, opacity: outK > 0.99 ? 1 : outK}}>
      <Freeze frame={0}>
        <OffthreadVideo src={staticFile(video)} muted startFrom={Math.round(a * fps)} style={{...FILL, objectFit: 'cover', filter: fx.props.desaturate ? 'saturate(0.55) contrast(1.05)' : undefined}} />
      </Freeze>
      <div style={{...FILL, background: 'radial-gradient(120% 90% at 50% 40%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.45) 100%)'}} />
      {fx.props.text && (
        <div style={{position: 'absolute', left: 40, right: 40, top: 1280, textAlign: 'center', fontFamily: serifFamily, fontStyle: 'italic', fontWeight: 800, fontSize: 112, lineHeight: 1.05, opacity: k, transform: `scale(${0.85 + 0.15 * k})`, ...metalTextStyle({kind: 'gold', variant: 'bright', frame: 0, shimmer: false}), filter: 'drop-shadow(0 6px 22px rgba(0,0,0,0.8))'}}>{fx.props.text}</div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------- looks: grade, glow, dust (drawn inside her frame), letterbox (over)
const GRADES: Record<string, {a: string; b: string; blend: React.CSSProperties['mixBlendMode']; c?: string}> = {
  'golden-hour': {a: 'rgba(255,164,64,0.7)', b: 'rgba(255,110,30,0.42)', blend: 'soft-light', c: 'rgba(255,196,110,0.16)'},
  'blue-hour': {a: 'rgba(70,110,230,0.75)', b: 'rgba(20,30,120,0.5)', blend: 'soft-light', c: 'rgba(20,40,120,0.18)'},
  warm: {a: 'rgba(255,150,90,0.4)', b: 'rgba(255,120,60,0.2)', blend: 'soft-light'},
  cool: {a: 'rgba(90,150,255,0.4)', b: 'rgba(40,80,200,0.2)', blend: 'soft-light'},
};
export const GradeLayer: React.FC<{fx: Of<'grade'>}> = ({fx}) => {
  const {t, len} = useSpan(fx);
  const g = GRADES[fx.props.look];
  const k = fx.props.strength * tw(t, 0, 0.6) * (1 - tw(t, len - 0.6, len));
  return (
    <>
      <div style={{...FILL, background: `linear-gradient(180deg, ${g.a}, ${g.b})`, mixBlendMode: g.blend, opacity: Math.min(1, k * 2.1)}} />
      {g.c && <div style={{...FILL, background: g.c, mixBlendMode: 'multiply', opacity: k * 0.9}} />}
    </>
  );
};

export const GlowLayer: React.FC<{fx: Of<'glow'>}> = ({fx}) => {
  const {a, t, fps, len} = useSpan(fx);
  const {video, videoStyle} = useFxEnv();
  const k = fx.props.strength * tw(t, 0, 0.6) * (1 - tw(t, len - 0.6, len));
  return <OffthreadVideo src={staticFile(video)} muted startFrom={Math.round(a * fps)} style={{...FILL, objectFit: 'cover', ...videoStyle, filter: `blur(${fx.props.blurPx}px) brightness(1.5) saturate(1.1)`, mixBlendMode: 'screen', opacity: k}} />;
};

export const DustLayer: React.FC<{fx: Of<'dust'>}> = ({fx}) => {
  const {frame, t, len} = useSpan(fx);
  const k = fx.props.strength * tw(t, 0, 0.8) * (1 - tw(t, len - 0.8, len));
  return (
    <div style={{...FILL, mixBlendMode: 'screen', opacity: k, pointerEvents: 'none'}}>
      {Array.from({length: fx.props.count}).map((_, i) => {
        const size = 2 + rand(i, 2) * 6;
        const speed = 8 + rand(i, 3) * 26; // px per second, upward
        const x0 = rand(i, 4) * 1080;
        const y0 = rand(i, 5) * 1920;
        const y = (((y0 - (frame / 30) * speed) % 1920) + 1920) % 1920;
        const x = x0 + Math.sin(frame / 30 * (0.4 + rand(i, 6)) + i) * (14 + rand(i, 7) * 26);
        const tw2 = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(frame / 30 * (1 + rand(i, 8) * 2) + i * 3));
        return <div key={i} style={{position: 'absolute', left: x, top: y, width: size, height: size, borderRadius: size, background: 'rgba(255,236,206,0.95)', filter: `blur(${size > 5 ? 1.6 : 0.6}px)`, opacity: tw2 * (0.4 + 0.6 * rand(i, 9))}} />;
      })}
    </div>
  );
};

export const Letterbox: React.FC<{fx: Of<'letterbox'>}> = ({fx}) => {
  const {t, len} = useSpan(fx);
  const h = fx.props.heightPx * tw(t, 0, fx.props.animSec) * (1 - tw(t, len - fx.props.animSec, len));
  return (
    <>
      <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: h, background: '#000'}} />
      <div style={{position: 'absolute', left: 0, bottom: 0, width: 1080, height: h, background: '#000'}} />
    </>
  );
};

// ---------------------------------------------------------------- voice memo card (waveform driven by when she speaks)
const speechEnv = (spans: [number, number][] | undefined, t: number) => {
  if (!spans) return 0.5;
  for (const [a, b] of spans) {
    if (t >= a && t <= b) return 1;
    if (t > b && t - b < 0.18) return 1 - (t - b) / 0.18;
    if (t < a && a - t < 0.1) return 1 - (a - t) / 0.1;
  }
  return 0;
};
export const VoiceMemo: React.FC<{fx: Of<'voice-memo'>}> = ({fx}) => {
  const {t, abs, inK, outK, frame} = useSpan(fx);
  const {speech} = useFxEnv();
  const bars = 54;
  const mm = Math.floor(t / 60);
  const ss = Math.floor(t % 60);
  const blink = Math.floor(frame / 15) % 2 === 0;
  return (
    <div style={{...FILL, opacity: outK}}>
      <div style={{position: 'absolute', left: 50, top: 1180, width: 980, height: 360, borderRadius: 40, background: GLASS, border: HAIR, boxSizing: 'border-box', padding: '28px 40px', opacity: inK, transform: `translateY(${(1 - inK) * 50}px)`, boxShadow: '0 22px 56px rgba(0,0,0,0.55)'}}>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
            <div style={{width: 20, height: 20, borderRadius: 10, background: brand.crimson, opacity: blink ? 1 : 0.25}} />
            <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 38, color: brand.white}}>{fx.props.title}</div>
          </div>
          <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 38, color: '#E3BF63', letterSpacing: 2}}>{`${mm}:${String(ss).padStart(2, '0')}`}</div>
        </div>
        {fx.props.subtitle && <div style={{fontFamily: SANS, fontWeight: 500, fontSize: 28, color: 'rgba(255,255,255,0.6)', marginTop: 6}}>{fx.props.subtitle}</div>}
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 190, marginTop: 14}}>
          {Array.from({length: bars}).map((_, i) => {
            const tb = abs - (bars - 1 - i) * 0.055;
            const env = speechEnv(speech, tb);
            const h = 10 + (env * (0.35 + 0.65 * rand(Math.floor(tb * 18), 11)) * 170);
            return <div key={i} style={{width: 11, height: h, borderRadius: 6, ...metalFill({kind: 'copper', variant: 'bright', frame: 0, shimmer: false})}} />;
          })}
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- polaroid drop
export const PolaroidDrop: React.FC<{fx: Of<'polaroid-drop'>}> = ({fx}) => {
  const {t, len} = useSpan(fx);
  const dropK = tw(t, 0, 0.55, 0, 1, (x) => 1 - Math.pow(1 - x, 3) + Math.sin(x * Math.PI * 3) * 0.04 * (1 - x));
  const exit = tw(t, len - 0.4, len, 0, 1, (x) => x * x);
  const y = -900 * (1 - dropK) + exit * 1100;
  const rot = fx.props.angle + (1 - dropK) * -24;
  return (
    <div style={{...FILL, pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: 280, top: 700, width: 520, height: 640, background: '#ffffff', borderRadius: 10, boxSizing: 'border-box', padding: '30px 30px 0', transform: `translateY(${y}px) rotate(${rot}deg)`, boxShadow: '0 30px 70px rgba(0,0,0,0.6)'}}>
        <div style={{width: 460, height: 460, overflow: 'hidden', background: 'linear-gradient(160deg,#C91B19,#2a0507)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          {fx.props.src ? <Img src={staticFile(fx.props.src)} style={{width: 460, height: 460, objectFit: 'cover'}} /> : <div style={{fontFamily: serifFamily, fontStyle: 'italic', fontSize: 40, color: 'rgba(255,255,255,0.85)'}}>photo goes here</div>}
        </div>
        {fx.props.caption && <div style={{fontFamily: handFamily, fontWeight: 700, fontSize: 64, color: '#2b2b2b', textAlign: 'center', marginTop: 20}}>{fx.props.caption}</div>}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- notes page and email compose
export const NotesPage: React.FC<{fx: Of<'notes-page'>}> = ({fx}) => {
  const {abs, inK, outK} = useSpan(fx);
  return (
    <div style={{...FILL, opacity: outK}}>
      <div style={{position: 'absolute', left: 60, top: 1010, width: 960, minHeight: 560, borderRadius: 34, background: '#ffffff', border: '2px solid rgba(213,170,74,0.8)', boxSizing: 'border-box', padding: '30px 46px', opacity: inK, transform: `translateY(${(1 - inK) * 50}px) scale(${0.96 + 0.04 * inK})`, boxShadow: '0 24px 60px rgba(0,0,0,0.5)'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8}}>
          <div style={{width: 18, height: 18, borderRadius: 9, background: '#D5AA4A'}} />
          <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 26, letterSpacing: 4, textTransform: 'uppercase', color: '#8E6B1E'}}>Notes</div>
        </div>
        <div style={{fontFamily: serifFamily, fontStyle: 'italic', fontWeight: 700, fontSize: 60, color: brand.charcoal, marginBottom: 14}}>{fx.props.title}</div>
        {fx.props.lines.map((l, i) => {
          const shown = l.text.slice(0, Math.floor(tw(abs, l.at, l.at + Math.max(0.5, l.text.length * 0.035), 0, l.text.length, (x) => x)));
          return (
            <div key={i} style={{fontFamily: SANS, fontWeight: 500, fontSize: 44, lineHeight: 1.35, color: brand.charcoal, minHeight: 60, borderBottom: '1px solid rgba(58,63,66,0.14)', padding: '6px 0'}}>{shown}</div>
          );
        })}
      </div>
    </div>
  );
};

export const EmailCompose: React.FC<{fx: Of<'email-compose'>}> = ({fx}) => {
  const {abs, a, inK, outK} = useSpan(fx);
  const typeAt = fx.props.typeAt ?? a + 0.6;
  const sendAt = fx.props.sendAt ?? a + 3.6;
  const body = fx.props.body.slice(0, Math.floor(tw(abs, typeAt, typeAt + Math.max(1, fx.props.body.length * 0.04), 0, fx.props.body.length, (x) => x)));
  const sent = abs >= sendAt;
  const press = tw(abs, sendAt - 0.15, sendAt);
  const fly = tw(abs, sendAt, sendAt + 0.5, 0, 1, (x) => x * x);
  return (
    <div style={{...FILL, opacity: outK}}>
      <div style={{position: 'absolute', left: 60, top: 1020, width: 960, borderRadius: 30, background: '#ffffff', border: '2px solid rgba(213,170,74,0.8)', boxSizing: 'border-box', overflow: 'hidden', opacity: inK * (1 - fly), transform: `translateY(${(1 - inK) * 50 - fly * 300}px) scale(${0.96 + 0.04 * inK - fly * 0.2})`, boxShadow: '0 24px 60px rgba(0,0,0,0.5)'}}>
        <div style={{background: '#17191b', color: '#fff', fontFamily: SANS, fontWeight: 700, fontSize: 28, letterSpacing: 3, textTransform: 'uppercase', padding: '18px 36px'}}>New message</div>
        <div style={{padding: '12px 36px 22px'}}>
          {[['To', fx.props.to], ['Subject', fx.props.subject]].map(([k, v]) => (
            <div key={k} style={{display: 'flex', gap: 18, fontFamily: SANS, fontSize: 36, color: brand.charcoal, padding: '14px 0', borderBottom: '1px solid rgba(58,63,66,0.14)'}}>
              <span style={{color: 'rgba(58,63,66,0.55)', width: 130}}>{k}</span>
              <span style={{fontWeight: 700}}>{v}</span>
            </div>
          ))}
          <div style={{fontFamily: SANS, fontWeight: 500, fontSize: 40, lineHeight: 1.35, color: brand.charcoal, minHeight: 210, paddingTop: 16}}>{body}</div>
          <div style={{display: 'inline-block', marginTop: 6, padding: '14px 40px', borderRadius: 14, fontFamily: SANS, fontWeight: 700, fontSize: 34, color: '#2a1206', transform: `scale(${1 - 0.06 * press})`, ...metalFill({kind: 'gold', variant: 'bright', frame: 0, shimmer: false})}}>{sent ? 'Sent' : 'Send'}</div>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- lock-screen notification
export const LockScreen: React.FC<{fx: Of<'lock-screen'>}> = ({fx}) => {
  const {t, len} = useSpan(fx);
  const inK = tw(t, 0, 0.5, 0, 1, pop);
  const out = tw(t, len - 0.35, len);
  return (
    <div style={{...FILL, pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: 36, top: 190, width: 1008, borderRadius: 40, background: 'rgba(36,38,40,0.94)', border: '1px solid rgba(255,255,255,0.16)', boxSizing: 'border-box', padding: '26px 30px', transform: `translateY(${(1 - inK) * -380 - out * 380}px)`, opacity: Math.min(1, inK * 2) * (1 - out), boxShadow: '0 24px 60px rgba(0,0,0,0.5)'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14}}>
          <div style={{width: 54, height: 54, borderRadius: 14, background: `linear-gradient(135deg,${brand.crimson},#3d0709)`, border: '2px solid #D5AA4A'}} />
          <div style={{flex: 1, fontFamily: SANS, fontWeight: 700, fontSize: 28, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)'}}>{fx.props.app}</div>
          <div style={{fontFamily: SANS, fontWeight: 500, fontSize: 28, color: 'rgba(255,255,255,0.55)'}}>{fx.props.time}</div>
        </div>
        <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 40, color: brand.white}}>{fx.props.title}</div>
        <div style={{fontFamily: SANS, fontWeight: 500, fontSize: 36, lineHeight: 1.3, color: 'rgba(255,255,255,0.88)', marginTop: 4}}>{fx.props.text}</div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- date stamp
export const DateStamp: React.FC<{fx: Of<'date-stamp'>}> = ({fx}) => {
  const {t, outK} = useSpan(fx);
  const k = tw(t, 0, 0.3, 0, 1, easeOutC);
  const pos: Record<string, React.CSSProperties> = {tl: {left: 50, top: 230}, tr: {right: 50, top: 230}, bl: {left: 50, bottom: 520}, br: {right: 50, bottom: 520}, top: {left: 0, right: 0, top: 230, justifyContent: 'center'}};
  const typed = fx.props.text.slice(0, Math.floor(tw(t, 0.1, 0.1 + fx.props.text.length * 0.035, 0, fx.props.text.length, (x) => x)));
  return (
    <div style={{position: 'absolute', display: 'flex', ...pos[fx.props.position], opacity: k * outK, pointerEvents: 'none'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 14, padding: '12px 26px 12px 18px', borderRadius: 14, background: 'rgba(0,0,0,0.62)', border: HAIR}}>
        <div style={{width: 8, height: 40, borderRadius: 4, ...metalFill({kind: 'copper', variant: 'bright', frame: 0, shimmer: false})}} />
        <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 34, letterSpacing: 5, textTransform: 'uppercase', color: brand.white}}>{typed}</div>
      </div>
    </div>
  );
};

/** drawn inside her frame, above her cutout */
export const lookLayer = (fx: Fx): React.ReactNode => {
  switch (fx.type) {
    case 'grade':
      return <GradeLayer fx={fx} />;
    case 'glow':
      return <GlowLayer fx={fx} />;
    case 'dust':
      return <DustLayer fx={fx} />;
    default:
      return null;
  }
};
export const LOOKS: Fx['type'][] = ['grade', 'glow', 'dust'];

/** drawn above the scene graphics */
export const extraOver = (fx: Fx): React.ReactNode => {
  switch (fx.type) {
    case 'flash-frame':
      return <FlashFrame fx={fx} />;
    case 'freeze-hold':
      return <FreezeHold fx={fx} />;
    case 'letterbox':
      return <Letterbox fx={fx} />;
    case 'voice-memo':
      return <VoiceMemo fx={fx} />;
    case 'polaroid-drop':
      return <PolaroidDrop fx={fx} />;
    case 'notes-page':
      return <NotesPage fx={fx} />;
    case 'email-compose':
      return <EmailCompose fx={fx} />;
    case 'lock-screen':
      return <LockScreen fx={fx} />;
    case 'date-stamp':
      return <DateStamp fx={fx} />;
    default:
      return null;
  }
};
export {heavyFamily, useVideoConfig};
