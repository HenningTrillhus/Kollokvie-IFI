-- Official oblig (mandatory assignment) deadlines — the same idea as
-- course_exams (0044), just for obliger instead of exams. Read-only (curated
-- by us, never user-editable) and merged into the calendar automatically for
-- anyone with that course added, as a "deadline" item titled "Oblig".
--
-- Fetched from each course's own UiO pages (linked in source_url below) on
-- 2026-09-25. Left out on purpose, not by oversight:
--   - Only courses with a fixed, published deadline are included. Several
--     courses (IN5020, EXPHIL03) either have no obliger or none with a
--     published date yet.
--   - IN1900 publishes exercise booklets but no dated obliger.
-- Some deadlines above don't give a time (UiO only published a date); those
-- are left null rather than guessed. This needs redoing next semester, same
-- as course_exams.

create table if not exists public.course_deadlines (
  id uuid primary key default gen_random_uuid(),
  course_code text not null references public.courses (code) on delete cascade,
  -- "2026h" / "2027v" (see lib/semesters.ts semesterCode).
  semester text not null,
  deadline_date date not null,
  -- "23:59", or null if UiO hasn't published a time.
  deadline_time text,
  -- Short human note, e.g. "Oblig 2 av 4".
  note text,
  -- The UiO page this came from, also shown as the "read more" link.
  source_url text,
  created_at timestamptz not null default now(),
  unique (course_code, semester, deadline_date)
);

create index if not exists course_deadlines_course_idx on public.course_deadlines (course_code);

alter table public.course_deadlines enable row level security;

-- Read-only for everyone signed in: nobody edits official deadlines from the app.
create policy "course_deadlines_select_all"
  on public.course_deadlines for select
  to authenticated
  using (true);

grant select on public.course_deadlines to authenticated;

