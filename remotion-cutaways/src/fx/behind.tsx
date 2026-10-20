import React from 'react';
import {Img, OffthreadVideo, Sequence, staticFile, useVideoConfig} from 'remotion';
import {brand, metalGradient} from '../brand';
import {heavyFamily, sansFamily, serifFamily} from '../fonts';
import {metalFill} from '../metal';
import type {Fx} from './schema';
import {scriptPanelCutout, sixthPlate} from './sixth';
import {thirdFront, thirdPlate} from './third';
import {fxRange, pop, tw, useFxEnv, useFxTime} from './util';

type Of<T extends Fx['type']> = Extract<Fx, {type: T}>;
const FILL: React.CSSProperties = {position: 'absolute', left: 0, top: 0, width: 1080, height: 1920};

const useLen = (fx: Fx) => {
  const [a, b] = fxRange(fx);
  return b - a;
};
/** fade in over `i` s and out over `o` s across the effect */
const useFade = (fx: Fx, i = 0.25, o = 0.25) => {
  const {t} = useFxTime(fxRange(fx)[0]);
  const len = useLen(fx);
  return tw(t, 0, i) * (1 - tw(t, len - o, len));
};

const PLATE = 'radial-gradient(120% 75% at 50% 28%, #4a0b0e 0%, #1a0405 52%, #000 100%)';

/** her cutout (transparent WebM made by `npm run matte`). Same framing as her base clip. With a matteOutline set, the outlined variant
 * (baked by `npm run outline`) is used so the styled edge costs nothing extra at render time. */
export const Cutout: React.FC<{from: number; style?: React.CSSProperties; plain?: boolean}> = ({from, style, plain}) => {
  const {slug, videoStyle, outline = 'none'} = useFxEnv();
  if (!slug) return null;
  const file = plain || outline === 'none' ? `${slug}.webm` : `${slug}.${outline}.webm`;
  return <OffthreadVideo src={staticFile(`matte/${file}`)} transparent muted startFrom={from} style={{...FILL, objectFit: 'cover', ...videoStyle, ...style}} />;
};

/** The cutout can be moved by effects (frame-break pops her out of the card, green-screen shrinks her to the bottom). */
export const cutoutStyle = (fx: Fx, abs: number): React.CSSProperties => {
  const [a, b] = fxRange(fx);
  if (fx.type === 'frame-break') {
    const k = tw(abs, fx.props.popAt, fx.props.popAt + 0.35, 0, 1, pop);
    return {opacity: abs < fx.props.popAt ? 0 : 1, transform: `scale(${0.6 + 0.42 * k - 0.02 * tw(abs, fx.props.popAt + 0.35, fx.props.popAt + 0.6)})`, transformOrigin: '50% 72%'};
  }
  if (fx.type === 'green-screen') {
    const k = tw(abs, a, a + 0.5) * (1 - tw(abs, b - 0.4, b));
    return {transform: `scale(${1 - 0.5 * k})`, transformOrigin: '50% 100%'};
  }
  if (fx.type === 'script-panel') return scriptPanelCutout(fx, abs);
  if (fx.type === 'ui-world') {
    // she steps back so more of the screen shows above her
    const k = tw(abs, a, a + 0.5) * (1 - tw(abs, b - 0.3, b));
    return {transform: `scale(${1 - 0.22 * k})`, transformOrigin: '50% 100%'};
  }
  return {};
};

