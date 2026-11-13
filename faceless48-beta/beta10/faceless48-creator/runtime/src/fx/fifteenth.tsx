import React from 'react';
import {Img, OffthreadVideo, staticFile} from 'remotion';
import {handFamily, heavyFamily, serifFamily} from '../fonts';
import {Label, Panel, Scrim, Title} from './eleventh';
import {useSpan} from './fourth';
import type {Fx} from './schema';
import {BrandAvatar, C3, CheckMark, ROSE, ROSE_TEXT} from './theme';
import {fxRange, pop, tw, useFxEnv, useFxTime} from './util';

/**
 * Fifteenth FX batch (beta 11): the comparison reel set plus upgrade batch 2.
 * New effects: side-by-side, vote-pill, duotone, big-stat, thank-you, wall-text (behind her, needs the cutout).
 * Second versions (`version: 2` in props; the originals stay the default): before-after, flash-frame, kinetic-hook,
 * giant-caption, follow-card, checklist.
 */
type Of<T extends Fx['type']> = Extract<Fx, {type: T}>;
const FILL: React.CSSProperties = {position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, pointerEvents: 'none'};
const SANS = C3.sans;
const GLASS = 'linear-gradient(160deg, rgba(40,42,52,0.78), rgba(14,15,20,0.86))';
const smooth = (x: number) => x * x * (3 - 2 * x);
const isClip = (src: string) => /\.(mp4|mov|webm)$/i.test(src);
const Media: React.FC<{src: string}> = ({src}) =>
  isClip(src) ? <OffthreadVideo src={staticFile(src)} muted style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block'}} /> : <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block'}} />;
const Clip: React.FC<{from: number; style?: React.CSSProperties}> = ({from, style}) => {
  const {video, videoStyle} = useFxEnv();
  return <OffthreadVideo src={staticFile(video)} muted startFrom={from} style={{...FILL, objectFit: 'cover', ...videoStyle, ...style}} />;
};
const Pill: React.FC<{text: string; win?: boolean; style?: React.CSSProperties}> = ({text, win, style}) => (
  <div style={{padding: '10px 28px', borderRadius: 30, background: win ? C3.accent : 'rgba(0,0,0,0.72)', border: '1.5px solid rgba(255,255,255,0.3)', fontFamily: SANS, fontWeight: 700, fontSize: 32, letterSpacing: 4, textTransform: 'uppercase', color: '#fff', whiteSpace: 'nowrap', ...style}}>{text}</div>
);

// ---------------------------------------------------------------- before-after v2: the two versions side by side, each with its label
export const BeforeAfterV2: React.FC<{fx: Of<'before-after'>}> = ({fx}) => {
  const {a, t, fps, len} = useSpan(fx);
  const k = tw(t, 0, 0.55, 0, 1, smooth) * (1 - tw(t, len - 0.45, len, 0, 1, smooth));
  const from = Math.round(a * fps);
  // each half shows her centered in its own panel
  const half = (left: boolean) => (
    <div style={{position: 'absolute', left: left ? 0 : 540, top: 0, width: 540, height: 1920, overflow: 'hidden', transform: left ? `translateX(${(k - 1) * 540}px)` : undefined}}>
      <div style={{position: 'absolute', left: left ? -270 * k : -540 + 270 * k, top: 0, width: 1080, height: 1920}}>
        <Clip from={from} style={left ? {filter: 'saturate(0.35) contrast(0.82) brightness(1.08)'} : undefined} />
      </div>
    </div>
  );
  if (k <= 0.001) return null;
  return (
    <div style={{...FILL, overflow: 'hidden'}}>
      {half(false)}
      {half(true)}
      <div style={{position: 'absolute', left: 540 * k - 3, top: 0, width: 6, height: 1920, background: `linear-gradient(180deg, ${ROSE.light}, ${ROSE.stops[1]} 35%, ${ROSE.light} 55%, ${ROSE.stops[3]} 80%, ${ROSE.stops[4]})`, boxShadow: `0 0 30px 6px rgba(${ROSE.glow},0.6)`, opacity: Math.min(1, k * 3)}} />
      <Pill text={fx.props.beforeLabel} style={{position: 'absolute', left: 270 - 130, width: 260, textAlign: 'center', boxSizing: 'border-box', top: 260, opacity: tw(t, 0.45, 0.75) * k}} />
      <Pill text={fx.props.afterLabel} win style={{position: 'absolute', left: 810 - 130, width: 260, textAlign: 'center', boxSizing: 'border-box', top: 260, opacity: tw(t, 0.6, 0.9) * k}} />
    </div>
  );
};

