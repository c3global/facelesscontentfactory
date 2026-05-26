import { supabase } from './supabase.js';
import { PLATFORMS } from './platforms.js';

async function authHeader() {
  const { data: { session } } = await supabase.auth.getSession();
  return session ? { Authorization: `Bearer ${session.access_token}` } : {};
}

export async function generatePlatform(niche, platform) {
  const res = await fetch('/.netlify/functions/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(await authHeader()) },
    body: JSON.stringify({ niche, platform }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Generation failed (${platform}): ${t}`);
  }
  return res.json();
}

export async function generateAll(niche, onPlatformReady) {
  const results = {};
  await Promise.all(
    PLATFORMS.map(async (p) => {
      try {
        const data = await generatePlatform(niche, p.id);
        results[p.id] = data;
        onPlatformReady?.(p.id, data, null);
      } catch (err) {
        results[p.id] = { error: err.message };
        onPlatformReady?.(p.id, null, err.message);
      }
    })
  );
  return results;
}

export async function savePlan(niche, payload) {
  const res = await fetch('/.netlify/functions/save-plan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(await authHeader()) },
    body: JSON.stringify({ niche, payload }),
  });
  if (!res.ok) throw new Error('Failed to save plan');
  return res.json();
}

export async function listPlans() {
  const { data, error } = await supabase
    .from('plans')
    .select('id, niche, created_at')
    .order('created_at', { ascending: false })
    .limit(30);
  if (error) throw error;
  return data;
}

export async function getPlan(id) {
  const { data, error } = await supabase
    .from('plans')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}
