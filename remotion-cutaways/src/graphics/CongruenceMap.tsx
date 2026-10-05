import React from 'react';
import {interpolate} from 'remotion';
import {brand} from '../brand';
import {MetalGradient, MetalText} from '../metal';
import {GlassSurface} from '../glass';
import {clamp, easeOut, useBgMetal, useCardMotion, useRel, useSans, useTheme} from '../ui';

type Props = {
  nodes: Array<{label: string; at: number}>;
  connectAt: number;
  pulseAt: number;
};

/**
 * Four components that depend on each other, shown as a connected diamond with her hidden.
 * Coordinates are absolute in the 1080 x 1920 frame, with her hidden: x 140..940, y 595..1035. Captions use the bands above (250..560) and below (1056..1382).
 * Nodes arrive as she names them, the active one lifts, the remaining links close the diamond and cross it,
 * then a pulse travels every link and a single small crimson dot marks the shared center.
 */
const NODE_W = 340;
const NODE_H = 100;
const CX = 540;
const CY = 815;
const PTS: Array<[number, number]> = [
  [CX, 645],
  [770, CY],
  [CX, 985],
  [310, CY],
];
// [from, to, which event draws it]: 0..2 follow the nodes, 3 is drawn at connectAt
const EDGES: Array<[number, number, number]> = [
  [0, 1, 1],
  [1, 2, 2],
  [2, 3, 3],
  [3, 0, -1],
  [0, 2, -1],
  [1, 3, -1],
];

export const CongruenceMap: React.FC<Props> = ({nodes, connectAt, pulseAt}) => {
  const {opacity, frame} = useCardMotion(0, 6, 8);
  const rel = useRel();
  const sans = useSans();
  const {palette, mood} = useTheme();
  const dark = mood === 'dark';
  const textColor = dark ? brand.white : brand.charcoal;
  const bg = useBgMetal();
  const connected = frame >= rel(connectAt);
  let active = -1;
  nodes.forEach((n, i) => {
    if (frame >= rel(n.at)) active = i;
  });
  const pulseF = frame - rel(pulseAt);

  return (
    <div style={{position: 'absolute', inset: 0, opacity}}>
      <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        <defs>
          {EDGES.map(([a, b], i) => (
            <MetalGradient key={i} id={`cm-line-${i}`} x1={PTS[a][0]} y1={PTS[a][1]} x2={PTS[b][0]} y2={PTS[b][1]} variant={bg} seed={12 + i * 5} />
          ))}
        </defs>
        {EDGES.map(([a, b, ev], i) => {
          const startF = ev > 0 ? rel(nodes[ev].at) : rel(connectAt) + (i - 3) * 4;
          const draw = interpolate(frame - startF, [0, 14], [0, 1], {...clamp, easing: easeOut});
          if (draw <= 0) return null;
          const [x1, y1] = PTS[a];
          const [x2, y2] = PTS[b];
          const len = Math.hypot(x2 - x1, y2 - y1);
          const t = pulseF >= 0 ? ((pulseF + i * 7) % 48) / 48 : -1;
          return (
            <g key={i}>
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={`url(#cm-line-${i})`}
                strokeWidth={5.5}
                strokeLinecap="round"
                strokeDasharray={len}
                strokeDashoffset={len * (1 - draw)}
                style={{filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.5))'}}
              />
              {t >= 0 && <circle cx={x1 + (x2 - x1) * t} cy={y1 + (y2 - y1) * t} r={6} fill={brand.white} opacity={Math.sin(t * Math.PI) * 0.95} />}
            </g>
          );
        })}
        {pulseF >= 0 && (
          <g>
            <circle cx={675} cy={455} r={11} fill={brand.crimson} />
            <circle
              cx={CX}
              cy={CY}
              r={11 + ((pulseF % 40) / 40) * 38}
              fill="none"
              stroke={brand.crimson}
              strokeWidth={3}
              opacity={1 - (pulseF % 40) / 40}
            />
          </g>
        )}
      </svg>

      {nodes.map((n, i) => {
        const inP = interpolate(frame - rel(n.at), [0, 9], [0, 1], {...clamp, easing: easeOut});
        const isActive = !connected && i === active;
        const lift = isActive ? 1.06 : 1;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: PTS[i][0] - NODE_W / 2,
              top: PTS[i][1] - NODE_H / 2,
              width: NODE_W,
              height: NODE_H,
              scale: `${(0.88 + inP * 0.12) * lift}`,
              opacity: inP,
            }}
          >
            {/* liquid glass: clear, translucent, refracting whatever is behind it */}
            <GlassSurface
              variant="clear"
              tone={dark ? 'dark' : 'light'}
              radius={999}
              fade={inP}
              refract
              rim={isActive ? 5 : 2.6}
              rimVariant={dark ? 'bright' : 'deep'}
              seed={20 + i}
              darkAlpha={dark ? 0.22 : undefined}
            />
            {isActive && (
              <div
                style={{
                  position: 'absolute',
                  inset: -3,
                  borderRadius: 999,
                  boxShadow: `0 0 34px rgba(201,27,25,0.55), inset 0 0 0 1.5px rgba(238,110,107,0.8)`,
                  pointerEvents: 'none',
                }}
              />
            )}
            <div style={{position: 'relative', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, opacity: inP}}>
              <MetalText kind="crimson" variant={dark ? 'bright' : 'deep'} seed={80 + i} style={{fontFamily: sans, fontWeight: 800, fontSize: 44}}>
                {i + 1}
              </MetalText>
              <span
                style={{
                  fontFamily: sans,
                  fontWeight: 700,
                  fontSize: 44,
                  color: textColor,
                  letterSpacing: '-0.01em',
                  textShadow: dark ? '0 2px 14px rgba(0,0,0,0.55)' : 'none',
                }}
              >
                {n.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
