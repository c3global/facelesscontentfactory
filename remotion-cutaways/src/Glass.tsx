import React from 'react';
import {Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {colors, copperGradient} from './theme';

const EXIT_FRAMES = 12;

/** Enter/exit motion shared by every cutaway. Frame is relative to the Sequence. */
export const useGlassMotion = (durationInFrames: number, delay = 0) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({frame: frame - delay, fps, config: {damping: 16, stiffness: 120, mass: 0.8}});
  const exit = interpolate(frame, [durationInFrames - EXIT_FRAMES, durationInFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.in(Easing.cubic),
  });
  return {
    frame,
    enter,
    opacity: Math.min(1, enter * 1.4) * (1 - exit),
    translateY: (1 - enter) * 56 + exit * -24,
    scale: 0.93 + enter * 0.07 - exit * 0.03,
  };
};

type GlassProps = {
  durationInFrames: number;
  width: number;
  height?: number;
  left?: number;
  top: number;
  radius?: number;
  padding?: number;
  delay?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
};

/**
 * Warm luxe liquid glass: eggplant-tinted frosted panel, copper metallic edge,
 * slow specular sweep, soft copper glow. No full-screen background, ever.
 *
 * Note: opacity lives on the panel itself (not an ancestor) so backdrop-filter
 * keeps blurring the video behind it while the card fades.
 */
export const Glass: React.FC<GlassProps> = ({
  durationInFrames,
  width,
  height,
  left,
  top,
  radius = 44,
  padding = 48,
  delay = 0,
  children,
  style,
}) => {
  const {frame, opacity, translateY, scale} = useGlassMotion(durationInFrames, delay);
  const x = left ?? (1080 - width) / 2;
  const sweep = interpolate(frame, [0, durationInFrames], [-40, 140]);

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top,
        width,
        height,
        transform: `translateY(${translateY}px) scale(${scale})`,
        transformOrigin: 'center center',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          boxSizing: 'border-box',
          padding,
          borderRadius: radius,
          opacity,
          overflow: 'hidden',
          backdropFilter: 'blur(30px) saturate(150%) brightness(0.55)',
          WebkitBackdropFilter: 'blur(30px) saturate(150%) brightness(0.55)',
          background: `linear-gradient(145deg, rgba(78,38,98,0.72) 0%, rgba(42,18,55,0.70) 50%, rgba(14,6,20,0.68) 100%)`,
          boxShadow: `0 30px 80px rgba(11,7,16,0.55), 0 0 46px rgba(184,115,51,0.30), inset 0 1.5px 0 rgba(255,235,220,0.45), inset 0 -1px 0 rgba(184,115,51,0.35)`,
          ...style,
        }}
      >
        {/* metallic copper edge */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: radius,
            padding: 2.5,
            background: copperGradient,
            backgroundSize: '220% 220%',
            backgroundPosition: `${interpolate(frame, [0, durationInFrames], [0, 100])}% 50%`,
            WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
            WebkitMaskComposite: 'xor',
            pointerEvents: 'none',
          }}
        />
        {/* specular sweep */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(105deg, transparent ${sweep - 14}%, rgba(255,236,222,0.20) ${sweep}%, transparent ${sweep + 14}%)`,
            mixBlendMode: 'screen',
            pointerEvents: 'none',
          }}
        />
        <div style={{position: 'relative'}}>{children}</div>
      </div>
    </div>
  );
};

export const neonCopperGlow = `0 0 18px rgba(233,176,138,0.75), 0 0 42px rgba(184,115,51,0.55)`;
export const whiteGlow = `0 2px 24px rgba(11,7,16,0.65)`;
export {colors};
