-- Lets you tick off an automatically-added oblig (course_deadlines) the same
-- way you tick off one you added yourself. Since course_deadlines is shared,
-- read-only data (the same row for everyone with that course), "done" can't
-- live on that row — it's tracked per user here instead.
--
-- Kjør i Supabase → SQL Editor. Trygt å kjøre flere ganger.

create table if not exists public.user_deadline_completions (
  user_id uuid not null references auth.users (id) on delete cascade,
  deadline_id uuid not null references public.course_deadlines (id) on delete cascade,
  completed_at timestamptz not null default now(),
  primary key (user_id, deadline_id)
);

alter table public.user_deadline_completions enable row level security;

drop policy if exists "user_deadline_completions_select_own" on public.user_deadline_completions;
create policy "user_deadline_completions_select_own"
  on public.user_deadline_completions for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "user_deadline_completions_insert_own" on public.user_deadline_completions;
create policy "user_deadline_completions_insert_own"
  on public.user_deadline_completions for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "user_deadline_completions_delete_own" on public.user_deadline_completions;
create policy "user_deadline_completions_delete_own"
  on public.user_deadline_completions for delete
  to authenticated
  using (user_id = auth.uid());

grant select, insert, delete on public.user_deadline_completions to authenticated;

-- Same quota pattern as the rest of the app (0033); nowhere near enough
-- obliger exist for anyone to hit this in practice.
drop trigger if exists user_deadline_completions_quota on public.user_deadline_completions;
create trigger user_deadline_completions_quota before insert on public.user_deadline_completions
  for each row execute function public.enforce_quota('1000', 'user_id');
