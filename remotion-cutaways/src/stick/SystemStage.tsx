import React from 'react';
import {Stick, STAND, type Pose} from './figure';
import {Bubble, Tag, C, SANS, between, bounce, prog} from './kit';
import {FollowIcon} from './parts';
import {Magnifier} from './icons2';
import type {Cues} from './PileStage';

/**
 * Stage art for "A Small Business Is a System Too".
 * Metaphor: a shopfront that opens into a three-part flow (Find, Arrive, Return), the weakest part gets an app.
 */
const G = 630;
const lin = (v: number) => v;
const pose = (p: Partial<Pose> = {}): Pose => ({...STAND, ...p});
const sm = (x: number) => x * x * (3 - 2 * x);

const BX = [200, 500, 800];
const BY = 240;

const Shop: React.FC<{x: number; y: number; s?: number; opacity?: number}> = ({x, y, s = 1, opacity = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity}>
    <path d="M -190 -120 L 190 -120 L 210 -50 L -210 -50 Z" fill="#FFFFFF" stroke={C.ink} strokeWidth={8} strokeLinejoin="round" />
    {[-130, -50, 30, 110].map((dx) => (
      <path key={dx} d={`M ${dx} -120 L ${dx + 40} -120 L ${dx + 46} -50 L ${dx + 4} -50 Z`} fill={C.ink} />
    ))}
    <rect x={-190} y={-50} width={380} height={190} fill="#FFFFFF" stroke={C.ink} strokeWidth={8} />
    <rect x={-150} y={-10} width={150} height={100} rx={8} fill="none" stroke={C.ink} strokeWidth={7} />
    <rect x={40} y={-10} width={100} height={150} rx={8} fill="none" stroke={C.ink} strokeWidth={7} />
    <circle cx={120} cy={70} r={7} fill={C.ink} />
  </g>
);
const Loop: React.FC<{x?: number; y?: number; s?: number}> = ({x = 0, y = 0, s = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M 26 -6 A 28 28 0 1 0 8 24" fill="none" stroke={C.ink} strokeWidth={8} strokeLinecap="round" />
    <path d="M 10 -26 L 28 -4 L 2 -2" fill="none" stroke={C.ink} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
  </g>
);
const StepIcon: React.FC<{k: number}> = ({k}) => (
  <g>
    {k === 0 && (
      <g>
        <circle cx={-6} cy={-6} r={24} fill="none" stroke={C.ink} strokeWidth={8} />
        <line x1={12} y1={12} x2={34} y2={34} stroke={C.ink} strokeWidth={10} strokeLinecap="round" />
      </g>
    )}
    {k === 1 && (
      <g>
        <rect x={-22} y={-38} width={44} height={74} rx={6} fill="none" stroke={C.ink} strokeWidth={8} />
        <circle cx={12} cy={0} r={5} fill={C.ink} />
      </g>
    )}
    {k === 2 && <Loop />}
  </g>
);
const FlowBox: React.FC<{k: number; on: number; dim: number; hot: number}> = ({k, on, dim, hot}) => (
  <g opacity={on * (1 - 0.65 * dim)} transform={`translate(${BX[k]} ${BY}) scale(${0.7 + 0.3 * on})`}>
    <rect x={-100} y={-90} width={200} height={190} rx={30} fill="#FFFFFF" stroke={hot > 0 ? C.crimson : C.ink} strokeWidth={hot > 0 ? 10 : 7} />
    <g transform="translate(0 -14)">
      <StepIcon k={k} />
    </g>
  </g>
);

export const SystemStage: React.FC<{t: number; q: Cues}> = ({t, q}) => {
  const shop1 = prog(t, 0.25, 0.55, bounce) * (1 - prog(t, q.three - 0.1, 0.4, lin));
  const owner = prog(t, q.owner, 0.45, bounce);

  // the flow
  const flowOn = (k: number) => prog(t, [q.p1, q.p2, q.p3][k] - 0.2, 0.4, bounce);
  const tag = (k: number) => prog(t, [q.p1, q.p2, q.p3][k] + 0.2, 0.35, bounce);
  const arrowP = (k: number) => prog(t, [q.p2, q.p3][k] - 0.35, 0.4);
  const flowFade = 1 - prog(t, q.sbs - 0.3, 0.35, lin);
  const dimOthers = prog(t, q.build, 0.4) * (1 - prog(t, q.sbs - 0.5, 0.3));
  const hotP = prog(t, q.weakest, 0.4);
  const hotOn = t >= q.weakest && t < q.sbs - 0.3 ? 1 : 0;

  // energy bars (many owners spend energy on part one)
  const bars = prog(t, q.spend - 0.6, 0.5) * (1 - prog(t, q.works - 0.1, 0.4));
  const bar = (k: number) => [prog(t, q.spend, 1.6, sm), 0.18 * prog(t, q.spend, 0.8), 0.14 * prog(t, q.spend, 0.8)][k];

  // customers
  const custIn = prog(t, q.ask, 0.45, bounce);
  const cust = (k: number) => prog(t, q.ask + 0.15 + k * 0.4, 0.4, bounce);
  const pointP = prog(t, q.twice - 0.8, 0.8, sm);
  const mag = prog(t, q.twice + 0.8, 0.5, bounce) * (1 - prog(t, q.build + 1.0, 0.4));

  // the app builds in the weak spot
  const app = prog(t, q.build, 0.45, bounce);
  const screen = prog(t, q.build + 0.4, 1.2, sm);

  // small business saturday
  const shop2 = prog(t, q.sbs, 0.5, bounce);
  const lookMag = prog(t, q.own, 0.45, bounce);

  const ctaOn = prog(t, q.cta, 0.5, bounce);
  const askP = prog(t, q.cta + 0.7, 0.45, bounce);

  const showFlow = t >= q.p1 - 0.3 && flowFade > 0;
  return (
    <g>
      {/* shop and owner */}
      {shop1 > 0 && (
        <g opacity={shop1}>
          <Shop x={500} y={310} s={1.2} />
          <Stick x={140} y={G} h={240} pose={pose({mood: 'smile', look: 1})} opacity={owner} />
          <Tag x={500} y={560} text="SMALL BUSINESS" size={22} opacity={prog(t, q.owner, 0.4, bounce)} />
        </g>
      )}

      {/* three-part flow */}
      {showFlow && (
        <g opacity={flowFade}>
          {[0, 1, 2].map((k) => (
            <g key={k}>
              <FlowBox k={k} on={flowOn(k)} dim={k === 1 ? 0 : dimOthers} hot={k === 1 ? hotP * hotOn : 0} />
              <Tag x={BX[k]} y={BY + 140} text={['FIND', 'ARRIVE', 'RETURN'][k]} size={22} opacity={tag(k) * (1 - 0.6 * (k === 1 ? 0 : dimOthers))} />
            </g>
          ))}
          {[0, 1].map((k) => (
            <path key={k} d={`M ${BX[k] + 112} ${BY} L ${BX[k] + 112 + 76 * arrowP(k)} ${BY}`} stroke={C.ink} strokeWidth={8} strokeLinecap="round" opacity={arrowP(k) > 0 ? 1 : 0} />
          ))}

          {/* energy bars */}
          {bars > 0 && (
            <g opacity={bars}>
              {[0, 1, 2].map((k) => (
                <rect key={k} x={BX[k] - 24} y={600 - 280 * bar(k)} width={48} height={280 * bar(k) + 4} rx={16} fill={k === 0 ? C.crimson : C.soft} stroke={C.ink} strokeWidth={5} />
              ))}
            </g>
          )}

          {/* customers asked */}
          {custIn > 0 && (
            <g>
              <Stick x={150} y={G} h={200} pose={pose({mood: 'smile', look: 1})} opacity={custIn} sw={8} />
              {[0, 1, 2].map((k) => {
                const x = [380, 560, 740][k];
                const target = [1, 1, 0][k]; // two of three name the same spot
                const tx = BX[target];
                return (
                  <g key={k} opacity={cust(k)}>
                    <Stick x={x} y={G} h={170} hair={k === 1 ? 'bob' : undefined} pose={pose({mood: 'flat', look: 0})} sw={7} />
                    <line x1={x} y1={G - 210} x2={x + (tx - x) * 0.8 * pointP} y2={G - 210 + (BY + 110 - (G - 210)) * 0.8 * pointP} stroke={target === 1 ? C.crimson : C.ink} strokeWidth={target === 1 ? 7 : 5} strokeLinecap="round" strokeDasharray="3 12" />
                  </g>
                );
              })}
            </g>
          )}
          {mag > 0 && (
            <g transform={`translate(${BX[1] + 30} ${BY - 30}) scale(${1.3 * mag})`} opacity={mag}>
              <Magnifier />
            </g>
          )}

          {/* an app builds only in that spot */}
          {app > 0 && (
            <g transform={`translate(${BX[1]} ${BY - 16}) scale(${app})`} opacity={app}>
              <rect x={-40} y={-64} width={80} height={130} rx={14} fill="#FFFFFF" stroke={C.ink} strokeWidth={7} />
              <rect x={-28} y={-48} width={56} height={Math.max(0, 76 * screen)} rx={6} fill={C.crimson} />
            </g>
          )}
        </g>
      )}

      {/* small business saturday */}
      {shop2 > 0 && t < q.cta - 0.2 && (
        <g opacity={shop2 * (1 - prog(t, q.cta - 0.3, 0.3, lin))}>
          <Shop x={500} y={320} s={1.25} />
          <Tag x={500} y={560} text="SMALL BUSINESS SATURDAY" size={22} fill={C.crimson} />
          <g transform={`translate(${620} ${400}) scale(${1.6 * lookMag})`} opacity={lookMag}>
            <Magnifier />
          </g>
        </g>
      )}

      {ctaOn > 0 && (
        <g opacity={Math.min(1, ctaOn * 2)}>
          <FollowIcon x={500} y={210} s={1.5 * ctaOn} />
          <Tag x={500} y={400} text="FOLLOW FOR MORE" size={38} opacity={prog(t, q.cta + 0.15, 0.4, bounce)} />
          <text x={500} y={510} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={42} fill={C.crimson} opacity={askP}>
            Where do your customers
          </text>
          <text x={500} y={566} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={42} fill={C.crimson} opacity={askP}>
            almost give up?
          </text>
        </g>
      )}
    </g>
  );
};
