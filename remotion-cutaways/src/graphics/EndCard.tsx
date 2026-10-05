import React from 'react';
import {interpolate} from 'remotion';
import {Card} from '../glass';
import {MetalArrow, MetalBox} from '../metal';
import {SAFE, W} from '../layouts';
import {Label, clamp, easeOut, serif, useBgMetal, useCardMotion, useSans, useTheme} from '../ui';
import type {EndCard as EndCardPlan} from '../schema';

const CHARS_PER_SEC = 13;

const Typed: React.FC<{text: string; startFrame: number; size: number; upper?: boolean}> = ({text, startFrame, size, upper}) => {
  const {frame} = useCardMotion();
  const sans = useSans();
  const {palette} = useTheme();
  const shown = Math.max(0, Math.min(text.length, Math.floor(((frame - startFrame) / 30) * CHARS_PER_SEC)));
  const done = shown >= text.length;
  const caret = done ? Math.floor(frame / 14) % 2 === 0 : true;
  return (
    <span style={{fontFamily: sans, fontWeight: 700, fontSize: size, color: palette.onCard, letterSpacing: upper ? '0.12em' : 0}}>
      {(upper ? text.toUpperCase() : text).slice(0, shown)}
      <MetalBox
        variant="deep"
        seed={31}
        style={{display: 'inline-block', width: 6, height: size * 0.95, marginLeft: 6, verticalAlign: 'middle', opacity: caret ? 1 : 0, borderRadius: 3}}
      />
    </span>
  );
};

/** Closing card. Variants: link-pill, comment-keyword. Stays clear of the bottom 22% and right 12%. */
export const EndCard: React.FC<{card: EndCardPlan}> = ({card}) => {
  const {opacity, translateY, frame} = useCardMotion(0, 8, 6);
  const {palette} = useTheme();
  const metal = useBgMetal();
  const pillIn = interpolate(frame, [8, 20], [0, 1], {...clamp, easing: easeOut});
  const dark = palette.mood === 'dark';
  const top = 780;

  return (
    <div style={{position: 'absolute', left: 0, top, width: W, translate: `0px ${translateY}px`}}>
      <div style={{width: SAFE.right - 130, margin: '0 auto', textAlign: 'center'}}>
        {card.variant === 'link-pill' ? (
          <>
            <div style={{opacity}}>
              <Label onCard={false} size={36} style={{letterSpacing: '0.26em', textShadow: dark ? '0 2px 16px rgba(0,0,0,0.4)' : 'none'}}>
                {card.label}
              </Label>
              <div style={{display: 'flex', justifyContent: 'center', margin: '22px 0 10px'}}>
                <MetalArrow size={72} id="end-arrow" seed={32} variant={metal} style={{translate: `0px ${Math.sin(frame / 5) * 9}px`}} />
              </div>
            </div>
            <div style={{display: 'inline-block', scale: `${0.92 + pillIn * 0.08}`}}>
              <Card fade={pillIn * opacity} radius={999} rim={4.5} seed={33} contentStyle={{padding: '30px 56px', whiteSpace: 'nowrap'}}>
                <Typed text={card.url} startFrame={16} size={58} />
              </Card>
            </div>
          </>
        ) : (
          <>
            <div style={{fontFamily: serif, fontWeight: 600, fontStyle: 'italic', fontSize: 78, color: palette.onBg, textShadow: palette.shadow, marginBottom: 30, opacity}}>
              {card.prompt}
            </div>
            <div style={{display: 'inline-block', scale: `${0.92 + pillIn * 0.08}`}}>
              <Card fade={pillIn * opacity} radius={999} rim={4.5} seed={34} contentStyle={{padding: '30px 66px'}}>
                <Typed text={card.keyword} startFrame={18} size={66} upper />
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
