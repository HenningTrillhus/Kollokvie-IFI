import Link from "next/link";
import type { Profile } from "@/lib/profiles";
import Avatar from "@/components/avatar";

// Rows of people, separated by hairlines. Meant to sit inside a card.
export default function ProfileList({
  profiles,
  emptyLabel,
}: {
  profiles: Profile[];
  emptyLabel: string;
}) {
  if (profiles.length === 0) {
    return <p className="px-2 py-4 text-sm text-muted">{emptyLabel}</p>;
  }

  return (
    <ul className="divide-y divide-card-border">
      {profiles.map((profile, i) => (
        <li key={profile.id} style={{ ["--i" as string]: i }} className="animate-rise">
          <Link
            href={`/profile/${encodeURIComponent(profile.username)}`}
            className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition hover:bg-accent-soft active:bg-accent-soft"
          >
            <Avatar profile={profile} className="h-9 w-9 text-sm" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{profile.full_name}</p>
              <p className="truncate text-xs text-muted">@{profile.username}</p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
