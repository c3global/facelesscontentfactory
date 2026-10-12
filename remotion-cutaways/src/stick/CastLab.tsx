import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, SANS} from './kit';
import {Stick, STAND, type Hair, type HairColor, type Pose} from './figure';

// A preview sheet of the stick cast: the men as before, then the women with a little hair. Render with
//   npx remotion still StickCast out/review/cast.png
const WAVE: Pose = {...STAND, rh: [0.2, -0.05], mood: 'smile'};
const WORRIED: Pose = {...STAND, mood: 'sad', lean: 0.02};

const ROW: {label: string; hair?: Hair; color?: HairColor; pose: Pose}[] = [
  {label: 'MAN', pose: STAND},
  {label: 'BOB', hair: 'bob', color: 'brown', pose: STAND},
  {label: 'LONG', hair: 'long', color: 'blonde', pose: WAVE},
  {label: 'BUN', hair: 'bun', color: 'silver', pose: STAND},
  {label: 'PONYTAIL', hair: 'ponytail', color: 'teal', pose: WORRIED},
];

/** COLORED shows the hair colours as they would look if COLOR_HAIR were switched on. */
const COLORED = true;

export const CastLab: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: C.white}}>
    <svg viewBox="0 0 1920 800" style={{width: 1920, height: 800}}>
      {ROW.map((f, k) => (
        <g key={f.label}>
          <Stick x={190 + k * 385} y={690} h={560} pose={f.pose} hair={f.hair} hairColor={f.color} colorHair={COLORED} color={C.cast} sw={11} />
          <text x={190 + k * 385} y={770} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={32} letterSpacing={4} fill={C.mid}>{f.label}</text>
        </g>
      ))}
    </svg>
  </AbsoluteFill>
);
