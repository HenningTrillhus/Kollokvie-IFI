-- Sikkerhet, runde 2: skjulte tegn, kvoter mot misbruk og smalere skrivetilgang.
-- Kjør i Supabase → SQL Editor. Trygt å kjøre flere ganger.

-- ---------------------------------------------------------------------------
-- 1. Tekst uten kontrolltegn og skjulte/retningsstyrende tegn ("spoofing":
--    for eksempel U+202E får et navn til å se ut som noe annet).
--    Gjelder nye og endrede rader (not valid), ikke eksisterende data.
-- ---------------------------------------------------------------------------
create or replace function public.clean_text(t text, allow_newline boolean default false)
returns boolean
language sql
immutable
as $$
  select t is null or t !~ (
    case when allow_newline
      then '[\x01-\x08\x0b\x0c\x0e-\x1f\x7f\u200b\u200e\u200f\u202a-\u202e\u2060-\u2069\ufeff]'
      else '[\x01-\x1f\x7f\u200b\u200e\u200f\u202a-\u202e\u2060-\u2069\ufeff]'
    end
  );
$$;

alter table public.profiles drop constraint if exists profiles_text_limits;
alter table public.profiles
  add constraint profiles_text_limits check (
    char_length(full_name) <= 100
    and public.clean_text(full_name)
    and (github_url is null or (char_length(github_url) <= 300 and github_url ~* '^https?://' and public.clean_text(github_url)))
    and (linkedin_url is null or (char_length(linkedin_url) <= 300 and linkedin_url ~* '^https?://' and public.clean_text(linkedin_url)))
  ) not valid;

alter table public.groups drop constraint if exists groups_text_limits;
alter table public.groups
  add constraint groups_text_limits check (
    char_length(name) between 1 and 120
    and public.clean_text(name)
    and (description is null or (char_length(description) <= 2000 and public.clean_text(description, true)))
    and (location is null or (char_length(location) <= 200 and public.clean_text(location)))
  ) not valid;

alter table public.events drop constraint if exists events_text_limits;
alter table public.events
  add constraint events_text_limits check (
    char_length(title) between 1 and 200 and public.clean_text(title)
  ) not valid;

alter table public.courses drop constraint if exists courses_format;
alter table public.courses
  add constraint courses_format check (
    code ~ '^[A-Za-z0-9ÆØÅæøå_-]{2,12}$'
    and char_length(name) between 1 and 150
    and public.clean_text(name)
  ) not valid;

alter table public.profile_bios drop constraint if exists profile_bios_clean;
alter table public.profile_bios
  add constraint profile_bios_clean check (public.clean_text(bio, true)) not valid;

-- ---------------------------------------------------------------------------
-- 2. Bare de kolonnene som skal kunne endres, kan endres direkte.
--    (Eieren av en kollokviegruppe kunne før endre id og created_at.)
-- ---------------------------------------------------------------------------
revoke update on public.groups from authenticated;
grant update (name, description, course_code, visibility, location, event_date, event_time, max_members)
  on public.groups to authenticated;

revoke update on public.events from authenticated;
grant update (title, event_date, event_time, type, course_code, completed_at)
  on public.events to authenticated;

-- ---------------------------------------------------------------------------
-- 3. Egendefinerte emner: hvem som la dem til, og bare som «egendefinert».
--    Før kunne alle legge inn emner som så ut som offisielle.
-- ---------------------------------------------------------------------------
alter table public.courses
  add column if not exists created_by uuid default auth.uid() references auth.users (id) on delete set null;

drop policy if exists "courses_insert_any" on public.courses;
drop policy if exists "courses_insert_custom" on public.courses;
create policy "courses_insert_custom"
  on public.courses for insert
  to authenticated
  with check (is_custom = true and created_by = auth.uid());

-- ---------------------------------------------------------------------------
-- 4. Kvoter: ingen enkeltbruker kan fylle databasen med søppel.
-- ---------------------------------------------------------------------------
create or replace function public.enforce_quota()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  max_rows int := tg_argv[0]::int;
  owner_col text := tg_argv[1];
  subject uuid := (to_jsonb(new) ->> owner_col)::uuid;
  n bigint;
begin
  if subject is null then
    return new;
  end if;
  execute format('select count(*) from %I.%I where %I = $1', tg_table_schema, tg_table_name, owner_col)
    into n using subject;
  if n >= max_rows then
    raise exception 'Quota exceeded' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

revoke all on function public.enforce_quota() from public, anon, authenticated;

drop trigger if exists groups_quota on public.groups;
create trigger groups_quota before insert on public.groups
  for each row execute function public.enforce_quota('30', 'owner_id');

drop trigger if exists events_quota on public.events;
create trigger events_quota before insert on public.events
  for each row execute function public.enforce_quota('1000', 'user_id');

drop trigger if exists user_courses_quota on public.user_courses;
create trigger user_courses_quota before insert on public.user_courses
  for each row execute function public.enforce_quota('40', 'user_id');

drop trigger if exists calendar_prefs_quota on public.calendar_prefs;
create trigger calendar_prefs_quota before insert on public.calendar_prefs
  for each row execute function public.enforce_quota('200', 'user_id');

drop trigger if exists follows_quota on public.follows;
create trigger follows_quota before insert on public.follows
  for each row execute function public.enforce_quota('1000', 'follower_id');

drop trigger if exists group_members_quota on public.group_members;
create trigger group_members_quota before insert on public.group_members
  for each row execute function public.enforce_quota('200', 'user_id');

drop trigger if exists group_invites_quota on public.group_invites;
create trigger group_invites_quota before insert on public.group_invites
  for each row execute function public.enforce_quota('500', 'inviter_id');

drop trigger if exists courses_quota on public.courses;
create trigger courses_quota before insert on public.courses
  for each row execute function public.enforce_quota('25', 'created_by');
