import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {colors, fonts, layout} from './theme';

const brightCopper: React.CSSProperties = {
  backgroundImage: 'linear-gradient(135deg, #F7D9C6 0%, #EFB892 50%, #F7D9C6 100%)',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
  WebkitTextFillColor: 'transparent',
};

export type CaptionWord = {w: string; s: number; e: number}; // seconds

type Props = {words: CaptionWord[][]};

/** Word-by-word captions. Each inner array is one on-screen chunk. Active word glows copper. */
export const Captions: React.FC<Props> = ({words}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const chunk = words.find((c) => t >= c[0].s - 0.04 && t <= c[c.length - 1].e + 0.18);
  if (!chunk) return null;

  const fade = interpolate(t, [chunk[0].s - 0.04, chunk[0].s + 0.08], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        left: 60,
        right: 60,
        top: layout.captionY,
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: '0 22px',
        opacity: fade,
      }}
    >
      {chunk.map((cw, i) => {
        const active = t >= cw.s && t <= cw.e + 0.05;
        return (
          <span
            key={i}
            style={{
              fontFamily: fonts.label,
              fontWeight: 700,
              fontSize: 64,
              letterSpacing: '0.01em',
              textTransform: 'uppercase',
              transform: `scale(${active ? 1.08 : 1})`,
              textShadow: '0 0 3px rgba(11,7,16,0.95), 0 3px 18px rgba(11,7,16,0.95)',
              ...(active
                ? {...brightCopper, textShadow: 'none', filter: 'drop-shadow(0 2px 3px rgba(11,7,16,0.95)) drop-shadow(0 0 12px rgba(233,176,138,0.55))'}
                : {color: colors.white}),
            }}
          >
            {cw.w}
          </span>
        );
      })}
    </div>
  );
};
