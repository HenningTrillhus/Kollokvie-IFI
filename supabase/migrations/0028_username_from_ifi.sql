-- Bruker-navnet er nå det samme som IFI-brukernavnet (delen før @uio.no).
-- Kjør i Supabase → SQL Editor. Trygt å kjøre flere ganger.

-- 1. Nye brukere får brukernavn = IFI-brukernavn.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  accepted text := nullif(new.raw_user_meta_data ->> 'privacy_version', '');
  ifi text := split_part(lower(coalesce(new.email, '')), '@', 1);
begin
  insert into public.profiles (
    id, full_name, username, ifi_username, privacy_version, privacy_accepted_at
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(nullif(ifi, ''), new.id::text),
    coalesce(nullif(ifi, ''), new.raw_user_meta_data ->> 'ifi_username', ''),
    accepted,
    case when accepted is not null then now() end
  );
  return new;
end;
$$;

-- 2. Eksisterende profiler: bruk IFI-brukernavnet som brukernavn (hvis ledig).
update public.profiles p
set username = lower(p.ifi_username)
where p.ifi_username <> ''
  and p.username is distinct from lower(p.ifi_username)
  and not exists (
    select 1 from public.profiles o
    where o.id <> p.id and lower(o.username) = lower(p.ifi_username)
  );

-- 3. Brukernavnet kan ikke lenger endres fra appen.
revoke update (username) on public.profiles from authenticated;
