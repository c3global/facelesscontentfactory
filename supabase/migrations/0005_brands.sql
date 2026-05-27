-- Cadence v4: multi-brand support.
--
-- A user can manage multiple brands, each with its own voice, samples, and
-- plans. Existing single-brand data is migrated into a per-user "default
-- brand" so nothing breaks.
--
-- This migration is purely additive: every existing column and policy stays
-- intact, brand_id is added as nullable + backfilled, and follow-up
-- migrations can tighten constraints once UI ships.

-- ---------------------------------------------------------------------------
-- brands table
-- ---------------------------------------------------------------------------

create table if not exists public.brands (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  name         text not null default 'My brand',
  accent_color text not null default '#D9C0A6',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists brands_user_idx
  on public.brands (user_id, created_at asc);

alter table public.brands enable row level security;

drop policy if exists "brands owner read"   on public.brands;
create policy "brands owner read" on public.brands
  for select using (auth.uid() = user_id);

drop policy if exists "brands owner insert" on public.brands;
create policy "brands owner insert" on public.brands
  for insert with check (auth.uid() = user_id);

drop policy if exists "brands owner update" on public.brands;
create policy "brands owner update" on public.brands
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "brands owner delete" on public.brands;
create policy "brands owner delete" on public.brands
  for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Add brand_id (nullable) to the three brand-scoped tables
-- ---------------------------------------------------------------------------

alter table public.plans
  add column if not exists brand_id uuid references public.brands(id) on delete cascade;

alter table public.brand_settings
  add column if not exists brand_id uuid references public.brands(id) on delete cascade;

alter table public.brand_samples
  add column if not exists brand_id uuid references public.brands(id) on delete cascade;

-- ---------------------------------------------------------------------------
-- Backfill: every user with existing data gets one default brand, named from
-- brand_settings.default_niche when available, else "My brand". All their
-- existing plans/settings/samples are pointed at that brand.
-- ---------------------------------------------------------------------------

do $$
declare
  uid uuid;
  bid uuid;
  bname text;
begin
  for uid in
    select distinct user_id from (
      select user_id from public.plans
      union
      select user_id from public.brand_settings
      union
      select user_id from public.brand_samples
    ) all_users
    where user_id is not null
  loop
    -- Skip if user already has a brand (rerun safety)
    select id into bid from public.brands where user_id = uid limit 1;
    if bid is null then
      select coalesce(nullif(trim(default_niche), ''), 'My brand') into bname
        from public.brand_settings where user_id = uid limit 1;
      if bname is null then bname := 'My brand'; end if;
      insert into public.brands (user_id, name) values (uid, bname)
        returning id into bid;
    end if;

    update public.plans          set brand_id = bid where user_id = uid and brand_id is null;
    update public.brand_settings set brand_id = bid where user_id = uid and brand_id is null;
    update public.brand_samples  set brand_id = bid where user_id = uid and brand_id is null;
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Indexes for brand-scoped queries
-- ---------------------------------------------------------------------------

create index if not exists plans_brand_idx
  on public.plans (brand_id, created_at desc);

create index if not exists brand_samples_brand_idx
  on public.brand_samples (brand_id, archived, created_at desc);

create index if not exists brand_settings_brand_idx
  on public.brand_settings (brand_id);
