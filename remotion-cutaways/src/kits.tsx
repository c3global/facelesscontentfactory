import React, {createContext, useContext} from 'react';
import {AbsoluteFill, Easing, interpolate} from 'remotion';
import {brand, metalStops} from './brand';
import {handFamily, heavyFamily, serifFamily} from './fonts';
import {MetalBox, MetalText} from './metal';
import {clamp, easeOut, isEmphasis, useCardMotion, useRel} from './ui';

/**
 * Template kits. Each talking-head template has its own backdrop, its own quote card and its own frame around her
 * window, so the eight templates differ in more than captions and effects. Everything stays in the C3 palette:
 * black, white, crimson, charcoal, with rose gold and gold only as metal.
 */
export type KitName = 'quiet' | 'magazine' | 'glass' | 'scrapbook' | 'analyst' | 'cinematic' | 'hype' | 'teach';
export const KIT_NAMES: KitName[] = ['quiet', 'magazine', 'glass', 'scrapbook', 'analyst', 'cinematic', 'hype', 'teach'];
export const asKit = (t?: string): KitName | null => (t && (KIT_NAMES as string[]).includes(t) ? (t as KitName) : null);

const KitContext = createContext<KitName | null>(null);
export const KitProvider = KitContext.Provider;
export const useKit = () => useContext(KitContext);

