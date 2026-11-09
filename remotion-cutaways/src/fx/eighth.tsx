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

// ---------------------------------------------------------------- blade slice: a thin white line flashes across her, then the frame is cut along it and the top half slides off and snaps back
export const BladeSlice: React.FC<{fx: Of<'blade-slice'>}> = ({fx}) => {
  const {t, abs, a, fps} = useSpan(fx);
  const {anchors, video, videoStyle} = useFxEnv();
  const head = anchorPx(anchors, Math.round(abs * fps), 'head');
  const ang = (fx.props.angle * Math.PI) / 180;
  // the cut passes just under her chin
  const cx = head.x;
  const cy = head.y + 440;
  const line = tw(t, 0.05, 0.2, 0, 1, (x) => x);
  const flash = tw(t, 0.05, 0.12) * (1 - tw(t, 0.25, 0.35));
  const slide = tw(t, 0.2, 0.36, 0, 1, (x) => 1 - (1 - x) ** 3) * (1 - tw(t, 0.8, 0.98, 0, 1, (x) => x * x));
  const dist = fx.props.slide * slide;
  const dx = Math.cos(ang) * dist;
  const dy = Math.sin(ang) * dist;
  // the cut line across the whole frame: y = cy + tan(ang) * (x - cx)
  const yAt = (x: number) => cy + Math.tan(ang) * (x - cx);
  const top = `polygon(0 0, 1080px 0, 1080px ${yAt(1080)}px, 0 ${yAt(0)}px)`;
  const bottom = `polygon(0 ${yAt(0)}px, 1080px ${yAt(1080)}px, 1080px 1920px, 0 1920px)`;
  const from = Math.round(a * fps);
  const vid = (clip: string, tx: number, ty: number) => (
    <div style={{...FILL, clipPath: clip, transform: `translate(${tx}px, ${ty}px)`}}>
      <OffthreadVideo src={staticFile(video)} muted startFrom={from} style={{...FILL, objectFit: 'cover', ...videoStyle}} />
    </div>
  );
  const cutting = slide > 0.001;
  return (
    <div style={{...FILL, overflow: 'hidden', pointerEvents: 'none'}}>
      {cutting && <div style={{...FILL, background: '#050505'}} />}
      {cutting && vid(bottom, 0, 0)}
      {cutting && vid(top, -dx, -dy)}
      {cutting && <div style={{...FILL, clipPath: top, transform: `translate(${-dx}px, ${-dy}px)`, boxShadow: 'inset 0 -6px 0 rgba(255,255,255,0.85)'}} />}
      <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
        <line x1={1080} y1={yAt(1080)} x2={1080 - 1080 * line} y2={yAt(1080 - 1080 * line)} stroke="#fff" strokeWidth={8} opacity={1 - tw(t, 0.3, 0.45)} style={{filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.9))'}} />
      </svg>
      <div style={{...FILL, background: '#fff', opacity: 0.25 * flash}} />
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

// ---------------------------------------------------------------- banknote: a full-screen green-ink note like real currency, her portrait engraved in the oval, the number counts up
const NOTE_INK = '#1F4A35';
const NOTE_PAPER = '#F1EEDF';
const waves = (w: number, h: number, step: number, amp: number, id: string) => (
  <svg width={w} height={h} style={{position: 'absolute', left: 0, top: 0}}>
    <defs>
      <pattern id={id} width={120} height={step} patternUnits="userSpaceOnUse">
        <path d={`M0 ${step / 2} Q 30 ${step / 2 - amp} 60 ${step / 2} T 120 ${step / 2}`} fill="none" stroke={NOTE_INK} strokeWidth={1.1} opacity={0.55} />
      </pattern>
    </defs>
    <rect width={w} height={h} fill={`url(#${id})`} />
  </svg>
);
/** a guilloche band: overlapping sine strands, like the edge pattern on a bill */
const Guilloche: React.FC<{w: number; h: number; vertical?: boolean}> = ({w, h, vertical}) => {
  const L = vertical ? h : w;
  const T = vertical ? w : h;
  const paths = Array.from({length: 5}, (_, k) => {
    let d = '';
    for (let x = 0; x <= L; x += 6) {
      const y = T / 2 + Math.sin((x / 22) + k * 1.25) * (T / 2 - 3);
      d += `${x === 0 ? 'M' : 'L'}${vertical ? `${y} ${x}` : `${x} ${y}`} `;
    }
    return d;
  });
  return (
    <svg width={w} height={h} style={{position: 'absolute', left: 0, top: 0}}>
      {paths.map((d, i) => <path key={i} d={d} fill="none" stroke={NOTE_INK} strokeWidth={1.3} opacity={0.8} />)}
    </svg>
  );
};
const Rosette: React.FC<{size: number; text: string; sub?: string}> = ({size, text, sub}) => (
  <div style={{position: 'absolute', width: size, height: size}}>
    <svg width={size} height={size}>
      {Array.from({length: 36}, (_, i) => <ellipse key={i} cx={size / 2} cy={size / 2} rx={size * 0.46} ry={size * 0.2} fill="none" stroke={NOTE_INK} strokeWidth={0.9} opacity={0.7} transform={`rotate(${i * 5} ${size / 2} ${size / 2})`} />)}
      <circle cx={size / 2} cy={size / 2} r={size * 0.24} fill={NOTE_PAPER} stroke={NOTE_INK} strokeWidth={2} />
    </svg>
    <div style={{position: 'absolute', left: 0, top: size / 2 - 30, width: size, textAlign: 'center', fontFamily: serifFamily, fontStyle: 'italic', fontSize: 21, lineHeight: '28px', color: NOTE_INK}}>{text}</div>
    {sub && <div style={{position: 'absolute', left: 0, top: size / 2 + 4, width: size, textAlign: 'center', fontFamily: serifFamily, fontSize: 15, letterSpacing: 2, color: NOTE_INK, textTransform: 'uppercase'}}>{sub}</div>}
  </div>
);
export const Banknote: React.FC<{fx: Of<'banknote'>}> = ({fx}) => {
  const {t, len, a, outK} = useSpan(fx);
  const {video} = useFxEnv();
  const {fps} = useVideoConfig();
  const {amount, title, serial, finePrint, ring, seal, sealSub} = fx.props;
  const inK = tw(t, 0, 0.3);
  const n = Math.round(amount * tw(t, 0.25, Math.max(0.8, len - 0.6), 0, 1, (x) => 1 - (1 - x) ** 3));
  const num = `${n.toLocaleString('en-US')}.`;
  const W = 1080;
  const CX = W / 2;
  // tall, narrow numerals like engraved currency type
  const numeral = (size: number, extra: React.CSSProperties = {}) => ({fontFamily: serifFamily, fontSize: size, color: NOTE_INK, display: 'inline-block', transform: 'scaleX(0.78)', whiteSpace: 'nowrap', ...extra}) as React.CSSProperties;
  const box = (x: number, y: number, w: number, h: number, child: React.ReactNode, r = 22) => (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: r, border: `3px solid ${NOTE_INK}`, boxShadow: `inset 0 0 0 7px ${NOTE_PAPER}, inset 0 0 0 9px ${NOTE_INK}`, background: NOTE_PAPER, display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box', overflow: 'hidden'}}>{child}</div>
  );
  // portrait oval, centered
  const OW = 640;
  const OH = 820;
  const OY = 250;
  const ringText = `${ring} • `.repeat(9).toUpperCase();
  const SW = OW + 200;
  const SH = OH + 200;
  return (
    <div style={{...FILL, background: NOTE_PAPER, opacity: outK * inK, overflow: 'hidden', transform: `scale(${1.04 - 0.04 * inK})`}}>
      {/* wavy engraved field inside the border */}
      <div style={{position: 'absolute', left: 90, top: 150, width: 900, height: 1620, overflow: 'hidden'}}>{waves(900, 1620, 8, 3, 'nw')}</div>
      {/* outer frame and guilloche band all the way around */}
      <div style={{position: 'absolute', left: 24, top: 24, width: 1032, height: 1872, border: `3px solid ${NOTE_INK}`, borderRadius: 20}} />
      <div style={{position: 'absolute', left: 36, top: 140, width: 50, height: 1640}}><Guilloche w={50} h={1640} vertical /></div>
      <div style={{position: 'absolute', left: 994, top: 140, width: 50, height: 1640}}><Guilloche w={50} h={1640} vertical /></div>
      <div style={{position: 'absolute', left: 300, top: 40, width: 480, height: 50}}><Guilloche w={480} h={50} /></div>
      <div style={{position: 'absolute', left: 300, top: 1830, width: 480, height: 50}}><Guilloche w={480} h={50} /></div>
      <div style={{position: 'absolute', left: 88, top: 148, width: 904, height: 1624, border: `2px solid ${NOTE_INK}`}} />
      {/* top row */}
      {box(40, 36, 300, 110, <span style={numeral(76)}>{num}</span>)}
      {box(CX - 170, 46, 340, 90, <span style={{fontFamily: serifFamily, fontWeight: 700, fontSize: 38, letterSpacing: 3, color: '#9E2B2B'}}>{serial}</span>)}
      {box(W - 340, 36, 300, 110, <span style={numeral(76)}>{num}</span>)}
      {/* oval: beaded rim, lettering, engraved portrait */}
      <svg width={SW} height={SH} style={{position: 'absolute', left: CX - SW / 2, top: OY - 100}}>
        <defs><path id="ringPath" d={`M ${SW / 2} ${100 - 42} a ${OW / 2 + 42} ${OH / 2 + 42} 0 1 1 -0.1 0`} /></defs>
        {Array.from({length: 72}, (_, i) => <ellipse key={i} cx={SW / 2} cy={SH / 2} rx={OW / 2 + 88} ry={OH / 2 + 88} fill="none" stroke={NOTE_INK} strokeWidth={0.8} opacity={0.6} transform={`rotate(${i * 5} ${SW / 2} ${SH / 2}) scale(1)`} style={{transform: `scale(${1 - (i % 4) * 0.012})`, transformOrigin: 'center'}} />)}
        {Array.from({length: 120}, (_, i) => {
          const th = (i / 120) * Math.PI * 2;
          return <circle key={`b${i}`} cx={SW / 2 + (OW / 2 + 70) * Math.cos(th)} cy={SH / 2 + (OH / 2 + 70) * Math.sin(th)} r={7} fill="none" stroke={NOTE_INK} strokeWidth={1.6} />;
        })}
        <ellipse cx={SW / 2} cy={SH / 2} rx={OW / 2 + 60} ry={OH / 2 + 60} fill="none" stroke={NOTE_INK} strokeWidth={2} />
        <ellipse cx={SW / 2} cy={SH / 2} rx={OW / 2 + 22} ry={OH / 2 + 22} fill={NOTE_PAPER} stroke={NOTE_INK} strokeWidth={3} />
        <text fontFamily="Playfair Display, Georgia, serif" fontSize={26} fontWeight={700} letterSpacing={7} fill={NOTE_INK}><textPath href="#ringPath">{ringText}</textPath></text>
        <ellipse cx={SW / 2} cy={SH / 2} rx={OW / 2 + 2} ry={OH / 2 + 2} fill="none" stroke={NOTE_INK} strokeWidth={4} />
      </svg>
      <div style={{position: 'absolute', left: CX - OW / 2, top: OY, width: OW, height: OH, borderRadius: '50%', overflow: 'hidden', background: NOTE_INK, isolation: 'isolate'}}>
        <OffthreadVideo src={staticFile(video)} muted startFrom={Math.round(a * fps)} style={{position: 'absolute', left: -(1060 - OW) / 2, top: -110, width: 1060, height: 1884, objectFit: 'cover', filter: 'grayscale(1) contrast(2.3) brightness(0.72)'}} />
        <div style={{position: 'absolute', inset: 0, background: NOTE_INK, mixBlendMode: 'screen'}} />
        <div style={{position: 'absolute', inset: 0, background: `repeating-linear-gradient(-6deg, ${NOTE_INK} 0 1.6px, transparent 1.6px 4.5px)`, mixBlendMode: 'multiply', opacity: 0.8}} />
        <div style={{position: 'absolute', inset: 0, background: `repeating-linear-gradient(-6deg, ${NOTE_PAPER} 0 1.4px, transparent 1.4px 4.5px)`, mixBlendMode: 'lighten', opacity: 0.85}} />
      </div>
      {/* seals either side */}
      <div style={{position: 'absolute', left: 92, top: 1060}}><Rosette size={180} text={seal} sub={sealSub} /></div>
      <div style={{position: 'absolute', left: W - 272, top: 1060}}><Rosette size={180} text="" /></div>
      {/* the big value panel */}
      {box(100, 1220, 880, 440, (
        <div style={{textAlign: 'center', width: '100%'}}>
          <svg width={880} height={300} style={{display: 'block'}}>
            <defs>
              <pattern id="hatch" width={6} height={6} patternUnits="userSpaceOnUse" patternTransform="rotate(-35)"><line x1={0} y1={0} x2={0} y2={6} stroke={NOTE_INK} strokeWidth={3.4} /></pattern>
            </defs>
            <g transform="translate(440 270) scale(0.74 1)">
              <text x={0} y={0} textAnchor="middle" fontFamily="Playfair Display, Georgia, serif" fontSize={330} fill="url(#hatch)" stroke={NOTE_INK} strokeWidth={3}>{num}</text>
            </g>
          </svg>
          <div style={{...numeral(64, {letterSpacing: 2, textTransform: 'uppercase', marginTop: -10})}}>{title}</div>
        </div>
      ), 30)}
      {/* bottom row */}
      {box(40, 1780, 300, 100, <span style={numeral(68)}>{num}</span>)}
      {finePrint && box(CX - 190, 1786, 380, 88, <span style={{fontFamily: serifFamily, fontWeight: 700, fontSize: 21, lineHeight: 1.3, letterSpacing: 1, textAlign: 'center', color: NOTE_INK, textTransform: 'uppercase', padding: '0 14px'}}>{finePrint}</span>, 16)}
      {box(W - 340, 1780, 300, 100, <span style={numeral(68)}>{num}</span>)}
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
