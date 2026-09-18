-- Follow relationships. A row is a request from follower_id to followee_id;
-- it starts "pending" and only becomes "accepted" once the followee approves it.
create table if not exists public.follows (
  follower_id uuid not null references auth.users (id) on delete cascade,
  followee_id uuid not null references auth.users (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted')),
  created_at timestamptz not null default now(),
  primary key (follower_id, followee_id),
  check (follower_id <> followee_id)
);

alter table public.follows enable row level security;

-- Bypasses RLS so it can be used *inside* the follows select policy below
-- without the policy recursively re-checking itself.
create or replace function public.is_following(viewer uuid, target uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.follows
    where follower_id = viewer and followee_id = target and status = 'accepted'
  );
$$;

-- True follower/following counts, unaffected by the row-level privacy rule
-- below (so counts stay visible even to people who can't see the list).
create or replace function public.follow_counts(target uuid)
returns table (followers int, following int)
language sql
security definer
set search_path = public
stable
as $$
  select
    (select count(*) from public.follows where followee_id = target and status = 'accepted')::int,
    (select count(*) from public.follows where follower_id = target and status = 'accepted')::int;
$$;

-- You can always see your own incoming/outgoing edges. To see someone else's
-- full follow/follower list you must already be an accepted follower of them.
create policy "follow_select"
  on public.follows for select
  to authenticated
  using (
    follower_id = auth.uid()
    or followee_id = auth.uid()
    or public.is_following(auth.uid(), follower_id)
    or public.is_following(auth.uid(), followee_id)
  );

create policy "follow_insert"
  on public.follows for insert
  to authenticated
  with check (follower_id = auth.uid());

-- Only the followee can update a row (to accept a pending request).
create policy "follow_update"
  on public.follows for update
  to authenticated
  using (followee_id = auth.uid())
  with check (followee_id = auth.uid());

-- Either side can delete: the follower unfollows/cancels a request, or the
-- followee declines a request/removes a follower.
create policy "follow_delete"
  on public.follows for delete
  to authenticated
  using (follower_id = auth.uid() or followee_id = auth.uid());
