import React from 'react';
import {interpolate} from 'remotion';
import {Card} from '../glass';
import {MetalBox, MetalText} from '../metal';
import {clamp, easeOut, isEmphasis, serif, useCardMotion, useTheme} from '../ui';

type Props = {text: string; emphasis?: string[]};

/** Full-screen card with one bold line, words easing in. */
export const StatementCard: React.FC<Props> = ({text, emphasis}) => {
  const {opacity, translateY, scale, frame} = useCardMotion();
  const {palette} = useTheme();
  const words = text.split(' ');
  const rule = interpolate(frame, [6, 22], [0, 1], {...clamp, easing: easeOut});

  return (
    <div style={{transform: `translateY(${translateY}px) scale(${scale})`}}>
      <Card fade={opacity} radius={44} rim={3} seed={27} contentStyle={{padding: '64px 70px 66px 60px'}}>
        <MetalBox variant="deep" seed={28} style={{height: 7, width: 170 * rule, borderRadius: 4, marginBottom: 40}} />
        <div style={{fontFamily: serif, fontStyle: 'italic', fontWeight: 700, fontSize: 96, lineHeight: 1.1, color: palette.onCard}}>
          {words.map((w, i) => {
            const start = 8 + i * 4;
            const p = interpolate(frame, [start, start + 9], [0, 1], {...clamp, easing: easeOut});
            const common = {display: 'inline-block', marginRight: '0.26em', opacity: p, translate: `0px ${(1 - p) * 18}px`} as const;
            return isEmphasis(w, emphasis) ? (
              <MetalText key={i} variant="deep" seed={29 + i} style={{...common, fontStyle: 'italic'}}>
                {w}
              </MetalText>
            ) : (
              <span key={i} style={common}>
                {w}
              </span>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
