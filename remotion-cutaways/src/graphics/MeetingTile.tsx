import React from 'react';
import {interpolate} from 'remotion';
import {brand, roseGoldGradient} from '../brand';
import {Card, Label, clamp, serif, useCardMotion, useRel, useSans, useTheme} from '../ui';

type Props = {title: string; status: string; participants: number; mutedAt?: number};

const Person: React.FC<{dim: number}> = ({dim}) => (
  <svg viewBox="0 0 100 100" width="100%" height="100%" style={{opacity: 1 - dim * 0.4}}>
    <circle cx="50" cy="38" r="17" fill={brand.roseSecondary} />
    <path d="M18 92c0-18 14-30 32-30s32 12 32 30z" fill={brand.roseGold} />
  </svg>
);

const MicOff: React.FC = () => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={brand.white} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="3" width="6" height="11" rx="3" />
    <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
    <path d="M3 3l18 18" stroke={brand.white} />
  </svg>
);

/** Mock video call. After `mutedAt` every tile goes quiet and the waveform flatlines. */
export const MeetingTile: React.FC<Props> = ({title, status, participants, mutedAt}) => {
  const {opacity, translateY, scale, frame} = useCardMotion();
  const rel = useRel();
  const sans = useSans();
  const {palette} = useTheme();
  const mf = mutedAt === undefined ? 0 : rel(mutedAt);
  const muted = interpolate(frame, [mf, mf + 10], [0, 1], clamp);
  const cols = participants > 4 ? 3 : 2;
  const rows = Math.ceil(participants / cols);
  const wave = Array.from({length: 38}, (_, i) => {
    const speaking = Math.abs(Math.sin(i * 0.9 + frame * 0.45)) * (1 - muted);
    return 6 + speaking * 46 * (0.5 + 0.5 * Math.sin(i * 0.37));
  });

  return (
    <div style={{opacity, transform: `translateY(${translateY}px) scale(${scale})`}}>
      <Card style={{padding: '36px 40px 34px'}}>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24}}>
          <div style={{fontFamily: serif, fontWeight: 700, fontSize: 50, color: palette.onCard}}>{title}</div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              backgroundImage: roseGoldGradient,
              borderRadius: 999,
              padding: '9px 24px 9px 18px',
              color: brand.white,
              fontFamily: sans,
              fontWeight: 700,
              fontSize: 26,
              opacity: 0.55 + 0.45 * muted,
            }}
          >
            <MicOff />
            {status}
          </div>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, ${rows > 1 ? 150 : 210}px)`,
            gap: 18,
          }}
        >
          {Array.from({length: participants}).map((_, i) => (
            <div
              key={i}
              style={{
                position: 'relative',
                borderRadius: 24,
                background: 'rgba(58,63,66,0.07)',
                border: '1.5px solid rgba(58,63,66,0.12)',
                overflow: 'hidden',
                padding: '12px 0 0',
              }}
            >
              <div style={{width: '36%', height: '100%', margin: '0 auto'}}>
                <Person dim={muted} />
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
        <div style={{display: 'flex', alignItems: 'center', gap: 4, height: 64, marginTop: 24, justifyContent: 'center'}}>
          {wave.map((h, i) => (
            <div
              key={i}
              style={{
                width: 9,
                height: h,
                borderRadius: 5,
                background: i % 2 === 0 ? brand.roseGold : brand.roseSecondary,
                opacity: 0.55 + (1 - muted) * 0.45,
              }}
            />
          ))}
        </div>
      </Card>
    </div>
  );
};
