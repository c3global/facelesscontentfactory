import raw from '../brand.json';

/**
 * The member's brand, read once from brand.json. Every file imports this instead of brand.json,
 * so a metal finish can fill in its own colors.
 *
 * metalFinish picks the main metallic trim (rims, hairlines, check marks, copper-slot accents):
 *   "copper" | "rose-gold" | "gold" | "silver" | "custom" (uses metal and metalLight as written).
 */
export const METAL_FINISHES = {
  copper: {metal: '#B5622C', metalLight: '#F4B08A'},
  'rose-gold': {metal: '#B76E79', metalLight: '#F2C4C2'},
  gold: {metal: '#B8892E', metalLight: '#F6DE9A'},
  silver: {metal: '#8E959C', metalLight: '#F1F3F5'},
} as const;
export type MetalFinish = keyof typeof METAL_FINISHES | 'custom';

type Raw = typeof raw & {metalFinish?: MetalFinish; tagline?: string | null};
const r = raw as Raw;
const finish: MetalFinish = r.metalFinish ?? 'custom';
const picked = finish === 'custom' ? {metal: r.metal, metalLight: r.metalLight} : METAL_FINISHES[finish];

export const customerBrand = {...r, ...picked, metalFinish: finish, tagline: r.tagline ?? null};
export default customerBrand;

/** The main brand color as an rgba() string, for glows and shadows. */
export const accentRgba = (a: number) => {
  const n = parseInt(customerBrand.accent.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};
