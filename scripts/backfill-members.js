// Usage: node scripts/backfill-members.js path/to/ghl-export.csv
// CSV must include columns: email[, contact_id, first_name]
// Requires env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const file = process.argv[2];
if (!file) {
  console.error('Usage: node scripts/backfill-members.js <csv-path>');
  process.exit(1);
}

const csv = readFileSync(file, 'utf8').trim();
const [header, ...rows] = csv.split(/\r?\n/);
const cols = header.split(',').map((s) => s.trim().toLowerCase());
const emailIdx = cols.indexOf('email');
const idIdx = cols.indexOf('contact_id');
if (emailIdx === -1) { console.error('CSV missing "email" column'); process.exit(1); }

const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

let added = 0, skipped = 0, failed = 0;
for (const row of rows) {
  const cells = row.split(',').map((s) => s.trim());
  const email = (cells[emailIdx] || '').toLowerCase();
  const contactId = idIdx >= 0 ? cells[idIdx] : null;
  if (!email) { skipped++; continue; }

  const { error: upErr } = await admin.from('members').upsert({
    email, ghl_contact_id: contactId, status: 'active', joined_at: new Date().toISOString(),
  }, { onConflict: 'email' });
  if (upErr) { console.error(email, upErr.message); failed++; continue; }

  const { error: createErr } = await admin.auth.admin.createUser({ email, email_confirm: true });
  if (createErr && !/already.*registered|exists/i.test(createErr.message)) {
    console.error(email, createErr.message); failed++; continue;
  }
  added++;
}

console.log({ added, skipped, failed, total: rows.length });
