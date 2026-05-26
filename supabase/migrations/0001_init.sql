-- Cadence: members allowlist, plans, generation events, admin RPC.

create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  ghl_contact_id text,
  status text not null default 'active' check (status in ('active','cancelled')),
  role text not null default 'member' check (role in ('member','admin')),
  joined_at timestamptz not null default now(),
  cancelled_at timestamptz
);

create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  niche text not null,
  payload jsonb not null,
  created_at timestamptz not null default now()
);
create index if not exists plans_user_created_idx on public.plans (user_id, created_at desc);

create table if not exists public.generation_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  platform text not null,
  niche text,
  status text not null,
  duration_ms int,
  created_at timestamptz not null default now()
);
create index if not exists gen_events_created_idx on public.generation_events (created_at desc);

-- RLS
alter table public.plans enable row level security;
alter table public.generation_events enable row level security;
alter table public.members enable row level security;

drop policy if exists "plans owner read" on public.plans;
create policy "plans owner read" on public.plans
  for select using (auth.uid() = user_id);

drop policy if exists "plans owner insert" on public.plans;
create policy "plans owner insert" on public.plans
  for insert with check (auth.uid() = user_id);

-- generation_events: no client access; only service role writes/reads.
-- members: no client access; webhook + admin RPC use service role.

-- Admin helper: is the signed-in user an admin?
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.members m
    join auth.users u on lower(u.email) = lower(m.email)
    where u.id = auth.uid() and m.role = 'admin' and m.status = 'active'
  );
$$;

-- Admin stats RPC (callable by signed-in admin members)
create or replace function public.admin_stats()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  result jsonb;
begin
  if not public.is_admin() then
    raise exception 'permission denied';
  end if;

  select jsonb_build_object(
    'active_members', (select count(*) from public.members where status = 'active'),
    'gens_7d', (select count(*) from public.generation_events where created_at > now() - interval '7 days'),
    'gens_30d', (select count(*) from public.generation_events where created_at > now() - interval '30 days'),
    'error_rate_7d', coalesce((
      select round(
        sum(case when status = 'error' then 1 else 0 end)::numeric
        / nullif(count(*), 0)::numeric, 4
      )
      from public.generation_events where created_at > now() - interval '7 days'
    ), 0),
    'per_day', coalesce((
      select jsonb_agg(jsonb_build_object('day', to_char(d, 'MM-DD'), 'count', cnt) order by d)
      from (
        select date_trunc('day', created_at)::date as d, count(*) as cnt
        from public.generation_events
        where created_at > now() - interval '30 days'
        group by 1
      ) t
    ), '[]'::jsonb),
    'top_niches', coalesce((
      select jsonb_agg(jsonb_build_object('niche', niche, 'count', cnt) order by cnt desc)
      from (
        select niche, count(*) as cnt
        from public.generation_events
        where niche is not null and created_at > now() - interval '30 days'
        group by niche
        order by cnt desc
        limit 10
      ) t
    ), '[]'::jsonb)
  ) into result;

  return result;
end;
$$;

grant execute on function public.admin_stats() to authenticated;
