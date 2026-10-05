import React from 'react';
import {interpolate} from 'remotion';
import {MetalBox} from '../metal';
import {SAFE, W} from '../layouts';
import {clamp, easeOut, useBgMetal, useCardMotion, useSans, useTheme} from '../ui';

/** Small spaced-caps label that sits at the top of a scene, below the 12% safe line, over a metal rule. */
export const Tag: React.FC<{text: string}> = ({text}) => {
  const {frame, opacity} = useCardMotion(0, 8, 6);
  const {palette, mood} = useTheme();
  const metal = useBgMetal();
  const sans = useSans();
  const rule = interpolate(frame, [4, 18], [0, 1], {...clamp, easing: easeOut});

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: SAFE.top + 22,
        width: W,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 14,
        opacity,
      }}
    >
      <div
        style={{
          fontFamily: sans,
          fontWeight: 700,
          fontSize: 25,
          letterSpacing: '0.34em',
          paddingLeft: '0.34em',
          textTransform: 'uppercase',
          color: palette.labelOnBg,
          textShadow: mood === 'dark' ? '0 2px 14px rgba(0,0,0,0.55)' : 'none',
        }}
      >
        {text}
      </div>
      <MetalBox variant={metal} seed={1} style={{height: 4, width: 170 * rule, borderRadius: 2}} />
    </div>
  );
};
