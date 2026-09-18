alter table public.profiles
  add column if not exists github_url text,
  add column if not exists linkedin_url text,
  add column if not exists study_program text,
  add column if not exists study_year smallint check (study_year is null or study_year between 1 and 5);
