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

export const PREVIEW_MEMBERS = 4;

export type MemberPreview = {
  id: string;
  full_name: string;
  username: string;
  accent_color: string;
  avatar: string | null;
};

export type GroupCardData = {
  group: Group;
  memberCount: number;
  members: MemberPreview[];
};

// Everything a group card needs (count + first members), in two round trips
// for the whole list. If the preview function isn't installed yet, cards just
// show without avatars.
export async function getGroupCardData(
  supabase: SupabaseClient,
  groups: Group[]
): Promise<GroupCardData[]> {
  const ids = groups.map((g) => g.id);
  if (ids.length === 0) return [];

  const [counts, previews] = await Promise.all([
    getGroupMemberCounts(supabase, ids),
    supabase.rpc("group_member_previews", { gids: ids, per_group: PREVIEW_MEMBERS }),
  ]);

  const byGroup = new Map<string, MemberPreview[]>();
  (
    (previews.data ?? []) as (MemberPreview & { group_id: string; user_id: string })[]
  ).forEach((row) => {
    const list = byGroup.get(row.group_id) ?? [];
    list.push({
      id: row.user_id,
      full_name: row.full_name,
      username: row.username ?? null,
      accent_color: row.accent_color,
      avatar: row.avatar ?? null,
    });
    byGroup.set(row.group_id, list);
  });

  return groups.map((group, i) => ({
    group,
    memberCount: counts[i],
    members: byGroup.get(group.id) ?? [],
  }));
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

// How long a one-time session stays current after it starts — after that
// it's done, so it drops off both Utforsk and "Mine kollokviegrupper"
// (the group itself isn't deleted, it just stops being listed there).
const SESSION_VISIBLE_HOURS_AFTER_START = 2;

// A group with no scheduled date is an ongoing/ad-hoc one, always current.
export function isSessionOver(group: Pick<Group, "event_date" | "event_time">, now: Date) {
  if (!group.event_date) return false;
  const [y, m, d] = group.event_date.split("-").map(Number);
  const [h, min] = (group.event_time ?? "00:00").split(":").map(Number);
  const start = new Date(y, m - 1, d, h, min);
  const cutoff = new Date(start.getTime() + SESSION_VISIBLE_HOURS_AFTER_START * 60 * 60 * 1000);
  return now >= cutoff;
}
