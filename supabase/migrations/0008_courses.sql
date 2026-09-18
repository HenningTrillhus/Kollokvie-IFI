create table if not exists public.courses (
  code text primary key,
  name text not null,
  is_custom boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.courses enable row level security;

create policy "courses_select_all"
  on public.courses for select
  to authenticated
  using (true);

create policy "courses_insert_any"
  on public.courses for insert
  to authenticated
  with check (true);

grant select, insert on public.courses to authenticated;

-- Starter set of well-known IFI courses. Anyone can add more (including
-- courses outside IFI) from the app — see is_custom.
insert into public.courses (code, name) values
  ('IN1000', 'Introduksjon til objektorientert programmering'),
  ('IN1010', 'Objektorientert programmering'),
  ('IN1020', 'Introduksjon til datateknologi'),
  ('IN1030', 'Systemer, krav og konsekvenser'),
  ('IN1050', 'Introduksjon til design, bruk, interaksjon'),
  ('IN1080', 'Mekatronikk'),
  ('IN1150', 'Logiske metoder'),
  ('IN1160', 'Introduksjon til maskinlæring'),
  ('IN1900', 'Introduksjon til programmering for naturvitenskapelige anvendelser'),
  ('IN2000', 'Software Engineering med prosjektarbeid'),
  ('IN2010', 'Algoritmer og datastrukturer'),
  ('IN2020', 'Menneskesentrert systemutvikling'),
  ('IN2040', 'Funksjonell programmering'),
  ('IN2060', 'Digitalteknikk og datamaskinarkitektur'),
  ('IN2090', 'Databaser og datamodellering'),
  ('IN2120', 'Cybersikkerhet'),
  ('IN3000', 'Operativsystemer'),
  ('IN3050', 'Introduksjon til kunstig intelligens og maskinlæring'),
  ('IN4050', 'Introduksjon til kunstig intelligens og maskinlæring'),
  ('IN5020', 'Distribuerte systemer'),
  ('IN5310', 'Advanced Deep Learning for Image Analysis'),
  ('IN5420', 'Distributed Blockchain Technologies')
on conflict (code) do nothing;
