import React from 'react';
import {interpolate} from 'remotion';
import {roseGoldBright, roseGoldGradient} from '../brand';
import {SAFE} from '../layouts';
import {Card, Label, clamp, easeOut, metalText, serif, useCardMotion, useSans, useTheme} from '../ui';

type Props = {numeral: string; title: string; flowLabel?: string; flow: string[]};

/**
 * Chapter card for layout D: big numeral and title on the left (she sits in the top-right window),
 * and a small before / during / after flow card below. Coordinates are absolute in the frame.
 */
export const ChapterCard: React.FC<Props> = ({numeral, title, flowLabel, flow}) => {
  const {opacity, frame} = useCardMotion(0, 6, 8);
  const sans = useSans();
  const {palette, mood} = useTheme();
  const numP = interpolate(frame, [2, 14], [0, 1], {...clamp, easing: easeOut});
  const titleP = interpolate(frame, [8, 20], [0, 1], {...clamp, easing: easeOut});
  const sheen = interpolate(frame, [10, 34], [0, 1], clamp);
  void roseGoldBright;
  void roseGoldGradient;

  return (
    <div style={{opacity}}>
      <div style={{position: 'absolute', left: 70, top: SAFE.top + 10, opacity: numP, translate: `0px ${(1 - numP) * 24}px`}}>
        <div
          style={{
            fontFamily: serif,
            fontWeight: 700,
            fontSize: 250,
            lineHeight: 1,
            filter: 'drop-shadow(0 6px 18px rgba(0,0,0,0.25))',
            ...metalText(palette.brightMetal ? 'roseBright' : 'rose', sheen > 0 && sheen < 1 ? sheen : undefined),
          }}
        >
          {numeral}
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 76,
          top: SAFE.top + 285,
          width: 640,
          opacity: titleP,
          translate: `0px ${(1 - titleP) * 18}px`,
          fontFamily: serif,
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
        <Card style={{padding: '34px 40px 40px'}}>
          {flowLabel && <Label size={22}>{flowLabel}</Label>}
          <div style={{display: 'flex', alignItems: 'center', gap: 12, marginTop: flowLabel ? 22 : 0}}>
            {flow.map((step, i) => {
              const p = interpolate(frame - (14 + i * 9), [0, 7], [0, 1], {...clamp, easing: easeOut});
              return (
                <React.Fragment key={i}>
                  <div
                    style={{
                      flex: 1,
                      opacity: p,
                      translate: `0px ${(1 - p) * 18}px`,
                      borderRadius: 22,
                      padding: '24px 14px',
                      textAlign: 'center',
                      background: 'rgba(58,63,66,0.05)',
                      border: '2px solid rgba(183,110,121,0.5)',
                      fontFamily: sans,
                      fontWeight: 700,
                      fontSize: 32,
                      color: palette.onCard,
                    }}
                  >
                    {step}
                  </div>
                  {i < flow.length - 1 && (
                    <svg width="46" height="30" viewBox="0 0 46 30" style={{opacity: p, flexShrink: 0}}>
                      <path d="M4 15h34m-10-10l10 10-10 10" fill="none" stroke="#B76E79" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </Card>
      </div>
      <span style={{display: 'none'}}>{mood}</span>
    </div>
  );
};
