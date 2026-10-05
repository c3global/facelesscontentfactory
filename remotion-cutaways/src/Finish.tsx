import React, {useMemo} from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {brand} from './brand';
import type {ScenePlan} from './schema';

/**
 * Film finish, drawn over everything: grain and light leaks, both in brand tints only (crimson, gold, rose gold).
 * Grain is an overlay-blended noise tile that jumps every other frame so it feels like film stock.
 * Light leaks drift in from the frame edges all the time, and flare up for half a second at every cut.
 */
const svgUri = (svg: string) => `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
const GRAIN = svgUri(
  "<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='g' x='0' y='0' width='100%' height='100%'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='matrix' values='0 0 0 0 0.5 0 0 0 0 0.5 0 0 0 0 0.5 2.2 0 0 0 -0.8'/></filter><rect width='100%' height='100%' filter='url(#g)'/></svg>",
);

const LEAKS: Array<{rgb: string; x: number; y: number; w: number; h: number; sx: number; sy: number; ph: number}> = [
  {rgb: '201,27,25', x: -260, y: 380, w: 760, h: 1100, sx: 0.21, sy: 0.17, ph: 0.4}, // crimson, left edge
  {rgb: '213,170,74', x: 760, y: 1000, w: 700, h: 980, sx: 0.17, sy: 0.23, ph: 2.2}, // gold, right edge
  {rgb: '212,138,140', x: 120, y: -380, w: 900, h: 760, sx: 0.13, sy: 0.19, ph: 4.1}, // rose gold, top
];

export const FilmFinish: React.FC<{plan: ScenePlan}> = ({plan}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const {grain, lightLeaks} = plan.finish;
  const cuts = useMemo(() => plan.scenes.flatMap((s) => s.segments.map((g) => g.start)).filter((x) => x > 0.1), [plan]);
  // flare after each cut: fast rise, half-second decay
  const burst = Math.max(0, ...cuts.map((c) => (t >= c - 0.05 ? Math.exp(-(t - c + 0.05) * 5.5) : 0)));
  const leak = lightLeaks * (0.1 + burst * 0.9);

  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {lightLeaks > 0 &&
        LEAKS.map((l, i) => {
          const cx = l.x + Math.sin(t * l.sx + l.ph) * 90;
          const cy = l.y + Math.cos(t * l.sy + l.ph) * 130;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: cx,
                top: cy,
                width: l.w,
                height: l.h,
                borderRadius: '50%',
                background: `radial-gradient(ellipse, rgba(${l.rgb},${0.55 * leak}) 0%, rgba(${l.rgb},${0.22 * leak}) 42%, rgba(${l.rgb},0) 70%)`,
                mixBlendMode: 'screen',
                filter: 'blur(30px)',
              }}
            />
          );
        })}
      {grain > 0 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: GRAIN,
            backgroundSize: '300px 300px',
            backgroundPosition: `${(Math.floor(frame / 2) * 67) % 300}px ${(Math.floor(frame / 2) * 113) % 300}px`,
            mixBlendMode: 'overlay',
            opacity: 0.55 * grain,
          }}
        />
      )}
      <div style={{display: 'none', color: brand.white}} />
    </AbsoluteFill>
  );
};
