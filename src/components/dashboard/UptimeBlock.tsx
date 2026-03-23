import AnimatedNumber from "./AnimatedNumber";

interface Props {
  uptimePercent: number | null;
  timeWindow?: string | null;
}

function getValueColor(pct: number | null): string {
  if (pct === null) return "var(--text-muted)";
  if (pct >= 99) return "var(--primary)";
  if (pct >= 95) return "var(--status-warning)";
  return "var(--level-error)";
}

function getBarColor(pct: number | null): string {
  if (pct === null) return "var(--border)";
  if (pct >= 99) return "var(--primary)";
  if (pct >= 95) return "var(--status-warning)";
  return "var(--level-error)";
}

export default function UptimeBlock({ uptimePercent, timeWindow }: Props) {
  const valueColor = getValueColor(uptimePercent);
  const barColor = getBarColor(uptimePercent);

  return (
    <div
      className="rounded-lg p-5"
      style={{
        backgroundColor: "var(--card)",
        border: "1px solid var(--border)",
      }}
    >
      <p
        className="mb-2 text-[11px] font-bold uppercase tracking-widest"
        style={{ color: "var(--text-muted)" }}
      >
        Global Uptime {timeWindow ? `(${timeWindow})` : ""}
      </p>
      <p
        className="text-3xl font-bold mb-3"
        style={{ color: valueColor }}
      >
        {uptimePercent !== null ? (
          <>
            <AnimatedNumber value={Math.round(uptimePercent * 100) / 100} />%
          </>
        ) : (
          "N/A"
        )}
      </p>
      {uptimePercent !== null && (
        <div
          className="h-1.5 w-full rounded-full"
          style={{ backgroundColor: "var(--border)" }}
        >
          <div
            className="h-1.5 rounded-full transition-all"
            style={{
              width: `${Math.min(uptimePercent, 100)}%`,
              backgroundColor: barColor,
            }}
          />
        </div>
      )}
    </div>
  );
}
