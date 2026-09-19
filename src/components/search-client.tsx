"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import FollowButton from "@/components/follow-button";
import GroupCard from "@/components/group-card";
import { avatarStyle, type Profile } from "@/lib/profiles";
import { getGroupMemberCount, withFullGroupsLast, type Group } from "@/lib/groups";

type FollowStatus = "none" | "pending" | "accepted";
type Mode = "people" | "groups";
type GroupResult = { group: Group; memberCount: number };

export default function SearchClient({ currentUserId }: { currentUserId: string }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Profile[]>([]);
  const [statuses, setStatuses] = useState<Record<string, FollowStatus>>({});
  const [mode, setMode] = useState<Mode>("people");
  const [groupResults, setGroupResults] = useState<GroupResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed || mode !== "people") return;

    const timeout = setTimeout(async () => {
      setLoading(true);
      const supabase = createClient();
      const [{ data: byUsername }, { data: byName }] = await Promise.all([
        supabase.from("profiles").select("*").ilike("username", `%${trimmed}%`).limit(20),
        supabase.from("profiles").select("*").ilike("full_name", `%${trimmed}%`).limit(20),
      ]);

      const merged = new Map<string, Profile>();
      [...(byUsername ?? []), ...(byName ?? [])].forEach((p) => merged.set(p.id, p));
      const matches = Array.from(merged.values()).filter((p) => p.id !== currentUserId);

      // One batched lookup for every result's relationship status, instead
      // of one query per row.
      const { data: followRows } = matches.length
        ? await supabase
            .from("follows")
            .select("followee_id, status")
            .eq("follower_id", currentUserId)
            .in(
              "followee_id",
              matches.map((p) => p.id)
            )
        : { data: [] };

      const statusMap: Record<string, FollowStatus> = {};
      (followRows ?? []).forEach((row) => {
        statusMap[row.followee_id] = row.status as FollowStatus;
      });

      setResults(matches);
      setStatuses(statusMap);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timeout);
  }, [query, currentUserId, mode]);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed || mode !== "groups") return;

    const timeout = setTimeout(async () => {
      setLoading(true);
      const supabase = createClient();
      // Commas and parentheses would break the PostgREST or-filter syntax.
      const term = trimmed.replace(/[,()%*]/g, " ").trim();
      const { data } = await supabase
        .from("groups")
        .select("*")
        .or(
          `name.ilike.%${term}%,description.ilike.%${term}%,course_code.ilike.%${term}%`
        )
        .order("created_at", { ascending: false })
        .limit(30);

      const groups = (data ?? []) as Group[];
      const counts = await Promise.all(
        groups.map((g) => getGroupMemberCount(supabase, g.id))
      );
      setGroupResults(
        withFullGroupsLast(groups.map((group, i) => ({ group, memberCount: counts[i] })))
      );
      setLoading(false);
    }, 300);

    return () => clearTimeout(timeout);
  }, [query, mode]);

  const trimmedQuery = query.trim();

  return (
    <div className="mx-auto w-full max-w-lg px-6 py-6">
      <div className="grid grid-cols-2 rounded-xl border border-card-border p-1 text-sm font-medium">
        {(
          [
            ["people", "Folk"],
            ["groups", "Kollokviegrupper"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setMode(value)}
            className={`rounded-lg px-3 py-1.5 transition ${
              mode === value ? "bg-accent text-white" : "text-muted"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <input
        type="text"
        autoFocus
        placeholder={
          mode === "people" ? "Navn eller brukernavn…" : "Navn, emnekode eller beskrivelse…"
        }
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="mt-3 w-full rounded-xl border border-card-border bg-transparent px-4 py-2.5 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent-soft"
      />

      <div className="mt-5 space-y-2">
        {loading && trimmedQuery && <p className="text-sm text-muted">Søker…</p>}
        {!loading && trimmedQuery && mode === "people" && results.length === 0 && (
          <p className="text-sm text-muted">Fant ingen brukere.</p>
        )}
        {!loading && trimmedQuery && mode === "groups" && groupResults.length === 0 && (
          <p className="text-sm text-muted">Fant ingen kollokviegrupper.</p>
        )}
        {trimmedQuery &&
          mode === "groups" &&
          groupResults.map(({ group, memberCount }) => (
            <GroupCard key={group.id} group={group} memberCount={memberCount} />
          ))}
        {trimmedQuery &&
          mode === "people" &&
          results.map((profile) => (
            <div
              key={profile.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-card-border px-4 py-2.5 transition hover:border-accent/40"
            >
              <Link
                href={`/profile/${profile.username}`}
                className="flex min-w-0 items-center gap-3"
              >
                <div
                  style={avatarStyle(profile.accent_color)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
                >
                  {(profile.full_name || profile.username).charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{profile.full_name}</p>
                  <p className="truncate text-xs text-muted">@{profile.username}</p>
                </div>
              </Link>
              <FollowButton
                targetUserId={profile.id}
                currentUserId={currentUserId}
                initialStatus={statuses[profile.id] ?? "none"}
              />
            </div>
          ))}
      </div>
    </div>
  );
}
