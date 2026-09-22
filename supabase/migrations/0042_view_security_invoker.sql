-- Retter Supabase sin sikkerhetsvarsling «View public.visible_profiles is
-- defined with the SECURITY DEFINER property» (Kritisk).
--
-- Problemet: en visning uten `security_invoker` leser databasen med eierens
-- (en administratorrolle) rettigheter, ikke med rettighetene til den som
-- faktisk spør. Det er ikke utnyttet i dag (profiles-tabellen har ingen
-- radbegrensning), men det betyr at visningen ikke lenger blir stanset av
-- databasens egne tilgangsregler (RLS) hvis noen strammer dem inn senere —
-- en skjult felle.
--
-- Løsningen: visningen selv settes til `security_invoker = true`, slik at
-- den følger vanlige regler. De feltene som krever utvidede rettigheter
-- (IFI-brukernavn, lenker, studielinje osv., skjult på private profiler)
-- flyttes til en egen, tydelig merket funksjon — det anbefalte mønsteret,
-- samme prinsipp som `is_following` og `suggested_profiles` allerede bruker.
-- Ingenting endres for appen: samme visningsnavn, samme kolonner, samme
-- oppførsel. Kjør i Supabase → SQL Editor, ETTER migrering 0036.

-- 1. Funksjonen som slår opp de skjulte feltene, med de samme reglene som før.
create or replace function public.masked_profile_fields(profile_id uuid, is_private_flag boolean)
returns table (
  username text,
  ifi_username text,
  github_url text,
  linkedin_url text,
  study_program text,
  study_year smallint,
  privacy_version text,
  privacy_accepted_at timestamptz
)
language sql
security definer
set search_path = public
stable
as $$
  select
    case when v.can_see then p.username end,
    case when v.can_see then p.ifi_username end,
    case when v.can_see then p.github_url end,
    case when v.can_see then p.linkedin_url end,
    case when v.can_see then p.study_program end,
    case when v.can_see then p.study_year end,
    case when profile_id = auth.uid() then p.privacy_version end,
    case when profile_id = auth.uid() then p.privacy_accepted_at end
  from public.profiles p
  cross join lateral (
    select (
      profile_id = auth.uid()
      or not is_private_flag
      or public.is_following(auth.uid(), profile_id)
    ) as can_see
  ) v
  where p.id = profile_id;
$$;

revoke all on function public.masked_profile_fields(uuid, boolean) from public, anon;
grant execute on function public.masked_profile_fields(uuid, boolean) to authenticated;

-- 2. Selve visningen: nå med security_invoker, samme kolonner/rekkefølge som før.
--    De kolonnene som ligger direkte på profiles (id, full_name, accent_color,
--    avatar, created_at, is_private) har innloggede allerede lesetilgang til
--    (migrering 0036); resten kommer via funksjonen over, som bare krever
--    kjøretillatelse, ikke direkte lesetilgang til de skjulte kolonnene.
create or replace view public.visible_profiles
with (security_invoker = true)
as
select
  p.id,
  p.full_name,
  p.accent_color,
  p.avatar,
  p.created_at,
  p.is_private,
  not (
    p.id = auth.uid()
    or not p.is_private
    or public.is_following(auth.uid(), p.id)
  ) as details_hidden,
  m.username,
  m.ifi_username,
  m.github_url,
  m.linkedin_url,
  m.study_program,
  m.study_year,
  m.privacy_version,
  m.privacy_accepted_at
from public.profiles p
cross join public.masked_profile_fields(p.id, p.is_private) m;

-- Ekstra sikkerhetsnett i tilfelle CREATE OR REPLACE VIEW ikke oppdaterer
-- lagringsvalget pålitelig alene (harmløst å kjøre uansett).
alter view public.visible_profiles set (security_invoker = true);

revoke all on public.visible_profiles from public, anon;
grant select on public.visible_profiles to authenticated;
