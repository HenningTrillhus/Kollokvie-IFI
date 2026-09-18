create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  event_date date not null,
  type text not null default 'other' check (type in ('exam', 'deadline', 'other')),
  created_at timestamptz not null default now()
);

create index if not exists events_user_date_idx on public.events (user_id, event_date);

alter table public.events enable row level security;

create policy "events_select_own"
  on public.events for select
  to authenticated
  using (user_id = auth.uid());

create policy "events_insert_own"
  on public.events for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "events_update_own"
  on public.events for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "events_delete_own"
  on public.events for delete
  to authenticated
  using (user_id = auth.uid());

grant select, insert, update, delete on public.events to authenticated;
