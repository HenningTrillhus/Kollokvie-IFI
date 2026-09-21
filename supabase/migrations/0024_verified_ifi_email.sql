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
