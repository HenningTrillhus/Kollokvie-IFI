-- Sikkerhet: strammere rettigheter, grenser på tekst, og strengere bildelagring.
-- Kjør i Supabase → SQL Editor. Trygt å kjøre flere ganger.

-- ---------------------------------------------------------------------------
-- 1. Tekstgrenser og lenker (håndheves i databasen, ikke bare i skjemaet).
--    «not valid» = gjelder nye og endrede rader, og lar eksisterende data være i fred.
-- ---------------------------------------------------------------------------

-- Lenker må være vanlige http(s)-adresser: ellers kunne noen lagre en
-- «javascript:»-lenke via API-et og få den til å kjøre hos dem som klikker.
alter table public.profiles drop constraint if exists profiles_text_limits;
alter table public.profiles
  add constraint profiles_text_limits check (
    char_length(full_name) <= 100
    and (github_url is null or (char_length(github_url) <= 300 and github_url ~* '^https?://'))
    and (linkedin_url is null or (char_length(linkedin_url) <= 300 and linkedin_url ~* '^https?://'))
  ) not valid;

alter table public.groups drop constraint if exists groups_text_limits;
alter table public.groups
  add constraint groups_text_limits check (
    char_length(name) between 1 and 120
    and (description is null or char_length(description) <= 2000)
    and (location is null or char_length(location) <= 200)
  ) not valid;

alter table public.events drop constraint if exists events_text_limits;
alter table public.events
  add constraint events_text_limits check (char_length(title) between 1 and 200) not valid;

-- Alle innloggede kan legge til emner, så formatet må sjekkes her.
alter table public.courses drop constraint if exists courses_format;
alter table public.courses
  add constraint courses_format check (
    code ~ '^[A-Za-z0-9ÆØÅæøå_-]{2,12}$' and char_length(name) between 1 and 150
  ) not valid;

-- ---------------------------------------------------------------------------
-- 2. Profilbilder: bare JPEG, maks 300 KB, bare i egen mappe med fast filnavn,
--    og ingen som kan liste opp filene til andre.
-- ---------------------------------------------------------------------------
update storage.buckets
set public = true,
    file_size_limit = 307200,
    allowed_mime_types = array['image/jpeg']
where id = 'avatars';

-- Bildene vises via offentlig lenke og trenger ingen lese-policy. En bred
-- lese-policy lar hvem som helst liste alle filene i bøtta, så den byttes ut
-- med «bare din egen mappe» (trengs for at opplasting med upsert skal virke).
drop policy if exists "avatars_read" on storage.objects;
drop policy if exists "avatars_read_own" on storage.objects;
create policy "avatars_read_own"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "avatars_insert_own" on storage.objects;
create policy "avatars_insert_own"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'avatars' and name = auth.uid()::text || '/avatar.jpg');

drop policy if exists "avatars_update_own" on storage.objects;
create policy "avatars_update_own"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'avatars' and name = auth.uid()::text || '/avatar.jpg')
  with check (bucket_id = 'avatars' and name = auth.uid()::text || '/avatar.jpg');

-- ---------------------------------------------------------------------------
-- 3. Rettigheter i databasen.
-- ---------------------------------------------------------------------------

-- Uinnloggede (anon) skal ikke kunne røre tabellene i det hele tatt.
revoke all on all tables in schema public from anon;
revoke all on all sequences in schema public from anon;

-- Innloggede trenger aldri å tømme tabeller eller lage triggere.
revoke truncate, references, trigger on all tables in schema public from authenticated;

-- Funksjoner kan som standard kalles av alle, også uinnloggede. Nå: bare
-- innloggede (unntatt registrerings-opprydderen, som kalles før innlogging).
do $$
declare
  r record;
begin
  for r in
    select p.oid::regprocedure as sig, p.proname, p.prorettype
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.prokind = 'f'
      and not exists (
        select 1 from pg_depend d where d.objid = p.oid and d.deptype = 'e'
      )
  loop
    execute format('revoke execute on function %s from public, anon', r.sig);
    -- Trigger-funksjoner kalles av databasen, ikke av brukere.
    if r.prorettype <> 'trigger'::regtype and r.proname <> 'username_available' then
      execute format('grant execute on function %s to authenticated', r.sig);
    end if;
  end loop;
end
$$;

grant execute on function public.release_unconfirmed_signup(text, text) to anon, authenticated;

-- Nye tabeller og funksjoner skal heller ikke bli åpne for anon automatisk.
do $$
begin
  alter default privileges in schema public revoke all on tables from anon;
  alter default privileges in schema public revoke execute on functions from anon, public;
exception when others then
  raise notice 'Hoppet over standard-rettigheter: %', sqlerrm;
end
$$;

-- «Følger jeg denne / følger denne meg» kan bare spørres om deg selv. Før
-- kunne en innlogget bruker sjekke hvem som helst mot hvem som helst via API-et.
create or replace function public.is_following(viewer uuid, target uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select viewer = auth.uid() and exists (
    select 1 from public.follows
    where follower_id = viewer and followee_id = target and status = 'accepted'
  );
$$;
