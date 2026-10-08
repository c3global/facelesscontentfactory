import React from 'react';
import {Stick, STAND, mix, type Pose} from './figure';
import {Bubble, Chair, Dots, Gauge, Tag, Window, C, SANS, between, bounce, prog} from './kit';
import {Bell, Block, Book, Bulb, FollowIcon} from './parts';
import type {Cues} from './PileStage';

/**
 * Stage art for "Three Things to Avoid". The metaphor is three warning signs. One sign stands for each thing to
 * avoid and the crimson accent sits on whichever one Dr. CiCi is talking about: the book that is not the method,
 * the confident voice that is not hers, the launch without a named reader. At the end the three signs stand on the
 * "before launch" side of a launch line, then the question of which one gets skipped.
 * `t` is seconds into the voiceover, `q` the cue times from content/three-things-to-avoid.stick.json.
 */
const G = 630;
const P = (p: Partial<Pose> = {}): Pose => ({...STAND, ...p});
const lin = (v: number) => v;
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

/** A triangular warning sign. `on` (0..1) is the crimson accent; `post` is the length of a post below it. */
const Sign: React.FC<{x: number; y: number; s?: number; on?: number; ink?: boolean; post?: number; opacity?: number}> = ({x, y, s = 1, on = 0, ink = false, post = 0, opacity = 1}) => {
  const stroke = ink ? C.ink : C.mid;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity}>
      {post > 0 && <line x1={0} y1={30} x2={0} y2={30 + post / s} stroke={C.ink} strokeWidth={8} strokeLinecap="round" />}
      <path d="M 0 -42 L 46 36 L -46 36 Z" fill="#FFFFFF" stroke={stroke} strokeWidth={8} strokeLinejoin="round" />
      <path d="M 0 -14 L 0 8" stroke={stroke} strokeWidth={8} strokeLinecap="round" />
      <circle cx={0} cy={22} r={5} fill={stroke} />
      {on > 0 && (
        <g opacity={on}>
          <path d="M 0 -42 L 46 36 L -46 36 Z" fill={C.crimson} stroke={C.crimson} strokeWidth={8} strokeLinejoin="round" />
          <path d="M 0 -14 L 0 8" stroke="#FFFFFF" strokeWidth={8} strokeLinecap="round" />
          <circle cx={0} cy={22} r={5} fill="#FFFFFF" />
        </g>
      )}
    </g>
  );
};

