import React from 'react';
import {Stick, STAND, type Pose} from './figure';
import {Bubble, Cross, Tag, C, SANS, between, bounce, prog} from './kit';
import {Bell, FollowIcon} from './parts';
import {Calendar as Cal, NameTag} from './icons2';
import type {Cues} from './PileStage';

/**
 * Stage art for "Hand It Off Without Losing It".
 * Metaphor: a founder with a heavy bundle, three cards dropped in one shared box, a leader takes one week,
 * a roof on one pole wobbles while a roof on three pillars stands.
 */
const G = 630;
const lin = (v: number) => v;
const pose = (p: Partial<Pose> = {}): Pose => ({...STAND, ...p});
const sm = (x: number) => x * x * (3 - 2 * x);

const Tick: React.FC<{x: number; y: number; p: number; color?: string}> = ({x, y, p, color = C.crimson}) => (
  <path d={`M ${x - 12} ${y} L ${x - 3} ${y + 10} L ${x + 15} ${y - 11}`} fill="none" stroke={color} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={50} strokeDashoffset={50 * (1 - p)} opacity={Math.min(1, p * 4)} />
);
const Qmark: React.FC<{x: number; y: number; size?: number; color?: string}> = ({x, y, size = 56, color = C.ink}) => (
  <text x={x} y={y + size * 0.36} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={size} fill={color}>
    ?
  </text>
);
const Sack: React.FC<{x: number; y: number; s?: number; opacity?: number}> = ({x, y, s = 1, opacity = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity}>
    <path d="M -50 60 Q -80 0 -34 -34 L -24 -52 L 24 -52 L 34 -34 Q 80 0 50 60 Z" fill="#FFFFFF" stroke={C.ink} strokeWidth={8} strokeLinejoin="round" />
    <path d="M -26 -42 Q 0 -24 26 -42" fill="none" stroke={C.ink} strokeWidth={7} strokeLinecap="round" />
    <text y={26} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={36} fill={C.ink}>
      ?
    </text>
  </g>
);
const Roof: React.FC<{x: number; y: number; w: number; rot?: number}> = ({x, y, w, rot = 0}) => (
  <g transform={`rotate(${rot} ${x} ${y + 40})`}>
    <path d={`M ${x - w / 2} ${y + 60} L ${x} ${y - 30} L ${x + w / 2} ${y + 60} Z`} fill="#FFFFFF" stroke={C.ink} strokeWidth={8} strokeLinejoin="round" />
    <rect x={x - w / 2 - 6} y={y + 56} width={w + 12} height={16} rx={8} fill={C.ink} />
  </g>
);
const CARDS = ['RHYTHM', 'RULES', 'REASONS'];

