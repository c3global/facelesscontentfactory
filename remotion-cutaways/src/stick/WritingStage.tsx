import React from 'react';
import {Stick, STAND, type Pose} from './figure';
import {Bubble, Card, Cross, Tag, C, SANS, between, bounce, prog} from './kit';
import {Bulb, FollowIcon, Heart} from './parts';
import {Bot, Calendar, Clock, Globe} from './icons2';
import type {Cues} from './PileStage';

/**
 * Stage art for "Writing So Members Anywhere Can Follow".
 * Metaphor: a globe with members around it, then four habits as four small scenes (short lines, plain words,
 * a date with its time zone, a video paired with a written summary).
 */
const G = 630;
const lin = (v: number) => v;
const pose = (p: Partial<Pose> = {}): Pose => ({...STAND, ...p});
const sm = (x: number) => x * x * (3 - 2 * x);

const Qmark: React.FC<{x: number; y: number; size?: number; color?: string}> = ({x, y, size = 56, color = C.ink}) => (
  <text x={x} y={y + size * 0.36} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={size} fill={color}>
    ?
  </text>
);
const Badge: React.FC<{x: number; y: number; n: string; s?: number; done?: number}> = ({x, y, n, s = 1, done = 0}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle r={36} fill={done > 0.5 ? C.crimson : C.ink} />
    <text y={14} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={42} fill="#FFFFFF">
      {n}
    </text>
  </g>
);
const Tick: React.FC<{x: number; y: number; p: number}> = ({x, y, p}) => (
  <path d={`M ${x - 12} ${y} L ${x - 3} ${y + 10} L ${x + 15} ${y - 11}`} fill="none" stroke={C.crimson} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={50} strokeDashoffset={50 * (1 - p)} opacity={Math.min(1, p * 4)} />
);
const Loop: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M 26 -6 A 28 28 0 1 0 8 24" fill="none" stroke={C.ink} strokeWidth={7} strokeLinecap="round" />
    <path d="M 10 -26 L 28 -4 L 2 -2" fill="none" stroke={C.ink} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
  </g>
);
const Ball: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -40 30 Q 0 -50 40 -34" fill="none" stroke={C.ink} strokeWidth={6} strokeLinecap="round" strokeDasharray="4 12" />
    <circle cx={40} cy={-34} r={14} fill="#FFFFFF" stroke={C.ink} strokeWidth={6} />
  </g>
);

