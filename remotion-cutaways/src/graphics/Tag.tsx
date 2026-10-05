import React from 'react';
import {interpolate} from 'remotion';
import {brand, roseGoldBright, roseGoldGradient} from '../brand';
import {SAFE, W} from '../layouts';
import {clamp, easeOut, useCardMotion, useSans, useTheme} from '../ui';

/** Small spaced-caps label that sits at the top of a scene, below the 12% safe line. */
export const Tag: React.FC<{text: string}> = ({text}) => {
  const {frame, opacity} = useCardMotion(0, 8, 6);
  const {palette, mood} = useTheme();
  const sans = useSans();
  const rule = interpolate(frame, [4, 18], [0, 1], {...clamp, easing: easeOut});
  const dark = mood === 'dark';

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
          textShadow: dark ? '0 2px 14px rgba(0,0,0,0.5)' : 'none',
        }}
      >
        {text}
      </div>
      <div
        style={{
          height: 3,
          width: 150 * rule,
          borderRadius: 2,
          backgroundImage: dark ? roseGoldBright : roseGoldGradient,
          boxShadow: dark ? 'none' : `0 0 0 0 ${brand.white}`,
        }}
      />
    </div>
  );
};
