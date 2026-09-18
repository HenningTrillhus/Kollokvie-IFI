-- True member count, unaffected by group_members' own-visibility RLS, so a
-- non-member (e.g. someone eligible to join a private group) sees the real
-- number instead of 0.
create or replace function public.group_member_count(gid uuid)
returns int
language sql
security definer
set search_path = public
stable
as $$
  select count(*)::int from public.group_members where group_id = gid;
$$;

grant execute on function public.group_member_count(uuid) to authenticated;
