-- Hastighetsgrenser per bruker (rate limiting). Kjør i Supabase → SQL Editor.
-- Trygt å kjøre flere ganger.
--
-- Grensene er satt høyt: vanlig bruk, også å legge inn mange emner eller hendelser
-- på en gang, kommer aldri i nærheten. De stopper bare skript og dem som prøver å
-- oversvømme tjenesten. Kvotene i migrering 0033 begrenser i tillegg det totale antallet.
-- Går du over grensen, får du en feil «Rate limit exceeded», og appen viser
-- «Rolig, du gjør ting litt for fort».

-- Tellere per bruker, handling og tidsvindu (minutt og time). Bare databasen selv
-- kommer til: ingen rettigheter for innloggede eller uinnloggede.
create table if not exists public.rate_counters (
  key text not null,
  action text not null,
  bucket text not null,
  window_start timestamptz not null,
  n int not null default 0,
  primary key (key, action, bucket, window_start)
);

alter table public.rate_counters enable row level security;
revoke all on public.rate_counters from public, anon, authenticated;

-- Teller ett kall og avviser hvis grensen er nådd. Avviste kall telles ikke, så
-- grensen løsner av seg selv når minuttet eller timen er over.
create or replace function public.hit(p_key text, p_action text, p_per_min int, p_per_hour int)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  n_min int;
  n_hour int;
begin
  insert into public.rate_counters as c (key, action, bucket, window_start, n)
  values (p_key, p_action, 'm', date_trunc('minute', now()), 1)
  on conflict (key, action, bucket, window_start) do update set n = c.n + 1
  returning c.n into n_min;

  insert into public.rate_counters as c (key, action, bucket, window_start, n)
  values (p_key, p_action, 'h', date_trunc('hour', now()), 1)
  on conflict (key, action, bucket, window_start) do update set n = c.n + 1
  returning c.n into n_hour;

  -- Rydder gamle tellere av og til (ca. hvert hundrede kall).
  if random() < 0.01 then
    delete from public.rate_counters where window_start < now() - interval '3 hours';
  end if;

  if n_min > p_per_min or n_hour > p_per_hour then
    raise exception 'Rate limit exceeded' using errcode = 'P0001';
  end if;
end;
$$;

revoke all on function public.hit(text, text, int, int) from public, anon, authenticated;

-- Trigger-funksjon: teller for den innloggede brukeren. Argumenter: handling, per minutt, per time.
create or replace function public.enforce_rate()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    return new;
  end if;
  perform public.hit(uid::text, tg_argv[0], tg_argv[1]::int, tg_argv[2]::int);
  return new;
end;
$$;

revoke all on function public.enforce_rate() from public, anon, authenticated;

-- Nye rader (per minutt / per time)
drop trigger if exists groups_rate on public.groups;
create trigger groups_rate before insert on public.groups
  for each row execute function public.enforce_rate('group_create', '10', '60');

drop trigger if exists events_rate on public.events;
create trigger events_rate before insert on public.events
  for each row execute function public.enforce_rate('event_create', '30', '400');

drop trigger if exists follows_rate on public.follows;
create trigger follows_rate before insert on public.follows
  for each row execute function public.enforce_rate('follow', '30', '300');

drop trigger if exists group_members_rate on public.group_members;
create trigger group_members_rate before insert on public.group_members
  for each row execute function public.enforce_rate('group_join', '20', '200');

drop trigger if exists group_invites_rate on public.group_invites;
create trigger group_invites_rate before insert on public.group_invites
  for each row execute function public.enforce_rate('group_invite', '30', '300');

drop trigger if exists courses_rate on public.courses;
create trigger courses_rate before insert on public.courses
  for each row execute function public.enforce_rate('course_create', '5', '20');

drop trigger if exists user_courses_rate on public.user_courses;
create trigger user_courses_rate before insert on public.user_courses
  for each row execute function public.enforce_rate('user_course', '60', '400');

drop trigger if exists calendar_prefs_rate on public.calendar_prefs;
create trigger calendar_prefs_rate before insert on public.calendar_prefs
  for each row execute function public.enforce_rate('calendar_pref', '60', '600');

drop trigger if exists profile_bios_rate on public.profile_bios;
create trigger profile_bios_rate before insert on public.profile_bios
  for each row execute function public.enforce_rate('bio', '20', '200');

-- Endringer
drop trigger if exists profiles_rate on public.profiles;
create trigger profiles_rate before update on public.profiles
  for each row execute function public.enforce_rate('profile_update', '30', '300');

drop trigger if exists events_update_rate on public.events;
create trigger events_update_rate before update on public.events
  for each row execute function public.enforce_rate('event_update', '60', '600');

-- Opprydderen for uferdige registreringer kan kalles uten innlogging. Nå med grense per
-- adresse og totalt, så den ikke kan brukes til å avbryte andres registrering i massevis.
create or replace function public.release_unconfirmed_signup(p_email text, p_username text default null)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if lower(coalesce(p_email, '')) !~ '^[a-z0-9._-]+@uio\.no$' then
    return;
  end if;

  perform public.hit('release:' || md5(lower(p_email)), 'release', 8, 40);
  perform public.hit('release:all', 'release', 300, 3000);

  delete from auth.users u
  where u.email_confirmed_at is null
    and (
      lower(u.email) = lower(p_email)
      or (
        p_username is not null
        and exists (
          select 1 from public.profiles p
          where p.id = u.id and lower(p.username) = lower(trim(p_username))
        )
      )
    );
end;
$$;

grant execute on function public.release_unconfirmed_signup(text, text) to anon, authenticated;
