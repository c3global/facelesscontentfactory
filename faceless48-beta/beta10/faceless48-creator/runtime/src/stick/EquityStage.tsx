import React from 'react';
import {interpolate} from 'remotion';
import {Stick, STAND, type Pose} from './figure';
import {Bubble, Card, Tag, C, SANS, between, bounce, prog} from './kit';
import {Block, Coin, Ledger} from './parts';
import type {Cues} from './PileStage';

/**
 * Stage art for "Equity Theory". Two people build the first version of an offer together; later, a balance
 * scale shows what each puts in against what each gets out. `t` is seconds into the voiceover, `q` the cue times
 * from content/equity-theory.stick.json.
 */
const G = 630;

const pose = (p: Partial<Pose> = {}): Pose => ({...STAND, ...p});

/** A balance scale. Positive tilt lowers the left (inputs) side. Items sit on the pans. */
const Scale: React.FC<{
  x: number;
  y: number;
  s?: number;
  tilt: number;
  blocks: number;
  coins: number;
  unnamed?: number;
  name?: string;
  panLabels?: number;
  opacity?: number;
}> = ({x, y, s = 1, tilt, blocks, coins, unnamed = 0, name, panLabels = 0, opacity = 1}) => {
  const L = 150;
  const a = (tilt * Math.PI) / 180;
  const lx = -L * Math.cos(a);
  const ly = -150 + L * Math.sin(a);
  const rx = L * Math.cos(a);
  const ry = -150 - L * Math.sin(a);
  const lp = ly + 62;
  const rp = ry + 62;
  const nb = Math.ceil(blocks);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity}>
      <rect x={-64} y={0} width={128} height={18} rx={9} fill={C.soft} stroke={C.ink} strokeWidth={5} />
      <line x1={0} y1={0} x2={0} y2={-150} stroke={C.ink} strokeWidth={12} strokeLinecap="round" />
      <line x1={lx} y1={ly} x2={rx} y2={ry} stroke={C.ink} strokeWidth={14} strokeLinecap="round" />
      <circle cx={0} cy={-150} r={14} fill="#FFFFFF" stroke={C.ink} strokeWidth={6} />
      {[[lx, ly, lp], [rx, ry, rp]].map(([ex, ey, py], i) => (
        <g key={i}>
          <path d={`M ${ex} ${ey} L ${ex - 62} ${py} M ${ex} ${ey} L ${ex + 62} ${py}`} stroke={C.ink} strokeWidth={4} fill="none" />
          <rect x={ex - 70} y={py} width={140} height={16} rx={8} fill="#FFFFFF" stroke={C.ink} strokeWidth={5} />
        </g>
      ))}
      {Array.from({length: nb}).map((_, i) => (
        <Block key={i} x={lx} y={lp - 24 - i * 40} w={70} h={36} scale={Math.min(1, blocks - i)} opacity={Math.min(1, blocks - i)} />
      ))}
      {unnamed > 0 && <Block x={lx} y={lp - 24 - nb * 40} w={70} h={36} unnamed scale={unnamed} opacity={unnamed} />}
      {Array.from({length: Math.ceil(coins)}).map((_, i) => (
        <Coin key={i} x={rx} y={rp - 26 - i * 34} s={Math.min(1, coins - i)} opacity={Math.min(1, coins - i)} />
      ))}
      {panLabels > 0 && (
        <g opacity={panLabels}>
          <Tag x={lx} y={lp + 54} text="INPUTS" size={20} />
          <Tag x={rx} y={rp + 54} text="OUTPUTS" size={20} />
        </g>
      )}
      {name && <Tag x={0} y={58} text={name} size={22} />}
    </g>
  );
};

