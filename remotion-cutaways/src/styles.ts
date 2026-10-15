/**
 * Style presets and mix-and-match dials.
 *
 * A plan can say `"style": "spotlight"` and/or `"mix": {"captions": "heavy", "outline": "copper"}`.
 * Resolution order (later wins): preset dials, then `mix` overrides, then anything written explicitly in the plan.
 * With no `style` at all (a "freestyle" plan) only the dials in `mix` apply; everything else keeps the Signature defaults.
 * Plans without `style` or `mix` are untouched, so every earlier video renders exactly as before.
 */

export const DIAL_NAMES = ['captions', 'backdrop', 'finish', 'look', 'music', 'sound', 'outline', 'effects'] as const;
export type DialName = (typeof DIAL_NAMES)[number];
export type Mix = Partial<Record<DialName, string>>;

/** What each dial value does. `effects` is a recommended effect pack (guidance for placing effects, not auto-placement). */
export const DIALS: Record<DialName, Record<string, {note: string; set?: Record<string, unknown>}>> = {
  captions: {
    editorial: {note: 'Kinetic editorial lockups: Playfair hero words with small support words (the approved look)', set: {captionStyle: 'editorial'}},
    heavy: {note: 'Same lockups with the hero word in heavy Anton capitals', set: {captionStyle: 'heavy'}},
    pill: {note: 'Small glass-pill subtitles, one to three words at a time (quiet, no lockups)', set: {captionStyle: 'pill'}},
  },
  backdrop: {
    'as-planned': {note: 'Keep the video plan\'s own scene backgrounds (the approved look: velvet where the plan puts it)'},
    velvet: {note: 'Red velvet photo behind every dark scene that has no background of its own', set: {theme: {field: 'black'}}},
    black: {note: 'Plain black field', set: {theme: {field: 'black'}}},
    crimson: {note: 'Crimson field', set: {theme: {field: 'crimson'}}},
    charcoal: {note: 'Charcoal field', set: {theme: {field: 'charcoal'}}},
    'marble-black': {note: 'Black marble with rose gold veins', set: {theme: {field: 'marble-black'}}},
    'marble-red': {note: 'Deep red marble with cream veins', set: {theme: {field: 'marble-red'}}},
    'marble-white': {note: 'White marble (scenes flip to light)', set: {theme: {field: 'marble-white'}}},
  },
  finish: {
    clean: {note: 'No grain, no light leaks', set: {finish: {grain: 0, lightLeaks: 0}}},
    film: {note: 'Light grain and warm leaks (the approved look)', set: {finish: {grain: 0.35, lightLeaks: 0.5}}},
    cinematic: {note: 'Heavier grain and stronger leaks', set: {finish: {grain: 0.55, lightLeaks: 0.8}}},
  },
  look: {
    none: {note: 'No color look (default; the approved look)'},
    'golden-hour': {note: 'Warm golden-hour grade over her frame'},
    'blue-hour': {note: 'Cool blue-hour grade over her frame'},
    'soft-glow': {note: 'Soft bloom: a gentle glow on the highlights'},
    dust: {note: 'Drifting warm dust particles'},
    letterbox: {note: 'Cinema bars top and bottom'},
    cinema: {note: 'Golden-hour grade, soft glow, drifting dust and letterbox bars together'},
  },
  music: {
    'as-planned': {note: 'Keep the plan\'s own music levels (each track is leveled separately; the approved look)'},
    bed: {note: 'Music bed at the standard level, ducking under her voice', set: {music: {volume: 0.35, duckTo: 0.16}}},
    soft: {note: 'Quieter bed for calm pieces', set: {music: {volume: 0.22, duckTo: 0.1}}},
    none: {note: 'No music', set: {music: null}},
  },
  sound: {
    off: {note: 'No effect sounds', set: {fxSound: 'off'}},
    minimal: {note: 'Only each effect\'s main entrance sound (default)', set: {fxSound: 'minimal'}},
    full: {note: 'Adds ticks, pops and per-item sounds', set: {fxSound: 'full'}},
  },
  outline: {
    none: {note: 'No outline on her cutout', set: {matteOutline: 'none'}},
    white: {note: 'Clean white outline (bake first: npm run outline -- <slug> white)', set: {matteOutline: 'white'}},
    copper: {note: 'Shimmering new-penny copper outline (bake first)', set: {matteOutline: 'copper'}},
    gold: {note: 'Shimmering gold outline (bake first)', set: {matteOutline: 'gold'}},
  },
  effects: {
    none: {note: 'No effects'},
    authority: {note: 'Restrained: digital zoom, blackout, spotlight, sticky text, checklist'},
    spotlight: {note: 'Dramatic: spotlight, type wall, zoom-through, digital zoom, frame break, freeze sticker'},
    teach: {note: 'Explaining: UI world, the stack, checklist, pointer callout, chart grow, odometer, green screen, before and after'},
    hype: {note: 'Social energy: orbit, clone, couch wall, headline wall, knockout tiles, comment bubble, phone mockup, timeline burn'},
    all: {note: 'All 26 effects are fair game'},
  },
};

export type Preset = {name: string; summary: string; mix: Mix};

