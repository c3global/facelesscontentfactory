import React from 'react';
import {OffthreadVideo, staticFile, useVideoConfig} from 'remotion';
import {handFamily, serifFamily} from '../fonts';
import {Cutout} from './behind';
import {Caret, typedSlice, useSpan} from './fourth';
import type {Fx} from './schema';
import {BrandAvatar, C3, HeartIcon, SendArrow} from './theme';
import {anchorPx, pop, tw, useFxEnv} from './util';

/**
 * Eighth FX batch (C3 skin), batch 2 of the three-reel build (Nov 2026): comment post, layer explode, sketch words,
 * blade slice, head stack, rack focus, banknote, voice note.
 */
type Of<T extends Fx['type']> = Extract<Fx, {type: T}>;
const FILL: React.CSSProperties = {position: 'absolute', left: 0, top: 0, width: 1080, height: 1920};
const MONO = '"SF Mono", "Menlo", "Courier New", monospace';
const CREAM = '#F3EBDD';
const INK = '#2B2420';
const COPPER_DARK = '#A5551F';

// ---------------------------------------------------------------- comment post (Comment drop, new look): a white comment box types the keyword, posts it, a reply lands under it
export const CommentPost: React.FC<{fx: Of<'comment-post'>}> = ({fx}) => {
  const {abs, frame, outK} = useSpan(fx);
  const {handle, comment, reply, replyName, postAt, replyAt, y} = fx.props;
  const typeFrom = fx.at + 0.35;
  const typed = typedSlice(comment.split(' ')[0], abs, typeFrom, Math.max(typeFrom + 0.4, postAt - 0.15));
  const posted = abs >= postAt;
  const boxIn = tw(abs, fx.at, fx.at + 0.3, 0, 1, pop);
  const card = tw(abs, postAt, postAt + 0.35, 0, 1, pop);
  const rep = tw(abs, replyAt, replyAt + 0.35, 0, 1, pop);
  const heart = tw(abs, replyAt + 0.5, replyAt + 0.8, 0, 1, pop);
  const cardStyle: React.CSSProperties = {position: 'absolute', left: 70, width: 940, borderRadius: 28, background: '#fff', boxShadow: '0 18px 44px rgba(0,0,0,0.45)', padding: '22px 30px', boxSizing: 'border-box', display: 'flex', gap: 20, alignItems: 'flex-start'};
  return (
    <div style={{...FILL, opacity: outK}}>
      {!posted && (
        <div style={{...cardStyle, top: y, alignItems: 'center', transform: `scale(${0.85 + 0.15 * boxIn})`, opacity: boxIn}}>
          <BrandAvatar size={60} />
          <div style={{flex: 1, fontFamily: C3.sans, fontSize: 36, color: typed ? INK : '#9a9a9a', fontWeight: typed ? 700 : 400}}>{typed || 'Add a comment...'}{typed && <Caret frame={frame} h={34} color={COPPER_DARK} />}</div>
          <div style={{padding: '10px 26px', borderRadius: 24, background: typed ? C3.copperGrad : '#eee', color: typed ? '#2a1206' : '#999', fontFamily: C3.sans, fontWeight: 700, fontSize: 28}}>Post</div>
        </div>
      )}
      {posted && (
        <div style={{...cardStyle, top: y, opacity: card, transform: `translateY(${(1 - card) * -30}px)`}}>
          <BrandAvatar size={60} />
          <div style={{flex: 1}}>
            <div style={{fontFamily: C3.sans, fontSize: 24, color: '#888'}}><b style={{color: INK}}>{handle}</b> · now</div>
            <div style={{fontFamily: C3.sans, fontSize: 34, lineHeight: 1.25, color: INK, marginTop: 4}}><b>{comment.split(' ')[0]}</b>{comment.slice(comment.split(' ')[0].length)}</div>
          </div>
          <div style={{transform: `scale(${1 + 0.4 * heart * (1 - heart)})`}}><HeartIcon size={40} fill={heart > 0.5 ? '#E0245E' : 'none'} stroke="#999" /></div>
        </div>
      )}
      {rep > 0 && (
        <div style={{...cardStyle, top: y + 170, left: 150, width: 860, opacity: rep, transform: `translateY(${(1 - rep) * -24}px)`}}>
          <BrandAvatar size={50} />
          <div style={{flex: 1}}>
            <div style={{fontFamily: C3.sans, fontSize: 22, color: '#888'}}><b style={{color: INK}}>{replyName}</b> · now</div>
            <div style={{fontFamily: C3.sans, fontSize: 30, lineHeight: 1.25, color: INK, marginTop: 4}}>{reply}</div>
          </div>
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------- layer explode: the frame splits into glass layers in 3D (room, her, words, sound)
export const LayerExplode: React.FC<{fx: Of<'layer-explode'>}> = ({fx}) => {
  const {t, len, a, outK} = useSpan(fx);
  const {video} = useFxEnv();
  const {fps} = useVideoConfig();
  const {title, labels} = fx.props;
  const open = tw(t, 0.15, 0.9) * (1 - tw(t, len - 0.7, len - 0.15));
  const rotY = -38 * open;
  const gapZ = 260 * open;
  const sc = 1 - 0.38 * open;
  const plane = (z: number, child: React.ReactNode, glass = false): React.CSSProperties & {child?: React.ReactNode} => ({position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, transform: `translateZ(${z}px)`, border: open > 0.05 ? '3px solid rgba(244,176,138,0.7)' : 'none', background: glass ? 'rgba(255,255,255,0.06)' : undefined, boxSizing: 'border-box', overflow: 'hidden', borderRadius: 18 * open});
  const bars = Array.from({length: 46}, (_, i) => 30 + Math.abs(Math.sin(i * 1.7 + t * 6)) * 160);
  return (
    <div style={{...FILL, background: '#0b0c0d', opacity: outK, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 60, top: 140, display: 'flex', gap: 40, fontFamily: MONO, fontWeight: 700, fontSize: 28, letterSpacing: 4, color: C3.copper, opacity: open}}>
        {labels.map((l, i) => <span key={i}>{l.toUpperCase()}</span>)}
      </div>
      <div style={{...FILL, perspective: 2200, perspectiveOrigin: '50% 45%'}}>
        <div style={{...FILL, transformStyle: 'preserve-3d', transform: `scale(${sc}) rotateY(${rotY}deg) rotateX(${8 * open}deg)`}}>
          <div style={plane(-gapZ * 1.5, null)}>
            <OffthreadVideo src={staticFile(video)} muted startFrom={Math.round(a * fps)} style={{...FILL, objectFit: 'cover'}} />
          </div>
          <div style={plane(-gapZ * 0.5, null, true)}>
            <Cutout from={Math.round(a * fps)} plain />
          </div>
          <div style={plane(gapZ * 0.5, null, true)}>
            <div style={{position: 'absolute', left: 80, top: 260, fontFamily: serifFamily, fontStyle: 'italic', fontWeight: 600, fontSize: 150, lineHeight: 0.95, color: '#fff', textShadow: '0 6px 30px rgba(0,0,0,0.6)', whiteSpace: 'pre-line'}}>{title}</div>
          </div>
          <div style={plane(gapZ * 1.5, null, true)}>
            <div style={{position: 'absolute', left: 120, top: 1500, display: 'flex', gap: 8, alignItems: 'center', height: 200}}>
              {bars.map((h, i) => <div key={i} style={{width: 10, height: h, borderRadius: 5, background: C3.copperGrad}} />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- sketch words (behind her): cream paper, a small handwritten word, then a big hand-inked serif word and a scribbled underline
export const SketchWordsPlate: React.FC<{fx: Of<'sketch-words'>}> = ({fx}) => {
  const {t, outK} = useSpan(fx);
  const {small, big} = fx.props;
  const smallK = tw(t, 0.15, 0.6, 0, 1, (x) => x);
  const bigK = tw(t, 0.55, 1.4, 0, 1, (x) => x);
  const fillK = tw(t, 1.3, 1.7);
  const lineK = tw(t, 1.4, 1.8, 0, 1, (x) => x);
  const fs = Math.min(320, 1700 / Math.max(3, big.length));
  return (
    <div style={{...FILL, background: `${CREAM} repeating-linear-gradient(180deg, transparent 0 58px, rgba(165,85,31,0.08) 58px 60px)`, opacity: outK, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 90, top: 90, fontFamily: handFamily, fontSize: 110, color: INK, clipPath: `inset(0 ${100 - smallK * 100}% 0 0)`}}>{small}</div>
      <svg width={1080} height={520} style={{position: 'absolute', left: 0, top: 100}}>
        {[0, 1].map((k) => (
          <text key={k} x={540 + k * 4} y={300 + k * 3} textAnchor="middle" fontFamily="Playfair Display, Georgia, serif" fontWeight={700} fontSize={fs} fill={k === 0 ? `rgba(165,85,31,${0.9 * fillK})` : 'none'} stroke={k === 0 ? COPPER_DARK : INK} strokeWidth={k === 0 ? 4 : 2} strokeDasharray={3000} strokeDashoffset={3000 * (1 - bigK)} opacity={k === 0 ? 1 : 0.6}>{big}</text>
        ))}
        <path d="M150 400 C 330 370, 520 420, 700 385 S 900 395, 940 380" fill="none" stroke={C3.gold} strokeWidth={10} strokeLinecap="round" strokeDasharray={900} strokeDashoffset={900 * (1 - lineK)} />
      </svg>
    </div>
  );
};

// ---------------------------------------------------------------- blade slice: a copper blade streak cuts across her head, with a white glint and a quick shudder
export const BladeSlice: React.FC<{fx: Of<'blade-slice'>}> = ({fx}) => {
  const {t, abs, fps} = useSpan(fx);
  const {anchors} = useFxEnv();
  const head = anchorPx(anchors, Math.round(abs * fps), 'head');
  const cut = tw(t, 0.1, 0.32, 0, 1, (x) => x * x);
  const fade = 1 - tw(t, 0.45, 0.9);
  const ang = fx.props.angle;
  const len = 1500;
  return (
    <div style={{...FILL, overflow: 'hidden', pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: head.x - len / 2, top: head.y + 40, width: len, height: 24, transform: `rotate(${ang}deg)`, transformOrigin: '50% 50%', opacity: fade}}>
        <div style={{position: 'absolute', right: 0, top: 0, height: 24, width: `${cut * 100}%`, borderRadius: 12, background: 'linear-gradient(90deg, rgba(20,10,4,0) 0%, rgba(20,10,4,0.9) 55%, #B5622C 85%, #fff 100%)', boxShadow: '0 0 30px rgba(244,176,138,0.8)'}} />
      </div>
      <div style={{...FILL, background: '#fff', opacity: 0.35 * tw(t, 0.3, 0.34) * (1 - tw(t, 0.36, 0.5))}} />
    </div>
  );
};

// ---------------------------------------------------------------- head stack: label tiles drop from the top and pile up on her head
export const HeadStack: React.FC<{fx: Of<'head-stack'>}> = ({fx}) => {
  const {abs, fps, outK} = useSpan(fx);
  const {anchors} = useFxEnv();
  const cap = anchorPx(anchors, Math.round(abs * fps), 'cap');
  const {labels, gap} = fx.props;
  return (
    <div style={{...FILL, opacity: outK, pointerEvents: 'none'}}>
      {labels.map((l, i) => {
        const at = fx.at + 0.15 + i * gap;
        const k = tw(abs, at, at + 0.35, 0, 1, (x) => x * x);
        const land = tw(abs, at + 0.35, at + 0.55, 0, 1, pop);
        if (abs < at) return null;
        const restY = cap.y - 10 - i * 58;
        const y = -100 + (restY + 100) * k;
        const rot = ((i * 37) % 13) - 6;
        const dx = ((i * 53) % 60) - 30;
        return (
          <div key={i} style={{position: 'absolute', left: cap.x + dx, top: y, transform: `translateX(-50%) rotate(${rot * (0.4 + 0.6 * land)}deg) scaleY(${1 - 0.12 * (land > 0 && land < 1 ? 1 - land : 0)})`, padding: '10px 24px', borderRadius: 12, background: i % 3 === 0 ? C3.copperGrad : i % 3 === 1 ? CREAM : '#1b1d1f', color: i % 3 === 2 ? C3.copper : '#2a1206', border: '2px solid rgba(0,0,0,0.35)', fontFamily: MONO, fontWeight: 700, fontSize: 30, whiteSpace: 'nowrap', boxShadow: '0 6px 14px rgba(0,0,0,0.45)'}}>{l}</div>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------- rack focus: soft copper objects in the foreground are sharp while she is soft, then focus racks to her
export const RackFocus: React.FC<{fx: Of<'rack-focus'>}> = ({fx}) => {
  const {t, len, outK} = useSpan(fx);
  const k = rackK(t, len);
  const blobs = [{x: 120, y: 1500, r: 150, c: '#F4B08A'}, {x: 930, y: 1650, r: 190, c: '#E3BF63'}, {x: 980, y: 380, r: 90, c: '#E08A57'}, {x: 60, y: 520, r: 70, c: '#FFF3C9'}];
  return (
    <div style={{...FILL, opacity: outK * (0.25 + 0.75 * (1 - k * 0.6)), pointerEvents: 'none'}}>
      {blobs.map((b, i) => (
        <div key={i} style={{position: 'absolute', left: b.x - b.r, top: b.y - b.r + Math.sin(t * 1.4 + i) * 10, width: b.r * 2, height: b.r * 2, borderRadius: b.r, background: `radial-gradient(circle at 35% 35%, #fff 0%, ${b.c} 45%, rgba(0,0,0,0) 72%)`, filter: `blur(${2 + 34 * k}px)`}} />
      ))}
    </div>
  );
};
/** 0 = focus on the foreground (she is soft), 1 = focus on her */
export const rackK = (t: number, len: number) => tw(t, 0.5, Math.min(len - 0.3, 1.3));

// ---------------------------------------------------------------- banknote: a cream note in copper ink with her engraved portrait, the number counts up
export const Banknote: React.FC<{fx: Of<'banknote'>}> = ({fx}) => {
  const {t, len, a, outK} = useSpan(fx);
  const {video} = useFxEnv();
  const {fps} = useVideoConfig();
  const {amount, title, serial, finePrint} = fx.props;
  const inK = tw(t, 0, 0.35, 0, 1, pop);
  const n = Math.round(amount * tw(t, 0.3, Math.max(0.8, len - 0.6), 0, 1, (x) => 1 - (1 - x) ** 3));
  const num = n.toLocaleString('en-US');
  const ink = '#7A3A14';
  const guilloche = `repeating-radial-gradient(circle at 50% 50%, transparent 0 6px, rgba(122,58,20,0.18) 6px 7px)`;
  return (
    <div style={{...FILL, background: '#141516', opacity: outK, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 50, top: 340, width: 980, height: 1240, background: `${CREAM}`, border: `10px double ${ink}`, boxSizing: 'border-box', transform: `scale(${0.8 + 0.2 * inK}) rotate(${(1 - inK) * -6}deg)`, opacity: inK, boxShadow: '0 30px 80px rgba(0,0,0,0.6)'}}>
        <div style={{position: 'absolute', inset: 18, border: `3px solid ${ink}`, backgroundImage: guilloche, backgroundSize: '160px 160px'}} />
        <div style={{position: 'absolute', left: 40, top: 34, fontFamily: serifFamily, fontSize: 56, color: ink}}>{num}</div>
        <div style={{position: 'absolute', right: 40, top: 40, padding: '4px 16px', border: `2px solid ${ink}`, fontFamily: serifFamily, fontSize: 30, color: COPPER_DARK, background: CREAM}}>{serial}</div>
        <div style={{position: 'absolute', left: 240, top: 150, width: 500, height: 620, borderRadius: '50%', border: `8px solid ${ink}`, overflow: 'hidden', background: CREAM}}>
          <OffthreadVideo src={staticFile(video)} muted startFrom={Math.round(a * fps)} style={{position: 'absolute', left: -230, top: -210, width: 960, height: 1707, objectFit: 'cover', filter: 'grayscale(1) contrast(1.9) brightness(1.08) sepia(1) hue-rotate(-12deg) saturate(2.2)'}} />
          <div style={{position: 'absolute', inset: 0, background: `repeating-linear-gradient(0deg, rgba(243,235,221,0.55) 0 2px, transparent 2px 5px)`, mixBlendMode: 'screen'}} />
        </div>
        <div style={{position: 'absolute', left: 40, right: 40, top: 800, height: 230, border: `4px solid ${ink}`, background: CREAM, textAlign: 'center'}}>
          <div style={{fontFamily: serifFamily, fontSize: 150, lineHeight: '170px', color: ink}}>{num}</div>
          <div style={{fontFamily: serifFamily, fontSize: 38, letterSpacing: 2, color: ink, textTransform: 'uppercase'}}>{title}</div>
        </div>
        <div style={{position: 'absolute', left: 40, bottom: 40, fontFamily: serifFamily, fontSize: 56, color: ink}}>{num}</div>
        {finePrint && <div style={{position: 'absolute', left: 370, bottom: 46, width: 240, textAlign: 'center', padding: '6px 8px', border: `2px solid ${ink}`, fontFamily: serifFamily, fontSize: 18, lineHeight: 1.2, color: ink, background: CREAM, textTransform: 'uppercase'}}>{finePrint}</div>}
        <div style={{position: 'absolute', right: 40, bottom: 40, fontFamily: serifFamily, fontSize: 56, color: ink}}>{num}</div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- voice note (new look): a chat voice message records with a live waveform, sends, then reads Delivered
export const VoiceNote: React.FC<{fx: Of<'voice-note'>}> = ({fx}) => {
  const {t, abs, len, outK} = useSpan(fx);
  const {speech} = useFxEnv();
  const {label, y} = fx.props;
  const inK = tw(t, 0, 0.3, 0, 1, pop);
  const sendAt = Math.max(0.8, len - 0.9);
  const sent = t >= sendAt;
  const talking = !speech || speech.some(([s, e]) => abs >= s && abs <= e);
  const secs = Math.min(t, sendAt);
  const n = 38;
  return (
    <div style={{...FILL, opacity: outK}}>
      <div style={{position: 'absolute', left: 60, top: y, display: 'flex', alignItems: 'center', gap: 18, opacity: inK, transform: `scale(${0.85 + 0.15 * inK}) translateY(${sent ? -10 * tw(t, sendAt, sendAt + 0.25) : 0}px)`, transformOrigin: 'left center'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 18, padding: '18px 22px', borderRadius: 40, background: '#fff', boxShadow: '0 16px 40px rgba(0,0,0,0.45)', width: 760, boxSizing: 'border-box'}}>
          <div style={{width: 64, height: 64, borderRadius: 32, background: INK, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <div style={{width: 0, height: 0, marginLeft: 6, borderTop: '14px solid transparent', borderBottom: '14px solid transparent', borderLeft: '22px solid #fff'}} />
          </div>
          <div style={{flex: 1, display: 'flex', alignItems: 'center', gap: 5, height: 70}}>
            {Array.from({length: n}, (_, i) => {
              const recorded = i / n <= secs / sendAt;
              const h = recorded ? 10 + Math.abs(Math.sin(i * 2.3) * Math.cos(i * 0.7)) * (talking || sent ? 56 : 16) : 8;
              return <div key={i} style={{width: 7, height: h, borderRadius: 4, background: recorded ? INK : '#cfcfcf'}} />;
            })}
          </div>
          <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 30, color: INK}}>0:{String(Math.floor(secs)).padStart(2, '0')}</div>
          <div style={{width: 60, height: 60, borderRadius: 30, background: C3.copperGrad, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${sent ? 1 + 0.25 * (1 - tw(t, sendAt, sendAt + 0.3)) : 1})`}}><SendArrow size={30} color="#2a1206" /></div>
        </div>
        <BrandAvatar size={84} />
      </div>
      <div style={{position: 'absolute', left: 560, top: y + 130, padding: '8px 22px', borderRadius: 22, background: 'rgba(255,255,255,0.92)', fontFamily: C3.sans, fontWeight: 700, fontSize: 26, color: INK, opacity: inK}}>{sent ? 'Delivered ✓' : label}</div>
    </div>
  );
};

// ---------------------------------------------------------------- dispatch
export const eighthPlate = (fx: Fx): React.ReactNode => (fx.type === 'sketch-words' ? <SketchWordsPlate fx={fx} /> : null);
export const eighthOver = (fx: Fx): React.ReactNode => {
  switch (fx.type) {
    case 'comment-post': return <CommentPost fx={fx} />;
    case 'layer-explode': return <LayerExplode fx={fx} />;
    case 'blade-slice': return <BladeSlice fx={fx} />;
    case 'head-stack': return <HeadStack fx={fx} />;
    case 'rack-focus': return <RackFocus fx={fx} />;
    case 'banknote': return <Banknote fx={fx} />;
    case 'voice-note': return <VoiceNote fx={fx} />;
    default: return null;
  }
};