const FPS = 30;
/** rgba() of a brand hex, so the kits follow each member's own colors (C3 crimson for Dr. CK) */
const rgba = (hex: string, a: number) => {
  const n = parseInt(hex.replace('#', '').slice(0, 6), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};
const METAL = () => metalStops('copper', 'deep')[1];

const svgUri = (svg: string) => `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
const grain = (rgb: number, alpha = 1.8) =>
  svgUri(
    `<svg xmlns='http://www.w3.org/2000/svg' width='260' height='260'><filter id='n' x='0' y='0' width='100%' height='100%'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='matrix' values='0 0 0 0 ${rgb} 0 0 0 0 ${rgb} 0 0 0 0 ${rgb} ${alpha} 0 0 0 -0.7'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`,
  );
const felt = svgUri(
  `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'><filter id='f'><feTurbulence type='fractalNoise' baseFrequency='0.55 0.9' numOctaves='3' seed='4'/><feColorMatrix type='matrix' values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.9 -0.42'/></filter><rect width='100%' height='100%' filter='url(#f)'/></svg>`,
);
const Grain: React.FC<{rgb: number; opacity: number; frame: number}> = ({rgb, opacity, frame}) => (
  <AbsoluteFill style={{backgroundImage: grain(rgb), backgroundPosition: `${(frame * 37) % 260}px ${(frame * 53) % 260}px`, opacity, mixBlendMode: rgb > 0.5 ? 'screen' : 'multiply'}} />
);
const blob = (x: number, y: number, size: number, color: string): React.CSSProperties => ({
  position: 'absolute', left: x - size / 2, top: y - size / 2, width: size, height: size, borderRadius: '50%', background: `radial-gradient(circle, ${color} 0%, rgba(0,0,0,0) 68%)`,
});

// ---------------------------------------------------------------- backdrops
export const KitBackdrop: React.FC<{kit: KitName; frame: number}> = ({kit, frame}) => {
  const t = frame / FPS;
  switch (kit) {
    case 'quiet':
      // the black room: one soft white light from above, breathing very slowly
      return (
        <AbsoluteFill style={{background: brand.black, overflow: 'hidden'}}>
          <div style={blob(540 + Math.sin(t * 0.12) * 40, 260, 1700 + Math.sin(t * 0.3) * 60, 'rgba(255,255,255,0.13)')} />
          <div style={blob(540, 1900, 1400, rgba(brand.crimsonDeep, 0.35))} />
          <Grain rgb={1} opacity={0.05} frame={frame} />
        </AbsoluteFill>
      );
    case 'magazine': {
      // newsprint: white paper, a halftone wash, thin column rules and a crimson rule across the top
      return (
        <AbsoluteFill style={{background: '#FFFFFF', overflow: 'hidden'}}>
          <AbsoluteFill style={{backgroundImage: 'radial-gradient(circle, rgba(58,63,66,0.22) 1.4px, transparent 1.9px)', backgroundSize: '9px 9px', WebkitMaskImage: 'linear-gradient(160deg, #000 0%, transparent 55%, #000 100%)', maskImage: 'linear-gradient(160deg, #000 0%, transparent 55%, #000 100%)'}} />
          {[270, 540, 810].map((x) => (
            <div key={x} style={{position: 'absolute', left: x, top: 0, bottom: 0, width: 1.5, background: 'rgba(0,0,0,0.12)'}} />
          ))}
          <div style={{position: 'absolute', left: 60, right: 60, top: 140, height: 6, background: brand.crimson}} />
          <div style={{position: 'absolute', left: 60, right: 60, top: 152, height: 1.5, background: brand.black}} />
          <Grain rgb={0} opacity={0.06} frame={frame} />
        </AbsoluteFill>
      );
    }
    case 'glass':
      // aurora: crimson, copper and white light drifting behind frosted glass
      return (
        <AbsoluteFill style={{background: '#050506', overflow: 'hidden'}}>
          <div style={{position: 'absolute', inset: -200, filter: 'blur(90px)'}}>
            <div style={blob(300 + Math.sin(t * 0.21) * 160, 500 + Math.cos(t * 0.17) * 200, 1100, rgba(brand.crimson, 0.75))} />
            <div style={blob(900 + Math.cos(t * 0.19) * 180, 1200 + Math.sin(t * 0.23) * 220, 1000, rgba(METAL(), 0.55))} />
            <div style={blob(600 + Math.sin(t * 0.13) * 220, 1700, 900, 'rgba(255,255,255,0.18)')} />
            <div style={blob(1000, 300 + Math.sin(t * 0.15) * 120, 800, rgba(brand.crimsonDeep, 0.8))} />
          </div>
          <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0) 40%)'}} />
          <Grain rgb={1} opacity={0.05} frame={frame} />
        </AbsoluteFill>
      );
    case 'scrapbook':
      // pinboard: charcoal felt with a few white paper scraps and strips of tape
      return (
        <AbsoluteFill style={{background: brand.charcoal, overflow: 'hidden'}}>
          <AbsoluteFill style={{backgroundImage: felt, opacity: 0.35, mixBlendMode: 'overlay'}} />
          {[
            {x: -40, y: 210, w: 300, h: 220, r: -8},
            {x: 830, y: 120, w: 280, h: 340, r: 6},
            {x: 780, y: 1540, w: 360, h: 260, r: -5},
            {x: -60, y: 1600, w: 320, h: 300, r: 9},
          ].map((p, i) => (
            <div key={i} style={{position: 'absolute', left: p.x, top: p.y + Math.sin(t * 0.3 + i) * 4, width: p.w, height: p.h, background: '#FFFFFF', opacity: 0.1, transform: `rotate(${p.r}deg)`, boxShadow: '0 10px 30px rgba(0,0,0,0.4)'}} />
          ))}
          <div style={blob(540, 900, 1500, 'rgba(0,0,0,0.45)')} />
          <Grain rgb={1} opacity={0.06} frame={frame} />
        </AbsoluteFill>
      );
    case 'analyst': {
      // the data room: a fine grid scrolling slowly, faint chart lines, crimson ticks
      const off = (t * 6) % 60;
      const line = (seed: number) =>
        Array.from({length: 24}, (_, i) => `${i * 50},${(200 + Math.sin(i * 0.7 + seed + t * 0.4) * 70 + Math.sin(i * 2.1 + seed) * 30).toFixed(1)}`).join(' ');
      return (
        <AbsoluteFill style={{background: '#0B0C0D', overflow: 'hidden'}}>
          <AbsoluteFill style={{backgroundImage: 'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)', backgroundSize: '60px 60px', backgroundPosition: `0 ${off}px`}} />
          <AbsoluteFill style={{backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '300px 300px', backgroundPosition: `0 ${off}px`}} />
          <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
            <polyline points={line(1)} fill="none" stroke={rgba(brand.crimson, 0.55)} strokeWidth={3} transform="translate(0 1180)" />
            <polyline points={line(4)} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth={2} transform="translate(0 1260)" />
            {Array.from({length: 12}, (_, i) => (
              <rect key={i} x={70 + i * 82} y={1820 - (60 + ((i * 37) % 90) + Math.sin(t + i) * 12)} width={34} height={60 + ((i * 37) % 90) + Math.sin(t + i) * 12} fill={i % 4 === 2 ? rgba(brand.crimson, 0.5) : 'rgba(255,255,255,0.1)'} />
            ))}
          </svg>
          <div style={blob(540, 800, 1500, 'rgba(0,0,0,0.55)')} />
        </AbsoluteFill>
      );
    }
    case 'cinematic': {
      // night light: true black, a slow anamorphic light streak, heavy grain and a deep vignette
      const sx = ((t * 0.06) % 1) * 1600 - 260;
      return (
        <AbsoluteFill style={{background: brand.black, overflow: 'hidden'}}>
          <div style={{position: 'absolute', left: -400, right: -400, top: 520, height: 3, background: `linear-gradient(90deg, ${rgba(brand.crimson, 0)} 0%, ${rgba(brand.crimson, 0.7)} 45%, rgba(255,255,255,0.9) 50%, ${rgba(brand.crimson, 0.7)} 55%, ${rgba(brand.crimson, 0)} 100%)`, transform: `translateX(${sx - 540}px)`, filter: 'blur(1.5px)'}} />
          <div style={{position: 'absolute', left: -400, right: -400, top: 470, height: 100, background: `radial-gradient(50% 50% at 50% 50%, ${rgba(brand.crimson, 0.22)}, ${rgba(brand.crimson, 0)} 70%)`, transform: `translateX(${sx - 540}px)`}} />
          <div style={blob(540, 1500, 1800, rgba(brand.crimsonDeep, 0.25))} />
          <AbsoluteFill style={{background: 'radial-gradient(70% 55% at 50% 45%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.85) 100%)'}} />
          <Grain rgb={1} opacity={0.11} frame={frame} />
        </AbsoluteFill>
      );
    }
    case 'hype': {
      // the red room: crimson field, bold diagonal stripes on the move
      const off = (t * 90) % 240;
      return (
        <AbsoluteFill style={{background: brand.crimson, overflow: 'hidden'}}>
          <AbsoluteFill style={{backgroundImage: `repeating-linear-gradient(-32deg, ${brand.crimsonMid} 0 60px, transparent 60px 120px)`, backgroundPosition: `${off}px 0`, opacity: 0.6}} />
          <AbsoluteFill style={{background: `radial-gradient(80% 60% at 50% 40%, rgba(0,0,0,0) 30%, ${brand.crimsonDeep} 100%)`}} />
          <Grain rgb={0} opacity={0.12} frame={frame} />
        </AbsoluteFill>
      );
    }
    case 'teach':
      // the whiteboard: white with a faint grid and the ghost of yesterday's marker
      return (
        <AbsoluteFill style={{background: '#FFFFFF', overflow: 'hidden'}}>
          <AbsoluteFill style={{backgroundImage: 'linear-gradient(rgba(58,63,66,0.07) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(58,63,66,0.07) 1.5px, transparent 1.5px)', backgroundSize: '80px 80px'}} />
          <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: 0.08}}>
            <path d="M120 300 C 300 250, 420 360, 640 290 S 900 260, 980 330" stroke={brand.charcoal} strokeWidth={22} fill="none" strokeLinecap="round" />
            <path d="M160 1700 C 380 1650, 520 1760, 900 1680" stroke={brand.crimson} strokeWidth={18} fill="none" strokeLinecap="round" />
          </svg>
          <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(255,255,255,0) 60%, rgba(58,63,66,0.08) 100%)'}} />
        </AbsoluteFill>
      );
  }
};

// ---------------------------------------------------------------- frames around her window
/** How much each kit insets the video inside its window, and the radius it forces (null keeps the layout's). */
export const KIT_FRAME: Record<KitName, {inset: number; radius: number | null}> = {
  quiet: {inset: 0, radius: 6},
  magazine: {inset: 14, radius: 0},
  glass: {inset: 10, radius: null},
  scrapbook: {inset: 18, radius: 2},
  analyst: {inset: 0, radius: 4},
  cinematic: {inset: 0, radius: 18},
  hype: {inset: 10, radius: 0},
  teach: {inset: 12, radius: 10},
};

/** The kit's frame drawn under the video (paper, borders) and over it (brackets, tape, magnets). */
export const KitFrameUnder: React.FC<{kit: KitName; r: number; opacity: number}> = ({kit, r, opacity}) => {
  const base: React.CSSProperties = {position: 'absolute', inset: 0, borderRadius: r, opacity};
  switch (kit) {
    case 'magazine':
      return <div style={{...base, background: '#FFFFFF', boxShadow: '0 0 0 1.5px #000, 0 18px 40px rgba(0,0,0,0.25)'}} />;
    case 'scrapbook':
      return <div style={{...base, background: '#FFFFFF', boxShadow: '0 22px 50px rgba(0,0,0,0.55)'}} />;
    case 'hype':
      return <div style={{...base, background: '#FFFFFF', boxShadow: `18px 18px 0 ${brand.black}`}} />;
    case 'teach':
      return <div style={{...base, background: '#FFFFFF', boxShadow: `0 0 0 3px ${brand.charcoal}, 0 14px 30px rgba(0,0,0,0.18)`}} />;
    case 'cinematic':
      return <div style={{...base, boxShadow: '0 30px 90px rgba(0,0,0,0.9)'}} />;
    case 'analyst':
      return <div style={{...base, boxShadow: '0 0 0 1px rgba(255,255,255,0.35)'}} />;
    case 'quiet':
      return <div style={{...base, boxShadow: '0 30px 80px rgba(0,0,0,0.7)'}} />;
    default:
      return null;
  }
};

export const KitFrameOver: React.FC<{kit: KitName; w: number; h: number; r: number; opacity: number; frame: number}> = ({kit, w, h, r, opacity, frame}) => {
  switch (kit) {
    case 'quiet':
      return <MetalBox kind="gold" variant="bright" seed={73} style={{position: 'absolute', inset: 0, borderRadius: r, opacity, padding: 2, WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude'} as React.CSSProperties} />;
    case 'analyst': {
      const L = 46;
      const c = brand.crimson;
      const corner = (s: React.CSSProperties) => <div style={{position: 'absolute', width: L, height: L, ...s}} />;
      const blink = Math.floor(frame / 15) % 2 === 0;
      return (
        <div style={{position: 'absolute', inset: -10, opacity, pointerEvents: 'none'}}>
          {corner({left: 0, top: 0, borderLeft: `4px solid ${c}`, borderTop: `4px solid ${c}`})}
          {corner({right: 0, top: 0, borderRight: `4px solid ${c}`, borderTop: `4px solid ${c}`})}
          {corner({left: 0, bottom: 0, borderLeft: `4px solid ${c}`, borderBottom: `4px solid ${c}`})}
          {corner({right: 0, bottom: 0, borderRight: `4px solid ${c}`, borderBottom: `4px solid ${c}`})}
          {h < 1100 && (
            <div style={{position: 'absolute', left: 28, top: 26, display: 'flex', alignItems: 'center', gap: 10, padding: '6px 14px', background: 'rgba(0,0,0,0.6)', borderRadius: 4, fontFamily: '"DM Mono", "DM Sans", monospace', fontSize: 22, letterSpacing: 3, color: '#fff'}}>
              <span style={{width: 12, height: 12, borderRadius: 6, background: c, opacity: blink ? 1 : 0.35}} />
              LIVE
            </div>
          )}
        </div>
      );
    }
    case 'scrapbook':
      return (
        <div style={{position: 'absolute', inset: 0, opacity, pointerEvents: 'none'}}>
          <div style={{position: 'absolute', left: w / 2 - 90, top: -26, width: 180, height: 52, background: 'rgba(255,255,255,0.55)', boxShadow: '0 2px 6px rgba(0,0,0,0.2)', transform: 'rotate(-3deg)'}} />
        </div>
      );
    case 'teach':
      // magnets hold a rectangle to the board; a circle window has none
      if (r >= Math.min(w, h) / 2 - 2) return null;
      return (
        <div style={{position: 'absolute', inset: 0, opacity, pointerEvents: 'none'}}>
          {[18, w - 18].map((x, i) => (
            <div key={i} style={{position: 'absolute', left: x - 18, top: -14, width: 36, height: 36, borderRadius: 18, background: `radial-gradient(circle at 35% 30%, ${rgba(brand.crimson, 0.55)}, ${brand.crimson} 55%, ${brand.crimsonDeep})`, boxShadow: '0 4px 8px rgba(0,0,0,0.35)'}} />
          ))}
        </div>
      );
    case 'cinematic':
      return <div style={{position: 'absolute', inset: 0, borderRadius: r, opacity, boxShadow: 'inset 0 0 120px rgba(0,0,0,0.55)', pointerEvents: 'none'}} />;
    default:
      return null;
  }
};

// ---------------------------------------------------------------- quote cards
const popE = Easing.out(Easing.back(1.6));
type QuoteProps = {text: string; emphasis?: string[]; wordTimes?: number[]};

const useWords = (text: string, wordTimes?: number[]) => {
  const {frame} = useCardMotion();
  const rel = useRel();
  const words = text.split(' ');
  return words.map((w, i) => {
    const start = wordTimes && wordTimes[i] !== undefined ? rel(wordTimes[i]) : 8 + i * 4;
    return {w, i, p: interpolate(frame, [start, start + 8], [0, 1], {...clamp, easing: popE}), o: interpolate(frame, [start, start + 4], [0, 1], clamp), start};
  });
};
const sizeFor = (n: number, big: number) => (n <= 5 ? big : n <= 8 ? big * 0.88 : n <= 12 ? big * 0.76 : big * 0.66);

export const KitQuote: React.FC<QuoteProps & {kit: KitName}> = ({kit, text, emphasis, wordTimes}) => {
  const {opacity, frame} = useCardMotion();
  const ws = useWords(text, wordTimes);
  const rule = interpolate(frame, [4, 22], [0, 1], {...clamp, easing: easeOut});
  const em = (w: string) => isEmphasis(w, emphasis);
  const gap = {display: 'inline-block', marginRight: '0.26em'} as const;

  switch (kit) {
    case 'quiet': {
      // no card: white serif in the dark, a short gold rule, the key word in crimson metal
      const size = sizeFor(ws.length, 100);
      return (
        <div style={{opacity, textAlign: 'center', padding: '0 30px'}}>
          <MetalBox kind="gold" variant="bright" seed={81} style={{height: 4, width: 140 * rule, margin: '0 auto 46px', borderRadius: 2}} />
          <div style={{fontFamily: serifFamily, fontWeight: 600, fontSize: size, lineHeight: 1.14, color: '#fff'}}>
            {ws.map(({w, i, o, p}) =>
              em(w) ? (
                <MetalText key={i} kind="crimson" variant="bright" seed={82 + i} style={{...gap, fontStyle: 'italic', opacity: o, translate: `0 ${(1 - p) * 14}px`}}>{w}</MetalText>
              ) : (
                <span key={i} style={{...gap, opacity: o, translate: `0 ${(1 - p) * 14}px`}}>{w}</span>
              ),
            )}
          </div>
        </div>
      );
    }
    case 'magazine': {
      // pull quote: a giant crimson quote mark, bold black serif between two rules
      const size = sizeFor(ws.length, 96);
      return (
        <div style={{opacity, padding: '0 40px', position: 'relative'}}>
          <div style={{fontFamily: serifFamily, fontWeight: 900, fontSize: 340, lineHeight: 0.8, color: brand.crimson, height: 170, transform: `scale(${0.6 + 0.4 * rule})`, transformOrigin: '0 50%'}}>“</div>
          <div style={{height: 3, background: '#000', width: `${100 * rule}%`, marginBottom: 34}} />
          <div style={{fontFamily: serifFamily, fontWeight: 800, fontSize: size, lineHeight: 1.08, color: '#000'}}>
            {ws.map(({w, i, o}) => (
              <span key={i} style={{...gap, opacity: o, color: em(w) ? brand.crimson : '#000', fontStyle: em(w) ? 'italic' : 'normal'}}>{w}</span>
            ))}
          </div>
          <div style={{height: 3, background: '#000', width: `${100 * rule}%`, marginTop: 34}} />
        </div>
      );
    }
    case 'scrapbook': {
      // a torn white note taped to the board, in her handwriting, with a crimson marker under the key word
      const size = sizeFor(ws.length, 112);
      const tear = 'polygon(0 3%, 6% 0, 14% 2%, 22% 0, 31% 3%, 40% 1%, 52% 3%, 61% 0, 72% 2%, 83% 0, 92% 3%, 100% 1%, 100% 97%, 93% 100%, 84% 98%, 73% 100%, 62% 97%, 50% 100%, 38% 98%, 27% 100%, 15% 97%, 6% 100%, 0 98%)';
      return (
        <div style={{opacity, position: 'relative', transform: `rotate(-1.5deg) scale(${0.92 + 0.08 * rule})`}}>
          <div style={{position: 'absolute', left: '50%', top: -30, width: 200, height: 56, marginLeft: -100, background: 'rgba(255,255,255,0.6)', transform: 'rotate(3deg)', zIndex: 2, boxShadow: '0 2px 6px rgba(0,0,0,0.25)'}} />
          <div style={{filter: 'drop-shadow(0 18px 30px rgba(0,0,0,0.5))'}}>
            <div style={{clipPath: tear, background: '#FFFFFF', padding: '80px 64px 76px'}}>
              <div style={{fontFamily: handFamily, fontWeight: 700, fontSize: size, lineHeight: 1.05, color: brand.charcoal}}>
                {ws.map(({w, i, o, start}) => {
                  const u = interpolate(frame, [start + 4, start + 14], [0, 1], clamp);
                  return (
                    <span key={i} style={{...gap, opacity: o, position: 'relative', color: em(w) ? brand.crimson : brand.charcoal}}>
                      {w}
                      {em(w) && <span style={{position: 'absolute', left: 0, bottom: 4, height: 9, width: `${u * 100}%`, background: brand.crimson, borderRadius: 6, opacity: 0.85}} />}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      );
    }
    case 'analyst': {
      // insight card: a mono label, a crimson bar, clean white sans on a dark panel with a grid
      const size = sizeFor(ws.length, 84);
      return (
        <div style={{opacity, background: 'rgba(10,11,12,0.92)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 6, padding: '50px 56px 56px 64px', position: 'relative', overflow: 'hidden'}}>
          <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 10, background: brand.crimson, transform: `scaleY(${rule})`, transformOrigin: 'top'}} />
          <div style={{fontFamily: '"DM Mono", "DM Sans", monospace', fontSize: 26, letterSpacing: 6, color: 'rgba(255,255,255,0.6)', marginBottom: 30}}>KEY INSIGHT</div>
          <div style={{fontFamily: '"DM Sans", sans-serif', fontWeight: 700, fontSize: size, lineHeight: 1.12, color: '#fff', letterSpacing: -1}}>
            {ws.map(({w, i, o}) => (
              <span key={i} style={{...gap, opacity: o, color: em(w) ? brand.crimson : '#fff'}}>{w}</span>
            ))}
          </div>
        </div>
      );
    }
    case 'cinematic': {
      // title card: no box, wide-tracked serif capitals that rise out of a blur, the key word in crimson
      const size = sizeFor(ws.length, 84);
      return (
        <div style={{opacity, textAlign: 'center', padding: '0 20px'}}>
          <div style={{fontFamily: serifFamily, fontWeight: 500, fontSize: size, lineHeight: 1.3, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#fff'}}>
            {ws.map(({w, i, o, p}) => (
              <span key={i} style={{...gap, opacity: o, filter: `blur(${(1 - p) * 10}px)`, color: em(w) ? brand.crimson : '#fff'}}>{w}</span>
            ))}
          </div>
          <div style={{height: 1.5, width: 260 * rule, background: 'rgba(255,255,255,0.6)', margin: '44px auto 0'}} />
        </div>
      );
    }
    case 'hype': {
      // slam: heavy condensed capitals, white on black blocks, the key word on a white block in crimson
      const size = sizeFor(ws.length, 150);
      return (
        <div style={{opacity, textAlign: 'center', lineHeight: 1.18}}>
          {ws.map(({w, i, o, p}) => (
            <span key={i} style={{display: 'inline-block', margin: '0 10px 14px 0', padding: '4px 18px', fontFamily: heavyFamily, fontSize: size, textTransform: 'uppercase', background: em(w) ? '#fff' : '#000', color: em(w) ? brand.crimson : '#fff', opacity: o, transform: `scale(${1.6 - 0.6 * p}) rotate(${(1 - p) * -6}deg)`}}>{w}</span>
          ))}
        </div>
      );
    }
    case 'teach': {
      // the whiteboard: marker handwriting, a crimson KEY POINT label, the key word circled as she says it
      const size = sizeFor(ws.length, 116);
      return (
        <div style={{opacity, padding: '0 40px'}}>
          <div style={{display: 'inline-block', fontFamily: handFamily, fontWeight: 700, fontSize: 64, color: brand.crimson, borderBottom: `5px solid ${brand.crimson}`, marginBottom: 36, transform: 'rotate(-2deg)'}}>Key point</div>
          <div style={{fontFamily: handFamily, fontWeight: 700, fontSize: size, lineHeight: 1.08, color: brand.charcoal}}>
            {ws.map(({w, i, o, start}) => {
              const c = interpolate(frame, [start + 3, start + 16], [0, 1], clamp);
              return (
                <span key={i} style={{...gap, opacity: o, position: 'relative'}}>
                  {w}
                  {em(w) && (
                    <svg style={{position: 'absolute', left: '-14%', top: '-14%', width: '128%', height: '128%', overflow: 'visible'}} viewBox="0 0 100 60" preserveAspectRatio="none">
                      <ellipse cx="50" cy="30" rx="48" ry="27" fill="none" stroke={brand.crimson} strokeWidth={3} strokeDasharray="300" strokeDashoffset={300 * (1 - c)} vectorEffect="non-scaling-stroke" style={{strokeWidth: 6}} transform="rotate(-3 50 30)" />
                    </svg>
                  )}
                </span>
              );
            })}
          </div>
        </div>
      );
    }
    default:
      return null;
  }
};
