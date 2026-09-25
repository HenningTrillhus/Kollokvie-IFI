-- Lets you edit or delete an automatically-added exam/oblig the same way you
-- can with one you added yourself. Since course_exams/course_deadlines are
-- shared, read-only rows (the same for everyone with that course), we can't
-- actually change or remove them — instead:
--   - "Delete" hides that one official item from your calendar only.
--   - "Edit" hides the official item the same way, and a normal row is
--     added to `events` with your changes (see calendar-view.tsx), which
--     from then on behaves exactly like any other event you made yourself.
-- No "un-hide" exists in the app, so no update/delete policy is needed here.
--
-- Kjør i Supabase → SQL Editor. Trygt å kjøre flere ganger.

create table if not exists public.user_hidden_exams (
  user_id uuid not null references auth.users (id) on delete cascade,
  exam_id uuid not null references public.course_exams (id) on delete cascade,
  hidden_at timestamptz not null default now(),
  primary key (user_id, exam_id)
);

alter table public.user_hidden_exams enable row level security;

drop policy if exists "user_hidden_exams_select_own" on public.user_hidden_exams;
create policy "user_hidden_exams_select_own"
  on public.user_hidden_exams for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "user_hidden_exams_insert_own" on public.user_hidden_exams;
create policy "user_hidden_exams_insert_own"
  on public.user_hidden_exams for insert
  to authenticated
  with check (user_id = auth.uid());

grant select, insert on public.user_hidden_exams to authenticated;

drop trigger if exists user_hidden_exams_quota on public.user_hidden_exams;
create trigger user_hidden_exams_quota before insert on public.user_hidden_exams
  for each row execute function public.enforce_quota('1000', 'user_id');

create table if not exists public.user_hidden_deadlines (
  user_id uuid not null references auth.users (id) on delete cascade,
  deadline_id uuid not null references public.course_deadlines (id) on delete cascade,
  hidden_at timestamptz not null default now(),
  primary key (user_id, deadline_id)
);

alter table public.user_hidden_deadlines enable row level security;

drop policy if exists "user_hidden_deadlines_select_own" on public.user_hidden_deadlines;
create policy "user_hidden_deadlines_select_own"
  on public.user_hidden_deadlines for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "user_hidden_deadlines_insert_own" on public.user_hidden_deadlines;
create policy "user_hidden_deadlines_insert_own"
  on public.user_hidden_deadlines for insert
  to authenticated
  with check (user_id = auth.uid());

grant select, insert on public.user_hidden_deadlines to authenticated;

drop trigger if exists user_hidden_deadlines_quota on public.user_hidden_deadlines;
create trigger user_hidden_deadlines_quota before insert on public.user_hidden_deadlines
  for each row execute function public.enforce_quota('1000', 'user_id');
