import React from 'react';
import {Stick, STAND, type Pose} from './figure';
import {Bubble, Tag, Window, C, SANS, between, bounce, prog} from './kit';
import {Bell, FollowIcon} from './parts';
import type {Cues} from './PileStage';

/**
 * Stage art for "Quick or Quiet". One time axis (a ruler with marks at one and three seconds) carries the whole
 * argument: an app that answers at the one-second mark, a classroom whose answers get longer when the wait
 * stretches to three, and a coach whose method has an empty stretch in it on purpose.
 * `t` is seconds into the voiceover, `q` the cue times from content/quick-or-quiet.stick.json.
 */
const G = 630;
const lin = (v: number) => v;
const pose = (p: Partial<Pose> = {}): Pose => ({...STAND, ...p});

/** the shared time axis */
const X0 = 240;
const PS = 135;
const tx = (sec: number) => X0 + PS * sec;

const Stopwatch: React.FC<{x: number; y: number; s?: number; hand?: number; arc?: number; opacity?: number}> = ({x, y, s = 1, hand = 0, arc = 0, opacity = 1}) => {
  const a = hand * Math.PI * 2 - Math.PI / 2;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity}>
      <rect x={-22} y={-96} width={44} height={14} rx={7} fill={C.ink} />
      <rect x={-9} y={-84} width={18} height={22} fill="#FFFFFF" stroke={C.ink} strokeWidth={6} />
      <rect x={44} y={-62} width={18} height={24} rx={5} fill={C.ink} transform="rotate(45 52 -50)" />
      <circle r={60} fill="#FFFFFF" stroke={C.ink} strokeWidth={8} />
      {[0, 1, 2, 3].map((k) => (
        <line key={k} x1={Math.cos((k * Math.PI) / 2) * 46} y1={Math.sin((k * Math.PI) / 2) * 46} x2={Math.cos((k * Math.PI) / 2) * 53} y2={Math.sin((k * Math.PI) / 2) * 53} stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
      ))}
      {arc > 0.005 && <circle r={34} fill="none" stroke={C.crimson} strokeWidth={11} strokeLinecap="round" pathLength={100} strokeDasharray={`${Math.min(arc, 0.995) * 100} 100`} transform="rotate(-90)" />}
      <line x1={0} y1={0} x2={Math.cos(a) * 38} y2={Math.sin(a) * 38} stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
      <circle r={6} fill={C.ink} />
    </g>
  );
};

const Ruler: React.FC<{y: number; opacity?: number}> = ({y, opacity = 1}) => (
  <g opacity={opacity}>
    <line x1={X0} y1={y} x2={tx(3.5)} y2={y} stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
    <path d={`M ${tx(3.5) - 2} ${y - 14} L ${tx(3.5) + 18} ${y} L ${tx(3.5) - 2} ${y + 14}`} fill="none" stroke={C.ink} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
    {[0, 1, 2, 3].map((k) => {
      const big = k === 1 || k === 3;
      return (
        <g key={k}>
          <line x1={tx(k)} y1={y - (big ? 20 : 12)} x2={tx(k)} y2={y + (big ? 20 : 12)} stroke={big ? C.ink : C.mid} strokeWidth={6} strokeLinecap="round" />
          <text x={tx(k)} y={y + 48} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={26} fill={big ? C.ink : C.mid}>
            {k}
          </text>
        </g>
      );
    })}
  </g>
);

/** a block with grey text lines: one turn in a conversation */
const Turn: React.FC<{x: number; y: number; w: number; h?: number; lines?: number; opacity?: number}> = ({x, y, w, h = 58, lines = 2, opacity = 1}) => (
  <g opacity={opacity}>
    <rect x={x} y={y - h / 2} width={w} height={h} rx={14} fill="#FFFFFF" stroke={C.ink} strokeWidth={5} />
    {Array.from({length: lines}).map((_, i) => (
      <line key={i} x1={x + 16} y1={y - (lines - 1) * 8 + i * 16} x2={x + w - (i === lines - 1 ? 38 : 16)} y2={y - (lines - 1) * 8 + i * 16} stroke={C.soft} strokeWidth={7} strokeLinecap="round" />
    ))}
  </g>
);

