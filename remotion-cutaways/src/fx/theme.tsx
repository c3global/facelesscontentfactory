import React from 'react';
import {staticFile} from 'remotion';
import {brand} from '../brand';
import {sansFamily} from '../fonts';

/**
 * The C3 skin for the UI-style effects (prompt bar, comment drop, and the batch after them).
 * Every effect reads its colors, card finish and brand mark from here, so a different skin is one swap:
 * the layout and motion of the effects stay as they are.
 * Palette follows src/brand.ts: crimson, white, black, charcoal, plus the metals. No cream.
 */
export const C3 = {
  sans: sansFamily('DM Sans'),
  /** light card (a text field, a posted comment) */
  card: brand.white,
  cardText: brand.charcoal,
  cardMuted: 'rgba(58,63,66,0.62)',
  cardShadow: '0 16px 44px rgba(0,0,0,0.5)',
  /** dark glass card (replies, panels) */
  glass: 'rgba(12,13,15,0.86)',
  glassText: brand.white,
  /** copper first: rose gold and copper carry the brand, gold is the secondary accent */
  hair: '1.5px solid rgba(224,138,87,0.85)',
  copperGrad: 'linear-gradient(135deg,#B5622C,#F4B08A 50%,#B5622C)',
  accent: brand.crimson,
  accentDeep: brand.crimsonDeep,
  gold: '#E3BF63',
  goldBright: '#FFF3C9',
  copper: '#E08A57',
} as const;

/** Dr. CK's orbital globe (public/brand/orbital-globe.png). `src` swaps in another icon file under public/; `src="drawn"` draws a plain line globe instead. */
export const GlobeIcon: React.FC<{size: number; color?: string; bg?: string; src?: string}> = ({size, color = C3.gold, bg = 'transparent', src = 'brand/orbital-globe.png'}) =>
  src !== 'drawn' ? (
    <img src={staticFile(src)} width={size} height={size} style={{display: 'block', objectFit: 'contain'}} />
  ) : (
    <svg width={size} height={size} viewBox="0 0 48 48" style={{display: 'block'}}>
      <circle cx="24" cy="24" r="22" fill={bg} />
      <g fill="none" stroke={color} strokeWidth="2.6" strokeLinecap="round">
        <circle cx="24" cy="24" r="17" />
        <ellipse cx="24" cy="24" rx="7.5" ry="17" />
        <path d="M7 24h34M10 15.5h28M10 32.5h28" />
      </g>
    </svg>
  );

/** a white avatar disc with a copper rim, for the brand mark on a dark card */
export const BrandAvatar: React.FC<{size: number; src?: string}> = ({size, src}) => (
  <div style={{flex: 'none', width: size, height: size, borderRadius: size / 2, background: '#fff', border: '2px solid #E08A57', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
    <GlobeIcon size={Math.round(size * 0.78)} src={src} />
  </div>
);

/** the up-arrow inside a send button */
export const SendArrow: React.FC<{size: number; color?: string}> = ({size, color = '#fff'}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{display: 'block'}}>
    <path d="M12 19V6M6.5 11.5L12 6l5.5 5.5" fill="none" stroke={color} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const CheckMark: React.FC<{size: number; color?: string}> = ({size, color = '#fff'}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{display: 'block'}}>
    <path d="M5.5 12.5l4.2 4.2L18.5 7.8" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const HeartIcon: React.FC<{size: number; fill?: string; stroke?: string}> = ({size, fill = C3.accent, stroke = 'none'}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{display: 'block'}}>
    <path d="M12 20.5s-7.5-4.6-9.2-9.4C1.7 7.8 3.6 4.5 7 4.5c2 0 3.4 1.1 5 3 1.6-1.9 3-3 5-3 3.4 0 5.3 3.3 4.2 6.6-1.7 4.8-9.2 9.4-9.2 9.4z" fill={fill} stroke={stroke} strokeWidth="1.6" />
  </svg>
);

export type Glyph = 'cut' | 'wave' | 'film' | 'text' | 'play' | 'globe';
const TONES = {
  charcoal: {bg: 'linear-gradient(145deg,#4a5054,#24282b)', fg: '#fff'},
  copper: {bg: 'linear-gradient(145deg,#F4B08A,#B5622C)', fg: '#2a1206'},
  crimson: {bg: 'linear-gradient(145deg,#E03A37,#8d1214)', fg: '#fff'},
  white: {bg: 'linear-gradient(145deg,#ffffff,#e4e6e7)', fg: '#3A3F42'},
} as const;
export type Tone = keyof typeof TONES;

/** A generic app tile (no third-party logos). `glyph: 'globe'` shows Dr. CK's mark on a white tile. */
export const AppIcon: React.FC<{size: number; glyph: Glyph; tone?: Tone; src?: string}> = ({size, glyph, tone = 'charcoal', src}) => {
  const t = TONES[glyph === 'globe' ? 'white' : tone];
  const sw = 3.2;
  return (
    <div style={{width: size, height: size, borderRadius: size * 0.23, background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 22px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.35)'}}>
      {glyph === 'globe' ? (
        <GlobeIcon size={size * 0.8} src={src} />
      ) : (
        <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 48 48" fill="none" stroke={t.fg} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
          {glyph === 'cut' && (
            <>
              <circle cx="14" cy="35" r="5" />
              <circle cx="34" cy="35" r="5" />
              <path d="M17.5 31.5L33 8M30.5 31.5L15 8" />
            </>
          )}
          {glyph === 'wave' && <path d="M8 22v4M15 14v20M22 8v32M29 16v16M36 12v24M42 20v8" />}
          {glyph === 'film' && (
            <>
              <rect x="7" y="9" width="34" height="30" rx="4" />
              <path d="M16 9v30M32 9v30M7 19h9M7 29h9M32 19h9M32 29h9" />
            </>
          )}
          {glyph === 'text' && <path d="M11 13h26M24 13v24" />}
          {glyph === 'play' && <path d="M17 11l20 13-20 13z" fill={t.fg} />}
        </svg>
      )}
    </div>
  );
};