export const PRESETS: Record<string, Preset> = {
  signature: {
    name: 'Signature',
    summary: 'The approved look: kinetic editorial captions, red velvet, glass cutaways, copper and gold, film finish, music bed. Effects only when asked.',
    mix: {captions: 'editorial', backdrop: 'as-planned', finish: 'film', music: 'as-planned', sound: 'minimal', outline: 'none', effects: 'authority'},
  },
  'quiet-authority': {
    name: 'Quiet Authority',
    summary: 'Executive and restrained: pill subtitles, clean finish, soft music, a slow digital zoom and a spotlight on the key line. Nothing busy.',
    mix: {captions: 'pill', backdrop: 'black', finish: 'clean', music: 'soft', sound: 'minimal', outline: 'none', effects: 'authority'},
  },
  spotlight: {
    name: 'Spotlight',
    summary: 'Dramatic and cinematic: heavy captions, stronger film finish, copper outline, spotlight and type-wall moments, zoom-through cuts.',
    mix: {captions: 'heavy', backdrop: 'velvet', finish: 'cinematic', music: 'bed', sound: 'minimal', outline: 'copper', effects: 'spotlight'},
  },
  'show-and-tell': {
    name: 'Show and Tell',
    summary: 'For teaching: the app screen, stacks, checklists, callouts and charts carry the lesson. Calm captions, clean finish.',
    mix: {captions: 'editorial', backdrop: 'charcoal', finish: 'clean', music: 'soft', sound: 'minimal', outline: 'white', effects: 'teach'},
  },
  'hype-reel': {
    name: 'Hype Reel',
    summary: 'Social energy: heavy captions, orbit, clones, wall effects and the comment bubble. Full effect sounds, white outline.',
    mix: {captions: 'heavy', backdrop: 'crimson', finish: 'film', music: 'bed', sound: 'full', outline: 'white', effects: 'hype'},
  },
  'raw-tape': {
    name: 'Raw Tape',
    summary: 'Unpolished and personal: pill subtitles, grain, no music, no effect sounds, nothing between her and the viewer.',
    mix: {captions: 'pill', backdrop: 'black', finish: 'cinematic', music: 'none', sound: 'off', outline: 'none', effects: 'none'},
  },
};

const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const merge = (a: Record<string, unknown>, b: Record<string, unknown>): Record<string, unknown> => {
  const out: Record<string, unknown> = {...a};
  for (const [k, v] of Object.entries(b)) out[k] = isObj(v) && isObj(out[k]) ? merge(out[k] as Record<string, unknown>, v) : v;
  return out;
};

const derive = (mix: Mix): Record<string, unknown> => {
  let out: Record<string, unknown> = {};
  for (const [dial, value] of Object.entries(mix)) {
    const d = DIALS[dial as DialName]?.[value as string];
    if (!d) throw new Error(`Unknown style dial "${dial}: ${value}". Dials: ${DIAL_NAMES.join(', ')}`);
    if (d.set) out = merge(out, d.set);
  }
  return out;
};

/** The `look` dial becomes whole-video effects (looks never move her speech or captions). */
const lookFx = (look: string, dur: number): any[] => {
  const span = {at: 0, until: dur};
  const grade = (l: string, strength: number) => ({type: 'grade', ...span, props: {look: l, strength}});
  const glow = (strength: number) => ({type: 'glow', ...span, props: {strength, blurPx: 26}});
  const dust = (strength: number) => ({type: 'dust', ...span, props: {count: 46, strength}});
  const bars = () => ({type: 'letterbox', ...span, props: {heightPx: 200, animSec: 0.6}});
  switch (look) {
    case 'golden-hour':
      return [grade('golden-hour', 0.5)];
    case 'blue-hour':
      return [grade('blue-hour', 0.5)];
    case 'soft-glow':
      return [glow(0.3)];
    case 'dust':
      return [dust(0.6)];
    case 'letterbox':
      return [bars()];
    case 'cinema':
      return [grade('golden-hour', 0.4), glow(0.22), dust(0.4), bars()];
    default:
      return [];
  }
};

/**
 * Resolves `style` and `mix` into plan fields. Plans with neither are returned unchanged.
 * Order, later wins: fields written in the plan, then the preset's dials, then `mix` (a deliberate override).
 * Picking a style is a decision to change the look, so it wins over values the plan wrote for those same dials.
 */
export const applyStyle = (raw: any): any => {
  if (!raw || (!raw.style && !raw.mix)) return raw;
  const preset = raw.style ? PRESETS[raw.style] : undefined;
  if (raw.style && !preset) throw new Error(`Unknown style "${raw.style}". Known: ${Object.keys(PRESETS).join(', ')}`);
  const {style: _s, mix: _m, ...rest} = raw;
  const resolved: Mix = {...(preset?.mix ?? {}), ...(raw.mix ?? {})};
  let plan: any = merge(merge(rest, derive(preset?.mix ?? {})), derive(raw.mix ?? {}));
  // a music dial only sets levels, so a plan without a track keeps no music; `none` removes the track
  if (resolved.music === 'none' || (plan.music && !plan.music.src)) delete plan.music;
  // velvet puts the photo behind dark scenes that have none; white marble flips scenes to light
  // the plain fields (black, crimson, charcoal, marble) replace every scene photo so the whole video changes
  if (resolved.backdrop && !['as-planned', 'velvet'].includes(resolved.backdrop) && Array.isArray(plan.scenes)) plan.scenes = plan.scenes.map(({bg: _bg, ...sc}: any) => sc);
  if (resolved.backdrop === 'velvet' && Array.isArray(plan.scenes)) plan.scenes = plan.scenes.map((s: any) => (s.mood === 'dark' && !s.bg ? {...s, bg: 'backdrops/red-velvet.jpg'} : s));
  if (resolved.backdrop === 'marble-white' && Array.isArray(plan.scenes)) plan.scenes = plan.scenes.map((s: any) => ({...s, mood: 'light'}));
  if (resolved.look && resolved.look !== 'none' && typeof plan.durationSec === 'number') plan.fx = [...lookFx(resolved.look, plan.durationSec), ...(plan.fx ?? [])];
  return plan;
};
