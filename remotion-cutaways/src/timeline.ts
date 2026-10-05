import {Easing, interpolate} from 'remotion';
import {AvatarState, LayoutKey, TRANSITION_FRAMES, stateFor} from './layouts';
import type {Scene, ScenePlan, Segment} from './schema';

export type FlatSegment = {
  scene: Scene;
  seg: Segment;
  startF: number;
  endF: number;
};

/** Flattens scenes into one ordered list of layout segments, in frames. */
export const flatten = (plan: ScenePlan, fps: number): FlatSegment[] =>
  plan.scenes
    .flatMap((scene) =>
      scene.segments.map((seg) => ({
        scene,
        seg,
        startF: Math.round(seg.start * fps),
        endF: Math.round(seg.end * fps),
      })),
    )
    .sort((a, b) => a.startF - b.startF);

export const locate = (flat: FlatSegment[], frame: number) => {
  let c = 0;
  for (let i = 0; i < flat.length; i++) if (frame >= flat[i].startF) c = i;
  return c;
};

const ease = Easing.bezier(0.16, 1, 0.3, 1);

/** 0..1 progress of the layout change into the current segment. */
export const transitionProgress = (frame: number, startF: number) =>
  interpolate(frame - startF, [0, TRANSITION_FRAMES], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease,
  });

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Layout A slowly pushes in so the full-bleed hook never sits static. */
const DRIFT = 0.05;

export const avatarStateAt = (fs: FlatSegment, frame: number): AvatarState => {
  const s = stateFor(fs.seg.layout, fs.seg.avatar);
  if (fs.seg.layout !== 'A') return s;
  const f = Math.min(Math.max(frame, fs.startF), fs.endF);
  const prog = (f - fs.startF) / Math.max(1, fs.endF - fs.startF);
  return {...s, zoom: s.zoom + DRIFT * prog};
};

export const avatarStateBlend = (flat: FlatSegment[], frame: number): AvatarState => {
  const c = locate(flat, frame);
  const cur = avatarStateAt(flat[c], frame);
  if (c === 0) return cur;
  const prev = avatarStateAt(flat[c - 1], flat[c - 1].endF);
  const p = transitionProgress(frame, flat[c].startF);
  return {
    x: lerp(prev.x, cur.x, p),
    y: lerp(prev.y, cur.y, p),
    w: lerp(prev.w, cur.w, p),
    h: lerp(prev.h, cur.h, p),
    r: lerp(prev.r, cur.r, p),
    zoom: lerp(prev.zoom, cur.zoom, p),
    focusY: lerp(prev.focusY, cur.focusY, p),
    opacity: lerp(prev.opacity, cur.opacity, p),
    frame: lerp(prev.frame, cur.frame, p),
  };
};

export type LayoutBlend = {layout: LayoutKey; cur: FlatSegment; prev?: FlatSegment; p: number; index: number};
export const layoutBlend = (flat: FlatSegment[], frame: number): LayoutBlend => {
  const c = locate(flat, frame);
  return {
    layout: flat[c].seg.layout,
    cur: flat[c],
    prev: c > 0 ? flat[c - 1] : undefined,
    p: transitionProgress(frame, flat[c].startF),
    index: c,
  };
};
