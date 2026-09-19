import type { SupabaseClient } from "@supabase/supabase-js";

export type Visibility = "public" | "private" | "invite";

export const VISIBILITY_KEYS = {
  public: "common.public",
  private: "common.private",
  invite: "common.inviteOnly",
} as const;

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

// Member counts for many groups in a single round trip. Falls back to one
// call per group if the batch function isn't installed yet.
export async function getGroupMemberCounts(
  supabase: SupabaseClient,
  groupIds: string[]
): Promise<number[]> {
  if (groupIds.length === 0) return [];
  const { data, error } = await supabase.rpc("group_member_counts", { gids: groupIds });
  if (error || !data) {
    return Promise.all(groupIds.map((id) => getGroupMemberCount(supabase, id)));
  }
  const byId = new Map<string, number>(
    (data as { group_id: string; member_count: number }[]).map((r) => [
      r.group_id,
      r.member_count,
    ])
  );
  return groupIds.map((id) => byId.get(id) ?? 0);
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
