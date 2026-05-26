import { supabase } from './supabase.js';

async function authHeader() {
  const { data: { session } } = await supabase.auth.getSession();
  return session ? { Authorization: `Bearer ${session.access_token}` } : {};
}

async function post(path, body) {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(await authHeader()) },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || `Request failed: ${res.status}`);
  }
  return res.json();
}

export function generateIdeas(niche, platform) {
  return post('/.netlify/functions/generate-ideas', { niche, platform });
}

export function regenerateIdea(niche, platform, day, avoidTitles) {
  return post('/.netlify/functions/generate-ideas', { niche, platform, regenerateDay: day, avoidTitles });
}

export function generateContent(niche, platform, idea, premium = false) {
  return post('/.netlify/functions/generate-content', { niche, platform, idea, premium });
}

export function savePlan(niche, payload) {
  return post('/.netlify/functions/save-plan', { niche, payload });
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
  const { data, error } = await supabase.from('plans').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function getBrandSettings() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not signed in');
  const { data, error } = await supabase
    .from('brand_settings')
    .select('default_niche, voice_tags, voice_notes, signature_cta, banned_phrases')
    .eq('user_id', session.user.id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function saveBrandSettings(settings) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not signed in');
  const payload = {
    user_id: session.user.id,
    default_niche: settings.default_niche ?? '',
    voice_tags:    settings.voice_tags ?? [],
    voice_notes:   settings.voice_notes ?? '',
    signature_cta: settings.signature_cta ?? '',
    banned_phrases: settings.banned_phrases ?? '',
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await supabase
    .from('brand_settings')
    .upsert(payload, { onConflict: 'user_id' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updatePlanContent(id, payload) {
  const { data, error } = await supabase
    .from('plans')
    .update({ payload, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}
