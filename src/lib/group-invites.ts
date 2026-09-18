import type { SupabaseClient } from "@supabase/supabase-js";
import type { Group } from "./groups";
import type { Profile } from "./profiles";

export type GroupInvite = {
  group_id: string;
  invitee_id: string;
  inviter_id: string;
  status: "pending" | "accepted" | "declined";
  created_at: string;
};

export type PendingGroupInvite = {
  group: Group;
  inviter: Profile | null;
};

export async function getPendingInviteCount(
  supabase: SupabaseClient,
  userId: string
) {
  const { count } = await supabase
    .from("group_invites")
    .select("*", { count: "exact", head: true })
    .eq("invitee_id", userId)
    .eq("status", "pending");
  return count ?? 0;
}
