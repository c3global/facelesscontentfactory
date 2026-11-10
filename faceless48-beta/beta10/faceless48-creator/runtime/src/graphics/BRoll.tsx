import React from 'react';
import {AbsoluteFill, Easing, interpolate, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

export type BRollProps = {
  src: string;
  startSec: number;
  move: 'none' | 'zoom' | 'pullback' | 'punch' | 'drift';
  zoom: number;
  px: number;
  py: number;
  scrim: boolean;
  /** how long the cutaway is on screen, in seconds (set from the graphic's at and until) */
  lengthSec: number;
};

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/**
 * A B-roll cutaway: a video clip (stock footage or the member's own) fills the whole frame for a few seconds while her
 * voice keeps playing underneath. The clip is silent here, so her audio is never replaced. One camera move per clip:
 * zoom (slow push), pullback (starts tight, reveals), punch (quick zoom on a beat) or drift (gentle handheld sway).
 * Fades in and out so the cut never flashes. A soft scrim under the caption band keeps captions readable.
 */
export const BRoll: React.FC<BRollProps> = ({src, startSec, move, zoom, px, py, scrim, lengthSec}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const n = Math.max(1, Math.round(lengthSec * fps));
  const fade = Math.max(1, Math.min(6, Math.floor(n / 3)));
  const opacity = interpolate(f, [0, fade, n - fade, n], [0, 1, 1, 0], clamp);
  let scale = 1;
  let tx = 0;
  let ty = 0;
  let rot = 0;
  if (move === 'zoom') {
    scale = interpolate(f, [0, n], [1, zoom], {...clamp, easing: Easing.inOut(Easing.sin)});
  } else if (move === 'pullback') {
    scale = interpolate(f, [0, n * 0.7], [zoom, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  } else if (move === 'punch') {
    const a = Math.round(0.25 * fps);
    const snap = interpolate(f, [a, a + 5], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
    const creep = interpolate(f, [a + 5, n], [0, 0.015], clamp);
    scale = 1 + (zoom - 1) * snap + creep;
  } else if (move === 'drift') {
    const t = f / fps;
    scale = Math.max(zoom, 1.05);
    tx = 9 * Math.sin(t * 0.9) + 5 * Math.sin(t * 2.1 + 1.3);
    ty = 8 * Math.sin(t * 0.7 + 0.6) + 4 * Math.sin(t * 1.9 + 2.2);
    rot = 0.22 * Math.sin(t * 0.8 + 0.4) + 0.1 * Math.sin(t * 1.7);
  }
  return (
    <AbsoluteFill style={{opacity, backgroundColor: '#000', overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `translate(${tx}px, ${ty}px) rotate(${rot}deg) scale(${scale})`, transformOrigin: `${px * 100}% ${py * 100}%`}}>
        <OffthreadVideo src={staticFile(src)} muted startFrom={Math.round(startSec * fps)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </AbsoluteFill>
      {scrim && <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.5) 70%, rgba(0,0,0,0.7) 100%)'}} />}
    </AbsoluteFill>
  );
};
