create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  description text,
  course_code text references public.courses (code),
  visibility text not null default 'public' check (visibility in ('public', 'private')),
  location text,
  event_date date,
  event_time time,
  max_members int,
  created_at timestamptz not null default now()
);

create table if not exists public.group_members (
  group_id uuid not null references public.groups (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

alter table public.groups enable row level security;
alter table public.group_members enable row level security;

create or replace function public.is_group_member(gid uuid, uid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.group_members where group_id = gid and user_id = uid
  );
$$;

-- A "friend" here means an accepted follow relationship in either direction.
create or replace function public.can_join_group(gid uuid, uid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.groups g
    where g.id = gid
    and (
      g.visibility = 'public'
      or g.owner_id = uid
      or exists (
        select 1 from public.follows f
        where f.status = 'accepted'
        and (
          (f.follower_id = uid and f.followee_id = g.owner_id)
          or (f.followee_id = uid and f.follower_id = g.owner_id)
        )
      )
    )
  );
$$;

grant execute on function public.is_group_member(uuid, uuid) to authenticated;
grant execute on function public.can_join_group(uuid, uuid) to authenticated;

create policy "groups_select"
  on public.groups for select
  to authenticated
  using (
    visibility = 'public'
    or owner_id = auth.uid()
    or public.is_group_member(id, auth.uid())
  );

create policy "groups_insert"
  on public.groups for insert
  to authenticated
  with check (owner_id = auth.uid());

create policy "groups_update"
  on public.groups for update
  to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "groups_delete"
  on public.groups for delete
  to authenticated
  using (owner_id = auth.uid());

create policy "group_members_select"
  on public.group_members for select
  to authenticated
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.groups g
      where g.id = group_id
      and (g.visibility = 'public' or g.owner_id = auth.uid() or public.is_group_member(g.id, auth.uid()))
    )
  );

create policy "group_members_insert"
  on public.group_members for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and public.can_join_group(group_id, auth.uid())
  );

create policy "group_members_delete"
  on public.group_members for delete
  to authenticated
  using (
    user_id = auth.uid()
    or exists (select 1 from public.groups g where g.id = group_id and g.owner_id = auth.uid())
  );

grant select, insert, update, delete on public.groups to authenticated;
grant select, insert, delete on public.group_members to authenticated;