export const EquityStage: React.FC<{t: number; q: Cues}> = ({t, q}) => {
  // ---------------- 1: building the first version for free ----------------
  const o1 = 1 - prog(t, q.which - 0.1, 0.3, (v) => v);
  const builds = [q.helped, q.build, q.first, q.first + 0.4, q.free - 0.6, q.free - 0.3];
  const pyr = [
    {x: 436, y: 608},
    {x: 500, y: 608},
    {x: 564, y: 608},
    {x: 468, y: 564},
    {x: 532, y: 564},
    {x: 500, y: 520},
  ];
  const carry = (at: number) => 1 - prog(t, at + 0.5, 0.2, (v) => v);

  // ---------------- 2: good news or bad news ----------------
  const choice = between(t, q.which - 0.1, q.badNews + 0.2, 0.25);

  // ---------------- 3 / 4: the ledger she cannot see, the two sentences ----------------
  const o3 = between(t, q.badNews, q.goodNews - 0.05, 0.3);
  const o4 = between(t, q.goodNews, q.equity - 0.1, 0.3);
  const priceIn = prog(t, q.charging, 0.4, bounce);
  const ledgerIn = prog(t, q.ledger - 0.2, 0.5);
  const wonder = prog(t, q.ledger + 0.8, 0.4, bounce);
  const s1In = prog(t, q.goodNews + 2.4, 0.4, bounce);
  const s2In = prog(t, q.two, 0.4, bounce);

  // ---------------- 5-7: the scales ----------------
  const scales = between(t, q.equity, q.leaves - 0.05, 0.3);
  const solo = 1 - prog(t, q.compare, 0.7);
  const pairIn = prog(t, q.compare + 0.2, 0.6);
  const inBlocks = prog(t, q.putin, 0.9, (v) => v) * 4;
  const outCoins = prog(t, q.getout, 0.9, (v) => v) * 1;
  // you: coins rise at "outcomes risen"
  const youCoins = interpolate(prog(t, q.outcomes, 1.0, (v) => v), [0, 1], [1, 4]);
  const herUnnamed = prog(t, q.unnamed - 1.0, 0.5, bounce);
  const evenTilt = 9;
  const youTilt = interpolate(prog(t, q.outcomes, 1.0, (v) => v), [0, 1], [evenTilt, 0]);
  const herTilt = interpolate(prog(t, q.tilted - 0.8, 1.0, (v) => v), [0, 1], [evenTilt, 17]);
  const evenTag = prog(t, q.even, 0.35, bounce) * (1 - prog(t, q.now, 0.3));
  const equalBubble = prog(t, q.describe, 0.4, bounce) * (1 - prog(t, q.leaves, 0.3));
  const scaleY = 590;

  // ---------------- 8: the unspoken ledger ----------------
  const o8 = between(t, q.leaves + 0.1, q.thank - 0.05, 0.35);

  // ---------------- 9: thank her, ask ----------------
  const o9 = between(t, q.thank, q.question - 0.05, 0.3);
  const checkAt = [q.specific + 0.8, q.specific + 1.3, q.built];
  const askIn = prog(t, q.ask, 0.4, bounce);
  const missing = prog(t, q.unfinished, 0.5, bounce);

  // ---------------- 10: left unnamed ----------------
  const o10 = between(t, q.question, q.cta - 0.05, 0.3);
  const beat = 1 + 0.06 * Math.sin(Math.max(0, t - q.unnamedQ) * 6);

  // ---------------- 11: call to action ----------------
  const ctaOn = prog(t, q.cta, 0.5, bounce);

  return (
    <g>
      {/* 1 */}
      {o1 > 0 && (
        <g opacity={o1}>
          <Stick x={300} y={G} h={270} pose={pose({rh: carry(q.helped) > 0.5 ? [0.2, -0.05] : [0.17, 0.2], mood: 'smile'})} />
          <Stick x={700} y={G} h={270} pose={pose({lh: carry(q.build) > 0.5 ? [-0.2, -0.05] : [-0.17, 0.2], mood: 'smile'})} />
          {pyr.map((b, i) => {
            const p = prog(t, builds[i], 0.45, bounce);
            return p > 0 ? <Block key={i} x={b.x} y={b.y - (1 - p) * 120} opacity={Math.min(1, p * 3)} /> : null;
          })}
          {t >= q.first && <Tag x={500} y={455} text="FIRST VERSION" size={24} opacity={prog(t, q.first, 0.3)} />}
          {t >= q.free && <Tag x={700} y={290} text="FREE" size={34} fill={C.crimson} opacity={prog(t, q.free, 0.3, bounce)} />}
        </g>
      )}

      {/* 2 */}
      {choice > 0 && (
        <g opacity={choice}>
          <Tag x={290} y={330} text="GOOD NEWS" size={38} />
          <Tag x={710} y={330} text="BAD NEWS" size={38} />
        </g>
      )}

      {/* 3 */}
      {o3 > 0 && (
        <g opacity={o3}>
          <Tag x={500} y={70} text="BAD NEWS" size={30} />
          <Stick x={300} y={G} h={270} pose={pose({mood: t > q.ledger ? 'flat' : 'smile', look: 1})} />
          <Stick x={700} y={G} h={270} pose={pose({mood: 'smile', look: -1})} />
          {pyr.map((b, i) => (
            <Block key={i} x={b.x} y={b.y} />
          ))}
          {priceIn > 0 && (
            <g transform={`translate(500 ${440}) scale(${priceIn})`}>
              <path d="M -52 -36 L 38 -36 L 66 0 L 38 36 L -52 36 Z" fill="#FFFFFF" stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
              <circle cx={38} cy={0} r={6} fill={C.ink} />
              <text x={-12} y={14} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={44} fill={C.ink}>
                $
              </text>
            </g>
          )}
          {ledgerIn > 0 && (
            <g opacity={ledgerIn}>
              <circle cx={700} cy={330} r={9} fill="none" stroke={C.ink} strokeWidth={4} strokeDasharray="4 5" />
              <circle cx={706} cy={300} r={14} fill="none" stroke={C.ink} strokeWidth={4} strokeDasharray="4 5" />
              <Ledger x={700} y={200} s={0.8} dashed />
            </g>
          )}
          {wonder > 0 && (
            <text x={300} y={255} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={90} fill={C.ink} opacity={wonder} transform={`scale(${wonder})`} style={{transformOrigin: '300px 230px'}}>
              ?
            </text>
          )}
        </g>
      )}

      {/* 4 */}
      {o4 > 0 && (
        <g opacity={o4}>
          <Tag x={500} y={70} text="GOOD NEWS" size={30} />
          <Stick x={300} y={G} h={270} pose={pose({mood: 'smile', look: 1, rh: [0.2, -0.05]})} />
          <Stick x={700} y={G} h={270} pose={pose({mood: 'smile', look: -1})} />
          {[
            {n: '1', y: 165, p: s1In},
            {n: '2', y: 262, p: s2In},
          ].map((b) => (
            <g key={b.n} opacity={b.p} transform={`translate(0 ${(1 - b.p) * 30})`}>
              <text x={270} y={b.y + 22} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={70} fill={C.ink}>
                {b.n}
              </text>
              <Bubble x={500} y={b.y} w={330} h={86}>
                <line x1={380} y1={b.y - 12} x2={620} y2={b.y - 12} stroke={C.soft} strokeWidth={9} strokeLinecap="round" />
                <line x1={380} y1={b.y + 12} x2={540} y2={b.y + 12} stroke={C.soft} strokeWidth={9} strokeLinecap="round" />
              </Bubble>
            </g>
          ))}
        </g>
      )}

      {/* 5, 6, 7: the scales */}
      {scales > 0 && (
        <g opacity={scales}>
          <Tag x={500} y={58} text="EQUITY THEORY" size={28} fill="#FFFFFF" color={C.mid} />
          {/* one scale, then two */}
          <Scale x={interpolate(solo, [0, 1], [310, 500])} y={scaleY} s={interpolate(solo, [0, 1], [0.84, 1.2])} tilt={t < q.compare ? 0 : youTilt + (t < q.outcomes ? 0 : 0)} blocks={t < q.back ? inBlocks : 4} coins={t < q.outcomes ? (t < q.back ? outCoins : 1) : youCoins} name={t >= q.compare + 0.3 ? 'YOU' : undefined} panLabels={prog(t, q.putin, 0.4) * solo} />
          {pairIn > 0 && (
            <Scale x={690} y={scaleY} s={0.84} tilt={t < q.tilted - 0.8 ? evenTilt : herTilt} blocks={4} coins={1} unnamed={herUnnamed} name="HER" opacity={pairIn} />
          )}
          {evenTag > 0 && (
            <g opacity={evenTag} transform="translate(500 300)">
              <Tag x={0} y={0} text="EVEN" size={36} />
              <text y={-36} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={64} fill={C.ink}>
                =
              </text>
            </g>
          )}
          {equalBubble > 0 && (
            <g opacity={equalBubble}>
              <circle cx={380} cy={190} r={9} fill="none" stroke={C.ink} strokeWidth={4} />
              <circle cx={400} cy={162} r={13} fill="none" stroke={C.ink} strokeWidth={4} />
              <Bubble x={440} y={108} w={120} h={80}>
                <text x={440} y={132} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={64} fill={C.ink}>
                  =
                </text>
              </Bubble>
            </g>
          )}
        </g>
      )}

      {/* 8: the unspoken ledger */}
      {o8 > 0 && (
        <g opacity={o8}>
          <Ledger x={500} y={300} s={1.7} dashed opacity={prog(t, q.leaves + 0.2, 0.4)} />
          <text x={500} y={150} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={100} fill={C.ink} opacity={prog(t, q.ledger2, 0.4, bounce)}>
            ?
          </text>
          <Tag x={500} y={560} text="NO VERDICT" size={34} opacity={prog(t, q.deciding, 0.4, bounce)} />
        </g>
      )}

      {/* 9: thank her, ask */}
      {o9 > 0 && (
        <g opacity={o9}>
          <Stick x={300} y={G} h={270} pose={pose({mood: 'smile', rh: [0.2, -0.04]})} />
          <Stick x={700} y={G} h={270} pose={pose({mood: 'smile', look: -1})} />
          <Card x={420} y={250} w={230} h={72} label="THANK YOU" scale={0.95} opacity={prog(t, q.thank + 0.2, 0.4, bounce)} />
          {[0, 1, 2].map((i) => (
            <Card key={i} x={700} y={130 + i * 70} w={250} h={60} scale={0.9} opacity={prog(t, q.specific + i * 0.3, 0.35)} check={prog(t, checkAt[i], 0.4, (v) => v)} />
          ))}
          {askIn > 0 && (
            <g opacity={askIn}>
              <circle cx={340} cy={345} r={8} fill="none" stroke={C.ink} strokeWidth={4} />
              <Bubble x={430} y={400} w={110} h={86}>
                <text x={430} y={427} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={64} fill={C.ink}>
                  ?
                </text>
              </Bubble>
            </g>
          )}
          {missing > 0 && (
            <g opacity={missing}>
              {pyr.slice(0, 5).map((b, i) => (
                <Block key={i} x={b.x + 0} y={b.y - 0} w={64} h={44} />
              ))}
              <Block x={500} y={520} unnamed scale={missing} />
            </g>
          )}
        </g>
      )}

      {/* 10: left unnamed */}
      {o10 > 0 && (
        <g opacity={o10}>
          <g transform={`translate(500 320) scale(${3.2 * beat})`}>
            <Block x={0} y={0} unnamed />
          </g>
          <Tag x={500} y={520} text="UNNAMED" size={38} opacity={prog(t, q.unnamedQ, 0.35, bounce)} />
        </g>
      )}

      {/* 11: call to action */}
      {ctaOn > 0 && (
        <g opacity={ctaOn}>
          <g transform={`translate(500 250) scale(${ctaOn})`}>
            <circle r={78} fill="#FFFFFF" stroke={C.ink} strokeWidth={8} />
            <path d="M 0 -52 L 18 0 L 0 52 L -18 0 Z" fill={C.ink} />
            <path d="M 0 -52 L 18 0 L -18 0 Z" fill={C.crimson} />
          </g>
          <Tag x={500} y={420} text={'COMMENT "CQ" OR DM ME'} size={38} />
          <text x={500} y={510} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={42} fill={C.ink}>
            for the CQ Compass
          </text>
        </g>
      )}
    </g>
  );
};
