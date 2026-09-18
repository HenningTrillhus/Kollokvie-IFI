import Link from "next/link";
import type { Profile } from "@/lib/profiles";

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
            href={`/profile/${profile.username}`}
            className="block rounded-xl border border-card-border px-4 py-2.5 transition hover:bg-accent-soft"
          >
            <p className="truncate text-sm font-medium">{profile.full_name}</p>
            <p className="truncate text-xs text-muted">@{profile.username}</p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
