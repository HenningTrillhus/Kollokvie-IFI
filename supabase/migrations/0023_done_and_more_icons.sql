-- 1. Obligs and other events can be marked as done.
alter table public.events add column if not exists completed_at timestamptz;

-- 2. Profile icons 01-45 (was 01-30).
alter table public.profiles drop constraint if exists profiles_avatar_format;
alter table public.profiles
  add constraint profiles_avatar_format
  check (avatar is null or avatar ~ '^(preset:(0[1-9]|[1-3][0-9]|4[0-5])|upload:[0-9]{1,15})$');
