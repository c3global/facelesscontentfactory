import React from 'react';
import {Img, OffthreadVideo, staticFile, useVideoConfig} from 'remotion';
import {heavyFamily, serifFamily} from '../fonts';
import {Cutout} from './behind';
import {useSpan} from './fourth';
import type {Fx} from './schema';
import {C3} from './theme';
import {anchorPx, fxRange, pop, tw, useFxEnv} from './util';

/**
 * Ninth FX batch (C3 skin), batch 3 of the three-reel build (Nov 2026): impact frame, dolly zoom, press front, paper tear,
 * blow away, depth scatter, spatial glass, shatter 3D, scene text.
 */
type Of<T extends Fx['type']> = Extract<Fx, {type: T}>;
const FILL: React.CSSProperties = {position: 'absolute', left: 0, top: 0, width: 1080, height: 1920};
const CREAM = '#F3EBDD';
const INK = '#1d1a17';

const BaseClip: React.FC<{from: number; style?: React.CSSProperties}> = ({from, style}) => {
  const {video, videoStyle} = useFxEnv();
  return <OffthreadVideo src={staticFile(video)} muted startFrom={from} style={{...FILL, objectFit: 'cover', ...videoStyle, ...style}} />;
};

// ---------------------------------------------------------------- impact frame: a comic-book panel, her in hard black ink on cream, speed lines burst behind, one huge word
export const ImpactFrame: React.FC<{fx: Of<'impact-frame'>}> = ({fx}) => {
  const {t, len, a, fps} = useSpan(fx);
  const {word} = fx.props;
  const on = t < len - 0.05;
  // two hard flashes between inverted and normal, like his
  const invert = (t > 0.12 && t < 0.22) || (t > 0.42 && t < 0.5);
  const spin = t * 6;
  const slam = tw(t, 0.05, 0.25, 0, 1, pop);
  if (!on) return null;
  return (
    <div style={{...FILL, overflow: 'hidden', background: CREAM, filter: invert ? 'invert(1)' : undefined}}>
      <div style={{position: 'absolute', left: -500, top: -500, width: 2080, height: 2920, background: `repeating-conic-gradient(from ${spin}deg at 50% 38%, ${INK} 0deg 1.4deg, transparent 1.4deg 5deg)`, opacity: 0.85}} />
      <div style={{position: 'absolute', left: 140, top: 260, width: 800, height: 800, borderRadius: '50%', background: `radial-gradient(circle, ${CREAM} 45%, rgba(243,235,221,0) 70%)`}} />
      <div style={{...FILL, mixBlendMode: 'multiply'}}>
        <BaseClip from={Math.round(a * fps)} style={{filter: 'grayscale(1) contrast(9) brightness(1.15)', transform: 'scale(1.08)', transformOrigin: '50% 30%'}} />
      </div>
      <div style={{position: 'absolute', left: 0, width: 1080, top: 1430, textAlign: 'center', fontFamily: heavyFamily, fontSize: 330, lineHeight: 1, color: INK, WebkitTextStroke: `8px ${CREAM}`, paintOrder: 'stroke', transform: `scale(${1.6 - 0.6 * slam})`, opacity: slam}}>{word.toUpperCase()}</div>
    </div>
  );
};

// ---------------------------------------------------------------- dolly zoom (new look): she holds still while the room behind her stretches away
export const DollyZoomPlate: React.FC<{fx: Of<'dolly-zoom'>}> = ({fx}) => {
  const {t, len, a, fps} = useSpan(fx);
  const {to, direction} = fx.props;
  const k = tw(t, 0.1, len - 0.2, 0, 1, (x) => x * x * (3 - 2 * x)) * (1 - tw(t, len - 0.2, len));
  // the room recedes behind her (scale under 1), so her own image in the plate stays hidden behind her cutout
  const s = 1 - (1 - 1 / to) * k;
  void direction;
  return (
    <div style={{...FILL, overflow: 'hidden', background: '#000'}}>
      <BaseClip from={Math.round(a * fps)} style={{transform: 'scale(1.3)', filter: 'blur(30px) brightness(0.6)'}} />
      <BaseClip from={Math.round(a * fps)} style={{transform: `scale(${s})`, transformOrigin: '50% 40%', filter: `blur(${1.5 * k}px)`, borderRadius: 30 * k}} />
      <div style={{...FILL, background: 'radial-gradient(ellipse at 50% 40%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.55) 100%)', opacity: k}} />
    </div>
  );
};

