import React, {CSSProperties, createContext, useContext, useEffect, useState} from 'react';
import {Easing, continueRender, delayRender, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import type {Fx, FxType, Target} from './schema';

/** Default lengths (seconds) when an effect has no `until`. */
const LEN: Record<FxType, number> = {
  'digital-zoom': 3,
  'zoom-through': 1,
  blackout: 0.6,
  'type-wall': 4,
  'headline-wall': 4,
  'couch-wall': 4,
  'knockout-tiles': 5,
  spotlight: 4,
  orbit: 4,
  clone: 4,
  'frame-break': 4,
  'ui-world': 5,
  'green-screen': 5,
  'freeze-sticker': 3.2,
  'the-stack': 4,
  'sticky-text': 3,
  'freeze-label': 3.5,
  'phone-mockup': 4,
  checklist: 5,
  'pointer-callout': 4.5,
  odometer: 3.6,
  'before-after': 3,
  'chart-grow': 4,
  'comment-bubble': 5,
  'timeline-burn': 5,
  'pull-back-reveal': 5,
};

/** effects that draw behind her (they need the person matte) */
export const BEHIND: FxType[] = ['type-wall', 'headline-wall', 'couch-wall', 'knockout-tiles', 'spotlight', 'orbit', 'clone', 'frame-break', 'ui-world', 'green-screen'];
export const NEEDS_MATTE: FxType[] = [...BEHIND, 'freeze-sticker'];

export const fxRange = (f: Fx): [number, number] => {
  if (f.type === 'zoom-through') return [Math.max(0, f.at - f.props.diveSec), f.at + 0.6];
  return [f.at, f.until ?? f.at + LEN[f.type]];
};

// ---------- tween helpers
export const easeOutC = Easing.bezier(0.16, 1, 0.3, 1);
export const easeInC = Easing.in(Easing.cubic);
export const pop = Easing.out(Easing.back(1.7));
export const clampOpts = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const tw = (v: number, a: number, b: number, from = 0, to = 1, easing: (n: number) => number = easeOutC) =>
  interpolate(v, [a, b], [from, to], {...clampOpts, easing});

// ---------- time inside an effect's Sequence
export const useFxTime = (at: number) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return {frame, fps, t: frame / fps, abs: at + frame / fps};
};

// ---------- the per-frame matte anchors (head top, head center x, chest y, left, right), normalized 0..1
export type Anchors = {fps: number; frames: number; anchors: number[][]};
const cache = new Map<string, Anchors>();
type Env = {slug?: string; anchors?: Anchors; video: string; videoStyle: CSSProperties};
const AnchorCtx = createContext<Env>({video: '', videoStyle: {}});
export const FxEnvProvider: React.FC<Env & {children: React.ReactNode}> = ({slug, anchors, video, videoStyle, children}) => (
  <AnchorCtx.Provider value={{slug, anchors, video, videoStyle}}>{children}</AnchorCtx.Provider>
);
export const useFxEnv = () => useContext(AnchorCtx);

/** Loads matte/<slug>.anchors.json once (holds the render until it arrives). */
export const useLoadedAnchors = (slug?: string): Anchors | undefined => {
  const [data, setData] = useState<Anchors | undefined>(slug ? cache.get(slug) : undefined);
  const [handle] = useState(() => (slug && !cache.get(slug) ? delayRender('Loading matte anchors') : null));
  useEffect(() => {
    if (!slug || cache.get(slug)) {
      if (handle !== null) continueRender(handle);
      return;
    }
    fetch(staticFile(`matte/${slug}.anchors.json`))
      .then((r) => r.json())
      .then((j: Anchors) => {
        cache.set(slug, j);
        setData(j);
        if (handle !== null) continueRender(handle);
      })
      .catch((e) => {
        console.error('matte anchors missing', e);
        if (handle !== null) continueRender(handle);
      });
  }, [slug, handle]);
  return data;
};

