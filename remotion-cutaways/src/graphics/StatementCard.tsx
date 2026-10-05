import React from 'react';
import {interpolate} from 'remotion';
import {Card, clamp, easeOut, isEmphasis, metalText, serif, useCardMotion, useTheme} from '../ui';
import {roseGoldGradient} from '../brand';

type Props = {text: string; emphasis?: string[]};

/** Full-screen card with one bold line, words easing in. */
export const StatementCard: React.FC<Props> = ({text, emphasis}) => {
  const {opacity, translateY, scale, frame} = useCardMotion();
  const {palette} = useTheme();
  const words = text.split(' ');
  const rule = interpolate(frame, [6, 22], [0, 1], {...clamp, easing: easeOut});

  return (
    <div style={{opacity, transform: `translateY(${translateY}px) scale(${scale})`}}>
      <Card style={{padding: '64px 70px 66px 60px', borderRadius: 40}}>
        <div style={{height: 6, width: 150 * rule, borderRadius: 3, backgroundImage: roseGoldGradient, marginBottom: 40}} />
        <div style={{fontFamily: serif, fontWeight: 700, fontSize: 92, lineHeight: 1.1, color: palette.onCard}}>
          {words.map((w, i) => {
            const start = 8 + i * 4;
            const p = interpolate(frame, [start, start + 9], [0, 1], {...clamp, easing: easeOut});
            const em = isEmphasis(w, emphasis);
            const sheen = interpolate(frame, [start + 4, start + 26], [0, 1], clamp);
            return (
              <span
                key={i}
                style={{
                  display: 'inline-block',
                  marginRight: '0.26em',
                  opacity: p,
                  translate: `0px ${(1 - p) * 18}px`,
                  ...(em ? {fontStyle: 'italic', ...metalText('roseOnWhite', sheen > 0 && sheen < 1 ? sheen : undefined)} : {}),
                }}
              >
                {w}
              </span>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
