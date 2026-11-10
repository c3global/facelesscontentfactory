import React from 'react';
import {interpolate} from 'remotion';
import {brand} from '../brand';
import {Card} from '../glass';
import {MetalBox} from '../metal';
import {Label, clamp, easeOut, useBgMetal, useCardMotion, useRel, useSans, useTheme} from '../ui';

type Props = {
  items: Array<{app: string; text: string; at: number}>;
  badgeLabel: string;
  zoom: number;
};

const Bell: React.FC<{size?: number}> = ({size = 34}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={brand.white} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9a6 6 0 1 1 12 0c0 6 2.5 7.5 2.5 7.5h-17S6 15 6 9z" />
    <path d="M10 20a2 2 0 0 0 4 0" />
  </svg>
);

/** Cards drop in one by one; the badge counts up with each (measured: 5-frame fade, ~0.45s apart). */
export const NotificationStack: React.FC<Props> = ({items, badgeLabel, zoom}) => {
  const {opacity, frame} = useCardMotion(0, 4, 6);
  const rel = useRel();
  const sans = useSans();
  const metal = useBgMetal();
  const {palette} = useTheme();
  const count = items.filter((it) => frame >= rel(it.at)).length;
  const lastAt = Math.max(0, ...items.filter((it) => frame >= rel(it.at)).map((it) => rel(it.at)));
  const bump = interpolate(frame - lastAt, [0, 4, 9], [1, 1.22, 1], clamp);

  return (
    <div style={{zoom, width: 960 / zoom, position: 'relative'}}>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, padding: '0 6px', opacity}}>
        <Label onCard={false} size={26}>
          Notifications
        </Label>
        <MetalBox
          variant={metal}
          seed={7}
          style={{
            transform: `scale(${bump})`,
            color: metal === 'bright' ? brand.charcoal : brand.white,
            fontFamily: sans,
            fontWeight: 700,
            fontSize: 28,
            padding: '8px 22px',
            borderRadius: 999,
            boxShadow: '0 6px 16px rgba(0,0,0,0.22)',
          }}
        >
          +{count} {badgeLabel}
        </MetalBox>
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 18}}>
        {items.map((it, i) => {
          const p = interpolate(frame - rel(it.at), [0, 6], [0, 1], {...clamp, easing: easeOut});
          if (p <= 0) return null;
          return (
            <div key={i} style={{translate: `0px ${(1 - p) * -26}px`}}>
              <Card fade={p * opacity} radius={28} seed={8 + i} contentStyle={{padding: '26px 34px', display: 'flex', alignItems: 'center', gap: 26}}>
                <MetalBox
                  variant="deep"
                  seed={20 + i}
                  style={{width: 68, height: 68, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}
                >
                  <Bell />
                </MetalBox>
                <div style={{minWidth: 0}}>
                  <Label size={20}>{it.app}</Label>
                  <div style={{fontFamily: sans, fontWeight: 500, fontSize: 34, color: palette.onCard, marginTop: 6, lineHeight: 1.2}}>{it.text}</div>
                </div>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
};
