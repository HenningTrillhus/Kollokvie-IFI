"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import Avatar from "@/components/avatar";
import { LockIcon } from "@/components/meta-icons";
import { programLabel } from "@/lib/i18n";
import { useI18n } from "@/lib/i18n/client";
import type { Profile } from "@/lib/profiles";

// How a person looks in every list: search results, followers, members,
// requests and invites. A larger picture with a soft ring, the name, then the
// username (or a lock for a private profile), shared contacts, and the study
// line if they share it. Whatever is hidden by a private profile is simply
// absent. `right` holds a button (Follow, Invite ...); `below` sits under the
// text (Accept / Decline).
export default function PersonRow({
  profile,
  right,
  below,
  mutual,
  compact = false,
  href,
}: {
  profile: Pick<
    Profile,
    | "id"
    | "full_name"
    | "username"
    | "accent_color"
    | "avatar"
    | "study_program"
    | "study_year"
    | "details_hidden"
  >;
  right?: ReactNode;
  below?: ReactNode;
  mutual?: number;
  // Tighter padding, for rows inside a small card.
  compact?: boolean;
  // Where the name links to; the person's profile by default.
  href?: string;
}) {
  const { t, lang } = useI18n();
  const study = profile.study_program
    ? `${programLabel(lang, profile.study_program)}${
        profile.study_year ? ` · ${t("profile.year", { n: profile.study_year })}` : ""
      }`
    : null;

  return (
    <div
      className={`group transition hover:bg-accent-soft/50 ${compact ? "px-2 py-2.5" : "px-4 py-3"}`}
    >
      <div className="flex items-center gap-3">
        <Link
          href={href ?? `/profile/${profile.id}`}
          className="flex min-w-0 flex-1 items-center gap-3.5 rounded-lg"
        >
          <Avatar
            profile={profile}
            className="h-11 w-11 text-base shadow-sm ring-2 ring-card transition duration-200 group-hover:scale-105"
          />
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold leading-tight">{profile.full_name}</p>
            <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted">
              {profile.username ? (
                <span className="truncate">@{profile.username}</span>
              ) : (
                <>
                  <LockIcon className="h-3 w-3 shrink-0" />
                  <span className="truncate">{t("search.privateProfile")}</span>
                </>
              )}
              {mutual ? (
                <span className="shrink-0 font-medium text-accent">
                  · {t("search.mutual", { n: mutual })}
                </span>
              ) : null}
            </p>
            {study && (
              <p className="mt-0.5 truncate text-[11px] leading-tight text-muted/80">{study}</p>
            )}
          </div>
        </Link>
        {right && <div className="shrink-0">{right}</div>}
      </div>
      {below && <div className="mt-3">{below}</div>}
    </div>
  );
}
