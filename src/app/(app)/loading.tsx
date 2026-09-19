export default function Loading() {
  return (
    <div
      className="mx-auto w-full max-w-lg px-6 py-10"
      role="status"
      aria-label="Laster"
    >
      <div className="mx-auto h-6 w-48 animate-pulse rounded-lg bg-accent-soft" />
      <div className="mx-auto mt-3 h-4 w-28 animate-pulse rounded-lg bg-accent-soft" />

      <div className="mt-10 space-y-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-xl border border-card-border bg-accent-soft/40"
          />
        ))}
      </div>
    </div>
  );
}
