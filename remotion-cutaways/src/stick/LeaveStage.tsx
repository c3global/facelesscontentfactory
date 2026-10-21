import React from 'react';
import {Stick, STAND, type Pose} from './figure';
import {Bubble, Card, Dots, Panel, Tag, C, SANS, between, bounce, prog} from './kit';
import {Bell, FollowIcon} from './parts';
import {Bot, Cloud, Clock, Magnifier, Meter, NameTag, Receipt, ThumbsUp} from './icons2';
import type {Cues} from './PileStage';

/**
 * Stage art for "What an AI Assistant Should Leave Alone".
 * Metaphor: a small bot at a desk, a question handed to a person, a whiteboard with two lists, a trust meter.
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
const Tick: React.FC<{x: number; y: number; p: number; color?: string}> = ({x, y, p, color = C.crimson}) => (
  <path d={`M ${x - 12} ${y} L ${x - 3} ${y + 10} L ${x + 15} ${y - 11}`} fill="none" stroke={color} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={50} strokeDashoffset={50 * (1 - p)} opacity={Math.min(1, p * 4)} />
);
const Desk: React.FC<{x: number; y: number; w?: number; opacity?: number}> = ({x, y, w = 150, opacity = 1}) => (
  <g opacity={opacity}>
    <rect x={x - w / 2} y={y} width={w} height={16} rx={8} fill={C.ink} />
    <line x1={x - w / 2 + 18} y1={y + 16} x2={x - w / 2 + 18} y2={G} stroke={C.ink} strokeWidth={7} strokeLinecap="round" />
    <line x1={x + w / 2 - 18} y1={y + 16} x2={x + w / 2 - 18} y2={G} stroke={C.ink} strokeWidth={7} strokeLinecap="round" />
  </g>
);
const Dash: React.FC<{x1: number; y1: number; x2: number; y2: number; p: number; color?: string}> = ({x1, y1, x2, y2, p, color = C.ink}) => (
  <line x1={x1} y1={y1} x2={x1 + (x2 - x1) * p} y2={y1 + (y2 - y1) * p} stroke={color} strokeWidth={7} strokeLinecap="round" strokeDasharray="4 14" opacity={p > 0 ? 1 : 0} />
);
/** the small icons for each list row, drawn at row scale */
const Pin: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M 0 40 Q -36 0 -36 -14 A 36 36 0 0 1 36 -14 Q 36 0 0 40 Z" fill="#FFFFFF" stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
    <circle cy={-14} r={11} fill={C.ink} />
  </g>
);
const Flag: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <line x1={-18} y1={38} x2={-18} y2={-40} stroke={C.ink} strokeWidth={7} strokeLinecap="round" />
    <path d="M -18 -40 L 36 -26 L -18 -10 Z" fill="#FFFFFF" stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
  </g>
);

