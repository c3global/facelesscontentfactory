import React from 'react';
import {Freeze, OffthreadVideo, staticFile, useVideoConfig} from 'remotion';
import {heavyFamily, serifFamily} from '../fonts';
import {metalFill, metalTextStyle} from '../metal';
import type {Fx} from './schema';
import {AppIcon, BrandAvatar, C3, CheckMark, HeartIcon, SendArrow} from './theme';
import {easeInC, easeOutC, fxRange, pop, tw, useFxEnv, useFxTime} from './util';

/**
 * Fourth FX batch, in the C3 skin (src/fx/theme.tsx): UI-style effects taken from the effect list Dr. CK collected.
 * Pills are brief and sit low, under the caption band and above the platform UI, never over her face.
 */
type Of<T extends Fx['type']> = Extract<Fx, {type: T}>;
const FILL: React.CSSProperties = {position: 'absolute', left: 0, top: 0, width: 1080, height: 1920};

export const useSpan = (fx: Fx) => {
  const [a, b] = fxRange(fx);
  const {t, abs, frame, fps} = useFxTime(a);
  const len = b - a;
  return {a, b, len, t, abs, frame, fps, inK: tw(t, 0, 0.32, 0, 1, pop), outK: 1 - tw(t, len - 0.28, len)};
};

export const typedSlice = (text: string, abs: number, from: number, to: number) => text.slice(0, Math.floor(tw(abs, from, to, 0, text.length, (x) => x)));
export const Caret: React.FC<{frame: number; color?: string; h: number}> = ({frame, color = C3.accent, h}) => (
  <span style={{display: 'inline-block', width: 4, height: h, marginLeft: 4, verticalAlign: 'middle', background: color, opacity: Math.floor(frame / 8) % 2 ? 0.15 : 1}} />
);

// ================================================================ prompt bar
export const typeSecFor = (text: string) => Math.max(0.9, text.length * 0.042);
export const promptTimes = (fx: Of<'prompt-bar'>) => {
  const typeAt = fx.props.typeAt ?? fx.at + 0.4;
  const typeEnd = typeAt + typeSecFor(fx.props.text);
  const sendAt = fx.props.sendAt ?? typeEnd + 0.4;
  return {typeAt, typeEnd, sendAt};
};

