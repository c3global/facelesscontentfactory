import React from 'react';
import {Img, OffthreadVideo, staticFile} from 'remotion';
import {handFamily, serifFamily} from '../fonts';
import {useSpan} from './fourth';
import {FreezeSticker, SpotlightWords} from './over';
import type {Fx} from './schema';
import {BrandAvatar, C3, HeartIcon, ROSE} from './theme';
import {anchorPx, pop, tw, useFxEnv} from './util';

/**
 * Sixteenth FX batch (beta 12).
 * Upgrade batch 3 (`version: 2` in props; the originals stay the default):
 *   label-maker tape for the-stack, sticky-text and freeze-sticker; one Instagram comment look for comment-bubble,
 *   comment-drop and comment-cta; spotlight with a light beam and dust; polaroid-drop as a fan of photos;
 *   phone-mockup as a solid 3D phone that turns (holo-phone's motion) with the member's own screen.
 * New effects: dm-thread, review-card, highlighter, taped-note, lower-third, save-tap.
 * Colors come from the theme (C3 and ROSE), so the member's brand applies in the plug-in.
 */
type Of<T extends Fx['type']> = Extract<Fx, {type: T}>;
const FILL: React.CSSProperties = {position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, pointerEvents: 'none'};
const SANS = C3.sans;
const smooth = (x: number) => x * x * (3 - 2 * x);
const isClip = (src: string) => /\.(mp4|mov|webm)$/i.test(src);
const Media: React.FC<{src: string; style?: React.CSSProperties}> = ({src, style}) =>
  isClip(src)
    ? <OffthreadVideo src={staticFile(src)} muted style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block', ...style}} />
    : <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block', ...style}} />;

// ================================================================ label-maker tape (batch 3: the-stack, sticky-text, freeze-sticker)
/** An embossed label-maker strip in the brand accent. `k` 0..1 feeds it out of the printer from the left. */
const Tape: React.FC<{text: string; k: number; size?: number; style?: React.CSSProperties; right?: React.ReactNode}> = ({text, k, size = 46, style, right}) => {
  const pad = size * 0.55;
  return (
    <div style={{position: 'relative', display: 'inline-flex', alignItems: 'center', gap: size * 0.6, height: size * 1.9, padding: `0 ${pad}px`, boxSizing: 'border-box', background: `linear-gradient(180deg, rgba(255,255,255,0.16), rgba(255,255,255,0) 38%, rgba(0,0,0,0.18)), repeating-linear-gradient(90deg, rgba(0,0,0,0.05) 0 2px, transparent 2px 5px), ${C3.accent}`, clipPath: `polygon(0 6%, ${size * 0.25}px 0, 100% 0, calc(100% - ${size * 0.18}px) 50%, 100% 100%, ${size * 0.2}px 100%, 0 92%)`, boxShadow: '0 10px 24px rgba(0,0,0,0.45)', transformOrigin: 'left center', ...style}}>
      <span style={{fontFamily: SANS, fontWeight: 700, fontSize: size, letterSpacing: size * 0.16, textTransform: 'uppercase', whiteSpace: 'nowrap', color: '#fff', textShadow: '0 1.5px 0 rgba(0,0,0,0.38), 0 -1px 0 rgba(255,255,255,0.35)', clipPath: `inset(-20% ${100 - k * 100}% -20% 0)`}}>{text}</span>
      {right}
    </div>
  );
};
/** feed: the strip grows out of the printer slot, then the cut snaps it free */
const feedK = (t: number, at: number, dur = 0.55) => tw(t, at, at + dur, 0, 1, (x) => x);