// ---------------------------------------------------------------- side by side: two of the member's own pictures or clips, labeled; the winner lifts
export const SideBySide: React.FC<{fx: Of<'side-by-side'>}> = ({fx}) => {
  const {t, abs, inK, outK} = useSpan(fx);
  const {left, right, title, winner, y, height} = fx.props;
  const pickAt = fx.props.pickAt ?? fx.at + 1.6;
  const pick = winner ? tw(abs, pickAt, pickAt + 0.4, 0, 1, pop) : 0;
  const card = (m: {src: string; label: string}, side: 'left' | 'right', i: number) => {
    const win = winner === side;
    const k = tw(t, 0.1 + i * 0.18, 0.55 + i * 0.18, 0, 1, pop);
    return (
      <div style={{flex: 1, transform: `translateY(${(1 - k) * 60}px) rotate(${(i ? 2 : -2) * (1 - pick * (win ? 1 : 0))}deg) scale(${win ? 1 + 0.05 * pick : 1 - 0.04 * pick})`, opacity: k * (winner && !win ? 1 - 0.4 * pick : 1)}}>
        <div style={{height, borderRadius: 26, overflow: 'hidden', border: win ? `5px solid rgba(${ROSE.glow},${0.4 + 0.6 * pick})` : '5px solid #fff', boxSizing: 'border-box', boxShadow: win ? `0 0 ${60 * pick}px rgba(${ROSE.glow},0.5), 0 26px 60px rgba(0,0,0,0.5)` : '0 26px 60px rgba(0,0,0,0.5)', background: '#16171c'}}>
          <Media src={m.src} />
        </div>
        <div style={{display: 'flex', justifyContent: 'center', marginTop: -30}}><Pill text={m.label} win={win && pick > 0.5} /></div>
      </div>
    );
  };
  return (
    <>
      <Scrim fx={fx} top={y} />
      <div style={{...FILL, opacity: outK}}>
        <div style={{position: 'absolute', left: 60, width: 960, top: y, fontFamily: SANS, color: '#fff'}}>
          <Title text={title} k={inK} />
          <div style={{display: 'flex', gap: 30}}>
            {card(left, 'left', 0)}
            {card(right, 'right', 1)}
          </div>
        </div>
      </div>
    </>
  );
};

