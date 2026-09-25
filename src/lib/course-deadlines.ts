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

// Which official obliger you've edited or deleted (see user_hidden_deadlines,
// migration 0050) — hidden from your calendar from then on.
export async function getHiddenDeadlineIds(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase
    .from("user_hidden_deadlines")
    .select("deadline_id")
    .eq("user_id", userId);
  return new Set((data ?? []).map((r) => r.deadline_id as string));
}

export function hideDeadline(supabase: SupabaseClient, userId: string, deadlineId: string) {
  return supabase.from("user_hidden_deadlines").insert({ user_id: userId, deadline_id: deadlineId });
}

// Which of your automatically-added obliger you've ticked off (see
// user_deadline_completions, migration 0049). course_deadlines itself is
// shared and read-only, so "done" can't live on that row.
export async function getDeadlineCompletions(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase
    .from("user_deadline_completions")
    .select("deadline_id")
    .eq("user_id", userId);
  return new Set((data ?? []).map((r) => r.deadline_id as string));
}

export async function setDeadlineCompletion(
  supabase: SupabaseClient,
  userId: string,
  deadlineId: string,
  done: boolean
) {
  if (done) {
    // ignoreDuplicates -> ON CONFLICT DO NOTHING instead of DO UPDATE: there's
    // nothing to update (the row's mere existence is the "done" state), and
    // DO UPDATE would need an update grant/policy we don't otherwise need.
    return supabase.from("user_deadline_completions").upsert(
      { user_id: userId, deadline_id: deadlineId },
      { onConflict: "user_id,deadline_id", ignoreDuplicates: true }
    );
  }
  return supabase
    .from("user_deadline_completions")
    .delete()
    .eq("user_id", userId)
    .eq("deadline_id", deadlineId);
}