export const LeaveStage: React.FC<{t: number; q: Cues}> = ({t, q}) => {
  // ---- 1: bot, member, person (0 to 7.6)
  const s1 = 1 - prog(t, q.ask - 0.35, 0.3, lin);
  const in1 = prog(t, q.number, 0.5, bounce);
  const botTag = prog(t, q.bot, 0.35, bounce);
  const handP = prog(t, q.hand + 0.2, 0.75, sm);
  const personIn = prog(t, q.should, 0.45, bounce);
  const memberAsk = prog(t, q.number + 0.7, 0.4, bounce);
  const botAns = prog(t, q.number + 1.5, 0.4, bounce);

  // ---- 2: can answer / leave alone (7.7 to 14.2)
  const s2 = between(t, q.ask - 0.3, q.grief - 0.2, 0.3);
  const p2 = prog(t, q.ask - 0.2, 0.45, bounce);
  const ansB = (k: number) => prog(t, q.ask + 0.2 + k * 0.5, 0.35, bounce);
  const swap = prog(t, q.better, 0.4);
  const bigQ = prog(t, q.better + 0.2, 0.4, bounce);
  const leaveTag = prog(t, q.leave, 0.4, bounce);

  // ---- 3: three that need a person (14.3 to 21.6)
  const s3 = between(t, q.grief - 0.1, q.lists - 0.15, 0.3);
  const icon = (at: number) => prog(t, at, 0.4, bounce);
  const walk = prog(t, q.voice + 0.3, 1.5, sm);
  const walking = walk > 0 && walk < 1;
  const personIn3 = prog(t, q.voice - 0.4, 0.5, bounce);

  // ---- 4: the two lists (21.7 to 36.4)
  const s4 = between(t, q.lists - 0.05, q.read - 0.2, 0.3);
  const board = prog(t, q.lists, 0.5, bounce);
  const h1 = prog(t, q.listOne, 0.35, bounce);
  const row = (at: number) => prog(t, at, 0.4, bounce);
  const h2 = prog(t, q.listTwo, 0.35, bounce);
  const rowR = (at: number) => prog(t, at, 0.4, bounce);
  const nameP = prog(t, q.byName, 0.45, bounce);
  const nameLine = prog(t, q.byName + 0.8, 0.5);

  // ---- 5: read answers, trust (36.8 to 44.7)
  const s5 = between(t, q.read - 0.1, q.cta - 0.1, 0.3);
  const stackIn = prog(t, q.read, 0.5, bounce);
  const scan = prog(t, q.read + 0.3, 1.0, sm);
  const thumb = prog(t, q.answers, 0.35, bounce);
  const wk = prog(t, q.week, 0.35, bounce);
  const lvl = prog(t, q.limits + 0.5, 3.0, sm);
  const stillThere = prog(t, q.there - 0.2, 0.45, bounce);

  // ---- 6: end card
  const ctaOn = prog(t, q.cta, 0.5, bounce);
  const bellP = prog(t, q.subscribe, 1.6, lin);
  const bellIn = prog(t, q.subscribe - 0.1, 0.4, bounce);
  const askP = prog(t, q.cta + 1.0, 0.45, bounce);

  const mx = 140 + 360 * walk; // member with cloud walking to the person

  return (
    <g>
      {/* ---------------- 1 ---------------- */}
      {s1 > 0 && (
        <g opacity={s1}>
          <Stick x={200} y={G} h={250} pose={pose({mood: 'smile', look: 1})} opacity={in1} />
          <Bubble x={270} y={330} w={140} h={76} opacity={memberAsk}>
            <Dots x={235} y={330} t={t} />
          </Bubble>
          <Desk x={760} y={470} w={190} opacity={in1} />
          <Bot x={760} y={410} s={1.15} opacity={in1} blink={t % 3 > 2.8} />
          <Bubble x={600} y={420} w={130} h={72} opacity={botAns * (1 - handP)}>
            <rect x={560} y={412} width={80} height={14} rx={7} fill={C.soft} />
          </Bubble>
          <Tag x={760} y={318} text="AI ASSISTANT" size={20} opacity={botTag} />
          <Stick x={470} y={G} h={250} hair="bob" pose={pose({mood: 'smile', look: 1})} opacity={personIn} />
          {handP > 0 && handP < 1 && (
            <g transform={`translate(${690 - 220 * handP} ${330 - 70 * Math.sin(handP * Math.PI)})`}>
              <Bubble x={0} y={0} w={92} h={80}>
                <Qmark x={0} y={0} size={52} color={C.crimson} />
              </Bubble>
            </g>
          )}
          {handP >= 1 && (
            <Bubble x={470} y={300} w={92} h={80}>
              <Qmark x={470} y={300} size={52} color={C.crimson} />
            </Bubble>
          )}
        </g>
      )}

      {/* ---------------- 2 ---------------- */}
      {s2 > 0 && (
        <g opacity={s2}>
          <Desk x={500} y={500} w={230} opacity={p2} />
          <Bot x={500} y={410} s={1.55} opacity={p2} />
          {[0, 1, 2].map((k) => (
            <g key={k} opacity={ansB(k) * (1 - swap)} transform={`translate(${-140 * swap} 0)`}>
              <Bubble x={230} y={170 + k * 100} w={210} h={70}>
                <rect x={160} y={163 + k * 100} width={90} height={12} rx={6} fill={C.soft} />
              </Bubble>
              <Tick x={350} y={170 + k * 100} p={ansB(k)} />
            </g>
          ))}
          {bigQ > 0 && (
            <g opacity={bigQ} transform={`translate(0 ${-10 * (1 - bigQ)})`}>
              <Bubble x={730} y={250} w={150} h={130}>
                <Qmark x={730} y={250} size={84} />
              </Bubble>
            </g>
          )}
          <Tag x={730} y={400} text="LEAVE ALONE" size={24} fill={C.crimson} opacity={leaveTag} />
          <Tag x={230} y={430} text="CAN ANSWER" size={22} opacity={ansB(0) * (1 - swap)} />
        </g>
      )}

      {/* ---------------- 3 ---------------- */}
      {s3 > 0 && (
        <g opacity={s3}>
          {[
            {x: 200, at: q.grief, tag: 'GRIEF'},
            {x: 500, at: q.billing, tag: 'BILLING'},
            {x: 800, at: q.complaint, tag: 'COMPLAINT'},
          ].map((it, k) => (
            <g key={k} opacity={icon(it.at)} transform={`translate(${it.x} ${190 - 14 * (1 - icon(it.at))})`}>
              {k === 0 && <Cloud s={1.1} rain={t} />}
              {k === 1 && <Receipt s={1.0} />}
              {k === 2 && (
                <g>
                  <Bubble x={-30} y={-10} w={96} h={72} />
                  <Bubble x={34} y={30} w={96} h={72} />
                  <text x={34} y={46} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={44} fill={C.crimson}>
                    !
                  </text>
                </g>
              )}
              <Tag x={0} y={104} text={it.tag} size={20} />
            </g>
          ))}
          <Stick x={500} y={G} h={250} hair="bob" pose={pose({mood: 'smile', look: 0})} opacity={personIn3} />
          <g opacity={personIn3}>
            <NameTag x={500} y={470} s={1.1} />
          </g>
          <g opacity={icon(q.voice - 0.2)}>
            <Stick x={mx} y={G} h={235} pose={walking ? pose({mood: 'sad', lean: 0.05, lf: -0.1 + 0.18 * Math.sin(walk * 20), rf: 0.1 - 0.18 * Math.sin(walk * 20), look: 1}) : pose({mood: walk >= 1 ? 'smile' : 'sad', look: 1})} />
            <Cloud x={mx} y={G - 270} s={0.6} rain={t} opacity={1 - 0.8 * prog(t, q.voice + 1.6, 0.4)} />
          </g>
        </g>
      )}

      {/* ---------------- 4 ---------------- */}
      {s4 > 0 && (
        <g opacity={s4}>
          <Panel x={110} y={70} w={780} h={500} opacity={board} />
          <line x1={500} y1={110} x2={500} y2={540} stroke={C.soft} strokeWidth={6} strokeLinecap="round" opacity={board} />
          <Tag x={305} y={140} text="HANDLES" size={26} opacity={h1} />
          <Tag x={695} y={140} text="PASSES ON" size={26} opacity={h2} />
          {[
            {at: q.find, y: 245, el: <Pin x={0} y={0} s={0.8} />},
            {at: q.times, y: 355, el: <Clock s={0.78} hand={0.15} />},
            {at: q.started, y: 465, el: <Flag x={0} y={0} s={0.9} />},
          ].map((r, k) => (
            <g key={k} opacity={row(r.at)} transform={`translate(250 ${r.y})`}>
              {r.el}
              <line x1={56} y1={-6} x2={150} y2={-6} stroke={C.soft} strokeWidth={9} strokeLinecap="round" />
              <line x1={56} y1={16} x2={120} y2={16} stroke={C.soft} strokeWidth={9} strokeLinecap="round" />
              <Tick x={190} y={0} p={row(r.at)} />
            </g>
          ))}
          {[
            {at: q.passes, y: 245, el: <Cloud s={0.62} />},
            {at: q.passes + 0.3, y: 355, el: <Receipt s={0.58} />},
          ].map((r, k) => (
            <g key={k} opacity={rowR(r.at)} transform={`translate(600 ${r.y})`}>
              {r.el}
              <line x1={56} y1={-4} x2={160} y2={-4} stroke={C.soft} strokeWidth={9} strokeLinecap="round" />
              <line x1={56} y1={18} x2={130} y2={18} stroke={C.soft} strokeWidth={9} strokeLinecap="round" />
            </g>
          ))}
          <g opacity={nameP}>
            <Stick x={640} y={540} h={130} hair="bob" pose={pose({mood: 'smile'})} sw={7} />
            <NameTag x={640} y={472} s={0.72} />
            <line x1={620} y1={472} x2={620 + 36 * nameLine} y2={472} stroke={C.crimson} strokeWidth={6} strokeLinecap="round" />
          </g>
        </g>
      )}

      {/* ---------------- 5 ---------------- */}
      {s5 > 0 && (
        <g opacity={s5}>
          {[0, 1, 2, 3].map((k) => (
            <Card key={k} x={300} y={440 - k * 92} w={340} h={74} rot={[1.4, -1.8, 1, -1.2][k]} opacity={stackIn} scale={0.9 + 0.1 * stackIn} />
          ))}
          <g opacity={stackIn * (1 - thumb * 0.0)} transform={`translate(${300 + 40 * Math.sin(scan * Math.PI * 1.5)} ${150 + 290 * scan - (scan >= 1 ? 0 : 0)})`}>
            <Magnifier s={0.9} />
          </g>
          <ThumbsUp x={470} y={348} s={0.8} opacity={thumb} />
          <Tag x={300} y={560} text="EVERY WEEK" size={22} opacity={wk} />
          <Meter x={720} y={560} h={340} level={lvl} opacity={prog(t, q.limits - 0.1, 0.4)} />
          <Tag x={720} y={610} text="TRUST" size={24} opacity={prog(t, q.limits, 0.4, bounce)} />
          <g opacity={stillThere}>
            <Stick x={850} y={G} h={200} hair="bob" pose={pose({mood: 'smile', look: -1})} />
          </g>
        </g>
      )}

      {/* ---------------- 6: end card ---------------- */}
      {ctaOn > 0 && (
        <g opacity={Math.min(1, ctaOn * 2)}>
          <FollowIcon x={500} y={200} s={1.4 * ctaOn} />
          {bellIn > 0 && <Bell x={500} y={340} s={1.3 * bellIn} ring={bellP} />}
          <Tag x={500} y={450} text="FOLLOW AND SUBSCRIBE" size={36} opacity={prog(t, q.cta + 0.15, 0.4, bounce)} />
          <text x={500} y={570} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={40} fill={C.crimson} opacity={askP}>
            What should yours leave alone?
          </text>
        </g>
      )}
    </g>
  );
};
