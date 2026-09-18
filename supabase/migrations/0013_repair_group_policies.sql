-- Repair: re-create every groups/group_members policy idempotently, in case
-- one was dropped or edited by hand in the Supabase dashboard.
drop policy if exists "groups_select" on public.groups;
drop policy if exists "groups_insert" on public.groups;
drop policy if exists "groups_update" on public.groups;
drop policy if exists "groups_delete" on public.groups;
drop policy if exists "group_members_select" on public.group_members;
drop policy if exists "group_members_insert" on public.group_members;
drop policy if exists "group_members_delete" on public.group_members;

create policy "groups_select"
  on public.groups for select
  to authenticated
  using (
    public.is_group_member(id, auth.uid())
    or public.can_join_group(id, auth.uid())
  );

create policy "groups_insert"
  on public.groups for insert
  to authenticated
  with check (owner_id = auth.uid());

create policy "groups_update"
  on public.groups for update
  to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "groups_delete"
  on public.groups for delete
  to authenticated
  using (owner_id = auth.uid());

create policy "group_members_select"
  on public.group_members for select
  to authenticated
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.groups g
      where g.id = group_id
      and (g.visibility = 'public' or g.owner_id = auth.uid() or public.is_group_member(g.id, auth.uid()))
    )
  );

create policy "group_members_insert"
  on public.group_members for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and public.can_join_group(group_id, auth.uid())
  );

create policy "group_members_delete"
  on public.group_members for delete
  to authenticated
  using (
    user_id = auth.uid()
    or exists (select 1 from public.groups g where g.id = group_id and g.owner_id = auth.uid())
  );

grant select, insert, update, delete on public.groups to authenticated;
grant select, insert, delete on public.group_members to authenticated;
