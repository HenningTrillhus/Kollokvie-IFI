create table if not exists public.group_invites (
  group_id uuid not null references public.groups (id) on delete cascade,
  invitee_id uuid not null references auth.users (id) on delete cascade,
  inviter_id uuid not null references auth.users (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz not null default now(),
  primary key (group_id, invitee_id)
);

alter table public.group_invites enable row level security;

create policy "group_invites_select"
  on public.group_invites for select
  to authenticated
  using (invitee_id = auth.uid() or inviter_id = auth.uid());

grant select on public.group_invites to authenticated;

-- Writes go through security-definer functions below (same defensive
-- pattern as create_group, after the unexplained groups_insert RLS issue).

create or replace function public.invite_to_group(gid uuid, invitee uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_group_member(gid, auth.uid()) then
    raise exception 'Not a member of this group';
  end if;
  if public.is_group_member(gid, invitee) then
    raise exception 'Already a member';
  end if;

  insert into public.group_invites (group_id, invitee_id, inviter_id)
  values (gid, invitee, auth.uid())
  on conflict (group_id, invitee_id)
    do update set status = 'pending', inviter_id = excluded.inviter_id;
end;
$$;

create or replace function public.accept_group_invite(gid uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.group_invites
    where group_id = gid and invitee_id = auth.uid() and status = 'pending'
  ) then
    raise exception 'No pending invite';
  end if;

  update public.group_invites
  set status = 'accepted'
  where group_id = gid and invitee_id = auth.uid();

  insert into public.group_members (group_id, user_id)
  values (gid, auth.uid())
  on conflict do nothing;
end;
$$;

create or replace function public.decline_group_invite(gid uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.group_invites
  set status = 'declined'
  where group_id = gid and invitee_id = auth.uid();
end;
$$;

create or replace function public.update_group(
  gid uuid,
  p_name text,
  p_description text,
  p_course_code text,
  p_visibility text,
  p_location text,
  p_event_date date,
  p_event_time time,
  p_max_members int
)
returns public.groups
language plpgsql
security definer
set search_path = public
as $$
declare
  updated public.groups;
begin
  if not exists (select 1 from public.groups where id = gid and owner_id = auth.uid()) then
    raise exception 'Not the owner of this group';
  end if;

  update public.groups
  set name = p_name,
      description = p_description,
      course_code = p_course_code,
      visibility = coalesce(p_visibility, visibility),
      location = p_location,
      event_date = p_event_date,
      event_time = p_event_time,
      max_members = p_max_members
  where id = gid
  returning * into updated;

  return updated;
end;
$$;

create or replace function public.delete_group(gid uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.groups where id = gid and owner_id = auth.uid();
end;
$$;

grant execute on function public.invite_to_group(uuid, uuid) to authenticated;
grant execute on function public.accept_group_invite(uuid) to authenticated;
grant execute on function public.decline_group_invite(uuid) to authenticated;
grant execute on function public.update_group(uuid, text, text, text, text, text, date, time, int) to authenticated;
grant execute on function public.delete_group(uuid) to authenticated;