// ---------------------------------------------------------------- press front: a broadsheet front page with her halftone photo
const Lines: React.FC<{n: number; w: number}> = ({n, w}) => (
  <div>
    {Array.from({length: n}, (_, i) => <div key={i} style={{height: 7, width: i % 6 === 5 ? w * 0.6 : w, background: 'rgba(29,26,23,0.42)', marginBottom: 9}} />)}
  </div>
);
export const PressFront: React.FC<{fx: Of<'press-front'>}> = ({fx}) => {
  const {t, a, fps, outK} = useSpan(fx);
  const {masthead, headline, subhead, date, caption} = fx.props;
  const inK = tw(t, 0, 0.35, 0, 1, pop);
  return (
    <div style={{...FILL, background: '#141414', opacity: outK, overflow: 'hidden'}}>
      <div style={{...FILL, background: '#F1EADB', transformOrigin: '50% 230px', transform: `scale(${(0.7 + 0.3 * inK) * fx.props.scale}) rotate(${(1 - inK) * 8}deg)`, opacity: inK, padding: '50px 54px', boxSizing: 'border-box', color: INK}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 24, borderBottom: `3px solid ${INK}`, paddingBottom: 14}}>
          <div style={{width: 150, border: `2px solid ${INK}`, padding: 8, fontFamily: serifFamily, fontSize: 18, textAlign: 'center'}}>Final Edition</div>
          <div style={{flex: 1, textAlign: 'center', fontFamily: '"UnifrakturMaguntia", "Old English Text MT", ' + serifFamily, fontSize: 96, lineHeight: 1}}>{masthead}</div>
          <div style={{width: 150, border: `2px solid ${INK}`, padding: 8, fontFamily: serifFamily, fontSize: 18, textAlign: 'center'}}>Late News</div>
        </div>
        <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: serifFamily, fontSize: 20, letterSpacing: 3, padding: '10px 0', borderBottom: `1px solid ${INK}`, textTransform: 'uppercase'}}><span>C3 Global</span><span>{date}</span><span>Vol. I</span></div>
        <div style={{fontFamily: serifFamily, fontWeight: 700, fontSize: 112, lineHeight: 1.0, textAlign: 'center', marginTop: 24, textTransform: 'uppercase', transform: 'scaleX(0.86)'}}>{headline}</div>
        <div style={{fontFamily: serifFamily, fontStyle: 'italic', fontSize: 52, textAlign: 'center', margin: '10px 0 26px'}}>{subhead}</div>
        <div style={{display: 'flex', gap: 26}}>
          <div style={{width: 230}}><div style={{fontFamily: serifFamily, fontWeight: 700, fontSize: 28, marginBottom: 12}}>The Story</div><Lines n={34} w={230} /></div>
          <div style={{flex: 1}}>
            <div style={{position: 'relative', width: '100%', height: 980, overflow: 'hidden', border: `2px solid ${INK}`}}>
              <BaseClip from={Math.round(a * fps)} style={{width: 560, height: 996, filter: 'grayscale(1) contrast(1.5) brightness(1.05)'}} />
              <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(circle, rgba(29,26,23,0.55) 1.3px, transparent 1.7px)', backgroundSize: '6px 6px', mixBlendMode: 'multiply'}} />
            </div>
            <div style={{fontFamily: serifFamily, fontStyle: 'italic', fontSize: 22, marginTop: 8, textAlign: 'center'}}>{caption}</div>
          </div>
          <div style={{width: 200}}><div style={{fontFamily: serifFamily, fontWeight: 700, fontSize: 28, marginBottom: 12}}>Inside</div><Lines n={34} w={200} /></div>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- paper tear: a printed page covers the screen and rips down the middle, the halves fly off to reveal her
