import React from 'react';
import {Audio, Sequence, staticFile, useVideoConfig} from 'remotion';
import {Cutout, CloneCopies, behindFront, behindPlate, cutoutStyle} from './behind';
import {overItem} from './over';
import type {Fx} from './schema';
import {BEHIND, Cue, cuesFor, fxRange, pop, tw, useFxTime, easeInC} from './util';

/** Camera moves on her clip: extra zoom, blur and face position for a given second. */
export const videoMods = (fx: Fx[], t: number): {zoom: number; blur: number; focusY?: number} => {
  let zoom = 1;
  let blur = 0;
  let focusY: number | undefined;
  for (const f of fx) {
    const [a, b] = fxRange(f);
    if (f.type === 'digital-zoom') {
      if (t >= a && t <= b + 0.25) {
        const end = f.props.snapAt ?? b;
        if (t < end) zoom *= 1 + (f.props.creepTo - 1) * tw(t, a, end, 0, 1, (x) => x);
        else if (t <= b) zoom *= f.props.snapTo;
        else zoom *= 1 + (f.props.snapTo - 1) * (1 - tw(t, b, b + 0.25));
      }
    } else if (f.type === 'zoom-through') {
      if (t >= a && t < f.at) {
        const p = tw(t, a, f.at, 0, 1, easeInC);
        zoom *= 1 + 1.9 * p;
        blur = Math.max(blur, 16 * p);
      } else if (t >= f.at && t <= f.at + 0.55) {
        const p = tw(t, f.at, f.at + 0.55);
        zoom *= f.props.nextZoom * (1 + 0.55 * (1 - p));
        blur = Math.max(blur, 12 * (1 - p));
        focusY = f.props.nextFocusY;
      } else if (t > f.at + 0.55 && t <= b + 0.4) {
        zoom *= f.props.nextZoom;
        focusY = f.props.nextFocusY;
      }
    }
  }
  return {zoom, blur, focusY};
};

const BehindItem: React.FC<{fx: Fx}> = ({fx}) => {
  const [a] = fxRange(fx);
  const {abs} = useFxTime(a);
  const {fps} = useVideoConfig();
  const from = Math.round(a * fps);
  return (
    <>
      {behindPlate(fx)}
      <Cutout from={from} style={cutoutStyle(fx, abs)} />
      {fx.type === 'clone' && <CloneCopies fx={fx} />}
      {behindFront(fx)}
    </>
  );
};

/** Inside her window: the matte-based effects draw between her room and her cutout. */
export const FxBehind: React.FC<{fx: Fx[]}> = ({fx}) => {
  const {fps} = useVideoConfig();
  return (
    <>
      {fx
        .filter((f) => BEHIND.includes(f.type))
        .map((f, i) => {
          const [a, b] = fxRange(f);
          return (
            <Sequence key={`b${i}`} from={Math.round(a * fps)} durationInFrames={Math.max(1, Math.round((b - a) * fps))} premountFor={fps}>
              <BehindItem fx={f} />
            </Sequence>
          );
        })}
    </>
  );
};

/** Above the scene graphics and below the captions. */
export const FxOver: React.FC<{fx: Fx[]}> = ({fx}) => {
  const {fps} = useVideoConfig();
  return (
    <>
      {fx.map((f, i) => {
        const node = overItem(f);
        if (!node) return null;
        const [a, b] = fxRange(f);
        return (
          <Sequence key={`o${i}`} from={Math.round(a * fps)} durationInFrames={Math.max(1, Math.round((b - a) * fps))} premountFor={fps}>
            {node}
          </Sequence>
        );
      })}
    </>
  );
};

/** Effect sounds. Default mode `minimal` plays only each effect's main entrance sound; `full` adds the detail ticks and pops. Same-name cues closer than 0.15 s collapse into one. */
export const FxSound: React.FC<{fx: Fx[]; volume: number; mode: 'minimal' | 'full' | 'off'}> = ({fx, volume, mode}) => {
  const {fps} = useVideoConfig();
  if (mode === 'off') return null;
  const cues: Cue[] = fx
    .flatMap(cuesFor)
    .filter((c) => mode === 'full' || c.tier === 1)
    .sort((x, y) => x.at - y.at);
  const kept: Cue[] = [];
  for (const c of cues) {
    const prev = kept[kept.length - 1];
    if (prev && prev.name === c.name && c.at - prev.at < 0.15) continue;
    kept.push(c);
  }
  return (
    <>
      {kept.map((c, i) => (
        <Sequence key={i} from={Math.max(0, Math.round(c.at * fps))} durationInFrames={Math.ceil(2 * fps)}>
          <Audio src={staticFile(`sfx/fx-${c.name}.wav`)} volume={volume * (c.vol ?? 1)} />
        </Sequence>
      ))}
    </>
  );
};
export {pop};
