-- Retter en liten men reell feil: helt siden registrering med e-postkode ble
-- lagt til, opprettet Supabase automatisk en rad i auth.users OG en profil i
-- public.profiles i det øyeblikket noen trykket «Opprett bruker» — altså FØR
-- de hadde skrevet inn den 8-sifrede koden og faktisk bekreftet at de eier
-- adressen. Profilen ble riktignok ryddet bort igjen hvis de aldri bekreftet
-- (se release_unconfirmed_signup), men i mellomtiden lå den i databasen.
--
-- Etter denne migreringen: profilen opprettes ikke før e-posten faktisk er
-- bekreftet. Selve auth.users-raden må Supabase fortsatt opprette med en gang
-- (det er slik verifisering av en kode i det hele tatt er mulig), men ingen
-- profil, ingen data, ingenting synlig for andre brukere før koden er riktig.
--
-- Kjør i Supabase → SQL Editor. Trygt å kjøre flere ganger.

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
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

-- Uten e-postkode bekrefter Supabase adressen med det samme (Confirm email er
-- av), så e-postsjekk her skjer allerede ved innsetting.
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  when (new.email_confirmed_at is not null)
  execute function public.handle_new_user();

-- Med e-postkode: profilen opprettes først når verifyOtp() lykkes, som er
-- akkurat når Supabase setter email_confirmed_at (skjer i samme transaksjon,
-- så profilen finnes garantert innen appen navigerer videre).
drop trigger if exists on_auth_user_confirmed on auth.users;
create trigger on_auth_user_confirmed
  after update of email_confirmed_at on auth.users
  for each row
  when (old.email_confirmed_at is null and new.email_confirmed_at is not null)
  execute function public.handle_new_user();
