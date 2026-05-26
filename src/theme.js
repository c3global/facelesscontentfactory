// C3 Global brand palette — midnight blue, metallic rose gold, mint green, white.
export const colors = {
  bg: '#0B1638',          // deep midnight blue
  bgElevated: '#10204D',  // slightly lighter for cards
  surface: '#152759',     // card surfaces
  surfaceHover: '#1B3070',
  border: '#26407A',
  borderMuted: '#1A2E5C',
  roseGold: '#C9956C',    // wordmark + primary accent
  roseGoldDeep: '#A87850',
  mint: '#A8E0C4',        // success / approved
  mintDeep: '#5FB590',
  white: '#FFFFFF',
  text: '#F2F4FB',
  textMuted: '#94A3C8',
  textFaint: '#637098',
  ctaRed: '#C41A18',      // kept for destructive only
  danger: '#FF6B6B',
};

export const radius = { sm: '8px', md: '12px', lg: '20px', pill: '999px' };
export const space = (n) => `${n * 4}px`;

export const fonts = {
  display: '"Fraunces", "Playfair Display", Georgia, serif',
  body: '"Inter", system-ui, -apple-system, sans-serif',
};
