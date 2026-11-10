import React from 'react';
import {interpolate} from 'remotion';
import {Card} from '../glass';
import {MetalGradient, MetalRim, MetalText} from '../metal';
import {SAFE} from '../layouts';
import {Label, clamp, easeOut, serif, useBgMetal, useCardMotion, useSans, useTheme} from '../ui';

type Props = {numeral: string; title: string; flowLabel?: string; flow: string[]};

/**
 * Chapter card for layout D: big metal numeral and title on the left (she sits in the top-right window),
 * and a small before / during / after flow card below. Coordinates are absolute in the frame.
 */
export const ChapterCard: React.FC<Props> = ({numeral, title, flowLabel, flow}) => {
  const {opacity, frame} = useCardMotion(0, 6, 8);
  const sans = useSans();
  const {palette} = useTheme();
  const metal = useBgMetal();
  const numP = interpolate(frame, [2, 14], [0, 1], {...clamp, easing: easeOut});
  const titleP = interpolate(frame, [8, 20], [0, 1], {...clamp, easing: easeOut});

  return (
    <div style={{opacity}}>
      <div style={{position: 'absolute', left: 70, top: SAFE.top + 10, opacity: numP, translate: `0px ${(1 - numP) * 24}px`}}>
        <MetalText
          variant={metal}
          seed={24}
          style={{display: 'block', fontFamily: serif, fontStyle: 'italic', fontWeight: 700, fontSize: 250, lineHeight: 1, filter: 'drop-shadow(0 6px 18px rgba(0,0,0,0.25))'}}
        >
          {numeral}
        </MetalText>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 76,
          top: SAFE.top + 285,
          width: 640,
          opacity: titleP,
          translate: `0px ${(1 - titleP) * 18}px`,
          fontFamily: serif, fontStyle: 'italic',
          fontWeight: 600,
          fontSize: 64,
          lineHeight: 1.1,
          color: palette.onBg,
          textShadow: palette.shadow,
        }}
      >
        {title}
      </div>
      <div style={{position: 'absolute', left: 60, top: 860, width: 960}}>
        <Card seed={25} contentStyle={{padding: '34px 40px 40px'}}>
          {flowLabel && <Label size={22}>{flowLabel}</Label>}
          <div style={{display: 'flex', alignItems: 'center', gap: 12, marginTop: flowLabel ? 22 : 0}}>
            {flow.map((step, i) => {
              const p = interpolate(frame - (14 + i * 9), [0, 7], [0, 1], {...clamp, easing: easeOut});
              return (
                <React.Fragment key={i}>
                  <div
                    style={{
                      position: 'relative',
                      flex: 1,
                      opacity: p,
                      translate: `0px ${(1 - p) * 18}px`,
                      borderRadius: 22,
                      padding: '24px 14px',
                      textAlign: 'center',
                      background: 'rgba(58,63,66,0.05)',
                      fontFamily: sans,
                      fontWeight: 700,
                      fontSize: 32,
                      color: palette.onCard,
                    }}
                  >
                    <MetalRim radius={22} thickness={2.5} variant="deep" seed={26 + i} />
                    {step}
                  </div>
                  {i < flow.length - 1 && (
                    <svg width="46" height="30" viewBox="0 0 46 30" style={{opacity: p, flexShrink: 0}}>
                      <defs>
                        <MetalGradient id={`flow-arrow-${i}`} x1={4} y1={15} x2={42} y2={15} variant="deep" seed={30 + i} />
                      </defs>
                      <path d="M4 15h34m-10-10l10 10-10 10" fill="none" stroke={`url(#flow-arrow-${i})`} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};
