"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n/client";
import FollowButton from "@/components/follow-button";
import GroupCard from "@/components/group-card";
import { Card, EmptyCard, ListCard, Page, inputClass } from "@/components/form-ui";
import { escapeLike, type Profile } from "@/lib/profiles";
import Avatar from "@/components/avatar";
import { getGroupCardData, withFullGroupsLast, type Group, type GroupCardData } from "@/lib/groups";

type FollowStatus = "none" | "pending" | "accepted";
type Mode = "people" | "groups";

export default function SearchClient({ currentUserId }: { currentUserId: string }) {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Profile[]>([]);
  const [statuses, setStatuses] = useState<Record<string, FollowStatus>>({});
  const [mode, setMode] = useState<Mode>("people");
  const [groupResults, setGroupResults] = useState<GroupCardData[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus the box on desktop only: on a phone it would throw the keyboard up
  // every time you open the tab.
  useEffect(() => {
    if (window.matchMedia("(hover: hover)").matches) inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed || mode !== "people") return;

    // A slower, older request must never overwrite a newer one's results.
    let cancelled = false;
    const timeout = setTimeout(async () => {
      setLoading(true);
      const supabase = createClient();
      const [{ data: byUsername }, { data: byName }] = await Promise.all([
        supabase.from("profiles").select("*").ilike("username", `%${escapeLike(trimmed)}%`).limit(20),
        supabase.from("profiles").select("*").ilike("full_name", `%${escapeLike(trimmed)}%`).limit(20),
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

      if (cancelled) return;
      setResults(matches);
      setStatuses(statusMap);
      setLoading(false);
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [query, currentUserId, mode]);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed || mode !== "groups") return;

    let cancelled = false;
    const timeout = setTimeout(async () => {
      // Commas and parentheses would break the PostgREST or-filter syntax.
      const term = escapeLike(trimmed.replace(/[,()*]/g, " ").trim());
      if (!term) {
        setGroupResults([]);
        return;
      }
      setLoading(true);
      const supabase = createClient();
      const { data } = await supabase
        .from("groups")
        .select("*")
        .or(
          `name.ilike.%${term}%,description.ilike.%${term}%,course_code.ilike.%${term}%`
        )
        .order("created_at", { ascending: false })
        .limit(30);

      const groups = (data ?? []) as Group[];
      const cards = await getGroupCardData(supabase, groups);
      if (cancelled) return;
      setGroupResults(withFullGroupsLast(cards));
      setLoading(false);
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [query, mode]);

  const trimmedQuery = query.trim();

  return (
    <Page>
      <Card>
        <div className="grid grid-cols-2 rounded-xl border border-card-border p-1 text-sm font-medium">
          {(
            [
              ["people", t("search.people")],
              ["groups", t("search.groups")],
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
          ref={inputRef}
          type="search"
          placeholder={
            mode === "people" ? t("search.peoplePlaceholder") : t("search.groupsPlaceholder")
          }
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={inputClass}
        />
      </Card>

      {trimmedQuery && loading && (
        <p className="px-1 text-sm text-muted">{t("common.searching")}</p>
      )}

      {trimmedQuery && !loading && mode === "people" && results.length === 0 && (
        <EmptyCard>{t("search.noUsers")}</EmptyCard>
      )}
      {trimmedQuery && !loading && mode === "groups" && groupResults.length === 0 && (
        <EmptyCard>{t("search.noGroups")}</EmptyCard>
      )}

      {trimmedQuery && mode === "groups" && groupResults.length > 0 && (
        <div className="space-y-3">
          {groupResults.map(({ group, memberCount, members }, i) => (
            <GroupCard
              key={group.id}
              group={group}
              memberCount={memberCount}
              members={members}
              index={i}
            />
          ))}
        </div>
      )}

      {trimmedQuery && mode === "people" && results.length > 0 && (
        <ListCard>
          {results.map((profile) => (
            <div
              key={profile.id}
              className="flex items-center justify-between gap-3 px-4 py-3"
            >
              <Link
                href={`/profile/${encodeURIComponent(profile.username)}`}
                className="flex min-w-0 items-center gap-3"
              >
                <Avatar profile={profile} className="h-10 w-10 text-sm" />
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
        </ListCard>
      )}
    </Page>
  );
}
