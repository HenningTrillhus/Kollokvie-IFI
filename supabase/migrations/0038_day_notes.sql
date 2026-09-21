-- Notater i kalenderen: en ny hendelsestype «note» med en lengre tekst (body).
-- Kjør i Supabase → SQL Editor. Trygt å kjøre flere ganger.

-- 1. Tillat typen «note». (Den gamle sjekken lå på kolonnen uten fast navn, så vi
--    finner og fjerner den, og legger inn en ny.)
do $$
declare
  c record;
begin
  for c in
    select conname
    from pg_constraint
    where conrelid = 'public.events'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%''exam''%'
  loop
    execute format('alter table public.events drop constraint %I', c.conname);
  end loop;
end
$$;

alter table public.events drop constraint if exists events_type_check;
alter table public.events
  add constraint events_type_check check (type in ('exam', 'deadline', 'other', 'note'));

-- 2. Selve notatteksten. Bare eieren ser den (som resten av kalenderen).
alter table public.events add column if not exists body text;

alter table public.events drop constraint if exists events_body_limits;
alter table public.events
  add constraint events_body_limits check (
    body is null or (char_length(body) <= 4000 and public.clean_text(body, true))
  ) not valid;

-- 3. Notatteksten kan endres direkte (som de andre feltene).
grant update (body) on public.events to authenticated;
