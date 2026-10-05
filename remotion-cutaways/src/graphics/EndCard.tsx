import React from 'react';
import {interpolate} from 'remotion';
import {brand, roseGoldBright, roseGoldGradient} from '../brand';
import {SAFE, W} from '../layouts';
import {Label, clamp, easeOut, serif, useCardMotion, useSans, useTheme} from '../ui';
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
      <span
        style={{
          display: 'inline-block',
          width: 5,
          height: size * 0.95,
          marginLeft: 6,
          verticalAlign: 'middle',
          backgroundImage: roseGoldGradient,
          opacity: caret ? 1 : 0,
        }}
      />
    </span>
  );
};

const Arrow: React.FC<{frame: number}> = ({frame}) => (
  <svg width="64" height="64" viewBox="0 0 24 24" style={{translate: `0px ${Math.sin(frame / 5) * 9}px`}}>
    <path d="M12 4v15m0 0l-6-6m6 6l6-6" fill="none" stroke="url(#ar)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    <defs>
      <linearGradient id="ar" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#FBE3DE" />
        <stop offset="1" stopColor="#D48A8C" />
      </linearGradient>
    </defs>
  </svg>
);

/** Closing card. Variants: link-pill, comment-keyword. Stays clear of the bottom 22% and right 12%. */
export const EndCard: React.FC<{card: EndCardPlan}> = ({card}) => {
  const {opacity, translateY, frame} = useCardMotion(0, 8, 6);
  const {palette} = useTheme();
  const pillIn = interpolate(frame, [8, 20], [0, 1], {...clamp, easing: easeOut});
  const dark = palette.mood === 'dark';
  const top = 760;

  return (
    <div style={{position: 'absolute', left: 0, top, width: W, opacity, translate: `0px ${translateY}px`}}>
      <div style={{width: SAFE.right - 130, margin: '0 auto', textAlign: 'center'}}>
        {card.variant === 'link-pill' ? (
          <>
            <Label onCard={false} size={34} style={{letterSpacing: '0.26em', textShadow: dark ? '0 2px 16px rgba(0,0,0,0.4)' : 'none'}}>
              {card.label}
            </Label>
            <div style={{display: 'flex', justifyContent: 'center', margin: '22px 0 6px'}}>
              <Arrow frame={frame} />
            </div>
            <div
              style={{
                opacity: pillIn,
                scale: `${0.92 + pillIn * 0.08}`,
                margin: '0 auto',
                display: 'inline-block',
                background: brand.white,
                borderRadius: 999,
                padding: '30px 54px',
                border: '3px solid transparent',
                backgroundImage: `linear-gradient(#fff, #fff), ${roseGoldBright}`,
                backgroundOrigin: 'border-box',
                backgroundClip: 'padding-box, border-box',
                boxShadow: '0 28px 70px rgba(0,0,0,0.35), 0 0 40px rgba(240,185,180,0.35)',
                whiteSpace: 'nowrap',
              }}
            >
              <Typed text={card.url} startFrame={16} size={56} />
            </div>
          </>
        ) : (
          <>
            <div
              style={{
                fontFamily: serif,
                fontWeight: 600,
                fontStyle: 'italic',
                fontSize: 74,
                color: palette.onBg,
                textShadow: palette.shadow,
                marginBottom: 30,
              }}
            >
              {card.prompt}
            </div>
            <div
              style={{
                opacity: pillIn,
                scale: `${0.92 + pillIn * 0.08}`,
                display: 'inline-block',
                background: brand.white,
                borderRadius: 999,
                padding: '30px 64px',
                border: '3px solid transparent',
                backgroundImage: `linear-gradient(#fff, #fff), ${roseGoldBright}`,
                backgroundOrigin: 'border-box',
                backgroundClip: 'padding-box, border-box',
                boxShadow: '0 28px 70px rgba(0,0,0,0.35), 0 0 40px rgba(240,185,180,0.35)',
              }}
            >
              <Typed text={card.keyword} startFrame={18} size={64} upper />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
