import React from 'react';
import {interpolate} from 'remotion';
import {Glass, neonCopperGlow, useGlassMotion} from '../Glass';
import {colors, copperGradient, copperText, fonts} from '../theme';

type Props = {name: string; tag: string; durationInFrames: number; top?: number};

/** Lower-third name card. Left aligned, sits over the torso, clear of the face. */
export const NameCard: React.FC<Props> = ({name, tag, durationInFrames, top = 1130}) => {
  const {frame} = useGlassMotion(durationInFrames);
  const bar = interpolate(frame, [6, 26], [0, 1], {extrapolateRight: 'clamp'});
  const tagIn = interpolate(frame, [14, 30], [0, 1], {extrapolateRight: 'clamp'});

  return (
    <Glass durationInFrames={durationInFrames} width={640} left={64} top={top} padding={40} radius={36}>
      <div style={{display: 'flex', alignItems: 'stretch', gap: 28}}>
        <div
          style={{
            width: 7,
            borderRadius: 4,
            background: copperGradient,
            boxShadow: neonCopperGlow,
            transform: `scaleY(${bar})`,
            transformOrigin: 'top',
          }}
        />
        <div>
          <div
            style={{
              fontFamily: fonts.display,
              fontWeight: 700,
              fontSize: 104,
              lineHeight: 1,
              color: colors.white,
              letterSpacing: '-0.5px',
            }}
          >
            {name}
          </div>
          <div
            style={{
              marginTop: 16,
              fontFamily: fonts.label,
              fontWeight: 700,
              fontSize: 28,
              letterSpacing: '0.34em',
              textTransform: 'uppercase',
              opacity: tagIn,
              transform: `translateX(${(1 - tagIn) * -16}px)`,
              ...copperText,
            }}
          >
            {tag}
          </div>
        </div>
      </div>
    </Glass>
  );
};
