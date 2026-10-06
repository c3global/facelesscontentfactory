import {z} from 'zod';

const sec = z.number().min(0);
const emphasis = z.array(z.string()).optional();

/** Every graphic is `{type, at, until?, props}`. `at` and `until` are absolute seconds in the video. */
const box = z.object({y: z.number().optional(), h: z.number().optional()}).optional();
const base = {at: sec, until: sec.optional(), box};

export const graphicSchema = z.discriminatedUnion('type', [
  z.object({
    ...base,
    type: z.literal('tag'),
    props: z.object({text: z.string()}),
  }),
  z.object({
    ...base,
    type: z.literal('headline-card'),
    props: z.object({
      label: z.string(),
      line: z.string(),
      emphasis,
      /** absolute second at which the line is struck through */
      strikeAt: sec.optional(),
    }),
  }),
  z.object({
    ...base,
    type: z.literal('rewrite-card'),
    props: z.object({
      label: z.string(),
      oldLine: z.string(),
      newLine: z.string(),
      emphasis,
      /** old line is already struck through when the card appears */
      struckAtStart: z.boolean().default(false),
      strikeAt: sec.optional(),
      /** absolute second the new line starts writing in */
      writeAt: sec,
      writeSeconds: z.number().min(0.2).default(2.4),
    }),
  }),
  z.object({
    ...base,
    type: z.literal('notification-stack'),
    props: z.object({
      items: z
        .array(z.object({app: z.string(), text: z.string(), at: sec}))
        .min(1)
        .max(5),
      badgeLabel: z.string().default('new'),
      /** scales the whole panel so it fills the frame */
      zoom: z.number().min(0.8).max(2).default(1),
    }),
  }),
  z.object({
    ...base,
    type: z.literal('hub-diagram'),
    props: z.object({
      center: z.string(),
      centerAt: sec,
      nodes: z.array(z.object({label: z.string(), at: sec})).min(3).max(5),
      /** lines draw outward from the center */
      drawAt: sec,
      /** nodes switch from `fromLabel` to `toLabel` */
      changeAt: sec,
      /** scale the whole diagram down to fit a shorter area (1 = full 960 x 1070) */
      fit: z.number().min(0.5).max(1).default(1),
      fromLabel: z.string().default('Waiting'),
      toLabel: z.string().default('Agreeing'),
    }),
  }),
  z.object({
    ...base,
    type: z.literal('chat-ui'),
    props: z.object({
      title: z.string(),
      items: z
        .array(z.object({channel: z.string(), text: z.string(), at: sec}))
        .min(1)
        .max(4),
      badgeLabel: z.string().default('unread'),
      zoom: z.number().min(0.8).max(2).default(1),
    }),
  }),
  z.object({
    ...base,
    type: z.literal('meeting-tile'),
    props: z.object({
      title: z.string(),
      status: z.string(),
      participants: z.number().int().min(2).max(6).default(4),
      /** second at which the mic-muted / silent state kicks in */
      mutedAt: sec.optional(),
      zoom: z.number().min(0.8).max(2).default(1),
    }),
  }),
  z.object({
    ...base,
    type: z.literal('floating-chips'),
    props: z.object({
      chips: z.array(z.object({text: z.string(), at: sec})).min(1).max(5),
      /** stack: a centered column of large chips (hidden-avatar scenes); float: small chips drifting around her */
      mode: z.enum(['float', 'stack']).default('float'),
    }),
  }),
  z.object({
    ...base,
    type: z.literal('chapter-card'),
    props: z.object({
      numeral: z.string(),
      title: z.string(),
      flowLabel: z.string().optional(),
      flow: z.array(z.string()).min(2).max(4),
    }),
  }),
  z.object({
    ...base,
    type: z.literal('congruence-map'),
    props: z.object({
      /** four components in reading order: top, right, bottom, left. `at` is when each is introduced. */
      nodes: z.array(z.object({label: z.string(), at: sec, /** when the label replaces the bare numeral (defaults to `at`) */ labelAt: sec.optional()})).length(4),
      /** the remaining links between the four are drawn */
      connectAt: sec,
      /** every link carries a pulse and a small crimson dot marks the shared center */
      pulseAt: sec,
    }),
  }),
  z.object({
    ...base,
    type: z.literal('notes-card'),
    props: z.object({
      label: z.string().default('Notes'),
      title: z.string(),
      items: z.array(z.object({text: z.string(), at: sec, /** the check mark draws this many seconds after the line appears */ checkAfter: z.number().min(0).optional()})).min(1).max(5),
    }),
  }),
  z.object({
    ...base,
    type: z.literal('quiet-feed'),
    props: z.object({
      label: z.string().default('COMMUNITY FEED'),
      post: z.string(),
      /** shown under the post once it has had time to sit unanswered */
      status: z.string(),
      statusAt: sec,
    }),
  }),
  z.object({
    ...base,
    type: z.literal('citation-card'),
    props: z.object({
      label: z.string().default('SOURCE'),
      authors: z.string(),
      year: z.string().optional(),
      title: z.string(),
      source: z.string(),
    }),
  }),
  z.object({
    ...base,
    type: z.literal('screenshot-card'),
    props: z.object({
      /** image in public/, for example shots/substack.png */
      src: z.string(),
      /** slow pan down a tall screenshot (0 = none, 1 = the full overflow) */
      pan: z.number().min(0).max(1).default(0),
      /** card: glass frame beside or under her window. full: the page fills the whole frame like a screen recording */
      mode: z.enum(['card', 'full']).default('card'),
    }),
  }),
  z.object({
    ...base,
    type: z.literal('statement-card'),
    props: z.object({text: z.string(), emphasis}),
  }),
]);

