type IconProps = { className?: string };

export function HomeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className={className}>
      <path
        d="M3 11.5L12 4l9 7.5M5.25 10v9a1 1 0 001 1H9.5v-5.5a1 1 0 011-1h3a1 1 0 011 1V20h3.25a1 1 0 001-1v-9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function GroupsIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className={className}>
      <path
        d="M9 11a3 3 0 100-6 3 3 0 000 6zm0 2c-3.31 0-6 1.79-6 4v1h12v-1c0-2.21-2.69-4-6-4zm7.5-4.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5zm0 1.5c-1.02 0-1.98.2-2.78.55.99.84 1.78 2 1.78 3.45v1h5v-1c0-2.05-1.79-4-4-4z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CalendarIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className={className}>
      <path
        d="M6.75 3v2.25M17.25 3v2.25M3.75 9h16.5M5.25 5.25h13.5A1.5 1.5 0 0120.25 6.75v12A1.5 1.5 0 0118.75 20.25H5.25A1.5 1.5 0 013.75 18.75v-12A1.5 1.5 0 015.25 5.25z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SearchIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className={className}>
      <path
        d="M20.25 20.25l-4.5-4.5m1.5-5.25a6.75 6.75 0 11-13.5 0 6.75 6.75 0 0113.5 0z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
