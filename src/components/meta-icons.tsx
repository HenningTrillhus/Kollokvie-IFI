type IconProps = { className?: string };

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function PeopleIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden>
      <path d="M16 20v-1.5a3.5 3.5 0 00-3.5-3.5h-5A3.5 3.5 0 004 18.5V20M10 12a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM20 20v-1.5a3.5 3.5 0 00-2.5-3.35M15.5 5.15a3.5 3.5 0 010 6.7" />
    </svg>
  );
}

export function PinIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden>
      <path d="M12 21s7-5.6 7-11a7 7 0 10-14 0c0 5.4 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

export function ClockIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  );
}

export function LockIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className} aria-hidden>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 018 0v3" strokeLinecap="round" />
    </svg>
  );
}

export function ChevronRightIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden>
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

export function SettingsIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden>
      <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
      <circle cx="15" cy="7" r="2" />
      <circle cx="9" cy="17" r="2" />
    </svg>
  );
}

export function BugIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden>
      <path d="M9 8.5V7a3 3 0 016 0v1.5" />
      <rect x="7.5" y="8.5" width="9" height="10" rx="4.5" />
      <path d="M12 8.5v10M4.5 11h3M16.5 11h3M4.5 15h3M16.5 15h3M6 6.5l1.5 1.5M18 6.5l-1.5 1.5M6 19.5l1.5-2M18 19.5l-1.5-2" />
    </svg>
  );
}

export function FlagIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden>
      <path d="M6 3v18" />
      <path d="M6 4h11l-2.5 4L17 12H6" />
    </svg>
  );
}

export function CloseIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function BellIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden>
      <path d="M6 9a6 6 0 1112 0c0 3.4 1 5.4 1.8 6.4a1 1 0 01-.8 1.6H5a1 1 0 01-.8-1.6C5 14.4 6 12.4 6 9z" />
      <path d="M9.5 19.5a2.5 2.5 0 005 0" />
    </svg>
  );
}
