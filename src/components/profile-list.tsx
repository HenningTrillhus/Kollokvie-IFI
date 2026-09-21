import type { Profile } from "@/lib/profiles";
import PersonRow from "@/components/person-row";

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
        <li
          key={profile.id}
          style={{ ["--i" as string]: i }}
          className="animate-rise overflow-hidden first:rounded-t-xl last:rounded-b-xl"
        >
          <PersonRow profile={profile} compact />
        </li>
      ))}
    </ul>
  );
}
