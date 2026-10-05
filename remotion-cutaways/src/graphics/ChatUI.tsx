import React from 'react';
import {interpolate} from 'remotion';
import {brand} from '../brand';
import {Card} from '../glass';
import {MetalBox} from '../metal';
import {Label, clamp, easeOut, serif, useBgMetal, useCardMotion, useRel, useSans, useTheme} from '../ui';

type Props = {
  title: string;
  items: Array<{channel: string; text: string; at: number}>;
  badgeLabel: string;
  zoom: number;
};

/** Mock inbox that builds row by row, with a counting unread badge. Generic text only. */
export const ChatUI: React.FC<Props> = ({title, items, badgeLabel, zoom}) => {
  const {opacity, translateY, scale, frame} = useCardMotion();
  const rel = useRel();
  const sans = useSans();
  const {palette} = useTheme();
  void useBgMetal;
  const count = items.filter((it) => frame >= rel(it.at)).length;
  const lastAt = Math.max(0, ...items.filter((it) => frame >= rel(it.at)).map((it) => rel(it.at)));
  const bump = interpolate(frame - lastAt, [0, 4, 9], [1, 1.2, 1], clamp);

  return (
    <div style={{zoom, width: 960 / zoom, transform: `translateY(${translateY}px) scale(${scale})`}}>
      <Card fade={opacity} seed={9} contentStyle={{padding: '28px 44px 22px'}}>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <div style={{fontFamily: serif, fontWeight: 700, fontSize: 48, color: palette.onCard}}>{title}</div>
          <MetalBox
            variant="deep"
            seed={11}
            style={{transform: `scale(${bump})`, color: brand.white, fontFamily: sans, fontWeight: 700, fontSize: 26, padding: '8px 22px', borderRadius: 999}}
          >
            {count} {badgeLabel}
          </MetalBox>
        </div>
        <MetalBox variant="deep" seed={12} style={{height: 3, margin: '16px 0 4px', borderRadius: 2}} />
        {items.map((it, i) => {
          const p = interpolate(frame - rel(it.at), [0, 6], [0, 1], {...clamp, easing: easeOut});
          return (
            <div
              key={i}
              style={{
                opacity: p,
                translate: `${(1 - p) * 40}px 0px`,
                display: 'flex',
                alignItems: 'center',
                gap: 24,
                padding: '16px 0',
                borderBottom: i < items.length - 1 ? '1.5px solid rgba(58,63,66,0.1)' : 'none',
              }}
            >
              <MetalBox variant="deep" seed={13 + i} style={{width: 18, height: 18, borderRadius: '50%', flexShrink: 0}} />
              <div style={{minWidth: 0}}>
                <Label size={19}>{it.channel}</Label>
                <div style={{fontFamily: sans, fontWeight: 500, fontSize: 33, color: palette.onCard, marginTop: 4, lineHeight: 1.2}}>{it.text}</div>
              </div>
            </div>
          );
        })}
      </Card>
    </div>
  );
};
