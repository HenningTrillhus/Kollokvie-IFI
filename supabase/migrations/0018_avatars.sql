-- Profile pictures. profiles.avatar is either
--   'preset:NN'    one of the 21 built-in icons (public/avatars/avatar-NN.webp), or
--   'upload:<v>'   the user's own picture, stored at avatars/<user id>/avatar.jpg
--                  (<v> is a version number used to bust caches).
-- Only these two shapes are allowed, so a profile can never point at an
-- arbitrary external image.
alter table public.profiles add column if not exists avatar text;

alter table public.profiles drop constraint if exists profiles_avatar_format;
alter table public.profiles
  add constraint profiles_avatar_format
  check (avatar is null or avatar ~ '^(preset:(0[1-9]|1[0-9]|2[01])|upload:[0-9]{1,15})$');

grant update (avatar) on public.profiles to authenticated;

-- Storage bucket for uploaded pictures: public to read, 1 MB max, images only.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 1048576, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = true,
      file_size_limit = 1048576,
      allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

-- Everyone can read; each user can only write inside their own folder.
drop policy if exists "avatars_read" on storage.objects;
create policy "avatars_read"
  on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists "avatars_insert_own" on storage.objects;
create policy "avatars_insert_own"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "avatars_update_own" on storage.objects;
create policy "avatars_update_own"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "avatars_delete_own" on storage.objects;
create policy "avatars_delete_own"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
