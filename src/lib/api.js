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
