-- Førstegangs profiloppsett: en side nye brukere møter én gang rett etter
-- registrering (ikon, linje, år, fag, foreninger — alt valgfritt), se
-- app/velkommen og (app)/layout.tsx. onboarded_at er null helt til de har
-- vært innom siden (Lagre eller Avbryt, spiller ingen rolle hvilken).
--
-- Eksisterende brukere skal aldri se den, så de fylles inn med det samme.
--
-- Kjør i Supabase → SQL Editor. Trygt å kjøre flere ganger.

alter table public.profiles add column if not exists onboarded_at timestamptz;
update public.profiles set onboarded_at = created_at where onboarded_at is null;

grant update (onboarded_at) on public.profiles to authenticated;

-- Lesbart for deg selv (samme mønster som privacy_version), slik at appen
-- kan sjekke om du trenger å se siden. Returtypen endres (én ny kolonne),
-- så funksjonen må droppes først — det tar visningen som bruker den med
-- seg, men den opprettes på nytt lenger ned i denne filen uansett.
drop view if exists public.visible_profiles;
drop function if exists public.masked_profile_fields(uuid, boolean);

create function public.masked_profile_fields(profile_id uuid, is_private_flag boolean)
returns table (
  username text,
  ifi_username text,
  github_url text,
  linkedin_url text,
  study_program text,
  study_year smallint,
  privacy_version text,
  privacy_accepted_at timestamptz,
  onboarded_at timestamptz
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
    case when profile_id = auth.uid() then p.privacy_accepted_at end,
    case when profile_id = auth.uid() then p.onboarded_at end
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
  m.privacy_accepted_at,
  m.onboarded_at
from public.profiles p
cross join public.masked_profile_fields(p.id, p.is_private) m;

alter view public.visible_profiles set (security_invoker = true);

revoke all on public.visible_profiles from public, anon;
grant select on public.visible_profiles to authenticated;
