import { StatsWindow } from "@/types";

interface Props {
  value: StatsWindow;
  onChange: (w: StatsWindow) => void;
}

const OPTIONS: { label: string; value: StatsWindow }[] = [
  { label: "24h", value: "24h" },
  { label: "7j",  value: "7d" },
  { label: "30j", value: "30d" },
];

export default function TimeWindowSelector({ value, onChange }: Props) {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] p-1">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
            value === opt.value
              ? "bg-[var(--primary-muted)] text-[var(--primary)]"
              : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
