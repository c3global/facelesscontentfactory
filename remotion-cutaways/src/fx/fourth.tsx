import React from 'react';
import {metalFill} from '../metal';
import type {Fx} from './schema';
import {BrandAvatar, C3, CheckMark, HeartIcon, SendArrow} from './theme';
import {fxRange, pop, tw, useFxTime} from './util';

/**
 * Fourth FX batch, in the C3 skin (src/fx/theme.tsx): UI-style effects taken from the effect list Dr. CK collected.
 * Pills are brief and sit low, under the caption band and above the platform UI, never over her face.
 */
type Of<T extends Fx['type']> = Extract<Fx, {type: T}>;
const FILL: React.CSSProperties = {position: 'absolute', left: 0, top: 0, width: 1080, height: 1920};

const useSpan = (fx: Fx) => {
  const [a, b] = fxRange(fx);
  const {t, abs, frame, fps} = useFxTime(a);
  const len = b - a;
  return {a, b, len, t, abs, frame, fps, inK: tw(t, 0, 0.32, 0, 1, pop), outK: 1 - tw(t, len - 0.28, len)};
};

const typedSlice = (text: string, abs: number, from: number, to: number) => text.slice(0, Math.floor(tw(abs, from, to, 0, text.length, (x) => x)));
const Caret: React.FC<{frame: number; color?: string; h: number}> = ({frame, color = C3.accent, h}) => (
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

export const fourthOver = (fx: Fx): React.ReactNode => {
  switch (fx.type) {
    case 'prompt-bar':
      return <PromptBar fx={fx} />;
    case 'comment-drop':
      return <CommentDrop fx={fx} />;
    case 'comment-cta':
      return <CommentCta fx={fx} />;
    default:
      return null;
  }
};
