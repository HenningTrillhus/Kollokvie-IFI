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

export function isGroupFull(group: Group, memberCount: number) {
  return group.max_members !== null && memberCount >= group.max_members;
}

// Groups with room come first (newest first, as fetched), full ones go last.
export function withFullGroupsLast<T extends { group: Group; memberCount: number }>(
  items: T[]
) {
  const open = items.filter((i) => !isGroupFull(i.group, i.memberCount));
  const full = items.filter((i) => isGroupFull(i.group, i.memberCount));
  return [...open, ...full];
}
