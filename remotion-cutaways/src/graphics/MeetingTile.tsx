import React from 'react';
import {interpolate} from 'remotion';
import {brand} from '../brand';
import {Card} from '../glass';
import {MetalBox, MetalGradient} from '../metal';
import {clamp, serif, useCardMotion, useRel, useSans, useTheme} from '../ui';

type Props = {title: string; status: string; participants: number; mutedAt?: number; zoom: number};

const MicOff: React.FC = () => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={brand.white} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="3" width="6" height="11" rx="3" />
    <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
    <path d="M3 3l18 18" />
  </svg>
);

/** Mock video call. After `mutedAt` every tile goes quiet and the waveform flatlines. All rose gold is metal. */
export const MeetingTile: React.FC<Props> = ({title, status, participants, mutedAt, zoom}) => {
  const {opacity, translateY, scale, frame} = useCardMotion();
  const rel = useRel();
  const sans = useSans();
  const {palette} = useTheme();
  const mf = mutedAt === undefined ? 0 : rel(mutedAt);
  const muted = interpolate(frame, [mf, mf + 10], [0, 1], clamp);
  const cols = participants > 4 ? 3 : 2;
  const rows = Math.ceil(participants / cols);
  const BARS = 38;
  const WAVE_W = 760;
  const wave = Array.from({length: BARS}, (_, i) => {
    const speaking = Math.abs(Math.sin(i * 0.9 + frame * 0.45)) * (1 - muted);
    return 6 + speaking * 46 * (0.5 + 0.5 * Math.sin(i * 0.37));
  });

  return (
    <div style={{zoom, width: 960 / zoom, transform: `translateY(${translateY}px) scale(${scale})`}}>
      <Card fade={opacity} seed={14} contentStyle={{padding: '36px 40px 34px'}}>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24}}>
          <div style={{fontFamily: serif, fontWeight: 700, fontSize: 50, color: palette.onCard}}>{title}</div>
          <MetalBox
            variant="deep"
            seed={15}
            style={{display: 'flex', alignItems: 'center', gap: 12, borderRadius: 999, padding: '9px 24px 9px 18px', color: brand.white, fontFamily: sans, fontWeight: 700, fontSize: 26}}
          >
            <MicOff />
            {status}
          </MetalBox>
        </div>
        <div style={{display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, ${rows > 1 ? 150 : 210}px)`, gap: 18}}>
          {Array.from({length: participants}).map((_, i) => (
            <div
              key={i}
              style={{position: 'relative', borderRadius: 24, background: 'rgba(58,63,66,0.07)', border: '1.5px solid rgba(58,63,66,0.12)', overflow: 'hidden', padding: '12px 0 0'}}
            >
              <div style={{width: '36%', height: '100%', margin: '0 auto', opacity: 1 - muted * 0.35}}>
                <svg viewBox="0 0 100 100" width="100%" height="100%">
                  <defs>
                    <MetalGradient id={`person-${i}`} x1={18} y1={20} x2={82} y2={92} variant="deep" seed={16 + i * 2} />
                  </defs>
                  <circle cx="50" cy="38" r="17" fill={`url(#person-${i})`} />
                  <path d="M18 92c0-18 14-30 32-30s32 12 32 30z" fill={`url(#person-${i})`} />
                </svg>
              </div>
              <div
                style={{
                  position: 'absolute',
                  right: 14,
                  bottom: 12,
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: muted > 0.5 ? brand.charcoal : 'rgba(58,63,66,0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  scale: '0.8',
                }}
              >
                <MicOff />
              </div>
            </div>
          ))}
        </div>
        <svg width={WAVE_W} height={64} viewBox={`0 0 ${WAVE_W} 64`} style={{display: 'block', margin: '24px auto 0'}}>
          <defs>
            <MetalGradient id="wave-metal" x1={0} y1={0} x2={WAVE_W} y2={0} variant="deep" seed={17} />
          </defs>
          {wave.map((h, i) => (
            <rect key={i} x={i * (WAVE_W / BARS) + 3} y={32 - h / 2} width={9} height={h} rx={4.5} fill="url(#wave-metal)" opacity={0.6 + (1 - muted) * 0.4} />
          ))}
        </svg>
      </Card>
    </div>
  );
};
