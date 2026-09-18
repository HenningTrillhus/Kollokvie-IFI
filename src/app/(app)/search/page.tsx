"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import FollowButton from "@/components/follow-button";
import { avatarStyle, type Profile } from "@/lib/profiles";

type FollowStatus = "none" | "pending" | "accepted";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Profile[]>([]);
  const [statuses, setStatuses] = useState<Record<string, FollowStatus>>({});
  const [loading, setLoading] = useState(false);
  const [selfId, setSelfId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setSelfId(data.user?.id ?? null));
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed || !selfId) return;

    const timeout = setTimeout(async () => {
      setLoading(true);
      const supabase = createClient();
      const [{ data: byUsername }, { data: byName }] = await Promise.all([
        supabase.from("profiles").select("*").ilike("username", `%${trimmed}%`).limit(20),
        supabase.from("profiles").select("*").ilike("full_name", `%${trimmed}%`).limit(20),
      ]);

      const merged = new Map<string, Profile>();
      [...(byUsername ?? []), ...(byName ?? [])].forEach((p) => merged.set(p.id, p));
      const matches = Array.from(merged.values()).filter((p) => p.id !== selfId);

      // One batched lookup for every result's relationship status, instead
      // of one query per row.
      const { data: followRows } = matches.length
        ? await supabase
            .from("follows")
            .select("followee_id, status")
            .eq("follower_id", selfId)
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
  }, [query, selfId]);

  const trimmedQuery = query.trim();

  return (
    <div className="mx-auto w-full max-w-lg px-6 py-10">
      <h1 className="text-xl font-semibold">Søk etter folk</h1>

      <input
        type="text"
        autoFocus
        placeholder="Navn eller brukernavn…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="mt-4 w-full rounded-xl border border-card-border bg-transparent px-4 py-2.5 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent-soft"
      />

      <div className="mt-6 space-y-2">
        {loading && trimmedQuery && <p className="text-sm text-muted">Søker…</p>}
        {!loading && trimmedQuery && results.length === 0 && (
          <p className="text-sm text-muted">Fant ingen brukere.</p>
        )}
        {trimmedQuery &&
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
                initialStatus={statuses[profile.id] ?? "none"}
              />
            </div>
          ))}
      </div>
    </div>
  );
}
