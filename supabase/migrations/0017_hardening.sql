-- Hardening pass. Everything here is idempotent, so it is safe to re-run.

-- 1. Follow requests must start as "pending". Before this, a client could
--    insert status = 'accepted' directly and skip the approval step.
drop policy if exists "follow_insert" on public.follows;
create policy "follow_insert"
  on public.follows for insert
  to authenticated
  with check (follower_id = auth.uid() and status = 'pending');

-- 2. Only the columns that are meant to change can be updated from the client.
--    (The followee may accept a request, but not rewrite who follows whom; a
--    user may edit their profile, but not their IFI username or id.)
revoke update on public.follows from authenticated;
grant update (status) on public.follows to authenticated;

revoke update on public.profiles from authenticated;
grant update (full_name, username, github_url, linkedin_url, study_program, study_year, accent_color)
  on public.profiles to authenticated;

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- 3. Usernames are matched case-insensitively (profile URLs, search), so they
--    must be unique case-insensitively too.
create unique index if not exists profiles_username_lower_key
  on public.profiles (lower(username));

-- 4. Capacity is enforced in the database. The UI only disables the button,
--    which two people joining the last spot at once (or a direct API call, or
--    accepting an invite) could get around.
alter table public.groups drop constraint if exists groups_max_members_positive;
alter table public.groups
  add constraint groups_max_members_positive
  check (max_members is null or max_members > 0) not valid;

create or replace function public.enforce_group_capacity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  cap int;
  current_count int;
begin
  -- Lock the group row so concurrent joins are serialised.
  select max_members into cap from public.groups where id = new.group_id for update;
  if cap is not null then
    select count(*) into current_count from public.group_members where group_id = new.group_id;
    if current_count >= cap then
      raise exception 'Group is full';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists group_members_capacity on public.group_members;
create trigger group_members_capacity
  before insert on public.group_members
  for each row execute function public.enforce_group_capacity();

-- The owner can't shrink a group below the number of people already in it.
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

  if p_max_members is not null
     and p_max_members < (select count(*) from public.group_members where group_id = gid) then
    raise exception 'Max members is lower than the current member count';
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

grant execute on function public.update_group(uuid, text, text, text, text, text, date, time, int) to authenticated;

-- 5. Member counts for many groups in one round trip (the lists used to make
--    one call per group).
create or replace function public.group_member_counts(gids uuid[])
returns table (group_id uuid, member_count int)
language sql
security definer
set search_path = public
stable
as $$
  select gm.group_id, count(*)::int
  from public.group_members gm
  where gm.group_id = any(gids)
  group by gm.group_id;
$$;

grant execute on function public.group_member_counts(uuid[]) to authenticated;

-- 6. Leftover debug helper from earlier troubleshooting.
drop function if exists public.debug_whoami();
