-- Cadence v3: per-user brand content samples (the "voice training" pieces).
-- Stores actual past content the creator has published; their text is
-- injected into generation prompts as few-shot examples so output mirrors
-- the user's real voice, sentence rhythms, and structural patterns.
--
-- Source types are informational only — the trainer reads `content` directly
-- regardless of where the text originated.

create table if not exists public.brand_samples (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  label       text not null default '',
  content     text not null default '',
  source_type text not null default 'paste'
                check (source_type in ('paste', 'txt', 'md', 'docx', 'pdf', 'url', 'social')),
  char_count  integer not null default 0,
  archived    boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists brand_samples_user_idx
  on public.brand_samples (user_id, archived, created_at desc);

alter table public.brand_samples enable row level security;

drop policy if exists "brand_samples owner read"   on public.brand_samples;
create policy "brand_samples owner read" on public.brand_samples
  for select using (auth.uid() = user_id);

drop policy if exists "brand_samples owner insert" on public.brand_samples;
create policy "brand_samples owner insert" on public.brand_samples
  for insert with check (auth.uid() = user_id);

drop policy if exists "brand_samples owner update" on public.brand_samples;
create policy "brand_samples owner update" on public.brand_samples
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "brand_samples owner delete" on public.brand_samples;
create policy "brand_samples owner delete" on public.brand_samples
  for delete using (auth.uid() = user_id);
