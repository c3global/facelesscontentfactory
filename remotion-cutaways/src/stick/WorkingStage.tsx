import React from 'react';
import {Stick, STAND, type Pose} from './figure';
import {Bubble, Card, Cross, Panel, Tag, C, SANS, between, bounce, prog} from './kit';
import {FollowIcon, Heart} from './parts';
import {Calendar, Magnifier, ThumbsUp} from './icons2';
import type {Cues} from './PileStage';

/**
 * Stage art for "Is Your Community Really Working?".
 * Metaphor: a laptop whose log-in line climbs but tells nothing, then three signal slots (replies, week two, starting
 * something), a notebook that says pick one, and a before and after bar.
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
const Tick: React.FC<{x: number; y: number; p: number}> = ({x, y, p}) => (
  <path d={`M ${x - 12} ${y} L ${x - 3} ${y + 10} L ${x + 15} ${y - 11}`} fill="none" stroke={C.crimson} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={50} strokeDashoffset={50 * (1 - p)} opacity={Math.min(1, p * 4)} />
);
const Arrow: React.FC<{x1: number; y1: number; x2: number; y2: number; p: number; color?: string; dash?: boolean}> = ({x1, y1, x2, y2, p, color = C.ink, dash}) => {
  const x = x1 + (x2 - x1) * p;
  const y = y1 + (y2 - y1) * p;
  const a = Math.atan2(y2 - y1, x2 - x1);
  return (
    <g opacity={p > 0.02 ? 1 : 0}>
      <line x1={x1} y1={y1} x2={x} y2={y} stroke={color} strokeWidth={7} strokeLinecap="round" strokeDasharray={dash ? '4 14' : undefined} />
      <path d={`M ${x - Math.cos(a - 0.5) * 22} ${y - Math.sin(a - 0.5) * 22} L ${x} ${y} L ${x - Math.cos(a + 0.5) * 22} ${y - Math.sin(a + 0.5) * 22}`} fill="none" stroke={color} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
};
const House: React.FC<{x: number; y: number; w?: number; h?: number; opacity?: number}> = ({x, y, w = 560, h = 300, opacity = 1}) => (
  <g opacity={opacity}>
    <path d={`M ${x - w / 2 - 20} ${y - h + 90} L ${x} ${y - h} L ${x + w / 2 + 20} ${y - h + 90}`} fill="none" stroke={C.ink} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
    <rect x={x - w / 2} y={y - h + 90} width={w} height={h - 90} fill="none" stroke={C.ink} strokeWidth={7} strokeDasharray="18 12" strokeLinecap="round" />
  </g>
);

/** the three signal slots, drawn at the top of the stage during signals 1 to 3 */
const SLOT_X = [230, 500, 770];
const SlotIcon: React.FC<{k: number; on: number; hot: boolean}> = ({k, on, hot}) => (
  <g transform={`translate(${SLOT_X[k]} 150) scale(${0.55 + 0.45 * on})`} opacity={on}>
    <circle r={74} fill="#FFFFFF" stroke={hot ? C.crimson : C.ink} strokeWidth={hot ? 8 : 6} />
    {k === 0 && (
      <g>
        <Bubble x={-20} y={-10} w={58} h={40} />
        <Bubble x={20} y={16} w={58} h={40} />
      </g>
    )}
    {k === 1 && (
      <g>
        <rect x={-22} y={-40} width={44} height={74} rx={6} fill="none" stroke={C.ink} strokeWidth={6} />
        <circle cx={12} cy={-2} r={4} fill={C.ink} />
      </g>
    )}
    {k === 2 && (
      <g>
        <line x1={-10} y1={34} x2={-10} y2={-36} stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
        <path d="M -10 -36 L 34 -24 L -10 -10 Z" fill="#FFFFFF" stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
      </g>
    )}
  </g>
);

