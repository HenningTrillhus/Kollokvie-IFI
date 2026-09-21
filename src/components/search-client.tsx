"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n/client";
import FollowButton from "@/components/follow-button";
import GroupCard from "@/components/group-card";
import { Card, EmptyCard, ListCard, inputClass } from "@/components/form-ui";
import { escapeLike, type Profile } from "@/lib/profiles";
import Avatar from "@/components/avatar";
import { getGroupCardData, withFullGroupsLast, type Group, type GroupCardData } from "@/lib/groups";

type FollowStatus = "none" | "pending" | "accepted";
type Mode = "people" | "groups";

// Results come in pages, so a broad search never loads hundreds of rows.
const PAGE_SIZE = 30;

export default function SearchClient({ currentUserId }: { currentUserId: string }) {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<Mode>("people");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [results, setResults] = useState<Profile[]>([]);
  const [statuses, setStatuses] = useState<Record<string, FollowStatus>>({});
  const [groupResults, setGroupResults] = useState<GroupCardData[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scroller = useRef<HTMLDivElement>(null);

  // Focus the box on desktop only: on a phone it would throw the keyboard up
  // every time you open the tab.
  useEffect(() => {
    if (window.matchMedia("(hover: hover)").matches) inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    // Commas and parentheses would break the PostgREST or-filter syntax.
    const term = escapeLike(trimmed.replace(/[,()*]/g, " ").trim());
    if (!term) return;

    // A slower, older request must never overwrite a newer one's results.
    let cancelled = false;
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const timeout = setTimeout(async () => {
      setLoading(true);
      const supabase = createClient();

      if (mode === "people") {
        const { data, count } = await supabase
          .from("profiles")
          .select("*", { count: "exact" })
          .neq("id", currentUserId)
          .or(`username.ilike.%${term}%,full_name.ilike.%${term}%`)
          .order("full_name", { ascending: true })
          .range(from, to);

        const matches = (data ?? []) as Profile[];
        // One batched lookup for every result's relationship status.
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

        if (cancelled) return;
        const statusMap: Record<string, FollowStatus> = {};
        (followRows ?? []).forEach((row) => {
          statusMap[row.followee_id] = row.status as FollowStatus;
        });
        setResults(matches);
        setStatuses(statusMap);
        setTotal(count ?? matches.length);
      } else {
        const { data, count } = await supabase
          .from("groups")
          .select("*", { count: "exact" })
          .or(
            `name.ilike.%${term}%,description.ilike.%${term}%,course_code.ilike.%${term}%`
          )
          .order("created_at", { ascending: false })
          .range(from, to);

        const groups = (data ?? []) as Group[];
        const cards = await getGroupCardData(supabase, groups);
        if (cancelled) return;
        setGroupResults(withFullGroupsLast(cards));
        setTotal(count ?? groups.length);
      }

      setLoading(false);
      scroller.current?.scrollTo({ top: 0 });
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [query, mode, page, currentUserId]);

  const trimmedQuery = query.trim();
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const shown = mode === "people" ? results.length : groupResults.length;

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-md flex-1 flex-col gap-2.5 px-4 pb-2.5 pt-2.5">
      <div className="shrink-0">
        <Card className="space-y-3">
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
                onClick={() => {
                  setMode(value);
                  setPage(1);
                }}
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
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            className={inputClass}
          />
        </Card>
      </div>

      {!trimmedQuery ? (
        <div className="flex min-h-0 flex-1 items-center justify-center px-6 text-center">
          <p className="text-sm text-muted">{t("search.hint")}</p>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col gap-2">
          <div className="flex shrink-0 items-center justify-between px-1 text-xs text-muted">
            <span>{loading ? t("common.searching") : t("search.results", { n: total })}</span>
          </div>

          {/* Its own scroll box: the page itself never scrolls. */}
          <div
            ref={scroller}
            className={`min-h-0 flex-1 overflow-y-auto overscroll-contain transition-opacity ${
              loading ? "opacity-60" : ""
            }`}
          >
            {!loading && shown === 0 ? (
              <EmptyCard>
                {mode === "people" ? t("search.noUsers") : t("search.noGroups")}
              </EmptyCard>
            ) : mode === "groups" ? (
              <div className="space-y-3 pb-1">
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
            ) : (
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
          </div>

          {pages > 1 && <Pager page={page} pages={pages} onChange={setPage} />}
        </div>
      )}
    </div>
  );
}

// Previous / page numbers / next, at the bottom of the results.
function Pager({
  page,
  pages,
  onChange,
}: {
  page: number;
  pages: number;
  onChange: (page: number) => void;
}) {
  const { t } = useI18n();

  // 1 … (page-1) page (page+1) … last
  const numbers = new Set([1, pages, page - 1, page, page + 1]);
  const list = [...numbers].filter((n) => n >= 1 && n <= pages).sort((a, b) => a - b);

  const arrow =
    "flex h-10 items-center justify-center rounded-xl border border-card-border bg-card px-3 text-sm font-medium transition active:scale-95 disabled:opacity-40";

  return (
    <nav aria-label={t("search.page", { page, pages })} className="shrink-0">
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          className={arrow}
          aria-label={t("search.prev")}
        >
          ‹
        </button>

        <div className="flex items-center gap-1">
          {list.map((n, i) => (
            <span key={n} className="flex items-center gap-1">
              {i > 0 && n - list[i - 1] > 1 && <span className="px-0.5 text-muted">…</span>}
              <button
                onClick={() => onChange(n)}
                aria-current={n === page ? "page" : undefined}
                className={`h-10 min-w-10 rounded-xl px-2 text-sm font-medium transition active:scale-95 ${
                  n === page
                    ? "bg-accent text-white"
                    : "border border-card-border bg-card text-muted"
                }`}
              >
                {n}
              </button>
            </span>
          ))}
        </div>

        <button
          onClick={() => onChange(page + 1)}
          disabled={page >= pages}
          className={arrow}
          aria-label={t("search.next")}
        >
          ›
        </button>
      </div>
      <p className="mt-1.5 text-center text-[11px] text-muted">
        {t("search.page", { page, pages })}
      </p>
    </nav>
  );
}
