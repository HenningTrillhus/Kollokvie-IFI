import { createClient } from "@/lib/supabase/client";

// GDPR right of access / data portability: everything the app stores about
// the signed-in user, as one JSON file. Each query only returns rows the user
// is allowed to read anyway.
export async function downloadMyData() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("not signed in");
  const uid = user.id;

  const [
    profile,
    bio,
    courses,
    following,
    followers,
    memberships,
    ownedGroups,
    invitesReceived,
    invitesSent,
    events,
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", uid).maybeSingle(),
    supabase.from("profile_bios").select("bio, updated_at").eq("user_id", uid).maybeSingle(),
    supabase.from("user_courses").select("course_code, created_at").eq("user_id", uid),
    supabase.from("follows").select("followee_id, status, created_at").eq("follower_id", uid),
    supabase.from("follows").select("follower_id, status, created_at").eq("followee_id", uid),
    supabase.from("group_members").select("group_id, joined_at, groups(name)").eq("user_id", uid),
    supabase.from("groups").select("*").eq("owner_id", uid),
    supabase.from("group_invites").select("*").eq("invitee_id", uid),
    supabase.from("group_invites").select("*").eq("inviter_id", uid),
    supabase.from("events").select("*").eq("user_id", uid),
  ]);

  const data = {
    exported_at: new Date().toISOString(),
    account: { id: uid, created_at: user.created_at },
    profile: profile.data,
    bio: bio.data,
    courses: courses.data ?? [],
    following: following.data ?? [],
    followers: followers.data ?? [],
    group_memberships: memberships.data ?? [],
    groups_owned: ownedGroups.data ?? [],
    group_invites_received: invitesReceived.data ?? [],
    group_invites_sent: invitesSent.data ?? [],
    calendar_events: events.data ?? [],
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "kollokvie-ifi-mine-data.json";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