// ---------------------------------------------------------------- vote pill: a question with two answers; one gets picked
export const VotePill: React.FC<{fx: Of<'vote-pill'>}> = ({fx}) => {
  const {abs, inK, outK} = useSpan(fx);
  const {question, a, b, pick, y} = fx.props;
  const pickAt = fx.props.pickAt ?? fx.at + 1.3;
  const p = pick ? tw(abs, pickAt, pickAt + 0.35, 0, 1, pop) : 0;
  const press = pick ? tw(abs, pickAt - 0.1, pickAt, 0, 1) * (1 - tw(abs, pickAt, pickAt + 0.2)) : 0;
  const side = (text: string, me: 'a' | 'b') => {
    const win = pick === me;
    return (
      <div style={{flex: 1, height: 96, borderRadius: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, fontWeight: 700, fontSize: 38, color: '#fff', background: win ? `rgba(201,27,25,${0.25 + 0.75 * p})` : 'rgba(255,255,255,0.12)', border: `1.5px solid rgba(255,255,255,${win ? 0.5 : 0.22})`, transform: `scale(${win ? 1 - 0.06 * press + 0.04 * p : 1})`, opacity: pick && !win ? 1 - 0.45 * p : 1}}>
        {win && p > 0.5 && <CheckMark size={36} />}
        {text}
      </div>
    );
  };
  return (
    <div style={{...FILL, opacity: outK}}>
      <div style={{position: 'absolute', left: 90, width: 900, top: y, padding: '26px 26px 24px', boxSizing: 'border-box', borderRadius: 44, background: GLASS, border: '1.5px solid rgba(255,255,255,0.24)', boxShadow: '0 26px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.18)', backdropFilter: 'blur(22px) saturate(1.3)', fontFamily: SANS, color: '#fff', opacity: inK, transform: `translateY(${(1 - inK) * 50}px) scale(${0.95 + 0.05 * inK})`}}>
        <div style={{textAlign: 'center', fontWeight: 700, fontSize: 40, marginBottom: 20}}>{question}</div>
        <div style={{display: 'flex', gap: 18}}>
          {side(a, 'a')}
          {side(b, 'b')}
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- flash-frame v2: a brand-color flash that wipes across as a transition
export const FlashFrameV2: React.FC<{fx: Of<'flash-frame'>}> = ({fx}) => {
  const {t, len} = useSpan(fx);
  const p = tw(t, 0, len, 0, 1, (x) => x);
  // a slanted band enters from the left, covers the frame at the midpoint, and leaves to the right
  const x = -1700 + p * 3400;
  return (
    <div style={{...FILL, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: x - 260, top: -200, width: 1600, height: 2400, transform: 'skewX(-14deg)', background: `linear-gradient(90deg, ${C3.accentDeep} 0%, ${C3.accent} 30%, ${C3.accent} 70%, ${C3.accentDeep} 100%)`, boxShadow: `-14px 0 0 ${ROSE.mid}, 14px 0 0 ${ROSE.light}`}} />
      <div style={{...FILL, background: '#fff', opacity: 0.1 * Math.sin(Math.PI * p)}} />
    </div>
  );
};

// ---------------------------------------------------------------- poster type (kinetic-hook v2 and giant-caption v2)
type PLine = {text: string; face: 'serif' | 'sans' | 'italic'; at: number};
const PosterLines: React.FC<{lines: PLine[]; abs: number; y: number; out: number; width?: number}> = ({lines, abs, y, out, width = 980}) => {
  const W = width;
  const X = (1080 - W) / 2;
  const sc = W / 980;
  const sized = lines.map((l) => {
    const heavy = l.face === 'sans';
    const per = heavy ? 0.56 : 0.56;
    const fs = Math.min((heavy ? 330 : 250) * sc, W / (Math.max(2, l.text.length) * per));
    return {...l, heavy, fs, h: fs * (heavy ? 1.02 : 1.05)};
  });
  const total = sized.reduce((s, l) => s + l.h, 0);
  let top = y - total / 2;
  return (
    <div style={{...FILL, opacity: out}}>
      <div style={{...FILL, top: y - total / 2 - 200, height: total + 400, background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.6) 25%, rgba(0,0,0,0.6) 75%, rgba(0,0,0,0) 100%)', opacity: tw(abs, lines[0].at, lines[0].at + 0.3)}} />
      <div style={{position: 'absolute', left: X, top: y - total / 2 - 26 * sc, width: W * tw(abs, lines[0].at, lines[0].at + 0.5), height: 6, background: '#fff'}} />
      {sized.map((l, i) => {
        const k = tw(abs, l.at, l.at + 0.42);
        const myTop = top;
        top += l.h;
        return (
          <div key={i} style={{position: 'absolute', left: X, width: W, top: myTop, height: l.h, overflow: 'hidden'}}>
            <div style={{transform: `translateY(${(1 - k) * 105}%)`, fontFamily: l.heavy ? heavyFamily : serifFamily, fontStyle: l.face === 'italic' ? 'italic' : 'normal', fontWeight: l.heavy ? 400 : 900, fontSize: l.fs, lineHeight: `${l.h}px`, letterSpacing: l.heavy ? 1 : -3, textTransform: l.heavy ? 'uppercase' : 'none', ...(l.face === 'italic' ? ROSE_TEXT : {color: '#fff'}), whiteSpace: 'nowrap'}}>{l.text}</div>
          </div>
        );
      })}
      <div style={{position: 'absolute', left: X, top: y + total / 2 + 14 * sc, width: W * tw(abs, lines[lines.length - 1].at + 0.2, lines[lines.length - 1].at + 0.7), height: 6, background: C3.accent}} />
    </div>
  );
};
export const KineticHookV2: React.FC<{fx: Of<'kinetic-hook'>}> = ({fx}) => {
  const {abs, outK} = useSpan(fx);
  const lines = fx.props.lines.map((l, i) => ({text: l.text, face: l.face, at: l.at ?? fx.at + 0.1 + i * 0.3}));
  return <PosterLines lines={lines} abs={abs} y={fx.props.y} out={outK} width={fx.props.width} />;
};
export const GiantCaptionV2: React.FC<{fx: Of<'giant-caption'>}> = ({fx}) => {
  const {abs, outK} = useSpan(fx);
  const {text, accent} = fx.props;
  // the accent word gets its own line in gold italic; the rest splits into short heavy lines
  const rest = accent ? text.replace(accent, '|').split('|').map((s) => s.trim()) : [text];
  const lines: PLine[] = [];
  const push = (s: string) => {
    const words = s.split(' ').filter(Boolean);
    let cur = '';
    for (const w of words) {
      if (cur && (cur + ' ' + w).length > 14) { lines.push({text: cur, face: 'sans', at: 0}); cur = w; } else cur = cur ? cur + ' ' + w : w;
    }
    if (cur) lines.push({text: cur, face: 'sans', at: 0});
  };
  push(rest[0]);
  if (accent && text.includes(accent)) lines.push({text: accent, face: 'italic', at: 0});
  if (rest[1]) push(rest[1]);
  lines.forEach((l, i) => { l.at = fx.at + 0.08 + i * 0.22; });
  return <PosterLines lines={lines.slice(0, 5)} abs={abs} y={fx.props.y} out={outK} width={fx.props.width} />;
};

// ---------------------------------------------------------------- duotone: her whole picture in two colors
export const Duotone: React.FC<{fx: Of<'duotone'>}> = ({fx}) => {
  const {inK, outK} = useSpan(fx);
  const k = Math.min(1, inK) * outK;
  const {dark, light} = fx.props;
  return (
    <div style={{...FILL, opacity: k}}>
      <div style={{...FILL, backdropFilter: 'grayscale(1) contrast(1.25)', WebkitBackdropFilter: 'grayscale(1) contrast(1.25)'}} />
      <div style={{...FILL, background: dark, mixBlendMode: 'lighten'}} />
      <div style={{...FILL, background: light, mixBlendMode: 'multiply'}} />
    </div>
  );
};

// ---------------------------------------------------------------- big stat: one huge number, poster style
export const BigStat: React.FC<{fx: Of<'big-stat'>}> = ({fx}) => {
  const {t, inK, outK} = useSpan(fx);
  const {value, prefix, suffix, label, sub, y, size} = fx.props;
  const c = tw(t, 0.25, 1.4, 0, 1, (x) => 1 - Math.pow(1 - x, 3));
  const shown = `${prefix}${Math.round(value * c).toLocaleString('en-US')}${suffix}`;
  const full = `${prefix}${Math.round(value).toLocaleString('en-US')}${suffix}`;
  const fs = Math.min(size, 980 / (full.length * 0.47));
  return (
    <>
      <Scrim fx={fx} top={y} />
      <div style={{...FILL, opacity: outK}}>
        <div style={{position: 'absolute', left: 50, width: 980, top: y, opacity: inK, transform: `translateY(${(1 - inK) * 50}px)`, color: '#fff'}}>
          <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 34, letterSpacing: 8, textTransform: 'uppercase', borderTop: '6px solid #fff', paddingTop: 16}}>{label}</div>
          <div style={{fontFamily: heavyFamily, fontSize: fs, lineHeight: 1, letterSpacing: 2, width: 980, textShadow: '0 10px 40px rgba(0,0,0,0.5)'}}>{shown}</div>
          {sub && <div style={{fontFamily: serifFamily, fontStyle: 'italic', fontWeight: 700, fontSize: 56, ...ROSE_TEXT, opacity: tw(t, 1.2, 1.6), borderBottom: `6px solid ${C3.accent}`, paddingBottom: 18}}>{sub}</div>}
        </div>
      </div>
    </>
  );
};

