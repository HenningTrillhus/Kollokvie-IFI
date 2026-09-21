"use client";

// A username field with the fixed start of the address in front of it
// ("github.com/" + your name), so the link is built for you and can only ever
// point to that site. People may also paste their full profile link.
export default function LinkHandleInput({
  id,
  prefix,
  value,
  onChange,
  placeholder,
  maxLength = 120,
}: {
  id: string;
  prefix: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  maxLength?: number;
}) {
  return (
    <div className="flex h-11 min-w-0 overflow-hidden rounded-xl border border-card-border transition focus-within:border-accent focus-within:ring-2 focus-within:ring-accent-soft">
      <label
        htmlFor={id}
        className="flex shrink-0 items-center bg-accent-soft/50 px-3 text-sm text-muted"
      >
        {prefix}
      </label>
      <input
        id={id}
        type="text"
        maxLength={maxLength}
        autoCapitalize="none"
        autoCorrect="off"
        autoComplete="off"
        spellCheck={false}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none"
      />
    </div>
  );
}
