import Link from "next/link";
import { isGroupFull, type Group } from "@/lib/groups";

function formatDate(dateStr: string | null) {
  if (!dateStr) return null;
  const [year, month, day] = dateStr.split("-");
  return `${day}.${month}.${year}`;
}

export default function GroupCard({
  group,
  memberCount,
}: {
  group: Group;
  memberCount: number;
}) {
  const dateLabel = formatDate(group.event_date);
  const full = isGroupFull(group, memberCount);

  return (
    <Link
      href={`/groups/${group.id}`}
      className={`relative block overflow-hidden rounded-xl border border-card-border p-4 transition hover:border-accent/40 hover:bg-accent-soft/60 ${
        full ? "bg-accent-soft/30" : ""
      }`}
    >
      {full && (
        <span
          aria-hidden
          className="absolute inset-y-0 left-0 w-1 bg-muted/40"
        />
      )}
      <div className="flex items-start justify-between gap-3">
        <div className={`min-w-0 ${full ? "opacity-60" : ""}`}>
          <p className="truncate text-sm font-semibold">{group.name}</p>
          {group.description && (
            <p className="mt-0.5 truncate text-xs text-muted">{group.description}</p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {full && (
            <span className="rounded-lg bg-foreground px-2 py-1 text-xs font-medium text-background">
              Full
            </span>
          )}
          {group.course_code && (
            <span
              className={`rounded-lg bg-accent-soft px-2 py-1 text-xs font-medium text-accent ${
                full ? "opacity-60" : ""
              }`}
            >
              {group.course_code}
            </span>
          )}
        </div>
      </div>

      <div
        className={`mt-3 flex items-end justify-between gap-3 ${full ? "opacity-60" : ""}`}
      >
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
          <span>
            {memberCount}
            {group.max_members ? ` / ${group.max_members}` : ""} medlemmer
          </span>
          {group.location && <span>· {group.location}</span>}
          {dateLabel && (
            <span>
              · {dateLabel}
              {group.event_time ? ` ${group.event_time.slice(0, 5)}` : ""}
            </span>
          )}
        </div>
        <span className="shrink-0 rounded-md border border-card-border px-1.5 py-0.5 text-xs text-muted">
          {group.visibility === "public" ? "Offentlig" : "Privat"}
        </span>
      </div>
    </Link>
  );
}