// ---------------------------------------------------------------- thank you: the picture goes black and white, a handwritten line writes on
export const ThankYou: React.FC<{fx: Of<'thank-you'>}> = ({fx}) => {
  const {t, inK, outK} = useSpan(fx);
  const {text, sub, y} = fx.props;
  const k = Math.min(1, inK) * outK;
  const w = tw(t, 0.35, 1.5, 0, 1, (x) => x);
  const fs = Math.min(230, 1500 / Math.max(6, text.length) * 1.5);
  const u = tw(t, 1.4, 1.9);
  return (
    <div style={{...FILL, opacity: k}}>
      <div style={{...FILL, backdropFilter: 'grayscale(1) contrast(1.1) brightness(0.72)', WebkitBackdropFilter: 'grayscale(1) contrast(1.1) brightness(0.72)'}} />
      <div style={{position: 'absolute', left: 40, width: 1000, top: y, textAlign: 'center', fontFamily: handFamily, fontWeight: 700, fontSize: fs, lineHeight: 1.05, color: '#fff', transform: 'rotate(-4deg)', clipPath: `inset(-30px ${100 - w * 100}% -30px -30px)`, textShadow: '0 4px 24px rgba(0,0,0,0.7)'}}>{text}</div>
      <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
        <defs><linearGradient id="tyRose" x1="0" x2="1"><stop offset="0" stopColor={ROSE.stops[0]} /><stop offset="0.3" stopColor={ROSE.stops[1]} /><stop offset="0.5" stopColor={ROSE.stops[2]} /><stop offset="0.75" stopColor={ROSE.stops[3]} /><stop offset="1" stopColor={ROSE.stops[4]} /></linearGradient></defs>
        <path d={`M 250 ${y + fs * 1.22} Q 540 ${y + fs * 1.22 - 46} 840 ${y + fs * 1.22 - 62}`} fill="none" stroke="url(#tyRose)" strokeWidth={8} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - u} />
      </svg>
      {sub && <div style={{position: 'absolute', left: 0, width: 1080, top: y + fs * 1.22 + 40, textAlign: 'center', fontFamily: SANS, fontWeight: 700, fontSize: 34, letterSpacing: 6, textTransform: 'uppercase', color: '#fff', opacity: tw(t, 1.7, 2.1)}}>{sub}</div>}
    </div>
  );
};

