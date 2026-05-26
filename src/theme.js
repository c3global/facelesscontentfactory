// Cadence — brand tokens.
// Source of truth for component logic. CSS variables in index.css mirror these
// values and handle light/dark switching at the document level.
//
// Brand palette:
//   eggshell    canvas (light mode)
//   midnight    canvas (dark mode) / primary text (light mode)
//   aquamarine  primary action / CTA
//   copper      warm accent — used as a gradient in headlines & the wordmark
//   slate       borders, dividers, secondary text
//
// The copper gradient is the signature accent that ties Cadence visually back
// to its parent brand, C3 Global, whose headlines use the same treatment.

export const palette = {
  eggshell:      '#F9F6EF',
  eggshellSoft:  '#F3EFE6',
  midnight:      '#0B1733',
  midnightLift:  '#162043',
  midnightDeep:  '#070F23',
  aquamarine:    '#66F1D9',
  aquamarineDeep:'#3FCFB6',
  copperLight:   '#D9C0A6',
  copperMid:     '#C29B7E',
  copperDeep:    '#A6604C',
  slate:         '#64748B',
  slateMuted:    '#94A3B8',
  slateDeep:     '#475569',
  danger:        '#E5484D',
  success:       '#66F1D9', // aquamarine doubles as success
};

export const copperGradient = `linear-gradient(90deg, ${palette.copperDeep} 0%, ${palette.copperMid} 45%, ${palette.copperLight} 100%)`;

export const radius = { sm: '8px', md: '12px', lg: '16px', xl: '20px', pill: '999px' };
export const space  = (n) => `${n * 4}px`;

export const fonts = {
  display: '"Fraunces", Georgia, serif',
  ui:      '"Sofia Sans Extra Condensed", "Sofia Sans", system-ui, sans-serif',
  body:    '"Sofia Sans", system-ui, -apple-system, sans-serif',
};

// Light & dark token maps. Components should prefer CSS variables (`var(--bg)`)
// over importing these directly; both refer to the same values.
export const lightTokens = {
  bg:           palette.eggshell,
  bgSoft:       palette.eggshellSoft,
  surface:      '#FFFFFF',
  surfaceAlt:   palette.eggshellSoft,
  border:       'rgba(100, 116, 139, 0.18)',
  borderStrong: 'rgba(100, 116, 139, 0.35)',
  text:         palette.midnight,
  textMuted:    palette.slateDeep,
  textFaint:    palette.slate,
  primary:      palette.aquamarineDeep,
  primaryHover: '#34B8A0',
  primaryText:  palette.midnight,
  accent:       palette.copperDeep,
};

export const darkTokens = {
  bg:           palette.midnight,
  bgSoft:       palette.midnightDeep,
  surface:      palette.midnightLift,
  surfaceAlt:   '#1D2A55',
  border:       'rgba(148, 163, 184, 0.18)',
  borderStrong: 'rgba(148, 163, 184, 0.35)',
  text:         palette.eggshell,
  textMuted:    palette.slateMuted,
  textFaint:    palette.slate,
  primary:      palette.aquamarine,
  primaryHover: '#7FF5E0',
  primaryText:  palette.midnight,
  accent:       palette.copperLight,
};
