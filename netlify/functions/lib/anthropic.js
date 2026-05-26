import Anthropic from '@anthropic-ai/sdk';

export const MODELS = {
  ideas: 'claude-haiku-4-5-20251001',
  content: 'claude-sonnet-4-6',
  premium: 'claude-opus-4-7',
};

// Anthropic public pricing (USD per million tokens) — used for cost estimates in analytics.
// These are tracked server-side only; UI doesn't trust them as billing.
export const PRICING = {
  'claude-haiku-4-5-20251001': { input: 1.00, output: 5.00 },
  'claude-sonnet-4-6': { input: 3.00, output: 15.00 },
  'claude-opus-4-7': { input: 15.00, output: 75.00 },
};

export function client() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

export function estimateCostCents(model, usage) {
  const p = PRICING[model];
  if (!p || !usage) return 0;
  const cost =
    (usage.input_tokens || 0) * (p.input / 1_000_000) +
    (usage.output_tokens || 0) * (p.output / 1_000_000);
  return Math.round(cost * 10000) / 100; // cents, 2 decimals
}

export function parseJsonFromResponse(text) {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '');
  const first = cleaned.indexOf('{');
  const last = cleaned.lastIndexOf('}');
  if (first === -1 || last === -1) throw new Error('No JSON object found in response');
  return JSON.parse(cleaned.slice(first, last + 1));
}
