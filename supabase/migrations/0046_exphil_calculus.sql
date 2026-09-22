-- Adds Examen philosophicum and the Calculus courses (MAT1100, MAT1110) —
-- not IFI courses, but ones almost everyone on an IFI bachelor takes — plus
-- their autumn 2026 exam dates, fetched the same way as 0044.
--
-- MAT1110 only runs in spring, so it has no autumn exam to add yet.
-- EXPHIL03 has several exam variants (seminar/self-study/digital) that all
-- fall on the same day; the exact time depends on which one you're in, so
-- only the date is given here — check Studentweb for your own time.
--
-- Kjør i Supabase → SQL Editor. Trygt å kjøre flere ganger.

insert into public.courses (code, name) values
  ('EXPHIL03', 'Examen philosophicum'),
  ('MAT1100', 'Kalkulus'),
  ('MAT1110', 'Kalkulus og lineær algebra')
on conflict (code) do nothing;

insert into public.course_exams (course_code, semester, exam_date, exam_time, note, source_url) values
  ('EXPHIL03', '2026h', '2026-12-01', null, 'Eksamen (flere varianter — hjemmeeksamen, skoleeksamen eller mappe. Sjekk Studentweb for din variant og ditt klokkeslett.)', 'https://www.uio.no/studier/emner/hf/ifikk/EXPHIL03/h26/eksamen/'),
  ('MAT1100', '2026h', '2026-10-05', '15:00', 'Skriftlig eksamen midt i semesteret (2 timer)', 'https://www.uio.no/studier/emner/matnat/math/MAT1100/h26/eksamen/'),
  ('MAT1100', '2026h', '2026-12-07', '15:00', 'Avsluttende skriftlig eksamen (4 timer)', 'https://www.uio.no/studier/emner/matnat/math/MAT1100/h26/eksamen/')
on conflict (course_code, semester, exam_date) do update set
  exam_time = excluded.exam_time,
  note = excluded.note,
  source_url = excluded.source_url;