export const WorkingStage: React.FC<{t: number; q: Cues}> = ({t, q}) => {
  // ---- 1: the log-in line (0 to 6.8)
  const s1 = 1 - prog(t, q.signals - 0.3, 0.3, lin);
  const in1 = prog(t, q.how, 0.5, bounce);
  const climb = prog(t, q.how + 0.6, q.logins - q.how - 0.2, lin);
  const loginTag = prog(t, q.logins, 0.35, bounce);
  const shrug = prog(t, q.tell, 0.35, bounce);

  // ---- slots (6.4 to 37.5)
  const slotsOn = between(t, q.signals - 0.2, q.pick - 0.2, 0.3);
  const slot = (k: number) => prog(t, [q.signals + 0.3 + k * 0.35, q.first, q.second][k] * 0 + [q.signals + 0.3, q.signals + 0.65, q.signals + 1.0][k], 0.35, bounce);
  const hot = (k: number) => (k === 0 ? t >= q.first - 0.2 && t < q.second - 0.2 : k === 1 ? t >= q.second - 0.2 && t < q.third - 0.2 : t >= q.third - 0.2);
  const mag = (() => {
    // the magnifier sits on the active signal; during the intro it sweeps across all three
    if (t < q.first - 0.2) return {x: SLOT_X[0] + (SLOT_X[2] - SLOT_X[0]) * prog(t, q.signals + 0.9, 1.4, sm), on: prog(t, q.signals + 0.8, 0.3)};
    const k = t < q.second - 0.2 ? 0 : t < q.third - 0.2 ? 1 : 2;
    return {x: SLOT_X[k], on: 1};
  })();

  // ---- sig 1: replies (8.9 to 17.9)
  const s2 = between(t, q.first - 0.1, q.second - 0.2, 0.3);
  const eachOther = prog(t, q.reply, 0.6) * (1 - prog(t, q.onlyYou - 0.05, 0.15, lin));
  const toYou = prog(t, q.onlyYou, 0.6) * (1 - prog(t, q.answer - 0.05, 0.15, lin));
  const crossP = prog(t, q.onlyYou + 0.7, 0.4);
  const again = prog(t, q.answer, 0.6);
  const ring = prog(t, q.belongs, 0.5, bounce);

  // ---- sig 2: week two (18.1 to 28.3)
  const s3 = between(t, q.second - 0.1, q.third - 0.2, 0.3);
  const newIn = prog(t, q.newcomers, 0.45, bounce);
  const wk = prog(t, q.week, 0.4, bounce);
  const visit1 = prog(t, q.firstVisit, 0.7, sm);
  const leave = prog(t, q.firstVisit + 1.8, 0.9, sm);
  const curious = prog(t, q.firstVisit + 0.9, 0.35, bounce) * (1 - prog(t, q.firstVisit + 1.8, 0.3));
  const visit2 = prog(t, q.secondOne, 0.8, sm);
  const door2 = prog(t, q.reason, 0.4, bounce);

  // ---- sig 3: starting something (28.6 to 37.5)
  const s4 = between(t, q.third - 0.1, q.pick - 0.2, 0.3);
  const raise = prog(t, q.start, 0.4, bounce);
  const item = (at: number) => prog(t, at, 0.4, bounce);
  const homeP = prog(t, q.home, 0.6, bounce);

  // ---- pick one (37.8 to 43.6)
  const s5 = between(t, q.pick - 0.1, q.then - 0.2, 0.3);
  const note = prog(t, q.pick, 0.5, bounce);
  const circle = prog(t, q.pick + 0.9, 0.5);
  const todayP = prog(t, q.write, 0.4, bounce);
  const inkLine = prog(t, q.write + 0.6, 0.9);

  // ---- before and after (43.7 to 47.2)
  const s6 = between(t, q.then - 0.1, q.cta - 0.1, 0.3);
  const bars = prog(t, q.then, 0.5, bounce);
  const grow = prog(t, q.then + 0.8, 1.2, sm);
  const thumb = prog(t, q.helped, 0.35, bounce);

  // ---- end card
  const ctaOn = prog(t, q.cta, 0.5, bounce);
  const askP = prog(t, q.cta + 0.7, 0.45, bounce);

  return (
    <g>
      {/* ---------------- 1 ---------------- */}
      {s1 > 0 && (
        <g opacity={s1}>
          <g opacity={in1}>
            <rect x={150} y={150} width={400} height={280} rx={22} fill="#FFFFFF" stroke={C.ink} strokeWidth={8} />
            <rect x={110} y={430} width={480} height={26} rx={13} fill={C.ink} />
            <polyline points={`190,380 ${190 + 140 * climb},${380 - 80 * climb} ${190 + 220 * climb},${380 - 130 * climb} ${190 + 320 * climb},${380 - 190 * climb}`} fill="none" stroke={C.ink} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />
            <g opacity={loginTag}>
              <Tag x={350} y={196} text="LOG-INS" size={22} />
            </g>
          </g>
          <Stick x={760} y={G} h={270} pose={pose({lh: [-0.3, 0.02], rh: [0.3, 0.02], mood: shrug > 0.5 ? 'flat' : 'smile', look: -1})} opacity={in1} />
          <g opacity={shrug} transform={`translate(0 ${-8 * (1 - shrug)})`}>
            <Bubble x={760} y={290} w={110} h={96}>
              <Qmark x={760} y={290} size={62} color={C.crimson} />
            </Bubble>
          </g>
        </g>
      )}

      {/* ---------------- slots ---------------- */}
      {slotsOn > 0 && (
        <g opacity={slotsOn}>
          {[0, 1, 2].map((k) => (
            <SlotIcon key={k} k={k} on={slot(k)} hot={hot(k)} />
          ))}
          <g transform={`translate(${mag.x + 34} 188)`} opacity={mag.on * 0.95}>
            <Magnifier s={0.6} />
          </g>
        </g>
      )}

      {/* ---------------- signal 1 ---------------- */}
      {s2 > 0 && (
        <g opacity={s2}>
          <Stick x={230} y={G} h={230} pose={pose({mood: 'smile', look: 1})} />
          <Stick x={770} y={G} h={230} hair="bob" pose={pose({mood: 'smile', look: -1})} />
          <Stick x={500} y={G} h={230} hair="long" pose={pose({mood: 'flat', look: 0})} opacity={between(t, q.onlyYou - 0.6, q.answer - 0.1, 0.2)} />
          {/* to each other */}
          <Arrow x1={290} y1={420} x2={710} y2={420} p={Math.max(eachOther, again)} />
          <Arrow x1={710} y1={470} x2={290} y2={470} p={Math.max(eachOther, again)} />
          {/* only to you */}
          <Arrow x1={290} y1={330} x2={460} y2={330} p={toYou} color={C.mid} />
          <Arrow x1={710} y1={330} x2={540} y2={330} p={toYou} color={C.mid} />
          {crossP > 0 && toYou > 0 && <Cross x={500} y={430} r={28} p={crossP} />}
          {again > 0.9 && <Tick x={500} y={445} p={prog(t, q.answer + 0.7, 0.4)} />}
          {ring > 0 && (
            <g opacity={ring}>
              <rect x={150} y={330} width={700} height={280} rx={40} fill="none" stroke={C.crimson} strokeWidth={6} strokeDasharray="16 12" strokeLinecap="round" />
              <g transform="translate(500 340) scale(0.8)">
                <Heart />
              </g>
            </g>
          )}
        </g>
      )}

      {/* ---------------- signal 2 ---------------- */}
      {s3 > 0 && (
        <g opacity={s3}>
          <rect x={430} y={380} width={140} height={250} rx={14} fill="#FFFFFF" stroke={C.ink} strokeWidth={8} opacity={newIn} />
          <circle cx={540} cy={510} r={9} fill={C.ink} opacity={newIn * (1 - door2)} />
          {door2 > 0 && <path d="M 430 380 L 400 394 L 400 630 L 430 630" fill="#FFFFFF" stroke={C.ink} strokeWidth={8} strokeLinejoin="round" opacity={door2} />}
          <g opacity={wk}>
            <Calendar x={500} y={318} s={0.6} shade={t >= q.secondOne ? [0, 7] : t >= q.firstVisit ? [0] : []} rows={3} w={260} h={170} />
            <Tag x={500} y={368} text="WEEK 2" size={18} fill={C.crimson} opacity={prog(t, q.week, 0.4)} />
          </g>
          <g opacity={newIn}>
            <Stick x={170 + 160 * visit1 - 160 * leave + 160 * visit2} y={G} h={200} pose={pose({mood: 'smile', look: 1, lf: -0.1 + 0.15 * Math.sin((visit1 + leave + visit2) * 14), rf: 0.1 - 0.15 * Math.sin((visit1 + leave + visit2) * 14)})} />
          </g>
          {curious > 0 && (
            <g opacity={curious}>
              <Bubble x={330} y={350} w={90} h={80}>
                <Qmark x={330} y={350} size={50} />
              </Bubble>
            </g>
          )}
        </g>
      )}

      {/* ---------------- signal 3 ---------------- */}
      {s4 > 0 && (
        <g opacity={s4}>
          <Stick x={500} y={G} h={240} pose={pose({mood: 'smile', rh: [0.18, -0.34], look: 0})} />
          <g opacity={raise} transform={`translate(${566} ${G - 330}) scale(${raise})`}>
            <line x1={0} y1={30} x2={0} y2={-34} stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
            <path d="M 0 -34 L 44 -22 L 0 -8 Z" fill={C.crimson} />
          </g>
          {[
            {at: q.question, x: 250, label: '?'},
            {at: q.event, x: 500, label: ''},
            {at: q.welcome, x: 750, label: 'HI'},
          ].map((it, k) => (
            <g key={k} opacity={item(it.at)} transform={`translate(${it.x} ${330 - 12 * (1 - item(it.at))})`}>
              {k === 0 && (
                <Bubble x={0} y={0} w={110} h={90}>
                  <Qmark x={0} y={0} size={58} />
                </Bubble>
              )}
              {k === 1 && <Calendar s={0.5} shade={[10]} rows={3} w={240} h={160} />}
              {k === 2 && (
                <Bubble x={0} y={0} w={110} h={90}>
                  <text y={12} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={40} fill={C.ink}>
                    HI
                  </text>
                </Bubble>
              )}
            </g>
          ))}
          {homeP > 0 && (
            <g opacity={homeP}>
              <House x={500} y={G} w={700} h={470} />
            </g>
          )}
        </g>
      )}

      {/* ---------------- pick one ---------------- */}
      {s5 > 0 && (
        <g opacity={s5}>
          <Panel x={200} y={110} w={600} h={420} opacity={note} />
          <Tag x={500} y={190} text="PICK ONE" size={30} opacity={note} />
          {[0, 1, 2].map((k) => (
            <g key={k} transform={`translate(${290 + k * 210} 330) scale(0.75)`} opacity={note}>
              <circle r={74} fill="#FFFFFF" stroke={k === 0 ? C.crimson : C.ink} strokeWidth={k === 0 ? 9 : 6} strokeDasharray={k === 0 ? `${460 * circle} 470` : undefined} />
              {k === 0 && (
                <g>
                  <Bubble x={-20} y={-10} w={58} h={40} />
                  <Bubble x={20} y={16} w={58} h={40} />
                </g>
              )}
              {k === 1 && (
                <g>
                  <rect x={-22} y={-40} width={44} height={74} rx={6} fill="none" stroke={C.ink} strokeWidth={6} />
                </g>
              )}
              {k === 2 && (
                <g>
                  <line x1={-10} y1={34} x2={-10} y2={-36} stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
                  <path d="M -10 -36 L 34 -24 L -10 -10 Z" fill="#FFFFFF" stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
                </g>
              )}
            </g>
          ))}
          <g opacity={todayP}>
            <Tag x={330} y={450} text="TODAY" size={22} />
            <line x1={420} y1={450} x2={420 + 260 * inkLine} y2={450} stroke={C.ink} strokeWidth={8} strokeLinecap="round" />
          </g>
        </g>
      )}

      {/* ---------------- before and after ---------------- */}
      {s6 > 0 && (
        <g opacity={s6}>
          <g opacity={bars}>
            <rect x={250} y={540 - 110} width={90} height={110} rx={14} fill={C.soft} stroke={C.ink} strokeWidth={6} />
            <rect x={660} y={540 - 110 - 130 * grow} width={90} height={110 + 130 * grow} rx={14} fill={C.crimson} stroke={C.ink} strokeWidth={6} />
            <Arrow x1={380} y1={420} x2={620} y2={420} p={prog(t, q.then + 0.5, 0.6)} />
            <Tag x={295} y={590} text="TODAY" size={20} />
            <Tag x={705} y={590} text="AFTER" size={20} />
          </g>
          <ThumbsUp x={500} y={250} s={1.5} opacity={thumb} />
        </g>
      )}

      {/* ---------------- end card ---------------- */}
      {ctaOn > 0 && (
        <g opacity={Math.min(1, ctaOn * 2)}>
          <FollowIcon x={500} y={230} s={1.5 * ctaOn} />
          <Tag x={500} y={430} text="FOLLOW FOR MORE" size={38} opacity={prog(t, q.cta + 0.15, 0.4, bounce)} />
          <text x={500} y={545} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={42} fill={C.crimson} opacity={askP}>
            Which signal will you watch?
          </text>
        </g>
      )}
    </g>
  );
};
