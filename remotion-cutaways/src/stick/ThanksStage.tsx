import React from 'react';
import {Stick, STAND, type Pose} from './figure';
import {Bubble, Chair, Panel, Tag, C, SANS, between, bounce, prog} from './kit';
import {FollowIcon, Heart} from './parts';
import {Envelope, Megaphone} from './icons2';
import type {Cues} from './PileStage';

/**
 * Stage art for "Three Ways to Say Thank You in a Community".
 * Metaphor: three cards (a megaphone, an envelope, a key) that each reach a different person, then a notebook line.
 */
const G = 630;
const lin = (v: number) => v;
const pose = (p: Partial<Pose> = {}): Pose => ({...STAND, ...p});
const sm = (x: number) => x * x * (3 - 2 * x);

const CX = [230, 500, 770];
const Tick: React.FC<{x: number; y: number; p: number}> = ({x, y, p}) => (
  <path d={`M ${x - 12} ${y} L ${x - 3} ${y + 10} L ${x + 15} ${y - 11}`} fill="none" stroke={C.crimson} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={50} strokeDashoffset={50 * (1 - p)} opacity={Math.min(1, p * 4)} />
);
const Key: React.FC<{x?: number; y?: number; s?: number; opacity?: number}> = ({x = 0, y = 0, s = 1, opacity = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity}>
    <circle cx={-30} cy={0} r={24} fill="#FFFFFF" stroke={C.ink} strokeWidth={8} />
    <line x1={-6} y1={0} x2={56} y2={0} stroke={C.ink} strokeWidth={8} strokeLinecap="round" />
    <line x1={36} y1={0} x2={36} y2={18} stroke={C.ink} strokeWidth={8} strokeLinecap="round" />
    <line x1={56} y1={0} x2={56} y2={22} stroke={C.ink} strokeWidth={8} strokeLinecap="round" />
  </g>
);
const Bulb2: React.FC<{x: number; y: number; s?: number; opacity?: number}> = ({x, y, s = 1, opacity = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity} fill="none" stroke={C.crimson} strokeWidth={6} strokeLinecap="round">
    <circle cy={-8} r={28} fill="#FFFFFF" />
    <path d="M -12 22 L 12 22 M -9 33 L 9 33" />
    <path d="M 0 -58 L 0 -70 M -42 -38 L -52 -46 M 42 -38 L 52 -46" strokeWidth={5} />
  </g>
);

