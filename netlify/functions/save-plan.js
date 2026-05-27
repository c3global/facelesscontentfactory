import { adminClient, requireUser } from './lib/supabase-admin.js';

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
  const { niche, payload, brand_id } = body;
  if (!niche || !payload) return { statusCode: 400, body: 'Missing niche or payload' };
  if (!brand_id) return { statusCode: 400, body: 'Missing brand_id' };

  const admin = adminClient();

  // Defense in depth: verify the brand belongs to the caller before writing.
  const { data: brand, error: brandErr } = await admin
    .from('brands')
    .select('id, user_id')
    .eq('id', brand_id)
    .single();
  if (brandErr || !brand || brand.user_id !== auth.user.id) {
    return { statusCode: 403, body: 'Brand does not belong to caller' };
  }

  const { data, error } = await admin
    .from('plans')
    .insert({ user_id: auth.user.id, brand_id, niche, payload })
    .select('id')
    .single();

  if (error) return { statusCode: 500, body: error.message };

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: data.id }),
  };
}