export const segmentSchema = z.object({
  start: sec,
  end: sec,
  layout: z.enum(['A', 'B', 'C', 'D', 'E', 'S']),
  /** where kinetic captions sit in this segment: bottom band, top band, or alternating by sentence (top first) */
  captionPos: z.enum(['bottom', 'top', 'alternate']).default('bottom'),
  /** per-segment framing of her inside the window: where the face sits (focusY, percent) and extra zoom */
  focus: z.object({y: z.number(), zoom: z.number()}).optional(),
  /** layouts C and E: show her as a small window, or hide her (audio keeps playing) */
  avatar: z.enum(['circle', 'hidden']).optional(),
  graphics: z.array(graphicSchema).default([]),
});

export const sceneSchema = z.object({
  id: z.string(),
  mood: z.enum(['dark', 'light']),
  /** small spaced-caps label at the top of the scene */
  tag: z.string().optional(),
  /** photo background for this scene, a path inside public/ (for example backdrops/marble-black.jpg). Overrides the field. */
  bg: z.string().optional(),
  segments: z.array(segmentSchema).min(1),
});

export const endCardSchema = z.discriminatedUnion('variant', [
  z.object({
    variant: z.literal('link-pill'),
    startAt: sec,
    label: z.string(),
    url: z.string(),
  }),
  z.object({
    variant: z.literal('comment-keyword'),
    startAt: sec,
    prompt: z.string(),
    keyword: z.string(),
  }),
]);

export const planSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  /** path inside public/ */
  video: z.string(),
  durationSec: z.number().positive(),
  theme: z
    .object({
      field: z.enum(['black', 'crimson', 'charcoal', 'rosegold', 'marble-black', 'marble-white', 'marble-red']).default('black'),
      sans: z.enum(['DM Sans', 'Montserrat']).default('DM Sans'),
    })
    .prefault({}),
  /** words rendered in the Playfair italic rose gold emphasis treatment */
  emphasis: z.array(z.string()).default([]),
  /**
   * pill: small glass-pill subtitles. editorial / heavy: kinetic lockups (one hero word set huge, small
   * support words around it, optional highlight box). Editorial sets the hero in Playfair Black, heavy in Anton.
   */
  captionStyle: z.enum(['pill', 'editorial', 'heavy']).default('editorial'),
  /** words that should become the hero of a lockup (emphasis words always can) */
  hero: z.array(z.string()).default([]),
  /** words that get a highlight box behind them */
  boxed: z.array(z.string()).default([]),
  /** createTikTokStyleCaptions combineTokensWithinMilliseconds (pill style). Low = 1 to 3 words per page. */
  /** vertical band for kinetic captions, in px. Default keeps them in the lower third; the plain-avatar preset uses 1056 to 1382 (55 to 72 percent). */
  captionBand: z.object({top: z.number(), bottom: z.number()}).prefault({top: 1160, bottom: 1490}),
  /** the band used when a segment moves captions to the top */
  /** film finish over the whole frame: grain (0 to 1) and light leaks (0 to 1, warm brand-tint leaks that drift and burst on cuts) */
  finish: z.object({grain: z.number().min(0).max(1).default(0), lightLeaks: z.number().min(0).max(1).default(0)}).prefault({}),
  /** background music from public/music (licensed tracks stay out of git). Ducks under her voice automatically, fades in and out. */
  music: z
    .object({
      src: z.string(),
      /** level when she is silent (0 to 1) */
      volume: z.number().min(0).max(1).default(0.22),
      /** level while she speaks */
      duckTo: z.number().min(0).max(1).default(0.07),
      fadeInSec: z.number().min(0).default(1.5),
      fadeOutSec: z.number().min(0).default(2.5),
      startFromSec: z.number().min(0).default(0),
    })
    .optional(),
  captionBandTop: z.object({top: z.number(), bottom: z.number()}).prefault({top: 250, bottom: 560}),
  captionPageMs: z.number().int().min(100).max(1500).default(500),
  scenes: z.array(sceneSchema).min(1),
  endCard: endCardSchema.optional(),
});

export type Graphic = z.infer<typeof graphicSchema>;
export type Segment = z.infer<typeof segmentSchema>;
export type Scene = z.infer<typeof sceneSchema>;
export type EndCard = z.infer<typeof endCardSchema>;
export type ScenePlan = z.infer<typeof planSchema>;

/** Props handed to the composition by the batch renderer and the Studio. */
export const videoPropsSchema = z.object({
  plan: planSchema,
  /** Remotion `Caption[]` from @remotion/captions */
  captions: z.array(
    z.object({
      text: z.string(),
      startMs: z.number(),
      endMs: z.number(),
      timestampMs: z.number().nullable(),
      confidence: z.number().nullable(),
    }),
  ),
});
export type VideoProps = z.infer<typeof videoPropsSchema>;
