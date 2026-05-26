import Anthropic from '@anthropic-ai/sdk';

export const MODEL = 'claude-opus-4-7';

export function client() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

export function parseJsonFromResponse(text) {
  // Strip code fences if present
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '');
  // Find the first { and last } to be resilient to preamble/postscript
  const first = cleaned.indexOf('{');
  const last = cleaned.lastIndexOf('}');
  if (first === -1 || last === -1) throw new Error('No JSON object found in response');
  return JSON.parse(cleaned.slice(first, last + 1));
}
