// POST { niche, platform, idea } — one approved idea at a time.
// Returns the fully-written content piece for that idea.
// Model: Sonnet (default) — Opus opt-in via { premium: true }.

import { client, MODELS, estimateCostCents, parseJsonFromResponse } from './lib/anthropic.js';
import { adminClient, requireUser } from './lib/supabase-admin.js';
import { CONTENT_PROMPTS } from './lib/prompts.js';

export async function handler(event) {
  if (event.httpMethod !== 'POST') return resp(405, 'Method not allowed');

  const auth = await requireUser(event);
  if (auth.error) return auth.error;

  let body;
  try { body = JSON.parse(event.body || '{}'); }
  catch { return resp(400, 'Invalid JSON'); }

  const { niche, platform, idea, premium } = body;
  if (!niche || typeof niche !== 'string') return resp(400, 'Missing niche');
  if (!platform || !CONTENT_PROMPTS[platform]) return resp(400, 'Invalid platform');
  if (!idea?.title || !idea?.day) return resp(400, 'Missing idea');

  const admin = adminClient();
  const brand = await getBrand(admin, auth.user.id);

  const model = premium ? MODELS.premium : MODELS.content;
  const prompt = CONTENT_PROMPTS[platform](niche.trim(), idea, brand);

  // Long-form pieces (substack/blog, youtube scripts) need more headroom so the
  // JSON doesn't get truncated mid-string. Short pieces stay capped to keep
  // generation snappy.
  const isLongForm = platform === 'substack' || platform === 'youtube';
  const maxTokens = isLongForm ? 8000 : 4000;

  const start = Date.now();
  let status = 'ok';
  let result, usage;

  try {
    const anthropic = client();
    const msg = await anthropic.messages.create({
      model,
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    });
    usage = msg.usage;
    const text = msg.content.map((c) => (c.type === 'text' ? c.text : '')).join('');
    result = parseJsonFromResponse(text);
  } catch (err) {
    status = 'error';
    await logEvent(admin, auth.user.id, 'content', platform, niche, status, Date.now() - start, model, null);
    return resp(500, err.message);
  }

  const cents = estimateCostCents(model, usage);
  await logEvent(admin, auth.user.id, 'content', platform, niche, status, Date.now() - start, model, cents);

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(result),
  };
}

async function logEvent(admin, userId, phase, platform, niche, status, duration_ms, model, cost_cents) {
  try {
    await admin.from('generation_events').insert({
      user_id: userId, phase, platform, niche, status, duration_ms, model, cost_cents,
    });
  } catch (e) { console.warn('logEvent', e.message); }
}

async function getBrand(admin, userId) {
  try {
    const { data } = await admin
      .from('brand_settings')
      .select('voice_tags, voice_notes, signature_cta, banned_phrases')
      .eq('user_id', userId)
      .maybeSingle();
    return data || null;
  } catch (e) { console.warn('getBrand', e.message); return null; }
}

function resp(statusCode, body) { return { statusCode, body }; }
