alter table public.profiles
  add column if not exists accent_color text not null default '#3f6f5e';
