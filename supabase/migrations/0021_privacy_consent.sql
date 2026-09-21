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
