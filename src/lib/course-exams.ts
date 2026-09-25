import type { SupabaseClient } from "@supabase/supabase-js";

// An official exam date for a course, curated by us (not user-editable) and
// shown automatically to anyone with that course in their calendar.
export type CourseExam = {
  id: string;
  course_code: string;
  semester: string;
  exam_date: string;
  exam_time: string | null;
  note: string | null;
  source_url: string | null;
};

export async function getCourseExams(supabase: SupabaseClient, courseCodes: string[]) {
  const codes = [...new Set(courseCodes)];
  if (codes.length === 0) return [] as CourseExam[];
  const { data } = await supabase.from("course_exams").select("*").in("course_code", codes);
  return (data ?? []) as CourseExam[];
}

// Which official exams you've edited or deleted (see user_hidden_exams,
// migration 0050) — hidden from your calendar from then on.
export async function getHiddenExamIds(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase.from("user_hidden_exams").select("exam_id").eq("user_id", userId);
  return new Set((data ?? []).map((r) => r.exam_id as string));
}

export function hideExam(supabase: SupabaseClient, userId: string, examId: string) {
  return supabase.from("user_hidden_exams").insert({ user_id: userId, exam_id: examId });
}
