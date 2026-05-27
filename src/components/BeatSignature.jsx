import { useMemo } from 'react';
import { beatPattern } from '../lib/beatSignature.js';

// Cadence brand mark — a 16-cell pattern unique to each brand.
//
// Usage:
//   <BeatSignature seed={brand.name} accent={brand.accent_color} size="sm" />
//
// Sizes (px width of the whole grid):
//   xs  → 36   (sidebar / dropdown rows)
//   sm  → 56   (brand-switcher chip, banners)
//   md  → 88   (brand cards, medium contexts)
//   lg  → 160  (brand-hub hero, brand-page banner)

const SIZES = {
  xs: { width: 36,  gap: 1.5, padding: 3, radius: 1.5 },
  sm: { width: 56,  gap: 2,   padding: 4, radius: 1.5 },
  md: { width: 88,  gap: 2.5, padding: 5, radius: 2   },
  lg: { width: 160, gap: 4,   padding: 8, radius: 3   },
};

export default function BeatSignature({
  seed,
  accent = '#D9C0A6',
  size = 'sm',
  framed = false,
  title,
}) {
  const s = SIZES[size] || SIZES.sm;
  const cells = useMemo(() => beatPattern(seed), [seed]);

  return (
    <div
      aria-hidden={!title}
      role={title ? 'img' : undefined}
      aria-label={title}
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(8, 1fr)',
        gap: s.gap,
        width: s.width,
        padding: framed ? s.padding : 0,
        background: framed ? 'rgba(148, 163, 184, 0.10)' : 'transparent',
        borderRadius: framed ? 6 : 0,
        flexShrink: 0,
      }}
    >
      {cells.map((on, i) => (
        <span
          key={i}
          style={{
            aspectRatio: '1',
            borderRadius: s.radius,
            background: on ? accent : 'rgba(148, 163, 184, 0.18)',
          }}
        />
      ))}
    </div>
  );
}
