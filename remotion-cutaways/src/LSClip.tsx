import React from 'react';
import {AbsoluteFill, Easing, interpolate, OffthreadVideo, staticFile, useCurrentFrame} from 'remotion';
import {z} from 'zod';

const FPS = 24;

export const lsClipSchema = z.object({
  /** path inside public/, for example raw/clip.mp4 */
  src: z.string(),
  /** M01 digital zoom, M03 pull-back reveal, none for a plain pass-through */
  effect: z.enum(['none', 'zoom', 'pullback']),
  /** zoom factor at the start and end of the move */
  from: z.number(),
  to: z.number(),
  /** seconds the move takes (pull-back eases out then holds) */
  moveSec: z.number(),
  /** the point the camera moves toward, as a fraction of the frame (phone, face) */
  px: z.number(),
  py: z.number(),
});
export type LSClipProps = z.infer<typeof lsClipSchema>;

/**
 * Picture only. Render as a PNG sequence, then finish with scripts/ls_finish.py (grain, overlay, audio).
 * Scaling here is a CSS transform, so the move is sub-pixel smooth.
 */
export const LSClip: React.FC<LSClipProps> = ({src, effect, from, to, moveSec, px, py}) => {
  const f = useCurrentFrame();
  const n = Math.round(moveSec * FPS);
  let scale = 1;
  if (effect === 'zoom') {
    scale = interpolate(f, [0, n], [from, to], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.sin)});
  } else if (effect === 'pullback') {
    scale = interpolate(f, [0, n], [from, to], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  }
  return (
    <AbsoluteFill style={{backgroundColor: '#000', overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `scale(${scale})`, transformOrigin: `${px * 100}% ${py * 100}%`}}>
        <OffthreadVideo src={staticFile(src)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
