-- Official exam dates, curated by us (never user-editable) and shown
-- automatically on the calendar of anyone who has that course added, as an
-- "exam" item titled "Eksamen" (see cal.exam), alongside their own events.
--
-- Fetched from each course's own UiO exam page
-- (https://www.uio.no/studier/emner/matnat/ifi/<CODE>/h26/eksamen/) on
-- 2026-09-22. Left out on purpose, not by oversight:
--   - IN1010, IN1030, IN1080, IN1150, IN1160, IN2000, IN3000, IN5420 only
--     run in spring, so they have no autumn 2026 exam.
--   - IN5310 is graded on a project and a report, not a dated exam.
-- This needs redoing (a new migration) every semester as new dates are
-- published; it is not fetched automatically.

create table if not exists public.course_exams (
  id uuid primary key default gen_random_uuid(),
  course_code text not null references public.courses (code) on delete cascade,
  -- "2026h" / "2027v" (see lib/semesters.ts semesterCode).
  semester text not null,
  exam_date date not null,
  -- "09:00", or null if UiO hasn't published a time.
  exam_time text,
  -- Short human note (exam type, duration), e.g. "Avsluttende skriftlig eksamen (4 timer)".
  note text,
  -- The UiO page this came from, also shown as the "read more" link.
  source_url text,
  created_at timestamptz not null default now(),
  unique (course_code, semester, exam_date)
);

create index if not exists course_exams_course_idx on public.course_exams (course_code);

alter table public.course_exams enable row level security;

-- Read-only for everyone signed in: nobody edits official exam dates from the app.
create policy "course_exams_select_all"
  on public.course_exams for select
  to authenticated
  using (true);

grant select on public.course_exams to authenticated;

insert into public.course_exams (course_code, semester, exam_date, exam_time, note, source_url) values
  ('IN1000', '2026h', '2026-12-04', '09:00', 'Skriftlig skoleeksamen (4 timer)', 'https://www.uio.no/studier/emner/matnat/ifi/IN1000/h26/eksamen/'),
  ('IN1020', '2026h', '2026-12-16', '15:00', 'Skriftlig skoleeksamen (4 timer)', 'https://www.uio.no/studier/emner/matnat/ifi/IN1020/h26/eksamen/'),
  ('IN1050', '2026h', '2026-12-02', '09:00', 'Avsluttende skriftlig eksamen (4 timer)', 'https://www.uio.no/studier/emner/matnat/ifi/IN1050/h26/eksamen/'),
  ('IN1900', '2026h', '2026-10-06', '09:00', 'Skriftlig eksamen midt i semesteret (2 timer)', 'https://www.uio.no/studier/emner/matnat/ifi/IN1900/h26/eksamen/'),
  ('IN1900', '2026h', '2026-12-11', '15:00', 'Avsluttende skriftlig eksamen (4 timer)', 'https://www.uio.no/studier/emner/matnat/ifi/IN1900/h26/eksamen/'),
  ('IN2010', '2026h', '2026-12-11', '09:00', 'Avsluttende skriftlig eksamen (4 timer)', 'https://www.uio.no/studier/emner/matnat/ifi/IN2010/h26/eksamen/'),
  ('IN2020', '2026h', '2026-12-09', '09:00', 'Avsluttende skriftlig eksamen (4 timer)', 'https://www.uio.no/studier/emner/matnat/ifi/IN2020/h26/eksamen/'),
  ('IN2040', '2026h', '2026-12-18', '15:00', 'Avsluttende skriftlig eksamen (4 timer)', 'https://www.uio.no/studier/emner/matnat/ifi/IN2040/h26/eksamen/'),
  ('IN2060', '2026h', '2026-12-02', '15:00', 'Avsluttende skriftlig eksamen (4 timer)', 'https://www.uio.no/studier/emner/matnat/ifi/IN2060/h26/eksamen/'),
  ('IN2090', '2026h', '2026-12-09', '09:00', 'Avsluttende skriftlig eksamen (4 timer)', 'https://www.uio.no/studier/emner/matnat/ifi/IN2090/h26/eksamen/'),
  ('IN2120', '2026h', '2026-12-03', '09:00', 'Avsluttende skriftlig eksamen (4 timer)', 'https://www.uio.no/studier/emner/matnat/ifi/IN2120/h26/eksamen/'),
  ('IN3050', '2026h', '2026-11-30', '09:00', 'Avsluttende skriftlig eksamen (4 timer)', 'https://www.uio.no/studier/emner/matnat/ifi/IN3050/h26/eksamen/'),
  ('IN4050', '2026h', '2026-11-30', '09:00', 'Avsluttende skriftlig eksamen (4 timer)', 'https://www.uio.no/studier/emner/matnat/ifi/IN4050/h26/eksamen/'),
  ('IN5020', '2026h', '2026-12-11', '15:00', 'Avsluttende skriftlig eksamen (4 timer)', 'https://www.uio.no/studier/emner/matnat/ifi/IN5020/h26/eksamen/')
on conflict (course_code, semester, exam_date) do update set
  exam_time = excluded.exam_time,
  note = excluded.note,
  source_url = excluded.source_url;
