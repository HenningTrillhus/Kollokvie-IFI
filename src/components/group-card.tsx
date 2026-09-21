"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/client";
import { formatDate } from "@/lib/i18n";
import Avatar from "@/components/avatar";
import { ClockIcon, PeopleIcon, PinIcon } from "@/components/meta-icons";
import { isGroupFull, VISIBILITY_KEYS, type Group, type MemberPreview } from "@/lib/groups";

export default function GroupCard({
  group,
  memberCount,
  members = [],
  index = 0,
}: {
  group: Group;
  memberCount: number;
  members?: MemberPreview[];
  index?: number;
}) {
  const { t, lang } = useI18n();
  const dateLabel = formatDate(group.event_date, lang);
  const timeLabel = group.event_time ? group.event_time.slice(0, 5) : null;
  const full = isGroupFull(group, memberCount);
  const dim = full ? "opacity-60" : "";

  return (
    <Link
      href={`/groups/${group.id}`}
      style={{ ["--i" as string]: index }}
      className={`animate-rise relative block overflow-hidden rounded-2xl border border-card-border p-4 transition duration-200 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-md active:translate-y-0 active:scale-[0.99] ${
        full ? "bg-accent-soft/40" : "bg-card"
      }`}
    >
      {full && (
        <span aria-hidden className="absolute inset-y-0 left-0 w-1 bg-muted/40" />
      )}

      <div className="flex items-start justify-between gap-3">
        <div className={`min-w-0 ${dim}`}>
          <p className="truncate text-[15px] font-semibold">{group.name}</p>
          {group.description && (
            <p className="mt-0.5 line-clamp-2 text-xs text-muted">{group.description}</p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {full && (
            <span className="rounded-lg bg-foreground px-2 py-1 text-xs font-medium text-background">
              {t("group.fullBadge")}
            </span>
          )}
          {group.course_code && (
            <span
              className={`rounded-lg bg-accent-soft px-2 py-1 text-xs font-medium text-accent ${dim}`}
            >
              {group.course_code}
            </span>
          )}
        </div>
      </div>

      {members.length > 0 && (
        <div className={`mt-3 flex items-center ${dim}`}>
          {/* Half-overlapping, like a stack of faces */}
          <div className="flex -space-x-3.5">
            {members.map((m) => (
              <Avatar key={m.id} profile={m} className="h-7 w-7 text-xs ring-2 ring-card" />
            ))}
          </div>
          {memberCount > members.length && (
            <span className="ml-2 text-xs font-medium text-muted">
              +{memberCount - members.length}
            </span>
          )}
        </div>
      )}

      <div className={`mt-3 flex items-end justify-between gap-3 ${dim}`}>
        <ul className="min-w-0 space-y-1 text-xs text-muted">
          <li className="flex items-center gap-1.5">
            <PeopleIcon className="h-3.5 w-3.5 shrink-0" />
            {group.max_members
              ? t("group.membersMax", { count: memberCount, max: group.max_members })
              : t("group.members", { count: memberCount })}
          </li>
          {group.location && (
            <li className="flex items-center gap-1.5">
              <PinIcon className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{group.location}</span>
            </li>
          )}
          {dateLabel && (
            <li className="flex items-center gap-1.5">
              <ClockIcon className="h-3.5 w-3.5 shrink-0" />
              {dateLabel}
              {timeLabel ? ` · ${timeLabel}` : ""}
            </li>
          )}
        </ul>
        <span className="shrink-0 rounded-md border border-card-border px-1.5 py-0.5 text-xs text-muted">
          {t(VISIBILITY_KEYS[group.visibility])}
        </span>
      </div>
    </Link>
  );
}
