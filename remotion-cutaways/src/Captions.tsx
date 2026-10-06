import React, {useMemo} from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {createTikTokStyleCaptions, TikTokPage} from '@remotion/captions';
import type {Caption} from '@remotion/captions';
import {brand} from './brand';
import {GlassSurface} from './glass';
import {CAPTION, LayoutKey, W} from './layouts';
import {metalTextStyle} from './metal';
import {FlatSegment, layoutBlend} from './timeline';
import {isEmphasis, serif, useSans, useTheme} from './ui';

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

type Spec = {y: number; size: number; pill: boolean};

/** DM Sans in a tight glass pill everywhere: dark glass on dark scenes, light glass on white scenes. */
const specFor = (layout: LayoutKey): Spec => {
  if (layout === 'A') return {y: CAPTION.A_y, size: 94, pill: true};
  if (layout === 'B') return {y: CAPTION.pill_y, size: 60, pill: true};
  return {y: CAPTION.bottom_y, size: 76, pill: true};
};

const lastEnd = (p: TikTokPage) => p.tokens[p.tokens.length - 1].toMs;

export const CaptionLayer: React.FC<{pages: TikTokPage[]; emphasis: string[]; flat: FlatSegment[]}> = ({pages, emphasis, flat}) => {
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
  const dark = mood === 'dark';
  const cur = specFor(blend.layout);
  const prev = blend.prev ? specFor(blend.prev.seg.layout) : cur;
  const y = interpolate(blend.p, [0, 1], [prev.y, cur.y]);
  const size = interpolate(blend.p, [0, 1], [prev.size, cur.size]);
  const pill = blend.p > 0.5 ? cur.pill : prev.pill;
  const overVideo = blend.layout === 'A';

  const startFrame = (page.startMs / 1000) * fps;
  const pop = spring({frame: frame - startFrame, fps, durationInFrames: 9, config: {damping: 11, stiffness: 240, mass: 0.55}});
  const inP = interpolate(frame - startFrame, [0, 3], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  // Pill tone: dark glass on dark scenes (and on the rose gold field), light glass on white scenes.
  // plain white text on dark scenes, plain black on white scenes. Metal is only the emphasized Playfair word.
  const pillTone = dark ? 'dark' : 'light';
  const textColor = dark ? brand.white : brand.black;
  const metalVariant = dark ? 'bright' : 'deep';
  const shadow = 'none';

  const words = page.tokens.map((t) => t.text.trim());
  const pageIndex = pages.indexOf(page);

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
        transform: `scale(${0.9 + pop * 0.1})`,
        transformOrigin: 'center center',
      }}
    >
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'baseline',
          justifyContent: 'center',
          columnGap: size * 0.26,
          padding: pill ? `${size * 0.13}px ${size * 0.42}px ${size * 0.17}px` : 0,
        }}
      >
        {pill && (
          <GlassSurface
            variant="clear"
            tone={pillTone}
            radius={999}
            fade={inP}
            refract
            rim={2.5}
            rimVariant={pillTone === 'dark' ? 'bright' : 'deep'}
            seed={80}
            darkAlpha={overVideo ? 0.9 : undefined}
          />
        )}
        {words.map((w, i) => {
          const em = isEmphasis(w, emphasis);
          return (
            <span
              key={i}
              style={{
                position: 'relative',
                opacity: inP,
                fontFamily: em ? serif : sans,
                fontStyle: em ? 'italic' : 'normal',
                fontWeight: 700,
                fontSize: em ? size * 1.22 : size,
                lineHeight: 1.04,
                letterSpacing: em ? '-0.01em' : '-0.015em',
                color: textColor,
                textShadow: em ? 'none' : shadow,
                ...(em
                  ? {
                      ...metalTextStyle({variant: metalVariant, frame, seed: pageIndex * 3 + i}),
                      filter: dark ? 'drop-shadow(0 3px 12px rgba(0,0,0,0.5))' : 'drop-shadow(0 2px 6px rgba(58,63,66,0.18))',
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
