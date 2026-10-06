import React from 'react';
import {interpolate} from 'remotion';
import {Stick, STAND, joints, mix, type Pose} from './figure';
import {Bubble, Card, Chair, Cross, Dots, Gauge, Panel, SANS, Tag, Window, C, between, bounce, prog, stackAt} from './kit';

/**
 * Stage art for "The Pile". Everything is drawn in a 1000 x 700 box; the video places that box on the page.
 * `t` is seconds into the voiceover and `q` holds the cue times (content/the-pile.stick.json), so the art
 * lands on the words. One crimson accent per scene.
 */
export type Cues = Record<string, number>;
const G = 630; // ground line

const ASKS = ['Introduce yourself', 'Finish your profile', 'Join these channels', 'Post every week', 'Help with this project'];

const raised = (crouch: number, mood: Pose['mood'] = 'sad'): Pose => ({
  ...STAND,
  lh: [-0.07, -0.27],
  rh: [0.07, -0.27],
  crouch,
  mood,
  lf: -0.09 - 0.05 * crouch,
  rf: 0.09 + 0.05 * crouch,
});

/** Someone standing with their arms up, holding a stack of cards. */
const Loaded: React.FC<{
  x: number;
  h: number;
  crouch: number;
  cards: {label?: string; at: number; out?: number}[];
  t: number;
  opacity?: number;
  wobble?: number;
  dropAt?: number;
  color?: string;
  mood?: Pose['mood'];
  /** 0 = the idle pose, 1 = arms up holding the stack */
  raise?: number;
  idle?: Partial<Pose>;
  gap?: number;
}> = ({x, h, crouch, cards, t, opacity = 1, wobble = 0, dropAt, color = C.cast, mood = 'sad', raise = 1, idle, gap = 66}) => {
  const up = raised(crouch, mood);
  const pose: Pose = raise >= 1 ? up : mix({...STAND, ...(idle ?? {}), crouch, mood}, up, raise);
  const j = joints(x, G, h, pose);
  const baseY = Math.min(j.handL[1], j.handR[1]) - 40;
  const sway = Math.sin(t * 9) * wobble * 4;
  return (
    <g opacity={opacity}>
      <Stick x={x} y={G} h={h} pose={pose} color={color} />
      <g transform={`rotate(${sway} ${x} ${baseY})`}>
        {cards.map((c, i) => {
          const s = stackAt(i, x, baseY, gap);
          const inP = prog(t, c.at, 0.5, bounce);
          const outP = c.out !== undefined ? prog(t, c.out, 0.35) : 0;
          if (inP <= 0 || outP >= 1) return null;
          let px = s.x;
          let py = s.y - (1 - inP) * 320;
          let rot = s.rot;
          let op = Math.min(1, inP * 4) * (1 - outP);
          if (dropAt !== undefined && i === cards.length - 1) {
            const u = prog(t, dropAt, 1.0, (v) => v);
            px += 300 * u;
            py += -70 * u + 420 * u * u;
            rot += 70 * u;
            op *= 1 - prog(t, dropAt + 0.8, 0.3, (v) => v);
          }
          return <Card key={i} x={px} y={py} rot={rot} label={c.label} opacity={op} />;
        })}
      </g>
    </g>
  );
};

const Stand: React.FC<{x: number; h?: number; pose?: Partial<Pose>; color?: string; opacity?: number}> = ({x, h = 250, pose, color = C.cast, opacity = 1}) => <Stick x={x} y={G} h={h} pose={{...STAND, ...pose}} color={color} opacity={opacity} />;

const walk = (t: number, speed = 7): Partial<Pose> => ({
  lf: -0.05 + Math.sin(t * speed) * 0.1,
  rf: 0.05 - Math.sin(t * speed) * 0.1,
  lh: [-0.12 - Math.sin(t * speed) * 0.05, 0.27],
  rh: [0.12 + Math.sin(t * speed) * 0.05, 0.27],
});