const jag = (seed: number, n: number) => Array.from({length: n + 1}, (_, i) => 50 + Math.sin(i * 0.9 + seed) * 2.5 + Math.sin(i * 3.1 + seed * 3) * 0.7 + Math.sin(i * 11.7 + seed) * 0.35);
export const PaperTear: React.FC<{fx: Of<'paper-tear'>}> = ({fx}) => {
  const {t, len} = useSpan(fx);
  const {text} = fx.props;
  const rip = tw(t, len * 0.35, len - 0.15, 0, 1, (x) => x * x);
  const pts = jag(3, 120);
  const edge = pts.map((x, i) => `${x}% ${(i / 120) * 100}%`);
  const left = `polygon(0 0, ${edge.join(', ')}, 0 100%)`;
  const right = `polygon(100% 0, ${edge.join(', ')}, 100% 100%)`;
  const page = (
    <div style={{...FILL, background: `${CREAM}`, boxShadow: 'inset 0 0 120px rgba(120,90,60,0.25)'}}>
      <div style={{position: 'absolute', left: 80, right: 80, top: 640, fontFamily: serifFamily, fontStyle: 'italic', fontWeight: 600, fontSize: 130, lineHeight: 1.05, textAlign: 'center', color: INK}}>{text}</div>
    </div>
  );
  return (
    <div style={{...FILL, overflow: 'hidden', pointerEvents: 'none'}}>
      <div style={{...FILL, clipPath: left, transform: `translateX(${-700 * rip}px) rotate(${-14 * rip}deg)`, transformOrigin: '0% 100%', filter: 'drop-shadow(8px 0 10px rgba(0,0,0,0.4))'}}>{page}</div>
      <div style={{...FILL, clipPath: right, transform: `translateX(${700 * rip}px) rotate(${12 * rip}deg)`, transformOrigin: '100% 100%', filter: 'drop-shadow(-8px 0 10px rgba(0,0,0,0.4))'}}>{page}</div>
    </div>
  );
};

// ---------------------------------------------------------------- blow away: she dissolves into copper dust that drifts off, leaving the backdrop (or a clean plate of the empty set)
export const BlowAwayPlate: React.FC<{fx: Of<'blow-away'>}> = ({fx}) => {
  const {t} = useSpan(fx);
  const {plate} = fx.props;
  const k = tw(t, 0, 0.3);
  return (
    <div style={{...FILL, opacity: k, overflow: 'hidden', background: 'radial-gradient(120% 80% at 50% 30%, #2a2420 0%, #0d0c0b 70%)'}}>
      {plate && <Img src={staticFile(plate)} style={{...FILL, objectFit: 'cover'}} />}
    </div>
  );
};
export const blowAwayMask = (fx: Of<'blow-away'>, abs: number): React.CSSProperties => {
  const [a, b] = fxRange(fx);
  const p = tw(abs, a + 0.5, b - 0.3, 0, 1, (x) => x * (2 - x));
  // the wipe runs right to left with a soft, ragged edge
  const edge = 100 - p * 130;
  const m = `linear-gradient(90deg, #000 ${edge - 8}%, transparent ${edge + 8}%)`;
  return {WebkitMaskImage: m, maskImage: m};
};
export const BlowAwayDust: React.FC<{fx: Of<'blow-away'>}> = ({fx}) => {
  const {t, len, abs, fps} = useSpan(fx);
  const {anchors} = useFxEnv();
  const chest = anchorPx(anchors, Math.round(abs * fps), 'chest');
  const p = tw(t, 0.5, len - 0.3, 0, 1, (x) => x * (2 - x));
  const edgeX = 1080 * (1 - p * 1.3);
  const n = 260;
  return (
    <div style={{...FILL, pointerEvents: 'none', overflow: 'hidden'}}>
      {Array.from({length: n}, (_, i) => {
        const r1 = ((i * 9301 + 49297) % 233280) / 233280;
        const r2 = ((i * 7919 + 104729) % 233280) / 233280;
        const born = edgeX + r1 * 120;
        // a grain is released once the edge passes its x, then drifts right and up
        const startX = 120 + r1 * 840;
        if (startX < edgeX) return null;
        const age = Math.min(1.6, ((startX - edgeX) / 1080) * 2.2);
        const x = startX + age * (380 + r2 * 300);
        const y = chest.y - 700 + r2 * 1300 - age * (160 + r1 * 200) + Math.sin(age * 6 + i) * 20;
        const op = Math.max(0, 1 - age / 1.6);
        const size = 3 + r2 * 7;
        void born;
        return <div key={i} style={{position: 'absolute', left: x, top: y, width: size, height: size, borderRadius: size, background: i % 3 === 0 ? '#F4B08A' : i % 3 === 1 ? '#7a2a22' : '#1a1a1a', opacity: op}} />;
      })}
    </div>
  );
};

