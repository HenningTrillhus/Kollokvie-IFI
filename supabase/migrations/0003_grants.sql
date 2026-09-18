-- Tables created via the SQL Editor don't automatically get the base
-- privilege grants Supabase's table editor would normally add — RLS
-- policies only take effect on top of an existing GRANT, they don't
-- replace it. Without this, every query fails with
-- "permission denied for table ..." regardless of the RLS policies.
grant usage on schema public to authenticated;
grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.follows to authenticated;
