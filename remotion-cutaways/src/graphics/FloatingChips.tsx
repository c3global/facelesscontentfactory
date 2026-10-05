import React from 'react';
import {interpolate} from 'remotion';
import {brand, roseGoldGradient} from '../brand';
import {Card, clamp, easeOut, useCardMotion, useRel, useSans, useTheme} from '../ui';

type Props = {chips: Array<{text: string; at: number}>};

// Slots in absolute frame coordinates: they drift around her without covering the face (y < 640).
const SLOTS = [
  {x: 70, y: 720},
  {x: 560, y: 860},
  {x: 90, y: 1000},
  {x: 540, y: 1130},
  {x: 120, y: 790},
];

/** Labeled chips that drift around her. Used on full-bleed or inset layouts. */
export const FloatingChips: React.FC<Props> = ({chips}) => {
  const {opacity, frame} = useCardMotion(0, 4, 8);
  const rel = useRel();
  const sans = useSans();
  const {palette} = useTheme();

  return (
    <div style={{opacity}}>
      {chips.map((chip, i) => {
        const slot = SLOTS[i % SLOTS.length];
        const p = interpolate(frame - rel(chip.at), [0, 8], [0, 1], {...clamp, easing: easeOut});
        const dx = Math.sin((frame + i * 17) / 26) * 10;
        const dy = Math.cos((frame + i * 11) / 22) * 12;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: slot.x,
              top: slot.y,
              opacity: p,
              translate: `${dx}px ${dy + (1 - p) * 24}px`,
              scale: `${0.9 + p * 0.1}`,
            }}
          >
            <Card
              style={{
                borderRadius: 999,
                padding: '16px 34px 16px 26px',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
              }}
            >
              <div style={{width: 18, height: 18, borderRadius: '50%', backgroundImage: roseGoldGradient}} />
              <div style={{fontFamily: sans, fontWeight: 700, fontSize: 34, color: palette.onCard, whiteSpace: 'nowrap'}}>
                {chip.text}
              </div>
            </Card>
          </div>
        );
      })}
      <span style={{display: 'none'}}>{brand.white}</span>
    </div>
  );
};