insert into public.course_deadlines (course_code, semester, deadline_date, deadline_time, note, source_url) values
  ('IN1000', '2026h', '2026-08-25', '23:59', 'Oblig 1 av 8', 'https://www.uio.no/studier/emner/matnat/ifi/IN1000/h26/Obligatoriske%20innleveringer/'),
  ('IN1000', '2026h', '2026-09-01', '23:59', 'Oblig 2 av 8', 'https://www.uio.no/studier/emner/matnat/ifi/IN1000/h26/Obligatoriske%20innleveringer/'),
  ('IN1000', '2026h', '2026-09-08', '23:59', 'Oblig 3 av 8', 'https://www.uio.no/studier/emner/matnat/ifi/IN1000/h26/Obligatoriske%20innleveringer/'),
  ('IN1000', '2026h', '2026-09-15', '23:59', 'Oblig 4 av 8', 'https://www.uio.no/studier/emner/matnat/ifi/IN1000/h26/Obligatoriske%20innleveringer/'),
  ('IN1000', '2026h', '2026-09-29', '23:59', 'Oblig 5 av 8', 'https://www.uio.no/studier/emner/matnat/ifi/IN1000/h26/Obligatoriske%20innleveringer/'),
  ('IN1000', '2026h', '2026-10-06', '23:59', 'Oblig 6 av 8', 'https://www.uio.no/studier/emner/matnat/ifi/IN1000/h26/Obligatoriske%20innleveringer/'),
  ('IN1000', '2026h', '2026-10-20', '23:59', 'Oblig 7 av 8', 'https://www.uio.no/studier/emner/matnat/ifi/IN1000/h26/Obligatoriske%20innleveringer/'),
  ('IN1000', '2026h', '2026-11-03', '23:59', 'Oblig 8 av 8', 'https://www.uio.no/studier/emner/matnat/ifi/IN1000/h26/Obligatoriske%20innleveringer/'),

  ('IN1020', '2026h', '2026-09-22', '23:59', 'Oblig 1 av 3', 'https://www.uio.no/studier/emner/matnat/ifi/IN1020/h26/obligatoriske-innleveringer/'),
  ('IN1020', '2026h', '2026-10-20', '23:59', 'Oblig 2 av 3', 'https://www.uio.no/studier/emner/matnat/ifi/IN1020/h26/obligatoriske-innleveringer/'),
  ('IN1020', '2026h', '2026-11-13', '23:59', 'Oblig 3 av 3', 'https://www.uio.no/studier/emner/matnat/ifi/IN1020/h26/obligatoriske-innleveringer/'),

  ('IN1050', '2026h', '2026-09-04', '23:59', 'Oblig 1 av 4', 'https://www.uio.no/studier/emner/matnat/ifi/IN1050/h26/'),
  ('IN1050', '2026h', '2026-09-25', '23:59', 'Oblig 2 av 4', 'https://www.uio.no/studier/emner/matnat/ifi/IN1050/h26/'),
  ('IN1050', '2026h', '2026-10-16', '23:59', 'Oblig 3 av 4', 'https://www.uio.no/studier/emner/matnat/ifi/IN1050/h26/'),
  ('IN1050', '2026h', '2026-11-06', '23:59', 'Oblig 4 av 4', 'https://www.uio.no/studier/emner/matnat/ifi/IN1050/h26/'),

  ('IN2010', '2026h', '2026-09-18', null, 'Oblig 1 av 3', 'https://www.uio.no/studier/emner/matnat/ifi/IN2010/h26/innleveringer/'),
  ('IN2010', '2026h', '2026-10-12', null, 'Oblig 2 av 3', 'https://www.uio.no/studier/emner/matnat/ifi/IN2010/h26/innleveringer/'),
  ('IN2010', '2026h', '2026-11-06', null, 'Oblig 3 av 3', 'https://www.uio.no/studier/emner/matnat/ifi/IN2010/h26/innleveringer/'),

  ('IN2020', '2026h', '2026-09-23', null, 'Oblig 1 av 3', 'https://www.uio.no/studier/emner/matnat/ifi/IN2020/h26/beskjeder/'),
  ('IN2020', '2026h', '2026-10-14', null, 'Oblig 2 av 3', 'https://www.uio.no/studier/emner/matnat/ifi/IN2020/h26/beskjeder/'),
  ('IN2020', '2026h', '2026-10-28', null, 'Oblig 3 av 3', 'https://www.uio.no/studier/emner/matnat/ifi/IN2020/h26/beskjeder/'),

  ('IN2040', '2026h', '2026-09-04', '23:59', 'Oblig 1a av 5', 'https://www.uio.no/studier/emner/matnat/ifi/IN2040/h26/innleveringer.html'),
  ('IN2040', '2026h', '2026-09-18', '23:59', 'Oblig 1b av 5', 'https://www.uio.no/studier/emner/matnat/ifi/IN2040/h26/innleveringer.html'),
  ('IN2040', '2026h', '2026-10-02', '23:59', 'Oblig 2a av 5', 'https://www.uio.no/studier/emner/matnat/ifi/IN2040/h26/innleveringer.html'),
  ('IN2040', '2026h', '2026-10-16', '23:59', 'Oblig 2b av 5', 'https://www.uio.no/studier/emner/matnat/ifi/IN2040/h26/innleveringer.html'),
  ('IN2040', '2026h', '2026-10-30', '23:59', 'Oblig 3 av 5', 'https://www.uio.no/studier/emner/matnat/ifi/IN2040/h26/innleveringer.html'),

  ('IN2060', '2026h', '2026-09-10', '23:59', 'Oblig 1 av 2', 'https://www.uio.no/studier/emner/matnat/ifi/IN2060/h26/Obliger/'),
  ('IN2060', '2026h', '2026-10-08', '23:59', 'Oblig 2 av 2', 'https://www.uio.no/studier/emner/matnat/ifi/IN2060/h26/Obliger/'),

  ('IN2090', '2026h', '2026-09-24', null, 'Obligatorisk innlevering', 'https://www.uio.no/studier/emner/matnat/ifi/IN2090/h26/innleveringer/'),

  ('IN2120', '2026h', '2026-09-11', null, 'Oblig 1 av 4', 'https://www.uio.no/studier/emner/matnat/ifi/IN2120/h26/dokumenter/oblig.html'),
  ('IN2120', '2026h', '2026-10-02', null, 'Oblig 2 av 4', 'https://www.uio.no/studier/emner/matnat/ifi/IN2120/h26/dokumenter/oblig.html'),
  ('IN2120', '2026h', '2026-10-16', null, 'Oblig 3 av 4', 'https://www.uio.no/studier/emner/matnat/ifi/IN2120/h26/dokumenter/oblig.html'),
  ('IN2120', '2026h', '2026-10-30', null, 'Oblig 4 av 4', 'https://www.uio.no/studier/emner/matnat/ifi/IN2120/h26/dokumenter/oblig.html'),

  ('IN3050', '2026h', '2026-10-06', null, 'Oblig 1 av 2', 'https://www.uio.no/studier/emner/matnat/ifi/IN3050/h26/mandatory_assignments/'),
  ('IN3050', '2026h', '2026-10-27', null, 'Oblig 2 av 2', 'https://www.uio.no/studier/emner/matnat/ifi/IN3050/h26/mandatory_assignments/'),
  ('IN4050', '2026h', '2026-10-06', null, 'Oblig 1 av 2', 'https://www.uio.no/studier/emner/matnat/ifi/IN4050/h26/mandatory-assignments/'),
  ('IN4050', '2026h', '2026-10-27', null, 'Oblig 2 av 2', 'https://www.uio.no/studier/emner/matnat/ifi/IN4050/h26/mandatory-assignments/'),

  ('MAT1100', '2026h', '2026-09-24', '14:30', 'Obligatorisk oppgave I', 'https://www.uio.no/studier/emner/matnat/math/MAT1100/h26/beskjeder/')
on conflict (course_code, semester, deadline_date) do update set
  deadline_time = excluded.deadline_time,
  note = excluded.note,
  source_url = excluded.source_url;
