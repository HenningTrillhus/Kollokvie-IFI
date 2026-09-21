"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n/client";
import FollowButton from "@/components/follow-button";
import GroupCard from "@/components/group-card";
import { Card, EmptyCard, ListCard } from "@/components/form-ui";
import SearchInput from "@/components/search-input";
import { PROFILE_VIEW, escapeLike, type Profile } from "@/lib/profiles";
import Avatar from "@/components/avatar";
import { getGroupCardData, withFullGroupsLast, type Group, type GroupCardData } from "@/lib/groups";

type FollowStatus = "none" | "pending" | "accepted";
type Mode = "people" | "groups";

// Results come in pages, so a broad search never loads hundreds of rows.
const PAGE_SIZE = 30;

const SCROLL_KEY = "kollokvie:search-scroll";

export default function SearchClient({
  currentUserId,
  initialQuery = "",
  initialMode = "people",
  initialPage = 1,
}: {
  currentUserId: string;
  initialQuery?: string;
  initialMode?: Mode;
  initialPage?: number;
}) {
  const { t } = useI18n();
  const [query, setQuery] = useState(initialQuery);
  const [mode, setMode] = useState<Mode>(initialMode);
  const [page, setPage] = useState(initialPage);
  const [total, setTotal] = useState(0);
  const [results, setResults] = useState<Profile[]>([]);
  const [statuses, setStatuses] = useState<Record<string, FollowStatus>>({});
  // Shared connections per person (only filled when browsing without a search).
  const [mutuals, setMutuals] = useState<Record<string, number>>({});
  const [groupResults, setGroupResults] = useState<GroupCardData[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  // Where the results were scrolled to when you left (restored after they load).
  const pendingScroll = useRef<number | null>(null);
  const needsScroll = useRef(false);
  const searchKey = `${mode}|${query.trim()}|${page}`;

  // Keep the URL in step with the search, so "back" from a profile returns here.
  useEffect(() => {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query);
    if (mode === "groups") params.set("mode", "groups");
    if (page > 1) params.set("page", String(page));
    const qs = params.toString();
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  }, [query, mode, page]);

  // On the first load: remember-where-you-were, if it's the same search.
  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(SCROLL_KEY) ?? "null") as
        | { key: string; top: number }
        | null;
      if (saved && saved.key === searchKey) pendingScroll.current = saved.top;
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function rememberScroll() {
    try {
      sessionStorage.setItem(
        SCROLL_KEY,
        JSON.stringify({ key: searchKey, top: scroller.current?.scrollTop ?? 0 })
      );
    } catch {
      // ignore
    }
  }

  // Focus the box on desktop only: on a phone it would throw the keyboard up
  // every time you open the tab.
  useEffect(() => {
    if (window.matchMedia("(hover: hover)").matches) inputRef.current?.focus();

    // Keyboard shortcut: "/" focuses the search box (like most sites).
    function onKey(e: KeyboardEvent) {
      if (e.key !== "/" || e.ctrlKey || e.metaKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target && /^(input|textarea|select)$/i.test(target.tagName)) return;
      e.preventDefault();
      inputRef.current?.focus();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    // Commas and parentheses would break the PostgREST or-filter syntax.
    const term = escapeLike(trimmed.replace(/[,()*]/g, " ").trim());
    // No search text: browse everyone / every group instead of asking for input.
    const browsing = !term;

    // A slower, older request must never overwrite a newer one's results.
    let cancelled = false;
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const timeout = setTimeout(async () => {
      setLoading(true);
      const supabase = createClient();

      if (mode === "people") {
        let matches: Profile[] = [];
        let count: number | null = null;
        const mutualMap: Record<string, number> = {};

        if (browsing) {
          // People you share the most connections with first, then A-Z.
          const { data: rows, error } = await supabase.rpc("suggested_profiles", {
            p_limit: PAGE_SIZE,
            p_offset: from,
          });
          if (!error && rows) {
            const list = rows as { profile: Profile; mutual: number; total: number }[];
            matches = list.map((r) => r.profile);
            list.forEach((r) => {
              if (r.mutual > 0) mutualMap[r.profile.id] = r.mutual;
            });
            count = list.length ? Number(list[0].total) : 0;
          } else {
            // The database function is not installed yet: plain A-Z.
            const res = await supabase
              .from(PROFILE_VIEW)
              .select("*", { count: "exact" })
              .neq("id", currentUserId)
              .order("full_name", { ascending: true })
              .range(from, to);
            matches = (res.data ?? []) as Profile[];
            count = res.count;
          }
        } else {
          const res = await supabase
            .from(PROFILE_VIEW)
            .select("*", { count: "exact" })
            .neq("id", currentUserId)
            .or(`username.ilike.%${term}%,full_name.ilike.%${term}%`)
            .order("full_name", { ascending: true })
            .range(from, to);
          matches = (res.data ?? []) as Profile[];
          count = res.count;
        }

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
        setMutuals(mutualMap);
        setTotal(count ?? matches.length);
      } else {
        let groupQuery = supabase.from("groups").select("*", { count: "exact" });
        if (browsing) {
          groupQuery = groupQuery.order("name", { ascending: true });
        } else {
          groupQuery = groupQuery
            .or(`name.ilike.%${term}%,description.ilike.%${term}%,course_code.ilike.%${term}%`)
            .order("created_at", { ascending: false });
        }
        const { data, count } = await groupQuery.range(from, to);

        const groups = (data ?? []) as Group[];
        const cards = await getGroupCardData(supabase, groups);
        if (cancelled) return;
        // Browsing is strictly alphabetical; a search keeps full groups last.
        setGroupResults(browsing ? cards : withFullGroupsLast(cards));
        setTotal(count ?? groups.length);
      }

      setLoading(false);
      needsScroll.current = true; // applied once the new rows are on screen
    }, browsing ? 0 : 300);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [query, mode, page, currentUserId]);

  // After new results render: back to where you were if you just came back,
  // otherwise to the top.
  useEffect(() => {
    if (!needsScroll.current) return;
    needsScroll.current = false;
    scroller.current?.scrollTo({ top: pendingScroll.current ?? 0 });
    pendingScroll.current = null;
  }, [results, groupResults]);

  const trimmedQuery = query.trim();
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const shown = mode === "people" ? results.length : groupResults.length;

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-md flex-1 flex-col gap-2.5 px-4 pb-2.5 pt-2.5 md:max-w-3xl md:gap-3 md:px-6 md:pb-4 md:pt-5">
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

          <SearchInput
            inputRef={inputRef}
            placeholder={
              mode === "people" ? t("search.peoplePlaceholder") : t("search.groupsPlaceholder")
            }
            value={query}
            onChange={(value) => {
              setQuery(value);
              setPage(1);
            }}
          />
        </Card>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2">
        <div className="flex shrink-0 items-center justify-between px-1 text-xs text-muted">
          <span>
            {loading
              ? t("common.searching")
              : trimmedQuery
                ? t("search.results", { n: total })
                : t(mode === "people" ? "search.browsePeople" : "search.browseGroups", {
                    n: total,
                  })}
          </span>
        </div>

        {/* Its own scroll box: the page itself never scrolls. */}
        <div
          ref={scroller}
          onScroll={rememberScroll}
          className={`min-h-0 flex-1 overflow-y-auto overscroll-contain transition-opacity ${
            loading ? "opacity-60" : ""
          }`}
        >
          {!loading && shown === 0 ? (
            <EmptyCard>
              {mode === "people" ? t("search.noUsers") : t("search.noGroups")}
            </EmptyCard>
          ) : mode === "groups" ? (
            <div className="grid gap-3 pb-1 md:grid-cols-2">
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
              {results.map((profile, i) => (
                <div
                  key={profile.id}
                  style={{ ["--i" as string]: i }}
                  className="animate-rise flex items-center justify-between gap-3 px-4 py-3 transition hover:bg-accent-soft/50"
                >
                  <Link
                    href={`/profile/${profile.id}`}
                    className="flex min-w-0 items-center gap-3"
                  >
                    <Avatar profile={profile} className="h-10 w-10 text-sm" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{profile.full_name}</p>
                      <p className="truncate text-xs text-muted">
                        {profile.username ? `@${profile.username}` : t("search.privateProfile")}
                        {mutuals[profile.id] ? (
                          <span className="text-accent">
                            {" · "}
                            {t("search.mutual", { n: mutuals[profile.id] })}
                          </span>
                        ) : null}
                      </p>
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