/** a dashed crimson outline: the empty stretch (the quiet) */
const Stretch: React.FC<{x: number; y: number; w: number; h?: number; opacity?: number}> = ({x, y, w, h = 58, opacity = 1}) => (
  <rect x={x} y={y - h / 2} width={Math.max(0, w)} height={h} rx={14} fill="none" stroke={C.crimson} strokeWidth={6} strokeDasharray="14 10" strokeLinecap="round" opacity={opacity} />
);

const PulseDots: React.FC<{x: number; y: number; t: number; n?: number; r?: number; gap?: number; opacity?: number}> = ({x, y, t, n = 3, r = 7, gap = 24, opacity = 1}) => (
  <g opacity={opacity}>
    {Array.from({length: n}).map((_, k) => (
      <circle key={k} cx={x + k * gap} cy={y - Math.max(0, Math.sin(t * 5 - k * 0.8)) * 6} r={r} fill={C.ink} />
    ))}
  </g>
);

const Q: React.FC<{x: number; y: number; size?: number}> = ({x, y, size = 48}) => (
  <text x={x} y={y + size * 0.36} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={size} fill={C.ink}>
    ?
  </text>
);

export const QuietStage: React.FC<{t: number; q: Cues}> = ({t, q}) => {
  // =====================================================================================================
  // 1: quick or quiet (0 to 8.4): one app, one person, one stopwatch
  // =====================================================================================================
  const s1 = 1 - prog(t, q.year - 0.2, 0.3, lin);
  const in1 = prog(t, q.choose, 0.45, bounce);
  const quickW = t >= q.quick && t < q.waits;
  const quietW = t >= q.waits;
  const flash = t >= q.quick && t < q.quick + 0.6 ? 1 - prog(t, q.quick, 0.6, lin) : 0;
  const flash2 = t >= q.quickB && t < q.quickB + 0.6 ? 1 - prog(t, q.quickB, 0.6, lin) : 0;
  const quickLines = t >= q.quick + 0.1 && t < q.waits ? 1 : 0;
  const calmLines = prog(t, q.thinking + 0.4, 0.5);
  const hand1 = t < q.half ? 0 : t < q.waits ? 0.5 * prog(t, q.half, 0.68, lin) : t < q.waitsW ? 0 : prog(t, q.waitsW, q.thinking - q.waitsW, lin);
  const arc1 = hand1;
  const dots1 = [prog(t, 2.3, 0.3, bounce), prog(t, 4.2, 0.3, bounce), prog(t, 6.2, 0.3, bounce)];
  const thoughtDone = prog(t, q.thinking, 0.35, bounce);
  const p1: Pose = pose({mood: t >= q.quick && t < q.waits ? 'open' : t >= q.thinking ? 'smile' : 'flat', look: -1});
  const winLines = [{y: 385, w: 230}, {y: 425, w: 230}, {y: 465, w: 150}];

  // =====================================================================================================
  // 2: Mary Budd Rowe's classroom (8.47 to 26.9)
  // =====================================================================================================
  const s2 = between(t, q.year, q.app - 0.1, 0.3);
  const tag70 = t < q.researcher ? prog(t, q.year, 0.35, bounce) : 0;
  const tagName = t >= q.researcher && t < q.convo - 0.1 ? prog(t, q.researcher, 0.35, bounce) : 0;
  const researcherIn = prog(t, q.researcher, 0.45, bounce);
  const panelIn = prog(t, q.convo - 0.1, 0.35) * (1 - prog(t, q.app - 0.3, 0.3));
  const rulerIn = prog(t, q.teachers, 0.4);
  const stopIn = prog(t, q.timed, 0.4, bounce);
  const rows = [216, 256, 296, 336];
  const PX = 170;
  // the back-and-forth of a lesson, before the clock starts
  const talk = [
    {i: 0, w: 200, at: q.convo + 0.1},
    {i: 1, w: 140, at: q.convo + 0.4},
    {i: 2, w: 240, at: q.convo + 0.7},
    {i: 3, w: 170, at: q.convo + 1.0},
  ];
  const talkOut = 1 - prog(t, q.teachers - 0.2, 0.3, lin);
  // first wait: about one second
  const world1 = t < q.reset;
  const w1 = prog(t, q.waited, q.one + 0.58 - q.waited, lin); // 0..1 of the first second
  const world1Fade = 1 - prog(t, q.reset, 0.25, lin);
  // second wait: three seconds or more
  const sec2 = 3 * prog(t, q.waited2, 1.6, lin);
  const more = prog(t, q.more, 0.3);
  const secNow = world1 ? w1 : sec2;
  const clockHand = (world1 ? w1 : sec2) / 4;
  const qIn = prog(t, q.teachers, 0.35, bounce);
  const qPulse = 1 + 0.25 * Math.sin(Math.min(1, Math.max(0, (t - q.asking) / 0.4)) * Math.PI);
  // hands and bars. student order left to right: 0, 1, 2, 3
  const hand = (i: number) => {
    const on1 = i === 1 ? between(t, 16.55, q.reset, 0.2) : 0;
    const on2 = [prog(t, 22.72, 0.3), prog(t, 20.9, 0.3), prog(t, q.spoke, 0.3), prog(t, 24.31, 0.3)][i];
    return Math.max(on1, on2);
  };
  const longLen = [280, 330, 300, 240];
  const bar = (i: number) => {
    const g2 = [prog(t, 23.0, 0.6), prog(t, q.longer, 0.8), prog(t, 23.7, 0.6), prog(t, 24.5, 0.6)][i];
    const g1 = i === 1 ? prog(t, 17.0, 0.4) * world1Fade * (t < q.reset + 0.3 ? 1 : 0) : 0;
    return {len: Math.max(80 * g1, longLen[i] * g2), crimson: world1 ? 0 : 1};
  };
  const tail = [prog(t, 25.58, 0.5), prog(t, 25.03, 0.5), 0, prog(t, 26.15, 0.5)];
  const tailLen = [100, 120, 0, 90];
  const teacherAsk = between(t, q.teachers, q.waited + 0.5, 0.2);
  const students = [
    {x: 330, hair: undefined},
    {x: 440, hair: 'bob' as const},
    {x: 550, hair: undefined},
    {x: 660, hair: 'ponytail' as const},
  ];

  // =====================================================================================================
  // 3: an AI app that answers in under a second (27.11 to 37.7)
  // =====================================================================================================
  const s3 = between(t, q.app, q.coach - 0.1, 0.3);
  const personIn = prog(t, q.app, 0.45, bounce);
  const winIn = prog(t, q.appWord - 0.2, 0.45, bounce);
  const ans3 = prog(t, q.fast + 0.1, 0.12);
  const flagDrop = prog(t, q.under, 0.35, bounce);
  const flash3 = t >= q.fast && t < q.fast + 0.6 ? 1 - prog(t, q.fast, 0.6, lin) : 0;
  const flash3b = t >= q.quickB && t < q.quickB + 0.6 ? 1 - prog(t, q.quickB, 0.6, lin) : 0;
  const thinkSec = prog(t, q.fast, 2.0, lin) + 2.0 * prog(t, q.fast + 2.03, 6.1, lin);
  const xe = tx(Math.min(3.05, thinkSec));
  const barIn = prog(t, q.fast, 0.2);
  const p3: Pose = pose({mood: t >= q.deciding - 0.3 ? 'sad' : 'flat', look: -1, rh: t >= q.someone ? [0.13, 0.04] : [0.17, 0.27]});
  const bub3 = prog(t, q.someone, 0.4, bounce);
  const line1 = prog(t, q.deciding, 0.4);
  const line2 = prog(t, q.deciding + 0.8, 0.4);
  const heavy = prog(t, q.hard, 0.4, bounce);
  const connector = prog(t, q.under + 0.1, 0.4);

  // =====================================================================================================
  // 4: the coach lets the quiet run; the pause is part of the method, not in the book (37.86 to 44.8)
  // =====================================================================================================
  const s4 = between(t, q.coach, q.silenceIf - 0.1, 0.3);
  const figs4 = prog(t, q.coach, 0.4, bounce);
  const qTurn = prog(t, q.coach + 0.4, 0.35);
  const gapW = 250 * prog(t, q.quietRun, 0.7);
  const aTurn = prog(t, 40.3, 0.3);
  const pauseTag = prog(t, q.pause + 0.07, 0.35, bounce);
  const bracket = prog(t, q.part, 0.45);
  const methodTag = prog(t, q.method, 0.35, bounce);
  const rowB = prog(t, q.book, 0.4);
  const bookTag = prog(t, q.book + 1.0, 0.35, bounce);
  const bTurn = prog(t, q.book + 0.45, 0.35);

  // =====================================================================================================
  // 5: write down how long you wait and why; the app needs to learn it (44.88 to 53.1)
  // =====================================================================================================
  const s5 = between(t, q.silenceIf, q.ask - 0.05, 0.3);
  const note = prog(t, q.silenceIf + 0.05, 0.4, bounce);
  const mini = prog(t, 45.7, 0.4);
  const stretch5 = prog(t, q.silence - 0.15, 0.4, bounce);
  const row2 = prog(t, q.howLong - 0.1, 0.4, bounce);
  const row3 = prog(t, q.why, 0.4, bounce);
  const writing = between(t, q.write, q.learnStart - 0.3, 0.2);
  const appIn = prog(t, q.learnStart, 0.4, bounce);
  const fly = prog(t, q.learnStart + 0.35, 0.8);
  const check5 = prog(t, q.learn, 0.5, lin);
  const coach5: Pose = pose({
    mood: 'smile',
    rh: writing > 0.5 ? [0.23 + 0.02 * Math.sin(t * 9), -0.34] : [0.17, 0.27],
    lh: [-0.17, 0.27],
  });

  // =====================================================================================================
  // 6: how long do you wait? (53.24 to 55.6)
  // =====================================================================================================
  const s6 = between(t, q.ask, q.cta - 0.05, 0.3);
  const bigIn = prog(t, q.ask, 0.5, bounce);
  const sweep = prog(t, q.ask, 2.4, lin);
  const askQ = prog(t, q.askWait, 0.4, bounce);

  // =====================================================================================================
  // 7: end card
  // =====================================================================================================
  const ctaOn = prog(t, q.cta, 0.5, bounce);
  const bellP = prog(t, q.subscribe, 1.6, lin);
  const bellIn = prog(t, q.subscribe - 0.1, 0.4, bounce);
  const stretchPulse = 0.5 + 0.5 * Math.sin(Math.max(0, t - q.quietEnd) * 5);

  return (
    <g>
      {/* ---------------------------------------- 1 ---------------------------------------- */}
      {s1 > 0 && (
        <g opacity={s1}>
          <g opacity={in1}>
            <Window x={170} y={290} w={290} h={220} title="" />
            {/* the answer, as grey lines */}
            {winLines.map((l, i) => (
              <line key={i} x1={195} y1={l.y} x2={195 + l.w} y2={l.y} stroke={C.soft} strokeWidth={10} strokeLinecap="round" opacity={Math.max(quickLines, calmLines)} />
            ))}
            {/* the quick flash */}
            {(flash > 0 || flash2 > 0) && (
              <g stroke={C.crimson} strokeWidth={8} strokeLinecap="round" opacity={Math.max(flash, flash2)}>
                <line x1={480} y1={330} x2={510} y2={316} />
                <line x1={484} y1={400} x2={518} y2={400} />
                <line x1={480} y1={470} x2={510} y2={484} />
                <line x1={150} y1={330} x2={122} y2={316} />
                <line x1={146} y1={400} x2={116} y2={400} />
                <line x1={150} y1={470} x2={122} y2={484} />
              </g>
            )}
            <Stopwatch x={315} y={130} s={1} hand={hand1} arc={arc1} />
            {quickW && <Tag x={315} y={232} text="QUICK" size={28} opacity={prog(t, q.quick, 0.3, bounce)} />}
            {quietW && <Tag x={315} y={232} text="QUIET" size={28} opacity={prog(t, q.waits, 0.3, bounce)} />}
            {t >= q.half && t < q.waits && <Tag x={500} y={96} text="0.5 SEC" size={22} opacity={prog(t, q.half, 0.3, bounce)} />}
          </g>
          <g opacity={in1}>
            <Stick x={720} y={G} h={270} pose={p1} hair="bun" />
            <circle cx={722} cy={322} r={8} fill="none" stroke={C.ink} strokeWidth={4} opacity={dots1[0]} />
            <circle cx={724} cy={284} r={12} fill="none" stroke={C.ink} strokeWidth={4} opacity={dots1[0]} />
            <Bubble x={715} y={190} w={260} h={104} opacity={dots1[0]}>
              {thoughtDone < 0.05 &&
                [665, 715, 765].map((cx, k) => (
                  <circle key={k} cx={cx} cy={190 - Math.max(0, Math.sin(t * 5 - k * 0.8)) * 5} r={9} fill={C.ink} opacity={dots1[k]} />
                ))}
              {thoughtDone >= 0.05 && (
                <g opacity={thoughtDone}>
                  {[{y: 165, x2: 805}, {y: 190, x2: 805}, {y: 215, x2: 735}].map((l, i) => (
                    <line key={i} x1={625} y1={l.y} x2={l.x2} y2={l.y} stroke={C.soft} strokeWidth={9} strokeLinecap="round" />
                  ))}
                </g>
              )}
            </Bubble>
            {t < q.quick && <g opacity={prog(t, q.choose + 0.4, 0.35, bounce)}><Q x={565} y={470} size={120} /></g>}
          </g>
        </g>
      )}

      {/* ---------------------------------------- 2 ---------------------------------------- */}
      {s2 > 0 && (
        <g opacity={s2}>
          {tag70 > 0 && <Tag x={500} y={270} text="1970S" size={64} opacity={tag70} />}
          {tagName > 0 && <Tag x={500} y={270} text="MARY BUDD ROWE" size={34} opacity={tagName} />}
          {/* the board of answers */}
          {panelIn > 0 && (
            <g opacity={panelIn}>
              <rect x={PX + 12} y={190} width={620} height={194} rx={34} fill={C.soft} />
              <rect x={PX} y={176} width={620} height={194} rx={34} fill="#FFFFFF" stroke={C.ink} strokeWidth={5} />
              {rows.map((ry, i) => (
                <g key={i}>
                  <circle cx={214} cy={ry} r={9} fill="none" stroke={C.mid} strokeWidth={4} />
                  <line x1={250} y1={ry} x2={560} y2={ry} stroke={C.soft} strokeWidth={5} strokeLinecap="round" strokeDasharray="2 12" />
                </g>
              ))}
              {talk.map((r) => (
                <line key={r.i} x1={250} y1={rows[r.i]} x2={250 + r.w * prog(t, r.at, 0.35)} y2={rows[r.i]} stroke={C.soft} strokeWidth={14} strokeLinecap="round" opacity={talkOut} />
              ))}
              {rows.map((ry, i) => {
                const b = bar(i);
                const tl = tail[i] * tailLen[i];
                return (
                  <g key={i}>
                    {b.len > 1 && <line x1={250} y1={ry} x2={250 + b.len} y2={ry} stroke={C.ink} strokeWidth={14} strokeLinecap="round" />}
                    {tl > 1 && b.len > 1 && <line x1={250 + b.len + 14} y1={ry} x2={250 + b.len + 14 + tl} y2={ry} stroke={C.crimson} strokeWidth={14} strokeLinecap="round" />}
                  </g>
                );
              })}
            </g>
          )}
          {/* the clock */}
          {rulerIn > 0 && (
            <g opacity={rulerIn}>
              <Ruler y={100} />
              {/* the wait, drawn on the axis */}
              {world1 && <rect x={X0} y={92} width={PS * w1} height={16} rx={8} fill={C.ink} opacity={world1Fade} />}
              {!world1 && (
                <g>
                  <rect x={X0} y={92} width={PS * Math.min(1, sec2)} height={16} rx={8} fill={C.ink} />
                  {sec2 > 1 && <rect x={X0 + PS} y={92} width={PS * (Math.min(3, sec2) - 1)} height={16} rx={8} fill={C.crimson} />}
                  {more > 0 && <path d={`M ${tx(3) + 8} 100 L ${tx(3.45)} 100`} stroke={C.crimson} strokeWidth={9} strokeLinecap="round" strokeDasharray="4 14" opacity={more} />}
                </g>
              )}
              {t >= q.teachers && t < q.reset && <Tag x={tx(1)} y={50} text="1 SEC" size={22} opacity={prog(t, q.one, 0.3, bounce) * world1Fade} />}
              {t >= q.three - 0.2 && <Tag x={tx(3)} y={50} text="3 SEC OR MORE" size={22} fill={C.crimson} opacity={prog(t, q.three - 0.2, 0.3, bounce)} />}
              {/* the question that starts the wait */}
              <g transform={`translate(${X0} 50) scale(${qIn * qPulse})`}>
                <Bubble x={0} y={0} w={64} h={54}>
                  <Q x={0} y={0} size={40} />
                </Bubble>
              </g>
            </g>
          )}
          {stopIn > 0 && <Stopwatch x={160} y={105} s={0.55 * stopIn} hand={clockHand} arc={Math.min(1, secNow / 4)} opacity={stopIn} />}
          {/* the cast */}
          <Stick x={205} y={G} h={205} pose={pose({rh: teacherAsk > 0.5 ? [0.1, -0.32] : [0.17, 0.27], mood: 'smile', look: 1})} />
          {students.map((s, i) => (
            <Stick key={i} x={s.x} y={G} h={180} hair={s.hair} pose={pose({rh: [0.06 + 0.08 * hand(i), 0.27 - 0.6 * hand(i)], lh: [-0.17, 0.27], mood: 'smile', look: -0.5})} />
          ))}
          {researcherIn > 0 && (
            <g opacity={Math.min(1, researcherIn * 2)}>
              <Stick x={845} y={G} h={205} hair="long" pose={pose({lh: [-0.22, -0.2 * researcherIn], mood: 'smile', look: -1})} />
            </g>
          )}
        </g>
      )}

      {/* ---------------------------------------- 3 ---------------------------------------- */}
      {s3 > 0 && (
        <g opacity={s3}>
          <Ruler y={275} opacity={prog(t, q.app, 0.4)} />
          {barIn > 0 && (
            <g opacity={barIn}>
              <rect x={X0} y={268} width={Math.max(0, xe - X0)} height={14} rx={7} fill={C.cast} />
              <PulseDots x={xe + 22} y={275} t={t} n={3} r={5} gap={16} />
            </g>
          )}
          {flagDrop > 0 && (
            <g transform={`translate(${tx(1)} ${275 - 40 * (1 - flagDrop)})`} opacity={Math.min(1, flagDrop * 2)}>
              <line x1={0} y1={0} x2={0} y2={-38} stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
              <path d="M 0 -38 L 52 -24 L 0 -10 Z" fill={C.crimson} stroke={C.crimson} strokeWidth={4} strokeLinejoin="round" />
            </g>
          )}
          {t >= q.under && <Tag x={330} y={130} text="UNDER 1 SEC" size={34} opacity={prog(t, q.under, 0.35, bounce)} />}
          {winIn > 0 && (
            <g opacity={Math.min(1, winIn * 2)}>
              <Window x={170} y={400} w={290} h={215} title="AI APP" />
              {winLines.map((l, i) => (
                <line key={i} x1={195} y1={l.y + 108} x2={195 + l.w} y2={l.y + 108} stroke={C.soft} strokeWidth={10} strokeLinecap="round" opacity={ans3} />
              ))}
              {(flash3 > 0 || flash3b > 0) && (
                <g stroke={C.crimson} strokeWidth={8} strokeLinecap="round" opacity={Math.max(flash3, flash3b)}>
                  <line x1={480} y1={440} x2={510} y2={426} />
                  <line x1={484} y1={510} x2={518} y2={510} />
                  <line x1={480} y1={580} x2={510} y2={594} />
                  <line x1={150} y1={440} x2={122} y2={426} />
                  <line x1={146} y1={510} x2={116} y2={510} />
                  <line x1={150} y1={580} x2={122} y2={594} />
                </g>
              )}
            </g>
          )}
          {connector > 0 && (
            <g opacity={connector}>
              <path d={`M ${tx(1)} ${400 - 8} L ${tx(1)} ${340}`} fill="none" stroke={C.crimson} strokeWidth={6} strokeLinecap="round" strokeDasharray="4 12" />
              <path d={`M ${tx(1) - 12} 350 L ${tx(1)} 334 L ${tx(1) + 12} 350`} fill="none" stroke={C.crimson} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
            </g>
          )}
          <g opacity={personIn}>
            <Stick x={785} y={G} h={240} pose={p3} />
          </g>
          {bub3 > 0 && (
            <g opacity={bub3}>
              <circle cx={788} cy={340} r={7} fill="none" stroke={C.ink} strokeWidth={4} />
              <circle cx={783} cy={292} r={10} fill="none" stroke={C.ink} strokeWidth={4} />
              <circle cx={775} cy={244} r={14} fill="none" stroke={C.ink} strokeWidth={4} />
              <Bubble x={690} y={150} w={250} h={104}>
                {t < q.deciding && <PulseDots x={645} y={150} t={t} n={3} r={9} gap={30} />}
                {t >= q.deciding && (
                  <g>
                    <line x1={600} y1={128} x2={600 + 190 * line1} y2={128} stroke={C.soft} strokeWidth={9} strokeLinecap="round" />
                    <line x1={600} y1={152} x2={600 + 120 * line2} y2={152} stroke={C.soft} strokeWidth={9} strokeLinecap="round" strokeDasharray="14 12" />
                    <PulseDots x={742} y={152} t={t} n={3} r={4} gap={14} opacity={line2} />
                    {heavy > 0 && <rect x={600} y={170} width={76 * heavy} height={14} rx={7} fill={C.ink} />}
                  </g>
                )}
              </Bubble>
            </g>
          )}
        </g>
      )}

      {/* ---------------------------------------- 4 ---------------------------------------- */}
      {s4 > 0 && (
        <g opacity={s4}>
          <g opacity={figs4}>
            <Stick x={250} y={G} h={210} hair="bob" pose={pose({mood: 'smile', lh: [-0.12, 0.22], rh: [0.12, 0.22]})} />
            <Stick x={750} y={G} h={210} pose={pose({mood: 'smile', look: -1})} />
          </g>
          <g transform="translate(0 20)">
          {bracket > 0 && <rect x={235} y={125} width={530} height={120} rx={28} fill="none" stroke={C.ink} strokeWidth={5} opacity={bracket} />}
          {qTurn > 0 && <Turn x={255} y={185} w={100 * qTurn} opacity={qTurn} />}
          {gapW > 1 && <Stretch x={365} y={185} w={gapW} />}
          {gapW > 200 && <PulseDots x={460} y={185} t={t} n={3} r={7} gap={30} />}
          {aTurn > 0 && <Turn x={625} y={185} w={120} lines={3} opacity={aTurn} />}
          {pauseTag > 0 && <Tag x={490} y={125} text="PAUSE" size={20} fill={C.crimson} opacity={pauseTag} />}
          {methodTag > 0 && <Tag x={300} y={125} text="METHOD" size={20} opacity={methodTag} />}
          {rowB > 0 && (
            <g opacity={rowB}>
              <rect x={235} y={285} width={530} height={80} rx={26} fill="none" stroke={C.mid} strokeWidth={5} />
              <Turn x={255} y={325} w={100} opacity={bTurn} />
              <Turn x={365} y={325} w={120} lines={3} opacity={bTurn} />
            </g>
          )}
          {bookTag > 0 && <Tag x={300} y={285} text="THE BOOK" size={20} fill={C.mid} opacity={bookTag} />}
          </g>
        </g>
      )}

      {/* ---------------------------------------- 5 ---------------------------------------- */}
      {s5 > 0 && (
        <g opacity={s5}>
          <g opacity={note}>
            <rect x={142} y={104} width={410} height={230} rx={34} fill={C.soft} />
            <rect x={130} y={90} width={410} height={230} rx={34} fill="#FFFFFF" stroke={C.ink} strokeWidth={5} />
            {/* the method, with its quiet */}
            <g opacity={mini}>
              <Turn x={160} y={140} w={56} h={40} lines={1} />
              <Turn x={344} y={140} w={56} h={40} lines={1} />
              <g opacity={stretch5}>
                <Stretch x={228} y={140} w={104} h={40} />
              </g>
            </g>
            <g opacity={row2}>
              <Stopwatch x={182} y={214} s={0.42} />
              <Tag x={338} y={214} text="HOW LONG" size={22} />
            </g>
            <g opacity={row3}>
              <Tag x={212} y={282} text="WHY" size={22} />
              <line x1={288} y1={274} x2={510} y2={274} stroke={C.soft} strokeWidth={9} strokeLinecap="round" />
              <line x1={288} y1={294} x2={430} y2={294} stroke={C.soft} strokeWidth={9} strokeLinecap="round" />
            </g>
          </g>
          <Stick x={330} y={G} h={250} hair="long" pose={coach5} opacity={note} />
          <Stick x={770} y={G} h={230} pose={pose({mood: 'smile', look: -1})} opacity={appIn} />
          {appIn > 0 && (
            <g opacity={Math.min(1, appIn * 2)}>
              <Window x={600} y={90} w={270} h={210} title="APP" />
              {fly >= 1 && (
                <g>
                  <Stopwatch x={650} y={218} s={0.42} />
                  <Tag x={775} y={218} text="HOW LONG" size={18} />
                </g>
              )}
              {check5 > 0 && (
                <g transform="translate(735 268)" opacity={Math.min(1, check5 * 3)}>
                  <path d="M -16 0 L -5 12 L 18 -12" fill="none" stroke={C.crimson} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={60} strokeDashoffset={60 * (1 - check5)} />
                </g>
              )}
            </g>
          )}
          {fly > 0 && fly < 1 && (
            <g transform={`translate(${260 + (712.5 - 260) * fly} ${214 + 4 * fly - 70 * Math.sin(fly * Math.PI)})`}>
              <Stopwatch x={-(156 - 31 * fly) / 2} y={0} s={0.42} />
              <Tag x={(156 - 31 * fly) / 2} y={0} text="HOW LONG" size={22 - 4 * fly} />
            </g>
          )}
        </g>
      )}

      {/* ---------------------------------------- 6 ---------------------------------------- */}
      {s6 > 0 && (
        <g opacity={s6}>
          <Stopwatch x={500} y={350} s={2.5 * bigIn} hand={sweep * 0.7} arc={sweep * 0.7} />
          {askQ > 0 && (
            <g opacity={askQ}>
              <circle cx={742} cy={190} r={9} fill="none" stroke={C.ink} strokeWidth={4} />
              <circle cx={718} cy={222} r={6} fill="none" stroke={C.ink} strokeWidth={4} />
              <Bubble x={790} y={130} w={120} h={92}>
                <Q x={790} y={130} size={64} />
              </Bubble>
            </g>
          )}
        </g>
      )}

      {/* ---------------------------------------- 7: end card ---------------------------------------- */}
      {ctaOn > 0 && (
        <g opacity={Math.min(1, ctaOn * 2)}>
          <FollowIcon x={500} y={250} s={1.4 * ctaOn} />
          {bellIn > 0 && <Bell x={500} y={408} s={1.3 * bellIn} ring={bellP} />}
          <Tag x={500} y={522} text="FOLLOW AND SUBSCRIBE" size={38} opacity={prog(t, q.cta + 0.15, 0.4, bounce)} />
          <rect x={330} y={580} width={340} height={14} rx={7} fill="none" stroke={C.crimson} strokeWidth={5} strokeDasharray="12 10" opacity={t >= q.quietEnd ? 0.35 + 0.65 * stretchPulse : 0.35} />
        </g>
      )}
    </g>
  );
};
