import React from 'react';
import {interpolate} from 'remotion';
import {Glass, useGlassMotion} from '../Glass';
import {colors, copperText, fonts} from '../theme';

type Props = {
  text: string;
  durationInFrames: number;
  quote?: boolean;
  top?: number;
  fontSize?: number;
};

/** Quote / statement card. Words ease in one at a time. */
export const QuoteCard: React.FC<Props> = ({text, durationInFrames, quote = true, top = 740, fontSize = 82}) => {
  const {frame} = useGlassMotion(durationInFrames);
  const words = text.split(' ');

  return (
    <Glass durationInFrames={durationInFrames} width={900} top={top} padding={56}>
      {quote && (
        <div
          style={{
            fontFamily: fonts.display,
            fontWeight: 700,
            fontSize: 190,
            lineHeight: 0.6,
            height: 84,
            filter: 'drop-shadow(0 0 20px rgba(233,176,138,0.55))',
            ...copperText,
          }}
        >
          {'“'}
        </div>
      )}
      <div
        style={{
          fontFamily: fonts.display,
          fontStyle: quote ? 'italic' : 'normal',
          fontWeight: 600,
          fontSize,
          lineHeight: 1.12,
          color: colors.white,
          textShadow: '0 2px 22px rgba(11,7,16,0.55)',
        }}
      >
        {words.map((w, i) => {
          const start = 10 + i * 4;
          const p = interpolate(frame, [start, start + 10], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          return (
            <span
              key={i}
              style={{
                display: 'inline-block',
                marginRight: '0.26em',
                opacity: p,
                transform: `translateY(${(1 - p) * 20}px)`,
              }}
            >
              {w}
            </span>
          );
        })}
      </div>
    </Glass>
  );
};
