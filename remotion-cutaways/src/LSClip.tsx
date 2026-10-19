import React from 'react';
import {AbsoluteFill, Easing, Freeze, interpolate, OffthreadVideo, staticFile, useCurrentFrame} from 'remotion';
import {z} from 'zod';

const FPS = 24;

export const lsClipSchema = z.object({
  /** path inside public/, for example raw/clip.mp4 */
  src: z.string(),
  /** M01 digital zoom, M03 pull-back reveal, none for a plain pass-through */
  effect: z.enum(['none', 'zoom', 'pullback', 'punch', 'drift', 'freeze']),
  /** zoom factor at the start and end of the move */
  from: z.number(),
  to: z.number(),
  /** seconds the move takes (pull-back eases out then holds) */
  moveSec: z.number(),
  /** the point the camera moves toward, as a fraction of the frame (phone, face) */
  px: z.number(),
  py: z.number(),
  /** M02 punch-in, M08 freeze: the second the beat lands */
  atSec: z.number().optional(),
  /** M09 handheld drift: strength 1 is a gentle sway */
  drift: z.number().optional(),
  /** hold the last frame of the source from this second on (for a voiceover longer than the clip), whatever the camera effect */
  holdFromSec: z.number().optional(),
});
export type LSClipProps = z.infer<typeof lsClipSchema>;

/**
 * Picture only. Render as a PNG sequence, then finish with scripts/ls_finish.py (grain, overlay, audio).
 * Scaling here is a CSS transform, so the move is sub-pixel smooth.
 */
export const LSClip: React.FC<LSClipProps> = ({src, effect, from, to, moveSec, px, py, atSec = 0, drift = 1, holdFromSec}) => {
  const f = useCurrentFrame();
  const n = Math.round(moveSec * FPS);
  let scale = 1;
  if (effect === 'zoom') {
    scale = interpolate(f, [0, n], [from, to], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.sin)});
  } else if (effect === 'pullback') {
    scale = interpolate(f, [0, n], [from, to], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  }
  let tx = 0;
  let ty = 0;
  let rot = 0;
  if (effect === 'punch') {
    // fast ease-out snap on the beat, then holds (a slow creep keeps it alive)
    const a = Math.round(atSec * FPS);
    const snap = interpolate(f, [a, a + 5], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
    const creep = interpolate(f, [a + 5, a + 5 + n], [0, 0.015], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    scale = from + (to - from) * snap + creep;
  } else if (effect === 'drift') {
    // two slow sines per axis, never repeating on a short clip; scale hides the moving edges
    const t = f / FPS;
    scale = Math.max(from, 1.05);
    tx = drift * (9 * Math.sin(t * 0.9) + 5 * Math.sin(t * 2.1 + 1.3));
    ty = drift * (8 * Math.sin(t * 0.7 + 0.6) + 4 * Math.sin(t * 1.9 + 2.2));
    rot = drift * (0.22 * Math.sin(t * 0.8 + 0.4) + 0.1 * Math.sin(t * 1.7));
  }
  const video = <OffthreadVideo src={staticFile(src)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />;
  const freezeAt = Math.round(atSec * FPS);
  return (
    <AbsoluteFill style={{backgroundColor: '#000', overflow: 'hidden'}}>
      <AbsoluteFill
        style={{
          transform: `translate(${tx}px, ${ty}px) rotate(${rot}deg) scale(${scale})`,
          transformOrigin: `${px * 100}% ${py * 100}%`,
        }}
      >
        {effect === 'freeze' && f >= freezeAt ? (
          <Freeze frame={freezeAt}>{video}</Freeze>
        ) : holdFromSec !== undefined && f >= Math.round(holdFromSec * FPS) ? (
          <Freeze frame={Math.round(holdFromSec * FPS)}>{video}</Freeze>
        ) : (
          video
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
