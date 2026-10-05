import React from 'react';
import {interpolate} from 'remotion';
import {brand, goldGradient, roseGoldBright, roseGoldGradient} from '../brand';
import {Card, clamp, easeOut, serif, useCardMotion, useRel, useSans, useTheme} from '../ui';

type Props = {
  center: string;
  centerAt: number;
  nodes: Array<{label: string; at: number}>;
  drawAt: number;
  changeAt: number;
  fromLabel: string;
  toLabel: string;
};

const AW = 960;
const AH = 800;
const CX = AW / 2;
const CY = 410;
const RX = 338;
const RY = 300;
const NODE_W = 214;
const NODE_H = 80;

/** Center node, labeled spokes, lines that draw outward, nodes that change state. */
export const HubDiagram: React.FC<Props> = ({center, centerAt, nodes, drawAt, changeAt, fromLabel, toLabel}) => {
  const {opacity, frame} = useCardMotion(0, 4, 8);
  const rel = useRel();
  const sans = useSans();
  const {palette, mood} = useTheme();
  const dark = mood === 'dark';

  const cIn = interpolate(frame - rel(centerAt), [0, 8], [0, 1], {...clamp, easing: easeOut});
  const n = nodes.length;
  const pts = nodes.map((nd, i) => {
    const a = ((-90 + (i * 360) / n) * Math.PI) / 180;
    return {x: CX + RX * Math.cos(a), y: CY + RY * Math.sin(a), ...nd};
  });
  const lineLen = (x: number, y: number) => Math.hypot(x - CX, y - CY);
  const changed = (i: number) => frame >= rel(changeAt) + i * 3;

  return (
    <div style={{opacity, position: 'relative', width: AW, height: AH}}>
      <svg width={AW} height={AH} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        {pts.map((p, i) => {
          const len = lineLen(p.x, p.y);
          const draw = interpolate(frame - rel(drawAt) - i * 3, [0, 12], [0, 1], {...clamp, easing: easeOut});
          // pulses travel from node to center after the lines are drawn
          const pulse = interpolate(frame - rel(drawAt) - 16 - i * 4, [0, 30], [0, 1], {...clamp});
          const t = (frame - rel(drawAt) - 16 - i * 4) % 60;
          const loop = t < 0 ? -1 : (t / 60) % 1;
          return (
            <g key={i}>
              <line
                x1={CX}
                y1={CY}
                x2={p.x}
                y2={p.y}
                stroke={dark ? '#F6D2CC' : brand.roseGold}
                strokeWidth={4}
                strokeLinecap="round"
                strokeDasharray={len}
                strokeDashoffset={len * (1 - draw)}
                opacity={dark ? 0.95 : 0.85}
              />
              {pulse > 0 && loop >= 0 && (
                <circle
                  cx={p.x + (CX - p.x) * loop}
                  cy={p.y + (CY - p.y) * loop}
                  r={7}
                  fill={dark ? brand.white : brand.roseGold}
                  opacity={Math.sin(loop * Math.PI)}
                />
              )}
            </g>
          );
        })}
      </svg>

      {/* nodes */}
      {pts.map((p, i) => {
        const inP = interpolate(frame - rel(p.at), [0, 8], [0, 1], {...clamp, easing: easeOut});
        const isChanged = changed(i);
        const flip = interpolate(frame - (rel(changeAt) + i * 3), [0, 8], [0, 1], clamp);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: p.x - NODE_W / 2,
              top: p.y - NODE_H / 2,
              width: NODE_W,
              height: NODE_H,
              opacity: inP,
              scale: `${0.9 + inP * 0.1 + Math.sin(flip * Math.PI) * 0.06}`,
            }}
          >
            <Card
              style={{
                height: '100%',
                borderRadius: 999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                border: isChanged ? '3px solid #B76E79' : '2px solid rgba(183,110,121,0.5)',
              }}
            >
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  flexShrink: 0,
                  backgroundImage: isChanged ? goldGradient : 'none',
                  border: isChanged ? 'none' : `3px solid ${brand.roseSecondary}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {isChanged && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12.5l5 5 9-10" />
                  </svg>
                )}
              </div>
              <div style={{fontFamily: sans, fontWeight: 700, fontSize: 30, color: palette.onCard}}>
                {isChanged ? toLabel : fromLabel}
              </div>
            </Card>
          </div>
        );
      })}

      {/* center node, drawn last so it sits on top of the spokes */}
      <div
        style={{
          position: 'absolute',
          left: CX - 200,
          top: CY - 92,
          width: 400,
          height: 184,
          opacity: cIn,
          scale: `${0.88 + cIn * 0.12}`,
        }}
      >
        <Card
          style={{
            height: '100%',
            borderRadius: 40,
            border: '4px solid transparent',
            backgroundImage: `linear-gradient(#fff, #fff), ${dark ? roseGoldBright : roseGoldGradient}`,
            backgroundOrigin: 'border-box',
            backgroundClip: 'padding-box, border-box',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 28px',
            textAlign: 'center',
          }}
        >
          <div style={{fontFamily: serif, fontWeight: 700, fontSize: 44, lineHeight: 1.08, color: palette.onCard}}>{center}</div>
        </Card>
      </div>
    </div>
  );
};
