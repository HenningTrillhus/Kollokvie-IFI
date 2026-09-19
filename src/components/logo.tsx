// The app icon, used as the logo next to the title.
export default function Logo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- small static icon
    <img
      src="/icons/icon-192.png"
      alt=""
      width={192}
      height={192}
      draggable={false}
      className={`shrink-0 select-none ${className}`}
    />
  );
}
