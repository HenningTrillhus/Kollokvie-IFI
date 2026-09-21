import { inputClass } from "@/components/form-ui";

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const QUARTERS = ["00", "15", "30", "45"];

// Time in 15-minute steps. Native time inputs let you pick any minute (and
// mobile pickers ignore the step attribute), so use two plain selects.
export default function QuarterTimePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [hour = "", minute = ""] = value ? value.slice(0, 5).split(":") : [];
  // A time saved before quarter-steps existed keeps its odd minute as an option.
  const minutes = minute && !QUARTERS.includes(minute) ? [...QUARTERS, minute].sort() : QUARTERS;

  const selectClass = `${inputClass} appearance-none px-2 text-center`;

  return (
    <div className="flex items-center gap-1.5">
      <select
        id="time-hour"
        aria-label="Hour"
        value={hour}
        onChange={(e) => {
          const h = e.target.value;
          onChange(h ? `${h}:${minute || "00"}` : "");
        }}
        className={selectClass}
      >
        <option value="">–</option>
        {HOURS.map((h) => (
          <option key={h} value={h}>
            {h}
          </option>
        ))}
      </select>
      <span className="text-muted">:</span>
      <select
        aria-label="Minute"
        value={hour ? minute || "00" : ""}
        disabled={!hour}
        onChange={(e) => onChange(`${hour}:${e.target.value}`)}
        className={`${selectClass} disabled:opacity-50`}
      >
        {!hour && <option value="">–</option>}
        {minutes.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
    </div>
  );
}
