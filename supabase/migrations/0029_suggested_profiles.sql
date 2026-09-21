-- Forslag i søket når søkefeltet er tomt: alle brukere, med de du har flest
-- felles kontakter med øverst (resten alfabetisk).
-- "Felles" = personer som både du og den andre er koblet til (følger eller
-- følges av, godkjent). Kjør i Supabase → SQL Editor. Trygt å kjøre flere ganger.
create or replace function public.suggested_profiles(
  p_limit int default 30,
  p_offset int default 0
)
returns table (profile jsonb, mutual int, total bigint)
language sql
security definer
set search_path = public
stable
as $$
  with edges as (
    select follower_id as a, followee_id as b
    from public.follows
    where status = 'accepted'
  ),
  pairs as (
    select a as uid, b as via from edges
    union
    select b as uid, a as via from edges
  ),
  my_net as (
    select via as uid from pairs where uid = auth.uid()
  ),
  counts as (
    select p.uid, count(*)::int as n
    from pairs p
    join my_net m on m.uid = p.via
    group by p.uid
  )
  select
    to_jsonb(pr) - 'privacy_version' - 'privacy_accepted_at',
    coalesce(c.n, 0),
    count(*) over ()
  from public.profiles pr
  left join counts c on c.uid = pr.id
  where pr.id <> auth.uid()
  order by coalesce(c.n, 0) desc, lower(pr.full_name), pr.id
  limit least(greatest(p_limit, 1), 100)
  offset greatest(p_offset, 0);
$$;

revoke all on function public.suggested_profiles(int, int) from public, anon;
grant execute on function public.suggested_profiles(int, int) to authenticated;