/** Pixel point (in the 1080x1920 frame) on her for a target name at an absolute frame. */
export const anchorPx = (a: Anchors | undefined, absFrame: number, tg: Target): {x: number; y: number} => {
  const row = a ? a.anchors[Math.max(0, Math.min(a.anchors.length - 1, absFrame))] : undefined;
  const [top, cx, , left, right] = row ?? [0.08, 0.5, 0.42, 0.1, 0.9];
  const W = 1080;
  const H = 1920;
  // her framing is a close medium shot: head top near 6 to 10 percent, chest about half a frame below it
  switch (tg) {
    case 'head':
      return {x: cx * W, y: (top + 0.09) * H};
    case 'cap':
      return {x: cx * W, y: (top + 0.015) * H};
    case 'chest':
      return {x: cx * W, y: (top + 0.52) * H};
    case 'left':
      return {x: (left + 0.08) * W, y: (top + 0.5) * H};
    case 'right':
      return {x: (right - 0.08) * W, y: (top + 0.5) * H};
    case 'hands':
      return {x: cx * W, y: (top + 0.7) * H};
  }
};

// ---------- sound cues
export type Cue = {at: number; name: string; vol?: number};

/** Default sounds per effect. `sfx: 'none'` on the event silences it; any other name replaces the main cue. */
export const cuesFor = (f: Fx): Cue[] => {
  if (f.sfx === 'none') return [];
  const main = (name: string, at = f.at, vol?: number): Cue => ({name: f.sfx && f.sfx !== 'auto' ? f.sfx : name, at, vol});
  switch (f.type) {
    case 'digital-zoom':
      return f.props.snapAt !== undefined ? [main('snap', f.props.snapAt, 0.9)] : [];
    case 'zoom-through':
      return [main('whoosh', f.at - f.props.diveSec * 0.9, 1)];
    case 'blackout':
      return [main('thud', f.at, 0.8), {name: 'snap', at: f.at + f.props.holdSec, vol: 0.7}];
    case 'type-wall':
      return [main('swish', f.props.words[0].at, 0.6), ...f.props.words.slice(1).map((w) => ({name: 'pop', at: w.at, vol: 0.45}))];
    case 'headline-wall':
    case 'couch-wall':
      return [main('swish')];
    case 'knockout-tiles':
      return f.props.names.map((n) => ({name: 'thud', at: n.knockAt, vol: 0.7}));
    case 'spotlight':
      return [main('boom', f.at, 0.8)];
    case 'orbit':
    case 'phone-mockup':
    case 'green-screen':
      return [main('whoosh')];
    case 'clone':
      return f.props.copies.map((c) => ({name: 'pop', at: c.at, vol: 0.8}));
    case 'frame-break':
      return [main('whoosh'), {name: 'pop', at: f.props.popAt, vol: 0.9}];
    case 'ui-world':
      return [main('blip', f.at, 0.8)];
    case 'freeze-sticker':
      return [main('shutter')];
    case 'freeze-label':
      return [main('shutter'), ...f.props.labels.map((l) => ({name: 'pop', at: l.at, vol: 0.5}))];
    case 'the-stack':
      return f.props.rows.map((_, i) => ({name: 'tick', at: f.at + 0.15 + i * 0.22, vol: 0.7}));
    case 'sticky-text':
      return [main('pop')];
    case 'checklist':
      return f.props.items.map((it) => ({name: 'tick', at: it.at + 0.35, vol: 0.8}));
    case 'pointer-callout':
      return f.props.cards.map((c) => ({name: 'pop', at: c.at, vol: 0.6}));
    case 'odometer':
      return [main('riser', f.at, 0.55)];
    case 'before-after':
      return [main('swish', f.at + 0.15, 0.8)];
    case 'chart-grow':
      return [main('riser', f.at + 0.2, 0.5)];
    case 'comment-bubble':
      return [{name: 'type', at: f.props.postAt - 0.55, vol: 0.5}, {name: 'ding', at: f.props.postAt, vol: 0.7}, {name: 'pop', at: f.props.replyAt, vol: 0.7}];
    case 'timeline-burn':
      return [main('riser', f.props.burnAt - 1.2, 0.5), {name: 'crackle', at: f.props.burnAt, vol: 0.55}];
    case 'pull-back-reveal':
      return [main('whoosh'), ...f.props.cuts.map((c) => ({name: 'snap', at: c, vol: 0.6}))];
  }
};