/** A loud, spiky speech mark (no words). */
const Burst: React.FC<{x: number; y: number; rx: number; ry: number; rot?: number; n?: number; opacity?: number; p?: number; children?: React.ReactNode}> = ({x, y, rx, ry, rot = 0, n = 13, opacity = 1, p = 1, children}) => {
  const pts: string[] = [];
  for (let i = 0; i < n * 2; i++) {
    const a = (Math.PI * i) / n - Math.PI / 2;
    const k = i % 2 ? 0.74 : 1;
    pts.push(`${(Math.cos(a) * rx * k).toFixed(1)},${(Math.sin(a) * ry * k).toFixed(1)}`);
  }
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${p})`} opacity={opacity}>
      <polygon points={pts.join(' ')} fill="#FFFFFF" stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
      {children}
    </g>
  );
};

/** Sound arcs fanning out to the right of (x, y). */
const Arcs: React.FC<{x: number; y: number; t: number; on: number; dir?: 1 | -1}> = ({x, y, t, on, dir = 1}) => (
  <g opacity={on} fill="none" stroke={C.ink} strokeWidth={6} strokeLinecap="round">
    {[0, 1, 2].map((i) => {
      const o = 0.35 + 0.65 * Math.max(0, Math.sin(t * 9 - i * 1.1));
      const ax = x + dir * i * 24;
      const h = 22 + i * 12;
      return <path key={i} d={`M ${ax} ${y - h} Q ${ax + dir * 16} ${y} ${ax} ${y + h}`} opacity={o} />;
    })}
  </g>
);

const Clock: React.FC<{x: number; y: number; r: number; turn: number; p: number}> = ({x, y, r, turn, p}) => (
  <g transform={`translate(${x} ${y}) scale(${p})`} opacity={Math.min(1, p * 2)}>
    <circle r={r} fill="#FFFFFF" stroke={C.ink} strokeWidth={8} />
    {[0, 90, 180, 270].map((a) => (
      <line key={a} x1={0} y1={-r + 10} x2={0} y2={-r + 20} stroke={C.ink} strokeWidth={6} strokeLinecap="round" transform={`rotate(${a})`} />
    ))}
    <line x1={0} y1={0} x2={0} y2={-r * 0.5} stroke={C.ink} strokeWidth={8} strokeLinecap="round" transform="rotate(-60)" />
    <line x1={0} y1={0} x2={0} y2={-r * 0.74} stroke={C.ink} strokeWidth={6} strokeLinecap="round" transform={`rotate(${turn})`} />
    <circle r={7} fill={C.ink} />
  </g>
);

/** A small card: checkbox with a tick or a cross, and two grey lines. */
const MiniCard: React.FC<{x: number; y: number; w: number; h: number; scale?: number; opacity?: number; mark?: 'tick' | 'cross' | 'none'; markP?: number}> = ({x, y, w, h, scale = 1, opacity = 1, mark = 'none', markP = 0}) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity}>
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={14} fill="#FFFFFF" stroke={C.ink} strokeWidth={5} />
    <rect x={-w / 2 + 16} y={-12} width={24} height={24} rx={6} fill="none" stroke={C.ink} strokeWidth={4} />
    {mark === 'tick' && <path d={`M ${-w / 2 + 21} 0 L ${-w / 2 + 27} 7 L ${-w / 2 + 38} -9`} fill="none" stroke={C.ink} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={40} strokeDashoffset={40 * (1 - markP)} />}
    {mark === 'cross' && <path d={`M ${-w / 2 + 22} -6 L ${-w / 2 + 34} 6 M ${-w / 2 + 34} -6 L ${-w / 2 + 22} 6`} fill="none" stroke={C.ink} strokeWidth={6} strokeLinecap="round" strokeDasharray={40} strokeDashoffset={40 * (1 - markP)} />}
    <line x1={-w / 2 + 56} y1={-7} x2={w / 2 - 22} y2={-7} stroke={C.soft} strokeWidth={8} strokeLinecap="round" />
    <line x1={-w / 2 + 56} y1={11} x2={w / 2 - 70} y2={11} stroke={C.soft} strokeWidth={8} strokeLinecap="round" />
  </g>
);

const QCard: React.FC<{x: number; y: number; p: number}> = ({x, y, p}) => (
  <g transform={`translate(${x} ${y}) scale(${p})`} opacity={Math.min(1, p * 2)}>
    <rect x={-66} y={-44} width={132} height={88} rx={18} fill="#FFFFFF" stroke={C.ink} strokeWidth={5} />
    <text y={22} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={66} fill={C.ink}>
      ?
    </text>
  </g>
);

export const AvoidStage: React.FC<{t: number; q: Cues}> = ({t, q}) => {
  // ============ the three signs: strip at the top, then planted before the launch line, then centred for the question ============
  const signAt = [q.three, q.things, q.avoid];
  const act = [between(t, q.one, q.two - 0.02, 0.2), between(t, q.two, q.three3 - 0.02, 0.2), between(t, q.three3, q.many - 0.05, 0.25)];
  const cyc = [0, 1, 2].map((k) => between(t, q.skip + k * 0.75, q.skip + (k + 1) * 0.75, 0.12));
  const signOut = 1 - prog(t, q.cta - 0.1, 0.3, lin);
  const cycIdx = cyc.findIndex((v) => v > 0.5);
  const planted = prog(t, q.these, 0.9);
  const settleBump = Math.sin(Math.min(1, Math.max(0, (t - q.settle) / 0.5)) * Math.PI) * 7;
  const signs = [0, 1, 2].map((i) => {
    const a = prog(t, q.these + i * 0.12, 0.8);
    const b = prog(t, q.which + i * 0.08, 0.8);
    const x1 = lerp([330, 500, 670][i], [170, 290, 410][i], a);
    const y1 = lerp(72, 490, a);
    const s1 = lerp(0.8, 1.05, a);
    const x = lerp(x1, [270, 500, 730][i], b);
    const y = lerp(y1, 248, b) + settleBump * (1 - b);
    const s = lerp(s1, 1.5, b);
    const on = Math.max(act[i], cyc[i]);
    const vis = prog(t, signAt[i], 0.35, bounce) * signOut;
    return {x, y, s: s * (1 + 0.22 * on) * vis, on, post: 100 * a * (1 - b) * (1 - on * 0), ink: t >= q.these, vis};
  });

  // ============ 0: the warning that was not heard ============
  const o0 = 1 - prog(t, 2.2, 0.3, lin);
  const warnP = prog(t, q.warn, 0.4, bounce);

  // ============ 1: handing the expertise to an AI app ============
  const o1 = between(t, q.things - 0.3, q.one - 0.05, 0.3);
  const winIn = prog(t, q.hand + 0.1, 0.4, bounce);
  const fly = prog(t, q.expertise, 1.15, (v) => v * v * (3 - 2 * v));
  const bulbHold = prog(t, q.hand, 0.35, bounce);
  const bx = lerp(338, 700, fly);
  const by = lerp(405, 385, fly) - 110 * Math.sin(Math.PI * fly);
  const bs = lerp(0.85, 0.7, fly);

  // big numerals that open each of the three things
  const numeral = (n: string, a: number) => {
    const o = between(t, a, a + 0.95, 0.2);
    return o > 0 ? (
      <text x={500} y={500} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={330} fill={C.ink} opacity={o} transform={`translate(500 ${500}) scale(${0.6 + 0.4 * prog(t, a, 0.4, bounce)}) translate(-500 ${-500})`}>
        {n}
      </text>
    ) : null;
  };

  // ============ 2a-c: the book is not the method ============
  const o2a = between(t, q.one + 0.8, q.holds - 0.1, 0.25);
  const bookP = prog(t, q.bookIs - 0.1, 0.4, bounce);
  const eqP = prog(t, q.bookIs + 0.39, 0.3, bounce);
  const methP = prog(t, q.method, 0.35, bounce);
  const slashP = prog(t, q.method + 0.3, 0.3, lin);

  const o2b = between(t, q.holds - 0.12, q.sessions - 0.1, 0.25);
  const hBook = prog(t, q.holds, 0.35, bounce);
  const lineP = [prog(t, q.holds + 0.3, 0.35), prog(t, q.holds + 1.0, 0.35), prog(t, q.explain, 0.35)];

  const o2c = between(t, q.sessions - 0.15, q.two - 0.1, 0.25);
  const sp = ((t - q.sessions) % 1.7) / 1.7;
  const womanSpeaks = sp < 0.5;
  const wig = Math.sin(t * 6) * 0.05;

  // ============ 3a-c: do not judge the app by how confident it sounds ============
  const o3a = between(t, q.judge - 0.1, q.loudAnswer - 0.1, 0.25);
  const winA = prog(t, q.judge + 0.7, 0.3);
  const burstA = prog(t, q.appWord + 0.38, 0.4, bounce);
  const gaugeLevel = 0.12 + 0.86 * prog(t, q.confidentWord, 0.9, lin);
  const soundsOn = prog(t, q.sounds - 0.1, 0.2) * (1 - prog(t, q.loudAnswer - 0.2, 0.15));

  const o3b = between(t, q.loudAnswer - 0.15, q.test - 0.1, 0.25);
  const loudIn = prog(t, q.loudAnswer, 0.4, bounce);
  const loudOut = 1 - prog(t, q.slowAnswer, 0.3);
  const hit = prog(t, q.damage, 0.2) * (1 - prog(t, q.slowAnswer + 0.1, 0.25));
  const slowIn = prog(t, q.slowAnswer + 0.1, 0.4, bounce);
  const slowLines = prog(t, q.slowAnswer + 0.9, 0.9, lin);
  const yoursP = prog(t, q.isYours, 0.35, bounce);
  const notYoursP = prog(t, q.notYours, 0.35, bounce);
  const clientPose = P({lean: -0.05 * hit + 0.015 * (1 - hit) * prog(t, q.slowAnswer + 0.1, 0.3), mood: hit > 0.5 ? 'sad' : 'smile', look: t < q.slowAnswer + 0.1 ? -1 : 1});

  const o3c = between(t, q.test - 0.1, q.three3 - 0.15, 0.25);
  const qc = [0, 1, 2].map((k) => prog(t, q.questions + k * 0.2, 0.35, bounce));
  const arrowP = prog(t, q.questions + 0.7, 0.4);
  const clockP = prog(t, q.wait - 0.5, 0.4, bounce);
  const clockTurn = 360 * prog(t, q.wait - 0.45, 1.2, lin);
  const waitP = prog(t, q.wait, 0.35, bounce);

  // ============ 4: do not launch without a named reader ============
  const o4 = between(t, q.launchNo - 0.25, q.many - 0.15, 0.3);
  const win4 = prog(t, q.launchNo - 0.2, 0.35, bounce);
  const launchUp = prog(t, q.launchNo, 0.7);
  const chairP = prog(t, q.reader - 0.1, 0.35, bounce);
  const readerP = prog(t, q.decide - 0.2, 0.3);
  const weekP = prog(t, q.week - 0.1, 0.35, bounce) * (1 - prog(t, q.decline - 1.4, 0.3));
  const nameP = prog(t, q.name, 0.35, bounce);
  const nameLine = prog(t, q.name + 0.15, 0.8, lin);
  const declineP = prog(t, q.decline, 0.35, bounce);
  const noP = prog(t, q.answerNot, 0.35, bounce);
  const readerPose = P({
    rh: t > q.decline && t < q.many - 0.3 ? [0.2, -0.1] : [0.17, 0.2],
    lh: [-0.17, 0.27],
    mood: 'smile',
    look: 1,
  });

  // ============ 5: many details can be improved after launch ============
  const o5 = between(t, q.many - 0.1, q.which - 0.1, 0.3);
  const blocks = Array.from({length: 9}, (_, i) => ({c: i % 3, r: Math.floor(i / 3), i}));
  const toAfter = prog(t, q.after, 0.8);
  const fixP = prog(t, q.improved, 0.5, bounce);
  const lineDraw = prog(t, q.launchLine, 0.7, lin);
  const flagP = prog(t, q.launchLine + 0.5, 0.35, bounce);
  const groundP = prog(t, q.settle, 0.4);

  // ============ 6: which one will you skip ============
  const o6 = between(t, q.which - 0.2, q.cta - 0.05, 0.3);
  const figLook = cycIdx < 0 ? 0 : cycIdx - 1;
  const figPose: Pose = (() => {
    if (cycIdx === 0) return P({lh: [-0.2, -0.3], look: -1, mood: 'flat'});
    if (cycIdx === 1) return P({rh: [0.03, -0.34], look: 0, mood: 'flat'});
    if (cycIdx === 2) return P({rh: [0.2, -0.3], look: 1, mood: 'flat'});
    return P({mood: 'flat', look: figLook, lean: 0.01});
  })();

  // ============ 7: call to follow ============
  const ctaOn = prog(t, q.cta, 0.5, bounce);

  return (
    <g>
      {/* 0: the warning that was not heard */}
      {o0 > 0 && (
        <g opacity={o0}>
          <Stick x={330} y={G} h={290} hair="long" pose={mix(P(), P({rh: [0.17, -0.3]}), prog(t, q.warn - 0.15, 0.25))} />
          <Stick x={680} y={G} h={290} pose={P({mood: t > q.warn + 0.1 ? 'open' : 'smile', look: -1})} />
          {warnP > 0 && <Sign x={388} y={264} s={1.4 * warnP} on={1} post={22} />}
        </g>
      )}

      {/* 1: handing the expertise to an AI app */}
      {o1 > 0 && (
        <g opacity={o1}>
          <Stick x={240} y={G} h={270} hair="bob" pose={mix(P({rh: [0.2, 0.02]}), P({rh: [0.24, -0.04]}), fly)} />
          {winIn > 0 && (
            <g opacity={Math.min(1, winIn * 1.5)}>
              <Window x={540} y={250} w={320} h={210} />
              {[0, 1].map((k) => (
                <line key={k} x1={575} y1={335 + k * 34} x2={k ? 700 : 820} y2={335 + k * 34} stroke={C.soft} strokeWidth={9} strokeLinecap="round" opacity={fly > 0.98 ? 0 : 1} />
              ))}
            </g>
          )}
          {t >= q.appIn && <Tag x={700} y={212} text="AI APP" size={24} opacity={prog(t, q.appIn, 0.3, bounce)} />}
          {bulbHold > 0 && (
            <g transform={`translate(${bx} ${by}) scale(${bs * bulbHold})`}>
              <Bulb s={1} />
            </g>
          )}
        </g>
      )}

      {numeral('1', q.one)}
      {numeral('2', q.two)}
      {numeral('3', q.three3)}

      {/* 2a: a book is not the method */}
      {o2a > 0 && (
        <g opacity={o2a}>
          {bookP > 0 && (
            <g transform={`translate(290 400) scale(${2.4 * bookP})`}>
              <Book s={1} />
            </g>
          )}
          {eqP > 0 && (
            <g transform={`translate(500 400) scale(${eqP})`} stroke={C.ink} strokeWidth={14} strokeLinecap="round">
              <line x1={-44} y1={-18} x2={44} y2={-18} />
              <line x1={-44} y1={18} x2={44} y2={18} />
              <line x1={34 - 68 * slashP} y1={-58 + 116 * slashP} x2={34} y2={-58} strokeWidth={slashP > 0 ? 14 : 0} />
            </g>
          )}
          {methP > 0 && <Tag x={720} y={400} text="METHOD" size={36} opacity={Math.min(1, methP * 2)} />}
        </g>
      )}

      {/* 2b: a book holds what you could explain */}
      {o2b > 0 && (
        <g opacity={o2b}>
          <Stick x={290} y={G} h={280} pose={P({rh: [0.2, 0.0], mood: 'smile'})} />
          {hBook > 0 && (
            <g transform={`translate(415 412) scale(${hBook})`}>
              <Book s={1} />
            </g>
          )}
          <g opacity={prog(t, q.holds + 0.2, 0.3)}>
            <circle cx={348} cy={330} r={8} fill="none" stroke={C.ink} strokeWidth={4} />
            <circle cx={390} cy={300} r={12} fill="none" stroke={C.ink} strokeWidth={4} />
            <Bubble x={640} y={255} w={300} h={150} />
            {[0, 1, 2].map((k) => {
              const x2 = [760, 740, 680][k];
              return <line key={k} x1={520} y1={222 + k * 33} x2={520 + (x2 - 520) * lineP[k]} y2={222 + k * 33} stroke={C.soft} strokeWidth={10} strokeLinecap="round" />;
            })}
          </g>
          {t >= q.explain && <Tag x={640} y={385} text="COULD EXPLAIN" size={22} opacity={prog(t, q.explain, 0.3, bounce)} />}
        </g>
      )}

      {/* 2c: sessions hold what you do */}
      {o2c > 0 && (
        <g opacity={o2c}>
          <Stick x={250} y={G} h={270} hair="ponytail" pose={P({rh: womanSpeaks ? [0.2, -0.05 + wig * 2] : [0.17, 0.27], lean: womanSpeaks ? 0.01 : 0, look: 1})} />
          <Stick x={750} y={G} h={270} pose={P({lh: !womanSpeaks ? [-0.2, -0.05 + wig * 2] : [-0.17, 0.27], look: -1})} />
          {t >= q.sessions + 0.1 && <Dots x={womanSpeaks ? 224 : 724} y={310} t={t} />}
          {t >= q.sessions + 0.1 && <Tag x={500} y={300} text="SESSIONS" size={26} opacity={prog(t, q.sessions + 0.1, 0.3, bounce)} />}
          {[15.85, 16.15, 16.45].map((a, k) => (
            <MiniCard key={k} x={500} y={420 + k * 76} w={230} h={56} scale={prog(t, a, 0.3, bounce)} mark="tick" markP={prog(t, a + 0.35, 0.3, lin)} />
          ))}
        </g>
      )}

      {/* 3a: judging the app by how confident it sounds */}
      {o3a > 0 && (
        <g opacity={o3a}>
          <Stick x={190} y={G} h={270} pose={P({rh: [0.2, -0.05], mood: t > q.sounds ? 'smile' : 'flat', look: 1, lean: t > q.sounds ? 0.02 : 0})} />
          {winA > 0 && <Window x={470} y={300} w={330} h={190} opacity={winA} />}
          {winA > 0 && [0, 1].map((k) => <line key={k} x1={505} y1={375 + k * 34} x2={k ? 640 : 760} y2={375 + k * 34} stroke={C.soft} strokeWidth={9} strokeLinecap="round" opacity={winA} />)}
          {burstA > 0 && (
            <Burst x={640} y={205} rx={119} ry={70} p={burstA} rot={Math.sin(t * 14) * 1.2}>
              <line x1={-68} y1={-14} x2={68} y2={-14} stroke={C.ink} strokeWidth={14} strokeLinecap="round" />
              <line x1={-68} y1={16} x2={22} y2={16} stroke={C.ink} strokeWidth={14} strokeLinecap="round" />
            </Burst>
          )}
          <Gauge x={360} y={480} h={220} level={gaugeLevel} limit={1.2} opacity={prog(t, q.confidentWord - 0.1, 0.3)} label="CONFIDENCE" />
          <Arcs x={494} y={205} t={t} on={soundsOn} dir={-1} />
        </g>
      )}

      {/* 3b: the loud answer in a voice that is not yours, against a slow one that is */}
      {o3b > 0 && (
        <g opacity={o3b}>
          <Window x={125} y={345} w={260} h={165} opacity={0.5 + 0.5 * loudOut} />
          {loudIn * loudOut > 0 && (
            <Burst x={255} y={250} rx={119} ry={70} p={loudIn} rot={Math.sin(t * 14) * 1.5} opacity={loudOut}>
              <line x1={-68} y1={-14} x2={68} y2={-14} stroke={C.ink} strokeWidth={14} strokeLinecap="round" />
              <line x1={-68} y1={16} x2={22} y2={16} stroke={C.ink} strokeWidth={14} strokeLinecap="round" />
            </Burst>
          )}
          <Arcs x={402} y={250} t={t} on={prog(t, q.voice, 0.2) * loudOut} dir={1} />
          {notYoursP > 0 && <Tag x={255} y={550} text="NOT YOURS" size={22} opacity={Math.min(1, notYoursP * 2)} />}
          <Stick x={520} y={G} h={270} pose={clientPose} />
          {hit > 0 && (
            <g opacity={hit} stroke={C.ink} strokeWidth={6} strokeLinecap="round">
              {[-1, 0, 1].map((k) => (
                <line key={k} x1={520 + k * 30} y1={316 - Math.abs(k) * 4} x2={520 + k * 52} y2={290 - Math.abs(k) * 4} />
              ))}
            </g>
          )}
          <Stick x={760} y={G} h={250} hair="bob" pose={P({rh: slowIn > 0.5 ? [0.2, -0.02] : [0.17, 0.27], lean: 0.01})} opacity={Math.min(1, slowIn * 2)} />
          {slowIn > 0 && (
            <g opacity={Math.min(1, slowIn * 2)}>
              <Bubble x={690} y={225} w={250} h={80} />
              {slowLines < 0.02 ? <Dots x={640} y={225} t={t} /> : null}
              {[0, 1].map((k) => (
                <line key={k} x1={580} y1={211 + k * 28} x2={580 + (k ? 100 : 190) * slowLines} y2={211 + k * 28} stroke={C.soft} strokeWidth={9} strokeLinecap="round" />
              ))}
            </g>
          )}
          {yoursP > 0 && <Tag x={760} y={311} text="YOURS" size={20} opacity={Math.min(1, yoursP * 2)} />}
        </g>
      )}

      {/* 3c: test it with the questions where your method says wait */}
      {o3c > 0 && (
        <g opacity={o3c}>
          <Stick x={170} y={G} h={270} hair="bun" pose={P({rh: [0.22, -0.12], look: 1})} />
          {[360, 520, 680].map((x, k) => (
            <QCard key={k} x={x} y={240} p={qc[k]} />
          ))}
          {arrowP > 0 && (
            <g opacity={arrowP} stroke={C.ink} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" fill="none">
              <path d="M 745 296 L 745 346" />
              <path d="M 725 328 L 745 350 L 765 328" />
            </g>
          )}
          <Window x={600} y={370} w={280} h={190} />
          {[0, 1].map((k) => (
            <line key={k} x1={632} y1={448 + k * 34} x2={k ? 750 : 846} y2={448 + k * 34} stroke={C.soft} strokeWidth={9} strokeLinecap="round" />
          ))}
          {clockP > 0 && <Clock x={430} y={470} r={62} turn={clockTurn} p={clockP} />}
          {waitP > 0 && <Tag x={430} y={575} text="WAIT" size={26} opacity={Math.min(1, waitP * 2)} />}
        </g>
      )}

      {/* 4: do not launch without a named reader */}
      {o4 > 0 && (
        <g opacity={o4}>
          {win4 > 0 && (
            <g opacity={Math.min(1, win4 * 1.5)}>
              <Window x={590} y={400} w={290} h={170} dim={noP > 0.5 ? 1 : 0} />
              {[0, 1].map((k) => (
                <line key={k} x1={622} y1={478 + k * 32} x2={k ? 740 : 846} y2={478 + k * 32} stroke={C.soft} strokeWidth={9} strokeLinecap="round" />
              ))}
            </g>
          )}
          {launchUp > 0 && (
            <g opacity={Math.min(1, launchUp * 2) * (1 - declineP)} stroke={C.ink} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" fill="none" transform={`translate(0 ${-30 * launchUp})`}>
              <path d="M 735 380 L 735 310" />
              <path d="M 710 332 L 735 306 L 760 332" />
            </g>
          )}
          {chairP > 0 && (
            <g opacity={Math.min(1, chairP * 1.5)}>
              <Chair x={225} y={568} s={1} />
              <Tag x={225} y={300} text="READER" size={22} />
            </g>
          )}
          {readerP > 0 && <Stick x={380} y={G} h={270} hair="long" pose={readerPose} opacity={readerP} />}
          {nameP > 0 && (
            <g transform={`translate(225 365) scale(${nameP})`}>
              <rect x={-85} y={-27} width={170} height={54} rx={14} fill="#FFFFFF" stroke={C.ink} strokeWidth={5} />
              <line x1={-60} y1={10} x2={-60 + 120 * nameLine} y2={10} stroke={C.ink} strokeWidth={7} strokeLinecap="round" />
              <line x1={-60} y1={-8} x2={-60 + 60 * nameLine} y2={-8} stroke={C.soft} strokeWidth={7} strokeLinecap="round" />
            </g>
          )}
          {/* answers travel from the app to the reader, week after week */}
          {[q.answers, q.answers + 0.45, q.answers + 0.9, q.answers + 1.35].map((a, k) => {
            const p = prog(t, a, 0.7, lin);
            return p > 0 && p < 1 && t < q.decline - 0.8 ? <MiniCard key={k} x={lerp(590, 462, p)} y={462} w={250} h={60} scale={0.42} opacity={Math.min(1, p * 4) * Math.min(1, (1 - p) * 4)} /> : null;
          })}
          {weekP > 0 && (
            <g opacity={weekP}>
              {Array.from({length: 7}).map((_, k) => (
                <g key={k}>
                  <rect x={288 + k * 62} y={174} width={52} height={52} rx={10} fill="#FFFFFF" stroke={C.ink} strokeWidth={5} />
                  <path d={`M ${300 + k * 62} 200 L ${309 + k * 62} 211 L ${327 + k * 62} 188`} fill="none" stroke={C.ink} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={50} strokeDashoffset={50 * (1 - prog(t, q.week + k * 0.13, 0.25, lin))} />
                </g>
              ))}
              <Tag x={500} y={266} text="EACH WEEK" size={20} />
            </g>
          )}
          {declineP > 0 && (
            <g opacity={Math.min(1, declineP * 2)}>
              <Tag x={740} y={158} text="DECLINE" size={26} />
              {[0, 1, 2].map((k) => (
                <MiniCard key={k} x={740} y={225 + k * 57} w={250} h={54} scale={0.9 * prog(t, q.decline + 0.15 + k * 0.2, 0.3, bounce)} mark="cross" markP={prog(t, q.decline + 0.4 + k * 0.2, 0.3, lin)} />
              ))}
            </g>
          )}
          {noP > 0 && (
            <g transform={`translate(735 485) scale(${noP})`} opacity={Math.min(1, noP * 2)}>
              <circle r={50} fill="#FFFFFF" fillOpacity={0.85} stroke={C.ink} strokeWidth={9} />
              <line x1={-35} y1={-35} x2={35} y2={35} stroke={C.ink} strokeWidth={9} strokeLinecap="round" />
            </g>
          )}
        </g>
      )}

      {/* 5: many details can be improved after launch */}
      {o5 > 0 && (
        <g opacity={o5}>
          {blocks.map((b) => {
            const p = prog(t, q.many + b.i * 0.08, 0.35, bounce);
            const tilt = (((b.i * 7) % 5) - 2) * 4 * (1 - fixP);
            const loose = t > q.settle ? Math.sin(t * 3 + b.i) * 3 : 0;
            const x = lerp(404 + b.c * 96, 610 + b.c * 96, toAfter);
            const y = 308 + b.r * 78 - (1 - fixP) * (((b.i * 5) % 3) - 1) * 10;
            return p > 0 ? <Block key={b.i} x={x} y={y} w={84} h={60} rot={tilt + loose} scale={p} /> : null;
          })}
          {lineDraw > 0 && (
            <g>
              <line x1={520} y1={235} x2={520} y2={235 + (G - 235) * lineDraw} stroke={C.ink} strokeWidth={7} strokeDasharray="14 12" strokeLinecap="round" />
              <Tag x={520} y={140} text="LAUNCH" size={26} opacity={prog(t, q.launchLine, 0.3, bounce)} />
              {flagP > 0 && (
                <g transform={`translate(520 ${175 + (1 - flagP) * 30})`} opacity={flagP}>
                  <line x1={0} y1={0} x2={0} y2={60} stroke={C.ink} strokeWidth={7} strokeLinecap="round" />
                  <path d="M 0 2 L 64 20 L 0 40 Z" fill={C.crimson} stroke={C.crimson} strokeWidth={4} strokeLinejoin="round" />
                </g>
              )}
            </g>
          )}
          {t >= q.launchLine + 0.2 && <Tag x={740} y={248} text="AFTER" size={24} fill="#FFFFFF" color={C.ink} opacity={prog(t, q.launchLine + 0.2, 0.3, bounce)} />}
          {t >= q.before && <Tag x={290} y={398} text="BEFORE" size={26} opacity={prog(t, q.before, 0.3, bounce)} />}
          {groundP > 0 && <line x1={130 + 160 * (1 - groundP)} y1={G} x2={450 - 160 * (1 - groundP)} y2={G} stroke={C.ink} strokeWidth={8} strokeLinecap="round" />}
        </g>
      )}

      {/* 6: which one are you most likely to skip? */}
      {o6 > 0 && (
        <g opacity={o6}>
          <Stick x={500} y={G} h={240} pose={figPose} />
          <text x={500} y={150} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={96} fill={C.ink} opacity={prog(t, q.which, 0.4, bounce)} transform={`translate(500 150) scale(${prog(t, q.which, 0.4, bounce)}) translate(-500 -150)`}>
            ?
          </text>
        </g>
      )}

      {/* the three signs (strip, then planted, then centred) */}
      {signs.map((s, i) => (
        <Sign key={i} x={s.x} y={s.y} s={s.s} on={s.on} ink={s.ink} post={s.post} opacity={s.vis > 0 ? 1 : 0} />
      ))}

      {/* 7: call to follow */}
      {ctaOn > 0 && (
        <g opacity={Math.min(1, ctaOn * 1.5)}>
          <FollowIcon x={500} y={215} s={1.45 * ctaOn} />
          <Bell x={500} y={385} s={1.15 * ctaOn} ring={Math.max(0, t - q.cta - 0.4)} />
          <Tag x={500} y={515} text="FOLLOW FOR MORE" size={34} opacity={prog(t, q.cta + 0.15, 0.3)} />
        </g>
      )}
    </g>
  );
};