// ---------------------------------------------------------------- depth scatter: words hang in the room at different depths, near ones big and soft, far ones small and sharp, drifting toward camera
const scatterPos = (i: number, n: number) => {
  const r1 = ((i * 9301 + 49297) % 233280) / 233280;
  const r2 = ((i * 4271 + 17) % 9973) / 9973;
  return {x: 140 + r1 * 800, y: 300 + (i / Math.max(1, n - 1)) * 1100 + (r2 - 0.5) * 160, z: r2};
};
export const DepthScatter: React.FC<{fx: Of<'depth-scatter'>; layer: 'back' | 'front'}> = ({fx, layer}) => {
  const {t, outK} = useSpan(fx);
  const {words} = fx.props;
  return (
    <div style={{...FILL, pointerEvents: 'none'}}>
      {words.map((w, i) => {
        const {x, y, z} = scatterPos(i, words.length);
        const depth = Math.min(1, z + t * 0.12);
        if ((layer === 'front') !== depth > 0.6) return null;
        const k = tw(t, 0.1 + i * 0.12, 0.4 + i * 0.12, 0, 1, pop) * outK;
        const size = 40 + depth * 120;
        const blur = depth > 0.75 ? (depth - 0.75) * 30 : depth < 0.25 ? (0.25 - depth) * 12 : 0;
        return (
          <div key={i} style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${k})`, fontFamily: serifFamily, fontStyle: 'italic', fontWeight: 600, fontSize: size, color: i % 2 ? C3.goldBright : '#fff', filter: `blur(${blur}px)`, opacity: 0.55 + depth * 0.45, textShadow: '0 4px 18px rgba(0,0,0,0.5)', whiteSpace: 'nowrap'}}>{w}</div>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------- spatial glass: a frosted glass panel floats in front of her in 3D, with a glowing gold orb and a line of text
export const SpatialGlass: React.FC<{fx: Of<'spatial-glass'>}> = ({fx}) => {
  const {t, len, outK} = useSpan(fx);
  const {title, text, y} = fx.props;
  const inK = tw(t, 0, 0.5, 0, 1, pop);
  const float = Math.sin(t * 1.6) * 8;
  const orb = tw(t, 0.4, 0.9);
  const fill = tw(t, 0.5, len - 0.5);
  return (
    <div style={{...FILL, opacity: outK, perspective: 1600, pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: 110, top: y + float, width: 860, padding: '34px 40px', boxSizing: 'border-box', borderRadius: 44, background: 'linear-gradient(135deg, rgba(255,255,255,0.32), rgba(255,255,255,0.10))', border: '2px solid rgba(255,255,255,0.55)', backdropFilter: 'blur(26px) saturate(1.4)', WebkitBackdropFilter: 'blur(26px) saturate(1.4)', boxShadow: '0 30px 70px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.7)', transform: `rotateY(${(1 - inK) * -40 + 10}deg) rotateX(6deg) scale(${0.8 + 0.2 * inK})`, opacity: inK}}>
        <div style={{fontFamily: C3.sans, fontWeight: 700, fontSize: 26, letterSpacing: 5, color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase'}}>{title}</div>
        <div style={{marginTop: 14, fontFamily: serifFamily, fontStyle: 'italic', fontSize: 52, lineHeight: 1.15, color: '#fff', textShadow: '0 2px 10px rgba(0,0,0,0.35)'}}>{text}</div>
        <div style={{marginTop: 26, height: 16, borderRadius: 8, background: 'rgba(255,255,255,0.25)', overflow: 'hidden'}}>
          <div style={{width: `${fill * 100}%`, height: '100%', borderRadius: 8, background: C3.copperGrad}} />
        </div>
        <div style={{position: 'absolute', right: -40, top: -50, width: 120, height: 120, borderRadius: 60, background: 'radial-gradient(circle at 35% 30%, #FFF3C9, #E3BF63 45%, #A5551F 100%)', boxShadow: '0 0 60px rgba(227,191,99,0.8)', transform: `scale(${orb})`}} />
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- shatter 3D: the frame cracks into shards that pop toward camera with copper edges, then settle back
export const Shatter3D: React.FC<{fx: Of<'shatter-3d'>}> = ({fx}) => {
  const {t, len, a, fps} = useSpan(fx);
  const {cols, rows} = fx.props;
  const pop1 = tw(t, 0.15, 0.55, 0, 1, (x) => 1 - (1 - x) ** 3) * (1 - tw(t, len - 0.7, len - 0.1, 0, 1, (x) => x * x));
  const cw = 1080 / cols;
  const ch = 1920 / rows;
  const from = Math.round(a * fps);
  return (
    <div style={{...FILL, background: '#050505', perspective: 1800, overflow: 'hidden'}}>
      <div style={{...FILL, transformStyle: 'preserve-3d', transform: `rotateX(${6 * pop1}deg) rotateY(${-10 * pop1}deg)`}}>
        {Array.from({length: cols * rows}, (_, i) => {
          const c = i % cols;
          const r = Math.floor(i / cols);
          const r1 = ((i * 9301 + 49297) % 233280) / 233280;
          const r2 = ((i * 4271 + 17) % 9973) / 9973;
          const z = (r1 * 520 + 80) * pop1;
          const rx = (r2 - 0.5) * 50 * pop1;
          const ry = (r1 - 0.5) * 60 * pop1;
          return (
            <div key={i} style={{position: 'absolute', left: c * cw, top: r * ch, width: cw, height: ch, overflow: 'hidden', transform: `translateZ(${z}px) rotateX(${rx}deg) rotateY(${ry}deg)`, boxShadow: pop1 > 0.02 ? '0 20px 40px rgba(0,0,0,0.6)' : undefined}}>
              <div style={{position: 'absolute', left: -c * cw, top: -r * ch, width: 1080, height: 1920}}><BaseClip from={from} /></div>
              <div style={{position: 'absolute', inset: 0, boxSizing: 'border-box', border: `${3 * pop1}px solid rgba(244,176,138,0.9)`}} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- scene text: a big serif word sits in the room behind her, as if it was there when she filmed
export const SceneText: React.FC<{fx: Of<'scene-text'>}> = ({fx}) => {
  const {t, len} = useSpan(fx);
  const {word, x, y, size} = fx.props;
  const k = tw(t, 0, 0.45) * (1 - tw(t, len - 0.35, len));
  const drift = t * 6;
  return (
    <div style={{...FILL, pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: x - drift, top: y, transform: 'translate(-50%,-50%)', fontFamily: serifFamily, fontStyle: 'italic', fontWeight: 500, fontSize: size, color: '#fff', opacity: 0.92 * k, letterSpacing: -2, textShadow: '0 6px 30px rgba(0,0,0,0.35)', filter: `blur(${(1 - k) * 8}px)`, whiteSpace: 'nowrap'}}>{word}</div>
    </div>
  );
};

// ---------------------------------------------------------------- dispatch
export const ninthPlate = (fx: Fx): React.ReactNode => {
  switch (fx.type) {
    case 'dolly-zoom': return <DollyZoomPlate fx={fx} />;
    case 'blow-away': return <BlowAwayPlate fx={fx} />;
    case 'depth-scatter': return <><BaseClipFor fx={fx} /><DepthScatter fx={fx} layer="back" /></>;
    case 'scene-text': return <><BaseClipFor fx={fx} /><SceneText fx={fx} /></>;
    default: return null;
  }
};
const BaseClipFor: React.FC<{fx: Fx}> = ({fx}) => {
  const {fps} = useVideoConfig();
  return <BaseClip from={Math.round(fxRange(fx)[0] * fps)} />;
};
export const ninthFront = (fx: Fx): React.ReactNode => {
  switch (fx.type) {
    case 'depth-scatter': return <DepthScatter fx={fx} layer="front" />;
    case 'blow-away': return <BlowAwayDust fx={fx} />;
    default: return null;
  }
};
export const ninthOver = (fx: Fx): React.ReactNode => {
  switch (fx.type) {
    case 'impact-frame': return <ImpactFrame fx={fx} />;
    case 'press-front': return <PressFront fx={fx} />;
    case 'paper-tear': return <PaperTear fx={fx} />;
    case 'spatial-glass': return <SpatialGlass fx={fx} />;
    case 'shatter-3d': return <Shatter3D fx={fx} />;
    default: return null;
  }
};
