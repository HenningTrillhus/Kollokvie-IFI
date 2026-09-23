"use client";

// A pill switcher whose highlight slides to the chosen option.
export default function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
  disabled,
  fill = false,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
  // Stretch to the full width instead of hugging the labels.
  fill?: boolean;
}) {
  const index = Math.max(
    0,
    options.findIndex((o) => o.value === value)
  );

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={`relative grid rounded-xl border border-card-border p-0.5 text-sm font-medium ${
        fill ? "w-full" : ""
      }`}
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      <span
        aria-hidden
        className="absolute inset-y-0.5 left-0.5 rounded-lg bg-accent-soft transition-transform duration-300 ease-out motion-reduce:transition-none"
        style={{
          width: `calc((100% - 4px) / ${options.length})`,
          transform: `translateX(${index * 100}%)`,
        }}
      />
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          disabled={disabled}
          onClick={() => onChange(option.value)}
          className={`relative rounded-lg px-3.5 py-1.5 transition-colors active:scale-95 disabled:opacity-70 disabled:active:scale-100 ${
            value === option.value ? "text-accent" : "text-muted hover:text-foreground"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
