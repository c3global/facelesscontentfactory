import React from 'react';
import {MetalRim} from './metal';
import {useTheme} from './ui';

/**
 * Liquid glass.
 *
 * Built from: backdrop blur with a saturation lift, a thin bright specular edge, an inner highlight on the
 * top edge, a soft inner shadow on the bottom edge, a faint metallic rose gold rim, and (clear glass only)
 * a subtle refraction from an SVG displacement filter applied through backdrop-filter. Chromium renders
 * backdrop-filter: url(#...) in headless renders, so the refraction survives a real render.
 *
 * Frosted glass (more blur, more opacity) is for any card with body copy. Clear glass is for her video
 * window, the caption pill and decorative elements.
 *
 * Important: backdrop-filter only sees what is behind it when no ancestor has opacity < 1. That is why
 * fades are applied to the glass surface itself (`fade`) and to the content separately, never to a wrapper.
 */
export const RefractDefs: React.FC = () => (
  <svg width="0" height="0" style={{position: 'absolute', pointerEvents: 'none'}} aria-hidden>
    <defs>
      <filter id="c3-refract" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="0.011 0.018" numOctaves="2" seed="4" result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale="18" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </defs>
  </svg>
);

type Variant = 'frosted' | 'clear';
type Tone = 'light' | 'dark';

const recipe = (variant: Variant, tone: Tone, refract: boolean, onDark: boolean, darkAlpha?: number) => {
  if (variant === 'frosted') {
    // cards with body copy: higher blur and opacity so the text stays legible on any field
    return tone === 'light'
      ? {filter: 'blur(34px) brightness(1.02)', bg: onDark ? 'rgba(255,255,255,0.985)' : 'rgba(255,255,255,0.92)'}
      : {filter: 'blur(30px) saturate(1.4)', bg: 'rgba(0,0,0,0.52)'};
  }
  const lens = refract ? 'url(#c3-refract) ' : '';
  return tone === 'light'
    ? {
        filter: `${lens}blur(9px) saturate(1.9) brightness(1.05)`,
        bg: 'linear-gradient(135deg, rgba(255,255,255,0.6), rgba(255,255,255,0.14) 52%, rgba(58,63,66,0.12))',
      }
    : {
        filter: `${lens}blur(12px) saturate(1.5)`,
        bg: darkAlpha !== undefined ? `rgba(0,0,0,${darkAlpha})` : 'linear-gradient(135deg, rgba(0,0,0,0.5), rgba(0,0,0,0.34))',
      };
};

export const GlassSurface: React.FC<{
  variant?: Variant;
  tone?: Tone;
  radius: number | string;
  fade?: number;
  refract?: boolean;
  rim?: number;
  rimVariant?: 'deep' | 'bright';
  seed?: number;
  elevated?: boolean;
  /** dark clear glass only: solid black tint alpha (use over video so nothing chromatic shows through) */
  darkAlpha?: number;
}> = ({variant = 'frosted', tone = 'light', radius, fade = 1, refract = false, rim = 2.5, rimVariant, seed = 1, elevated = true, darkAlpha}) => {
  const {mood} = useTheme();
  const r = recipe(variant, tone, refract, mood === 'dark', darkAlpha);
  const rv = rimVariant ?? (mood === 'dark' ? 'bright' : 'deep');
  const lightTone = tone === 'light';
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius: radius,
        overflow: 'hidden',
        opacity: fade,
        background: r.bg,
        backdropFilter: r.filter,
        WebkitBackdropFilter: r.filter,
        boxShadow: [
          `inset 0 1.5px 0 rgba(255,255,255,${lightTone ? 0.95 : 0.55})`, // inner highlight, top edge
          `inset 0 -${variant === 'clear' ? 18 : 12}px ${variant === 'clear' ? 30 : 22}px rgba(${lightTone ? '58,63,66' : '0,0,0'},${lightTone ? (variant === 'clear' ? 0.2 : 0.1) : 0.28})`, // soft inner shadow, bottom edge
          `inset 0 0 0 1px rgba(255,255,255,${lightTone ? 0.7 : 0.3})`, // thin bright specular edge
          variant === 'clear' ? `inset 2px 0 0 rgba(255,255,255,${lightTone ? 0.75 : 0.3}), inset -2px 0 6px rgba(${lightTone ? '58,63,66' : '0,0,0'},0.16)` : '', // left bevel highlight, right bevel shade
          elevated ? `0 28px 64px rgba(${mood === 'dark' ? '0,0,0' : '58,63,66'},${mood === 'dark' ? 0.34 : 0.24})` : '',
          elevated ? '0 3px 9px rgba(0,0,0,0.10)' : '',
        ]
          .filter(Boolean)
          .join(', '),
      }}
    >
      {/* top specular sheen */}
      <div
        style={{
          position: 'absolute',
          left: '5%',
          right: '5%',
          top: 0,
          height: '42%',
          borderRadius: `${typeof radius === 'number' ? radius : 40}px ${typeof radius === 'number' ? radius : 40}px 100% 100% / ${typeof radius === 'number' ? radius : 40}px ${typeof radius === 'number' ? radius : 40}px 40% 40%`,
          background: `linear-gradient(180deg, rgba(255,255,255,${lightTone ? 0.5 : 0.22}), rgba(255,255,255,0))`,
          opacity: variant === 'frosted' ? 0.55 : 0.8,
          pointerEvents: 'none',
        }}
      />
      {rim > 0 && <MetalRim radius={radius} thickness={rim} variant={rv} seed={seed} />}
    </div>
  );
};

/** A frosted glass card. `style` goes on the box, `contentStyle` on the content layer above the glass. */
export const Card: React.FC<{
  fade?: number;
  radius?: number;
  rim?: number;
  seed?: number;
  variant?: Variant;
  tone?: Tone;
  refract?: boolean;
  style?: React.CSSProperties;
  contentStyle?: React.CSSProperties;
  children: React.ReactNode;
}> = ({fade = 1, radius = 34, rim = 2.5, seed = 1, variant = 'frosted', tone = 'light', refract = false, style, contentStyle, children}) => (
  <div style={{position: 'relative', borderRadius: radius, ...style}}>
    <GlassSurface variant={variant} tone={tone} radius={radius} fade={fade} refract={refract} rim={rim} seed={seed} />
    <div style={{position: 'relative', opacity: fade, ...contentStyle}}>{children}</div>
  </div>
);
