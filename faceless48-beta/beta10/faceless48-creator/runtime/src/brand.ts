import customerBrand from "./brandConfig";
/** Mix a #RRGGBB colour toward white (amt > 0) or black (amt < 0), so metal shades follow the member's own palette. */
const shade = (hex: string, amt: number) => {
  const n = parseInt(hex.slice(1), 16);
  const mix = (c: number) => Math.round(amt >= 0 ? c + (255 - c) * amt : c * (1 + amt));
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(mix);
  return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1).toUpperCase();
};
/**
 * Single source of truth for the video brand tokens. Colours come from brand.json.
 *
 * Palette: crimson, white, black, charcoal, plus metallic rose gold and gold.
 * No cream, ivory or off-white, and no eggplant (Substack only).
 *
 * STANDING RULE: rose gold and gold are never flat. They only exist as the metal tokens below
 * (multi-stop gradients with a shadow stop, a mid tone, a bright highlight, and back to mid)
 * and are drawn through src/metal.tsx so they also carry the slow specular shimmer.
 */
export const brand = {
  crimson: `${customerBrand.accent}`,
  crimsonMid: `${customerBrand.accentMid}`,
  crimsonDeep: `${customerBrand.accentDeep}`, // deeper tone of the same crimson, for field gradients
  white: '#FFFFFF',
  black: '#000000',
  charcoal: '#3A3F42',
} as const;

export type MetalKind = 'rose' | 'gold' | 'crimson' | 'copper' | 'silver';
/** deep: for use on white cards. bright: for use on crimson and dark fields. */
export type MetalVariant = 'deep' | 'bright';

/**
 * Stops are [shadow, mid, highlight, mid, shadow].
 * Rose gold is built on #A9574A with its tint #C27A6B and a deeper shade; gold is built on #D5AA4A.
 */
const METAL_STOPS: Record<MetalKind, Record<MetalVariant, [string, string, string, string, string]>> = {
  rose: {
    deep: ['#6B3129', '#A9574A', '#F1B9A5', '#A9574A', '#7A3A31'],
    bright: ['#A9574A', '#C27A6B', '#FBE3DA', '#C27A6B', '#A9574A'],
  },
  // metallic red: built on #C91B19 with its deeper tones (#A31516, #6F0D0F) and a lighter tint for the highlight
  crimson: {
    deep: [`${customerBrand.accentDeep}`, `${customerBrand.accent}`, shade(customerBrand.accent, 0.4), `${customerBrand.accent}`, shade(customerBrand.accentDeep, -0.15)],
    bright: [`${customerBrand.accentMid}`, shade(customerBrand.accent, 0.1), shade(customerBrand.accent, 0.55), shade(customerBrand.accent, 0.1), `${customerBrand.accentMid}`],
  },
  // Dr. CK's metallic accent (her "rose gold"): deeper, richer #A9574A with the #F1B9A5 highlight. Not orange copper.
  copper: {
    deep: [shade(customerBrand.metal, -0.4), `${customerBrand.metal}`, `${customerBrand.metalLight}`, `${customerBrand.metal}`, shade(customerBrand.metal, -0.32)],
    bright: [`${customerBrand.metal}`, `${customerBrand.metal}`, shade(customerBrand.metalLight, 0.5), `${customerBrand.metal}`, `${customerBrand.metal}`],
  },
  // polished silver: cool grey body with a near-white highlight
  silver: {
    deep: ['#4E5459', '#8E959C', '#E8ECEF', '#8E959C', '#5A6066'],
    bright: ['#A3AAB1', '#C9CED3', '#FFFFFF', '#C9CED3', '#A3AAB1'],
  },
  gold: {
    deep: ['#85611A', '#D5AA4A', '#F8E8B4', '#D5AA4A', '#8E6B1E'],
    bright: ['#B38A32', '#E3BF63', '#FFF3C9', '#E3BF63', '#B38A32'],
  },
};
// Every metal an effect asks for (rose, gold or copper) is drawn in the member's own metallic finish from brand.json,
// so a silver or gold brand never shows copper. Silver and crimson keep their own roles.
METAL_STOPS.rose = METAL_STOPS.copper;
METAL_STOPS.gold = METAL_STOPS.copper;
export const STOP_OFFSETS = [0, 0.28, 0.5, 0.72, 1] as const;

export const metalStops = (kind: MetalKind, variant: MetalVariant) => METAL_STOPS[kind][variant];

export const metalGradient = (kind: MetalKind, variant: MetalVariant, angle = 135) => {
  const s = METAL_STOPS[kind][variant];
  return `linear-gradient(${angle}deg, ${s
    .map((c, i) => `${c} ${Math.round(STOP_OFFSETS[i] * 100)}%`)
    .join(', ')})`;
};

/** `black` is the locked field. The others stay selectable in code but are retired from the video. */
export type FieldOption = 'black' | 'crimson' | 'charcoal' | 'rosegold' | 'marble-black' | 'marble-white' | 'marble-red';
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
    labelOnBg: mood === 'light' ? brand.charcoal : onRose ? brand.charcoal : brand.white,
    metalOnBg: mood === 'light' || onRose ? 'deep' : 'bright',
    onCard: brand.charcoal,
    shadow: mood === 'light' ? 'none' : '0 2px 18px rgba(0,0,0,0.45)',
  };
};
