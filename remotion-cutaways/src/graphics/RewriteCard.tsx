import React from 'react';
import {interpolate} from 'remotion';
import {Card, Label, clamp, easeOut, isEmphasis, metalText, serif, useCardMotion, useRel, useTheme} from '../ui';
import {StruckLine} from './HeadlineCard';

type Props = {
  label: string;
  oldLine: string;
  newLine: string;
  emphasis?: string[];
  struckAtStart: boolean;
  strikeAt?: number;
  writeAt: number;
  writeSeconds: number;
};

/** Old text struck through, then the new line writes in beneath it word by word. */
export const RewriteCard: React.FC<Props> = ({
  label,
  oldLine,
  newLine,
  emphasis,
  struckAtStart,
  strikeAt,
  writeAt,
  writeSeconds,
}) => {
  const {opacity, translateY, scale, frame} = useCardMotion();
  const rel = useRel();
  const {palette} = useTheme();

  const sf = strikeAt !== undefined ? rel(strikeAt) : 0;
  const strike = struckAtStart ? 1 : interpolate(frame, [sf, sf + 5], [0, 1], {...clamp, easing: easeOut});
  const dim = struckAtStart ? 1 : interpolate(frame, [sf, sf + 8], [0, 1], clamp);

  const wf = rel(writeAt);
  const total = Math.round(writeSeconds * 30);
  const words = newLine.split(' ');
  const writeEnd = wf + total;
  const check = interpolate(frame, [writeEnd, writeEnd + 14], [0, 1], {...clamp, easing: easeOut});

  return (
    <div style={{opacity, transform: `translateY(${translateY}px) scale(${scale})`}}>
      <Card style={{padding: '46px 70px 54px 56px'}}>
        <Label>{label}</Label>
        <div style={{height: 22}} />
        <StruckLine text={oldLine} size={64} progress={strike} dim={dim} color={palette.onCard} />
        <div style={{height: 34}} />
        <div style={{display: 'flex', alignItems: 'flex-start', gap: 22}}>
          <div style={{flex: 1, fontFamily: serif, fontWeight: 700, fontSize: 76, lineHeight: 1.1, color: palette.onCard}}>
            {words.map((w, i) => {
              const start = wf + (i / words.length) * total;
              const p = interpolate(frame, [start, start + 8], [0, 1], {...clamp, easing: easeOut});
              const em = isEmphasis(w, emphasis);
              const sheen = interpolate(frame, [start + 4, start + 26], [0, 1], clamp);
              return (
                <span
                  key={i}
                  style={{
                    display: 'inline-block',
                    marginRight: '0.26em',
                    opacity: p,
                    translate: `0px ${(1 - p) * 16}px`,
                    ...(em ? {fontStyle: 'italic', fontSize: 84, ...metalText('roseOnWhite', sheen > 0 && sheen < 1 ? sheen : undefined)} : {}),
                  }}
                >
                  {w}
                </span>
              );
            })}
          </div>
        </div>
        {/* secondary gold accent: a small check that draws once the line is written */}
        <svg
          width="84"
          height="84"
          viewBox="0 0 24 24"
          style={{position: 'absolute', right: 40, bottom: 34, opacity: check}}
        >
          <defs>
            <linearGradient id="gk" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#F6E3A6" />
              <stop offset="0.5" stopColor="#D5AA4A" />
              <stop offset="1" stopColor="#A47E2A" />
            </linearGradient>
          </defs>
          <circle
            cx="12"
            cy="12"
            r="10"
            fill="none"
            stroke="url(#gk)"
            strokeWidth="1.6"
            strokeDasharray={63}
            strokeDashoffset={63 * (1 - check)}
          />
          <path
            d="M7.5 12.5l3 3 6-6.5"
            fill="none"
            stroke="url(#gk)"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={20}
            strokeDashoffset={20 * (1 - Math.max(0, check * 2 - 1))}
          />
        </svg>
            </Card>
    </div>
  );
};
