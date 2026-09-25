import type { SupabaseClient } from "@supabase/supabase-js";

// An official oblig (mandatory assignment) deadline for a course, curated by
// us (not user-editable) and shown automatically to anyone with that course
// in their calendar. Same idea as lib/course-exams.ts, just for obliger —
// kept as its own table so the two can be maintained independently.
export type CourseDeadline = {
  id: string;
  course_code: string;
  semester: string;
  deadline_date: string;
  deadline_time: string | null;
  note: string | null;
  source_url: string | null;
};

export async function getCourseDeadlines(supabase: SupabaseClient, courseCodes: string[]) {
  const codes = [...new Set(courseCodes)];
  if (codes.length === 0) return [] as CourseDeadline[];
  const { data } = await supabase.from("course_deadlines").select("*").in("course_code", codes);
  return (data ?? []) as CourseDeadline[];
}
