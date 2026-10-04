import React from 'react';
import {Easing, interpolate} from 'remotion';
import {Glass, neonCopperGlow, useGlassMotion} from '../Glass';
import {colors, copperText, fonts} from '../theme';

type Props = {
  value: number;
  unit: string;
  caption: string;
  durationInFrames: number;
  top?: number;
};

/** Big-number callout with a count-up. */
export const StatCallout: React.FC<Props> = ({value, unit, caption, durationInFrames, top = 760}) => {
  const {frame} = useGlassMotion(durationInFrames);
  const count = Math.round(
    interpolate(frame, [8, 40], [0, value], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.out(Easing.cubic),
    }),
  );
  const capIn = interpolate(frame, [30, 50], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <Glass durationInFrames={durationInFrames} width={820} top={top} padding={52}>
      <div style={{display: 'flex', alignItems: 'baseline', gap: 28}}>
        <div
          style={{
            fontFamily: fonts.display,
            fontWeight: 700,
            fontSize: 270,
            lineHeight: 0.9,
            filter: 'drop-shadow(0 0 22px rgba(233,176,138,0.55))',
            ...copperText,
          }}
        >
          {count}
        </div>
        <div
          style={{
            fontFamily: fonts.label,
            fontWeight: 700,
            fontSize: 46,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: colors.white,
            textShadow: neonCopperGlow,
          }}
        >
          {unit}
        </div>
      </div>
      <div
        style={{
          marginTop: 22,
          fontFamily: fonts.display,
          fontStyle: 'italic',
          fontWeight: 600,
          fontSize: 58,
          lineHeight: 1.1,
          color: colors.white,
          opacity: capIn,
          transform: `translateY(${(1 - capIn) * 18}px)`,
        }}
      >
        {caption}
      </div>
    </Glass>
  );
};
