import { ChartBucket } from "@/types";
import AnimatedNumber from "./AnimatedNumber";

interface Props {
  logCounts: {
    info: number;
    warn: number;
    error: number;
    debug: number;
    verbose?: number;
    trace?: number;
    total: number;
  };
  chartData: ChartBucket[];
  timeWindow?: string | null;
}

type Level = "info" | "warn" | "error" | "debug" | "verbose" | "trace";

const LEVEL_CONFIG: { level: Level; label: string; color: string; stroke: string }[] = [
  { level: "info", label: "Info", color: "var(--level-info)", stroke: "var(--level-info)" },
  { level: "warn", label: "Warn", color: "var(--level-warn)", stroke: "var(--level-warn)" },
  { level: "error", label: "Error", color: "var(--level-error)", stroke: "var(--level-error)" },
  { level: "debug", label: "Debug", color: "var(--level-debug)", stroke: "var(--level-debug)" },
  { level: "verbose", label: "Verbose", color: "var(--level-verbose)", stroke: "var(--level-verbose)" },
  { level: "trace", label: "Trace", color: "var(--level-trace)", stroke: "var(--level-trace)" },
];

function Sparkline({
  data,
  level,
  stroke,
}: {
  data: ChartBucket[];
  level: Level;
  stroke: string;
}) {
  if (data.length < 2) return <svg width={40} height={20} />;
  const values = data.map((b) => Number(b[level]) || 0);
  const max = Math.max(...values, 1);
  const W = 40;
  const H = 20;
  const pad = 2;
  const points = values
    .map((v, i) => {
      const x = pad + (i / (values.length - 1)) * (W - pad * 2);
      const y = H - pad - (v / max) * (H - pad * 2);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <polyline
        points={points}
        fill="none"
        style={{ stroke }}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function LogCounters({ logCounts, chartData, timeWindow }: Props) {
  if (!logCounts) return null;

  const activeConfigs = LEVEL_CONFIG.filter(
    ({ level }) => (logCounts[level] ?? 0) > 0
  );

  return (
    <div
      className="rounded-lg p-5"
      style={{
        backgroundColor: "var(--card)",
        border: "1px solid var(--border)",
      }}
    >
      <p
        className="mb-4 text-[11px] font-bold uppercase tracking-widest"
        style={{ color: "var(--text-muted)" }}
      >
        Log Volume {timeWindow ? `(${timeWindow})` : ""}
      </p>
      <div className="grid gap-4 auto-cols-max grid-flow-col justify-between">
        {activeConfigs.map(({ level, label, color, stroke }) => (
          <div key={level} className="flex items-center gap-2">
            <div>
              <p className="text-xs mb-0.5" style={{ color: "var(--text-muted)" }}>
                {label}
              </p>
              <p className="text-xl font-bold" style={{ color }}>
                <AnimatedNumber value={logCounts[level] ?? 0} />
              </p>
            </div>
            <Sparkline data={chartData} level={level} stroke={stroke} />
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs" style={{ color: "var(--text-muted)" }}>
        Total:{" "}
        <span className="font-semibold" style={{ color: "var(--foreground)" }}>
          <AnimatedNumber value={logCounts.total} />
        </span>
      </p>
    </div>
  );
}
