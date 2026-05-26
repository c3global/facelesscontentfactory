-- Two-phase generation (ideas + content) + cost tracking.

alter table public.generation_events
  add column if not exists phase text not null default 'content',
  add column if not exists model text,
  add column if not exists cost_cents numeric(10,2);

-- Update admin_stats to include cost + phase breakdown.
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
    'gens_7d',  (select count(*) from public.generation_events where created_at > now() - interval '7 days'),
    'gens_30d', (select count(*) from public.generation_events where created_at > now() - interval '30 days'),
    'cost_7d_cents',  coalesce((select sum(cost_cents) from public.generation_events where created_at > now() - interval '7 days'), 0),
    'cost_30d_cents', coalesce((select sum(cost_cents) from public.generation_events where created_at > now() - interval '30 days'), 0),
    'error_rate_7d', coalesce((
      select round(
        sum(case when status = 'error' then 1 else 0 end)::numeric
        / nullif(count(*), 0)::numeric, 4
      )
      from public.generation_events where created_at > now() - interval '7 days'
    ), 0),
    'per_day', coalesce((
      select jsonb_agg(jsonb_build_object('day', to_char(d, 'MM-DD'), 'count', cnt, 'cost_cents', cost) order by d)
      from (
        select date_trunc('day', created_at)::date as d,
               count(*) as cnt,
               coalesce(sum(cost_cents), 0) as cost
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
