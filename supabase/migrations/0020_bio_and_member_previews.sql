-- 1. Bios. A separate table (not a profiles column) so that row-level security
--    can hide it: only the owner and people who follow the owner can read it.
create table if not exists public.profile_bios (
  user_id uuid primary key references auth.users (id) on delete cascade,
  bio text not null check (char_length(bio) between 1 and 160),
  updated_at timestamptz not null default now()
);

alter table public.profile_bios enable row level security;

drop policy if exists "profile_bios_select" on public.profile_bios;
create policy "profile_bios_select"
  on public.profile_bios for select
  to authenticated
  using (user_id = auth.uid() or public.is_following(auth.uid(), user_id));

drop policy if exists "profile_bios_insert_own" on public.profile_bios;
create policy "profile_bios_insert_own"
  on public.profile_bios for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "profile_bios_update_own" on public.profile_bios;
create policy "profile_bios_update_own"
  on public.profile_bios for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "profile_bios_delete_own" on public.profile_bios;
create policy "profile_bios_delete_own"
  on public.profile_bios for delete
  to authenticated
  using (user_id = auth.uid());

grant select, insert, update, delete on public.profile_bios to authenticated;

-- 2. The first few members of each group, for the overlapping avatars on group
--    cards. security invoker: row-level security still applies, so members of a
--    private group you can't see into are not revealed.
create or replace function public.group_member_previews(gids uuid[], per_group int default 4)
returns table (
  group_id uuid,
  user_id uuid,
  full_name text,
  username text,
  accent_color text,
  avatar text
)
language sql
stable
security invoker
set search_path = public
as $$
  select s.group_id, s.user_id, p.full_name, p.username, p.accent_color, p.avatar
  from (
    select gm.group_id, gm.user_id, gm.joined_at,
           row_number() over (partition by gm.group_id order by gm.joined_at, gm.user_id) as rn
    from public.group_members gm
    where gm.group_id = any(gids)
  ) s
  join public.profiles p on p.id = s.user_id
  where s.rn <= per_group
  order by s.group_id, s.rn;
$$;

grant execute on function public.group_member_previews(uuid[], int) to authenticated;
