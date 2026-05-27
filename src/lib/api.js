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

export function savePlan(brandId, niche, payload) {
  return post('/.netlify/functions/save-plan', { brand_id: brandId, niche, payload });
}

export function fetchUrlAsText(url) {
  return post('/.netlify/functions/fetch-url', { url });
}

export async function listPlans(brandId) {
  let q = supabase
    .from('plans')
    .select('id, niche, created_at')
    .order('created_at', { ascending: false })
    .limit(30);
  if (brandId) q = q.eq('brand_id', brandId);
  const { data, error } = await q;
  if (error) throw error;
  return data;
}

export async function getPlan(id) {
  const { data, error } = await supabase.from('plans').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function getBrandSettings(brandId) {
  if (!brandId) return null;
  const { data, error } = await supabase
    .from('brand_settings')
    .select('default_niche, voice_tags, voice_notes, signature_cta, banned_phrases')
    .eq('brand_id', brandId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function saveBrandSettings(brandId, settings) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not signed in');
  if (!brandId) throw new Error('No active brand to save settings into');
  const payload = {
    brand_id: brandId,
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
    .upsert(payload, { onConflict: 'brand_id' })
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

// ---------------------------------------------------------------------------
// Brand samples (content the model learns the user's voice from)
// ---------------------------------------------------------------------------

export async function listSamples(brandId) {
  if (!brandId) return [];
  const { data, error } = await supabase
    .from('brand_samples')
    .select('id, label, content, source_type, char_count, created_at')
    .eq('brand_id', brandId)
    .eq('archived', false)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function addSample({ brandId, label, content, source_type = 'paste' }) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not signed in');
  if (!brandId) throw new Error('No active brand to attach sample to');
  const text = (content || '').trim();
  if (!text) throw new Error('Sample is empty');
  const { data, error } = await supabase
    .from('brand_samples')
    .insert({
      user_id: session.user.id,
      brand_id: brandId,
      label: (label || '').trim() || 'Untitled sample',
      content: text,
      source_type,
      char_count: text.length,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateSample(id, patch) {
  const updates = { ...patch, updated_at: new Date().toISOString() };
  if (typeof updates.content === 'string') updates.char_count = updates.content.trim().length;
  const { data, error } = await supabase
    .from('brand_samples')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteSample(id) {
  const { error } = await supabase.from('brand_samples').delete().eq('id', id);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Brands (multi-brand support: a user can own multiple brands; samples,
// settings, and plans are scoped per brand)
// ---------------------------------------------------------------------------

export async function listBrands() {
  const { data, error } = await supabase
    .from('brands')
    .select('id, name, accent_color, created_at, updated_at')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function createBrand({ name, accent_color }) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not signed in');
  const { data, error } = await supabase
    .from('brands')
    .insert({
      user_id: session.user.id,
      name: (name || '').trim() || 'New brand',
      accent_color: accent_color || '#D9C0A6',
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateBrand(id, patch) {
  const updates = { ...patch, updated_at: new Date().toISOString() };
  const { data, error } = await supabase
    .from('brands')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteBrand(id) {
  const { error } = await supabase.from('brands').delete().eq('id', id);
  if (error) throw error;
}
