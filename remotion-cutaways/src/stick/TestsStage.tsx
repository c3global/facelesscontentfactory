import React from 'react';
import {Stick, STAND, type Pose} from './figure';
import {Bubble, Cross, Dots, Panel, Tag, C, SANS, between, bounce, prog} from './kit';
import {Bell, FollowIcon} from './parts';
import {Bot, Calendar, Magnifier, NameTag} from './icons2';
import type {Cues} from './PileStage';

/**
 * Stage art for "Three Tests Before an AI Assistant Meets Your Members".
 * Metaphor: three test cards on a board (refuse, admit, match), then three real members try the bot and one is stuck at a door.
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
const Badge: React.FC<{x: number; y: number; n: string; s?: number}> = ({x, y, n, s = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle r={36} fill={C.ink} />
    <text y={14} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={42} fill="#FFFFFF">
      {n}
    </text>
  </g>
);
const Tick: React.FC<{x: number; y: number; p: number}> = ({x, y, p}) => (
  <path d={`M ${x - 12} ${y} L ${x - 3} ${y + 10} L ${x + 15} ${y - 11}`} fill="none" stroke={C.crimson} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={50} strokeDashoffset={50 * (1 - p)} opacity={Math.min(1, p * 4)} />
);
const Lock: React.FC<{x: number; y: number; s?: number; opacity?: number}> = ({x, y, s = 1, opacity = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity}>
    <path d="M -24 -8 L -24 -30 A 24 24 0 0 1 24 -30 L 24 -8" fill="none" stroke={C.ink} strokeWidth={8} strokeLinecap="round" />
    <rect x={-38} y={-8} width={76} height={58} rx={12} fill={C.ink} />
    <circle cy={18} r={8} fill="#FFFFFF" />
  </g>
);
const Arrow: React.FC<{x1: number; y1: number; x2: number; y2: number; p: number; color?: string}> = ({x1, y1, x2, y2, p, color = C.ink}) => {
  const x = x1 + (x2 - x1) * p;
  const y = y1 + (y2 - y1) * p;
  const a = Math.atan2(y2 - y1, x2 - x1);
  return (
    <g opacity={p > 0.02 ? 1 : 0}>
      <line x1={x1} y1={y1} x2={x} y2={y} stroke={color} strokeWidth={7} strokeLinecap="round" />
      <path d={`M ${x - Math.cos(a - 0.5) * 22} ${y - Math.sin(a - 0.5) * 22} L ${x} ${y} L ${x - Math.cos(a + 0.5) * 22} ${y - Math.sin(a + 0.5) * 22}`} fill="none" stroke={color} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
};

export const TestsStage: React.FC<{t: number; q: Cues}> = ({t, q}) => {
  // ---- 1: the bot and its builder (0 to 4.5)
  const s1 = 1 - prog(t, q.one - 0.3, 0.3, lin);
  const in1 = prog(t, q.intro, 0.5, bounce);
  const slot = (k: number) => prog(t, q.three + k * 0.3, 0.3, bounce);

  // ---- 2: test one (4.6 to 14.7)
  const s2 = between(t, q.one - 0.1, q.two - 0.15, 0.3);
  const p2 = prog(t, q.one, 0.45, bounce);
  const askB = prog(t, q.ask, 0.4, bounce);
  const lock = prog(t, q.private, 0.4, bounce);
  const noB = prog(t, q.no - 0.2, 0.35, bounce);
  const toPerson = prog(t, q.person - 0.1, 0.6, sm);
  const personIn = prog(t, q.person - 0.3, 0.4, bounce);

  // ---- 3: test two (14.8 to 24.9)
  const s3 = between(t, q.two - 0.05, q.threeT - 0.15, 0.3);
  const p3 = prog(t, q.two, 0.45, bounce);
  const askB2 = prog(t, q.askTwo, 0.4, bounce);
  const calQ = prog(t, q.plans, 0.4, bounce);
  const dk = prog(t, q.admits, 0.4, bounce);
  const guessX = prog(t, q.guess, 0.45);

  // ---- 4: test three (25 to 34)
  const s4 = between(t, q.threeT - 0.05, q.hand - 0.2, 0.3);
  const p4 = prog(t, q.threeT, 0.45, bounce);
  const wordsB = prog(t, q.words, 0.4, bounce);
  const langB = prog(t, q.lang, 0.4, bounce);
  const arrows = prog(t, q.match - 0.8, 0.7, sm);
  const ansB = prog(t, q.match - 0.4, 0.4, bounce);
  const tickP = prog(t, q.match, 0.4);

  // ---- 5: three members try it (34.1 to 41.9)
  const s5 = between(t, q.hand - 0.1, q.cta - 0.1, 0.3);
  const botIn = prog(t, q.hand, 0.45, bounce);
  const mem = (k: number) => prog(t, q.members + k * 0.3, 0.4, bounce);
  const mag = prog(t, q.stuck, 0.4, bounce);
  const flyQ = prog(t, q.needs, 0.9, sm);
  const plus = prog(t, q.needs + 1.2, 0.4, bounce);

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
          <Stick x={240} y={G} h={260} hair="bob" pose={pose({mood: 'smile', look: 1})} opacity={in1} />
          <Bot x={700} y={340} s={1.5} opacity={in1} blink={t % 3 > 2.8} />
          <rect x={590} y={438} width={220} height={16} rx={8} fill={C.ink} opacity={in1} />
          <line x1={610} y1={454} x2={610} y2={G} stroke={C.ink} strokeWidth={7} strokeLinecap="round" opacity={in1} />
          <line x1={790} y1={454} x2={790} y2={G} stroke={C.ink} strokeWidth={7} strokeLinecap="round" opacity={in1} />
          {[0, 1, 2].map((k) => (
            <g key={k} opacity={slot(k)} transform={`translate(${380 + k * 70} 150) scale(${0.6 + 0.4 * slot(k)})`}>
              <circle r={28} fill="#FFFFFF" stroke={C.ink} strokeWidth={6} />
              <text y={11} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={32} fill={C.ink}>
                {k + 1}
              </text>
            </g>
          ))}
        </g>
      )}

      {/* ---------------- 2 ---------------- */}
      {s2 > 0 && (
        <g opacity={s2}>
          <Panel x={120} y={90} w={430} h={320} opacity={p2} />
          <g opacity={p2}>
            <Badge x={120} y={90} n="1" />
          </g>
          <g opacity={p2}>
            <NameTag x={335} y={250} s={2.6} />
          </g>
          <Lock x={335} y={250} s={1.1} opacity={lock} />
          <g opacity={askB}>
            <Stick x={220} y={G} h={200} pose={pose({mood: 'smile', look: 1})} sw={8} />
          </g>
          <Bot x={700} y={290} s={1.3} opacity={p2} />
          <g opacity={noB} transform={`translate(0 ${-8 * (1 - noB)})`}>
            <Bubble x={700} y={170} w={110} h={80}>
              <text x={700} y={182} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={42} fill={C.crimson}>
                NO
              </text>
            </Bubble>
          </g>
          <g opacity={personIn}>
            <Stick x={820} y={G} h={200} hair="bob" pose={pose({mood: 'smile', look: -1})} sw={8} />
          </g>
          <Arrow x1={700} y1={360} x2={700 + 100 * toPerson} y2={360 + 140 * toPerson} p={toPerson > 0 ? 1 : 0} />
        </g>
      )}

      {/* ---------------- 3 ---------------- */}
      {s3 > 0 && (
        <g opacity={s3}>
          <Panel x={120} y={90} w={430} h={320} opacity={p3} />
          <g opacity={p3}>
            <Badge x={120} y={90} n="2" />
          </g>
          <g opacity={calQ}>
            <Calendar x={335} y={250} s={1.1} shade={[]} rows={4} w={300} h={220} />
            <Qmark x={335} y={290} size={110} color={C.crimson} />
          </g>
          <g opacity={askB2}>
            <Stick x={220} y={G} h={200} pose={pose({mood: 'smile', look: 1})} sw={8} />
          </g>
          <Bot x={700} y={290} s={1.3} opacity={p3} />
          <g opacity={dk} transform={`translate(0 ${-8 * (1 - dk)})`}>
            <Bubble x={700} y={170} w={230} h={80}>
              <text x={700} y={180} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={28} fill={C.ink}>
                I DON'T KNOW
              </text>
            </Bubble>
          </g>
          {guessX > 0 && (
            <g opacity={guessX}>
              <Bubble x={820} y={400} w={110} h={80}>
                <rect x={780} y={392} width={80} height={14} rx={7} fill="none" stroke={C.mid} strokeWidth={5} strokeDasharray="10 8" />
              </Bubble>
              <Cross x={820} y={400} r={22} p={guessX} />
            </g>
          )}
        </g>
      )}

      {/* ---------------- 4 ---------------- */}
      {s4 > 0 && (
        <g opacity={s4}>
          <Badge x={500} y={96} n="3" s={p4} />
          <g opacity={wordsB}>
            <Bubble x={240} y={260} w={250} h={110}>
              <Qmark x={240} y={252} size={52} />
            </Bubble>
            <Tag x={240} y={346} text="WORDS" size={22} />
          </g>
          <g opacity={langB}>
            <Bubble x={240} y={470} w={250} h={110}>
              <Qmark x={240} y={462} size={52} />
            </Bubble>
            <Tag x={240} y={556} text="LANGUAGE" size={22} />
          </g>
          <Arrow x1={380} y1={270} x2={380 + 130 * arrows} y2={270 + 70 * arrows} p={wordsB > 0 ? arrows : 0} />
          <Arrow x1={380} y1={470} x2={380 + 130 * arrows} y2={470 - 70 * arrows} p={langB > 0 ? arrows : 0} />
          <g opacity={ansB}>
            <Bubble x={700} y={370} w={250} h={130}>
              <rect x={600} y={350} width={160} height={14} rx={7} fill={C.soft} />
              <rect x={600} y={376} width={110} height={14} rx={7} fill={C.soft} />
            </Bubble>
            <Tick x={820} y={310} p={tickP} />
            <Tag x={700} y={470} text="MATCH" size={24} />
          </g>
        </g>
      )}

      {/* ---------------- 5 ---------------- */}
      {s5 > 0 && (
        <g opacity={s5}>
          <Bot x={500} y={170} s={1.4} opacity={botIn} />
          {plus > 0 && (
            <g transform={`translate(560 100) scale(${plus})`} opacity={plus}>
              <circle r={26} fill={C.crimson} />
              <path d="M -12 0 L 12 0 M 0 -12 L 0 12" stroke="#FFFFFF" strokeWidth={8} strokeLinecap="round" />
            </g>
          )}
          {[200, 380, 560].map((x, k) => (
            <g key={k} opacity={mem(k)}>
              <Stick x={x} y={G} h={210} hair={k === 1 ? 'bob' : undefined} pose={pose({mood: k === 2 ? 'sad' : 'smile', look: k === 2 ? 1 : 0})} />
              <line x1={x} y1={G - 250} x2={x + (500 - x) * 0.35} y2={G - 330} stroke={C.ink} strokeWidth={5} strokeLinecap="round" strokeDasharray="3 12" />
            </g>
          ))}
          <g opacity={mem(2)}>
            <rect x={730} y={380} width={130} height={250} rx={14} fill="#FFFFFF" stroke={C.ink} strokeWidth={8} />
            <circle cx={836} cy={510} r={8} fill={C.ink} />
          </g>
          <g opacity={mag}>
            <Qmark x={560} y={G - 290} size={60} color={C.crimson} />
            <g transform={`translate(620 ${G - 120}) scale(0.7)`}>
              <Magnifier />
            </g>
          </g>
          {flyQ > 0 && flyQ < 1 && (
            <g transform={`translate(${560 - 60 * flyQ} ${G - 290 - (G - 290 - 200) * flyQ})`}>
              <Bubble x={0} y={0} w={74} h={64}>
                <Qmark x={0} y={0} size={42} />
              </Bubble>
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
          <text x={500} y={570} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={44} fill={C.crimson} opacity={askP}>
            What will you ask first?
          </text>
        </g>
      )}
    </g>
  );
};
