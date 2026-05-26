// Distinct accents for each platform so the editor's list rail and approve
// tabs are immediately scannable. Tuned to be readable on both eggshell and
// midnight backgrounds.
export const PLATFORMS = [
  { id: 'youtube',  label: 'YouTube',         icon: '▶',  accent: '#E53935' },  // YouTube red
  { id: 'shorts',   label: 'Shorts / Reels',  icon: '✦',  accent: '#9C27B0' },  // purple — distinct from substack
  { id: 'linkedin', label: 'LinkedIn',        icon: 'in', accent: '#0A66C2' },  // LinkedIn blue
  { id: 'substack', label: 'Substack / Blog', icon: '✎',  accent: '#FF6719' },  // Substack orange
  { id: 'social',   label: 'IG / FB',         icon: '◉',  accent: '#E1306C' },  // Instagram pink
  { id: 'text',     label: 'X / Threads',     icon: '✕',  accent: '#1F2937' },  // near-black, X-feel
];

export const PLATFORM_MAP = Object.fromEntries(PLATFORMS.map((p) => [p.id, p]));
