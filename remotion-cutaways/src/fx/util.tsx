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
  'pull-back': 1.6,
  'flash-frame': 0.2,
  'freeze-hold': 1.6,
  grade: 6,
  glow: 6,
  dust: 6,
  letterbox: 6,
  'voice-memo': 5,
  'polaroid-drop': 3.4,
  'notes-page': 5,
  'email-compose': 5,
  'lock-screen': 3.4,
  'date-stamp': 3,
  'paper-cut': 4,
  'doodle-boil': 4,
  vertigo: 3,
  'cover-story': 4,
  'glass-type': 4,
  'prompt-bar': 3.6,
  'comment-drop': 5,
  'comment-cta': 5,
  'file-drop': 3.6,
  'icon-strike': 3.6,
  'jiggle-delete': 4.8,
  'storyboard-deck': 4,
  'gravity-drop': 3.4,
  'grade-slider': 4,
  'eyedropper-grade': 4,
};

/** effects that draw behind her (they need the person matte) */
export const BEHIND: FxType[] = ['type-wall', 'headline-wall', 'couch-wall', 'knockout-tiles', 'spotlight', 'orbit', 'clone', 'frame-break', 'ui-world', 'green-screen', 'paper-cut', 'vertigo', 'cover-story'];
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
type Env = {slug?: string; anchors?: Anchors; video: string; videoStyle: CSSProperties; outline?: 'none' | 'white' | 'copper' | 'gold'; /** seconds she is speaking, from the word timings (drives the voice-memo waveform) */ speech?: [number, number][]};
const AnchorCtx = createContext<Env>({video: '', videoStyle: {}});
export const FxEnvProvider: React.FC<Env & {children: React.ReactNode}> = ({children, ...env}) => <AnchorCtx.Provider value={env}>{children}</AnchorCtx.Provider>;
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
/** tier 1 = the main entrance sound of an effect (the default "minimal" mode plays only these); tier 2 = detail sounds (ticks, pops, per-item cues). */
export type Cue = {at: number; name: string; vol?: number; tier: 1 | 2; /** the effect type that makes this cue (shown by the sound labels) */ from?: string};

