import React, {useMemo} from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {createTikTokStyleCaptions, TikTokPage} from '@remotion/captions';
import type {Caption} from '@remotion/captions';
import {brand} from './brand';
import {CAPTION, LayoutKey, SAFE, W} from './layouts';
import {FlatSegment, layoutBlend} from './timeline';
import {isEmphasis, metalText, serif, useSans} from './ui';

const MAX_WORDS = 3;

/** Builds caption pages with createTikTokStyleCaptions, then caps every page at three words. */
export const buildPages = (captions: Caption[], combineMs = 250): TikTokPage[] => {
  const {pages} = createTikTokStyleCaptions({captions, combineTokensWithinMilliseconds: combineMs});
  const out: TikTokPage[] = [];
  for (const page of pages) {
    if (page.tokens.length <= MAX_WORDS) {
      out.push(page);
      continue;
    }
    for (let i = 0; i < page.tokens.length; i += MAX_WORDS) {
      const tokens = page.tokens.slice(i, i + MAX_WORDS);
      const startMs = tokens[0].fromMs;
      const endMs = i + MAX_WORDS >= page.tokens.length ? page.startMs + page.durationMs : page.tokens[i + MAX_WORDS].fromMs;
      out.push({text: tokens.map((t) => t.text).join(' ').trim(), startMs, tokens, durationMs: endMs - startMs});
    }
  }
  return out;
};

type CaptionStyleSpec = {
  y: number;
  size: number;
  pill: boolean;
};

const specFor = (layout: LayoutKey): CaptionStyleSpec => {
  if (layout === 'A') return {y: CAPTION.A_y, size: 100, pill: false};
  if (layout === 'B') return {y: CAPTION.pill_y, size: 46, pill: true};
  return {y: CAPTION.bottom_y, size: 66, pill: false};
};

export const CaptionLayer: React.FC<{
  pages: TikTokPage[];
  emphasis: string[];
  flat: FlatSegment[];
}> = ({pages, emphasis, flat}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const sans = useSans();
  const tMs = (frame / fps) * 1000;

  const page = useMemo(
    () => pages.find((p) => tMs >= p.startMs - 20 && tMs < p.startMs + Math.min(p.durationMs, lastEnd(p) - p.startMs + 450)),
    [pages, tMs],
  );
  if (!page) return null;

  const blend = layoutBlend(flat, frame);
  const mood = blend.cur.scene.mood;
  const cur = specFor(blend.layout);
  const prev = blend.prev ? specFor(blend.prev.seg.layout) : cur;
  const y = interpolate(blend.p, [0, 1], [prev.y, cur.y]);
  const size = interpolate(blend.p, [0, 1], [prev.size, cur.size]);
  const pill = blend.p > 0.5 ? cur.pill : prev.pill;

  const startFrame = (page.startMs / 1000) * fps;
  const pop = spring({frame: frame - startFrame, fps, durationInFrames: 9, config: {damping: 11, stiffness: 240, mass: 0.55}});
  const popScale = 0.9 + pop * 0.1;
  const inP = interpolate(frame - startFrame, [0, 3], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  const dark = mood === 'dark';
  const textColor = pill ? (dark ? brand.white : brand.charcoal) : dark ? brand.white : brand.charcoal;
  const bright = dark || (pill && false);
  const shadow = !pill && dark ? '0 2px 4px rgba(0,0,0,0.55), 0 4px 24px rgba(0,0,0,0.5)' : 'none';
  const pillBg = dark ? brand.charcoal : brand.white;

  const words = page.tokens.map((t) => t.text.trim());

  return (
    <div
      style={{
        position: 'absolute',
        left: (W - CAPTION.maxWidth) / 2,
        width: CAPTION.maxWidth,
        top: y - size * 0.9,
        height: size * 1.8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: inP,
        transform: `scale(${popScale})`,
        transformOrigin: 'center center',
        maxRight: SAFE.right,
      } as React.CSSProperties}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'baseline',
          justifyContent: 'center',
          columnGap: size * 0.28,
          background: pill ? pillBg : 'transparent',
          border: pill ? '2px solid rgba(212,138,140,0.9)' : 'none',
          borderRadius: pill ? 999 : 0,
          padding: pill ? `${size * 0.26}px ${size * 0.7}px` : 0,
          boxShadow: pill ? '0 10px 30px rgba(0,0,0,0.25)' : 'none',
        }}
      >
        {words.map((w, i) => {
          const em = isEmphasis(w, emphasis);
          const sheen = interpolate(frame - startFrame, [2, 20], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
          return (
            <span
              key={i}
              style={{
                fontFamily: em ? serif : sans,
                fontStyle: em ? 'italic' : 'normal',
                fontWeight: 700,
                fontSize: em ? size * 1.28 : size,
                lineHeight: 1.05,
                letterSpacing: em ? '-0.01em' : '-0.015em',
                color: textColor,
                textShadow: em ? 'none' : shadow,
                ...(em
                  ? {
                      ...metalText(bright ? 'roseBright' : 'roseOnWhite', sheen > 0 && sheen < 1 ? sheen : undefined),
                      filter: dark ? 'drop-shadow(0 3px 12px rgba(0,0,0,0.45))' : 'drop-shadow(0 2px 6px rgba(58,63,66,0.18))',
                    }
                  : {}),
              }}
            >
              {w}
            </span>
          );
        })}
      </div>
    </div>
  );
};

const lastEnd = (p: TikTokPage) => p.tokens[p.tokens.length - 1].toMs;
