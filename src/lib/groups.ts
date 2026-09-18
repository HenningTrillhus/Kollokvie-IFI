import type { SupabaseClient } from "@supabase/supabase-js";

export type Visibility = "public" | "private";

export type Group = {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  course_code: string | null;
  visibility: Visibility;
  location: string | null;
  event_date: string | null;
  event_time: string | null;
  max_members: number | null;
  created_at: string;
};

export async function getGroupMemberCount(
  supabase: SupabaseClient,
  groupId: string
) {
  const { data } = await supabase.rpc("group_member_count", { gid: groupId });
  return data ?? 0;
}
