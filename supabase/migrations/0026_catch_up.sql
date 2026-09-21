-- Catch-up. 0017 (hardening) and 0021 (consent columns) were never applied, so
-- 0024 (which needs the 0021 columns) failed with "Database error saving new user".
-- This runs them in the right order, in one go. Everything is safe to re-run.
-- Run it once in the SQL Editor.

-- ===== 0017: hardening =====
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

-- 0017 revokes column updates on profiles; restore the ones added later.
grant update (avatar) on public.profiles to authenticated;

-- ===== 0021: consent columns =====
-- Record when, and to which version of the privacy policy, each user consented.
alter table public.profiles
  add column if not exists privacy_version text,
  add column if not exists privacy_accepted_at timestamptz;

-- A user may record their own consent (and nothing else changes with this grant).
grant update (privacy_version, privacy_accepted_at) on public.profiles to authenticated;

-- New accounts: the signup form sends the accepted version in the metadata.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  accepted text := nullif(new.raw_user_meta_data ->> 'privacy_version', '');
begin
  insert into public.profiles (
    id, full_name, username, ifi_username, privacy_version, privacy_accepted_at
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'username', new.id::text),
    coalesce(new.raw_user_meta_data ->> 'ifi_username', ''),
    accepted,
    case when accepted is not null then now() end
  );
  return new;
end;
$$;

-- Existing users have no recorded consent yet (privacy_version is null), so
-- they are asked once on their next visit.

-- ===== 0024: verified UiO email (must come last: it replaces handle_new_user) =====
-- Only UiO email addresses (username@uio.no) can create an account, and the
-- IFI username is read from the verified address (not from what the client claims).
--
-- Run this at the same time as switching on email codes
-- (NEXT_PUBLIC_EMAIL_VERIFICATION=1). Before that, sign-ups still use the old
-- made-up address and this would block them.

create or replace function public.enforce_ifi_email()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if lower(coalesce(new.email, '')) !~ '^[a-z0-9._-]+@uio\.no$' then
    raise exception 'Only UiO email addresses can register';
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_ifi_email_trg on auth.users;
create trigger enforce_ifi_email_trg
  before insert on auth.users
  for each row execute function public.enforce_ifi_email();

-- The profile's IFI username comes from the email address.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  accepted text := nullif(new.raw_user_meta_data ->> 'privacy_version', '');
  ifi text := split_part(lower(coalesce(new.email, '')), '@', 1);
begin
  insert into public.profiles (
    id, full_name, username, ifi_username, privacy_version, privacy_accepted_at
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'username', new.id::text),
    coalesce(nullif(ifi, ''), new.raw_user_meta_data ->> 'ifi_username', ''),
    accepted,
    case when accepted is not null then now() end
  );
  return new;
end;
$$;
