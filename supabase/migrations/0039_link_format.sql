-- Profillenker kan bare være GitHub eller LinkedIn, i én fast form. Kjør i Supabase → SQL Editor.
-- Trygt å kjøre flere ganger.
--
--   GitHub:   https://github.com/<brukernavn>
--   LinkedIn: https://www.linkedin.com/in/<navn>
--
-- Appen bygger lenken fra brukernavnet; databasen nekter alt annet, også for dem som
-- kaller API-et direkte.

-- 1. Eksisterende lenker: skriv om de som peker riktig sted til fast form, og fjern resten.
update public.profiles
set github_url = case
  when github_url ~* '^https?://(www\.)?github\.com/[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?/?$'
    then 'https://github.com/' || substring(github_url from '(?i)github\.com/([A-Za-z0-9-]+)')
  else null
end
where github_url is not null;

update public.profiles
set linkedin_url = case
  when linkedin_url ~* '^https?://([a-z]{2,3}\.)?linkedin\.com/in/[A-Za-z0-9-]{3,100}/?$'
    then 'https://www.linkedin.com/in/' || substring(linkedin_url from '(?i)linkedin\.com/in/([A-Za-z0-9-]+)')
  else null
end
where linkedin_url is not null;

-- 2. Fra nå av: bare denne formen.
alter table public.profiles drop constraint if exists profiles_links_format;
alter table public.profiles
  add constraint profiles_links_format check (
    (github_url is null
      or github_url ~ '^https://github\.com/[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$')
    and (linkedin_url is null
      or linkedin_url ~ '^https://www\.linkedin\.com/in/[A-Za-z0-9-]{3,100}$')
  );
