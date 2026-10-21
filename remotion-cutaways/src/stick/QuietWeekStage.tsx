import React from 'react';
import {Stick, STAND, type Pose} from './figure';
import {Card, Chair, Cross, Tag, C, SANS, between, bounce, prog} from './kit';
import {Bell, FollowIcon, Heart} from './parts';
import {Calendar, Clock, Lantern} from './icons2';
import type {Cues} from './PileStage';

/**
 * Stage art for "Plan a Quiet Week".
 * Metaphor: one calendar week outlined on purpose, a sign, a queue beside a clock, a lantern, two plugs pulled.
 */
const G = 630;
const lin = (v: number) => v;
const pose = (p: Partial<Pose> = {}): Pose => ({...STAND, ...p});
const sm = (x: number) => x * x * (3 - 2 * x);

const Tick: React.FC<{x: number; y: number; p: number}> = ({x, y, p}) => (
  <path d={`M ${x - 12} ${y} L ${x - 3} ${y + 10} L ${x + 15} ${y - 11}`} fill="none" stroke={C.crimson} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={50} strokeDashoffset={50 * (1 - p)} opacity={Math.min(1, p * 4)} />
);
const Trophy: React.FC<{x?: number; y?: number; s?: number; opacity?: number}> = ({x = 0, y = 0, s = 1, opacity = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity} fill="#FFFFFF" stroke={C.ink} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round">
    <path d="M -34 -50 L 34 -50 L 30 -6 Q 0 26 -30 -6 Z" />
    <path d="M -34 -40 Q -62 -38 -52 -14 Q -46 -4 -32 -8 M 34 -40 Q 62 -38 52 -14 Q 46 -4 32 -8" fill="none" />
    <line x1={0} y1={14} x2={0} y2={40} />
    <rect x={-24} y={40} width={48} height={14} rx={5} fill={C.ink} />
  </g>
);
const Rocket: React.FC<{x?: number; y?: number; s?: number; opacity?: number}> = ({x = 0, y = 0, s = 1, opacity = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity} fill="#FFFFFF" stroke={C.ink} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round">
    <path d="M 0 -60 Q 30 -30 24 24 L -24 24 Q -30 -30 0 -60 Z" />
    <circle cy={-14} r={11} />
    <path d="M -24 4 L -44 34 L -24 24 M 24 4 L 44 34 L 24 24" />
    <path d="M -10 32 L 0 54 L 10 32" fill="none" />
  </g>
);

