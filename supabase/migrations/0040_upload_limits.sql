-- Strengere grenser for opplastede bilder og noen flere tekstregler. Kjør i Supabase → SQL Editor.
-- Trygt å kjøre flere ganger.

-- 1. Profilbilder er alltid et lite JPEG (256 x 256, vanligvis rundt 20 KB). Appen sjekker og
--    komprimerer det, og serveren gjør det en gang til. Bøtta tar aldri imot mer enn 100 KB.
update storage.buckets
set file_size_limit = 102400,
    allowed_mime_types = array['image/jpeg']
where id = 'avatars';

-- 2. Studielinje og profilfarge kunne før settes til hva som helst via API-et.
alter table public.profiles drop constraint if exists profiles_misc_format;
alter table public.profiles
  add constraint profiles_misc_format check (
    (study_program is null or (char_length(study_program) <= 120 and public.clean_text(study_program)))
    and accent_color ~ '^#[0-9a-fA-F]{6}$'
  ) not valid;
