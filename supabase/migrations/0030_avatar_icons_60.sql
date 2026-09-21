-- Profilikoner 01-60 (var 01-45). Kjør i Supabase → SQL Editor.
alter table public.profiles drop constraint if exists profiles_avatar_format;
alter table public.profiles
  add constraint profiles_avatar_format
  check (avatar is null or avatar ~ '^(preset:(0[1-9]|[1-5][0-9]|60)|upload:[0-9]{1,15})$');
