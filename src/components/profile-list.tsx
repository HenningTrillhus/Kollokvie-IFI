import Link from "next/link";
import type { Profile } from "@/lib/profiles";
import Avatar from "@/components/avatar";

export default function ProfileList({
  profiles,
  emptyLabel,
}: {
  profiles: Profile[];
  emptyLabel: string;
}) {
  if (profiles.length === 0) {
    return <p className="text-sm text-muted">{emptyLabel}</p>;
  }

  return (
    <ul className="space-y-2">
      {profiles.map((profile) => (
        <li key={profile.id}>
          <Link
            href={`/profile/${encodeURIComponent(profile.username)}`}
            className="flex items-center gap-3 rounded-xl border border-card-border px-4 py-2.5 transition hover:border-accent/40 hover:bg-accent-soft"
          >
            <Avatar profile={profile} className="h-8 w-8 text-xs" />
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