// ---------------------------------------------------------------- follow-card v2: a glass end card with the handle, then a FOLLOW stamp lands
export const FollowCardV2: React.FC<{fx: Of<'follow-card'>}> = ({fx}) => {
  const {abs, inK, outK} = useSpan(fx);
  const followAt = fx.props.followAt ?? fx.at + 1.0;
  const s = tw(abs, followAt, followAt + 0.22, 0, 1, (x) => x);
  const y = Math.min(fx.props.y, 1300);
  return (
    <>
      <Scrim fx={fx} top={y} />
      <div style={{...FILL, opacity: outK}}>
        <div style={{position: 'absolute', left: 110, width: 860, top: y, padding: '44px 40px 48px', boxSizing: 'border-box', borderRadius: 44, background: GLASS, border: '1.5px solid rgba(255,255,255,0.24)', boxShadow: '0 30px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.18)', backdropFilter: 'blur(22px) saturate(1.3)', fontFamily: SANS, color: '#fff', textAlign: 'center', opacity: inK, transform: `translateY(${(1 - inK) * 60}px) scale(${0.94 + 0.06 * inK})`}}>
          <div style={{display: 'flex', justifyContent: 'center', marginBottom: 20}}><BrandAvatar size={150} /></div>
          <div style={{fontWeight: 700, fontSize: 62, lineHeight: 1.1}}>{fx.props.handle}</div>
          {fx.props.sub && <div style={{fontFamily: serifFamily, fontStyle: 'italic', fontSize: 40, opacity: 0.85, marginTop: 8}}>{fx.props.sub}</div>}
          {s > 0 && (
            <div style={{position: 'absolute', right: 20, top: 30, padding: '8px 26px', border: `7px solid ${C3.accent}`, borderRadius: 14, fontFamily: heavyFamily, fontSize: 76, letterSpacing: 4, color: C3.accent, background: 'rgba(255,255,255,0.94)', transform: `rotate(12deg) scale(${2.4 - 1.4 * s})`, opacity: Math.min(1, s * 2.5), boxShadow: '0 10px 30px rgba(0,0,0,0.4)'}}>FOLLOW</div>
          )}
        </div>
      </div>
    </>
  );
};

