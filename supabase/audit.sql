-- Revisjon av databasen (bare lesing, endrer ingenting).
-- Kjør i Supabase → SQL Editor, én blokk om gangen, og se at resultatet
-- stemmer med «Forventet». Trygt å kjøre når som helst.

-- 1. Tabeller i public uten Row Level Security. Forventet: ingen rader.
select c.relname as table_without_rls
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity;

-- 2. Rettigheter for uinnloggede (anon) på tabeller. Forventet: ingen rader.
select table_name, privilege_type
from information_schema.role_table_grants
where table_schema = 'public' and grantee = 'anon';

-- 3. Funksjoner uinnloggede kan kalle. Forventet: bare release_unconfirmed_signup.
select p.proname as function_callable_by_anon
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.prokind = 'f'
  and has_function_privilege('anon', p.oid, 'execute')
  and not exists (select 1 from pg_depend d where d.objid = p.oid and d.deptype = 'e');

-- 4. Security-definer-funksjoner uten fast search_path. Forventet: ingen rader.
select p.proname as definer_without_search_path
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.prosecdef
  and not exists (
    select 1 from unnest(coalesce(p.proconfig, '{}')) cfg where cfg like 'search_path=%'
  );

-- 5. Policyer som slipper alle inn (using/with check = true).
--    Forventet: bare «courses_select_all» (emnelisten er åpen for innloggede).
select tablename, policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname = 'public'
  and (qual = 'true' or with_check = 'true');

-- 6. Policyer som gjelder rollen anon eller public. Forventet: ingen rader i public-skjemaet.
select tablename, policyname, roles
from pg_policies
where schemaname = 'public'
  and (roles && array['anon'::name, 'public'::name]);

-- 7. Hvilke kolonner innloggede kan endre direkte. Forventet: bare de som skal kunne endres
--    (profiles: full_name, github_url, linkedin_url, study_program, study_year, accent_color,
--     avatar, privacy_version, privacy_accepted_at; user_associations: title (0045);
--     groups og events: se migrering 0033).
select table_name, string_agg(column_name, ', ' order by column_name) as updatable_columns
from information_schema.column_privileges
where table_schema = 'public' and grantee = 'authenticated' and privilege_type = 'UPDATE'
group by table_name
order by table_name;

-- 8. Lagring: policyer på bildebøtta og selve bøtta. Forventet: bare «avatars_*»-policyer for
--    egen mappe, og bøtta har file_size_limit og allowed_mime_types = {image/jpeg}.
select policyname, cmd, roles from pg_policies where schemaname = 'storage' order by policyname;
select id, public, file_size_limit, allowed_mime_types from storage.buckets;

-- 9. Brukere som aldri bekreftet e-posten (kan slettes hvis de er gamle).
select count(*) as unconfirmed_users, min(created_at) as oldest
from auth.users where email_confirmed_at is null;

-- 10. Åpen/privat profil (etter 0035 og 0036).
--     a) Hvilke kolonner i profiles innloggede kan lese direkte. Forventet: bare
--        id, full_name, accent_color, avatar, created_at, is_private.
select string_agg(column_name, ', ' order by column_name) as readable_profile_columns
from information_schema.column_privileges
where table_schema = 'public' and table_name = 'profiles'
  and grantee = 'authenticated' and privilege_type = 'SELECT';
--     b) Antall profiler som er åpne. Forventet: 0 til noen velger «Åpen» selv.
select count(*) filter (where is_private) as private_profiles,
       count(*) filter (where not is_private) as open_profiles
from public.profiles;

-- 11. visible_profiles kjører nå med spørrerens egne rettigheter, ikke eierens
--     (etter 0042). Forventet: security_invoker finnes og er «true» i reloptions.
select relname, reloptions
from pg_class
where relname = 'visible_profiles' and relkind = 'v';

-- 12. course_exams og course_deadlines (offisielle datoer, etter 0044/0048) er
--     skrivebeskyttet: ingen kan endre dem fra appen. Forventet: ingen rader.
select table_name, privilege_type
from information_schema.column_privileges
where table_schema = 'public' and table_name in ('course_exams', 'course_deadlines')
  and privilege_type in ('INSERT', 'UPDATE', 'DELETE');

-- 13. user_deadline_completions (huk av på obliger, etter 0049): ingen UPDATE-
--     rettighet finnes (bare huk av / fjern), det gir ingen mening å endre en rad.
--     Forventet: ingen rader.
select table_name, privilege_type
from information_schema.role_table_grants
where table_schema = 'public' and table_name = 'user_deadline_completions'
  and grantee = 'authenticated' and privilege_type = 'UPDATE';
