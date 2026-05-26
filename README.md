# Cadence

30-day multi-platform content planner **and generator** for C3 Global's Faceless Content Collective.
One niche in → 30 days of fully-written, ready-to-post content for YouTube, Shorts/Reels, LinkedIn, Blog, Substack, IG/FB, and X/Threads.

- **Stack:** React 18 + Vite, Netlify Functions, Anthropic SDK (`claude-opus-4-7`), Supabase (auth + Postgres).
- **Auth:** Magic-link email, gated by member allowlist synced from GoHighLevel.
- **Hosted at:** `cadence.c3global.co` (Netlify custom subdomain).

## Local development

```bash
npm install
cp .env.example .env   # fill in keys, then export them or use `netlify env:set`
npx netlify dev        # runs Vite + Functions at http://localhost:8888
```

You need a working Supabase project and an Anthropic API key.

## Required env vars

| Var | Where | Notes |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | Netlify (server) | Server-only, no `VITE_` prefix. |
| `SUPABASE_URL` | Netlify (server) | Supabase project URL. |
| `SUPABASE_SERVICE_ROLE_KEY` | Netlify (server) | **Never expose to browser.** |
| `GHL_WEBHOOK_SECRET` | Netlify (server) | Shared secret with the GHL workflow. |
| `VITE_SUPABASE_URL` | Netlify (build) | Same value as `SUPABASE_URL`, exposed to client. |
| `VITE_SUPABASE_ANON_KEY` | Netlify (build) | Supabase anon key — safe to ship. |

## Supabase setup

1. Create a Supabase project.
2. Run `supabase/migrations/0001_init.sql` in the SQL editor (or via Supabase CLI). This creates the `members`, `plans`, and `generation_events` tables, RLS policies, and the `admin_stats` RPC.
3. Enable **Email** auth provider. Magic-link is on by default; set the site URL to your domain.
4. Deploy the `before-user-created` Edge Function and register it as a **Before User Created** Auth Hook (Supabase Dashboard → Authentication → Hooks). This blocks signups for emails not on the active member list.
5. Promote yourself to admin: `update public.members set role='admin' where email='you@example.com';`

## GHL webhook

In your GoHighLevel workflows for "Contact added to community" and "Contact removed/cancelled", add a **Webhook** action:

- URL: `https://cadence.c3global.co/.netlify/functions/ghl-webhook`
- Method: `POST`
- Header: `X-Webhook-Secret: <your GHL_WEBHOOK_SECRET>`
- Body (JSON):
  ```json
  { "event": "add", "email": "{{contact.email}}", "contact_id": "{{contact.id}}" }
  ```
  Use `"event": "remove"` for the cancellation workflow.

## Initial member backfill

Export your current members from GHL as a CSV with at minimum an `email` column (and optionally `contact_id`), then:

```bash
SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npm run backfill -- ./members.csv
```

## Deploy

1. Connect this repo to Netlify, branch `claude/intelligent-babbage-y1S5G` (or `main` once merged).
2. Set the env vars above in **Site settings → Environment variables**.
3. Add `cadence.c3global.co` as a custom domain (CNAME → Netlify).
4. Verify in browser devtools that `ANTHROPIC_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` do **not** appear in any network request or bundle.

## Architecture notes

- **No single-shot generation.** Fully-written content for 7 platforms × 30 days far exceeds one Opus response. The client fires 7 parallel `POST /.netlify/functions/generate?platform=...` calls, each generating one platform. Tabs populate progressively.
- **History.** When all 7 succeed, the client POSTs the merged payload to `/.netlify/functions/save-plan`, which inserts a row into `plans`. The History drawer lists the user's last 30 plans and replays them from cache (no re-spend).
- **Analytics.** Every per-platform call writes one `generation_events` row (success/error + duration). `/admin` calls the `admin_stats` RPC, which is `security definer` and checks `is_admin()`.