// ---------------------------------------------------------------- checklist v2: one frosted card, boxes get checked on their seconds
export const ChecklistV2: React.FC<{fx: Of<'checklist'>}> = ({fx}) => {
  const {abs, inK, outK} = useSpan(fx);
  const {items, title} = fx.props;
  const y = fx.props.y ?? 1650 - items.length * 104 - (title ? 70 : 0) - 80;
  return (
    <>
      <Scrim fx={fx} top={y} />
      <div style={FILL}>
        <Panel y={y} k={inK} out={outK}>
          {title && <div style={{marginBottom: 14}}><Label text={title} /></div>}
          {items.map((it, i) => {
            const draw = tw(abs, it.at, it.at + 0.3);
            const bump = tw(abs, it.at, it.at + 0.15, 0, 1) * (1 - tw(abs, it.at + 0.15, it.at + 0.4));
            return (
              <div key={i} style={{display: 'flex', alignItems: 'center', gap: 26, height: 104, borderTop: i ? '1px solid rgba(255,255,255,0.12)' : 'none'}}>
                <div style={{flex: 'none', width: 62, height: 62, borderRadius: 16, border: `3px solid ${draw > 0.05 ? ROSE.mid : 'rgba(255,255,255,0.55)'}`, background: draw > 0.05 ? `rgba(${ROSE.glow},${0.25 * draw})` : 'transparent', boxSizing: 'border-box', display: 'grid', placeItems: 'center', transform: `scale(${1 + 0.18 * bump})`}}>
                  <svg width={38} height={38} viewBox="0 0 34 34">
                    <path d="M6 18 L14 26 L29 8" fill="none" stroke={ROSE.light} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={50} strokeDashoffset={50 * (1 - draw)} />
                  </svg>
                </div>
                <div style={{fontWeight: 700, fontSize: 46, opacity: 0.7 + 0.3 * draw}}>{it.text}</div>
              </div>
            );
          })}
        </Panel>
      </div>
    </>
  );
};

// ---------------------------------------------------------------- wall text (behind her): big type lying on the wall in perspective
export const WallText: React.FC<{fx: Of<'wall-text'>}> = ({fx}) => {
  const [a, b] = fxRange(fx);
  const {abs, fps} = useFxTime(a);
  const {lines, side, color, y, tilt, blend} = fx.props;
  const out = 1 - tw(abs, b - 0.35, b);
  const right = side === 'right';
  const longest = Math.max(...lines.map((l) => l.text.length));
  const fs = Math.min(290, 1000 / (longest * 0.68));
  const body = (blendMode: React.CSSProperties['mixBlendMode'], opacity: number) => (
    <div style={{...FILL, perspective: 1300, perspectiveOrigin: right ? '0% 40%' : '100% 40%', mixBlendMode: blendMode, opacity}}>
      <div style={{position: 'absolute', left: right ? 40 : -260, top: y, width: 1300, transformOrigin: right ? '0 50%' : '100% 50%', transform: `rotateY(${right ? -tilt : tilt}deg)`, textAlign: right ? 'left' : 'right'}}>
        {lines.map((l, i) => {
          const at = l.at ?? a + 0.15 + i * 0.35;
          const k = tw(abs, at, at + 0.5);
          return <div key={i} style={{fontFamily: heavyFamily, fontSize: fs, lineHeight: 1.02, textTransform: 'uppercase', color, whiteSpace: 'nowrap', clipPath: right ? `inset(0 ${(1 - k) * 100}% 0 0)` : `inset(0 0 0 ${(1 - k) * 100}%)`}}>{l.text}</div>;
        })}
      </div>
    </div>
  );
  return (
    <div style={{...FILL, opacity: out}}>
      <Clip from={Math.round(a * fps)} />
      {/* once blended into the wall so its light and texture show through, once faint on top so it stays readable */}
      {body(blend, 0.95)}
      {body('normal', 0.55)}
    </div>
  );
};

export const fifteenthPlate = (fx: Fx): React.ReactNode => (fx.type === 'wall-text' ? <WallText fx={fx} /> : null);
/** checked before the older batches, so a `version: 2` effect draws its new look and everything else falls through */
export const fifteenthOver = (fx: Fx): React.ReactNode => {
  switch (fx.type) {
    case 'side-by-side': return <SideBySide fx={fx} />;
    case 'vote-pill': return <VotePill fx={fx} />;
    case 'duotone': return <Duotone fx={fx} />;
    case 'big-stat': return <BigStat fx={fx} />;
    case 'thank-you': return <ThankYou fx={fx} />;
    case 'before-after': return fx.props.version === 2 ? <BeforeAfterV2 fx={fx} /> : null;
    case 'flash-frame': return fx.props.version === 2 ? <FlashFrameV2 fx={fx} /> : null;
    case 'kinetic-hook': return fx.props.version === 2 ? <KineticHookV2 fx={fx} /> : null;
    case 'giant-caption': return fx.props.version === 2 ? <GiantCaptionV2 fx={fx} /> : null;
    case 'follow-card': return fx.props.version === 2 ? <FollowCardV2 fx={fx} /> : null;
    case 'checklist': return fx.props.version === 2 ? <ChecklistV2 fx={fx} /> : null;
    default: return null;
  }
};
