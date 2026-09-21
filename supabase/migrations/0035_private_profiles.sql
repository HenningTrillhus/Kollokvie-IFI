-- Åpen eller privat profil. Kjør i Supabase → SQL Editor (trygt å kjøre flere ganger).
--
-- Åpen profil:  alle innloggede ser IFI-brukernavn, studielinje, årstrinn, emner,
--               GitHub, LinkedIn og bio.
-- Privat profil: andre ser bare navn og ikon. De som FØLGER deg (godkjent) ser alt,
--               og du ser alltid din egen.
--
-- Del 1 (denne filen) legger til det nye og kan kjøres før eller etter at appen er
-- oppdatert. Del 2 (0036) stenger den gamle veien og kjøres ETTER at den nye appen
-- ligger ute.

-- Alle får privat profil til å begynne med (også de som finnes fra før). Grunnen: bioen
-- var lovet bare til følgere, så den skal ikke bli synlig uten at du selv velger det.
alter table public.profiles add column if not exists is_private boolean not null default true;
grant update (is_private) on public.profiles to authenticated;

-- Visningen «visible_profiles» er den eneste veien til andres profilopplysninger.
-- Den bruker eierens rettigheter (ikke innloggedes), sjekker hvem som spør, og
-- skjuler feltene som ikke skal vises. Navn, ikon og farge er alltid synlige.
create or replace view public.visible_profiles as
select
  p.id,
  p.full_name,
  p.accent_color,
  p.avatar,
  p.created_at,
  p.is_private,
  not v.can_see as details_hidden,
  case when v.can_see then p.username end as username,
  case when v.can_see then p.ifi_username end as ifi_username,
  case when v.can_see then p.github_url end as github_url,
  case when v.can_see then p.linkedin_url end as linkedin_url,
  case when v.can_see then p.study_program end as study_program,
  case when v.can_see then p.study_year end as study_year,
  case when p.id = auth.uid() then p.privacy_version end as privacy_version,
  case when p.id = auth.uid() then p.privacy_accepted_at end as privacy_accepted_at
from public.profiles p
cross join lateral (
  select (
    p.id = auth.uid()
    or not p.is_private
    or public.is_following(auth.uid(), p.id)
  ) as can_see
) v;

revoke all on public.visible_profiles from public, anon;
grant select on public.visible_profiles to authenticated;

-- Bio og emner følger samme regel: eier, følgere, eller åpen profil.
drop policy if exists "profile_bios_select" on public.profile_bios;
create policy "profile_bios_select"
  on public.profile_bios for select
  to authenticated
  using (
    user_id = auth.uid()
    or public.is_following(auth.uid(), user_id)
    or exists (select 1 from public.profiles p where p.id = user_id and not p.is_private)
  );

drop policy if exists "user_courses_select_all" on public.user_courses;
drop policy if exists "user_courses_select_visible" on public.user_courses;
create policy "user_courses_select_visible"
  on public.user_courses for select
  to authenticated
  using (
    user_id = auth.uid()
    or public.is_following(auth.uid(), user_id)
    or exists (select 1 from public.profiles p where p.id = user_id and not p.is_private)
  );

-- Funksjoner som ga ut profilopplysninger går nå gjennom visningen.
create or replace function public.group_member_previews(gids uuid[], per_group int default 4)
returns table (
  group_id uuid,
  user_id uuid,
  full_name text,
  username text,
  accent_color text,
  avatar text
)
language sql
stable
security invoker
set search_path = public
as $$
  select s.group_id, s.user_id, p.full_name, p.username, p.accent_color, p.avatar
  from (
    select gm.group_id, gm.user_id, gm.joined_at,
           row_number() over (partition by gm.group_id order by gm.joined_at, gm.user_id) as rn
    from public.group_members gm
    where gm.group_id = any(gids)
  ) s
  join public.visible_profiles p on p.id = s.user_id
  where s.rn <= per_group
  order by s.group_id, s.rn;
$$;

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
  from public.visible_profiles pr
  left join counts c on c.uid = pr.id
  where pr.id <> auth.uid()
  order by coalesce(c.n, 0) desc, lower(pr.full_name), pr.id
  limit least(greatest(p_limit, 1), 100)
  offset greatest(p_offset, 0);
$$;

revoke all on function public.suggested_profiles(int, int) from public, anon;
grant execute on function public.suggested_profiles(int, int) to authenticated;
