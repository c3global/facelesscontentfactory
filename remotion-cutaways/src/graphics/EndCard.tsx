import React from 'react';
import {interpolate} from 'remotion';
import {brand} from '../brand';
import {MetalArrow} from '../metal';
import {SAFE, W} from '../layouts';
import {Label, clamp, easeOut, serif, useBgMetal, useCardMotion, useSans, useTheme} from '../ui';
import type {EndCard as EndCardPlan} from '../schema';

const CHARS_PER_SEC = 24;

/**
 * The single crimson accent of the end scene. White text only, no metal over it:
 * the rim is a thin white specular edge, the caret is white.
 */
const CrimsonPill: React.FC<{fade: number; padding: string; children: React.ReactNode}> = ({fade, padding, children}) => (
  <div
    style={{
      position: 'relative',
      display: 'inline-block',
      borderRadius: 999,
      background: brand.crimson,
      opacity: fade,
      padding,
      whiteSpace: 'nowrap',
      boxShadow:
        'inset 0 2px 0 rgba(255,255,255,0.5), inset 0 -12px 22px rgba(0,0,0,0.28), inset 0 0 0 1.5px rgba(255,255,255,0.38), 0 26px 60px rgba(0,0,0,0.55)',
    }}
  >
    <div
      style={{
        position: 'absolute',
        left: '6%',
        right: '6%',
        top: 0,
        height: '46%',
        borderRadius: 999,
        background: 'linear-gradient(180deg, rgba(255,255,255,0.28), rgba(255,255,255,0))',
        pointerEvents: 'none',
      }}
    />
    <div style={{position: 'relative'}}>{children}</div>
  </div>
);

const Typed: React.FC<{text: string; startFrame: number; size: number; upper?: boolean}> = ({text, startFrame, size, upper}) => {
  const {frame} = useCardMotion();
  const sans = useSans();
  const shown = Math.max(0, Math.min(text.length, Math.floor(((frame - startFrame) / 30) * CHARS_PER_SEC)));
  const done = shown >= text.length;
  const caret = done ? Math.floor(frame / 14) % 2 === 0 : true;
  return (
    <span style={{fontFamily: sans, fontWeight: 700, fontSize: size, color: brand.white, letterSpacing: upper ? '0.12em' : 0}}>
      {(upper ? text.toUpperCase() : text).slice(0, shown)}
      <span
        style={{
          display: 'inline-block',
          width: 6,
          height: size * 0.95,
          marginLeft: 6,
          verticalAlign: 'middle',
          opacity: caret ? 1 : 0,
          borderRadius: 3,
          background: brand.white,
        }}
      />
    </span>
  );
};

/** Closing card on the black field. Variants: link-pill, comment-keyword. Clear of the bottom 22% and right 12%. */
export const EndCard: React.FC<{card: EndCardPlan}> = ({card}) => {
  const {opacity, translateY, frame} = useCardMotion(0, 8, 6);
  const {palette} = useTheme();
  const metal = useBgMetal();
  const pillIn = interpolate(frame, [8, 20], [0, 1], {...clamp, easing: easeOut});
  const top = 780;

  return (
    <div style={{position: 'absolute', left: 0, top, width: W, translate: `0px ${translateY}px`}}>
      <div style={{width: SAFE.right - 130, margin: '0 auto', textAlign: 'center'}}>
        {card.variant === 'link-pill' ? (
          <>
            <div style={{opacity}}>
              <Label onCard={false} size={36} style={{letterSpacing: '0.26em'}}>
                {card.label}
              </Label>
              <div style={{display: 'flex', justifyContent: 'center', margin: '22px 0 10px'}}>
                <MetalArrow size={72} id="end-arrow" seed={32} variant={metal} style={{translate: `0px ${Math.sin(frame / 5) * 9}px`}} />
              </div>
            </div>
            <div style={{display: 'inline-block', scale: `${0.92 + pillIn * 0.08}`}}>
              <CrimsonPill fade={pillIn * opacity} padding="30px 56px">
                <Typed text={card.url} startFrame={10} size={58} />
              </CrimsonPill>
            </div>
          </>
        ) : (
          <>
            <div style={{fontFamily: serif, fontWeight: 600, fontStyle: 'italic', fontSize: 78, color: palette.onBg, marginBottom: 30, opacity}}>
              {card.prompt}
            </div>
            <div style={{display: 'inline-block', scale: `${0.92 + pillIn * 0.08}`}}>
              <CrimsonPill fade={pillIn * opacity} padding="30px 66px">
                <Typed text={card.keyword} startFrame={18} size={66} upper />
              </CrimsonPill>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
