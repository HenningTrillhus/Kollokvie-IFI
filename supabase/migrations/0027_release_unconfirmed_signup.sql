-- A sign-up that was never confirmed (the email didn't arrive, the person gave
-- up) must not block anyone. Otherwise a half-finished registration would lock
-- the email address and the username, and a stranger could reserve someone
-- else's UiO address just by starting a sign-up in their name.
--
-- Called by the sign-up form before it creates the account. It only removes
-- accounts whose email was never confirmed; confirmed accounts are untouched.
-- Deleting the auth user also removes its profile (cascade).
create or replace function public.release_unconfirmed_signup(p_email text, p_username text default null)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if lower(coalesce(p_email, '')) !~ '^[a-z0-9._-]+@uio\.no$' then
    return;
  end if;

  delete from auth.users u
  where u.email_confirmed_at is null
    and (
      lower(u.email) = lower(p_email)
      or (
        p_username is not null
        and exists (
          select 1 from public.profiles p
          where p.id = u.id and lower(p.username) = lower(trim(p_username))
        )
      )
    );
end;
$$;

grant execute on function public.release_unconfirmed_signup(text, text) to anon, authenticated;