/** Default sounds per effect. `sfx: 'none'` on the event silences it; any other name replaces its main cue. */
export const cuesFor = (f: Fx): Cue[] => rawCues(f).map((c) => ({...c, from: f.type}));
const rawCues = (f: Fx): Cue[] => {
  if (f.sfx === 'none') return [];
  const main = (name: string, at = f.at, vol = 1, tier: 1 | 2 = 1): Cue => ({name: f.sfx && f.sfx !== 'auto' ? f.sfx : name, at, vol, tier});
  const d = (name: string, at: number, vol = 1): Cue => ({name, at, vol, tier: 2});
  switch (f.type) {
    case 'digital-zoom':
      return f.props.snapAt !== undefined ? [main('snap', f.props.snapAt, 0.8)] : [];
    case 'zoom-through':
      return [main('whoosh', f.at - f.props.diveSec * 0.9, 0.9)];
    case 'blackout':
      return [main('thud', f.at, 0.8), d('snap', f.at + f.props.holdSec, 0.6)];
    case 'type-wall':
      return [main('swish', f.props.words[0].at, 0.6, 2), ...f.props.words.slice(1).map((w) => d('pop', w.at, 0.5))];
    case 'headline-wall':
    case 'couch-wall':
      return [main('swish', f.at, 0.6, 2)];
    case 'knockout-tiles':
      return f.props.names.filter((n) => n.knockAt < (f.until ?? f.at + 6)).map((n) => d('thud', n.knockAt, 0.6));
    case 'spotlight':
      return [main('boom', f.at, 0.7)];
    case 'orbit':
    case 'phone-mockup':
      return [main('whoosh', f.at, 0.7, 2)];
    case 'green-screen':
      return [main('whoosh', f.at, 0.8)];
    case 'clone':
      return f.props.copies.map((c) => d('pop', c.at, 0.7));
    case 'frame-break':
      return [main('whoosh', f.at, 0.8), d('pop', f.props.popAt, 0.8)];
    case 'ui-world':
      return [main('blip', f.at, 0.7, 2)];
    case 'freeze-sticker':
      return [main('shutter', f.at, 0.8)];
    case 'freeze-label':
      return [main('shutter', f.at, 0.8), ...f.props.labels.map((l) => d('pop', l.at, 0.5))];
    case 'the-stack':
      return f.props.rows.map((r, i) => d('tick', r.at ?? f.at + 0.15 + i * 0.22, 0.6));
    case 'sticky-text':
      return [main('pop', f.at, 0.7, 2)];
    case 'checklist':
      return f.props.items.map((it) => d('tick', it.at + 0.35, 0.7));
    case 'pointer-callout':
      return f.props.cards.map((c) => d('pop', c.at, 0.5));
    case 'odometer':
      return [main('riser', f.at, 0.4, 2)];
    case 'before-after':
      return [main('swish', f.at + 0.15, 0.6, 2)];
    case 'chart-grow':
      return [main('riser', f.at + 0.2, 0.4, 2)];
    case 'comment-bubble':
      return [d('type', f.props.postAt - 0.55, 0.5), main('ding', f.props.postAt, 0.6), d('pop', f.props.replyAt, 0.6)];
    case 'timeline-burn':
      return [d('riser', f.props.burnAt - 1.2, 0.4), main('crackle', f.props.burnAt, 0.5)];
    case 'pull-back-reveal':
      return [main('whoosh', f.at, 0.8), ...f.props.cuts.map((c) => d('snap', c, 0.5))];
    case 'pull-back':
      return [main('whoosh', f.at, 0.5, 2)];
    case 'flash-frame':
      return [main('shutter', f.at, 0.7, 2)];
    case 'freeze-hold':
      return [main('shutter', f.at, 0.7, 2)];
    case 'voice-memo':
      return [main('blip', f.at, 0.6, 2)];
    case 'polaroid-drop':
      return [main('pop', f.at + 0.45, 0.8, 2)];
    case 'notes-page':
      return f.props.lines.map((l) => d('type', l.at, 0.4));
    case 'email-compose':
      return [d('type', f.props.typeAt ?? f.at + 0.6, 0.4), d('whoosh', f.props.sendAt ?? f.at + 3.6, 0.5)];
    case 'lock-screen':
      return [main('ding', f.at + 0.2, 0.5, 2)];
    case 'date-stamp':
      return [d('tick', f.at, 0.5)];
    case 'paper-cut':
      return [main('swish', f.at, 0.6, 2)];
    case 'doodle-boil':
      return f.props.marks.map((m) => d('pop', m.at, 0.5));
    case 'vertigo':
      return [main('whoosh', f.at, 0.7)];
    case 'cover-story':
      return [main('shutter', f.at, 0.7)];
    case 'glass-type':
      return f.props.words.map((w, i) => (i === 0 ? main('blip', w.at, 0.5, 2) : d('pop', w.at, 0.4)));
    case 'prompt-bar': {
      const typeAt = f.props.typeAt ?? f.at + 0.4;
      const sendAt = f.props.sendAt ?? typeAt + Math.max(0.9, f.props.text.length * 0.042) + 0.4;
      return [d('type', typeAt, 0.4), main('ding', sendAt, 0.5)];
    }
    case 'comment-drop':
    case 'comment-cta': {
      const cues = [d('type', f.props.postAt - Math.max(0.7, f.props.keyword.length * 0.14), 0.45), main('ding', f.props.postAt, 0.6)];
      if (f.props.replyAt !== undefined && f.props.reply) cues.push(d('pop', f.props.replyAt, 0.6));
      return cues;
    }
    case 'file-drop':
      return [main('thud', (f.props.dropAt ?? f.at + 0.5) + 0.4, 0.6)];
    case 'icon-strike': {
      const sa = f.props.strikeAt ?? f.at + 0.9;
      return [main('snap', sa, 0.7), d('pop', sa + 0.4, 0.6)];
    }
    case 'jiggle-delete': {
      const da = f.props.deleteAt ?? f.at + 1.8;
      return [main('swish', f.at, 0.5, 2), ...f.props.icons.filter((i) => !i.keep).map((_, k) => d('pop', da + k * 0.2, 0.5))];
    }
    case 'storyboard-deck':
      return [main('swish', f.at, 0.6), d('pop', f.at + 0.35, 0.4), d('pop', f.at + 0.55, 0.4)];
    case 'gravity-drop':
      return [main('thud', (f.props.dropAt ?? f.at + 0.2) + 0.55, 0.7)];
    case 'grade-slider':
      return [main('riser', f.props.moveAt ?? f.at + 0.6, 0.35, 2)];
    case 'eyedropper-grade':
      return [main('pop', f.props.pickAt ?? f.at + 1.1, 0.7)];
    default:
      return [];
  }
};
