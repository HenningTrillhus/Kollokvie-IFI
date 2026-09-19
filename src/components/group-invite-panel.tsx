"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n/client";
import { avatarStyle, escapeLike, type Profile } from "@/lib/profiles";

export default function GroupInvitePanel({
  groupId,
  excludeIds,
}: {
  groupId: string;
  excludeIds: string[];
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [invited, setInvited] = useState<Set<string>>(new Set());

  // A stable key: the array prop is a new object on every server refresh.
  const excludeKey = excludeIds.join(",");

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) return;

    let cancelled = false;
    const excluded = new Set(excludeKey ? excludeKey.split(",") : []);
    const timeout = setTimeout(async () => {
      setLoading(true);
      const supabase = createClient();
      const [{ data: byUsername }, { data: byName }] = await Promise.all([
        supabase.from("profiles").select("*").ilike("username", `%${escapeLike(trimmed)}%`).limit(20),
        supabase.from("profiles").select("*").ilike("full_name", `%${escapeLike(trimmed)}%`).limit(20),
      ]);

      const merged = new Map<string, Profile>();
      [...(byUsername ?? []), ...(byName ?? [])].forEach((p) => merged.set(p.id, p));

      if (cancelled) return;
      setResults(Array.from(merged.values()).filter((p) => !excluded.has(p.id)));
      setLoading(false);
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [query, excludeKey]);

  async function invite(userId: string) {
    const supabase = createClient();
    const { error } = await supabase.rpc("invite_to_group", {
      gid: groupId,
      invitee: userId,
    });
    if (!error) {
      setInvited((prev) => new Set(prev).add(userId));
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg border border-card-border px-3 py-1.5 text-sm font-medium transition hover:bg-accent-soft"
      >
        {t("invite.button")}
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-card-border p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">{t("invite.title")}</h3>
        <button
          onClick={() => setOpen(false)}
          className="text-xs text-muted hover:text-foreground"
        >
          {t("common.close")}
        </button>
      </div>

      <input
        type="text"
        autoFocus
        placeholder={t("search.peoplePlaceholder")}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="mt-3 w-full rounded-xl border border-card-border bg-transparent px-4 py-2.5 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent-soft"
      />

      <div className="mt-3 space-y-2">
        {loading && query.trim() && <p className="text-sm text-muted">{t("common.searching")}</p>}
        {!loading && query.trim() && results.length === 0 && (
          <p className="text-sm text-muted">{t("search.noUsers")}</p>
        )}
        {query.trim() && results.map((profile) => (
          <div
            key={profile.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-card-border px-3 py-2"
          >
            <div className="flex min-w-0 items-center gap-2.5">
              <div
                style={avatarStyle(profile.accent_color)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
              >
                {(profile.full_name || profile.username).charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{profile.full_name}</p>
                <p className="truncate text-xs text-muted">@{profile.username}</p>
              </div>
            </div>
            <button
              onClick={() => invite(profile.id)}
              disabled={invited.has(profile.id)}
              className="shrink-0 rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white transition hover:bg-accent-hover disabled:opacity-60"
            >
              {invited.has(profile.id) ? t("invite.invited") : t("invite.button")}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