export const HandOffStage: React.FC<{t: number; q: Cues}> = ({t, q}) => {
  // ---- 1: the heavy bundle (0 to 5.6)
  const s1 = 1 - prog(t, q.first - 0.3, 0.3, lin);
  const in1 = prog(t, 0.2, 0.5, bounce);
  const days = prog(t, q.thirty, 0.4, bounce);
  const strain = prog(t, q.alone, 0.5);

  // ---- the shared box and cards (5.7 to 30)
  const box = prog(t, q.first - 0.2, 0.5, bounce);
  const boxOut = 1 - prog(t, q.then - 0.2, 0.35, lin);
  const drop = (k: number) => prog(t, [q.rhythm - 0.5, q.rules - 0.5, q.reasons - 0.5][k], 0.7, (x) => x * x);
  const landed = (k: number) => prog(t, [q.rhythm + 0.2, q.rules + 0.2, q.reasons + 0.2][k], 0.2, lin);
  const cardTag = (k: number) => prog(t, [q.rhythm - 0.6, q.rules - 0.6, q.reasons - 0.6][k], 0.3);
  const placeTag = prog(t, q.write, 0.4, bounce);
  const glow = prog(t, q.place, 0.4);

  // rhythm detail
  const sA = between(t, q.rhythm - 0.1, q.second - 0.2, 0.3);
  const calIn = prog(t, q.rhythm + 0.4, 0.45, bounce);
  const chip = (k: number) => prog(t, q.names + k * 0.28, 0.35, bounce);
  // rules detail
  const sB = between(t, q.rules - 0.1, q.third - 0.2, 0.3);
  const okP = prog(t, q.welcome, 0.4, bounce);
  const noP = prog(t, q.isnt, 0.4, bounce);
  const whoP = prog(t, q.decides, 0.4, bounce);
  // reasons detail
  const sC = between(t, q.reasons - 0.1, q.write - 0.1, 0.3);
  const doc = prog(t, q.exists, 0.45, bounce);
  const line = (k: number) => prog(t, q.sentences + k * 0.3, 0.4);
  const lead = prog(t, q.leader - 0.3, 0.45, bounce);
  const match = prog(t, q.leader + 0.9, 0.4, bounce);

  // ---- 4: the leader takes a week (30.6 to 35.5)
  const s4 = between(t, q.then - 0.1, q.fragile - 0.2, 0.3);
  const calL = prog(t, q.then, 0.45, bounce);
  const weekRing = prog(t, q.week, 0.6);
  const wave = Math.sin(t * 6) * 0.06;

  // ---- 5: one pole, then three pillars (36 to 48.3)
  const s5 = between(t, q.fragile - 0.1, q.cta - 0.1, 0.3);
  const pole = prog(t, q.fragile, 0.5, bounce);
  const wobble = Math.sin((t - q.fragile) * 9) * 4 * pole * (1 - prog(t, q.written - 0.2, 0.3));
  const pillars = prog(t, q.written, 0.6, bounce);
  const pil = (k: number) => prog(t, q.written + 0.4 + k * 0.5, 0.4, bounce);
  const away = prog(t, q.steps, 2.0, sm);

  // ---- end card
  const ctaOn = prog(t, q.cta, 0.5, bounce);
  const bellP = prog(t, q.subscribe, 1.6, lin);
  const bellIn = prog(t, q.subscribe - 0.1, 0.4, bounce);
  const askP = prog(t, q.cta + 1.0, 0.45, bounce);

  const BOXY = 600;
  return (
    <g>
      {/* ---------------- 1 ---------------- */}
      {s1 > 0 && (
        <g opacity={s1}>
          <Stick x={420} y={G} h={270} pose={pose({crouch: 0.2 * strain, lean: 0.05 * strain, lh: [0.25, -0.2], rh: [0.3, -0.3], mood: strain > 0.4 ? 'sad' : 'flat', look: 1})} opacity={in1} />
          <Sack x={520} y={G - 340 + 14 * strain} s={1.5} opacity={in1} />
          <g opacity={days}>
            <Tag x={760} y={250} text="30 DAYS" size={30} />
          </g>
        </g>
      )}

      {/* ---------------- the shared box ---------------- */}
      {box > 0 && boxOut > 0 && (
        <g opacity={box * boxOut}>
          <path d={`M 340 ${BOXY - 150} L 360 ${BOXY} L 640 ${BOXY} L 660 ${BOXY - 150}`} fill="#FFFFFF" stroke={glow > 0 ? C.crimson : C.ink} strokeWidth={8} strokeLinejoin="round" strokeLinecap="round" />
          {CARDS.map((c, k) => {
            const y = -150 + drop(k) * (BOXY - 60 - k * 36 - 40 + 150) - (1 - drop(k)) * 0;
            return (
              <g key={k} opacity={cardTag(k)} transform={`translate(500 ${y + 40})`}>
                <rect x={-100} y={-26} width={200} height={52} rx={16} fill="#FFFFFF" stroke={C.ink} strokeWidth={6} />
                <text y={10} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={28} fill={C.ink}>
                  {c}
                </text>
              </g>
            );
          })}
          <path d={`M 332 ${BOXY - 110} L 332 ${BOXY} Q 332 ${BOXY + 6} 340 ${BOXY + 6}`} fill="none" stroke="none" />
          <Tag x={500} y={BOXY + 54} text="ONE SHARED PLACE" size={20} opacity={placeTag} />
        </g>
      )}

      {/* rhythm detail */}
      {sA > 0 && (
        <g opacity={sA}>
          <g opacity={calIn}>
            <Cal x={500} y={210} s={1.1} rows={3} w={460} h={290} shade={[]} />
          </g>
          {[0, 1, 2, 3, 4].map((k) => (
            <g key={k} opacity={chip(k)} transform={`translate(${340 + (k % 3) * 160} ${190 + Math.floor(k / 3) * 90})`}>
              <rect x={-34} y={-12} width={68} height={24} rx={12} fill={C.crimson} />
              <rect x={-20} y={-3} width={40} height={6} rx={3} fill="#FFFFFF" />
            </g>
          ))}
        </g>
      )}
      {/* rules detail */}
      {sB > 0 && (
        <g opacity={sB}>
          <g opacity={okP}>
            <rect x={160} y={120} width={300} height={120} rx={24} fill="#FFFFFF" stroke={C.ink} strokeWidth={7} />
            <Tick x={230} y={180} p={okP} />
            <line x1={290} y1={180} x2={420} y2={180} stroke={C.soft} strokeWidth={10} strokeLinecap="round" />
          </g>
          <g opacity={noP}>
            <rect x={540} y={120} width={300} height={120} rx={24} fill="#FFFFFF" stroke={C.ink} strokeWidth={7} />
            <Cross x={610} y={180} r={22} p={noP} />
            <line x1={670} y1={180} x2={800} y2={180} stroke={C.soft} strokeWidth={10} strokeLinecap="round" />
          </g>
          <g opacity={whoP}>
            <Bubble x={500} y={380} w={110} h={90}>
              <Qmark x={500} y={380} size={60} />
            </Bubble>
            <NameTag x={500} y={470} s={1.1} />
          </g>
        </g>
      )}
      {/* reasons detail */}
      {sC > 0 && (
        <g opacity={sC}>
          <g opacity={doc}>
            <rect x={160} y={110} width={330} height={290} rx={22} fill="#FFFFFF" stroke={C.ink} strokeWidth={7} />
            {[0, 1, 2].map((k) => (
              <line key={k} x1={200} y1={170 + k * 56} x2={200 + (k === 2 ? 170 : 250) * line(k)} y2={170 + k * 56} stroke={C.mid} strokeWidth={12} strokeLinecap="round" />
            ))}
          </g>
          <g opacity={lead}>
            <Stick x={680} y={G - 40} h={230} hair="bob" pose={pose({mood: 'smile', look: -1})} />
          </g>
          <g opacity={match}>
            <Tick x={540} y={250} p={match} />
            <Tick x={540} y={330} p={match} />
          </g>
        </g>
      )}

      {/* ---------------- 4 ---------------- */}
      {s4 > 0 && (
        <g opacity={s4}>
          <g opacity={calL}>
            <Cal x={500} y={200} s={1.0} rows={3} w={460} h={290} shade={[]} />
            <rect x={310} y={190} width={380} height={64} rx={18} fill="none" stroke={C.crimson} strokeWidth={9} pathLength={100} strokeDasharray={`${weekRing * 100} 100`} strokeLinecap="round" />
          </g>
          <Stick x={420} y={G} h={240} hair="bob" pose={pose({mood: 'smile', look: 0})} opacity={calL} />
          <g opacity={prog(t, q.available - 0.2, 0.4, bounce)}>
            <Stick x={850} y={G} h={170} pose={pose({lh: [-0.1, 0.25], rh: [0.34, -0.38 + wave], mood: 'smile', look: -1})} sw={8} />
          </g>
        </g>
      )}

      {/* ---------------- 5 ---------------- */}
      {s5 > 0 && (
        <g opacity={s5}>
          {/* one pole */}
          {pole > 0 && pillars < 0.5 && (
            <g opacity={pole * (1 - pillars)}>
              <line x1={500} y1={250} x2={500} y2={560} stroke={C.ink} strokeWidth={16} strokeLinecap="round" transform={`rotate(${wobble * 0.6} 500 560)`} />
              <g transform={`rotate(${wobble} 500 560)`}>
                <Roof x={500} y={170} w={400} />
              </g>
              <Stick x={500} y={G} h={150} pose={pose({mood: 'sad'})} sw={7} />
            </g>
          )}
          {/* three pillars */}
          {pillars > 0 && (
            <g opacity={pillars}>
              <Roof x={500} y={170} w={560} />
              {[0, 1, 2].map((k) => (
                <g key={k} opacity={pil(k)}>
                  <rect x={260 + k * 240 - 14} y={250} width={28} height={310} rx={10} fill="#FFFFFF" stroke={C.ink} strokeWidth={7} />
                  <Tag x={260 + k * 240} y={600} text={CARDS[k]} size={18} />
                </g>
              ))}
              <g opacity={pil(2)}>
                {[330, 500, 670].map((x, k) => (
                  <Stick key={k} x={x} y={560} h={130} hair={k === 1 ? 'bob' : undefined} pose={pose({mood: 'smile'})} sw={6} />
                ))}
              </g>
              <g opacity={prog(t, q.steps - 0.4, 0.4)}>
                <Stick x={880 + 120 * away} y={G} h={170} pose={pose({lf: -0.1 + 0.18 * Math.sin(away * 16), rf: 0.1 - 0.18 * Math.sin(away * 16), lean: 0.03, mood: 'smile', look: 1})} sw={8} />
              </g>
            </g>
          )}
        </g>
      )}

      {/* ---------------- end card ---------------- */}
      {ctaOn > 0 && (
        <g opacity={Math.min(1, ctaOn * 2)}>
          <FollowIcon x={500} y={200} s={1.4 * ctaOn} />
          {bellIn > 0 && <Bell x={500} y={340} s={1.3 * bellIn} ring={bellP} />}
          <Tag x={500} y={450} text="FOLLOW AND SUBSCRIBE" size={36} opacity={prog(t, q.cta + 0.15, 0.4, bounce)} />
          <text x={500} y={570} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={42} fill={C.crimson} opacity={askP}>
            What would you hand over first?
          </text>
        </g>
      )}
    </g>
  );
};
