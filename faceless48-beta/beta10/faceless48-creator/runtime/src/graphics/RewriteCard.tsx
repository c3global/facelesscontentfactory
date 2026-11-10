import React, {useLayoutEffect, useRef, useState} from 'react';
import {interpolate} from 'remotion';
import {Card} from '../glass';
import {MetalCheck, MetalText} from '../metal';
import {Label, clamp, easeOut, isEmphasis, serif, useCardMotion, useRel, useTheme} from '../ui';
import {StruckLine} from './HeadlineCard';

type Props = {
  label: string;
  oldLine: string;
  newLine: string;
  emphasis?: string[];
  struckAtStart: boolean;
  strikeAt?: number;
  writeAt: number;
  writeSeconds: number;
};

const NEW_SIZE = 76;

/**
 * Old text struck through, then the new line writes in beneath it word by word.
 * The card is sized to its text: the new-line area starts at one line high and grows as the line wraps in,
 * so there is never a tall empty card.
 */
export const RewriteCard: React.FC<Props> = ({label, oldLine, newLine, emphasis, struckAtStart, strikeAt, writeAt, writeSeconds}) => {
  const {opacity, translateY, scale, frame} = useCardMotion();
  const rel = useRel();
  const {palette} = useTheme();
  const textRef = useRef<HTMLDivElement>(null);
  const [fullH, setFullH] = useState(NEW_SIZE * 1.2);

  useLayoutEffect(() => {
    if (textRef.current) setFullH(textRef.current.scrollHeight);
  }, [newLine, emphasis]);

  const sf = strikeAt !== undefined ? rel(strikeAt) : 0;
  const strike = struckAtStart ? 1 : interpolate(frame, [sf, sf + 5], [0, 1], {...clamp, easing: easeOut});
  const dim = struckAtStart ? 1 : interpolate(frame, [sf, sf + 8], [0, 1], clamp);

  const wf = rel(writeAt);
  const total = Math.round(writeSeconds * 30);
  const words = newLine.split(' ');
  const progress = interpolate(frame, [wf, wf + total], [0, 1], clamp);
  const oneLine = NEW_SIZE * 1.2;
  const areaH = oneLine + (fullH - oneLine) * easeOut(Math.min(1, progress * 1.15));
  const check = interpolate(frame, [wf + total, wf + total + 14], [0, 1], {...clamp, easing: easeOut});

  return (
    <div style={{transform: `translateY(${translateY}px) scale(${scale})`}}>
      <Card fade={opacity} seed={4} contentStyle={{padding: '46px 70px 50px 56px'}}>
        <Label>{label}</Label>
        <div style={{height: 20}} />
        <StruckLine text={oldLine} size={62} progress={strike} dim={dim} color={palette.onCard} />
        <div style={{height: 30}} />
        <div style={{display: 'flex', alignItems: 'flex-start', gap: 20}}>
          <div style={{flex: 1, height: areaH, overflow: 'hidden'}}>
            <div ref={textRef} style={{fontFamily: serif, fontStyle: 'italic', fontWeight: 700, fontSize: NEW_SIZE, lineHeight: 1.12, color: palette.onCard}}>
              {words.map((w, i) => {
                const start = wf + (i / words.length) * total;
                const p = interpolate(frame, [start, start + 8], [0, 1], {...clamp, easing: easeOut});
                const common = {display: 'inline-block', marginRight: '0.26em', opacity: p, translate: `0px ${(1 - p) * 16}px`} as const;
                return isEmphasis(w, emphasis) ? (
                  <MetalText key={i} variant="deep" seed={5 + i} style={{...common, fontStyle: 'italic', fontSize: NEW_SIZE * 1.1}}>
                    {w}
                  </MetalText>
                ) : (
                  <span key={i} style={common}>
                    {w}
                  </span>
                );
              })}
            </div>
          </div>
          <div style={{opacity: check, flexShrink: 0, alignSelf: 'flex-end', marginBottom: 6}}>
            <MetalCheck size={78} id="rewrite-check" seed={6} progress={check} />
          </div>
        </div>
      </Card>
    </div>
  );
};