export const WritingStage: React.FC<{t: number; q: Cues}> = ({t, q}) => {
  // ---- 1: globe and members (0 to 4.7)
  const s1 = 1 - prog(t, q.h1 - 0.25, 0.3, lin);
  const in1 = prog(t, q.blueprint - 0.4, 0.5, bounce);
  const mem = (k: number) => prog(t, q.countries + k * 0.2, 0.35, bounce);
  const toYou = prog(t, q.follow, 0.7);
  const angles = [-2.6, -1.9, -1.2, -0.5, 0.2];

  // ---- 2: habit one (4.8 to 15.9)
  const s2 = between(t, q.h1 - 0.1, q.h2 - 0.2, 0.3);
  const b1 = prog(t, q.h1, 0.4, bounce);
  const bars = prog(t, q.short, 0.4) * (1 - prog(t, q.long - 0.1, 0.25, lin));
  const bar = (k: number) => prog(t, q.short + k * 0.35, 0.4, bounce);
  const bulb = (k: number) => prog(t, q.idea + k * 0.28, 0.35, bounce);
  const tangle = prog(t, q.long, 0.5);
  const crossP = prog(t, q.hard + 0.3, 0.45);
  const trans = prog(t, q.tool - 0.2, 0.45, bounce);

  // ---- 3: habit two (16.4 to 24.4)
  const s3 = between(t, q.h2 - 0.1, q.h3 - 0.2, 0.3);
  const b2 = prog(t, q.h2, 0.4, bounce);
  const idiom = (k: number) => prog(t, [q.circle, q.park][k], 0.4, bounce);
  const guess = prog(t, q.guess, 0.4, bounce);

  // ---- 4: habit three (24.5 to 31.8)
  const s4 = between(t, q.h3 - 0.1, q.h4 - 0.2, 0.3);
  const b3 = prog(t, q.h3, 0.4, bounce);
  const cal = prog(t, q.dates, 0.45, bounce);
  const zone = prog(t, q.zone, 0.4, bounce);
  const big = prog(t, q.thursday, 0.5, bounce);
  const small = (k: number) => prog(t, q.thursday + 0.5 + k * 0.2, 0.35, bounce);

  // ---- 5: habit four (31.9 to 39.4)
  const s5 = between(t, q.h4 - 0.1, q.friendly - 0.2, 0.3);
  const b4 = prog(t, q.h4, 0.4, bounce);
  const vid = prog(t, q.video, 0.45, bounce);
  const sum = prog(t, q.summary, 0.45, bounce);
  const pace = prog(t, q.pace, 0.5, bounce);

  // ---- 6: the four together (39.5 to 45.3)
  const s6 = between(t, q.friendly - 0.1, q.cta - 0.1, 0.3);
  const done = (k: number) => prog(t, q.friendly + 0.2 + k * 0.3, 0.35, bounce);
  const heartP = prog(t, q.friendly + 1.3, 0.45, bounce);
  const walk = prog(t, q.join, 1.4, sm);
  const walking = walk > 0 && walk < 1;

  // ---- end card
  const ctaOn = prog(t, q.cta, 0.5, bounce);
  const askP = prog(t, q.cta + 0.7, 0.45, bounce);

  return (
    <g>
      {/* ---------------- 1 ---------------- */}
      {s1 > 0 && (
        <g opacity={s1}>
          <Globe x={620} y={300} s={1.9} opacity={in1} />
          {angles.map((a, k) => {
            const px = 620 + Math.cos(a) * 190;
            const py = 300 + Math.sin(a) * 190;
            return (
              <g key={k}>
                <g opacity={mem(k)}>
                  <Stick x={px} y={py + 34} h={72} sw={6} hair={k % 2 ? 'bob' : undefined} pose={pose({mood: 'smile', look: -1})} />
                </g>
                {toYou > 0 && (
                  <line x1={px - 22} y1={py + 14} x2={px - 22 + (300 - px + 22) * toYou} y2={py + 14 + (380 - py - 14) * toYou} stroke={C.ink} strokeWidth={5} strokeLinecap="round" strokeDasharray="3 12" />
                )}
              </g>
            );
          })}
          <Stick x={210} y={G} h={270} pose={pose({mood: 'smile', look: 1})} opacity={in1} />
        </g>
      )}

      {/* ---------------- 2 ---------------- */}
      {s2 > 0 && (
        <g opacity={s2}>
          <Badge x={150} y={110} n="1" s={b1} />
          {bars > 0 && (
            <g opacity={bars}>
              {[0, 1, 2].map((k) => (
                <g key={k} opacity={bar(k)} transform={`translate(${-24 * (1 - bar(k))} 0)`}>
                  <line x1={250} y1={220 + k * 100} x2={560} y2={220 + k * 100} stroke={C.ink} strokeWidth={14} strokeLinecap="round" />
                  <circle cx={600} cy={220 + k * 100} r={11} fill={C.ink} />
                  <g transform={`translate(${690} ${220 + k * 100}) scale(${0.5 * bulb(k)})`} opacity={bulb(k)}>
                    <Bulb />
                  </g>
                </g>
              ))}
            </g>
          )}
          {tangle > 0 && (
            <g opacity={tangle}>
              <path d={Array.from({length: 150}).map((_, i) => `${i ? 'L' : 'M'} ${(170 + i * 4.5 + 30 * Math.cos(i * 0.85)).toFixed(1)} ${(310 + 54 * Math.sin(i * 0.85)).toFixed(1)}`).join(' ')} fill="none" stroke={C.ink} strokeWidth={11} strokeLinecap="round" strokeLinejoin="round" />
            </g>
          )}
          {crossP > 0 && <Cross x={500} y={190} r={30} p={crossP} />}
          <g opacity={trans}>
            <Stick x={300} y={G} h={190} pose={pose({mood: 'flat', look: 1})} sw={8} />
            <Bubble x={300} y={G - 240} w={80} h={70}>
              <Qmark x={300} y={G - 240} size={44} />
            </Bubble>
            <Bot x={720} y={G - 90} s={1.1} />
            <Bubble x={720} y={G - 260} w={80} h={70}>
              <Qmark x={720} y={G - 260} size={44} />
            </Bubble>
          </g>
        </g>
      )}

      {/* ---------------- 3 ---------------- */}
      {s3 > 0 && (
        <g opacity={s3}>
          <Badge x={150} y={110} n="2" s={b2} />
          <g opacity={idiom(0)} transform={`translate(0 ${-12 * (1 - idiom(0))})`}>
            <Bubble x={300} y={250} w={190} h={150}>
              <Loop x={300} y={250} s={1.3} />
            </Bubble>
          </g>
          <g opacity={idiom(1)} transform={`translate(0 ${-12 * (1 - idiom(1))})`}>
            <Bubble x={700} y={250} w={190} h={150}>
              <Ball x={700} y={252} s={1.3} />
            </Bubble>
          </g>
          <Stick x={500} y={G} h={240} pose={pose({mood: guess > 0.4 ? 'flat' : 'smile', look: 0})} opacity={prog(t, q.circle - 0.2, 0.4)} />
          <g opacity={guess}>
            <Bubble x={500} y={330} w={96} h={84}>
              <Qmark x={500} y={330} size={58} color={C.crimson} />
            </Bubble>
          </g>
        </g>
      )}

      {/* ---------------- 4 ---------------- */}
      {s4 > 0 && (
        <g opacity={s4}>
          <Badge x={150} y={110} n="3" s={b3} />
          <g opacity={cal}>
            <Calendar x={290} y={290} s={1.0} shade={[10]} rows={4} w={300} h={220} />
          </g>
          <g opacity={zone}>
            <Clock x={610} y={290} s={1.5} hand={0.25} />
          </g>
          <g opacity={big} transform={`translate(0 ${-10 * (1 - big)})`}>
            <Tag x={500} y={470} text="3 PM EASTERN" size={26} fill={C.crimson} />
          </g>
          {[0.1, 0.45, 0.7, 0.9].map((h, k) => (
            <g key={k} opacity={small(k)} transform={`translate(${250 + k * 167} 560)`}>
              <Clock s={0.5} hand={h} />
            </g>
          ))}
        </g>
      )}

      {/* ---------------- 5 ---------------- */}
      {s5 > 0 && (
        <g opacity={s5}>
          <Badge x={150} y={110} n="4" s={b4} />
          <g opacity={vid} transform={`translate(${-20 * (1 - vid)} 0)`}>
            <rect x={150} y={200} width={330} height={200} rx={18} fill="#FFFFFF" stroke={C.ink} strokeWidth={7} />
            <path d="M 280 262 L 280 338 L 346 300 Z" fill={C.ink} />
          </g>
          <g opacity={Math.min(vid, sum)}>
            <text x={515} y={312} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={60} fill={C.ink}>
              +
            </text>
          </g>
          <g opacity={sum} transform={`translate(${20 * (1 - sum)} 0)`}>
            <rect x={550} y={190} width={300} height={220} rx={18} fill="#FFFFFF" stroke={C.ink} strokeWidth={7} />
            {[0, 1, 2, 3].map((k) => (
              <line key={k} x1={580} y1={232 + k * 42} x2={820 - (k === 3 ? 110 : 0)} y2={232 + k * 42} stroke={C.mid} strokeWidth={10} strokeLinecap="round" />
            ))}
          </g>
          <g opacity={pace}>
            <Stick x={500} y={G} h={210} pose={pose({mood: 'smile', look: 0, lh: [-0.1, 0.1], rh: [0.1, 0.1]})} />
            <Tag x={790} y={540} text="OWN PACE" size={22} />
          </g>
        </g>
      )}

      {/* ---------------- 6 ---------------- */}
      {s6 > 0 && (
        <g opacity={s6}>
          {[0, 1, 2, 3].map((k) => (
            <g key={k} opacity={done(k)}>
              <Badge x={230 + k * 180} y={150} n={String(k + 1)} s={done(k)} done={1} />
              <Tick x={230 + k * 180} y={218} p={done(k)} />
            </g>
          ))}
          <g transform={`translate(500 330) scale(${1.5 * heartP})`} opacity={heartP}>
            <Heart />
          </g>
          {walk > 0 || t >= q.join - 0.3 ? (
            <g>
              <rect x={600} y={390} width={140} height={240} rx={14} fill="#FFFFFF" stroke={C.ink} strokeWidth={8} />
              {walk > 0.3 && <path d="M 600 390 L 560 404 L 560 630 L 600 630" fill="#FFFFFF" stroke={C.ink} strokeWidth={8} strokeLinejoin="round" />}
            </g>
          ) : null}
          <Stick x={250 + 330 * walk} y={G} h={210} pose={walking ? pose({mood: 'smile', lean: 0.04, lf: -0.1 + 0.18 * Math.sin(walk * 16), rf: 0.1 - 0.18 * Math.sin(walk * 16), look: 1}) : pose({mood: 'smile', look: 1})} opacity={prog(t, q.friendly + 1.0, 0.4)} />
        </g>
      )}

      {/* ---------------- end card ---------------- */}
      {ctaOn > 0 && (
        <g opacity={Math.min(1, ctaOn * 2)}>
          <FollowIcon x={500} y={230} s={1.5 * ctaOn} />
          <Tag x={500} y={430} text="FOLLOW FOR MORE" size={38} opacity={prog(t, q.cta + 0.15, 0.4, bounce)} />
          <text x={500} y={545} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={40} fill={C.crimson} opacity={askP}>
            Which habit will you add first?
          </text>
        </g>
      )}
    </g>
  );
};
