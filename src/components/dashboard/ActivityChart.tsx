import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ChartBucket, StatsWindow } from "@/types";
import { useProject } from "@/contexts/projectContext";

interface Props {
  chartData: ChartBucket[];
  window: StatsWindow;
}

function formatBucketLabel(iso: string, window: StatsWindow): string {
  const d = new Date(iso);
  if (window === "24h") {
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString("en-US", { day: "2-digit", month: "short" });
}

function generateBuckets(window: StatsWindow): string[] {
  const now = new Date();
  const buckets: string[] = [];

  if (window === "24h") {
    for (let i = 23; i >= 0; i--) {
      const d = new Date(now);
      d.setMinutes(0, 0, 0);
      d.setHours(d.getHours() - i);
      buckets.push(d.toISOString());
    }
  } else if (window === "7d") {
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      buckets.push(d.toISOString());
    }
  } else {
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      buckets.push(d.toISOString());
    }
  }

  return buckets;
}

type TooltipEntry = { name?: string; color?: string; value?: number };
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipEntry[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        backgroundColor: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: "10px 14px",
        fontSize: 12,
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div style={{ color: "var(--text-muted)", marginBottom: 6 }}>{label}</div>
      {payload.map((entry) => (
        <div key={entry.name} style={{ color: entry.color as string, marginBottom: 2 }}>
          {entry.name}: <strong>{(entry.value as number).toLocaleString()}</strong>
        </div>
      ))}
    </div>
  );
}

export default function ActivityChart({ chartData, window }: Props) {
  const { project, settings, settingsLoading } = useProject();
  if (!chartData) return null;

  const allBuckets = generateBuckets(window);
  const dataMap = new Map(
    chartData.map((b) => {
      const key =
        window === "24h"
          ? new Date(b.bucket_start).toISOString().substring(0, 14) + "00:00.000Z"
          : new Date(b.bucket_start).toISOString().substring(0, 11) + "00:00:00.000Z";
      return [key, b];
    })
  );

  const merged = allBuckets.map((key) => {
    const normalizedKey =
      window === "24h"
        ? key.substring(0, 14) + "00:00.000Z"
        : key.substring(0, 11) + "00:00:00.000Z";
    const found = dataMap.get(normalizedKey);
    const returnValue: Record<string, number> = {
      label: formatBucketLabel(key, window),
    };
    settings?.enabled_levels.map((level) => (
      returnValue[level] = found?.[level] ?? 0
    ))
    return returnValue;
  });

  return (
    <div
      className="rounded-[14px] p-5"
      style={{
        backgroundColor: "var(--card)",
        border: "1px solid var(--border)",
      }}
    >
      <p
        className="mb-4 text-[11px] font-bold uppercase tracking-widest"
        style={{ color: "var(--text-muted)" }}
      >
        Log Activity
      </p>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={merged} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
          <defs>
            {!settingsLoading && settings?.enabled_levels.map((level) => (
              <linearGradient id={`grad${level}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={`var(--level-${level})`} stopOpacity={0.3} />
                <stop offset="95%" stopColor={`var(--level-${level})`} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border)"
            vertical={false}
          />
          <XAxis
            dataKey="label"
            tick={{ fill: "var(--text-muted)", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: "var(--text-muted)", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          {!settingsLoading && settings?.enabled_levels.map((level) => (
            <Area
              type="monotone"
              dataKey={level}
              name={level.charAt(0).toUpperCase() + level.slice(1)}
              stroke={`var(--level-${level})`}
              strokeWidth={1.5}
              fill={`url(#grad${level})`}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="mt-3 flex items-center gap-5">
        {!settingsLoading && settings?.enabled_levels.map((level) => (
          <div key={level} className="flex items-center gap-1.5">
            <span
              className="inline-block w-2 h-2 rounded-sm"
              style={{ backgroundColor: `var(--level-${level})` }}
            />
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
