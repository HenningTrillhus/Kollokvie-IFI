import type { SupabaseClient } from "@supabase/supabase-js";
import { cleanLine } from "@/lib/sanitize";

export type Course = {
  code: string;
  name: string;
  is_custom: boolean;
};

export async function getAllCourses(supabase: SupabaseClient) {
  const { data } = await supabase.from("courses").select("*").order("code");
  return (data ?? []) as Course[];
}

export async function getUserCourses(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase
    .from("user_courses")
    .select("courses(code, name, is_custom)")
    .eq("user_id", userId);
  return (data ?? [])
    .map((row) => (row as unknown as { courses: Course | null }).courses)
    .filter((c): c is Course => c !== null);
}

export const COURSE_CODE_PATTERN = /^[A-Za-z0-9ÆØÅæøå_-]{2,12}$/;

export async function addCustomCourse(
  supabase: SupabaseClient,
  code: string,
  name: string
) {
  const normalizedCode = code.trim().toUpperCase();
  if (!COURSE_CODE_PATTERN.test(normalizedCode)) return null;
  await supabase
    .from("courses")
    .upsert(
      { code: normalizedCode, name: cleanLine(name), is_custom: true },
      { onConflict: "code", ignoreDuplicates: true }
    );

  const { data } = await supabase
    .from("courses")
    .select("*")
    .eq("code", normalizedCode)
    .maybeSingle();

  return data as Course | null;
}
