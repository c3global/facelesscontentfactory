/**
 * Single source of truth for C3 Global video brand tokens.
 *
 * Palette: crimson, white, black, charcoal, plus metallic rose gold and gold.
 * No cream, ivory or off-white, and no eggplant (Substack only).
 *
 * STANDING RULE: rose gold and gold are never flat. They only exist as the metal tokens below
 * (multi-stop gradients with a shadow stop, a mid tone, a bright highlight, and back to mid)
 * and are drawn through src/metal.tsx so they also carry the slow specular shimmer.
 */
export const brand = {
  crimson: '#C91B19',
  crimsonMid: '#A31516',
  crimsonDeep: '#6F0D0F', // deeper tone of the same crimson, for field gradients
  white: '#FFFFFF',
  black: '#000000',
  charcoal: '#3A3F42',
} as const;

export type MetalKind = 'rose' | 'gold';
/** deep: for use on white cards. bright: for use on crimson and dark fields. */
export type MetalVariant = 'deep' | 'bright';

/**
 * Stops are [shadow, mid, highlight, mid, shadow].
 * Rose gold is built on #B76E79 with its tint #D48A8C and a deeper shade; gold is built on #D5AA4A.
 */
const METAL_STOPS: Record<MetalKind, Record<MetalVariant, [string, string, string, string, string]>> = {
  rose: {
    deep: ['#7A3C47', '#B76E79', '#E9B3B4', '#B76E79', '#86444F'],
    bright: ['#B76E79', '#D48A8C', '#FCE2DF', '#D48A8C', '#B76E79'],
  },
  gold: {
    deep: ['#85611A', '#D5AA4A', '#F8E8B4', '#D5AA4A', '#8E6B1E'],
    bright: ['#B38A32', '#E3BF63', '#FFF3C9', '#E3BF63', '#B38A32'],
  },
};
export const STOP_OFFSETS = [0, 0.28, 0.5, 0.72, 1] as const;

export const metalStops = (kind: MetalKind, variant: MetalVariant) => METAL_STOPS[kind][variant];

export const metalGradient = (kind: MetalKind, variant: MetalVariant, angle = 135) => {
  const s = METAL_STOPS[kind][variant];
  return `linear-gradient(${angle}deg, ${s
    .map((c, i) => `${c} ${Math.round(STOP_OFFSETS[i] * 100)}%`)
    .join(', ')})`;
};

export type FieldOption = 'crimson' | 'charcoal' | 'rosegold';
export type SansOption = 'DM Sans' | 'Montserrat';
export type Mood = 'dark' | 'light';

export type Palette = {
  mood: Mood;
  field: FieldOption;
  /** text color directly on the scene background (not on a card) */
  onBg: string;
  /** small-label color on the scene background */
  labelOnBg: string;
  /** metal variant for elements that sit on the scene background */
  metalOnBg: MetalVariant;
  /** text on white cards */
  onCard: string;
  /** shadow for text drawn over video / dark fields */
  shadow: string;
};

export const paletteFor = (mood: Mood, field: FieldOption): Palette => {
  const onRose = mood === 'dark' && field === 'rosegold';
  return {
    mood,
    field,
    onBg: mood === 'light' ? brand.charcoal : onRose ? brand.charcoal : brand.white,
    labelOnBg: mood === 'light' ? brand.crimson : onRose ? brand.charcoal : brand.white,
    metalOnBg: mood === 'light' || onRose ? 'deep' : 'bright',
    onCard: brand.charcoal,
    shadow: mood === 'light' ? 'none' : '0 2px 18px rgba(0,0,0,0.45)',
  };
};
