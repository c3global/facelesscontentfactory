import React from 'react';
import {useCurrentFrame} from 'remotion';

const FPS = 24;

/** A small four-point glint that twinkles on a loop. Place a few on a metal rim, each with its own phase. */
export const Sparkle: React.FC<{left: number | string; top: number | string; size: number; phase: number; period?: number}> = ({left, top, size, phase, period = 3.2}) => {
  const f = useCurrentFrame();
  const t = (((f / FPS + phase) % period) + period) % period / period; // 0..1
  const active = t < 0.3 ? Math.sin((t / 0.3) * Math.PI) : 0;
  if (active <= 0.01) return null;
  const s = Math.pow(active, 1.4);
  return (
    <svg
      width={size}
      height={size}
      viewBox="-1 -1 2 2"
      style={{position: 'absolute', left, top, marginLeft: -size / 2, marginTop: -size / 2, opacity: s, transform: `scale(${0.35 + 0.65 * s}) rotate(${t * 40}deg)`, pointerEvents: 'none', filter: 'drop-shadow(0 0 6px rgba(255,214,180,0.95))'}}
    >
      <defs>
        <radialGradient id="spk" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="60%" stopColor="#FFE9C9" />
          <stop offset="100%" stopColor="#F0B58C" />
        </radialGradient>
      </defs>
      <path d="M0 -1 L0.2 -0.2 L1 0 L0.2 0.2 L0 1 L-0.2 0.2 L-1 0 L-0.2 -0.2 Z" fill="url(#spk)" />
    </svg>
  );
};
