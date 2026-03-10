interface Props {
  uptimePercent: number | null;
}

function getColor(pct: number | null): string {
  if (pct === null) return "text-[var(--text-muted)]";
  if (pct >= 99)    return "text-[#02f194]";
  if (pct >= 95)    return "text-yellow-400";
  return "text-red-400";
}

function getBarColor(pct: number | null): string {
  if (pct === null) return "bg-[var(--border)]";
  if (pct >= 99)    return "bg-[#02f194]";
  if (pct >= 95)    return "bg-yellow-400";
  return "bg-red-400";
}

export default function UptimeBlock({ uptimePercent }: Props) {
  const color   = getColor(uptimePercent);
  const barColor = getBarColor(uptimePercent);
  const display  = uptimePercent !== null ? `${uptimePercent.toFixed(2)}%` : "N/A";

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] p-5">
      <p className="mb-1 text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
        Uptime global
      </p>
      <p className={`text-3xl font-bold ${color}`}>{display}</p>
      {uptimePercent !== null && (
        <div className="mt-3 h-1.5 w-full rounded-full bg-[var(--border)]">
          <div
            className={`h-1.5 rounded-full transition-all ${barColor}`}
            style={{ width: `${Math.min(uptimePercent, 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}
