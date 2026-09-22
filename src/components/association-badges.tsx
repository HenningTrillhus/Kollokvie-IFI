import { associationBySlug, type UserAssociation } from "@/lib/associations";

// Icon and title, nothing else — the association's own name isn't shown here.
export default function AssociationBadges({ items }: { items: UserAssociation[] }) {
  if (items.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-x-4 gap-y-3">
      {items.map((item) => {
        const meta = associationBySlug(item.association);
        if (!meta) return null;
        return (
          <div key={item.association} className="flex w-16 flex-col items-center gap-1 text-center">
            <span
              title={meta.name}
              className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-accent-soft"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- small static logos */}
              <img src={meta.icon} alt={meta.name} className="h-full w-full object-contain" />
            </span>
            <p className="w-full truncate text-[11px] text-muted">{item.title}</p>
          </div>
        );
      })}
    </div>
  );
}
