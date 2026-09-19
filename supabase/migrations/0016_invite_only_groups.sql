-- A third visibility level: 'invite' groups can't be discovered or joined
-- freely. Only members, the owner and people with a pending invite can see
-- them, and only the owner can send invites.
alter table public.groups drop constraint if exists groups_visibility_check;
alter table public.groups
  add constraint groups_visibility_check
  check (visibility in ('public', 'private', 'invite'));

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
      g.owner_id = uid
      or g.visibility = 'public'
      or (
        g.visibility = 'private'
        and exists (
          select 1 from public.follows f
          where f.status = 'accepted'
          and (
            (f.follower_id = uid and f.followee_id = g.owner_id)
            or (f.followee_id = uid and f.follower_id = g.owner_id)
          )
        )
      )
      or (
        g.visibility = 'invite'
        and exists (
          select 1 from public.group_invites i
          where i.group_id = g.id and i.invitee_id = uid and i.status = 'pending'
        )
      )
    )
  );
$$;

create or replace function public.invite_to_group(gid uuid, invitee uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  g public.groups;
begin
  select * into g from public.groups where id = gid;
  if g.id is null then
    raise exception 'No such group';
  end if;

  if g.visibility = 'invite' then
    if g.owner_id <> auth.uid() then
      raise exception 'Only the owner can invite to this group';
    end if;
  elsif not public.is_group_member(gid, auth.uid()) then
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

grant execute on function public.can_join_group(uuid, uuid) to authenticated;
grant execute on function public.invite_to_group(uuid, uuid) to authenticated;
