create table if not exists public.user_courses (
  user_id uuid not null references auth.users (id) on delete cascade,
  course_code text not null references public.courses (code) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, course_code)
);

alter table public.user_courses enable row level security;

-- Visible to everyone: needed so profiles and the group course picker
-- ("your courses first") can show anyone's courses.
create policy "user_courses_select_all"
  on public.user_courses for select
  to authenticated
  using (true);

create policy "user_courses_insert_own"
  on public.user_courses for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "user_courses_delete_own"
  on public.user_courses for delete
  to authenticated
  using (user_id = auth.uid());

grant select, insert, delete on public.user_courses to authenticated;
