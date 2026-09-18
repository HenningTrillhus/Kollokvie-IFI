-- Lets a signed-in user delete their own account from the client, without
-- needing the service-role key. Deleting the auth.users row cascades to
-- profiles and follows (both reference auth.users with on delete cascade).
create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from auth.users where id = auth.uid();
end;
$$;

grant execute on function public.delete_own_account() to authenticated;
