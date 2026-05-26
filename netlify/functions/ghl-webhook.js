import { adminClient } from './lib/supabase-admin.js';

// Expected POST body (GHL workflow custom webhook):
// { event: "add" | "remove", email: "...", contact_id: "...", first_name: "..." }
export async function handler(event) {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method not allowed' };

  const secret = event.headers['x-webhook-secret'] || event.headers['X-Webhook-Secret'];
  if (!secret || secret !== process.env.GHL_WEBHOOK_SECRET) {
    return { statusCode: 401, body: 'Unauthorized' };
  }

  let body;
  try { body = JSON.parse(event.body || '{}'); }
  catch { return { statusCode: 400, body: 'Invalid JSON' }; }

  const action = (body.event || body.action || '').toLowerCase();
  const email = (body.email || '').trim().toLowerCase();
  const ghlContactId = body.contact_id || body.contactId || null;

  if (!email) return { statusCode: 400, body: 'Missing email' };
  if (!['add', 'added', 'remove', 'removed', 'cancel', 'cancelled'].includes(action)) {
    return { statusCode: 400, body: 'Unknown event' };
  }

  const admin = adminClient();
  const isAdd = action === 'add' || action === 'added';

  if (isAdd) {
    await admin.from('members').upsert({
      email,
      ghl_contact_id: ghlContactId,
      status: 'active',
      joined_at: new Date().toISOString(),
      cancelled_at: null,
    }, { onConflict: 'email' });

    // Ensure an auth.users row exists so magic-link sign-in works.
    const { data: existing } = await admin.auth.admin.listUsers({ page: 1, perPage: 1 });
    const found = existing?.users?.find?.((u) => u.email === email);
    if (!found) {
      const { error: createErr } = await admin.auth.admin.createUser({
        email, email_confirm: true,
      });
      if (createErr && !/already.*registered|exists/i.test(createErr.message)) {
        return { statusCode: 500, body: createErr.message };
      }
    } else if (found.banned_until) {
      // Reactivating a previously cancelled member
      await admin.auth.admin.updateUserById(found.id, { ban_duration: 'none' });
    }
  } else {
    await admin.from('members').update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
    }).eq('email', email);

    // Find user and ban them so they can't sign in anymore.
    const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const user = list?.users?.find?.((u) => u.email === email);
    if (user) {
      await admin.auth.admin.updateUserById(user.id, { ban_duration: '876600h' }); // ~100 years
    }
  }

  return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ok: true, email, action }) };
}
