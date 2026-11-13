import React from 'react';
import {Img, OffthreadVideo, staticFile} from 'remotion';
import {NoteInk, Scrim, Title} from './eleventh';
import {useSpan} from './fourth';
import type {Fx} from './schema';
import {C3} from './theme';
import {pop, tw, useFxEnv} from './util';

/**
 * Fourteenth FX batch (beta 11): three carousel pieces as video effects.
 *   image-collage  a grid of pictures rises in tile by tile, with a title and an optional comment pill
 *   cover-fan      a stack of tilted frames fans out like a hand of cards
 *   framed-clip    a clip or picture in a frame beside her, with handwritten notes and arrows
 */
type Of<T extends Fx['type']> = Extract<Fx, {type: T}>;
const FILL: React.CSSProperties = {position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, pointerEvents: 'none'};
const SANS = C3.sans;
const isClip = (src: string) => /\.(mp4|mov|webm)$/i.test(src);
/** a picture or a muted clip from public/, filling its box */
const Media: React.FC<{src: string; from?: number}> = ({src, from = 0}) =>
  isClip(src) ? <OffthreadVideo src={staticFile(src)} muted startFrom={from} style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block'}} /> : <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block'}} />;
const FRAME: React.CSSProperties = {borderRadius: 26, overflow: 'hidden', border: '5px solid #fff', boxShadow: '0 30px 70px rgba(0,0,0,0.55)', background: '#16171c', boxSizing: 'border-box'};

// ---------------------------------------------------------------- image collage
export const ImageCollage: React.FC<{fx: Of<'image-collage'>}> = ({fx}) => {
  const {t, inK, outK} = useSpan(fx);
  const {images, title, keyword, cols, y} = fx.props;
  const gap = 14;
  const W = 940;
  const tw_ = (W - gap * (cols - 1)) / cols;
  return (
    <>
      <Scrim fx={fx} top={y} />
      <div style={{...FILL, opacity: outK}}>
        <div style={{position: 'absolute', left: (1080 - W) / 2, width: W, top: y, fontFamily: SANS, color: '#fff'}}>
          <Title text={title} k={inK} />
          {keyword && <div style={{display: 'inline-block', marginBottom: 24, padding: '10px 26px', borderRadius: 14, background: C3.accent, fontWeight: 700, fontSize: 34, transform: `rotate(-2deg) scale(${tw(t, 0.25, 0.6, 0, 1, pop)})`, transformOrigin: '0 50%'}}>Comment "{keyword.toUpperCase()}"</div>}
          <div style={{display: 'flex', flexWrap: 'wrap', gap}}>
            {images.map((src, i) => {
              const k = tw(t, 0.3 + i * 0.07, 0.7 + i * 0.07, 0, 1, pop);
              return (
                <div key={i} style={{width: tw_, height: tw_ * 1.25, borderRadius: 14, overflow: 'hidden', border: '1.5px solid rgba(255,255,255,0.25)', boxShadow: '0 14px 30px rgba(0,0,0,0.45)', opacity: Math.min(1, k * 1.5), transform: `translateY(${(1 - k) * 40 + Math.sin(t * 1.2 + i) * 3}px) scale(${0.9 + 0.1 * k})`}}>
                  <Media src={src} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

// ---------------------------------------------------------------- cover fan
export const CoverFan: React.FC<{fx: Of<'cover-fan'>}> = ({fx}) => {
  const {t, inK, outK, len} = useSpan(fx);
  const {images, title, y, width} = fx.props;
  const n = images.length;
  const h = width * 1.3;
  const spread = tw(t, 0.25, 1.0, 0, 1, pop) * (1 - tw(t, len - 0.45, len - 0.1));
  return (
    <>
      <Scrim fx={fx} top={y} />
      <div style={{...FILL, opacity: outK}}>
        <div style={{position: 'absolute', left: 70, width: 940, top: y, fontFamily: SANS, color: '#fff', textAlign: 'center'}}>
          <Title text={title} k={inK} />
        </div>
        <div style={{position: 'absolute', left: 540 - width / 2, top: y + (title ? 150 : 30), width, height: h, opacity: inK, transform: `translateY(${(1 - inK) * 70}px)`}}>
          {images.map((src, i) => {
            const c = i - (n - 1) / 2;
            const sway = Math.sin(t * 1.3 + i) * 1.2;
            return (
              <div key={i} style={{...FRAME, position: 'absolute', inset: 0, transformOrigin: '50% 120%', transform: `rotate(${(c * 13 + sway) * spread}deg) translateY(${Math.abs(c) * 16 * spread}px)`, zIndex: i}}>
                <Media src={src} />
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

// ---------------------------------------------------------------- framed clip with notes
export const FramedClip: React.FC<{fx: Of<'framed-clip'>}> = ({fx}) => {
  const {a, t, abs, fps, inK, outK} = useSpan(fx);
  const {video} = useFxEnv();
  const {media, side, notes, y, width, height, tilt} = fx.props;
  const left = side === 'left' ? 60 : side === 'right' ? 1080 - 60 - width : (1080 - width) / 2;
  const dir = side === 'left' ? -1 : side === 'right' ? 1 : 0;
  return (
    <>
      <Scrim fx={fx} top={y - 60} />
      <div style={{...FILL, opacity: outK}}>
        <div style={{...FRAME, position: 'absolute', left, top: y + Math.sin(t * 0.9) * 5, width, height, opacity: inK, transform: `translate(${(1 - inK) * dir * 160}px, ${(1 - inK) * 60}px) rotate(${tilt * inK}deg) scale(${0.9 + 0.1 * inK})`}}>
          {media ? <Media src={media} /> : <OffthreadVideo src={staticFile(video)} muted startFrom={Math.round(a * fps)} style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block'}} />}
        </div>
        {notes.map((n, i) => {
          const at = n.at ?? fx.at + 0.6 + i * 0.6;
          return <NoteInk key={i} text={n.text} x={n.x} y={n.y} align={n.align} to={n.to} from={n.from} bend={n.bend} size={n.size} snug w={tw(abs, at, at + 0.6)} k={tw(abs, at + 0.45, at + 0.95)} />;
        })}
      </div>
    </>
  );
};

export const fourteenthOver = (fx: Fx): React.ReactNode => {
  switch (fx.type) {
    case 'image-collage': return <ImageCollage fx={fx} />;
    case 'cover-fan': return <CoverFan fx={fx} />;
    case 'framed-clip': return <FramedClip fx={fx} />;
    default: return null;
  }
};
