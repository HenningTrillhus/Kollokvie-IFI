-- Foreninger på profilen: hvilken forening, og en kort tittel ("Intern",
-- "Funk", "Styreleder" ...). Samme synlighetsregel som bio og emner: deg selv,
-- de som følger deg, eller alle hvis profilen er åpen. Boksen på profilen
-- vises bare når det finnes minst én rad her (se ProfileHeader).
--
-- Listen med foreninger er fast og lever i koden (lib/associations.ts), ikke
-- i databasen — sjekken under holder de to i sync.
--
-- Kjør i Supabase → SQL Editor. Trygt å kjøre flere ganger.

create table if not exists public.user_associations (
  user_id uuid not null references auth.users (id) on delete cascade,
  association text not null check (association in (
    'dagen', 'navet', 'maps', 'fadderstyret', 'cybernetisk-selskab', 'sifi',
    'sonen', 'pga-ifi', 'creators-guild', 'maki', 'toast-jaern', 'defi',
    'progsys', 'fifi', 'digitus', 'rastlos', 'fui', 'pitch', 'mikro',
    'runtime', 'output', 'readline', 'vifi', 'realitiifi', 'pitbulls',
    'quizifi'
  )),
  title text not null check (char_length(title) between 1 and 40),
  created_at timestamptz not null default now(),
  primary key (user_id, association)
);

alter table public.user_associations enable row level security;

create policy "user_associations_select_visible"
  on public.user_associations for select
  to authenticated
  using (
    user_id = auth.uid()
    or public.is_following(auth.uid(), user_id)
    or exists (select 1 from public.profiles p where p.id = user_id and not p.is_private)
  );

create policy "user_associations_insert_own"
  on public.user_associations for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "user_associations_update_own"
  on public.user_associations for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "user_associations_delete_own"
  on public.user_associations for delete
  to authenticated
  using (user_id = auth.uid());

grant select, insert, update, delete on public.user_associations to authenticated;

-- Samme kvote-ordning som resten av appen (0033). Foreningslisten har uansett
-- bare 26 valg, men dette holder mønsteret likt overalt.
drop trigger if exists user_associations_quota on public.user_associations;
create trigger user_associations_quota before insert on public.user_associations
  for each row execute function public.enforce_quota('26', 'user_id');
