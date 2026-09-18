-- groups_select only allowed public/owner/members to see a group row, so a
-- friend eligible to join a private group (per can_join_group) could never
-- even load its page to find the "Bli med" button. Fold can_join_group's
-- eligibility check into visibility too (it already covers public + owner).
drop policy if exists "groups_select" on public.groups;

create policy "groups_select"
  on public.groups for select
  to authenticated
  using (
    public.is_group_member(id, auth.uid())
    or public.can_join_group(id, auth.uid())
  );
