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
  z.object({...base, type: z.literal('the-stack'), props: z.object({rows: z.array(z.object({label: z.string(), value: z.number().min(0).max(100), display: z.string(), /** absolute second this row appears (defaults to a quick stagger) */ at: sec.optional()})).min(2).max(4)})}),
  z.object({...base, type: z.literal('sticky-text'), props: z.object({text: z.string(), anchor: target.default('cap')})}),
  z.object({...base, type: z.literal('freeze-label'), props: z.object({labels: z.array(z.object({text: z.string(), target, at: sec})).min(1).max(4)})}),
  z.object({...base, type: z.literal('phone-mockup'), props: z.object({side: z.enum(['left', 'right']).default('right'), title: z.string().default('Reel'), lines: z.array(z.string()).default([])}).prefault({})}),
  z.object({...base, type: z.literal('checklist'), props: z.object({title: z.string().optional(), items: z.array(z.object({text: z.string(), at: sec})).min(2).max(5)})}),
  z.object({...base, type: z.literal('pointer-callout'), props: z.object({cards: z.array(z.object({text: z.string(), at: sec, target})).min(1).max(4)})}),
  z.object({...base, type: z.literal('odometer'), props: z.object({from: z.number().default(0), to: z.number(), prefix: z.string().default(''), suffix: z.string().default(''), label: z.string().optional()})}),
  z.object({...base, type: z.literal('before-after'), props: z.object({mode: z.enum(['wipe', 'cut']).default('wipe'), sweepSec: z.number().default(1.3), /** cut mode: absolute second the raw version hard-cuts to the edit */ cutAt: sec.optional(), beforeLabel: z.string().default('Raw'), afterLabel: z.string().default('Edited')}).prefault({})}),
  z.object({...base, type: z.literal('chart-grow'), props: z.object({points: z.array(z.number()).min(3).max(10), label: z.string().optional(), endLabel: z.string().optional()})}),
  z.object({...base, type: z.literal('comment-bubble'), props: z.object({comment: z.string(), postAt: sec, replyAt: sec, reply: z.string(), linkLabel: z.string().default('Open link')})}),
  z.object({...base, type: z.literal('timeline-burn'), props: z.object({burnAt: sec, clips: z.number().int().min(3).max(8).default(6), /** clips: a multi-color editing timeline that catches fire. line: one crimson timeline with a glowing flame burning along it */ style: z.enum(['clips', 'line']).default('clips')})}),
  z.object({...base, type: z.literal('pull-back-reveal'), props: z.object({appTitle: z.string().default('C3 Studio'), cuts: z.array(sec).default([])}).prefault({})}),
  // ---- camera, looks and marks (added in the second FX batch)
  z.object({...base, type: z.literal('pull-back'), props: z.object({from: z.number().default(1.3)}).prefault({})}),
  z.object({...base, type: z.literal('flash-frame'), props: z.object({frames: z.number().int().min(1).max(4).default(2), color: z.enum(['white', 'warm']).default('white')}).prefault({})}),
  z.object({...base, type: z.literal('freeze-hold'), props: z.object({text: z.string().optional(), desaturate: z.boolean().default(false)}).prefault({})}),
  z.object({...base, type: z.literal('grade'), props: z.object({look: z.enum(['golden-hour', 'blue-hour', 'warm', 'cool']), strength: z.number().min(0).max(1).default(0.55)})}),
  z.object({...base, type: z.literal('glow'), props: z.object({strength: z.number().min(0).max(1).default(0.35), blurPx: z.number().default(26)}).prefault({})}),
  z.object({...base, type: z.literal('dust'), props: z.object({count: z.number().int().min(10).max(120).default(46), strength: z.number().min(0).max(1).default(0.6)}).prefault({})}),
  z.object({...base, type: z.literal('letterbox'), props: z.object({heightPx: z.number().default(220), animSec: z.number().default(0.5)}).prefault({})}),
  z.object({...base, type: z.literal('voice-memo'), props: z.object({title: z.string().default('Voice Memo'), subtitle: z.string().optional()}).prefault({})}),
  z.object({...base, type: z.literal('polaroid-drop'), props: z.object({src: z.string().optional(), caption: z.string().optional(), angle: z.number().default(6)}).prefault({})}),
  z.object({...base, type: z.literal('notes-page'), props: z.object({title: z.string(), lines: z.array(z.object({text: z.string(), at: sec})).min(1).max(8)})}),
  z.object({...base, type: z.literal('email-compose'), props: z.object({to: z.string(), subject: z.string(), body: z.string(), /** absolute second the body starts typing */ typeAt: sec.optional(), sendAt: sec.optional()})}),
  z.object({...base, type: z.literal('lock-screen'), props: z.object({app: z.string().default('Messages'), title: z.string(), text: z.string(), time: z.string().default('9:41')})}),
  z.object({...base, type: z.literal('date-stamp'), props: z.object({text: z.string(), position: z.enum(['tl', 'tr', 'bl', 'br', 'top']).default('tl')})}),
  // ---- third batch: paper cut, doodle boil, vertigo, cover story, glass type
  z.object({...base, type: z.literal('paper-cut'), props: z.object({tone: z.enum(['kraft', 'cream', 'crimson']).default('kraft'), /** a ransom-note label cut from paper, over her */ label: z.string().optional()}).prefault({})}),
  z.object({...base, type: z.literal('doodle-boil'), props: z.object({marks: z.array(z.object({kind: z.enum(['circle', 'underline', 'arrow', 'star', 'burst', 'heart', 'text']), target, at: sec, text: z.string().optional(), side: z.enum(['left', 'right']).default('right'), color: z.enum(['white', 'gold', 'red']).default('white')})).min(1).max(6)})}),
  z.object({...base, type: z.literal('vertigo'), props: z.object({to: z.number().min(1.1).max(2).default(1.5), direction: z.enum(['in', 'out']).default('in')}).prefault({})}),
  z.object({...base, type: z.literal('cover-story'), props: z.object({masthead: z.string().default('C3 GLOBAL'), headline: z.string(), lines: z.array(z.string()).max(3).default([]), issue: z.string().optional(), kicker: z.string().optional()})}),
  z.object({...base, type: z.literal('glass-type'), props: z.object({words: z.array(z.object({text: z.string(), at: sec})).min(1), /** vertical position, 0 to 1 of the frame height */ y: z.number().min(0.1).max(0.95).default(0.82)})}),
  // ---- fourth batch, in the C3 skin (src/fx/theme.tsx)
  z.object({...base, type: z.literal('prompt-bar'), props: z.object({text: z.string(), label: z.string().default('To C3'), typeAt: sec.optional(), sendAt: sec.optional(), doneLabel: z.string().default('Done'), doneText: z.string().optional(), /** top of the bar in the 1080x1920 frame; sits under the caption band, over the platform UI line */ y: z.number().default(1450), /** path under public/ to Dr. CK's own brand icon instead of the drawn globe */ iconSrc: z.string().optional()})}),
  z.object({...base, type: z.literal('comment-drop'), props: z.object({keyword: z.string(), postAt: sec, reply: z.string(), replyAt: sec, replyName: z.string().default('C3 Global'), linkLabel: z.string().optional(), y: z.number().default(1450), iconSrc: z.string().optional()})}),
  z.object({...base, type: z.literal('comment-cta'), props: z.object({keyword: z.string(), line: z.string(), postAt: sec, reply: z.string().optional(), replyAt: sec.optional(), replyName: z.string().default('C3 Global'), linkLabel: z.string().optional(), y: z.number().default(1450), iconSrc: z.string().optional()})}),
  z.object({...base, type: z.literal('file-drop'), props: z.object({name: z.string().default('raw_clip_1.mp4'), meta: z.string().default('0:21 of raw footage'), zoneLabel: z.string().default('Drop files here'), doneLabel: z.string().default('Added'), dropAt: sec.optional(), y: z.number().default(1400)}).prefault({})}),
  z.object({...base, type: z.literal('icon-strike'), props: z.object({glyph: z.enum(['cut', 'wave', 'film', 'text', 'play', 'globe', 'molecule', 'dropper', 'microscope', 'beaker', 'stylus']).default('cut'), label: z.string().default('Old editor'), winnerLabel: z.string().default('C3 Studio'), winnerGlyph: z.enum(['cut', 'wave', 'film', 'text', 'play', 'globe', 'molecule', 'dropper', 'microscope', 'beaker', 'stylus']).default('globe'), winnerSrc: z.string().optional(), strikeAt: sec.optional(), y: z.number().default(1500)}).prefault({})}),
  z.object({...base, type: z.literal('jiggle-delete'), props: z.object({icons: z.array(z.object({label: z.string(), glyph: z.enum(['cut', 'wave', 'film', 'text', 'play', 'globe', 'molecule', 'dropper', 'microscope', 'beaker', 'stylus']), tone: z.enum(['charcoal', 'copper', 'crimson', 'white']).default('charcoal'), keep: z.boolean().default(false)})).min(2).max(5).default([{label: 'Cut', glyph: 'cut', tone: 'charcoal', keep: false}, {label: 'Reel', glyph: 'film', tone: 'crimson', keep: false}, {label: 'Audio', glyph: 'wave', tone: 'copper', keep: false}, {label: 'C3 Studio', glyph: 'globe', tone: 'white', keep: true}]), deleteAt: sec.optional(), y: z.number().default(1400)}).prefault({})}),
  z.object({...base, type: z.literal('storyboard-deck'), props: z.object({stills: z.array(sec).min(1).max(2).default([0, 2]), labels: z.array(z.string()).max(3).default(['Hook', 'Proof', 'Close']), fly: z.enum(['off', 'swoop', 'orbit']).default('orbit'), tilt: z.enum(['off', 'in', 'float']).default('off'), lines: z.array(z.string()).max(4).default(['Hook over the first shot', 'Cut on the second sentence', 'Close on the question']), y: z.number().default(1330)}).prefault({})}),
  z.object({...base, type: z.literal('gravity-drop'), props: z.object({word: z.string(), kicker: z.string().optional(), /** center line of the word; the default sits just under the caption band */ y: z.number().default(1580), dropAt: sec.optional()})}),
  z.object({...base, type: z.literal('grade-slider'), props: z.object({look: z.enum(['warm', 'cool', 'golden']).default('warm'), label: z.string().default('Grade'), to: z.number().min(0.1).max(1).default(0.85), moveAt: sec.optional(), y: z.number().default(1450)}).prefault({})}),
  z.object({...base, type: z.literal('eyedropper-grade'), props: z.object({swatches: z.array(z.string()).min(3).max(6).default(['#C91B19', '#E08A57', '#B76E79', '#E3BF63', '#3A3F42']), pick: z.number().int().min(0).default(1), label: z.string().default('Grade'), pickAt: sec.optional(), y: z.number().default(1450)}).prefault({})}),
  z.object({...base, type: z.literal('kinetic-hook'), props: z.object({lines: z.array(z.object({text: z.string(), face: z.enum(['serif', 'sans', 'italic']).default('sans'), at: sec.optional()})).min(1).max(4), /** center of the stack in the 1080x1920 frame */ y: z.number().default(1120)})}),
  z.object({...base, type: z.literal('giant-caption'), props: z.object({text: z.string(), accent: z.string().optional(), y: z.number().default(1120)})}),
  z.object({...base, type: z.literal('playing-grid'), props: z.object({/** source seconds each tile plays from, so the tiles show different moments of the clip */ offsets: z.array(sec).min(3).max(4).default([0, 6, 12, 18]), y: z.number().default(1290), fly: z.enum(['off', 'swoop', 'orbit']).default('off'), tilt: z.enum(['off', 'in', 'float']).default('off')}).prefault({})}),
  z.object({...base, type: z.literal('video-card'), props: z.object({title: z.string(), sub: z.string().optional(), from: sec.optional(), y: z.number().default(1170), tilt: z.enum(['off', 'in', 'float']).default('off')})}),
  z.object({...base, type: z.literal('reel-feed'), props: z.object({handle: z.string().default('c3global'), from: sec.optional(), caption: z.string().optional()}).prefault({})}),
  z.object({...base, type: z.literal('card-orbit'), props: z.object({/** source seconds each flying video card plays from */ tiles: z.array(sec).min(3).max(6).default([2, 7, 12, 17, 22]), cy: z.number().default(960), radiusX: z.number().default(470), radiusY: z.number().default(640), spinSec: z.number().default(7), width: z.number().default(210)}).prefault({})}),
  // ---- fifth batch (C3 skin): UI and desk-object moments from the reference reels
  z.object({...base, type: z.literal('name-tag'), props: z.object({name: z.string(), top: z.string().default('HELLO'), sub: z.string().default('my name is'), y: z.number().default(1330)})}),
  z.object({...base, type: z.literal('planner-grid'), props: z.object({days: z.array(z.string()).min(3).max(6).default(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']), rows: z.number().int().min(3).max(7).default(5), /** [day index, row index, length in rows] */ blocks: z.array(z.tuple([z.number().int(), z.number().int(), z.number().int()])).default([[0, 0, 2], [1, 1, 1], [2, 0, 3], [3, 2, 2], [4, 1, 2], [0, 3, 1], [1, 3, 2], [3, 0, 1], [4, 4, 1]]), endWord: z.string().default('free'), clearAt: sec.optional(), y: z.number().default(1160)}).prefault({})}),
  z.object({...base, type: z.literal('dropdown-select'), props: z.object({label: z.string().default('Model'), placeholder: z.string().default('Choose one'), options: z.array(z.string()).min(2).max(5), pick: z.number().int().min(0).default(0), openAt: sec.optional(), pickAt: sec.optional(), y: z.number().default(1330)})}),
  z.object({...base, type: z.literal('effort-dial'), props: z.object({label: z.string().default('Effort'), labels: z.array(z.string()).min(2).max(5).default(['Low', 'Medium', 'High', 'Max']), to: z.number().min(0).max(1).default(1), turnAt: sec.optional(), y: z.number().default(1330)}).prefault({})}),
  z.object({...base, type: z.literal('specimen-card'), props: z.object({name: z.string(), role: z.string().optional(), sample: z.string().default('Aa'), y: z.number().default(1230)})}),
  z.object({...base, type: z.literal('pencil-strike'), props: z.object({title: z.string().optional(), lines: z.array(z.string()).min(2).max(5), strike: z.number().int().min(0).default(0), strikeAt: sec.optional(), y: z.number().default(1300)})}),
  z.object({...base, type: z.literal('stamp'), props: z.object({text: z.string(), tone: z.enum(['crimson', 'copper']).default('crimson'), y: z.number().default(1420)})}),
  z.object({...base, type: z.literal('waitlist-card'), props: z.object({title: z.string().default('Waitlist'), tag: z.string().optional(), rows: z.number().int().min(3).max(5).default(3), youRow: z.number().int().min(0).default(0), youAt: sec.optional(), y: z.number().default(1300)}).prefault({})}),
  z.object({...base, type: z.literal('envelope-open'), props: z.object({label: z.string(), lines: z.array(z.string()).max(4).default([]), openAt: sec.optional(), y: z.number().default(1200)})}),
  z.object({...base, type: z.literal('testimonial-stack'), props: z.object({comments: z.array(z.object({name: z.string(), text: z.string()})).min(1).max(3), y: z.number().default(1250), fly: z.enum(['off', 'swoop']).default('off')})}),
  z.object({...base, type: z.literal('render-progress'), props: z.object({label: z.string().default('Rendering video'), doneLabel: z.string().default('Ready'), y: z.number().default(1380)}).prefault({})}),
  z.object({...base, type: z.literal('feedback-note'), props: z.object({name: z.string().default('You'), text: z.string(), typeAt: sec.optional(), y: z.number().default(1330)})}),
  z.object({...base, type: z.literal('leaderboard'), props: z.object({title: z.string().optional(), items: z.array(z.string()).min(2).max(6), y: z.number().default(1200)})}),
  z.object({...base, type: z.literal('countdown-timer'), props: z.object({from: z.number().default(0), to: z.number(), unit: z.string().default('minutes'), label: z.string().optional(), y: z.number().default(1260)})}),
  z.object({...base, type: z.literal('terminal-type'), props: z.object({lines: z.array(z.object({text: z.string(), at: sec.optional()})).min(1).max(5), y: z.number().default(1300)})}),
  z.object({...base, type: z.literal('toggle-switch'), props: z.object({label: z.string(), sub: z.string().optional(), glyph: z.enum(['globe', 'molecule', 'beaker', 'microscope', 'dropper', 'stylus']).default('globe'), flipAt: sec.optional(), y: z.number().default(1400)})}),
  z.object({...base, type: z.literal('generating-tiles'), props: z.object({glyphs: z.array(z.enum(['globe', 'molecule', 'beaker', 'microscope', 'dropper', 'stylus'])).min(2).max(4).default(['molecule', 'beaker', 'microscope', 'dropper']), label: z.string().default('Generating'), y: z.number().default(1230), fly: z.enum(['off', 'swoop']).default('off')}).prefault({})}),
  z.object({...base, type: z.literal('follow-card'), props: z.object({handle: z.string(), sub: z.string().optional(), followAt: sec.optional(), y: z.number().default(1420)})}),
  z.object({...base, type: z.literal('defocus'), props: z.object({peak: z.number().default(16)}).prefault({})}),
  z.object({...base, type: z.literal('reel-stack'), props: z.object({offsets: z.array(sec).min(2).max(3).default([3, 9, 15]), label: z.string().default('Link copied'), y: z.number().default(1180), fly: z.enum(['off', 'swoop']).default('off')}).prefault({})}),
  // ---- sixth batch: editing-desk moments (receipt, frame calendar, cover frame, keycaps, film strip, phone frame, clip type, storyboard wall, step chips, pen circle, caption stack)
  z.object({...base, type: z.literal('receipt-ticket'), props: z.object({text: z.string(), label: z.string().default('Instruction'), no: z.string().default('01'), to: z.string().default('To C3'), total: z.string().default('1 SENTENCE'), y: z.number().default(1440)})}),
  z.object({...base, type: z.literal('frame-calendar'), props: z.object({days: z.number().int().min(12).max(30).default(30), label: z.string().default('Every frame'), thumbs: z.array(sec).min(1).max(5).default([1, 6, 11, 16])}).prefault({})}),
  z.object({...base, type: z.literal('cover-frame'), props: z.object({masthead: z.string(), headline: z.string(), issue: z.string().optional(), from: sec.optional(), tilt: z.enum(['off', 'in', 'float']).default('off')}).transform((p) => ({...p, from: p.from ?? 0}))}),
  z.object({...base, type: z.literal('keycap-drop'), props: z.object({keys: z.array(z.object({key: z.string(), sub: z.string().optional()})).min(4).max(10).default([{key: '⌘K'}, {key: '⌘Z'}, {key: 'B'}, {key: 'J'}, {key: 'K'}, {key: 'space', sub: 'play'}, {key: 'C'}, {key: '⌘B'}, {key: 'Q'}, {key: '⌥', sub: 'option'}]), y: z.number().default(1430)}).prefault({})}),
  z.object({...base, type: z.literal('film-strip'), props: z.object({label: z.string().default('Raw footage'), offsets: z.array(sec).min(6).max(12).default([1, 3, 5, 7, 9, 11, 13, 15, 17, 19]), marks: z.array(z.object({cell: z.number().int().min(0), kind: z.enum(['circle', 'cross']), label: z.string().optional(), at: sec.optional()})).default([{cell: 2, kind: 'circle'}, {cell: 3, kind: 'cross'}, {cell: 6, kind: 'cross'}, {cell: 9, kind: 'circle'}]), y: z.number().default(1400)}).prefault({})}),
  z.object({...base, type: z.literal('phone-frame'), props: z.object({from: sec.optional(), len: z.number().default(4), tilt: z.enum(['off', 'in', 'float']).default('off')}).transform((p) => ({...p, from: p.from ?? 0})).prefault({})}),
  z.object({...base, type: z.literal('clip-type'), props: z.object({word: z.string(), field: z.enum(['black', 'white']).default('white'), from: sec.optional()}).transform((p) => ({...p, from: p.from ?? 0}))}),
  z.object({...base, type: z.literal('storyboard-wall'), props: z.object({offsets: z.array(sec).min(4).max(12).default([1, 3, 5, 7, 9, 11]), rows: z.number().int().min(1).max(2).default(1), y: z.number().default(1450)}).prefault({})}),
  z.object({...base, type: z.literal('step-chips'), props: z.object({steps: z.array(z.object({label: z.string(), at: sec})).min(2).max(5), y: z.number().default(1470)})}),
  z.object({...base, type: z.literal('pen-circle'), props: z.object({note: z.string().optional(), target: target.default('head'), bw: z.boolean().default(true)}).prefault({})}),
  z.object({...base, type: z.literal('card-flip'), props: z.object({cards: z.array(z.object({front: z.string(), from: sec, back: z.string().optional()})).min(1).max(3), flipAt: z.number().default(1.1), y: z.number().default(1260)})}),
  z.object({...base, type: z.literal('card-carousel'), props: z.object({tiles: z.array(sec).min(3).max(6).default([2, 5, 8, 11, 14, 17]), cy: z.number().default(1300), radius: z.number().default(430), width: z.number().default(240), spinSec: z.number().default(8), tiltX: z.number().default(-10)}).prefault({})}),
  z.object({...base, type: z.literal('script-panel'), props: z.object({title: z.string().default('Script'), beats: z.array(z.object({quote: z.string(), time: z.string().optional(), label: z.string().optional(), notes: z.array(z.string()).max(3).optional()})).min(2).max(8), steps: z.array(z.object({label: z.string(), at: sec})).max(5).default([])})}),
  z.object({...base, type: z.literal('caption-stack'), props: z.object({words: z.array(z.string()).min(2).max(5), y: z.number().default(1420)})}),
]);


export type Fx = z.infer<typeof fxSchema>;
export type FxType = Fx['type'];
export type Target = z.infer<typeof target>;
