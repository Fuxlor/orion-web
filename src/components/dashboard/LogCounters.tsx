import { ChartBucket } from "@/types";

interface Props {
  logCounts: { info: number; warn: number; error: number; debug: number; verbose: number; trace: number; total: number };
  chartData: ChartBucket[];
}

type Level = 'info' | 'warn' | 'error' | 'debug' | 'verbose' | 'trace';

const LEVEL_CONFIG: { level: Level; label: string; color: string; stroke: string }[] = [
  { level: 'info', label: 'Info', color: 'text-blue-400', stroke: '#60a5fa' },
  { level: 'warn', label: 'Warn', color: 'text-yellow-400', stroke: '#facc15' },
  { level: 'error', label: 'Error', color: 'text-red-400', stroke: '#f87171' },
  { level: 'debug', label: 'Debug', color: 'text-gray-400', stroke: '#9ca3af' },
  { level: 'verbose', label: 'Verbose', color: 'text-violet-400', stroke: '#a78bfa' },
  { level: 'trace', label: 'Trace', color: 'text-green-300', stroke: '#6ee7b7' },
];

function Sparkline({ data, level, stroke }: { data: ChartBucket[]; level: Level; stroke: string }) {
  if (data.length < 2) return <svg width={40} height={20} />;

  const values = data.map((b) => b[level]);
  const max = Math.max(...values, 1);
  const W = 40;
  const H = 20;
  const pad = 2;

  const points = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (W - pad * 2);
    const y = H - pad - (v / max) * (H - pad * 2);
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <polyline
        points={points}
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function LogCounters({ logCounts, chartData }: Props) {
  if (!logCounts) return null;

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] p-5">
      <p className="mb-4 text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
        Logs' Volume
      </p>
      <div className="grid gap-4 auto-cols-max grid-flow-col justify-between">
        {LEVEL_CONFIG.map(({ level, label, color, stroke }) => (
          logCounts[level] > 0 && (
            <div key={level} className="flex items-center justify-start gap-2">
              <div>
                <p className="text-xs text-[var(--text-muted)]">{label}</p>
                <p className={`text-xl font-bold ${color}`}>{logCounts[level]?.toLocaleString()}</p>
              </div>
              <Sparkline data={chartData} level={level} stroke={stroke} />
            </div>
          )
        ))}
      </div>
      <p className="mt-3 text-xs text-[var(--text-muted)]">
        Total : <span className="font-medium text-[var(--text-secondary)]">{logCounts.total.toLocaleString()}</span>
      </p>
    </div>
  );
}