// ---------------------------------------------------------------- type wall
export const TypeWall: React.FC<{fx: Of<'type-wall'>}> = ({fx}) => {
  const {t, abs} = useFxTime(fx.at);
  const fade = useFade(fx);
  let idx = 0;
  fx.props.words.forEach((w, i) => {
    if (abs >= w.at) idx = i;
  });
  const cur = fx.props.words[idx];
  const swap = tw(abs - cur.at, 0, 0.16, 0, 1, pop);
  const rows = [0, 1, 2, 3, 4, 5];
  return (
    <div style={{...FILL, background: PLATE, opacity: fade, overflow: 'hidden'}}>
      {rows.map((r) => {
        const text = `${cur.text.toUpperCase()}  `.repeat(4);
        const solid = r % 2 === 0;
        return (
          <div
            key={r}
            style={{
              position: 'absolute',
              left: 0,
              top: 70 + r * 285,
              whiteSpace: 'nowrap',
              fontFamily: heavyFamily,
              fontSize: 300,
              lineHeight: 1,
              letterSpacing: 4,
              transform: `translateX(${(r % 2 ? 1 : -1) * t * 80 - 220}px) scale(${0.92 + 0.08 * swap})`,
              color: solid ? brand.white : 'transparent',
              WebkitTextStroke: solid ? '0' : `5px ${brand.white}`,
              opacity: solid ? 0.95 : 0.55,
            }}
          >
            {text}
          </div>
        );
      })}
      <div style={{...FILL, background: 'linear-gradient(180deg, rgba(0,0,0,0.35), rgba(0,0,0,0) 30%, rgba(0,0,0,0.0) 70%, rgba(0,0,0,0.5))'}} />
    </div>
  );
};

// ---------------------------------------------------------------- headline wall
export const HeadlineWall: React.FC<{fx: Of<'headline-wall'>}> = ({fx}) => {
  const {t} = useFxTime(fx.at);
  const fade = useFade(fx);
  const lines = fx.props.lines;
  const cols = [0, 1, 2];
  return (
    <div style={{...FILL, background: '#0b0405', opacity: fade, overflow: 'hidden'}}>
      {cols.map((c) => (
        <div key={c} style={{position: 'absolute', left: 24 + c * 346, top: -400, width: 330, transform: `translateY(${((t * (46 + c * 18)) % 520) * (c % 2 ? -1 : 1) - (c % 2 ? 0 : 0)}px)`}}>
          {Array.from({length: 14}).map((_, i) => {
            const text = lines[(i + c * 2) % lines.length];
            const enter = tw(t, (i % 7) * 0.07, (i % 7) * 0.07 + 0.3, 0, 1, pop);
            return (
              <div key={i} style={{width: 330, height: 236, marginBottom: 24, borderRadius: 26, background: 'rgba(255,255,255,0.94)', padding: '26px 26px', boxSizing: 'border-box', opacity: enter, transform: `scale(${0.9 + 0.1 * enter})`, boxShadow: '0 12px 30px rgba(0,0,0,0.45)'}}>
                <div style={{height: 8, width: 70, borderRadius: 4, marginBottom: 18, background: brand.crimson}} />
                <div style={{fontFamily: sansFamily('DM Sans'), fontWeight: 700, fontSize: 34, lineHeight: 1.16, color: brand.charcoal}}>{text}</div>
              </div>
            );
          })}
        </div>
      ))}
      <div style={{...FILL, background: 'rgba(0,0,0,0.38)'}} />
    </div>
  );
};

// ---------------------------------------------------------------- couch wall
export const CouchWall: React.FC<{fx: Of<'couch-wall'>}> = ({fx}) => {
  const {t, frame} = useFxTime(fx.at);
  const fade = useFade(fx);
  const tiles = fx.props.tiles;
  const drift = 1 + 0.035 * tw(t, 0, 4, 0, 1, (n) => n);
  return (
    <div style={{...FILL, background: '#080203', opacity: fade, overflow: 'hidden'}}>
      <div style={{...FILL, transform: `scale(${drift})`}}>
        {Array.from({length: 15}).map((_, i) => {
          const col = i % 3;
          const row = Math.floor(i / 3);
          const enter = tw(t, ((col + row) % 5) * 0.07, ((col + row) % 5) * 0.07 + 0.32, 0, 1, pop);
          const depth = (i * 37) % 3;
          const g = ['linear-gradient(160deg,#C91B19,#4a090b)', 'linear-gradient(160deg,#8d1214,#1b0405)', 'linear-gradient(160deg,#3A3F42,#0e1011)'][depth];
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: 14 + col * 352,
                top: 36 + row * 372,
                width: 340,
                height: 356,
                borderRadius: 28,
                background: g,
                boxSizing: 'border-box',
                border: '2px solid rgba(213,170,74,0.7)',
                transform: `scale(${0.8 + 0.2 * enter})`,
                opacity: enter,
                display: 'flex',
                alignItems: 'flex-end',
                padding: 26,
                ...(frame >= 0 ? {} : metalFill({variant: 'bright', frame, seed: i})),
              }}
            >
              <div style={{fontFamily: serifFamily, fontStyle: 'italic', fontWeight: 700, fontSize: 40, lineHeight: 1.1, color: brand.white}}>{tiles[i % tiles.length]}</div>
            </div>
          );
        })}
      </div>
      <div style={{...FILL, background: 'rgba(0,0,0,0.3)'}} />
    </div>
  );
};

