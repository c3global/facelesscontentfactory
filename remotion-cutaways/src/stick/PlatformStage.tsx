import React from 'react';
import {Stick, STAND, type Pose} from './figure';
import {Bubble, Card, Cross, Dots, Panel, Tag, C, SANS, between, bounce, prog} from './kit';
import {FollowIcon, Target} from './parts';
import type {Cues} from './PileStage';

/**
 * Stage art for "Three Questions Before You Build a Community Platform".
 * Metaphor: an empty building with a sign, then three numbered question boards (who, what, who runs it), a checklist.
 * `t` is seconds into the voiceover, `q` the cue times from content/three-questions-platform.stick.json.
 */
const G = 630;
const lin = (v: number) => v;
const pose = (p: Partial<Pose> = {}): Pose => ({...STAND, ...p});

const Badge: React.FC<{x: number; y: number; n: string; s?: number}> = ({x, y, n, s = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle r={38} fill={C.ink} />
    <text y={14} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={44} fill="#FFFFFF">
      {n}
    </text>
  </g>
);

const Qmark: React.FC<{x: number; y: number; size?: number; color?: string; opacity?: number}> = ({x, y, size = 64, color = C.crimson, opacity = 1}) => (
  <text x={x} y={y + size * 0.36} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={size} fill={color} opacity={opacity}>
    ?
  </text>
);

/** an empty building outline: dashed walls, a door, a hanging sign */
const Building: React.FC<{x: number; y: number; w?: number; h?: number; opacity?: number; solid?: boolean; sign?: string}> = ({x, y, w = 260, h = 330, opacity = 1, solid = false, sign}) => (
  <g opacity={opacity}>
    <path d={`M ${x - w / 2 - 14} ${y - h + 70} L ${x} ${y - h} L ${x + w / 2 + 14} ${y - h + 70}`} fill="none" stroke={C.ink} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
    <rect x={x - w / 2} y={y - h + 70} width={w} height={h - 70} fill="#FFFFFF" stroke={C.ink} strokeWidth={7} strokeDasharray={solid ? undefined : '18 12'} strokeLinecap="round" />
    <rect x={x - 38} y={y - 120} width={76} height={120} rx={10} fill="none" stroke={C.ink} strokeWidth={6} />
    <circle cx={x + 20} cy={y - 62} r={5} fill={C.ink} />
    {sign && <Tag x={x} y={y - h + 128} text={sign} size={24} />}
  </g>
);

const Door: React.FC<{x: number; y: number; w?: number; h?: number; opacity?: number}> = ({x, y, w = 130, h = 230, opacity = 1}) => (
  <g opacity={opacity}>
    <rect x={x - w / 2} y={y} width={w} height={h} rx={14} fill="#FFFFFF" stroke={C.ink} strokeWidth={7} />
    <circle cx={x + w / 2 - 28} cy={y + h / 2} r={8} fill={C.ink} />
  </g>
);

const Key: React.FC<{x: number; y: number; s?: number; opacity?: number}> = ({x, y, s = 1, opacity = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity}>
    <circle cx={-26} cy={0} r={22} fill="#FFFFFF" stroke={C.crimson} strokeWidth={9} />
    <line x1={-4} y1={0} x2={52} y2={0} stroke={C.crimson} strokeWidth={9} strokeLinecap="round" />
    <line x1={34} y1={0} x2={34} y2={16} stroke={C.crimson} strokeWidth={9} strokeLinecap="round" />
    <line x1={52} y1={0} x2={52} y2={20} stroke={C.crimson} strokeWidth={9} strokeLinecap="round" />
  </g>
);

const Check: React.FC<{x: number; y: number; p: number}> = ({x, y, p}) => (
  <path d={`M ${x - 14} ${y} L ${x - 4} ${y + 11} L ${x + 16} ${y - 12}`} fill="none" stroke={C.crimson} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={60} strokeDashoffset={60 * (1 - p)} opacity={Math.min(1, p * 4)} />
);

export const PlatformStage: React.FC<{t: number; q: Cues}> = ({t, q}) => {
  // ---- 1: the empty platform (0 to 6.7)
  const s1 = 1 - prog(t, q.q1 - 0.25, 0.3, lin);
  const in1 = prog(t, 0.1, 0.5, bounce);
  const build1 = prog(t, 0.35, 0.5, bounce);
  const wonder = prog(t, q.fooled, 0.35, bounce);
  const badge = (k: number) => prog(t, q.three + k * 0.32, 0.3, bounce);

  // ---- 2: who is it for (6.8 to 14.9)
  const s2 = between(t, q.q1 - 0.1, q.q2 - 0.15, 0.3);
  const p2 = prog(t, q.q1, 0.45, bounce);
  const whoTag = prog(t, q.who, 0.35, bounce);
  const oneLine = prog(t, q.oneSent, 0.5) * (1 - prog(t, q.para - 0.1, 0.2, lin));
  const pile = (k: number) => prog(t, q.para + k * 0.16, 0.3);
  const crossP = prog(t, q.broad + 0.5, 0.45);
  const crowd = prog(t, q.broad - 0.1, 0.5, bounce);

  // ---- 3: what will people do there (15 to 27.4)
  const s3 = between(t, q.q2 - 0.05, q.q3 - 0.15, 0.3);
  const p3 = prog(t, q.q2, 0.45, bounce);
  const chatIn = prog(t, q.q2 + 0.7, 0.4, bounce);
  const doorIn = prog(t, q.what + 0.9, 0.4, bounce);
  const qDoor = prog(t, q.what + 1.9, 0.35, bounce);
  const arrow = prog(t, q.chat - 1.7, 0.5);
  const blank = prog(t, q.name - 0.3, 0.4, bounce);
  const walk = prog(t, q.back, 1.2, (x) => x * x * (3 - 2 * x));
  const figX3 = 640 - 230 * walk;
  const walking = walk > 0 && walk < 1;
  const doorDim = 1 - 0.65 * prog(t, q.back + 0.4, 0.5);

  // ---- 4: day 1, day 30, day 90 (27.5 to 37)
  const s4 = between(t, q.q3 - 0.05, q.write - 0.2, 0.3);
  const p4 = prog(t, q.q3, 0.45, bounce);
  const line4 = prog(t, q.q3 + 0.4, 0.8);
  const keyIn = prog(t, q.runs, 0.4, bounce);
  const keyPass = prog(t, q.day90, 0.7, (x) => x * x * (3 - 2 * x));
  const tag30 = prog(t, q.day30 - 0.2, 0.3, bounce);
  const tag90 = prog(t, q.day90 - 0.2, 0.3, bounce);
  const burst = prog(t, q.launch, 0.5, bounce);
  const fade4 = prog(t, q.fades - 0.2, 0.9, lin);

  // ---- 5: write it down (37 to 44.7)
  const s5 = between(t, q.write - 0.1, q.cta - 0.1, 0.3);
  const cardIn = (k: number) => prog(t, q.write + k * 0.3, 0.4, bounce);
  const chk = (k: number) => prog(t, q.write + 0.85 + k * 0.55, 0.35);
  const shrink = prog(t, q.purpose - 0.35, 0.6);
  const tgt = prog(t, q.purpose, 0.5, bounce);
  const later = prog(t, q.pick, 0.4, bounce);
  const later2 = prog(t, q.tool, 0.4, bounce);
  const solid = prog(t, q.easier, 0.6);

  // ---- 6: end card
  const ctaOn = prog(t, q.cta, 0.5, bounce);
  const askP = prog(t, q.cta + 0.7, 0.45, bounce);

  return (
    <g>
      {/* ---------------- 1 ---------------- */}
      {s1 > 0 && (
        <g opacity={s1}>
          <Stick x={290} y={G} h={270} pose={pose({mood: 'flat', look: 1})} opacity={in1} />
          <Building x={660} y={G} sign="PLATFORM" opacity={build1} />
          <g opacity={wonder} transform={`translate(0 ${-8 * (1 - wonder)})`}>
            <Bubble x={290} y={290} w={110} h={96}>
              <Qmark x={290} y={290} size={62} />
            </Bubble>
          </g>
          {[0, 1, 2].map((k) => (
            <g key={k} opacity={badge(k)} transform={`translate(${470 + k * 96} ${190}) scale(${0.6 + 0.4 * badge(k)})`}>
              <circle r={32} fill="#FFFFFF" stroke={C.ink} strokeWidth={6} />
              <text y={11} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={34} fill={C.ink}>
                {k + 1}
              </text>
            </g>
          ))}
        </g>
      )}

      {/* ---------------- 2 ---------------- */}
      {s2 > 0 && (
        <g opacity={s2}>
          <Panel x={250} y={80} w={500} h={400} opacity={p2} />
          <g opacity={p2}>
            <Badge x={250} y={80} n="1" />
          </g>
          <Stick x={380} y={410} h={190} pose={pose({mood: 'smile'})} opacity={whoTag} />
          <Tag x={500} y={150} text="WHO IS IT FOR?" size={26} opacity={whoTag} />
          {/* one sentence: a single line */}
          <line x1={300} y1={448} x2={300 + 400 * oneLine} y2={448} stroke={C.ink} strokeWidth={9} strokeLinecap="round" opacity={oneLine > 0 ? 1 : 0} />
          {/* a paragraph: lines pile up */}
          {[0, 1, 2, 3, 4].map((k) => (
            <line key={k} x1={470} y1={250 + k * 34} x2={470 + (k === 4 ? 100 : 220)} y2={300 + k * 34} stroke={C.mid} strokeWidth={9} strokeLinecap="round" opacity={pile(k)} transform={`translate(${(1 - pile(k)) * -30} 0)`} />
          ))}
          {crowd > 0 && (
            <g opacity={crowd}>
              {[130, 215, 300, 700, 785, 870].map((x, k) => (
                <Stick key={k} x={x} y={G - (k % 2) * 16} h={104} pose={pose({mood: 'flat'})} sw={7} />
              ))}
            </g>
          )}
          {crossP > 0 && <Cross x={730} y={110} r={30} p={crossP} />}
        </g>
      )}

      {/* ---------------- 3 ---------------- */}
      {s3 > 0 && (
        <g opacity={s3}>
          <Badge x={500} y={96} n="2" s={p3} />
          <g opacity={chatIn}>
            <Bubble x={230} y={260} w={250} h={140}>
              <Dots x={182} y={260} t={t} />
            </Bubble>
            <Tag x={230} y={372} text="GROUP CHAT" size={22} />
          </g>
          <g opacity={doorIn * doorDim}>
            <Door x={770} y={190} />
            <Tag x={770} y={452} text="PLATFORM" size={22} />
          </g>
          <Qmark x={770} y={140} size={76} opacity={qDoor * doorDim} />
          {arrow > 0 && (
            <g opacity={arrow * doorDim}>
              <line x1={380} y1={260} x2={380 + 300 * arrow} y2={260} stroke={C.ink} strokeWidth={7} strokeLinecap="round" strokeDasharray="4 14" />
            </g>
          )}
          <Stick x={figX3} y={G} h={240} pose={walking ? pose({mood: 'flat', lean: -0.04, lf: -0.1 + 0.18 * Math.sin(walk * 18), rf: 0.1 - 0.18 * Math.sin(walk * 18), look: -1}) : pose({mood: walk >= 1 ? 'smile' : 'flat', look: walk >= 1 ? -1 : 1})} />
          <g opacity={blank}>
            <Bubble x={figX3 + 10} y={330} w={150} h={96}>
              <rect x={figX3 - 50} y={310} width={120} height={40} rx={20} fill="none" stroke={C.crimson} strokeWidth={5} strokeDasharray="12 9" />
            </Bubble>
          </g>
        </g>
      )}

      {/* ---------------- 4 ---------------- */}
      {s4 > 0 && (
        <g opacity={s4}>
          <Badge x={160} y={96} n="3" s={p4} />
          <line x1={200} y1={300} x2={200 + 600 * line4} y2={300} stroke={C.ink} strokeWidth={8} strokeLinecap="round" />
          {[{x: 260, l: 'DAY 1'}, {x: 500, l: 'DAY 30'}, {x: 740, l: 'DAY 90'}].map((m, k) => (
            <g key={k} opacity={k === 0 ? line4 : k === 1 ? tag30 : tag90}>
              <circle cx={m.x} cy={300} r={16} fill="#FFFFFF" stroke={C.ink} strokeWidth={7} />
              <Tag x={m.x} y={366} text={m.l} size={22} />
            </g>
          ))}
          {/* launch day: a bright burst */}
          <g opacity={burst} transform={`translate(260 200) scale(${0.5 + 0.5 * burst})`}>
            {Array.from({length: 9}).map((_, k) => {
              const a = (-Math.PI * (k + 0.5)) / 9 - 0.02;
              return <line key={k} x1={Math.cos(a) * 46} y1={Math.sin(a) * 46} x2={Math.cos(a) * 82} y2={Math.sin(a) * 82} stroke={C.ink} strokeWidth={7} strokeLinecap="round" />;
            })}
          </g>
          <g opacity={1 - 0.7 * fade4}>
            <Building x={500} y={286} w={100} h={92} opacity={tag30} solid />
            <Building x={740} y={286} w={100} h={92} opacity={tag90 * (1 - 0.6 * fade4)} solid />
          </g>
          <Key x={500 + 240 * keyPass} y={150} s={1.1 * keyIn} opacity={keyIn * (1 - 0.0 * keyPass)} />
          <Stick x={500} y={G} h={230} pose={pose({mood: 'smile', rh: [0.2, -0.28], look: 0})} opacity={tag30} />
        </g>
      )}

      {/* ---------------- 5 ---------------- */}
      {s5 > 0 && (
        <g opacity={s5}>
          <g transform={`translate(${-170 * shrink} ${-10 * shrink}) scale(${1 - 0.28 * shrink})`} style={{transformOrigin: '500px 300px'}}>
            {['WHO IT IS FOR', 'WHAT THEY DO', 'WHO RUNS IT'].map((l, k) => (
              <g key={k}>
                <Card x={500} y={150 + k * 100} w={420} h={78} label={l} opacity={cardIn(k)} scale={0.9 + 0.1 * cardIn(k)} />
                <Check x={500 - 210 + 31} y={150 + k * 100} p={chk(k)} />
              </g>
            ))}
          </g>
          {tgt > 0 && (
            <g transform={`translate(700 250) scale(${1.4 * tgt})`} opacity={tgt}>
              <Target accent />
            </g>
          )}
          <g opacity={later}>
            <Tag x={380} y={500} text="DESIGN" size={26} fill={solid > 0.5 ? C.ink : C.soft} color={solid > 0.5 ? '#FFFFFF' : C.mid} />
          </g>
          <g opacity={later2}>
            <Tag x={620} y={500} text="TOOL" size={26} fill={solid > 0.5 ? C.ink : C.soft} color={solid > 0.5 ? '#FFFFFF' : C.mid} />
          </g>
          {solid > 0 && (
            <g opacity={solid} stroke={C.ink} strokeWidth={6} strokeLinecap="round" fill="none">
              <path d="M 660 330 L 590 450" strokeDasharray={`${130 * solid} 200`} />
              <path d="M 720 336 L 700 450" strokeDasharray={`${120 * solid} 200`} />
            </g>
          )}
        </g>
      )}

      {/* ---------------- 6: end card ---------------- */}
      {ctaOn > 0 && (
        <g opacity={Math.min(1, ctaOn * 2)}>
          <FollowIcon x={500} y={230} s={1.5 * ctaOn} />
          <Tag x={500} y={430} text="FOLLOW FOR MORE" size={38} opacity={prog(t, q.cta + 0.15, 0.4, bounce)} />
          <text x={500} y={540} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={46} fill={C.crimson} opacity={askP}>
            Who is yours for?
          </text>
        </g>
      )}
    </g>
  );
};
