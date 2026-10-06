import React from 'react';
import {interpolate} from 'remotion';
import {Card} from '../glass';
import {MetalBox} from '../metal';
import {clamp, easeOut, useCardMotion, useRel, useSans, useTheme} from '../ui';

type Props = {chips: Array<{text: string; at: number}>; mode: 'float' | 'stack'};

// Slots in absolute frame coordinates: they drift around her without covering the face (y < 640).
const SLOTS = [
  {x: 70, y: 720},
  {x: 560, y: 860},
  {x: 90, y: 1000},
  {x: 540, y: 1130},
  {x: 120, y: 790},
];

/** Labeled chips that drift around her. Used on full-bleed or inset layouts. */
export const FloatingChips: React.FC<Props> = ({chips, mode}) => {
  const {opacity, frame} = useCardMotion(0, 4, 8);
  const rel = useRel();
  const sans = useSans();
  const {palette} = useTheme();

  if (mode === 'stack') {
    return (
      <div style={{position: 'absolute', left: 0, top: 640, width: 1080, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 44}}>
        {chips.map((chip, i) => {
          const p = interpolate(frame - rel(chip.at), [0, 9], [0, 1], {...clamp, easing: easeOut});
          const dy = Math.cos((frame + i * 11) / 24) * 8;
          return (
            <div key={i} style={{translate: `0px ${dy + (1 - p) * 30}px`, scale: `${0.9 + p * 0.1}`}}>
              <Card fade={p * opacity} radius={999} seed={18 + i} contentStyle={{padding: '24px 54px 24px 40px', display: 'flex', alignItems: 'center', gap: 22}}>
                <MetalBox variant="deep" seed={22 + i} style={{width: 30, height: 30, borderRadius: '50%'}} />
                <div style={{fontFamily: sans, fontWeight: 700, fontSize: 52, color: palette.onCard, whiteSpace: 'nowrap', letterSpacing: '-0.01em'}}>{chip.text}</div>
              </Card>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div>
      {chips.map((chip, i) => {
        const slot = SLOTS[i % SLOTS.length];
        const p = interpolate(frame - rel(chip.at), [0, 8], [0, 1], {...clamp, easing: easeOut});
        const dx = Math.sin((frame + i * 17) / 26) * 10;
        const dy = Math.cos((frame + i * 11) / 22) * 12;
        return (
          <div key={i} style={{position: 'absolute', left: slot.x, top: slot.y, translate: `${dx}px ${dy + (1 - p) * 24}px`, scale: `${0.9 + p * 0.1}`}}>
            <Card fade={p * opacity} radius={999} seed={18 + i} contentStyle={{padding: '16px 34px 16px 26px', display: 'flex', alignItems: 'center', gap: 14}}>
              <MetalBox variant="deep" seed={22 + i} style={{width: 20, height: 20, borderRadius: '50%'}} />
              <div style={{fontFamily: sans, fontWeight: 700, fontSize: 34, color: palette.onCard, whiteSpace: 'nowrap'}}>{chip.text}</div>
            </Card>
          </div>
        );
      })}
    </div>
  );
};
