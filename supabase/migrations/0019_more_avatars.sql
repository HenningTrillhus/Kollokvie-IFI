-- Presets 22-30 added: widen the allowed range from 01-21 to 01-30.
alter table public.profiles drop constraint if exists profiles_avatar_format;
alter table public.profiles
  add constraint profiles_avatar_format
  check (avatar is null or avatar ~ '^(preset:(0[1-9]|[12][0-9]|30)|upload:[0-9]{1,15})$');
