-- Calendar: events get an optional time and course, and each user can choose
-- which courses to show and what color each one has.
alter table public.events
  add column if not exists event_time time,
  add column if not exists course_code text references public.courses (code) on delete set null;

-- Per-user calendar preferences. `key` is a course code, or one of the special
-- keys "_groups" (study group sessions) and "_none" (events without a course).
create table if not exists public.calendar_prefs (
  user_id uuid not null references auth.users (id) on delete cascade,
  key text not null check (char_length(key) between 1 and 40),
  color text check (color is null or color ~ '^#[0-9a-fA-F]{6}$'),
  visible boolean not null default true,
  primary key (user_id, key)
);

alter table public.calendar_prefs enable row level security;

drop policy if exists "calendar_prefs_select_own" on public.calendar_prefs;
create policy "calendar_prefs_select_own"
  on public.calendar_prefs for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "calendar_prefs_insert_own" on public.calendar_prefs;
create policy "calendar_prefs_insert_own"
  on public.calendar_prefs for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "calendar_prefs_update_own" on public.calendar_prefs;
create policy "calendar_prefs_update_own"
  on public.calendar_prefs for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "calendar_prefs_delete_own" on public.calendar_prefs;
create policy "calendar_prefs_delete_own"
  on public.calendar_prefs for delete to authenticated
  using (user_id = auth.uid());

grant select, insert, update, delete on public.calendar_prefs to authenticated;
