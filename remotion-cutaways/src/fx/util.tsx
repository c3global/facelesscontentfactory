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
  'kinetic-hook': 3,
  'giant-caption': 2.6,
  'playing-grid': 3.6,
  'video-card': 3.8,
  'reel-feed': 3.4,
  'card-orbit': 5,
  'name-tag': 3.6,
  'planner-grid': 5.4,
  'dropdown-select': 4.2,
  'effort-dial': 4,
  'specimen-card': 3.6,
  'pencil-strike': 4,
  'stamp': 2.6,
  'waitlist-card': 4.4,
  'envelope-open': 4.6,
  'testimonial-stack': 5,
  'render-progress': 4.4,
  'feedback-note': 4.2,
  'leaderboard': 4.6,
  'countdown-timer': 3.8,
  'terminal-type': 4.6,
  'toggle-switch': 3.4,
  'generating-tiles': 4.4,
  'follow-card': 3.4,
  'defocus': 1.2,
  'reel-stack': 3.6,
  'receipt-ticket': 4.4,
  'frame-calendar': 3.6,
  'cover-frame': 3.6,
  'keycap-drop': 3.2,
  'film-strip': 4.4,
  'phone-frame': 3.6,
  'clip-type': 2.4,
  'storyboard-wall': 3.6,
  'step-chips': 6,
  'pen-circle': 3.2,
  'caption-stack': 3.4,
  'live-cursor': 2.4,
  'clone-row': 3,
  'day-dial': 3,
  'predict-keys': 3,
  'letter-orbit': 3.5,
  'code-body': 2.5,
  'post-wall': 3,
  'letter-dive': 2.4,
  'comment-post': 4,
  'layer-explode': 2.8,
  'sketch-words': 3,
  'blade-slice': 1,
  'head-stack': 3,
  'rack-focus': 2.2,
  'banknote': 3,
  'voice-note': 3.2,
  'impact-frame': 1.6,
  'dolly-zoom': 3,
  'press-front': 3,
  'paper-tear': 1.8,
  'blow-away': 3,
  'depth-scatter': 3,
  'spatial-glass': 2.8,
  'shatter-3d': 2.4,
  'scene-text': 2.8,
  'text-pop': 2.4,
  'proof-card': 3.4,
  'focus-list': 4,
  'compare': 3.4,
  'trend-graph': 3.4,
  'freebie-doc': 3.4,
  'note-arrow': 2.6,
  'script-panel': 7,
  'card-carousel': 4.4,
  'card-flip': 4,
  'shoulder-steps': 4.5,
  iris: 2.6,
  'match-cut': 3,
  'demo-cursor': 3.6,
  'glass-cards': 4,
  'pixel-monitor': 2.4,
  'slot-machine': 3.6,
  'holo-phone': 4,
  'silhouette-shift': 3.4,
  'image-collage': 3.6,
  'cover-fan': 3.4,
  'framed-clip': 4,
  'side-by-side': 4,
  'vote-pill': 3.2,
  duotone: 2.6,
  'big-stat': 3.2,
  'thank-you': 3.4,
  'page-turn': 0.9,
  'wall-text': 3.6,
};

/** effects that draw behind her (they need the person matte) */
export const BEHIND: FxType[] = ['type-wall', 'headline-wall', 'couch-wall', 'knockout-tiles', 'spotlight', 'orbit', 'clone', 'frame-break', 'ui-world', 'green-screen', 'paper-cut', 'vertigo', 'cover-story', 'script-panel', 'clone-row', 'day-dial', 'letter-orbit', 'code-body', 'post-wall', 'sketch-words', 'dolly-zoom', 'blow-away', 'depth-scatter', 'scene-text', 'silhouette-shift', 'wall-text'];
export const NEEDS_MATTE: FxType[] = [...BEHIND, 'freeze-sticker'];