export const PromptBar: React.FC<{fx: Of<'prompt-bar'>}> = ({fx}) => {
  const {abs, frame, inK, outK} = useSpan(fx);
  const {typeAt, typeEnd, sendAt} = promptTimes(fx);
  const sent = abs >= sendAt;
  const done = !!fx.props.doneText && abs >= sendAt + 0.35;
  const shown = done ? fx.props.doneText! : typedSlice(fx.props.text, abs, typeAt, typeEnd);
  const sendPress = tw(abs, sendAt - 0.08, sendAt + 0.04, 0, 1) * (1 - tw(abs, sendAt + 0.04, sendAt + 0.3));
  const doneK = tw(abs, sendAt + 0.35, sendAt + 0.65, 0, 1, pop);
  return (
    <div style={{...FILL, opacity: outK}}>
      <div style={{position: 'absolute', left: 80, top: fx.props.y, width: 920, height: 148, borderRadius: 52, background: C3.card, border: C3.hair, boxSizing: 'border-box', display: 'flex', alignItems: 'center', padding: '0 24px 0 30px', gap: 20, opacity: inK, transform: `translateY(${(1 - inK) * 46}px) scale(${0.95 + 0.05 * inK})`, boxShadow: C3.cardShadow}}>
        <BrandAvatar size={80} src={fx.props.iconSrc} />
        <div style={{flex: 1, minWidth: 0}}>
          <div style={{fontFamily: C3.sans, fontWeight: 700, fontSize: 23, letterSpacing: 4, textTransform: 'uppercase', color: done ? '#A5551F' : C3.cardMuted}}>{done ? fx.props.doneLabel : fx.props.label}</div>
          <div style={{fontFamily: C3.sans, fontWeight: 500, fontSize: 46, lineHeight: 1.2, color: C3.cardText, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'clip'}}>
            {shown}
            {!done && !sent && <Caret frame={frame} h={44} />}
          </div>
        </div>
        <div style={{flex: 'none', width: 96, height: 96, borderRadius: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', background: done ? C3.copperGrad : C3.accent, transform: `scale(${1 - 0.12 * sendPress + (done ? 0.08 * doneK : 0)})`, boxShadow: '0 6px 16px rgba(0,0,0,0.3)'}}>
          {done ? <CheckMark size={50} color="#2a1206" /> : <SendArrow size={52} />}
        </div>
      </div>
    </div>
  );
};

// ================================================================ comment drop / comment CTA
export const commentTimes = (fx: Of<'comment-drop'> | Of<'comment-cta'>) => {
  const postAt = fx.props.postAt;
  const typeFrom = postAt - Math.max(0.7, fx.props.keyword.length * 0.14);
  return {postAt, typeFrom, typeTo: postAt - 0.12};
};

const CommentLayer: React.FC<{fx: Of<'comment-drop'> | Of<'comment-cta'>}> = ({fx}) => {
  const {abs, frame, inK, outK} = useSpan(fx);
  const {postAt, typeFrom, typeTo} = commentTimes(fx);
  const reply = fx.props.reply;
  const replyAt = fx.props.replyAt;
  const line = fx.type === 'comment-cta' ? fx.props.line : undefined;
  const posted = abs >= postAt;
  const rowK = tw(abs, postAt, postAt + 0.3, 0, 1, pop);
  const heartK = tw(abs, postAt + 0.12, postAt + 0.42, 0, 1, pop);
  const rk = reply && replyAt !== undefined ? tw(abs, replyAt, replyAt + 0.32, 0, 1, pop) : 0;
  const y = fx.props.y;
  return (
    <div style={{...FILL, opacity: outK}}>
      {line && (
        <div style={{position: 'absolute', left: 60, width: 960, top: y - 112, textAlign: 'center', fontFamily: C3.sans, fontWeight: 700, fontSize: 46, lineHeight: 1.1, color: '#fff', textShadow: '0 3px 20px rgba(0,0,0,0.85)', opacity: inK, transform: `translateY(${(1 - inK) * 24}px)`}}>
          {line}
        </div>
      )}
      {!posted && (
        <div style={{position: 'absolute', left: 90, top: y, width: 900, height: 112, borderRadius: 56, background: C3.card, border: C3.hair, boxSizing: 'border-box', display: 'flex', alignItems: 'center', padding: '0 16px 0 18px', gap: 18, opacity: inK, transform: `translateY(${(1 - inK) * 40}px)`, boxShadow: C3.cardShadow}}>
          <div style={{flex: 'none', width: 76, height: 76, borderRadius: 38, background: '#aab0b3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: C3.sans, fontWeight: 700, fontSize: 26, color: '#fff'}}>you</div>
          <div style={{flex: 1, fontFamily: C3.sans, fontWeight: 700, fontSize: 48, letterSpacing: 1, color: C3.cardText}}>
            {abs < typeFrom ? <span style={{fontWeight: 500, fontSize: 38, color: C3.cardMuted}}>Add a comment...</span> : typedSlice(fx.props.keyword, abs, typeFrom, typeTo)}
            {abs >= typeFrom && <Caret frame={frame} h={46} />}
          </div>
          <div style={{flex: 'none', padding: '0 30px', height: 76, borderRadius: 38, display: 'flex', alignItems: 'center', fontFamily: C3.sans, fontWeight: 700, fontSize: 34, color: '#fff', background: abs >= typeTo ? C3.accent : 'rgba(58,63,66,0.35)'}}>Post</div>
        </div>
      )}
      {posted && (
        <div style={{position: 'absolute', left: 90, top: y, width: 900, minHeight: 112, borderRadius: 40, background: C3.card, border: C3.hair, boxSizing: 'border-box', display: 'flex', alignItems: 'center', padding: '16px 28px 16px 18px', gap: 18, opacity: rowK, transform: `scale(${0.96 + 0.04 * rowK})`, boxShadow: C3.cardShadow}}>
          <div style={{flex: 'none', width: 76, height: 76, borderRadius: 38, background: '#aab0b3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: C3.sans, fontWeight: 700, fontSize: 26, color: '#fff'}}>you</div>
          <div style={{flex: 1}}>
            <div style={{fontFamily: C3.sans, fontWeight: 500, fontSize: 22, color: C3.cardMuted}}>you · now</div>
            <div style={{fontFamily: C3.sans, fontWeight: 700, fontSize: 48, lineHeight: 1.1, color: C3.cardText}}>{fx.props.keyword}</div>
          </div>
          <div style={{flex: 'none', transform: `scale(${heartK})`}}>
            <HeartIcon size={52} />
          </div>
        </div>
      )}
      {reply && replyAt !== undefined && (
        <div style={{position: 'absolute', left: 160, top: y + 134, width: 830, minHeight: 100, borderRadius: 36, background: C3.glass, border: C3.hair, boxSizing: 'border-box', display: 'flex', alignItems: 'center', padding: '14px 28px 14px 16px', gap: 18, opacity: rk, transform: `translateY(${(1 - rk) * 28}px) scale(${0.94 + 0.06 * rk})`, boxShadow: C3.cardShadow}}>
          <BrandAvatar size={72} src={fx.props.iconSrc} />
          <div style={{flex: 1}}>
            <div style={{fontFamily: C3.sans, fontWeight: 500, fontSize: 22, color: 'rgba(255,255,255,0.6)'}}>{fx.props.replyName} · now</div>
            <div style={{fontFamily: C3.sans, fontWeight: 700, fontSize: 42, lineHeight: 1.1, color: '#fff'}}>{reply}</div>
          </div>
          {fx.props.linkLabel && (
            <div style={{flex: 'none', padding: '8px 22px', borderRadius: 22, fontFamily: C3.sans, fontWeight: 700, fontSize: 30, color: '#2a1206', ...metalFill({kind: 'copper', variant: 'bright', frame: 0, shimmer: false})}}>{fx.props.linkLabel}</div>
          )}
        </div>
      )}
    </div>
  );
};

export const CommentDrop: React.FC<{fx: Of<'comment-drop'>}> = ({fx}) => <CommentLayer fx={fx} />;
export const CommentCta: React.FC<{fx: Of<'comment-cta'>}> = ({fx}) => <CommentLayer fx={fx} />;

// ================================================================ file drop
export const FileDrop: React.FC<{fx: Of<'file-drop'>}> = ({fx}) => {
  const {abs, inK, outK} = useSpan(fx);
  const dropAt = fx.props.dropAt ?? fx.at + 0.5;
  const y = fx.props.y;
  const fall = tw(abs, dropAt, dropAt + 0.42, 0, 1, easeInC);
  const landed = abs >= dropAt + 0.42;
  const settle = tw(abs, dropAt + 0.42, dropAt + 0.8, 0, 1);
  const squash = landed ? 1 + 0.07 * Math.sin(settle * Math.PI) * (1 - settle) * 4 : 1;
  const cardY = y + 20 - (1 - fall) * 360;
  const checkK = tw(abs, dropAt + 0.55, dropAt + 0.85, 0, 1, pop);
  return (
    <div style={{...FILL, opacity: outK}}>
      <div style={{position: 'absolute', left: 90, top: y, width: 900, height: 200, borderRadius: 44, background: C3.glass, border: `3px ${landed ? 'solid' : 'dashed'} ${C3.copper}`, boxSizing: 'border-box', opacity: inK, transform: `scale(${0.95 + 0.05 * inK + (landed ? 0.012 : 0)})`, boxShadow: C3.cardShadow}}>
        {!landed && <div style={{position: 'absolute', left: 0, right: 0, bottom: 18, textAlign: 'center', fontFamily: C3.sans, fontWeight: 700, fontSize: 26, letterSpacing: 4, textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)'}}>{fx.props.zoneLabel}</div>}
        {landed && <div style={{position: 'absolute', right: 34, top: 20, fontFamily: C3.sans, fontWeight: 700, fontSize: 24, letterSpacing: 4, textTransform: 'uppercase', color: C3.copper}}>{fx.props.doneLabel}</div>}
      </div>
      <div style={{position: 'absolute', left: 270, top: cardY, width: 540, height: 160, borderRadius: 30, background: C3.card, border: C3.hair, boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: 22, padding: '0 28px 0 24px', opacity: tw(abs, fx.at, fx.at + 0.15), transform: `scale(${squash}, ${2 - squash})`, boxShadow: '0 22px 50px rgba(0,0,0,0.55)'}}>
        <AppIcon size={96} glyph="film" tone="crimson" />
        <div style={{flex: 1, minWidth: 0}}>
          <div style={{fontFamily: C3.sans, fontWeight: 700, fontSize: 36, color: C3.cardText, whiteSpace: 'nowrap', overflow: 'hidden'}}>{fx.props.name}</div>
          <div style={{fontFamily: C3.sans, fontWeight: 500, fontSize: 27, color: C3.cardMuted}}>{fx.props.meta}</div>
        </div>
        <div style={{flex: 'none', width: 58, height: 58, borderRadius: 29, background: C3.copperGrad, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${checkK})`}}>
          <CheckMark size={34} color="#2a1206" />
        </div>
      </div>
    </div>
  );
};

// ================================================================ icon strike
export const IconStrike: React.FC<{fx: Of<'icon-strike'>}> = ({fx}) => {
  const {abs, inK, outK} = useSpan(fx);
  const strikeAt = fx.props.strikeAt ?? fx.at + 0.9;
  const size = 200;
  const cy = fx.props.y;
  const strike = tw(abs, strikeAt, strikeAt + 0.22, 0, 1, (x) => x);
  const dead = tw(abs, strikeAt + 0.1, strikeAt + 0.4);
  const winK = tw(abs, strikeAt + 0.42, strikeAt + 0.78, 0, 1, pop);
  const L = 340;
  const R = 740;
  const label = (text: string, color: string) => <div style={{marginTop: 14, textAlign: 'center', fontFamily: C3.sans, fontWeight: 700, fontSize: 30, letterSpacing: 1, color, textShadow: '0 2px 14px rgba(0,0,0,0.9)'}}>{text}</div>;
  return (
    <div style={{...FILL, opacity: outK}}>
      <div style={{position: 'absolute', left: L - size / 2, top: cy - size / 2, width: size, opacity: inK, transform: `scale(${(0.7 + 0.3 * inK) * (1 - 0.1 * dead)})`, filter: `grayscale(${dead}) brightness(${1 - 0.3 * dead})`}}>
        <AppIcon size={size} glyph={fx.props.glyph} tone="charcoal" />
        {label(fx.props.label, 'rgba(255,255,255,0.85)')}
      </div>
      <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', display: strike > 0.01 ? 'block' : 'none'}}>
        <line x1={L - size * 0.62} y1={cy - size * 0.62} x2={L + size * 0.62} y2={cy + size * 0.62} stroke="#fff" strokeWidth={22} strokeLinecap="round" opacity={0.9} strokeDasharray={size * 1.75} strokeDashoffset={size * 1.75 * (1 - strike)} />
        <line x1={L - size * 0.62} y1={cy - size * 0.62} x2={L + size * 0.62} y2={cy + size * 0.62} stroke={C3.accent} strokeWidth={14} strokeLinecap="round" strokeDasharray={size * 1.75} strokeDashoffset={size * 1.75 * (1 - strike)} />
      </svg>
      <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: tw(abs, strikeAt + 0.3, strikeAt + 0.5)}}>
        <path d={`M${L + 140} ${cy} L${R - 150} ${cy} M${R - 175} ${cy - 22} L${R - 150} ${cy} L${R - 175} ${cy + 22}`} stroke={C3.copper} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
      <div style={{position: 'absolute', left: R - size / 2, top: cy - size / 2, width: size, opacity: winK, transform: `scale(${0.6 + 0.4 * winK})`}}>
        <div style={{borderRadius: size * 0.23, boxShadow: `0 0 ${50 * winK}px rgba(224,138,87,0.65)`}}>
          <AppIcon size={size} glyph={fx.props.winnerGlyph} tone="copper" src={fx.props.winnerSrc} />
        </div>
        {label(fx.props.winnerLabel, '#fff')}
      </div>
    </div>
  );
};

// ================================================================ jiggle delete
export const JiggleDelete: React.FC<{fx: Of<'jiggle-delete'>}> = ({fx}) => {
  const {abs, frame, inK, outK} = useSpan(fx);
  const icons = fx.props.icons;
  const deleteAt = fx.props.deleteAt ?? fx.at + 1.8;
  const y = fx.props.y;
  const n = icons.length;
  const keepIdx = icons.map((ic, i) => (ic.keep ? i : -1)).filter((i) => i >= 0);
  const gap = 190;
  const slot = (count: number, idx: number) => 540 + (idx - (count - 1) / 2) * gap;
  const dels = icons.map((ic, i) => (ic.keep ? -1 : i)).filter((i) => i >= 0);
  const lastDel = deleteAt + Math.max(0, dels.length - 1) * 0.2 + 0.32;
  const reflow = tw(abs, lastDel, lastDel + 0.5);
  const calm = 1 - tw(abs, lastDel, lastDel + 0.4);
  const left = n - dels.filter((i) => abs >= deleteAt + dels.indexOf(i) * 0.2 + 0.3).length;
  return (
    <div style={{...FILL, opacity: outK}}>
      <div style={{position: 'absolute', left: 80, top: y, width: 920, height: 290, borderRadius: 46, background: C3.card, border: C3.hair, boxSizing: 'border-box', opacity: inK, transform: `translateY(${(1 - inK) * 40}px)`, boxShadow: C3.cardShadow}}>
        <div style={{position: 'absolute', left: 36, top: 22, fontFamily: C3.sans, fontWeight: 700, fontSize: 22, letterSpacing: 5, textTransform: 'uppercase', color: '#A5551F'}}>Edit mode</div>
        <div style={{position: 'absolute', right: 36, top: 22, fontFamily: C3.sans, fontWeight: 500, fontSize: 22, color: C3.cardMuted}}>{left} {left === 1 ? 'app' : 'apps'}</div>
      </div>
      {icons.map((ic, i) => {
        const di = dels.indexOf(i);
        const startX = slot(n, i);
        const endX = ic.keep ? slot(keepIdx.length, keepIdx.indexOf(i)) : startX;
        const x = startX + (endX - startX) * reflow;
        const dk = di >= 0 ? tw(abs, deleteAt + di * 0.2, deleteAt + di * 0.2 + 0.3, 0, 1, easeInC) : 0;
        const rot = Math.sin(frame * 1.15 + i * 2.1) * 2.8 * (ic.keep ? 0.6 : 1) * calm;
        const sc = (1 - dk) * inK * (ic.keep ? 1 + 0.08 * reflow : 1);
        return (
          <div key={i} style={{position: 'absolute', left: x - 70, top: y + 70, width: 140, opacity: 1 - dk * 0.6, transform: `rotate(${rot}deg) scale(${sc})`}}>
            <AppIcon size={140} glyph={ic.glyph} tone={ic.tone} />
            {!ic.keep && dk < 0.05 && (
              <div style={{position: 'absolute', left: -14, top: -14, width: 42, height: 42, borderRadius: 21, background: '#2b2f32', border: '3px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <div style={{width: 20, height: 4, borderRadius: 2, background: '#fff'}} />
              </div>
            )}
            <div style={{marginTop: 10, textAlign: 'center', fontFamily: C3.sans, fontWeight: 700, fontSize: 24, color: C3.cardText}}>{ic.label}</div>
          </div>
        );
      })}
    </div>
  );
};


// ================================================================ flying motion (shared by the card effects)
/** off: cards pop in place. swoop: each card arcs in from off-screen and settles, then floats. orbit: cards loop around the screen, then land in their spot. */
export type Fly = 'off' | 'swoop' | 'orbit';
type Rest = {x: number; y: number; rot: number};
export const flyPose = (fly: Fly, t: number, i: number, n: number, rest: Rest, cy = 960) => {
  if (fly === 'orbit') {
    const d = 0.05 + i * 0.1;
    const e = tw(t, d, d + 1.7, 0, 1, (x) => x * x * (3 - 2 * x));
    const land = e * e;
    const ang = (i / n) * Math.PI * 2 - Math.PI / 2 - (1 - e) * Math.PI * 2 * 1.25;
    const depth = (Math.sin(ang) + 1) / 2;
    const ox = 540 + 470 * Math.cos(ang);
    const oy = cy + 640 * Math.sin(ang) * 0.55;
    const bob = Math.sin(t * 2.2 + i * 1.3) * 5 * land;
    return {
      x: ox + (rest.x - ox) * land,
      y: oy + (rest.y - oy) * land + bob,
      rot: Math.cos(ang) * 9 * (1 - land) + rest.rot * land + Math.sin(t * 1.7 + i) * 0.7 * land,
      sc: (0.72 + 0.38 * depth) * (1 - land) + land,
      op: tw(t, d, d + 0.25),
      z: land < 0.9 ? Math.round(depth * 10) : 11 + i,
    };
  }
  // swoop: arc in from alternating sides, overshoot a touch, settle, float
  const d = 0.08 + i * 0.14;
  const p = tw(t, d, d + 0.8, 0, 1, easeOutC);
  const side = i % 2 ? 1 : -1;
  const bob = Math.sin(t * 2.2 + i * 1.3) * 5 * p;
  return {
    x: rest.x + side * 760 * (1 - p),
    y: rest.y - (1 - p) * 620 - Math.sin(p * Math.PI) * 140 + bob,
    rot: rest.rot + side * (1 - p) * 38 + Math.sin(t * 1.7 + i) * 0.7 * p,
    sc: 0.7 + 0.3 * p,
    op: tw(t, d, d + 0.2),
    z: 11 + i,
  };
};

// ================================================================ storyboard deck
export const StoryboardDeck: React.FC<{fx: Of<'storyboard-deck'>}> = ({fx}) => {
  const {t, outK} = useSpan(fx);
  const {video} = useFxEnv();
  const {fps} = useVideoConfig();
  const {stills, labels, lines, y, fly} = fx.props;
  const cards = [0, 1, 2];
  const rot = [-9, 0, 9];
  const cx = [300, 540, 780];
  return (
    <div style={{...FILL, opacity: outK}}>
      {cards.map((c) => {
        const k = tw(t, 0.12 + c * 0.18, 0.5 + c * 0.18, 0, 1, pop);
        const top = y + (c === 1 ? -14 : 8);
        const pose = fly === 'off' ? null : flyPose(fly, t, c, 3, {x: cx[c], y: top + 180, rot: rot[c]}, y + 180);
        const box: React.CSSProperties = pose
          ? {left: pose.x - 135, top: pose.y - 180, opacity: pose.op, transform: `rotate(${pose.rot}deg) scale(${pose.sc})`, zIndex: pose.z}
          : {left: cx[c] - 135, top, opacity: k, transform: `translateY(${(1 - k) * 90}px) rotate(${rot[c] * k}deg) scale(${0.85 + 0.15 * k})`};
        return (
          <div key={c} style={{position: 'absolute', width: 270, height: 360, borderRadius: 26, background: C3.card, border: C3.hair, boxSizing: 'border-box', overflow: 'hidden', boxShadow: '0 22px 50px rgba(0,0,0,0.55)', ...box}}>
            {c === 0 ? (
              <div style={{padding: '22px 20px'}}>
                <div style={{fontFamily: C3.sans, fontWeight: 700, fontSize: 18, letterSpacing: 4, textTransform: 'uppercase', color: '#A5551F', marginBottom: 14}}>Storyboard</div>
                {lines.map((l, i) => (
                  <div key={i} style={{display: 'flex', gap: 10, marginBottom: 14, opacity: tw(t, 0.6 + i * 0.2, 0.85 + i * 0.2)}}>
                    <div style={{flex: 'none', width: 28, height: 28, borderRadius: 14, background: C3.copperGrad, color: '#2a1206', fontFamily: C3.sans, fontWeight: 700, fontSize: 17, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{i + 1}</div>
                    <div style={{fontFamily: C3.sans, fontWeight: 500, fontSize: 21, lineHeight: 1.2, color: C3.cardText}}>{l}</div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div style={{position: 'absolute', left: 0, top: 0, width: 270, height: 360, overflow: 'hidden'}}>
                  <Freeze frame={0}>
                    <OffthreadVideo src={staticFile(video)} muted startFrom={Math.round((stills[c - 1] ?? stills[0]) * fps)} style={{width: 270, height: 480, objectFit: 'cover', objectPosition: '50% 0%'}} />
                  </Freeze>
                </div>
                <div style={{position: 'absolute', left: 14, bottom: 14, fontFamily: C3.sans, fontWeight: 700, fontSize: 20, letterSpacing: 3, textTransform: 'uppercase', color: '#fff', textShadow: '0 2px 10px rgba(0,0,0,0.8)'}}>{String(c).padStart(2, '0')} · {labels[c - 1] ?? ''}</div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ================================================================ gravity drop
const bounceFall = (p: number) => {
  // 0..1 progress -> 0 (high) .. 1 (landed), two bounces
  if (p < 0.55) return (p / 0.55) ** 2;
  if (p < 0.78) return 1 - 0.16 * Math.sin(((p - 0.55) / 0.23) * Math.PI);
  if (p < 0.92) return 1 - 0.05 * Math.sin(((p - 0.78) / 0.14) * Math.PI);
  return 1;
};
export const GravityDrop: React.FC<{fx: Of<'gravity-drop'>}> = ({fx}) => {
  const {abs, outK} = useSpan(fx);
  const dropAt = fx.props.dropAt ?? fx.at + 0.2;
  const letters = fx.props.word.split('');
  const kick = tw(abs, dropAt + 0.1, dropAt + 0.5);
  return (
    <div style={{...FILL, opacity: outK}}>
      {fx.props.kicker && (
        <div style={{position: 'absolute', left: 0, width: 1080, top: fx.props.y - 290, textAlign: 'center', fontFamily: serifFamily, fontStyle: 'italic', fontWeight: 600, fontSize: 72, color: '#fff', textShadow: '0 4px 22px rgba(0,0,0,0.85)', opacity: kick, transform: `translateY(${(1 - kick) * -30}px)`}}>{fx.props.kicker}</div>
      )}
      <div style={{position: 'absolute', left: 0, width: 1080, top: fx.props.y - 190, display: 'flex', justifyContent: 'center', gap: 4}}>
        {letters.map((ch, i) => {
          const p = tw(abs, dropAt + i * 0.085, dropAt + i * 0.085 + 0.75, 0, 1, (x) => x);
          const fall = bounceFall(p);
          const rot = (1 - fall) * (i % 2 ? 14 : -14);
          return (
            <div key={i} style={{fontFamily: serifFamily, fontWeight: 800, fontSize: 210, lineHeight: 1, transform: `translateY(${(1 - fall) * -900}px) rotate(${rot}deg)`, opacity: p > 0 ? 1 : 0, ...metalTextStyle({kind: 'copper', variant: 'bright', frame: 0, shimmer: false}), filter: 'drop-shadow(0 8px 22px rgba(0,0,0,0.7))'}}>
              {ch === ' ' ? '\u00A0' : ch}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ================================================================ grade slider + eyedropper grade
const TINTS = {warm: '255,140,60', cool: '70,120,255', golden: '255,190,80'} as const;
const TintLayer: React.FC<{rgb: string; k: number}> = ({rgb, k}) => (
  <>
    <div style={{...FILL, background: `rgba(${rgb},1)`, opacity: 0.65 * k, mixBlendMode: 'soft-light'}} />
    <div style={{...FILL, background: `rgba(${rgb},1)`, opacity: 0.1 * k, mixBlendMode: 'color'}} />
  </>
);

export const GradeSlider: React.FC<{fx: Of<'grade-slider'>}> = ({fx}) => {
  const {abs, inK, outK} = useSpan(fx);
  const moveAt = fx.props.moveAt ?? fx.at + 0.6;
  const k = tw(abs, moveAt, moveAt + 1.5, 0, fx.props.to, (x) => x * x * (3 - 2 * x));
  const trackW = 560;
  return (
    <div style={{...FILL, opacity: outK}}>
      <TintLayer rgb={TINTS[fx.props.look]} k={k * inK} />
      <div style={{position: 'absolute', left: 120, top: fx.props.y, width: 840, height: 120, borderRadius: 44, background: C3.card, border: C3.hair, boxSizing: 'border-box', display: 'flex', alignItems: 'center', padding: '0 34px', gap: 26, opacity: inK, transform: `translateY(${(1 - inK) * 40}px)`, boxShadow: C3.cardShadow}}>
        <div style={{flex: 'none', fontFamily: C3.sans, fontWeight: 700, fontSize: 24, letterSpacing: 4, textTransform: 'uppercase', color: '#A5551F', width: 130}}>{fx.props.label}</div>
        <div style={{position: 'relative', width: trackW, height: 14, borderRadius: 7, background: 'rgba(58,63,66,0.16)'}}>
          <div style={{position: 'absolute', left: 0, top: 0, height: 14, borderRadius: 7, width: trackW * k, background: C3.copperGrad}} />
          <div style={{position: 'absolute', top: -17, left: trackW * k - 24, width: 48, height: 48, borderRadius: 24, background: '#fff', border: `5px solid ${C3.copper}`, boxSizing: 'border-box', boxShadow: '0 4px 12px rgba(0,0,0,0.35)'}} />
        </div>
        <div style={{flex: 'none', width: 70, textAlign: 'right', fontFamily: C3.sans, fontWeight: 700, fontSize: 30, color: C3.cardText}}>{Math.round(k * 100)}</div>
      </div>
    </div>
  );
};

/** Dr. CK's own dropper (public/brand/lab/dropper.png); the glass tip sits at about 94 percent across and 84 percent down */
const DROPPER = {w: 150, h: 185, tipX: 0.94, tipY: 0.84};
const Dropper: React.FC = () => <img src={staticFile('brand/lab/dropper.png')} width={DROPPER.w} height={DROPPER.h} style={{display: 'block', filter: 'drop-shadow(0 8px 14px rgba(0,0,0,0.5))'}} />;

export const EyedropperGrade: React.FC<{fx: Of<'eyedropper-grade'>}> = ({fx}) => {
  const {abs, inK, outK} = useSpan(fx);
  const {swatches, pick, y} = fx.props;
  const idx = Math.min(pick, swatches.length - 1);
  const pickAt = fx.props.pickAt ?? fx.at + 1.1;
  const picked = abs >= pickAt;
  const gap = 118;
  const sx = (i: number) => 540 + (i - (swatches.length - 1) / 2) * gap;
  const fly = tw(abs, fx.at + 0.35, pickAt, 0, 1, (x) => 1 - (1 - x) ** 3);
  const dx = 960 + (sx(idx) - 960) * fly;
  const dy = y - 190 + (190 + 60) * fly * fly;
  const tap = tw(abs, pickAt, pickAt + 0.12) * (1 - tw(abs, pickAt + 0.12, pickAt + 0.3));
  const grade = tw(abs, pickAt, pickAt + 0.9);
  const hex = swatches[idx];
  const rgb = [1, 3, 5].map((o) => parseInt(hex.slice(o, o + 2), 16)).join(',');
  return (
    <div style={{...FILL, opacity: outK}}>
      <TintLayer rgb={rgb} k={grade * inK} />
      <div style={{position: 'absolute', left: 180, top: y, width: 720, height: 150, borderRadius: 46, background: C3.card, border: C3.hair, boxSizing: 'border-box', opacity: inK, transform: `translateY(${(1 - inK) * 40}px)`, boxShadow: C3.cardShadow}}>
        <div style={{position: 'absolute', left: 36, top: 16, fontFamily: C3.sans, fontWeight: 700, fontSize: 21, letterSpacing: 4, textTransform: 'uppercase', color: '#A5551F'}}>{fx.props.label}</div>
      </div>
      {swatches.map((c, i) => {
        const hit = picked && i === idx;
        return (
          <div key={i} style={{position: 'absolute', left: sx(i) - 42, top: y + 48, width: 84, height: 84, borderRadius: 42, background: c, border: hit ? `5px solid ${C3.copper}` : '4px solid #fff', boxSizing: 'border-box', outline: hit ? '3px solid #fff' : 'none', opacity: inK, transform: `scale(${(hit ? 1.16 : 1) * (0.7 + 0.3 * inK)})`, boxShadow: '0 4px 12px rgba(0,0,0,0.3)'}} />
        );
      })}
      <div style={{position: 'absolute', left: dx - DROPPER.w * DROPPER.tipX, top: dy - DROPPER.h * DROPPER.tipY, opacity: tw(abs, fx.at + 0.2, fx.at + 0.45) * inK, transform: `scale(${1 - 0.08 * tap})`, transformOrigin: `${DROPPER.w * DROPPER.tipX}px ${DROPPER.h * DROPPER.tipY}px`}}>
        <Dropper />
      </div>
    </div>
  );
};

// ================================================================ kinetic hook + giant caption
/** Both are caption-replacing hero moments: turn the captions off for their scene so the type and the captions do not fight. */
export const KineticHook: React.FC<{fx: Of<'kinetic-hook'>}> = ({fx}) => {
  const {abs, outK} = useSpan(fx);
  const lines = fx.props.lines;
  const sizes = {serif: 150, sans: 132, italic: 118} as const;
  const heights = lines.map((l) => sizes[l.face] * 1.02);
  const total = heights.reduce((a, b) => a + b, 0);
  let acc = 0;
  return (
    <div style={{...FILL, opacity: outK}}>
      {lines.map((l, i) => {
        const at = l.at ?? fx.at + i * 0.6;
        const k = tw(abs, at, at + 0.55, 0, 1, (x) => 1 - (1 - x) ** 4);
        const top = fx.props.y - total / 2 + acc;
        acc += heights[i];
        const last = i === lines.length - 1 && lines.length > 1;
        const base: React.CSSProperties = l.face === 'sans' ? {fontFamily: heavyFamily, textTransform: 'uppercase', letterSpacing: 2 + (1 - k) * 18, fontSize: sizes.sans} : l.face === 'serif' ? {fontFamily: serifFamily, fontWeight: 700, fontSize: sizes.serif, letterSpacing: -2 + (1 - k) * 14} : {fontFamily: serifFamily, fontStyle: 'italic', fontWeight: 600, fontSize: sizes.italic};
        return (
          <div key={i} style={{position: 'absolute', left: 0, width: 1080, top, height: heights[i], overflow: 'hidden', textAlign: 'center'}}>
            <div style={{lineHeight: 1.02, transform: `translateY(${(1 - k) * 105}%)`, opacity: Math.min(1, k * 2), filter: `blur(${(1 - k) * 8}px) drop-shadow(0 6px 22px rgba(0,0,0,0.75))`, ...base, ...(last || l.face === 'italic' ? metalTextStyle({kind: 'copper', variant: 'bright', frame: 0, shimmer: false}) : {color: '#fff'})}}>{l.text}</div>
          </div>
        );
      })}
    </div>
  );
};

export const GiantCaption: React.FC<{fx: Of<'giant-caption'>}> = ({fx}) => {
  const {abs, inK, outK} = useSpan(fx);
  const k = tw(abs, fx.at, fx.at + 0.3, 0, 1, pop);
  return (
    <div style={{...FILL, opacity: outK}}>
      <div style={{position: 'absolute', left: 0, width: 1080, top: fx.props.y - 170, display: 'flex', justifyContent: 'center', transform: `scale(${0.82 + 0.18 * k}) rotate(${(1 - k) * -3}deg)`, opacity: k}}>
        <div style={{padding: '18px 54px 22px', borderRadius: 26, background: 'rgba(12,13,15,0.92)', border: C3.hair, boxShadow: '0 18px 50px rgba(0,0,0,0.6)', textAlign: 'center'}}>
          <div style={{fontFamily: heavyFamily, textTransform: 'uppercase', fontSize: 190, lineHeight: 1, color: '#fff', letterSpacing: 2}}>{fx.props.text}</div>
          {fx.props.accent && <div style={{fontFamily: serifFamily, fontStyle: 'italic', fontWeight: 600, fontSize: 104, lineHeight: 1.05, marginTop: 2, ...metalTextStyle({kind: 'copper', variant: 'bright', frame: 0, shimmer: false})}}>{fx.props.accent}</div>}
        </div>
      </div>
      <div style={{display: 'none'}}>{inK}</div>
    </div>
  );
};

// ================================================================ playing grid, video card, reel feed (her own clip plays inside them)
export const ClipTile: React.FC<{w: number; h: number; startSec: number; zoom?: number; focusY?: string}> = ({w, h, startSec, zoom = 1, focusY = '12%'}) => {
  const {video} = useFxEnv();
  const {fps} = useVideoConfig();
  return (
    <div style={{width: w, height: h, overflow: 'hidden', position: 'relative', background: '#111'}}>
      <OffthreadVideo src={staticFile(video)} muted startFrom={Math.round(startSec * fps)} style={{display: 'block', width: w * zoom, height: (w * zoom * 16) / 9, objectFit: 'cover', marginLeft: -(w * (zoom - 1)) / 2, marginTop: -Math.max(0, (w * zoom * 16) / 9 - h) * (parseFloat(focusY) / 100)}} />
    </div>
  );
};

export const PlayingGrid: React.FC<{fx: Of<'playing-grid'>}> = ({fx}) => {
  const {t, outK} = useSpan(fx);
  const offs = fx.props.offsets;
  const w = offs.length === 3 ? 300 : 230;
  const h = Math.round((w * 16) / 9);
  const gap = 16;
  const total = offs.length * w + (offs.length - 1) * gap;
  return (
    <div style={{...FILL, opacity: outK}}>
      {offs.map((o, i) => {
        const k = tw(t, 0.08 + i * 0.12, 0.48 + i * 0.12, 0, 1, pop);
        const tilt = (i - (offs.length - 1) / 2) * 2.2;
        const left = 540 - total / 2 + i * (w + gap);
        const top = fx.props.y + (i % 2) * 18;
        const pose = fx.props.fly === 'off' ? null : flyPose(fx.props.fly, t, i, offs.length, {x: left + w / 2, y: top + h / 2, rot: tilt}, top + h / 2);
        const box: React.CSSProperties = pose
          ? {left: pose.x - w / 2, top: pose.y - h / 2, opacity: pose.op, transform: `rotate(${pose.rot}deg) scale(${pose.sc})`, zIndex: pose.z}
          : {left, top, opacity: k, transform: `translateY(${(1 - k) * 120}px) rotate(${tilt}deg) scale(${0.85 + 0.15 * k})`};
        return (
          <div key={i} style={{position: 'absolute', width: w, height: h, borderRadius: 26, overflow: 'hidden', border: C3.hair, boxSizing: 'border-box', boxShadow: '0 20px 46px rgba(0,0,0,0.55)', ...box}}>
            <ClipTile w={w} h={h} startSec={o} zoom={1.25} />
            <div style={{position: 'absolute', left: 12, bottom: 12, width: 0, height: 0, borderTop: '11px solid transparent', borderBottom: '11px solid transparent', borderLeft: '18px solid rgba(255,255,255,0.92)'}} />
          </div>
        );
      })}
    </div>
  );
};

export const VideoCard: React.FC<{fx: Of<'video-card'>}> = ({fx}) => {
  const {abs, t, inK, outK} = useSpan(fx);
  const from = fx.props.from ?? fx.at;
  const w = 720;
  const vh = 405;
  const bar = tw(abs, fx.at + 0.5, fxRange(fx)[1] - 0.4, 0.08, 0.92, (x) => x);
  return (
    <div style={{...FILL, opacity: outK}}>
      <div style={{position: 'absolute', left: 180, top: fx.props.y, width: w, borderRadius: 34, background: C3.card, border: C3.hair, boxSizing: 'border-box', overflow: 'hidden', opacity: inK, transform: `translateY(${(1 - inK) * 70}px) scale(${0.94 + 0.06 * inK})`, boxShadow: C3.cardShadow}}>
        <div style={{position: 'relative'}}>
          <ClipTile w={w} h={vh} startSec={from} zoom={1.25} focusY="7%" />
          <div style={{position: 'absolute', left: 0, bottom: 0, width: w, height: 8, background: 'rgba(255,255,255,0.35)'}}>
            <div style={{width: w * bar, height: 8, background: C3.copperGrad}} />
          </div>
          {t < 0.5 && <div style={{position: 'absolute', left: w / 2 - 44, top: vh / 2 - 44, width: 88, height: 88, borderRadius: 44, background: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><div style={{marginLeft: 8, width: 0, height: 0, borderTop: '18px solid transparent', borderBottom: '18px solid transparent', borderLeft: '28px solid #3A3F42'}} /></div>}
        </div>
        <div style={{padding: '16px 26px 20px'}}>
          <div style={{fontFamily: serifFamily, fontWeight: 600, fontSize: 44, lineHeight: 1.1, color: C3.cardText}}>{fx.props.title}</div>
          {fx.props.sub && <div style={{marginTop: 6, fontFamily: C3.sans, fontWeight: 700, fontSize: 21, letterSpacing: 4, textTransform: 'uppercase', color: '#A5551F'}}>{fx.props.sub}</div>}
        </div>
      </div>
    </div>
  );
};

const RailIcon: React.FC<{kind: 'heart' | 'comment' | 'share' | 'save'}> = ({kind}) => (
  <svg width={64} height={64} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.6))'}}>
    {kind === 'heart' && <path d="M12 20.5s-7.5-4.6-9.2-9.4C1.7 7.8 3.6 4.5 7 4.5c2 0 3.4 1.1 5 3 1.6-1.9 3-3 5-3 3.4 0 5.3 3.3 4.2 6.6-1.7 4.8-9.2 9.4-9.2 9.4z" />}
    {kind === 'comment' && <path d="M4 5h16v11H9l-5 4z" />}
    {kind === 'share' && <path d="M21 4L10 14M21 4l-6 17-4-8-8-4z" />}
    {kind === 'save' && <path d="M6 3h12v18l-6-4-6 4z" />}
  </svg>
);

export const ReelFeed: React.FC<{fx: Of<'reel-feed'>}> = ({fx}) => {
  const {t, outK} = useSpan(fx);
  const from = fx.props.from ?? fx.at;
  const scroll = tw(t, 0, 0.55, 0, 1, (x) => 1 - (1 - x) ** 4);
  const w = 780;
  const h = 1387;
  return (
    <div style={{...FILL, opacity: outK}}>
      <div style={{...FILL, background: 'rgba(0,0,0,0.78)', opacity: tw(t, 0, 0.25)}} />
      <div style={{position: 'absolute', left: 150, top: 250, width: w, height: h, transform: `translateY(${(1 - scroll) * 1500}px)`, filter: `blur(${(1 - scroll) * 14}px)`}}>
        <div style={{width: w, height: h, borderRadius: 44, overflow: 'hidden', border: C3.hair, boxSizing: 'border-box', boxShadow: '0 30px 80px rgba(0,0,0,0.7)', position: 'relative'}}>
          <ClipTile w={w} h={h} startSec={from} zoom={1.0} focusY="0%" />
          <div style={{position: 'absolute', left: 0, bottom: 0, width: w, height: 340, background: 'linear-gradient(0deg,rgba(0,0,0,0.75),rgba(0,0,0,0))'}} />
          <div style={{position: 'absolute', left: 30, bottom: 34, display: 'flex', alignItems: 'center', gap: 16}}>
            <BrandAvatar size={72} />
            <div>
              <div style={{fontFamily: C3.sans, fontWeight: 700, fontSize: 34, color: '#fff'}}>{fx.props.handle}</div>
              {fx.props.caption && <div style={{fontFamily: C3.sans, fontWeight: 500, fontSize: 26, color: 'rgba(255,255,255,0.85)'}}>{fx.props.caption}</div>}
            </div>
          </div>
          <div style={{position: 'absolute', right: 22, bottom: 150, display: 'flex', flexDirection: 'column', gap: 30, alignItems: 'center'}}>
            <RailIcon kind="heart" />
            <RailIcon kind="comment" />
            <RailIcon kind="share" />
            <RailIcon kind="save" />
          </div>
        </div>
      </div>
    </div>
  );
};

// ================================================================ card orbit: video cards fly around the screen (stack it with reel-feed, storyboard-deck and the rest)
export const CardOrbit: React.FC<{fx: Of<'card-orbit'>}> = ({fx}) => {
  const {t, outK} = useSpan(fx);
  const {tiles, cy, radiusX, radiusY, spinSec, width} = fx.props;
  const h = Math.round((width * 16) / 9);
  const n = tiles.length;
  const items = tiles.map((o, i) => {
    const ang = (i / n) * Math.PI * 2 + (t / spinSec) * Math.PI * 2 - Math.PI / 2;
    const depth = (Math.sin(ang) + 1) / 2;
    return {o, i, ang, depth};
  });
  items.sort((a, b) => a.depth - b.depth);
  return (
    <div style={{...FILL, opacity: outK}}>
      {items.map(({o, i, ang, depth}) => {
        const k = tw(t, 0.1 + i * 0.1, 0.5 + i * 0.1, 0, 1, pop);
        const sc = (0.72 + 0.38 * depth) * k;
        const x = 540 + radiusX * Math.cos(ang);
        const y = cy + radiusY * Math.sin(ang) * 0.55;
        return (
          <div key={i} style={{position: 'absolute', left: x - width / 2, top: y - h / 2, width, height: h, borderRadius: 24, overflow: 'hidden', border: C3.hair, boxSizing: 'border-box', transform: `rotate(${Math.cos(ang) * 9}deg) scale(${sc})`, opacity: (0.55 + 0.45 * depth) * k, boxShadow: '0 18px 44px rgba(0,0,0,0.55)'}}>
            <ClipTile w={width} h={h} startSec={o} zoom={1.25} />
          </div>
        );
      })}
    </div>
  );
};

export const fourthOver = (fx: Fx): React.ReactNode => {
  switch (fx.type) {
    case 'prompt-bar':
      return <PromptBar fx={fx} />;
    case 'comment-drop':
      return <CommentDrop fx={fx} />;
    case 'comment-cta':
      return <CommentCta fx={fx} />;
    case 'file-drop':
      return <FileDrop fx={fx} />;
    case 'icon-strike':
      return <IconStrike fx={fx} />;
    case 'jiggle-delete':
      return <JiggleDelete fx={fx} />;
    case 'storyboard-deck':
      return <StoryboardDeck fx={fx} />;
    case 'gravity-drop':
      return <GravityDrop fx={fx} />;
    case 'grade-slider':
      return <GradeSlider fx={fx} />;
    case 'eyedropper-grade':
      return <EyedropperGrade fx={fx} />;
    case 'kinetic-hook':
      return <KineticHook fx={fx} />;
    case 'giant-caption':
      return <GiantCaption fx={fx} />;
    case 'playing-grid':
      return <PlayingGrid fx={fx} />;
    case 'video-card':
      return <VideoCard fx={fx} />;
    case 'reel-feed':
      return <ReelFeed fx={fx} />;
    case 'card-orbit':
      return <CardOrbit fx={fx} />;
    default:
      return null;
  }
};
