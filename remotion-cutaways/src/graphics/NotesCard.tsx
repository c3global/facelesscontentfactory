import React from 'react';
import {interpolate} from 'remotion';
import {Card} from '../glass';
import {MetalCheck} from '../metal';
import {Label, clamp, easeOut, serif, useCardMotion, useRel, useSans, useTheme} from '../ui';

type Props = {label: string; title: string; items: Array<{text: string; at: number; checkAfter?: number}>};

/** A notes app card: italic Playfair title, lines that arrive one by one, check marks that draw themselves. */
export const NotesCard: React.FC<Props> = ({label, title, items}) => {
  const {opacity, frame, translateY} = useCardMotion(0, 6, 6);
  const rel = useRel();
  const sans = useSans();
  const {palette} = useTheme();
  return (
    <div style={{translate: `0px ${translateY}px`}}>
      <Card fade={opacity} radius={52} rim={3} seed={61} contentStyle={{padding: '30px 44px 34px'}}>
        <Label onCard size={24}>
          {label}
        </Label>
        <div style={{fontFamily: serif, fontStyle: 'italic', fontWeight: 700, fontSize: 56, lineHeight: 1.08, color: palette.onCard, margin: '10px 0 18px'}}>{title}</div>
        <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
          {items.map((it, i) => {
            const p = interpolate(frame - rel(it.at), [0, 8], [0, 1], {...clamp, easing: easeOut});
            const check = it.checkAfter === undefined ? 0 : interpolate(frame - rel(it.at) - it.checkAfter * 30, [0, 12], [0, 1], {...clamp, easing: easeOut});
            return (
              <div key={i} style={{display: 'flex', alignItems: 'center', gap: 18, opacity: p, translate: `${(1 - p) * 18}px 0px`}}>
                <div style={{width: 40, height: 40, flexShrink: 0}}>
                  <MetalCheck size={40} id={`notes-check-${i}`} seed={90 + i} progress={check} />
                </div>
                <div style={{fontFamily: sans, fontWeight: 700, fontSize: 36, color: palette.onCard, letterSpacing: '-0.01em'}}>{it.text}</div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