export const PileStage: React.FC<{t: number; q: Cues}> = ({t, q}) => {
  // ---------- A: the newcomer and the pile (0 to ~28) ----------
  const aOn = 1 - prog(t, q.admin - 0.3, 0.4, (v) => v);
  const aDim = 1 - 0.7 * prog(t, q.ciciIn, 0.4, (v) => v);
  const arrive = prog(t, 0.1, 2.3, (v) => v);
  const nx = interpolate(arrive, [0, 1], [-90, 500]);
  const walking = arrive < 1;
  const cardsA = ASKS.map((label, i) => ({label, at: [q.ask1, q.ask2, q.ask3, q.ask4, q.ask5][i]}));
  const landed = cardsA.filter((c) => t >= c.at + 0.2).length;
  const crouchA = Math.min(1, landed * 0.17 + prog(t, q.heavy, 0.9) * 0.2);
  const silentP = prog(t, q.silent, 0.6, (v) => v);
  const hello = prog(t, 1.9, 0.2, (v) => v) * (1 - prog(t, q.ask1 - 0.5, 0.3, (v) => v));
  const waveHand = -0.2 + Math.sin(t * 9) * 0.05;
  const calendar = between(t, q.week - 0.1, q.ask1 + 0.2, 0.3);
  const day = Math.min(7, Math.floor(((t - q.week) / (q.ask1 - q.week)) * 7 + 0.0001) + 1);
  const bubble = prog(t, q.belong, 0.3);
  const star = prog(t, q.matter, 0.3);
  const yes = prog(t, q.yes, 0.35, bounce);

  // ---------- B: the administrator and the intern ----------
  const bOn = between(t, q.admin, q.group, 0.35);
  const bCards = [0, 1, 2, 3, 4, 5].map((i) => ({at: q.admin + 0.9 + i * 0.7}));
  const bLanded = bCards.filter((c) => t >= c.at + 0.45).length;
  const bCrouch = Math.min(1, bLanded * 0.18);

  // ---------- C: the group, the open role, the empty space ----------
  const c1 = between(t, q.group, q.role - 0.05, 0.3);
  const c2 = between(t, q.role, q.space - 0.05, 0.3);
  const c3 = between(t, q.space, q.load - 0.05, 0.3);
  const need = prog(t, 36.2, 0.3);

  // ---------- D/E: loading someone up, and the drop ----------
  const de = between(t, q.load, q.maybe, 0.3);
  const dCards = [0, 1, 2, 3, 4, 5, 6].map((i) => ({at: q.load + 0.55 + i * 0.7}));
  const dLanded = dCards.filter((c) => t >= c.at + 0.45).length;
  const dCrouch = Math.min(1, dLanded * 0.15) * (1 - 0.35 * prog(t, q.drops, 0.5));
  const gaugeP = prog(t, q.capacity, 1.4, (v) => v);
  const away = prog(t, q.decide, 0.9);
  const crossP = prog(t, q.decide + 0.4, 0.5) * (1 - prog(t, q.maybe, 0.35));
  const maybeQ = prog(t, q.maybe + 0.1, 0.4, bounce);

  // ---------- G: one first step ----------
  const g = between(t, q.maybe + 0.2, q.model, 0.35);
  const gShrink = (i: number) => prog(t, q.shrink + i * 0.28, 0.3, (v) => v);

  // ---------- H: the four places ----------
  const h = between(t, q.model, q.design, 0.3);
  const workLit = prog(t, q.work, 0.35);
  const nodes: {k: string; x: number; y: number}[] = [
    {k: 'WORK', x: 500, y: 150},
    {k: 'PEOPLE', x: 270, y: 330},
    {k: 'STRUCTURE', x: 730, y: 330},
    {k: 'CULTURE', x: 500, y: 510},
  ];

  // ---------- I: design the first ask ----------
  const iOn = between(t, q.design, q.finish, 0.3);

  // ---------- J: finish it, hand over the next ----------
  const jOn = between(t, q.finish, q.judge, 0.3);

  // ---------- K: check the load ----------
  const kOn = between(t, q.judge, q.cta, 0.3);
  const scan = prog(t, q.check, 1.1, (v) => v);

  // ---------- L: end card ----------
  const lOn = prog(t, q.cta, 0.5);

  return (
    <g>
      {/* A */}
      {aOn > 0 && (
        <g opacity={aOn * aDim}>
          <Window x={120} y={30} w={760} h={640} title="YOUR COMMUNITY" dim={silentP > 0.5 ? 1 : 0} />
          {calendar > 0 && (
            <g opacity={calendar}>
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                <g key={i}>
                  <rect x={235 + i * 80} y={128} width={64} height={64} rx={14} fill={i < day ? C.ink : '#FFFFFF'} stroke={C.ink} strokeWidth={5} />
                  <text x={267 + i * 80} y={172} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={28} fill={i < day ? '#FFFFFF' : C.ink}>
                    {d}
                  </text>
                </g>
              ))}
            </g>
          )}
          <Loaded
            x={nx}
            h={230}
            crouch={crouchA}
            cards={cardsA}
            t={t}
            wobble={prog(t, q.heavy, 0.3) * (1 - silentP)}
            opacity={1 - 0.65 * silentP}
            mood={silentP > 0.5 ? 'flat' : t > q.ask1 - 0.2 ? 'sad' : 'smile'}
            raise={prog(t, q.ask1 - 0.2, 0.5, (v) => v)}
            idle={{...(walking ? walk(t) : {}), ...(hello > 0 ? {rh: [0.2, waveHand], lh: [-0.17, 0.27]} : {})}}
          />
          {bubble > 0 && silentP < 0.5 && (
            <g opacity={bubble * (1 - prog(t, q.silent - 0.4, 0.3))}>
              <circle cx={700} cy={380} r={9} fill="none" stroke={C.ink} strokeWidth={4} />
              <circle cx={730} cy={335} r={14} fill="none" stroke={C.ink} strokeWidth={4} />
              <Bubble x={790} y={250} w={170} h={120}>
                {star < 0.5 ? (
                  <g fill="none" stroke={C.ink} strokeWidth={6}>
                    <circle cx={768} cy={250} r={26} />
                    <circle cx={812} cy={250} r={26} />
                  </g>
                ) : (
                  <path d="M 790 210 L 801 238 L 831 240 L 808 259 L 816 288 L 790 272 L 764 288 L 772 259 L 749 240 L 779 238 Z" fill="none" stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
                )}
              </Bubble>
            </g>
          )}
          {yes > 0 && silentP < 0.5 && (
            <g transform={`translate(790 470) scale(${yes})`} opacity={1 - prog(t, q.belong - 0.2, 0.3)}>
              <circle r={44} fill="#FFFFFF" stroke={C.crimson} strokeWidth={7} />
              <path d="M -18 2 L -5 16 L 20 -14" fill="none" stroke={C.crimson} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
            </g>
          )}
          {silentP > 0 && (
            <g opacity={silentP}>
              <Bubble x={770} y={450} w={170} h={90}>
                <Dots x={734} y={456} t={t} />
              </Bubble>
            </g>
          )}
        </g>
      )}

      {/* B */}
      {bOn > 0 && (
        <g opacity={bOn}>
          <Stand x={230} h={300} pose={{...walk(0), rh: [0.3, -0.05], lh: [-0.12, 0.25], mood: 'flat', lean: 0.02}} />
          <Loaded x={690} h={210} crouch={bCrouch} cards={bCards.map((c) => ({at: c.at}))} t={t} gap={50} wobble={prog(t, q.clock, 0.5) * 0.8} />
          <Tag x={230} y={G + 42} text="ADMIN" size={20} />
          <Tag x={690} y={G + 42} text="INTERN" size={20} opacity={prog(t, q.intern - 0.2, 0.3)} />
          {t >= q.clock && (
            <g opacity={prog(t, q.clock, 0.3)} transform="translate(400 110)">
              <circle r={50} fill="#FFFFFF" stroke={C.ink} strokeWidth={6} />
              <line x1={0} y1={0} x2={0} y2={-28} stroke={C.ink} strokeWidth={6} strokeLinecap="round" transform={`rotate(${(t - q.clock) * 120})`} />
              <line x1={0} y1={0} x2={0} y2={-38} stroke={C.crimson} strokeWidth={5} strokeLinecap="round" transform={`rotate(${(t - q.clock) * 720})`} />
            </g>
          )}
        </g>
      )}

      {/* C1: the group has needs too */}
      {c1 > 0 && (
        <g opacity={c1}>
          <Window x={170} y={110} w={660} h={510} title="THE GROUP" />
          {[330, 500, 670].map((x, i) => (
            <Stand key={i} x={x} h={230} pose={{lh: need > 0 ? [-0.1, -0.24 + Math.sin(t * 8 + i) * 0.04] : [-0.17, 0.27], rh: need > 0 ? [0.1, -0.24 + Math.cos(t * 8 + i) * 0.04] : [0.17, 0.27], mood: need > 0 ? 'open' : 'smile'}} opacity={prog(t, q.group + 0.1 + i * 0.12, 0.3)} />
          ))}
        </g>
      )}
      {/* C2: an open role */}
      {c2 > 0 && (
        <g opacity={c2}>
          <Chair x={500} y={470} s={1.7} />
          <Tag x={500} y={120} text="OPEN ROLE" size={36} />
        </g>
      )}
      {/* C3: a space that needs life */}
      {c3 > 0 && (
        <g opacity={c3}>
          <Window x={150} y={130} w={700} h={440} title="THE SPACE" />
          <path d={t > q.space + 0.9 ? 'M 210 380 L 470 380 L 500 380 L 530 290 L 570 470 L 600 380 L 790 380' : 'M 210 380 L 790 380'} fill="none" stroke={C.crimson} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
        </g>
      )}

      {/* D / E */}
      {de > 0 && (
        <g opacity={de}>
          <Stand x={235 - away * 60} h={300} pose={{...walk(0), rh: [0.3 - 0.2 * away, -0.05 + 0.3 * away], lh: [-0.12, 0.25], mood: away > 0.5 ? 'flat' : 'smile', lean: away * -0.05}} opacity={1 - prog(t, q.maybe, 0.4)} />
          <Loaded x={650} h={230} crouch={dCrouch} cards={dCards.map((c) => ({at: c.at}))} t={t} gap={46} wobble={prog(t, q.capacity, 0.4) * (1 - prog(t, q.drops, 0.3)) * 0.8} dropAt={q.drops} />
          {crossP > 0 && <Cross x={650} y={150} p={crossP} />}
          {maybeQ > 0 && (
            <text x={650} y={190} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={150} fill={C.ink} opacity={maybeQ} transform={`scale(${maybeQ})`} style={{transformOrigin: '650px 150px'}}>
              ?
            </text>
          )}
          <Gauge x={850} y={G} level={gaugeP * 0.95} limit={0.6} opacity={prog(t, q.capacity - 0.3, 0.4)} label="CAPACITY" />
        </g>
      )}

      {/* G: one first step */}
      {g > 0 && (
        <g opacity={g}>
          <Stand x={290} h={270} pose={{rh: [0.3, -0.12], lh: [-0.12, 0.25]}} />
          <Stand x={730} h={230} pose={{mood: 'smile', look: -1}} />
          {[1, 2, 3, 4].map((i) => {
            const slot = stackAt(i, 510, 560, 70);
            const out = gShrink(i);
            if (out >= 1) return null;
            return <Card key={i} x={slot.x} y={slot.y - 20} rot={slot.rot} opacity={1 - out} scale={1 - 0.2 * out} />;
          })}
          <Card x={510} y={interpolate(prog(t, q.shrink + 1.3, 0.8), [0, 1], [540, 400])} w={400} h={86} label="FIRST STEP" accent scale={1 + 0.22 * prog(t, q.shrink + 1.3, 0.8)} />
        </g>
      )}

      {/* H: the four places */}
      {h > 0 && (
        <g opacity={h}>
          <Panel x={120} y={10} w={760} h={668} />
          <Tag x={500} y={62} text="NADLER AND TUSHMAN" size={22} fill="#FFFFFF" color={C.mid} />
          {[[0, 1], [1, 3], [3, 2], [2, 0], [0, 3], [1, 2]].map(([a, b], i) => (
            <line key={i} x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y} stroke={C.soft} strokeWidth={6} strokeLinecap="round" />
          ))}
          {nodes.map((n, i) => {
            const on = i === 0 ? workLit : 0;
            const appear = prog(t, q.model + 0.3 + i * 0.2, 0.35, bounce);
            return (
              <g key={n.k} transform={`translate(${n.x} ${n.y}) scale(${appear})`}>
                {on > 0 && <circle r={96 + (t - q.work) * 18 % 40} fill="none" stroke={C.crimson} strokeWidth={4} opacity={0.5 * (1 - ((t - q.work) * 18 % 40) / 40)} />}
                <circle r={84} fill={on > 0.5 ? C.crimson : '#FFFFFF'} stroke={on > 0.5 ? C.crimson : C.ink} strokeWidth={6} />
                <text y={9} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={n.k.length > 6 ? 22 : 30} letterSpacing={1.5} fill={on > 0.5 ? '#FFFFFF' : C.ink}>
                  {n.k}
                </text>
              </g>
            );
          })}
          <Tag x={500} y={622} text="WHAT PEOPLE ARE ASKED TO DO" size={22} opacity={prog(t, q.work + 0.5, 0.4)} />
          {t >= q.lookThere && (
            <g opacity={prog(t, q.lookThere, 0.2)} transform={`translate(${330 - Math.abs(Math.sin((t - q.lookThere) * 7)) * 18} 150)`}>
              <path d="M 0 0 L 60 0 M 38 -22 L 62 0 L 38 22" fill="none" stroke={C.ink} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />
            </g>
          )}
        </g>
      )}

      {/* I: design the first ask */}
      {iOn > 0 && (
        <g opacity={iOn}>
          <Panel x={140} y={90} w={720} h={540} />
          <g fill="none" stroke={C.ink} strokeWidth={6} strokeLinecap="round" opacity={1 - prog(t, q.one, 0.2)}>
            <path d="M 300 240 L 300 200 L 340 200 M 700 200 L 740 200 L 740 240 M 740 360 L 740 400 L 700 400 M 340 400 L 300 400 L 300 360" />
          </g>
          {t >= q.matters && t < q.one + 0.2 && (
            <g stroke={C.ink} strokeWidth={6} strokeLinecap="round" opacity={prog(t, q.matters, 0.2) * (1 - prog(t, q.one - 0.1, 0.2))}>
              {[[-170, -70, -200, -100], [170, -70, 200, -100], [-170, 70, -200, 100], [170, 70, 200, 100]].map(([a, b, c, d], i) => (
                <line key={i} x1={500 + a} y1={300 + b} x2={500 + c} y2={300 + d} />
              ))}
            </g>
          )}
          <Card x={500} y={300} w={380} h={86} opacity={prog(t, q.design + 0.5, 0.4)} scale={1 + 0.06 * Math.sin(prog(t, q.matters, 0.8, (v) => v) * Math.PI)} />
          <text x={250} y={330} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={90} fill={C.ink} opacity={prog(t, q.one, 0.3, bounce)}>
            1
          </text>
          <Card x={500} y={410} w={380} h={86} opacity={prog(t, q.two, 0.4, bounce)} />
          <text x={250} y={440} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={90} fill={C.ink} opacity={prog(t, q.two, 0.3, bounce)}>
            2
          </text>
          <g opacity={prog(t, q.two + 0.5, 0.4)}>
            <line x1={200} y1={510} x2={800} y2={510} stroke={C.crimson} strokeWidth={6} strokeDasharray="14 12" strokeLinecap="round" />
            <Tag x={500} y={575} text="AT MOST" size={26} />
          </g>
        </g>
      )}

      {/* J: finish it, then the next */}
      {jOn > 0 && (
        <g opacity={jOn}>
          <Stand x={680} h={250} pose={{lh: [0.0, 0.0], rh: [0.12, 0.02], mood: 'smile'}} />
          <Card x={680 - 10} y={340} w={330} h={70} label="Introduce yourself" check={prog(t, q.finish + 1.0, 0.5, (v) => v)} opacity={1 - prog(t, q.next - 0.2, 0.3)} />
          <Stand x={240} h={290} pose={{rh: [0.15, 0.0 - 0.1], lh: [-0.12, 0.25], mood: 'smile'}} opacity={prog(t, q.next - 0.8, 0.4)} />
          {t >= q.next - 0.2 && <Card x={interpolate(prog(t, q.next - 0.2, 0.9), [0, 1], [300, 640])} y={340} w={330} h={70} opacity={prog(t, q.next - 0.2, 0.2)} />}
        </g>
      )}

      {/* K: check the load */}
      {kOn > 0 && (
        <g opacity={kOn}>
          <Loaded x={600} h={230} crouch={1} cards={[0, 1, 2, 3, 4, 5, 6].map(() => ({at: -1}))} t={t} gap={46} wobble={0.7 * prog(t, q.judge, 0.4)} />
          <Gauge x={850} y={G} level={0.95} limit={0.6} label="LOAD" />
          <g transform={`translate(${interpolate(scan, [0, 1], [380, 760])} ${interpolate(scan, [0, 1], [150, 420])})`} opacity={prog(t, q.check, 0.2)} fill="none" stroke={C.ink} strokeWidth={9} strokeLinecap="round">
            <circle r={50} fill="#FFFFFF" fillOpacity={0.6} />
            <line x1={36} y1={36} x2={80} y2={80} />
          </g>
        </g>
      )}

      {/* L: end card */}
      {lOn > 0 && (
        <g opacity={lOn}>
          <Tag x={500} y={290} text="LINK BELOW OR IN MY BIO" size={42} />
          <text x={500} y={410} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={40} fill={C.ink}>
            Read more on Substack
          </text>
          <text x={500} y={460} textAnchor="middle" fontFamily={SANS} fontWeight={500} fontSize={32} fill={C.mid}>
            c3globalco.substack.com
          </text>
        </g>
      )}
    </g>
  );
};