export const fxRange = (f: Fx): [number, number] => {
  if (f.type === 'zoom-through') return [Math.max(0, f.at - f.props.diveSec), f.at + 0.6];
  if (f.type === 'flash-frame' && f.props.version === 2) return [f.at, f.until ?? f.at + 0.6];
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
    case 'kinetic-hook':
      return [main('whoosh', f.at, 0.6), ...f.props.lines.slice(1).map((l, i) => d('pop', l.at ?? f.at + 0.6 * (i + 1), 0.45))];
    case 'giant-caption':
      return [main('thud', f.at + 0.05, 0.6)];
    case 'playing-grid':
      return [main('swish', f.at, 0.5, 2)];
    case 'video-card':
      return [main('pop', f.at + 0.1, 0.6)];
    case 'reel-feed':
      return [main('whoosh', f.at, 0.7)];
    case 'card-orbit':
      return [main('whoosh', f.at, 0.6)];
    case 'name-tag':
    case 'specimen-card':
    case 'follow-card':
    case 'toggle-switch':
      return [main('pop', f.at + 0.1, 0.6)];
    case 'planner-grid':
    case 'generating-tiles':
    case 'leaderboard':
    case 'testimonial-stack':
    case 'reel-stack':
      return [main('swish', f.at, 0.5, 2)];
    case 'dropdown-select':
    case 'waitlist-card':
    case 'pencil-strike':
      return [main('tick', f.at + 0.2, 0.5)];
    case 'stamp':
      return [main('thud', f.at + 0.25, 0.9)];
    case 'effort-dial':
    case 'countdown-timer':
    case 'render-progress':
      return [main('riser', f.at + 0.3, 0.35, 2)];
    case 'envelope-open':
      return [main('whoosh', f.at, 0.5, 2), d('pop', f.props.openAt ?? f.at + 1.4, 0.6)];
    case 'feedback-note':
    case 'terminal-type':
      return [d('type', f.at + 0.5, 0.4)];
    case 'defocus':
      return [main('whoosh', f.at, 0.5, 2)];
    case 'card-flip':
      return [main('swish', f.at, 0.5), d('pop', f.at + f.props.flipAt + 0.4, 0.5)];
    case 'card-carousel':
      return [main('whoosh', f.at, 0.6)];
    case 'script-panel':
      return [main('whoosh', f.at, 0.5, 2), d('pop', f.props.steps[0]?.at ?? f.at + 1, 0.45)];
    case 'receipt-ticket':
      return [main('swish', f.at + 0.1, 0.5), d('type', f.at + 0.8, 0.4), d('thud', f.at + 2.4, 0.7)];
    case 'frame-calendar':
    case 'film-strip':
      return [main('swish', f.at, 0.5, 2)];
    case 'cover-frame':
    case 'phone-frame':
    case 'clip-type':
      return [main('whoosh', f.at, 0.5, 2)];
    case 'keycap-drop':
      return [main('tick', f.at + 0.4, 0.6), d('tick', f.at + 0.7, 0.4), d('tick', f.at + 1.0, 0.4)];
    case 'storyboard-wall':
    case 'live-cursor':
      return [main('blip', f.at + 0.15, 0.6)];
    case 'clone-row':
      return [main('whoosh', f.at, 0.6)];
    case 'day-dial':
      return [main('swish', f.at, 0.6), d('tick', f.at + 0.8, 0.5), d('tick', f.at + 1.4, 0.5)];
    case 'predict-keys':
      return [main('type', f.at + 0.4, 0.5)];
    case 'letter-orbit':
      return [main('swish', f.at, 0.5)];
    case 'code-body':
      return [main('glitch', f.at, 0.6)];
    case 'post-wall':
      return [main('riser', f.at, 0.4)];
    case 'letter-dive':
      return [main('whoosh', fxRange(f)[1] - 0.9, 0.8)];
    case 'comment-post':
      return [main('type', f.at + 0.35, 0.5), d('pop', f.props.postAt, 0.6), d('pop', f.props.replyAt, 0.5)];
    case 'layer-explode':
      return [main('whoosh', f.at + 0.15, 0.7)];
    case 'sketch-words':
      return [main('swish', f.at + 0.5, 0.5)];
    case 'blade-slice':
      return [main('swish', f.at + 0.1, 0.9)];
    case 'head-stack':
      return f.props.labels.map((_, i) => (i === 0 ? main('thud', f.at + 0.5, 0.5) : d('tick', f.at + 0.5 + i * f.props.gap, 0.5)));
    case 'rack-focus':
      return [];
    case 'banknote':
      return [main('riser', f.at, 0.4), d('ding', fxRange(f)[1] - 0.6, 0.5)];
    case 'voice-note':
      return [main('blip', f.at, 0.6), d('swish', fxRange(f)[1] - 0.9, 0.5)];
    case 'impact-frame':
      return [main('boom', f.at + 0.05, 0.8)];
    case 'dolly-zoom':
      return [main('riser', f.at, 0.4)];
    case 'press-front':
      return [main('shutter', f.at, 0.6)];
    case 'paper-tear':
      return [main('swish', fxRange(f)[0] + (fxRange(f)[1] - fxRange(f)[0]) * 0.35, 0.8)];
    case 'blow-away':
      return [main('whoosh', f.at + 0.5, 0.7)];
    case 'depth-scatter':
      return [main('swish', f.at + 0.1, 0.4)];
    case 'spatial-glass':
      return [main('blip', f.at, 0.5)];
    case 'shatter-3d':
      return [main('glitch', f.at + 0.15, 0.7)];
    case 'scene-text':
      return [];
    case 'proof-card':
      return [main('riser', f.at + 0.3, 0.4), d('ding', f.at + 1.5, 0.5)];
    case 'focus-list':
      return [main('pop', f.at + 0.1, 0.5), ...f.props.items.flatMap((it) => (typeof it === 'string' ? [] : [d('tick', it.at, 0.6)]))];
    case 'compare':
      return [main('swish', f.at + 0.1, 0.4), d('ding', f.at + 1.4, 0.5)];
    case 'trend-graph':
      return [main('riser', f.at + 0.4, 0.4)];
    case 'freebie-doc':
      return [main('swish', f.at, 0.4), d('type', f.at + 1.4, 0.5)];
    case 'note-arrow':
      return [main('swish', f.at + 0.7, 0.35)];
    case 'side-by-side':
      return [main('swish', f.at + 0.1, 0.5), ...(f.props.winner ? [d('ding', f.props.pickAt ?? f.at + 1.6, 0.5)] : [])];
    case 'vote-pill':
      return [main('pop', f.at + 0.1, 0.5), ...(f.props.pick ? [d('blip', f.props.pickAt ?? f.at + 1.3, 0.6)] : [])];
    case 'duotone':
      return [main('shutter', f.at, 0.5, 2)];
    case 'big-stat':
      return [main('riser', f.at + 0.2, 0.4), d('thud', f.at + 1.4, 0.6)];
    case 'thank-you':
      return [main('swish', f.at + 0.35, 0.4)];
    case 'wall-text':
      return [main('whoosh', f.at, 0.5)];
    case 'image-collage':
      return [main('swish', f.at + 0.2, 0.5)];
    case 'cover-fan':
      return [main('swish', f.at + 0.25, 0.6)];
    case 'framed-clip':
      return [main('pop', f.at + 0.1, 0.5)];
    case 'shoulder-steps':
      return [main('whoosh', f.at, 0.6), ...f.props.steps.map((s) => d('pop', s.at, 0.5))];
    case 'iris':
      return [main('swish', f.at, 0.6)];
    case 'match-cut':
      return f.props.cuts.map((c, i) => (i === 0 ? main('snap', c.at, 0.7) : d('snap', c.at, 0.7)));
    case 'demo-cursor':
      return [main('swish', f.at, 0.4), d('blip', f.props.clickAt ?? f.at + 1.9, 0.7)];
    case 'glass-cards':
      return f.props.cards.map((c, i) => (i === 0 ? main('pop', c.at, 0.5) : d('pop', c.at, 0.45)));
    case 'pixel-monitor':
      return [main('glitch', f.at, 0.5)];
    case 'slot-machine':
      return [main('riser', f.at + 0.1, 0.4), ...f.props.words.map((_, i) => d('thud', f.props.stopAt?.[i] ?? f.at + 1.1 + i * 0.5, 0.6)), d('ding', (f.props.stopAt?.[f.props.words.length - 1] ?? f.at + 1.1 + (f.props.words.length - 1) * 0.5) + 0.1, 0.6)];
    case 'holo-phone':
      return [main('blip', f.at + 0.1, 0.6)];
    case 'silhouette-shift':
      return [main('boom', f.at, 0.5), d('shutter', f.props.revealAt ?? fxRange(f)[1] - 1.1, 0.6)];
    case 'text-pop':
      return f.props.look === 'glitch' ? [main('glitch', f.at + 0.05, 0.5)] : f.props.look === 'badge' ? [main('pop', f.at + 0.1, 0.6)] : [main('swish', f.at + 0.05, 0.4)];
    case 'caption-stack':
      return [main('pop', f.at + 0.15, 0.5)];
    case 'step-chips':
      return f.props.steps.map((s, i) => (i === 0 ? main('pop', s.at, 0.5) : d('pop', s.at, 0.45)));
    case 'pen-circle':
      return [main('swish', f.at + 0.2, 0.5)];
    default:
      return [];
  }
};

/** head stack headroom: 0..1, the video eases down and shrinks so big blocks fit above her head, then eases back after they fall */
export const HEADROOM = {shift: 330, shrink: 0.16};
export const headRoomK = (f: Fx, t: number) => {
  // wall-text uses the same headroom, so the words have wall to sit on above her head
  if (f.type !== 'head-stack' && f.type !== 'wall-text') return 0;
  const [a, b] = fxRange(f);
  return tw(t, a - 0.1, a + 0.45, 0, 1, easeInOutQ) * (1 - tw(t, b - 0.15, b + 0.45, 0, 1, easeInOutQ));
};
const easeInOutQ = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