export const QuietWeekStage: React.FC<{t: number; q: Cues}> = ({t, q}) => {
  // ---- 1: calendar and one week (0 to 5.5)
  const s1 = 1 - prog(t, q.first - 0.25, 0.3, lin);
  const cal = prog(t, 0.2, 0.55, bounce);
  const week = prog(t, q.quiet, 0.6);

  // ---- 2: the sign (5.6 to 12.4)
  const s2 = between(t, q.first - 0.1, q.second - 0.2, 0.3);
  const board = prog(t, q.announce - 0.3, 0.5, bounce);
  const knowP = prog(t, q.know, 0.4, bounce);
  const probP = prog(t, q.problem, 0.4, bounce);
  const crossP = prog(t, q.problem + 0.5, 0.45);

  // ---- 3: queue and clock (12.5 to 18.6)
  const s3 = between(t, q.second - 0.1, q.third - 0.2, 0.3);
  const clk = prog(t, q.second + 0.4, 0.45, bounce);
  const qc = (k: number) => prog(t, q.posts + k * 0.35, 0.4, bounce);
  const aim = prog(t, q.advance, 0.7, sm);
  const care = prog(t, q.cared, 0.45, bounce);

  // ---- 4: the lantern (18.7 to 25.8)
  const s4 = between(t, q.third - 0.1, q.fourth - 0.2, 0.3);
  const lan = prog(t, q.anchor - 0.4, 0.5, bounce);
  const glow = 0.7 + 0.3 * Math.sin(t * 3);
  const lanTag = prog(t, q.friday, 0.4, bounce);
  const walk = prog(t, q.land - 1.0, 1.4, sm);

  // ---- 5: unplug the extras (25.9 to 34.7)
  const s5 = between(t, q.fourth - 0.1, q.rests - 0.2, 0.3);
  const ex = prog(t, q.extras, 0.45, bounce);
  const pull = (at: number) => prog(t, at, 0.7, sm);
  const back = prog(t, q.behind, 1.0, sm);

  // ---- 6: rest, then plan (34.8 to 43.3)
  const s6 = between(t, q.rests - 0.1, q.cta - 0.1, 0.3);
  const rest1 = prog(t, q.rests, 0.5, bounce);
  const rest2 = prog(t, q.permission, 0.5, bounce);
  const planCal = prog(t, q.plan, 0.5, bounce);
  const planWeek = prog(t, q.plan + 0.8, 0.5);

  // ---- end card
  const ctaOn = prog(t, q.cta, 0.5, bounce);
  const bellP = prog(t, q.subscribe, 1.6, lin);
  const bellIn = prog(t, q.subscribe - 0.1, 0.4, bounce);
  const askP = prog(t, q.cta + 1.0, 0.45, bounce);

  return (
    <g>
      {/* ---------------- 1 ---------------- */}
      {s1 > 0 && (
        <g opacity={s1}>
          <g opacity={cal}>
            <Calendar x={500} y={270} s={1.0} rows={4} w={560} h={380} />
          </g>
          <rect x={232} y={307} width={536} height={72} rx={20} fill="none" stroke={C.crimson} strokeWidth={9} strokeLinecap="round" pathLength={100} strokeDasharray={`${week * 100} 100`} />
          <Stick x={500} y={G} h={200} pose={pose({mood: 'smile', look: 0})} opacity={cal} />
        </g>
      )}

      {/* ---------------- 2 ---------------- */}
      {s2 > 0 && (
        <g opacity={s2}>
          <g opacity={board} transform={`translate(0 ${10 * (1 - board)})`}>
            <line x1={500} y1={330} x2={500} y2={470} stroke={C.ink} strokeWidth={10} strokeLinecap="round" />
            <rect x={270} y={110} width={460} height={220} rx={26} fill="#FFFFFF" stroke={C.ink} strokeWidth={8} />
            <text x={500} y={205} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={54} fill={C.ink}>
              SLOW WEEK
            </text>
            <text x={500} y={280} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={54} fill={C.crimson}>
              ON PURPOSE
            </text>
          </g>
          <g opacity={knowP}>
            <Stick x={220} y={G} h={200} pose={pose({mood: 'smile', look: 1})} />
            <Stick x={780} y={G} h={200} hair="bob" pose={pose({mood: 'smile', look: -1})} />
            <Tick x={220} y={G - 240} p={knowP} />
            <Tick x={780} y={G - 240} p={knowP} />
          </g>
          {probP > 0 && (
            <g opacity={probP}>
              <text x={500} y={600} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={64} fill={C.mid}>
                !
              </text>
              <Cross x={500} y={575} r={26} p={crossP} />
            </g>
          )}
        </g>
      )}

      {/* ---------------- 3 ---------------- */}
      {s3 > 0 && (
        <g opacity={s3}>
          <g opacity={clk}>
            <Clock x={730} y={300} s={2.2} hand={(t * 0.05) % 1} />
          </g>
          {[0, 1, 2].map((k) => (
            <g key={k}>
              <Card x={290} y={170 + k * 100} w={340} h={74} rot={[1, -1.4, 0.8][k]} opacity={qc(k)} scale={0.92 + 0.08 * qc(k)} />
              {aim > 0 && qc(k) > 0.9 && <line x1={470} y1={170 + k * 100} x2={470 + (620 - 470) * aim} y2={170 + k * 100 + (300 - 170 - k * 100) * aim} stroke={C.ink} strokeWidth={5} strokeLinecap="round" strokeDasharray="3 12" />}
            </g>
          ))}
          <g transform={`translate(500 ${530}) scale(${1.4 * care})`} opacity={care}>
            <Heart />
          </g>
        </g>
      )}

      {/* ---------------- 4 ---------------- */}
      {s4 > 0 && (
        <g opacity={s4}>
          <g opacity={lan}>
            <Lantern x={500} y={310} s={2.2} glow={glow} />
          </g>
          <Tag x={500} y={500} text="FRIDAY CHECK-IN" size={24} opacity={lanTag} />
          <Stick x={150 + 110 * walk} y={G} h={220} pose={walk > 0 && walk < 1 ? pose({mood: 'smile', lean: 0.04, lf: -0.1 + 0.18 * Math.sin(walk * 16), rf: 0.1 - 0.18 * Math.sin(walk * 16), look: 1}) : pose({mood: 'smile', look: 1})} opacity={prog(t, q.land - 1.2, 0.4)} />
        </g>
      )}

      {/* ---------------- 5 ---------------- */}
      {s5 > 0 && (
        <g opacity={s5}>
          <rect x={130} y={120} width={22} height={360} rx={8} fill={C.ink} opacity={ex} />
          {[
            {y: 200, at: q.challenges, node: <Trophy s={1.3} />},
            {y: 400, at: q.launches, node: <Rocket s={1.3} />},
          ].map((r, k) => {
            const p = pull(r.at);
            return (
              <g key={k} opacity={ex}>
                <path d={`M 152 ${r.y} L ${300 + 120 * p} ${r.y}`} stroke={C.ink} strokeWidth={7} strokeLinecap="round" fill="none" />
                <rect x={300 + 120 * p} y={r.y - 20} width={34} height={40} rx={8} fill={C.ink} />
                <g transform={`translate(640 ${r.y})`} opacity={1 - 0.6 * p}>
                  {r.node}
                  <line x1={-110} y1={0} x2={-60} y2={0} stroke={C.ink} strokeWidth={7} strokeLinecap="round" opacity={1 - p} />
                </g>
              </g>
            );
          })}
          <g opacity={back}>
            <Stick x={880 - 300 * back} y={G} h={190} pose={pose({mood: 'smile', look: -1})} />
            <Tick x={580} y={G - 230} p={back} />
          </g>
        </g>
      )}

      {/* ---------------- 6 ---------------- */}
      {s6 > 0 && (
        <g opacity={s6}>
          <g opacity={rest1}>
            <Chair x={300} y={540} s={1.1} dashed={false} />
            <Stick x={300} y={G - 20} h={170} pose={pose({crouch: 0.75, mood: 'smile', look: 1})} />
            <text x={360} y={400} fontFamily={SANS} fontWeight={800} fontSize={40} fill={C.mid} opacity={0.5 + 0.5 * Math.sin(t * 3)}>
              z z
            </text>
          </g>
          <g opacity={rest2}>
            <Chair x={560} y={540} s={1.1} dashed={false} />
            <Stick x={560} y={G - 20} h={170} hair="bob" pose={pose({crouch: 0.75, mood: 'smile', look: -1})} />
          </g>
          <g opacity={planCal}>
            <Calendar x={500} y={190} s={0.8} rows={3} w={420} h={260} />
            <rect x={307} y={177} width={386} height={50} rx={16} fill="none" stroke={C.crimson} strokeWidth={7} pathLength={100} strokeDasharray={`${planWeek * 100} 100`} strokeLinecap="round" />
          </g>
        </g>
      )}

      {/* ---------------- end card ---------------- */}
      {ctaOn > 0 && (
        <g opacity={Math.min(1, ctaOn * 2)}>
          <FollowIcon x={500} y={200} s={1.4 * ctaOn} />
          {bellIn > 0 && <Bell x={500} y={340} s={1.3 * bellIn} ring={bellP} />}
          <Tag x={500} y={450} text="FOLLOW AND SUBSCRIBE" size={36} opacity={prog(t, q.cta + 0.15, 0.4, bounce)} />
          <text x={500} y={570} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={44} fill={C.crimson} opacity={askP}>
            When is your quiet week?
          </text>
        </g>
      )}
    </g>
  );
};
