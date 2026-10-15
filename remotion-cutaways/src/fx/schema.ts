import {z} from 'zod';

const sec = z.number().min(0);
/** where on her an effect points: from the person matte's per-frame anchors */
export const target = z.enum(['head', 'cap', 'chest', 'left', 'right', 'hands']);

const base = {
  /** absolute second the effect starts */
  at: sec,
  /** absolute second it ends. Every effect has a sensible default length. */
  until: sec.optional(),
  /** 'none' silences this effect; any name from public/sfx (without `fx-` and `.wav`) replaces the default sound */
  sfx: z.string().optional(),
};

/**
 * Effects layered on her talking-head clip. Times are absolute video seconds, like graphics.
 * Behind-her effects (type-wall, headline-wall, couch-wall, knockout-tiles, spotlight, orbit, clone, ui-world,
 * green-screen, frame-break, freeze-sticker) need the person matte: `npm run matte -- <slug>` first.
 */
export const fxSchema = z.discriminatedUnion('type', [
  // ---- camera moves on her clip
  z.object({...base, type: z.literal('digital-zoom'), props: z.object({creepTo: z.number().default(1.14), snapAt: sec.optional(), snapTo: z.number().default(1.38)}).prefault({})}),
  z.object({...base, type: z.literal('zoom-through'), props: z.object({diveSec: z.number().default(0.5), nextZoom: z.number().default(1.3), nextFocusY: z.number().default(34)}).prefault({})}),
  z.object({...base, type: z.literal('blackout'), props: z.object({holdSec: z.number().default(0.4)}).prefault({})}),
  // ---- behind her (matte)
  z.object({...base, type: z.literal('type-wall'), props: z.object({words: z.array(z.object({text: z.string(), at: sec})).min(1)})}),
  z.object({...base, type: z.literal('headline-wall'), props: z.object({lines: z.array(z.string()).min(3)})}),
  z.object({...base, type: z.literal('couch-wall'), props: z.object({tiles: z.array(z.string()).min(4), label: z.string().optional()})}),
  z.object({...base, type: z.literal('knockout-tiles'), props: z.object({names: z.array(z.object({text: z.string(), knockAt: sec})).min(3)})}),
  z.object({...base, type: z.literal('spotlight'), props: z.object({dim: z.number().default(0.86), words: z.array(z.object({text: z.string(), at: sec})).default([])}).prefault({})}),
  z.object({...base, type: z.literal('orbit'), props: z.object({items: z.array(z.string()).min(3).max(8), radius: z.number().default(430)})}),
  z.object({...base, type: z.literal('clone'), props: z.object({copies: z.array(z.object({at: sec, side: z.enum(['left', 'right']), scale: z.number().default(0.52), y: z.number().default(0.34)})).min(1).max(4)})}),
  z.object({...base, type: z.literal('frame-break'), props: z.object({popAt: sec, label: z.string().optional()})}),
  z.object({...base, type: z.literal('ui-world'), props: z.object({title: z.string().default('C3 Studio'), prompt: z.string(), chips: z.array(z.string()).default([])})}),
  z.object({...base, type: z.literal('green-screen'), props: z.object({plate: z.enum(['crimson', 'screenshot', 'text']).default('crimson'), src: z.string().optional(), text: z.string().optional()})}),
  z.object({...base, type: z.literal('freeze-sticker'), props: z.object({notes: z.array(z.string()).max(3).default([]), angle: z.number().default(-5)}).prefault({})}),
  // ---- over her
  z.object({...base, type: z.literal('the-stack'), props: z.object({rows: z.array(z.object({label: z.string(), value: z.number().min(0).max(100), display: z.string()})).min(2).max(4)})}),
  z.object({...base, type: z.literal('sticky-text'), props: z.object({text: z.string(), anchor: target.default('cap')})}),
  z.object({...base, type: z.literal('freeze-label'), props: z.object({labels: z.array(z.object({text: z.string(), target, at: sec})).min(1).max(4)})}),
  z.object({...base, type: z.literal('phone-mockup'), props: z.object({side: z.enum(['left', 'right']).default('right'), title: z.string().default('Reel'), lines: z.array(z.string()).default([])}).prefault({})}),
  z.object({...base, type: z.literal('checklist'), props: z.object({title: z.string().optional(), items: z.array(z.object({text: z.string(), at: sec})).min(2).max(5)})}),
  z.object({...base, type: z.literal('pointer-callout'), props: z.object({cards: z.array(z.object({text: z.string(), at: sec, target})).min(1).max(4)})}),
  z.object({...base, type: z.literal('odometer'), props: z.object({from: z.number().default(0), to: z.number(), prefix: z.string().default(''), suffix: z.string().default(''), label: z.string().optional()})}),
  z.object({...base, type: z.literal('before-after'), props: z.object({sweepSec: z.number().default(1.3), beforeLabel: z.string().default('Raw'), afterLabel: z.string().default('Edited')}).prefault({})}),
  z.object({...base, type: z.literal('chart-grow'), props: z.object({points: z.array(z.number()).min(3).max(10), label: z.string().optional(), endLabel: z.string().optional()})}),
  z.object({...base, type: z.literal('comment-bubble'), props: z.object({comment: z.string(), postAt: sec, replyAt: sec, reply: z.string(), linkLabel: z.string().default('Open link')})}),
  z.object({...base, type: z.literal('timeline-burn'), props: z.object({burnAt: sec, clips: z.number().int().min(3).max(8).default(6)})}),
  z.object({...base, type: z.literal('pull-back-reveal'), props: z.object({appTitle: z.string().default('C3 Studio'), cuts: z.array(sec).default([])}).prefault({})}),
]);

export type Fx = z.infer<typeof fxSchema>;
export type FxType = Fx['type'];
export type Target = z.infer<typeof target>;
