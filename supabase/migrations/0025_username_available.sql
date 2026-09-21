-- Lets the sign-up form check a username before creating the account, so a
-- taken username gets a clear message (Supabase itself only says
-- "Database error saving new user"). Anyone can ask; it only answers yes/no.
create or replace function public.username_available(name text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select not exists (
    select 1 from public.profiles where lower(username) = lower(trim(name))
  );
$$;

grant execute on function public.username_available(text) to anon, authenticated;
