import React from 'react';
import {interpolate} from 'remotion';
import {brand} from '../brand';
import {Card} from '../glass';
import {MetalCheck, MetalGradient} from '../metal';
import {clamp, easeOut, serif, useBgMetal, useCardMotion, useRel, useSans, useTheme} from '../ui';

type Props = {
  center: string;
  centerAt: number;
  nodes: Array<{label: string; at: number}>;
  drawAt: number;
  changeAt: number;
  fromLabel: string;
  toLabel: string;
  fit: number;
};

/**
 * Scaled about 1.6x so it fills a hidden-avatar frame. Coordinates are inside a 960 x 1070 area:
 * text stays inside x 60..950 of the full frame (right safe line), nodes never overlap the center card.
 */
const AW = 960;
const AH = 1070;
const CX = 480;
const CY = 545;
const CENTER_W = 620;
const CENTER_H = 290;
const NODE_W = 330;
const NODE_H = 120;

const SLOTS: Record<number, Array<[number, number]>> = {
  3: [[480, 110], [250, 960], [710, 960]],
  4: [[215, 190], [745, 190], [215, 900], [745, 900]],
  5: [[480, 100], [745, 270], [700, 940], [260, 940], [215, 270]],
};

export const HubDiagram: React.FC<Props> = ({center, centerAt, nodes, drawAt, changeAt, fromLabel, toLabel, fit}) => {
  const {opacity, frame} = useCardMotion(0, 4, 8);
  const rel = useRel();
  const sans = useSans();
  const {palette, mood} = useTheme();
  const bgMetal = useBgMetal();
  const dark = mood === 'dark';
  const pts = nodes.map((nd, i) => ({x: SLOTS[nodes.length][i][0], y: SLOTS[nodes.length][i][1], ...nd}));
  const cIn = interpolate(frame - rel(centerAt), [0, 8], [0, 1], {...clamp, easing: easeOut});
  const changed = (i: number) => frame >= rel(changeAt) + i * 3;

  return (
    <div style={{width: AW * fit, height: AH * fit, margin: '0 auto'}}>
    <div style={{opacity, position: 'relative', width: AW, height: AH, transform: `scale(${fit})`, transformOrigin: '0 0'}}>
      <svg width={AW} height={AH} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        <defs>
          {pts.map((p, i) => (
            <MetalGradient key={i} id={`hub-line-${i}`} x1={CX} y1={CY} x2={p.x} y2={p.y} variant={bgMetal} seed={10 + i * 3} />
          ))}
        </defs>
        {pts.map((p, i) => {
          const len = Math.hypot(p.x - CX, p.y - CY);
          const draw = interpolate(frame - rel(drawAt) - i * 3, [0, 12], [0, 1], {...clamp, easing: easeOut});
          const t = (frame - rel(drawAt) - 16 - i * 4) % 60;
          const loop = t < 0 ? -1 : t / 60;
          return (
            <g key={i}>
              <line
                x1={CX}
                y1={CY}
                x2={p.x}
                y2={p.y}
                stroke={`url(#hub-line-${i})`}
                strokeWidth={10}
                strokeLinecap="round"
                strokeDasharray={len}
                strokeDashoffset={len * (1 - draw)}
                style={{filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.38))'}}
              />
              {loop >= 0 && (
                <circle
                  cx={p.x + (CX - p.x) * loop}
                  cy={p.y + (CY - p.y) * loop}
                  r={10}
                  fill={dark ? brand.white : brand.charcoal}
                  opacity={Math.sin(loop * Math.PI) * 0.9}
                />
              )}
            </g>
          );
        })}
      </svg>

      {pts.map((p, i) => {
        const inP = interpolate(frame - rel(p.at), [0, 8], [0, 1], {...clamp, easing: easeOut});
        const isChanged = changed(i);
        const flip = interpolate(frame - (rel(changeAt) + i * 3), [0, 8], [0, 1], clamp);
        const check = interpolate(frame - (rel(changeAt) + i * 3), [0, 12], [0, 1], {...clamp, easing: easeOut});
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: p.x - NODE_W / 2,
              top: p.y - NODE_H / 2,
              width: NODE_W,
              height: NODE_H,
              scale: `${0.9 + inP * 0.1 + Math.sin(flip * Math.PI) * 0.06}`,
            }}
          >
            <Card
              fade={inP * opacity}
              radius={999}
              rim={isChanged ? 4.5 : 3}
              seed={30 + i}
              style={{height: '100%'}}
              contentStyle={{height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16}}
            >
              <div style={{width: 46, height: 46, flexShrink: 0}}>
                {isChanged ? (
                  <MetalCheck size={46} id={`hub-check-${i}`} seed={50 + i} progress={check} />
                ) : (
                  <svg width="46" height="46" viewBox="0 0 24 24">
                    <defs>
                      <MetalGradient id={`hub-ring-${i}`} x1={2} y1={2} x2={22} y2={22} variant="deep" seed={40 + i} />
                    </defs>
                    <circle cx="12" cy="12" r="8.5" fill="none" stroke={`url(#hub-ring-${i})`} strokeWidth="2.6" />
                  </svg>
                )}
              </div>
              <div style={{fontFamily: sans, fontWeight: 700, fontSize: 48, color: palette.onCard, letterSpacing: '-0.01em'}}>
                {isChanged ? toLabel : fromLabel}
              </div>
            </Card>
          </div>
        );
      })}

      <div
        style={{
          position: 'absolute',
          left: CX - CENTER_W / 2,
          top: CY - CENTER_H / 2,
          width: CENTER_W,
          height: CENTER_H,
          scale: `${0.88 + cIn * 0.12}`,
        }}
      >
        <Card
          fade={cIn * opacity}
          radius={64}
          rim={6}
          seed={60}
          style={{height: '100%'}}
          contentStyle={{height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 44px', textAlign: 'center'}}
        >
          <div style={{fontFamily: serif, fontStyle: 'italic', fontWeight: 700, fontSize: 70, lineHeight: 1.08, color: palette.onCard}}>{center}</div>
        </Card>
      </div>
    </div>
    </div>
  );
};
