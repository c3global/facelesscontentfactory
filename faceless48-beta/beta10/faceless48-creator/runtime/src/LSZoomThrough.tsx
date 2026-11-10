import React from 'react';
import {AbsoluteFill, Easing, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {z} from 'zod';

const FPS = 24;

export const lsZoomThroughSchema = z.object({
  /** clip we zoom INTO (its last seconds play, then a hard cut) */
  outSrc: z.string(),
  outStartSec: z.number(),
  outSec: z.number(),
  outPx: z.number(),
  outPy: z.number(),
  /** clip we come OUT of (starts zoomed in on the same point, pulls back) */
  inSrc: z.string(),
  inStartSec: z.number(),
  inSec: z.number(),
  inPx: z.number(),
  inPy: z.number(),
  /** zoom factor at the cut and how long each half of the move lasts */
  peak: z.number(),
  moveSec: z.number(),
});
export type LSZoomThroughProps = z.infer<typeof lsZoomThroughSchema>;

const K = 8; // sub-frames averaged for motion blur
const SHUTTER = 0.9; // fraction of a frame the "shutter" stays open

const Layer: React.FC<{src: string; startFrom: number; scale: number; px: number; py: number; opacity: number}> = ({src, startFrom, scale, px, py, opacity}) => (
  <AbsoluteFill style={{opacity, transform: `scale(${scale})`, transformOrigin: `${px * 100}% ${py * 100}%`}}>
    <OffthreadVideo src={staticFile(src)} muted startFrom={startFrom} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
  </AbsoluteFill>
);

/**
 * M04 zoom-through cut. The first clip accelerates into a point and the picture cuts (hard, no fade) to the second clip,
 * which begins at the same zoom on the same kind of point and pulls back out. Motion blur is faked by averaging sub-frames.
 * Picture only: render as a sequence and finish with scripts/ls_finish.py.
 */
const Half: React.FC<{src: string; startSec: number; durFrames: number; px: number; py: number; peak: number; moveFrames: number; mode: 'in' | 'out'}> = ({src, startSec, durFrames, px, py, peak, moveFrames, mode}) => {
  const f = useCurrentFrame();
  const startFrom = Math.round(startSec * FPS);
  const scaleAt = (ff: number) => {
    if (mode === 'in') {
      const u = interpolate(ff, [durFrames - moveFrames, durFrames], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.cubic)});
      return Math.exp(Math.log(peak) * u);
    }
    const u = interpolate(ff, [0, moveFrames], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
    return Math.exp(Math.log(peak) * (1 - u));
  };
  const moving = mode === 'in' ? f >= durFrames - moveFrames - 1 : f <= moveFrames + 1;
  if (!moving) return <Layer src={src} startFrom={startFrom} scale={1} px={px} py={py} opacity={1} />;
  return (
    <>
      {Array.from({length: K}).map((_, k) => {
        const t = f + (k / (K - 1) - 0.5) * SHUTTER;
        return <Layer key={k} src={src} startFrom={startFrom} scale={scaleAt(t)} px={px} py={py} opacity={1 / (k + 1)} />;
      })}
    </>
  );
};

export const LSZoomThrough: React.FC<LSZoomThroughProps> = (p) => {
  const outFrames = Math.round(p.outSec * FPS);
  const inFrames = Math.round(p.inSec * FPS);
  const move = Math.round(p.moveSec * FPS);
  return (
    <AbsoluteFill style={{backgroundColor: '#000', overflow: 'hidden'}}>
      <Sequence from={0} durationInFrames={outFrames}>
        <Half src={p.outSrc} startSec={p.outStartSec} durFrames={outFrames} px={p.outPx} py={p.outPy} peak={p.peak} moveFrames={move} mode="in" />
      </Sequence>
      <Sequence from={outFrames} durationInFrames={inFrames}>
        <Half src={p.inSrc} startSec={p.inStartSec} durFrames={inFrames} px={p.inPx} py={p.inPy} peak={p.peak} moveFrames={move} mode="out" />
      </Sequence>
    </AbsoluteFill>
  );
};
