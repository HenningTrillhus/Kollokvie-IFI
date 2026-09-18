import type { SupabaseClient } from "@supabase/supabase-js";

export type Profile = {
  id: string;
  full_name: string;
  username: string;
  ifi_username: string;
  created_at: string;
};

export async function getProfileByUsername(
  supabase: SupabaseClient,
  username: string
) {
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .maybeSingle();
  return data as Profile | null;
}

export async function getProfileById(supabase: SupabaseClient, id: string) {
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return data as Profile | null;
}

export async function getProfilesByIds(supabase: SupabaseClient, ids: string[]) {
  if (ids.length === 0) return [] as Profile[];
  const { data } = await supabase.from("profiles").select("*").in("id", ids);
  return (data ?? []) as Profile[];
}

export async function getFollowCounts(
  supabase: SupabaseClient,
  userId: string
) {
  const { data } = await supabase
    .rpc("follow_counts", { target: userId })
    .single();
  return (data ?? { followers: 0, following: 0 }) as {
    followers: number;
    following: number;
  };
}
