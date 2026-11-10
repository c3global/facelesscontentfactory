import React from 'react';
import {Easing, interpolate} from 'remotion';
import {Card} from '../glass';
import {MetalBox, MetalText} from '../metal';
import {clamp, easeOut, isEmphasis, serif, useCardMotion, useRel, useTheme} from '../ui';

type Props = {text: string; emphasis?: string[]; wordTimes?: number[]};

const pop = Easing.out(Easing.back(1.6));

/**
 * Full-screen card with one bold line. With `wordTimes` (absolute seconds, one per word) each word pops in exactly
 * when she says it, so the card becomes the caption and never runs ahead of her voice. Long lines shrink to fit.
 */
export const StatementCard: React.FC<Props> = ({text, emphasis, wordTimes}) => {
  const {opacity, translateY, frame} = useCardMotion();
  const rel = useRel();
  const {palette} = useTheme();
  const words = text.split(' ');
  const rule = interpolate(frame, [6, 22], [0, 1], {...clamp, easing: easeOut});
  const size = words.length <= 5 ? 96 : words.length <= 8 ? 86 : words.length <= 12 ? 74 : 64;
  // the card itself pops in with a small overshoot
  const cardPop = interpolate(frame, [0, 10], [0.9, 1], {...clamp, easing: pop});

  return (
    <div style={{transform: `translateY(${translateY}px) scale(${cardPop})`}}>
      <Card fade={opacity} radius={44} rim={3} seed={27} contentStyle={{padding: '64px 70px 66px 60px'}}>
        <MetalBox kind="gold" variant="deep" seed={28} style={{height: 7, width: 170 * rule, borderRadius: 4, marginBottom: 40}} />
        <div style={{fontFamily: serif, fontStyle: 'italic', fontWeight: 700, fontSize: size, lineHeight: 1.1, color: palette.onCard}}>
          {words.map((w, i) => {
            const start = wordTimes && wordTimes[i] !== undefined ? rel(wordTimes[i]) : 8 + i * 4;
            const p = interpolate(frame, [start, start + 8], [0, 1], {...clamp, easing: pop});
            const o = interpolate(frame, [start, start + 4], [0, 1], clamp);
            const common = {display: 'inline-block', marginRight: '0.26em', opacity: o, translate: `0px ${(1 - p) * 22}px`, scale: `${0.86 + p * 0.14}`} as const;
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
