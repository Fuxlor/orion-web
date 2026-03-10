import { ChartBucket, StatsWindow } from "@/types";

interface Props {
  chartData: ChartBucket[];
  window: StatsWindow;
}

type Level = 'info' | 'warn' | 'error' | 'debug';

const LEVELS: { level: Level; color: string; label: string }[] = [
  { level: 'info',  color: '#60a5fa', label: 'Info' },
  { level: 'warn',  color: '#facc15', label: 'Warn' },
  { level: 'error', color: '#f87171', label: 'Error' },
  { level: 'debug', color: '#9ca3af', label: 'Debug' },
];

function formatBucketLabel(iso: string, window: StatsWindow): string {
  const d = new Date(iso);
  if (window === '24h') {
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
}

function generateBuckets(window: StatsWindow): string[] {
  const now = new Date();
  const buckets: string[] = [];

  if (window === '24h') {
    for (let i = 23; i >= 0; i--) {
      const d = new Date(now);
      d.setMinutes(0, 0, 0);
      d.setHours(d.getHours() - i);
      buckets.push(d.toISOString());
    }
  } else if (window === '7d') {
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

export default function ActivityChart({ chartData, window }: Props) {
  if (!chartData) return null;

  // Build a full bucket list and merge in server data
  const allBuckets = generateBuckets(window);
  const dataMap = new Map(chartData.map((b) => {
    // Normalize to match truncated bucket key
    const key = window === '24h'
      ? new Date(b.bucket_start).toISOString().substring(0, 14) + '00:00.000Z'
      : new Date(b.bucket_start).toISOString().substring(0, 11) + '00:00:00.000Z';
    return [key, b];
  }));

  const merged: (ChartBucket & { key: string })[] = allBuckets.map((key) => {
    const normalizedKey = window === '24h'
      ? key.substring(0, 14) + '00:00.000Z'
      : key.substring(0, 11) + '00:00:00.000Z';
    const found = dataMap.get(normalizedKey);
    return {
      key,
      bucket_start: key,
      info:  found?.info  ?? 0,
      warn:  found?.warn  ?? 0,
      error: found?.error ?? 0,
      debug: found?.debug ?? 0,
    };
  });

  // Chart dimensions (viewBox units)
  const VW = 560;
  const VH = 140;
  const LEFT = 40;
  const BOTTOM = 24;
  const chartW = VW - LEFT - 4;
  const chartH = VH - BOTTOM - 8;

  const totals = merged.map((b) => b.info + b.warn + b.error + b.debug);
  const maxVal = Math.max(...totals, 1);

  // Grid lines
  const gridCount = 4;
  const gridLines = Array.from({ length: gridCount + 1 }, (_, i) =>
    Math.round((maxVal / gridCount) * i)
  );

  const barW = Math.max((chartW / merged.length) - 2, 2);
  const barSpacing = chartW / merged.length;

  // X-axis labels: first, middle, last
  const labelIndices = [0, Math.floor(merged.length / 2), merged.length - 1];

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] p-5">
      <p className="mb-4 text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
        Activité des logs
      </p>
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        width="100%"
        aria-label="Graphique d'activité des logs"
      >
        {/* Grid lines */}
        {gridLines.map((val, i) => {
          const y = 8 + chartH - (val / maxVal) * chartH;
          return (
            <g key={i}>
              <line
                x1={LEFT}
                x2={LEFT + chartW}
                y1={y}
                y2={y}
                stroke="var(--border)"
                strokeWidth="0.5"
              />
              <text
                x={LEFT - 4}
                y={y + 3}
                textAnchor="end"
                fontSize="8"
                fill="var(--text-muted)"
              >
                {val}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {merged.map((bucket, i) => {
          const x = LEFT + i * barSpacing + (barSpacing - barW) / 2;
          let yOffset = 8 + chartH;

          return (
            <g key={bucket.key}>
              {LEVELS.map(({ level, color }) => {
                const val = bucket[level];
                if (val === 0) return null;
                const barH = (val / maxVal) * chartH;
                yOffset -= barH;
                return (
                  <rect
                    key={level}
                    x={x}
                    y={yOffset}
                    width={barW}
                    height={barH}
                    fill={color}
                    opacity={0.85}
                    rx={1}
                  />
                );
              })}
            </g>
          );
        })}

        {/* X axis */}
        <line
          x1={LEFT}
          x2={LEFT + chartW}
          y1={8 + chartH}
          y2={8 + chartH}
          stroke="var(--border)"
          strokeWidth="0.5"
        />

        {/* X labels */}
        {labelIndices.map((idx) => {
          const bucket = merged[idx];
          if (!bucket) return null;
          const x = LEFT + idx * barSpacing + barSpacing / 2;
          return (
            <text
              key={idx}
              x={x}
              y={VH - 4}
              textAnchor="middle"
              fontSize="8"
              fill="var(--text-muted)"
            >
              {formatBucketLabel(bucket.key, window)}
            </text>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="mt-2 flex items-center gap-4">
        {LEVELS.map(({ level, color, label }) => (
          <div key={level} className="flex items-center gap-1">
            <span
              className="inline-block h-2 w-2 rounded-sm"
              style={{ backgroundColor: color }}
            />
            <span className="text-xs text-[var(--text-muted)]">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