export const TheStackV2: React.FC<{fx: Of<'the-stack'>}> = ({fx}) => {
  const {t, outK} = useSpan(fx);
  return (
    <div style={{...FILL, opacity: outK}}>
      {fx.props.rows.map((r, i) => {
        const rt = r.at !== undefined ? r.at - fx.at : 0.15 + i * 0.32;
        const k = feedK(t, rt);
        const fill = tw(t, rt + 0.45, rt + 1.25);
        const w = 300 + 6.2 * r.value * fill;
        return (
          <div key={i} style={{position: 'absolute', left: 54, top: 1120 + i * 150, opacity: Math.min(1, k * 4), transform: `rotate(${i % 2 ? 1.2 : -1.4}deg) translateX(${(1 - k) * -40}px)`}}>
            <div style={{width: w, clipPath: `inset(0 ${100 - k * 100}% 0 0)`}}>
              <Tape text={r.label} k={k} size={40} style={{width: '100%', justifyContent: 'space-between'}} right={
                <span style={{fontFamily: SANS, fontWeight: 700, fontSize: 50, color: '#fff', textShadow: '0 1.5px 0 rgba(0,0,0,0.38)', opacity: tw(t, rt + 0.9, rt + 1.2)}}>{r.display}</span>
              } />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const StickyTextV2: React.FC<{fx: Of<'sticky-text'>}> = ({fx}) => {
  const {t, abs, fps, outK} = useSpan(fx);
  const {anchors} = useFxEnv();
  const p = anchorPx(anchors, Math.round(abs * fps), fx.props.anchor);
  const k = feedK(t, 0.05);
  const land = tw(t, 0.5, 0.75, 0, 1, pop);
  return (
    <div style={{...FILL, opacity: outK}}>
      <div style={{position: 'absolute', left: p.x, top: Math.max(230, p.y), transform: `translate(-50%, -120%) rotate(${-4 * land}deg) scale(${0.92 + 0.08 * land})`}}>
        <Tape text={fx.props.text} k={k} size={52} />
      </div>
    </div>
  );
};

export const FreezeStickerV2: React.FC<{fx: Of<'freeze-sticker'>}> = ({fx}) => {
  const {abs} = useSpan(fx);
  return (
    <>
      <FreezeSticker fx={{...fx, props: {...fx.props, notes: []}}} />
      <div style={FILL}>
        {fx.props.notes.map((n, i) => {
          const at = fx.at + 0.5 + i * 0.4;
          const k = feedK(abs, at);
          const left = i % 2 === 0;
          return (
            <div key={i} style={{position: 'absolute', [left ? 'left' : 'right']: 46, top: 560 + i * 300, opacity: Math.min(1, k * 4), transform: `rotate(${left ? -5 : 4}deg)`}}>
              <Tape text={n} k={k} size={44} />
            </div>
          );
        })}
      </div>
    </>
  );
};

// ================================================================ one Instagram comment look (batch 3: comment-bubble, comment-drop, comment-cta)
type IgProps = {keyword: string; postAt: number; reply?: string; replyAt?: number; replyName: string; linkLabel?: string; line?: string; y: number; iconSrc?: string};
const YouAvatar: React.FC<{size: number}> = ({size}) => (
  <div style={{flex: 'none', width: size, height: size, borderRadius: size / 2, background: 'linear-gradient(135deg,#8E959C,#5A6066)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 700, fontSize: size * 0.34, color: '#fff'}}>you</div>
);
const IgComments: React.FC<{fx: Fx; p: IgProps}> = ({fx, p}) => {
  const {abs, frame, inK, outK} = useSpan(fx);
  const typeFrom = p.postAt - Math.max(0.7, p.keyword.length * 0.14);
  const typeTo = p.postAt - 0.12;
  const typed = p.keyword.slice(0, Math.floor(tw(abs, typeFrom, typeTo, 0, p.keyword.length, (x) => x)));
  const posted = abs >= p.postAt;
  const rowK = tw(abs, p.postAt, p.postAt + 0.3, 0, 1, pop);
  const likeK = tw(abs, p.postAt + 0.5, p.postAt + 0.8, 0, 1, pop);
  const rk = p.reply && p.replyAt !== undefined ? tw(abs, p.replyAt, p.replyAt + 0.32, 0, 1, pop) : 0;
  const caret = Math.floor(frame / 15) % 2 === 0;
  const text = '#F5F5F5';
  const muted = 'rgba(245,245,245,0.55)';
  return (
    <div style={{...FILL, opacity: outK}}>
      {p.line && <div style={{position: 'absolute', left: 60, width: 960, top: p.y - 100, textAlign: 'center', fontFamily: SANS, fontWeight: 700, fontSize: 46, lineHeight: 1.1, color: '#fff', textShadow: '0 3px 20px rgba(0,0,0,0.85)', opacity: inK}}>{p.line}</div>}
      <div style={{position: 'absolute', left: 50, top: p.y, width: 980, borderRadius: 36, background: 'rgba(18,18,20,0.96)', boxShadow: '0 24px 60px rgba(0,0,0,0.55)', padding: '18px 34px 26px', boxSizing: 'border-box', opacity: inK, transform: `translateY(${(1 - inK) * 60}px)`}}>
        <div style={{width: 70, height: 7, borderRadius: 4, background: 'rgba(255,255,255,0.3)', margin: '0 auto 14px'}} />
        <div style={{textAlign: 'center', fontFamily: SANS, fontWeight: 700, fontSize: 30, color: text, paddingBottom: 18, borderBottom: '1px solid rgba(255,255,255,0.1)'}}>Comments</div>
        {posted && (
          <div style={{display: 'flex', gap: 22, paddingTop: 24, opacity: rowK, transform: `translateY(${(1 - rowK) * 18}px)`}}>
            <YouAvatar size={72} />
            <div style={{flex: 1}}>
              <div style={{fontFamily: SANS, fontSize: 28, color: text}}><b>you</b> <span style={{color: muted}}>now</span></div>
              <div style={{fontFamily: SANS, fontWeight: 500, fontSize: 44, lineHeight: 1.15, color: text, marginTop: 4}}>{p.keyword}</div>
              <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 25, color: muted, marginTop: 8}}>Reply</div>
            </div>
            <div style={{flex: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, paddingTop: 10}}>
              <div style={{transform: `scale(${1 + 0.35 * Math.sin(Math.PI * likeK)})`}}>
                {likeK > 0.5 ? <HeartIcon size={40} fill={C3.accent} /> : <HeartIcon size={40} fill="transparent" stroke={muted} />}
              </div>
              <div style={{fontFamily: SANS, fontSize: 22, color: muted}}>{likeK > 0.5 ? 1 : ''}</div>
            </div>
          </div>
        )}
        {rk > 0 && p.reply && (
          <div style={{display: 'flex', gap: 18, paddingTop: 22, paddingLeft: 94, opacity: rk, transform: `translateY(${(1 - rk) * 22}px)`}}>
            <BrandAvatar size={58} src={p.iconSrc} />
            <div style={{flex: 1}}>
              <div style={{fontFamily: SANS, fontSize: 26, color: text}}><b>{p.replyName}</b> <span style={{color: muted}}>now</span> <span style={{marginLeft: 8, padding: '2px 12px', borderRadius: 10, fontSize: 20, fontWeight: 700, background: 'rgba(255,255,255,0.12)', color: muted}}>Creator</span></div>
              <div style={{fontFamily: SANS, fontWeight: 500, fontSize: 38, lineHeight: 1.18, color: text, marginTop: 4}}>{p.reply}</div>
              {p.linkLabel && <div style={{display: 'inline-block', marginTop: 12, padding: '8px 22px', borderRadius: 22, fontFamily: SANS, fontWeight: 700, fontSize: 28, color: '#1a0f0a', background: ROSE.grad}}>{p.linkLabel}</div>}
            </div>
          </div>
        )}
        {!posted && (
          <div style={{display: 'flex', alignItems: 'center', gap: 18, marginTop: 22, padding: '10px 12px 10px 10px', borderRadius: 44, border: '1.5px solid rgba(255,255,255,0.18)'}}>
            <YouAvatar size={64} />
            <div style={{flex: 1, fontFamily: SANS, fontSize: 38, color: abs < typeFrom ? muted : text}}>
              {abs < typeFrom ? `Add a comment for ${p.replyName}...` : typed}
              {abs >= typeFrom && caret && <span style={{color: C3.accent}}>|</span>}
            </div>
            <div style={{flex: 'none', padding: '0 18px', fontFamily: SANS, fontWeight: 700, fontSize: 32, color: abs >= typeTo ? '#4CB5F9' : 'rgba(76,181,249,0.4)'}}>Post</div>
          </div>
        )}
      </div>
    </div>
  );
};
export const CommentBubbleV2: React.FC<{fx: Of<'comment-bubble'>}> = ({fx}) => (
  <IgComments fx={fx} p={{keyword: fx.props.comment, postAt: fx.props.postAt, reply: fx.props.reply, replyAt: fx.props.replyAt, replyName: fx.props.replyName, linkLabel: fx.props.linkLabel, y: fx.props.y}} />
);
export const CommentDropV2: React.FC<{fx: Of<'comment-drop'>}> = ({fx}) => <IgComments fx={fx} p={fx.props} />;
export const CommentCtaV2: React.FC<{fx: Of<'comment-cta'>}> = ({fx}) => <IgComments fx={fx} p={fx.props} />;

// ================================================================ spotlight v2: a beam from above with dust drifting through it
/** behind her: the room dims and a cone of warm light falls on her */
export const SpotlightBeam: React.FC<{fx: Of<'spotlight'>}> = ({fx}) => {
  const {t, len} = useSpan(fx);
  const fade = tw(t, 0, 0.35) * (1 - tw(t, len - 0.35, len));
  const flicker = 0.94 + 0.06 * Math.sin(t * 9) * Math.sin(t * 2.3);
  return (
    <>
      <div style={{...FILL, background: `rgba(0,0,0,${fx.props.dim})`, opacity: fade}} />
      <div style={{...FILL, opacity: fade * flicker, background: 'linear-gradient(180deg, rgba(255,232,205,0.42), rgba(255,232,205,0.12) 70%, rgba(255,232,205,0))', clipPath: 'polygon(42% 0, 58% 0, 92% 100%, 8% 100%)', filter: 'blur(18px)'}} />
      <div style={{...FILL, opacity: fade, background: 'radial-gradient(ellipse 34% 8% at 50% 92%, rgba(255,226,196,0.35), rgba(255,226,196,0))'}} />
    </>
  );
};
/** in front of her: the dust motes in the beam, then the gold words as in the original */
const Dust: React.FC<{t: number; k: number}> = ({t, k}) => (
  <div style={{...FILL, opacity: k, clipPath: 'polygon(42% 0, 58% 0, 92% 100%, 8% 100%)'}}>
    {Array.from({length: 46}, (_, i) => {
      const seed = Math.sin(i * 91.7) * 43758.5;
      const r = seed - Math.floor(seed);
      const x = 120 + ((i * 197) % 840) + 30 * Math.sin(t * (0.3 + r) + i);
      const y = ((i * 263 + t * (18 + 30 * r)) % 1920);
      const size = 2 + 5 * r;
      const tw2 = 0.35 + 0.65 * Math.abs(Math.sin(t * (1 + r * 2) + i));
      return <div key={i} style={{position: 'absolute', left: x, top: y, width: size, height: size, borderRadius: '50%', background: '#FFF1DF', opacity: Math.min(1, tw2 * 1.1), boxShadow: `0 0 ${size * 3}px rgba(255,236,210,0.9)`}} />;
    })}
  </div>
);
export const SpotlightDust: React.FC<{fx: Of<'spotlight'>}> = ({fx}) => {
  const {t, len} = useSpan(fx);
  const k = tw(t, 0.2, 0.7) * (1 - tw(t, len - 0.4, len));
  return (
    <>
      <Dust t={t} k={k} />
      <SpotlightWords fx={fx} />
    </>
  );
};

// ================================================================ polaroid-drop v2: a fan of photos
export const PolaroidFan: React.FC<{fx: Of<'polaroid-drop'>}> = ({fx}) => {
  const {t, len} = useSpan(fx);
  const photos = fx.props.photos.length ? fx.props.photos : [{src: fx.props.src, caption: fx.props.caption}];
  const n = photos.length;
  const exit = tw(t, len - 0.45, len, 0, 1, (x) => x * x);
  const spread = tw(t, 0.3 + n * 0.22, 0.9 + n * 0.22, 0, 1, smooth);
  return (
    <div style={FILL}>
      {photos.map((ph, i) => {
        const drop = tw(t, i * 0.22, i * 0.22 + 0.55, 0, 1, (x) => 1 - Math.pow(1 - x, 3) + Math.sin(x * Math.PI * 3) * 0.04 * (1 - x));
        const off = i - (n - 1) / 2;
        const x = off * 270 * spread;
        const rot = (fx.props.angle * (i % 2 ? -1 : 1) * 0.6) + off * 9 * spread + (1 - drop) * -24;
        const y = -1000 * (1 - drop) + exit * 1200 + Math.abs(off) * 40 * spread;
        return (
          <div key={i} style={{position: 'absolute', left: 350 + x, top: 760 + y, width: 380, height: 470, background: '#fff', borderRadius: 8, padding: '22px 22px 0', boxSizing: 'border-box', transform: `rotate(${rot}deg)`, boxShadow: '0 30px 70px rgba(0,0,0,0.55)', zIndex: i}}>
            <div style={{width: 336, height: 336, overflow: 'hidden', background: `linear-gradient(160deg, ${C3.accent}, #111)`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              {ph.src ? <Media src={ph.src} /> : <div style={{fontFamily: serifFamily, fontStyle: 'italic', fontSize: 36, color: 'rgba(255,255,255,0.85)'}}>photo goes here</div>}
            </div>
            {ph.caption && <div style={{fontFamily: handFamily, fontWeight: 700, fontSize: 46, color: '#2b2b2b', textAlign: 'center', marginTop: 12}}>{ph.caption}</div>}
          </div>
        );
      })}
    </div>
  );
};

// ================================================================ phone-mockup v2: a solid phone that turns like holo-phone, with the member's screen
export const PhoneMockupV2: React.FC<{fx: Of<'phone-mockup'>}> = ({fx}) => {
  const {t, inK, outK} = useSpan(fx);
  const right = fx.props.side === 'right';
  const turn = (right ? -18 : 18) + Math.sin(t * 1.1) * 12;
  const fly = tw(t, 0, 0.7, 0, 1, pop);
  const W = 400;
  const H = 820;
  return (
    <div style={{...FILL, perspective: 1600, opacity: outK}}>
      <div style={{position: 'absolute', [right ? 'right' : 'left']: 60, top: 640 + Math.sin(t * 1.6) * 10, width: W, height: H, transform: `translateX(${(1 - fly) * (right ? 700 : -700)}px) rotateY(${turn}deg) rotateX(5deg)`, transformStyle: 'preserve-3d', opacity: Math.min(1, inK * 2)}}>
        {/* back shell a little behind gives the phone its thickness as it turns */}
        <div style={{position: 'absolute', inset: 0, borderRadius: 66, background: ROSE.grad, transform: 'translateZ(-24px)', filter: 'brightness(0.6)'}} />
        <div style={{position: 'absolute', inset: 0, borderRadius: 66, padding: 14, boxSizing: 'border-box', background: ROSE.grad, boxShadow: `0 40px 90px rgba(0,0,0,0.6), 0 0 40px rgba(${ROSE.glow},0.25)`}}>
          <div style={{position: 'relative', width: '100%', height: '100%', borderRadius: 54, overflow: 'hidden', background: '#0b0c0d'}}>
            {fx.props.src ? <Media src={fx.props.src} /> : (
              <>
                <div style={{position: 'absolute', left: 24, top: 74, fontFamily: SANS, fontWeight: 700, fontSize: 26, letterSpacing: 3, color: ROSE.light, textTransform: 'uppercase'}}>{fx.props.title}</div>
                <div style={{position: 'absolute', left: 24, right: 24, top: 122, height: 340, borderRadius: 28, background: `linear-gradient(160deg, ${C3.accent}, #111)`}}>
                  <div style={{position: 'absolute', left: '50%', top: '50%', transform: 'translate(-40%,-50%)', width: 0, height: 0, borderTop: '28px solid transparent', borderBottom: '28px solid transparent', borderLeft: '46px solid rgba(255,255,255,0.92)'}} />
                </div>
                {fx.props.lines.map((l, i) => {
                  const lk = tw(t, 0.8 + i * 0.25, 1.05 + i * 0.25);
                  return <div key={i} style={{position: 'absolute', left: 24, right: 24, top: 490 + i * 82, padding: '14px 18px', borderRadius: 20, background: 'rgba(255,255,255,0.1)', fontFamily: SANS, fontWeight: 600, fontSize: 25, color: '#fff', opacity: lk, transform: `translateY(${(1 - lk) * 14}px)`}}>{l}</div>;
                })}
              </>
            )}
            <div style={{position: 'absolute', left: W / 2 - 14 - 64, top: 14, width: 128, height: 30, borderRadius: 15, background: '#000'}} />
            <div style={{position: 'absolute', inset: 0, background: `linear-gradient(${110 + turn}deg, rgba(255,255,255,0) 40%, rgba(255,255,255,0.14) 50%, rgba(255,255,255,0) 60%)`}} />
          </div>
        </div>
      </div>
      <div style={{display: 'none'}}>{H}</div>
    </div>
  );
};

// ================================================================ new: dm-thread
export const DmThread: React.FC<{fx: Of<'dm-thread'>}> = ({fx}) => {
  const {abs, frame, inK, outK} = useSpan(fx);
  const {name, messages, y, iconSrc} = fx.props;
  const next = messages.find((m) => abs < m.at);
  const typing = next && next.from === 'them' && abs > next.at - 0.9;
  const dots = [0, 1, 2].map((i) => 0.35 + 0.65 * Math.max(0, Math.sin(frame * 0.3 - i * 0.9)));
  return (
    <div style={{...FILL, opacity: outK}}>
      <div style={{position: 'absolute', left: 70, top: y, width: 940, borderRadius: 40, background: 'rgba(14,14,16,0.95)', boxShadow: '0 24px 60px rgba(0,0,0,0.55)', padding: '24px 30px 30px', boxSizing: 'border-box', opacity: inK, transform: `translateY(${(1 - inK) * 50}px)`}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 18, paddingBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.1)'}}>
          <BrandAvatar size={64} src={iconSrc} />
          <div>
            <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 32, color: '#fff'}}>{name}</div>
            <div style={{fontFamily: SANS, fontSize: 22, color: 'rgba(255,255,255,0.5)'}}>Active now</div>
          </div>
        </div>
        <div style={{display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 22}}>
          {messages.filter((m) => abs >= m.at).map((m, i) => {
            const k = tw(abs, m.at, m.at + 0.28, 0, 1, pop);
            const me = m.from === 'me';
            return (
              <div key={i} style={{alignSelf: me ? 'flex-end' : 'flex-start', maxWidth: 680, padding: '18px 28px', borderRadius: 34, [me ? 'borderBottomRightRadius' : 'borderBottomLeftRadius']: 10, background: me ? `linear-gradient(135deg, ${C3.accent}, ${C3.accentDeep})` : 'rgba(255,255,255,0.12)', fontFamily: SANS, fontWeight: 500, fontSize: 38, lineHeight: 1.2, color: '#fff', opacity: k, transform: `translateY(${(1 - k) * 20}px) scale(${0.9 + 0.1 * k})`, transformOrigin: me ? 'right bottom' : 'left bottom'}}>{m.text}</div>
            );
          })}
          {typing && (
            <div style={{alignSelf: 'flex-start', display: 'flex', gap: 10, padding: '22px 28px', borderRadius: 34, background: 'rgba(255,255,255,0.12)'}}>
              {dots.map((o, i) => <div key={i} style={{width: 14, height: 14, borderRadius: 7, background: '#fff', opacity: o}} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ================================================================ new: review-card (only real reviews from the member)
const Star: React.FC<{size: number; k: number}> = ({size, k}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{transform: `scale(${k})`}}>
    <path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.4 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8z" fill={k > 0.5 ? '#FFC93C' : 'rgba(255,255,255,0.2)'} />
  </svg>
);
export const ReviewCard: React.FC<{fx: Of<'review-card'>}> = ({fx}) => {
  const {t, inK, outK} = useSpan(fx);
  const {quote, name, detail, stars, src, y} = fx.props;
  return (
    <div style={{...FILL, opacity: outK}}>
      <div style={{position: 'absolute', left: 70, top: y, width: 940, borderRadius: 36, background: 'rgba(250,249,247,0.97)', boxShadow: '0 26px 60px rgba(0,0,0,0.5)', padding: '34px 44px 36px', boxSizing: 'border-box', opacity: inK, transform: `translateY(${(1 - inK) * 50}px) rotate(${-1.2 * inK}deg)`}}>
        <div style={{display: 'flex', gap: 6}}>{Array.from({length: stars}, (_, i) => <Star key={i} size={48} k={tw(t, 0.3 + i * 0.12, 0.5 + i * 0.12, 0, 1, pop)} />)}</div>
        <div style={{fontFamily: serifFamily, fontStyle: 'italic', fontWeight: 600, fontSize: quote.length > 110 ? 40 : 48, lineHeight: 1.22, color: '#1b1b1d', marginTop: 18, opacity: tw(t, 0.45, 0.8)}}>“{quote}”</div>
        <div style={{display: 'flex', alignItems: 'center', gap: 18, marginTop: 24, opacity: tw(t, 0.8, 1.1)}}>
          {src && <div style={{width: 72, height: 72, borderRadius: 36, overflow: 'hidden', flex: 'none'}}><Media src={src} /></div>}
          <div>
            <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 32, color: '#1b1b1d'}}>{name}</div>
            {detail && <div style={{fontFamily: SANS, fontSize: 24, color: 'rgba(27,27,29,0.6)'}}>{detail}</div>}
          </div>
        </div>
        <div style={{position: 'absolute', left: 44, right: 44, bottom: 0, height: 6, borderRadius: 3, background: ROSE.grad}} />
      </div>
    </div>
  );
};

// ================================================================ new: highlighter (a marker sweeps across the key words)
export const Highlighter: React.FC<{fx: Of<'highlighter'>}> = ({fx}) => {
  const {abs, inK, outK} = useSpan(fx);
  const {text, color, y, size} = fx.props;
  const parts = text.split(/(\*[^*]+\*)/g).filter(Boolean);
  let mark = 0;
  return (
    <div style={{...FILL, opacity: outK}}>
      <div style={{position: 'absolute', left: 70, width: 940, top: y, textAlign: 'center', fontFamily: SANS, fontWeight: 700, fontSize: size, lineHeight: 1.3, color: '#fff', textShadow: '0 3px 18px rgba(0,0,0,0.7)', opacity: inK, transform: `translateY(${(1 - inK) * 24}px)`}}>
        {parts.map((p, i) => {
          if (!(p.startsWith('*') && p.endsWith('*'))) return <React.Fragment key={i}>{p}</React.Fragment>;
          const at = fx.props.marks[mark] ?? fx.at + 0.5 + mark * 0.6;
          mark++;
          const k = tw(abs, at, at + 0.45, 0, 1, (x) => 1 - Math.pow(1 - x, 2));
          return (
            <span key={i} style={{position: 'relative', display: 'inline-block', padding: '0 0.12em', color: k > 0.5 ? '#141414' : '#fff', textShadow: k > 0.5 ? 'none' : undefined}}>
              <span style={{position: 'absolute', left: '-0.06em', right: '-0.06em', top: '0.1em', bottom: '0.06em', background: color, borderRadius: '0.12em 0.3em 0.18em 0.32em', transform: `skewX(-6deg) scaleX(${k})`, transformOrigin: 'left center', opacity: 0.92, zIndex: 0}} />
              <span style={{position: 'relative'}}>{p.slice(1, -1)}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
};

// ================================================================ new: taped-note (a paper note taped to the frame)
export const TapedNote: React.FC<{fx: Of<'taped-note'>}> = ({fx}) => {
  const {t, outK} = useSpan(fx);
  const {text, title, side, y, angle} = fx.props;
  const k = tw(t, 0, 0.45, 0, 1, pop);
  const tape = tw(t, 0.35, 0.6);
  const left = side === 'left' ? 60 : side === 'right' ? 1080 - 60 - 560 : 260;
  return (
    <div style={{...FILL, opacity: outK}}>
      <div style={{position: 'absolute', left, top: y, width: 560, transform: `translateY(${(1 - k) * 80}px) rotate(${angle * k}deg)`, opacity: Math.min(1, k * 2)}}>
        <div style={{background: '#FBF7EE', backgroundImage: 'repeating-linear-gradient(180deg, transparent 0 58px, rgba(70,110,160,0.18) 58px 60px)', padding: '56px 44px 40px', boxShadow: '0 22px 50px rgba(0,0,0,0.45)', borderRadius: 4}}>
          {title && <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 26, letterSpacing: 4, textTransform: 'uppercase', color: C3.accent, marginBottom: 10}}>{title}</div>}
          <div style={{fontFamily: handFamily, fontWeight: 700, fontSize: text.length > 60 ? 50 : 60, lineHeight: 1.1, color: '#2a2a2c'}}>{text}</div>
        </div>
        <div style={{position: 'absolute', left: 190, top: -26, width: 180, height: 56, background: `linear-gradient(90deg, rgba(255,255,255,0.15), rgba(255,255,255,0.35)), ${ROSE.light}`, opacity: 0.82 * tape, transform: `rotate(-3deg) scaleX(${0.6 + 0.4 * tape})`, clipPath: 'polygon(3% 0, 97% 4%, 100% 50%, 97% 96%, 2% 100%, 0 50%)', boxShadow: '0 2px 6px rgba(0,0,0,0.2)'}} />
      </div>
    </div>
  );
};

// ================================================================ new: lower-third (name and title bar)
export const LowerThird: React.FC<{fx: Of<'lower-third'>}> = ({fx}) => {
  const {t, len} = useSpan(fx);
  const {name, title, y, side} = fx.props;
  const bar = tw(t, 0, 0.35);
  const nameK = tw(t, 0.2, 0.55);
  const titleK = tw(t, 0.4, 0.75);
  const out = tw(t, len - 0.35, len);
  const left = side === 'left';
  return (
    <div style={{...FILL, opacity: 1 - out}}>
      <div style={{position: 'absolute', [left ? 'left' : 'right']: 60, top: y, display: 'flex', flexDirection: left ? 'row' : 'row-reverse', alignItems: 'stretch', gap: 22, transform: `translateX(${out * (left ? -60 : 60)}px)`}}>
        <div style={{width: 10, borderRadius: 5, background: ROSE.grad, transform: `scaleY(${bar})`, transformOrigin: 'top'}} />
        <div style={{textAlign: left ? 'left' : 'right', overflow: 'hidden'}}>
          <div style={{padding: '10px 26px', background: 'rgba(10,10,12,0.82)', fontFamily: SANS, fontWeight: 700, fontSize: 56, lineHeight: 1.1, color: '#fff', transform: `translateX(${(1 - nameK) * (left ? -110 : 110)}%)`}}>{name}</div>
          <div style={{display: 'inline-block', marginTop: 8, padding: '6px 26px', background: C3.accent, fontFamily: SANS, fontWeight: 700, fontSize: 30, letterSpacing: 3, textTransform: 'uppercase', color: '#fff', transform: `translateX(${(1 - titleK) * (left ? -110 : 110)}%)`}}>{title}</div>
        </div>
      </div>
    </div>
  );
};

// ================================================================ new: save-tap (a finger taps the bookmark, it fills, "Saved")
export const SaveTap: React.FC<{fx: Of<'save-tap'>}> = ({fx}) => {
  const {t, inK, outK} = useSpan(fx);
  const {label, y} = fx.props;
  const tapAt = 0.9;
  const press = tw(t, tapAt - 0.1, tapAt) * (1 - tw(t, tapAt, tapAt + 0.15));
  const filled = t >= tapAt;
  const burst = tw(t, tapAt, tapAt + 0.5);
  const toast = tw(t, tapAt + 0.25, tapAt + 0.5, 0, 1, pop);
  const finger = tw(t, 0.2, tapAt - 0.05, 0, 1, smooth) * (1 - tw(t, tapAt + 0.2, tapAt + 0.6));
  const cx = 540;
  return (
    <div style={{...FILL, opacity: outK}}>
      <div style={{position: 'absolute', left: 0, width: 1080, top: y - 110, textAlign: 'center', fontFamily: SANS, fontWeight: 700, fontSize: 52, color: '#fff', textShadow: '0 3px 18px rgba(0,0,0,0.8)', opacity: inK}}>{label}</div>
      <div style={{position: 'absolute', left: cx - 75, top: y, width: 150, height: 150, borderRadius: 75, background: 'rgba(14,14,16,0.88)', border: '2px solid rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${inK * (1 - 0.12 * press) * (1 + 0.12 * Math.sin(Math.PI * burst))})`, boxShadow: '0 16px 40px rgba(0,0,0,0.5)'}}>
        <svg width={70} height={84} viewBox="0 0 24 28">
          <path d="M4 2.5h16v23l-8-6-8 6z" fill={filled ? '#fff' : 'none'} stroke="#fff" strokeWidth={2.2} strokeLinejoin="round" />
        </svg>
      </div>
      {burst > 0 && burst < 1 && Array.from({length: 10}, (_, i) => {
        const a = (i / 10) * Math.PI * 2;
        const r = 90 + 70 * burst;
        return <div key={i} style={{position: 'absolute', left: cx + Math.cos(a) * r - 6, top: y + 75 + Math.sin(a) * r - 6, width: 12, height: 12, borderRadius: 6, background: i % 2 ? C3.accent : ROSE.light, opacity: 1 - burst}} />;
      })}
      {/* the fingertip: a soft white dot that glides in and presses, with a ripple on the tap */}
      <div style={{position: 'absolute', left: cx + 10 + (1 - finger) * 160, top: y + 60 + (1 - finger) * 200, width: 70, height: 70, borderRadius: 35, background: 'rgba(255,255,255,0.55)', border: '3px solid rgba(255,255,255,0.9)', boxSizing: 'border-box', opacity: finger, transform: `scale(${1 - 0.18 * press})`, boxShadow: '0 6px 18px rgba(0,0,0,0.35)'}} />
      {burst > 0 && burst < 1 && <div style={{position: 'absolute', left: cx + 45 - 35 - 60 * burst, top: y + 95 - 35 - 60 * burst, width: 70 + 120 * burst, height: 70 + 120 * burst, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.8)', opacity: 1 - burst}} />}
      <div style={{position: 'absolute', left: cx - 160, width: 320, top: y + 186, textAlign: 'center', padding: '14px 0', borderRadius: 30, background: '#fff', fontFamily: SANS, fontWeight: 700, fontSize: 32, color: '#141414', opacity: toast, transform: `translateY(${(1 - toast) * 20}px)`}}>Saved</div>
    </div>
  );
};

// ================================================================ dispatch
export const sixteenthPlate = (fx: Fx): React.ReactNode => (fx.type === 'spotlight' && fx.props.version === 2 ? <SpotlightBeam fx={fx} /> : null);
export const sixteenthOver = (fx: Fx): React.ReactNode => {
  switch (fx.type) {
    case 'dm-thread': return <DmThread fx={fx} />;
    case 'review-card': return <ReviewCard fx={fx} />;
    case 'highlighter': return <Highlighter fx={fx} />;
    case 'taped-note': return <TapedNote fx={fx} />;
    case 'lower-third': return <LowerThird fx={fx} />;
    case 'save-tap': return <SaveTap fx={fx} />;
    case 'the-stack': return fx.props.version === 2 ? <TheStackV2 fx={fx} /> : null;
    case 'sticky-text': return fx.props.version === 2 ? <StickyTextV2 fx={fx} /> : null;
    case 'freeze-sticker': return fx.props.version === 2 ? <FreezeStickerV2 fx={fx} /> : null;
    case 'comment-bubble': return fx.props.version === 2 ? <CommentBubbleV2 fx={fx} /> : null;
    case 'comment-drop': return fx.props.version === 2 ? <CommentDropV2 fx={fx} /> : null;
    case 'comment-cta': return fx.props.version === 2 ? <CommentCtaV2 fx={fx} /> : null;
    case 'spotlight': return fx.props.version === 2 ? <SpotlightDust fx={fx} /> : null;
    case 'polaroid-drop': return fx.props.version === 2 ? <PolaroidFan fx={fx} /> : null;
    case 'phone-mockup': return fx.props.version === 2 ? <PhoneMockupV2 fx={fx} /> : null;
    default: return null;
  }
};