export const ThanksStage: React.FC<{t: number; q: Cues}> = ({t, q}) => {
  // top row of three slots and cards
  const slot = (k: number) => prog(t, q.ways + k * 0.28, 0.35, bounce);
  const card = (k: number) => prog(t, [q.shout, q.note, q.gift][k] - 0.15, 0.4, bounce);
  const rowOut = 1 - prog(t, q.ask - 0.25, 0.35, lin);
  const tagOn = (k: number) => prog(t, [q.shout, q.note, q.gift][k] + 0.15, 0.35, bounce);

  // intro figure with a heart (0 to 5.2)
  const intro = prog(t, 0.2, 0.5, bounce) * (1 - prog(t, q.first - 0.2, 0.3, lin));
  const heart = prog(t, q.plan + 0.3, 0.45, bounce);

  // 1: shout-out (6.1 to 10.5)
  const s1 = between(t, q.shout - 0.1, q.second - 0.2, 0.3);
  const wave = prog(t, q.shout + 0.2, 0.6);
  const loveP = prog(t, q.love, 0.4, bounce);
  const shrink = prog(t, q.exposed, 0.6, sm);

  // 2: private note (11.7 to 19.4)
  const s2 = between(t, q.note - 0.1, q.third - 0.2, 0.3);
  const fly = prog(t, q.quiet - 0.8, 1.2, sm);
  const smile = prog(t, q.quiet + 0.6, 0.4);
  const fewLines = prog(t, q.lines, 0.45, bounce);

  // 3: access (20.2 to 29)
  const s3 = between(t, q.gift - 0.1, q.different - 0.2, 0.3);
  const doorIn = prog(t, q.gift + 0.8, 0.45, bounce);
  const keyFly = prog(t, q.early - 0.9, 0.9, sm);
  const open = prog(t, q.early + 0.5, 0.5, sm);
  const seat = prog(t, q.seat, 0.45, bounce);
  const idea = prog(t, q.count, 0.4, bounce);

  // 4: different people (29.7 to 35.5)
  const s4 = between(t, q.different - 0.1, q.ask - 0.2, 0.3);
  const fig = (k: number) => prog(t, q.different + 0.3 + k * 0.5, 0.4, bounce);
  const cult = prog(t, q.culture, 0.4, bounce);

  // 5: the notebook (35.6 to 42.4)
  const s5 = between(t, q.ask - 0.1, q.cta - 0.1, 0.3);
  const note = prog(t, q.ask, 0.5, bounce);
  const ink = prog(t, q.write, 0.9);
  const thank = prog(t, q.then, 0.5, bounce);

  // end card
  const ctaOn = prog(t, q.cta, 0.5, bounce);
  const askP = prog(t, q.cta + 0.7, 0.45, bounce);

  return (
    <g>
      {/* ---------------- intro ---------------- */}
      {intro > 0 && (
        <g opacity={intro}>
          <Stick x={500} y={G} h={270} pose={pose({mood: 'smile', look: 0})} />
          <g transform={`translate(500 ${G - 340}) scale(${1.4 * heart})`} opacity={heart}>
            <Heart />
          </g>
        </g>
      )}

      {/* ---------------- the three cards ---------------- */}
      {rowOut > 0 && (
        <g opacity={rowOut}>
          {[0, 1, 2].map((k) => (
            <g key={k}>
              <rect x={CX[k] - 100} y={90} width={200} height={170} rx={26} fill="#FFFFFF" stroke={C.ink} strokeWidth={card(k) > 0.5 ? 6 : 5} strokeDasharray={card(k) > 0.5 ? undefined : '14 10'} strokeLinecap="round" opacity={slot(k)} />
              <g opacity={card(k)} transform={`translate(${CX[k]} 175) scale(${0.6 + 0.4 * card(k)})`}>
                {k === 0 && <Megaphone s={1.15} />}
                {k === 1 && <Envelope s={1.15} />}
                {k === 2 && <Key s={1.1} />}
              </g>
              <Tag x={CX[k]} y={300} text={['SHOUT-OUT', 'PRIVATE NOTE', 'ACCESS'][k]} size={20} opacity={tagOn(k)} />
            </g>
          ))}
        </g>
      )}

      {/* ---------------- 1 ---------------- */}
      {s1 > 0 && (
        <g opacity={s1}>
          {[0, 1].map((k) => (
            <path key={k} d={`M ${300 + k * 30} 410 Q ${360 + k * 30} ${440 - k * 10} ${300 + k * 30} 480`} fill="none" stroke={C.ink} strokeWidth={6} strokeLinecap="round" opacity={wave * 0.8} transform={`translate(${60 * wave} 0)`} />
          ))}
          <g opacity={loveP}>
            <Stick x={330} y={G} h={230} pose={pose({lh: [-0.3, -0.2], rh: [0.3, -0.2], mood: 'smile', look: 0})} />
            <g transform={`translate(330 ${G - 290}) scale(0.5)`}>
              <Heart />
            </g>
          </g>
          <g opacity={prog(t, q.exposed - 0.3, 0.4)}>
            <Stick x={680} y={G} h={230 - 70 * shrink} pose={pose({crouch: 0.5 * shrink, lean: 0.05 * shrink, lh: [-0.14, 0.2], rh: [0.14, 0.2], mood: shrink > 0.4 ? 'sad' : 'flat', look: -1})} />
          </g>
        </g>
      )}

      {/* ---------------- 2 ---------------- */}
      {s2 > 0 && (
        <g opacity={s2}>
          <Stick x={640} y={G} h={230} pose={pose({mood: smile > 0.5 ? 'smile' : 'flat', look: -1})} />
          <g transform={`translate(${500 + (600 - 500) * fly} ${175 + (430 - 175) * fly})`} opacity={fly > 0 && fly < 1 ? 1 : 0}>
            <Envelope s={0.9 - 0.2 * fly} />
          </g>
          {fly >= 1 && <Envelope x={600} y={430} s={0.75} />}
          {fewLines > 0 && (
            <g opacity={fewLines} transform="translate(300 450)">
              <rect x={-80} y={-60} width={160} height={120} rx={14} fill="#FFFFFF" stroke={C.ink} strokeWidth={6} />
              {[0, 1, 2].map((k) => (
                <line key={k} x1={-52} y1={-28 + k * 30} x2={52 - k * 14} y2={-28 + k * 30} stroke={C.mid} strokeWidth={9} strokeLinecap="round" />
              ))}
            </g>
          )}
        </g>
      )}

      {/* ---------------- 3 ---------------- */}
      {s3 > 0 && (
        <g opacity={s3}>
          <g opacity={doorIn}>
            <rect x={640} y={410} width={130} height={220} rx={14} fill="#FFFFFF" stroke={C.ink} strokeWidth={8} />
            {open > 0.3 && <path d="M 640 410 L 596 426 L 596 630 L 640 630" fill="#FFFFFF" stroke={C.ink} strokeWidth={8} strokeLinejoin="round" />}
            <Tag x={705} y={384} text="EARLY LOOK" size={18} />
          </g>
          <g transform={`translate(${770 + (690 - 770) * keyFly} ${175 + (500 - 175) * keyFly}) scale(${1 - 0.3 * keyFly})`} opacity={keyFly > 0 && open < 0.2 ? 1 : 0}>
            <Key />
          </g>
          <g opacity={seat}>
            <Chair x={330} y={560} s={1.0} dashed={false} />
            <Bubble x={330} y={420} w={130} h={66}>
              <text x={330} y={432} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={26} fill={C.ink}>
                CALL
              </text>
            </Bubble>
          </g>
          <Stick x={500} y={G} h={220} pose={pose({mood: 'smile', look: 1})} opacity={doorIn} />
          <Bulb2 x={500} y={G - 280} s={0.9 * idea} opacity={idea} />
        </g>
      )}

      {/* ---------------- 4 ---------------- */}
      {s4 > 0 && (
        <g opacity={s4}>
          {[0, 1, 2].map((k) => (
            <g key={k} opacity={fig(k)}>
              <line x1={CX[k]} y1={G - 250} x2={CX[k]} y2={330} stroke={C.ink} strokeWidth={5} strokeLinecap="round" strokeDasharray="3 12" />
              <Stick x={CX[k]} y={G} h={200 + (k === 1 ? 20 : 0)} hair={k === 1 ? 'bob' : k === 2 ? 'long' : undefined} pose={pose({mood: 'smile', look: 0})} />
            </g>
          ))}
          <g opacity={cult}>
            <Tag x={500} y={400} text="CULTURE" size={26} fill={C.crimson} />
          </g>
        </g>
      )}

      {/* ---------------- 5 ---------------- */}
      {s5 > 0 && (
        <g opacity={s5}>
          <Panel x={190} y={110} w={620} h={360} opacity={note} />
          <g opacity={note}>
            <text x={500} y={230} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={46} fill={C.ink}>
              How they like
            </text>
            <text x={500} y={292} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={46} fill={C.ink}>
              to be thanked
            </text>
          </g>
          <line x1={290} y1={370} x2={290 + 420 * ink} y2={370} stroke={C.crimson} strokeWidth={9} strokeLinecap="round" opacity={ink > 0 ? 1 : 0} />
          <g opacity={thank}>
            <Stick x={320} y={G} h={150} pose={pose({mood: 'smile', look: 1})} sw={8} />
            <Envelope x={500} y={560} s={0.7} />
            <Stick x={680} y={G} h={150} hair="bob" pose={pose({mood: 'smile', look: -1})} sw={8} />
            <Tick x={680} y={G - 190} p={thank} />
          </g>
        </g>
      )}

      {/* ---------------- end card ---------------- */}
      {ctaOn > 0 && (
        <g opacity={Math.min(1, ctaOn * 2)}>
          <FollowIcon x={500} y={230} s={1.5 * ctaOn} />
          <Tag x={500} y={430} text="FOLLOW FOR MORE" size={38} opacity={prog(t, q.cta + 0.15, 0.4, bounce)} />
          <text x={500} y={545} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={40} fill={C.crimson} opacity={askP}>
            How do you like to be thanked?
          </text>
        </g>
      )}
    </g>
  );
};
