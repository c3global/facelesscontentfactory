import { client, MODEL, parseJsonFromResponse } from './lib/anthropic.js';
import { adminClient, requireUser } from './lib/supabase-admin.js';
import { PROMPTS } from './lib/prompts.js';

export async function handler(event) {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method not allowed' };

  const auth = await requireUser(event);
  if (auth.error) return auth.error;

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' };
  }
  const { niche, platform } = body;
  if (!niche || typeof niche !== 'string') return { statusCode: 400, body: 'Missing niche' };
  if (!platform || !PROMPTS[platform]) return { statusCode: 400, body: 'Invalid platform' };

  const admin = adminClient();
  const start = Date.now();
  let status = 'ok';
  let result;

  try {
    const anthropic = client();
    const prompt = PROMPTS[platform](niche.trim());
    const msg = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 16000,
      messages: [{ role: 'user', content: prompt }],
    });
    const text = msg.content.map((c) => (c.type === 'text' ? c.text : '')).join('');
    result = parseJsonFromResponse(text);
  } catch (err) {
    status = 'error';
    await logEvent(admin, auth.user.id, platform, niche, status, Date.now() - start);
    return { statusCode: 500, body: err.message };
  }

  await logEvent(admin, auth.user.id, platform, niche, status, Date.now() - start);

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(result),
  };
}

async function logEvent(admin, userId, platform, niche, status, durationMs) {
  try {
    await admin.from('generation_events').insert({
      user_id: userId,
      platform,
      niche,
      status,
      duration_ms: durationMs,
    });
  } catch (e) {
    console.warn('logEvent failed', e.message);
  }
}
