// Deterministic 16-cell "beat signature" generated from a string seed.
// Each brand wears the same pattern everywhere in the UI — the visual
// equivalent of its name. Same seed → same pattern, every render.
//
// 16 cells = 1 bar of 16th notes in 4/4 time. We keep density in a healthy
// 5–11 range so patterns never come out blank or completely full.

export function beatPattern(seed) {
  const s = String(seed || '');
  if (!s) return new Array(16).fill(false);

  const cells = hashToCells(stringHash(s));

  // Re-salt up to a few times if density is degenerate. Avoids "all on" or
  // "all off" patterns from unlucky short seeds.
  let lit = countLit(cells);
  let salt = 1;
  while ((lit < 5 || lit > 11) && salt <= 8) {
    const salted = hashToCells(stringHash(s + ':' + salt));
    for (let i = 0; i < 16; i++) cells[i] = salted[i];
    lit = countLit(cells);
    salt++;
  }
  return cells;
}

function stringHash(s) {
  // FNV-1a 32-bit. Fine for our needs (visual variety, not security).
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function hashToCells(h) {
  // Spread 16 bits across the pattern, XOR-folding upper bits so similar
  // short strings produce visually different patterns.
  const cells = new Array(16);
  for (let i = 0; i < 16; i++) {
    cells[i] = (((h >>> i) ^ (h >>> ((i + 8) & 31))) & 1) === 1;
  }
  return cells;
}

function countLit(cells) {
  let n = 0;
  for (let i = 0; i < cells.length; i++) if (cells[i]) n++;
  return n;
}
