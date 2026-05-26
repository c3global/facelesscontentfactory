-- Cadence v2: per-user brand voice settings.
-- Captures the user's default niche, voice descriptors, signature CTA, and
-- banned phrases. These feed into generation prompts so every plan and piece
-- Cadence writes sounds like the user, not the model.
--
-- Also adds an `updated_at` column to `plans` so the editor can write changes
-- back without losing creation timestamps.

create table if not exists public.brand_settings (
  user_id        uuid primary key references auth.users(id) on delete cascade,
  default_niche  text not null default '',
  voice_tags     text[] not null default '{}',
  voice_notes    text not null default '',
  signature_cta  text not null default '',
  banned_phrases text not null default '',
  updated_at     timestamptz not null default now()
);

alter table public.brand_settings enable row level security;

drop policy if exists "brand_settings owner read" on public.brand_settings;
create policy "brand_settings owner read" on public.brand_settings
  for select using (auth.uid() = user_id);

drop policy if exists "brand_settings owner upsert" on public.brand_settings;
create policy "brand_settings owner upsert" on public.brand_settings
  for insert with check (auth.uid() = user_id);

drop policy if exists "brand_settings owner update" on public.brand_settings;
create policy "brand_settings owner update" on public.brand_settings
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Add updated_at to plans for editor writebacks
alter table public.plans
  add column if not exists updated_at timestamptz not null default now();

drop policy if exists "plans owner update" on public.plans;
create policy "plans owner update" on public.plans
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
