-- Creates a group and joins its owner as the first member, atomically.
-- Runs as a security-definer function so it isn't affected by the
-- mysterious groups_insert RLS failure some environments hit despite an
-- otherwise-correct "owner_id = auth.uid()" policy.
create or replace function public.create_group(
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
  new_group public.groups;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  insert into public.groups (
    owner_id, name, description, course_code, visibility,
    location, event_date, event_time, max_members
  )
  values (
    auth.uid(), p_name, p_description, p_course_code,
    coalesce(p_visibility, 'public'), p_location, p_event_date, p_event_time, p_max_members
  )
  returning * into new_group;

  insert into public.group_members (group_id, user_id)
  values (new_group.id, auth.uid());

  return new_group;
end;
$$;

grant execute on function public.create_group(
  text, text, text, text, text, date, time, int
) to authenticated;
