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
    props: z.object({chips: z.array(z.object({text: z.string(), at: sec})).min(1).max(5)}),
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
    type: z.literal('statement-card'),
    props: z.object({text: z.string(), emphasis}),
  }),
]);

export const segmentSchema = z.object({
  start: sec,
  end: sec,
  layout: z.enum(['A', 'B', 'C', 'D']),
  /** layout C only: show her as a small circle, or hide her */
  avatar: z.enum(['circle', 'hidden']).optional(),
  graphics: z.array(graphicSchema).default([]),
});

export const sceneSchema = z.object({
  id: z.string(),
  mood: z.enum(['dark', 'light']),
  /** small spaced-caps label at the top of the scene */
  tag: z.string().optional(),
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
      field: z.enum(['black', 'crimson', 'charcoal', 'rosegold']).default('black'),
      sans: z.enum(['DM Sans', 'Montserrat']).default('DM Sans'),
    })
    .prefault({}),
  /** words rendered in the Playfair italic rose gold emphasis treatment */
  emphasis: z.array(z.string()).default([]),
  /** createTikTokStyleCaptions combineTokensWithinMilliseconds. Low = 1 to 3 words per page. */
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