// ---------------------------------------------------------------- knockout tiles
export const KnockoutTiles: React.FC<{fx: Of<'knockout-tiles'>}> = ({fx}) => {
  const {abs} = useFxTime(fx.at);
  const fade = useFade(fx);
  const names = fx.props.names;
  const rows = Math.ceil(names.length / 2);
  const tileH = Math.min(170, 1300 / rows - 20);
  return (
    <div style={{...FILL, background: PLATE, opacity: fade, overflow: 'hidden'}}>
      {names.map((n, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const slamAt = fx.at + 0.1 + i * 0.16;
        const slam = tw(abs, slamAt, slamAt + 0.18, 0, 1, pop);
        const knock = tw(abs, n.knockAt, n.knockAt + 0.55, 0, 1, (x) => x * x);
        const x = col ? 764 : 16;
        const y = 190 + row * (tileH + 20);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: 300,
              height: tileH,
              borderRadius: 24,
              background: i % 3 === 0 ? brand.white : i % 3 === 1 ? brand.crimson : brand.black,
              border: `3px solid ${i % 3 === 2 ? 'rgba(213,170,74,0.8)' : 'rgba(0,0,0,0.0)'}`,
              boxSizing: 'border-box',
              display: 'flex',
              alignItems: 'center',
              fontFamily: heavyFamily,
              fontSize: 58,
              letterSpacing: 2,
              justifyContent: col ? 'flex-end' : 'flex-start',
              padding: '0 26px',
              textTransform: 'uppercase',
              color: i % 3 === 0 ? brand.black : brand.white,
              opacity: slam * (1 - knock),
              transform: `translateY(${knock * 900}px) rotate(${knock * (col ? 18 : -18)}deg) scale(${1.5 - 0.5 * slam})`,
              boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
            }}
          >
            {n.text}
          </div>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------- spotlight (dim layer; she stays lit via the cutout)
export const SpotlightDim: React.FC<{fx: Of<'spotlight'>}> = ({fx}) => {
  const fade = useFade(fx, 0.35, 0.35);
  return (
    <>
      <div style={{...FILL, background: `rgba(0,0,0,${fx.props.dim})`, opacity: fade}} />
      <div style={{...FILL, background: 'radial-gradient(circle at 50% 36%, rgba(255,226,196,0.30), rgba(255,226,196,0) 52%)', opacity: fade}} />
    </>
  );
};

// ---------------------------------------------------------------- orbit
const OrbitCard: React.FC<{label: string; i: number}> = ({label, i}) => (
  <div style={{width: 230, height: 410, borderRadius: 30, boxSizing: 'border-box', border: '2px solid rgba(213,170,74,0.85)', background: i % 2 ? 'linear-gradient(165deg,#C91B19,#3d0709)' : 'linear-gradient(165deg,#2b2f31,#050606)', padding: 22, display: 'flex', alignItems: 'flex-end', boxShadow: '0 18px 40px rgba(0,0,0,0.55)'}}>
    <div style={{fontFamily: serifFamily, fontStyle: 'italic', fontWeight: 700, fontSize: 38, lineHeight: 1.1, color: brand.white}}>{label}</div>
  </div>
);
export const OrbitItems: React.FC<{fx: Of<'orbit'>; half: 'back' | 'front'}> = ({fx, half}) => {
  const {t} = useFxTime(fx.at);
  const len = useLen(fx);
  const n = fx.props.items.length;
  const inK = tw(t, 0, 0.5, 0, 1, pop) * (1 - tw(t, len - 0.35, len));
  return (
    <div style={{...FILL, pointerEvents: 'none'}}>
      {fx.props.items.map((label, i) => {
        const th = t * 1.15 + (i * Math.PI * 2) / n;
        const depth = Math.sin(th);
        if ((half === 'front') !== depth > 0) return null;
        const k = (depth + 1) / 2;
        const sc = (0.62 + 0.42 * k) * inK;
        return (
          <div key={i} style={{position: 'absolute', left: 540 + fx.props.radius * Math.cos(th) - 115, top: 760 + 230 * depth - 205, transform: `scale(${sc}) rotate(${Math.cos(th) * 7}deg)`, opacity: half === 'back' ? 0.9 : 1, filter: half === 'back' ? 'brightness(0.62)' : undefined}}>
            <OrbitCard label={label} i={i} />
          </div>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------- clones
export const CloneCopies: React.FC<{fx: Of<'clone'>}> = ({fx}) => {
  const {abs} = useFxTime(fx.at);
  const {fps} = useVideoConfig();
  const out = 1 - tw(abs, fxRange(fx)[1] - 0.3, fxRange(fx)[1]);
  return (
    <>
      {fx.props.copies.map((c, i) => {
        const k = tw(abs, c.at, c.at + 0.3, 0, 1, pop) * out;
        if (k <= 0.01) return null;
        const dir = c.side === 'left' ? -1 : 1;
        // her head sits near 25 percent of the frame height; scaling around (50%, 72%) moves it, so solve for the translate that lands it at c.y
        const headAfter = 0.72 * 1920 - (0.72 - 0.25) * 1920 * c.scale;
        const ty = c.y * 1920 - headAfter;
        return <Cutout key={i} from={Math.round(fx.at * fps)} style={{transformOrigin: '50% 72%', transform: `translate(${dir * 400 * k}px, ${ty + (1 - k) * 300}px) scale(${c.scale * (0.6 + 0.4 * k)})`, opacity: k}} />;
      })}
    </>
  );
};

// ---------------------------------------------------------------- frame break (card plate; her cutout pops out of it)
export const FrameBreakPlate: React.FC<{fx: Of<'frame-break'>}> = ({fx}) => {
  const {abs, frame} = useFxTime(fx.at);
  const {fps} = useVideoConfig();
  const [a, b] = fxRange(fx);
  const shrink = tw(abs, a, a + 0.55) * (1 - tw(abs, b - 0.45, b, 0, 1, (x) => x * x));
  const s = 1 - 0.4 * shrink;
  const r = 10 + 56 * shrink;
  void frame;
  return (
    <div style={{...FILL, background: PLATE, opacity: 1}}>
      <div style={{...FILL, transform: `translateY(${-90 * shrink}px) scale(${s})`, borderRadius: r, overflow: 'hidden', boxShadow: `0 0 0 ${6 * shrink}px #D5AA4A, 0 30px 80px rgba(0,0,0,0.6)`}}>
        <OffthreadVideo src={staticFile(useFxEnv().video)} muted startFrom={Math.round(a * fps)} style={{...FILL, objectFit: 'cover'}} />
      </div>
      {fx.props.label && (
        <div style={{position: 'absolute', left: 0, width: 1080, top: 1640, textAlign: 'center', fontFamily: heavyFamily, fontSize: 90, letterSpacing: 3, color: brand.white, opacity: tw(abs, fx.props.popAt, fx.props.popAt + 0.3) * shrink}}>{fx.props.label.toUpperCase()}</div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------- UI world (an app screen fills the frame; she stands in front)
export const UiWorld: React.FC<{fx: Of<'ui-world'>}> = ({fx}) => {
  const {t} = useFxTime(fx.at);
  const fade = useFade(fx, 0.3, 0.3);
  const shown = fx.props.prompt.slice(0, Math.floor(tw(t, 0.4, 0.4 + fx.props.prompt.length * 0.05, 0, fx.props.prompt.length, (x) => x)));
  const caret = Math.floor(t * 2.4) % 2 === 0 ? '|' : '';
  return (
    <div style={{...FILL, background: 'linear-gradient(180deg,#15181a,#0a0b0c)', opacity: fade}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 120, display: 'flex', alignItems: 'center', padding: '0 44px', gap: 14, background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.1)'}}>
        {['#C91B19', '#D5AA4A', '#9aa0a3'].map((c, i) => (
          <div key={i} style={{width: 22, height: 22, borderRadius: 11, background: c}} />
        ))}
        <div style={{marginLeft: 22, fontFamily: sansFamily('DM Sans'), fontWeight: 700, fontSize: 34, color: brand.white, letterSpacing: 1}}>{fx.props.title}</div>
      </div>
      <div style={{position: 'absolute', left: 54, top: 220, width: 972, fontFamily: serifFamily, fontStyle: 'italic', fontWeight: 700, fontSize: 84, lineHeight: 1.1, color: brand.white}}>What are we making today?</div>
      <div style={{position: 'absolute', left: 54, top: 560, width: 972, minHeight: 250, borderRadius: 36, background: 'rgba(255,255,255,0.08)', border: '2px solid rgba(213,170,74,0.7)', boxSizing: 'border-box', padding: '36px 40px'}}>
        <div style={{fontFamily: sansFamily('DM Sans'), fontWeight: 500, fontSize: 48, lineHeight: 1.25, color: brand.white}}>
          {shown}
          <span style={{color: '#D5AA4A'}}>{caret}</span>
        </div>
        <div style={{position: 'absolute', right: 30, bottom: 26, width: 78, height: 78, borderRadius: 39, ...metalFill({kind: 'copper', variant: 'bright', frame: 0, shimmer: false}), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, color: '#2a1206'}}>↑</div>
      </div>
      <div style={{position: 'absolute', left: 54, top: 880, display: 'flex', gap: 18, flexWrap: 'wrap', width: 972}}>
        {fx.props.chips.map((c, i) => (
          <div key={i} style={{padding: '18px 30px', borderRadius: 40, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.22)', fontFamily: sansFamily('DM Sans'), fontWeight: 700, fontSize: 32, color: brand.white, opacity: tw(t, 1.1 + i * 0.15, 1.35 + i * 0.15), transform: `translateY(${(1 - tw(t, 1.1 + i * 0.15, 1.35 + i * 0.15)) * 16}px)`}}>
            {c}
          </div>
        ))}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- green screen plate (the whole screen becomes the subject)
export const GreenScreenPlate: React.FC<{fx: Of<'green-screen'>}> = ({fx}) => {
  const fade = useFade(fx, 0.25, 0.3);
  const {plate, src, text} = fx.props;
  return (
    <div style={{...FILL, background: PLATE, opacity: fade, overflow: 'hidden'}}>
      {plate === 'screenshot' && src && <Img src={staticFile(src)} style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1500, objectFit: 'cover', objectPosition: 'top'}} />}
      {plate !== 'screenshot' && (
        <div style={{position: 'absolute', left: 60, right: 60, top: 300, fontFamily: serifFamily, fontStyle: 'italic', fontWeight: 800, fontSize: 130, lineHeight: 1.05, color: brand.white, textShadow: '0 4px 30px rgba(0,0,0,0.5)'}}>{text ?? ''}</div>
      )}
    </div>
  );
};

export const behindPlate = (fx: Fx): React.ReactNode => {
  switch (fx.type) {
    case 'type-wall':
      return <TypeWall fx={fx} />;
    case 'headline-wall':
      return <HeadlineWall fx={fx} />;
    case 'couch-wall':
      return <CouchWall fx={fx} />;
    case 'knockout-tiles':
      return <KnockoutTiles fx={fx} />;
    case 'spotlight':
      return <SpotlightDim fx={fx} />;
    case 'orbit':
      return <OrbitItems fx={fx} half="back" />;
    case 'frame-break':
      return <FrameBreakPlate fx={fx} />;
    case 'ui-world':
      return <UiWorld fx={fx} />;
    case 'green-screen':
      return <GreenScreenPlate fx={fx} />;
    default:
      return thirdPlate(fx) ?? sixthPlate(fx);
  }
};

/** things drawn above her cutout but still inside the person frame */
export const behindFront = (fx: Fx): React.ReactNode => (fx.type === 'orbit' ? <OrbitItems fx={fx} half="front" /> : thirdFront(fx));
export {Sequence, metalGradient};
