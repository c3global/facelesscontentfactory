// POST { niche, platform, regenerateDay?, avoidTitles? }
// Returns either { items: [...] } (full 30) or { item: {...} } (single regen).
// Model: Haiku (cheap, fast).

import { client, MODELS, estimateCostCents, parseJsonFromResponse } from './lib/anthropic.js';
import { adminClient, requireUser } from './lib/supabase-admin.js';
import { IDEAS_PROMPTS, regenerateIdeaPrompt } from './lib/prompts.js';

export async function handler(event) {
  if (event.httpMethod !== 'POST') return resp(405, 'Method not allowed');

  const auth = await requireUser(event);
  if (auth.error) return auth.error;

  let body;
  try { body = JSON.parse(event.body || '{}'); }
  catch { return resp(400, 'Invalid JSON'); }

  const { niche, platform, regenerateDay, avoidTitles } = body;
  if (!niche || typeof niche !== 'string') return resp(400, 'Missing niche');
  if (!platform || !IDEAS_PROMPTS[platform]) return resp(400, 'Invalid platform');

  const isRegen = Number.isInteger(regenerateDay);
  const prompt = isRegen
    ? regenerateIdeaPrompt(niche.trim(), platform, regenerateDay, avoidTitles || [])
    : IDEAS_PROMPTS[platform](niche.trim());

  const admin = adminClient();
  const start = Date.now();
  let status = 'ok';
  let result, usage;

  try {
    const anthropic = client();
    const msg = await anthropic.messages.create({
      model: MODELS.ideas,
      max_tokens: 3000,
      messages: [{ role: 'user', content: prompt }],
    });
    usage = msg.usage;
    const text = msg.content.map((c) => (c.type === 'text' ? c.text : '')).join('');
    result = parseJsonFromResponse(text);
  } catch (err) {
    status = 'error';
    await logEvent(admin, auth.user.id, 'ideas', platform, niche, status, Date.now() - start, MODELS.ideas, null);
    return resp(500, err.message);
  }

  const cents = estimateCostCents(MODELS.ideas, usage);
  await logEvent(admin, auth.user.id, 'ideas', platform, niche, status, Date.now() - start, MODELS.ideas, cents);

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(isRegen ? { item: result } : result),
  };
}

async function logEvent(admin, userId, phase, platform, niche, status, duration_ms, model, cost_cents) {
  try {
    await admin.from('generation_events').insert({
      user_id: userId, phase, platform, niche, status, duration_ms, model, cost_cents,
    });
  } catch (e) { console.warn('logEvent', e.message); }
}

function resp(statusCode, body) { return { statusCode, body }; }
