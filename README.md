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

**Three-step flow (plan → approve → write):**

1. **Plan** — user picks niche + platforms.
2. **Ideas pass (cheap)** — `/.netlify/functions/generate-ideas` runs **Claude Haiku 4.5** once per selected platform in parallel. Returns 30 idea cards (title + one-line angle) each. Typical cost: pennies for a full niche, all platforms.
3. **Approve** — user reviews idea cards, approves the keepers, regenerates individual ones they don't like (Haiku, cheap).
4. **Write pass** — `/.netlify/functions/generate-content` runs **Claude Sonnet 4.6** once per approved idea (concurrency 4). Only writes what was approved. Opus is an opt-in "Premium" toggle. Typical cost: a dime to a dollar per fully-written month.
5. **History** — once writing finishes the merged payload is saved to `plans`. The History drawer replays plans for free.
6. **Analytics** — every Anthropic call writes one `generation_events` row with model + token-derived cost. `/admin` shows daily generations, total $ spent, error rate, and top niches.

**Why this matters vs. one-shot Opus generation:** the old one-shot Opus flow cost ~$10–13 per full month per user — unsustainable for a $27/mo product. The new flow is ~50–100x cheaper while letting the user curate quality before paying for the long-form writing.

## Migration

If you previously ran the v1 (Opus, one-shot) version, run `supabase/migrations/0002_two_phase.sql` in the SQL editor to add `phase`, `model`, and `cost_cents` columns and refresh the `admin_stats` RPC.
