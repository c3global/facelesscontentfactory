import React from 'react';
import {interpolate} from 'remotion';
import {brand} from '../brand';
import {Card} from '../glass';
import {MetalText} from '../metal';
import {Label, clamp, easeOut, isEmphasis, serif, useCardMotion, useRel, useTheme} from '../ui';

type Props = {label: string; line: string; emphasis?: string[]; strikeAt?: number};

/** Words with a strike line that draws across them left to right (measured: ~4 frames total). */
export const StruckLine: React.FC<{
  text: string;
  size: number;
  progress: number; // 0..1 strike progress
  dim: number; // 0..1 how much the struck text dims
  color: string;
}> = ({text, size, progress, dim, color}) => {
  const words = text.split(' ');
  return (
    <div
      style={{
        fontFamily: serif, fontStyle: 'italic',
        fontWeight: 600,
        fontSize: size,
        lineHeight: 1.12,
        letterSpacing: '-0.01em',
        color,
        opacity: 1 - dim * 0.45,
      }}
    >
      {words.map((w, i) => {
        const p = Math.min(1, Math.max(0, progress * words.length - i));
        return (
          <span key={i} style={{position: 'relative', display: 'inline-block', marginRight: '0.28em'}}>
            {w}
            <span
              style={{
                position: 'absolute',
                left: -4,
                top: '54%',
                height: Math.max(4, size * 0.06),
                width: `calc(${p} * (100% + ${i < words.length - 1 ? '0.28em' : '0px'}) + 8px)`,
                background: brand.crimson,
                borderRadius: 4,
              }}
            />
          </span>
        );
      })}
    </div>
  );
};

export const EmphasisLine: React.FC<{
  text: string;
  emphasis?: string[];
  size: number;
  color: string;
  weight?: number;
  seed?: number;
}> = ({text, emphasis, size, color, weight = 700, seed = 3}) => {
  const words = text.split(' ');
  return (
    <div style={{fontFamily: serif, fontStyle: 'italic', fontWeight: weight, fontSize: size, lineHeight: 1.12, color}}>
      {words.map((w, i) =>
        isEmphasis(w, emphasis) ? (
          <MetalText key={i} variant="deep" seed={seed + i} style={{display: 'inline-block', marginRight: '0.26em', fontStyle: 'italic', fontSize: size * 1.12}}>
            {w}
          </MetalText>
        ) : (
          <span key={i} style={{display: 'inline-block', marginRight: '0.26em'}}>
            {w}
          </span>
        ),
      )}
    </div>
  );
};

export const HeadlineCard: React.FC<Props> = ({label, line, emphasis, strikeAt}) => {
  const {opacity, translateY, scale, frame} = useCardMotion();
  const rel = useRel();
  const {palette} = useTheme();
  const strikeFrame = strikeAt !== undefined ? rel(strikeAt) : 1_000_000;
  const strike = interpolate(frame, [strikeFrame, strikeFrame + 5], [0, 1], {...clamp, easing: easeOut});
  const dim = interpolate(frame, [strikeFrame, strikeFrame + 8], [0, 1], clamp);

  return (
    <div style={{transform: `translateY(${translateY}px) scale(${scale})`}}>
      <Card fade={opacity} seed={2} contentStyle={{padding: '46px 70px 54px 56px'}}>
        <Label>{label}</Label>
        <div style={{height: 22}} />
        {strikeAt !== undefined ? (
          <StruckLine text={line} size={68} progress={strike} dim={dim} color={palette.onCard} />
        ) : (
          <EmphasisLine text={line} emphasis={emphasis} size={84} color={palette.onCard} />
        )}
      </Card>
    </div>
  );
};
