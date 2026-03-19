"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useSourceStats } from "@/hooks/useSourceStats";
import { apiFetch } from "@/lib/api";
import UptimeBlock from "@/components/dashboard/UptimeBlock";
import TimeWindowSelector from "@/components/dashboard/TimeWindowSelector";
import ActivityChart from "@/components/dashboard/ActivityChart";
import { StatsWindow } from "@/types";
import LogCounters from "@/components/dashboard/LogCounters";

function relativeTime(isoString: string | null): string {
  if (!isoString) return "never";
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  return `${Math.floor(diffH / 24)}d ago`;
}

function formatUptime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
}

function EnvironmentBadge({ env }: { env: string | null }) {
  if (!env) return null;
  const config: Record<string, { bg: string; text: string }> = {
    prod: { bg: "rgba(248,113,113,0.15)", text: "#f87171" },
    staging: { bg: "rgba(250,204,21,0.15)", text: "#facc15" },
    test: { bg: "rgba(96,165,250,0.15)", text: "#60a5fa" },
    dev: { bg: "rgba(255,255,255,0.06)", text: "var(--text-muted)" },
  };
  const c = config[env] ?? config.dev;
  return (
    <span
      className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
      style={{ background: c.bg, color: c.text }}
    >
      {env}
    </span>
  );
}

const LOG_LEVELS = [
  { key: 'info', label: 'Info', color: '#60a5fa' },
  { key: 'warn', label: 'Warn', color: '#facc15' },
  { key: 'error', label: 'Error', color: '#f87171' },
  { key: 'debug', label: 'Debug', color: '#9ca3af' },
  { key: 'verbose', label: 'Verbose', color: '#a78bfa' },
  { key: 'trace', label: 'Trace', color: '#6ee7b7' },
] as const;

function CommandButton({ projectName, serverName, sourceName, type }: {
  projectName: string;
  serverName: string;
  sourceName: string;
  type: 'restart' | 'stop';
}) {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      await apiFetch(`/api/projects/${projectName}/servers/${encodeURIComponent(serverName)}/commands`, {
        method: 'POST',
        body: JSON.stringify({ type, source: sourceName }),
      });
      setSent(true);
      setTimeout(() => setSent(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  const isStop = type === 'stop';
  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`hover:cursor-pointer px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${isStop
        ? "bg-[rgba(248,113,113,0.12)] text-red-400 hover:bg-[rgba(248,113,113,0.2)]"
        : "bg-[var(--primary-muted)] text-[var(--primary)] hover:opacity-80"
        }`}
    >
      {sent ? "Sent!" : loading ? "…" : type === 'restart' ? "Restart" : "Stop"}
    </button>
  );
}

export default function SourceStatsPage() {
  const params = useParams<{ name: string; sourceName: string }>();
  const sourceName = decodeURIComponent(params.sourceName);
  const [statsWindow, setStatsWindow] = useState<StatsWindow>("24h");
  const { stats, loading } = useSourceStats(params.name, sourceName, statsWindow);

  if (loading && !stats) {
    return <div className="text-[var(--text-muted)]">Loading…</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-xl font-semibold text-white">{sourceName}</h1>
          <EnvironmentBadge env={stats?.environment ?? null} />
          {stats?.server && (
            <Link
              href={`/dashboard/projects/${params.name}/servers/${encodeURIComponent(stats.server.hostname)}`}
              className="text-xs text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors"
            >
              ↗ {stats.server.hostname}
            </Link>
          )}
        </div>
        <TimeWindowSelector value={statsWindow} onChange={setStatsWindow} />
      </div>

      {/* Uptime + Actions */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <UptimeBlock uptimePercent={stats?.uptime_percent ?? null} />
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5">
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
            Source Actions
          </p>
          <div className="flex flex-wrap gap-3">
            {stats?.server ? (
              <>
                <CommandButton
                  projectName={params.name}
                  serverName={stats.server.hostname}
                  sourceName={sourceName}
                  type="restart"
                />
                <CommandButton
                  projectName={params.name}
                  serverName={stats.server.hostname}
                  sourceName={sourceName}
                  type="stop"
                />
              </>
            ) : (
              <p className="text-xs text-[var(--text-muted)]">Commands require a linked server.</p>
            )}
            <Link
              href={`/dashboard/projects/${params.name}/logs/${encodeURIComponent(sourceName)}`}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--secondary)] text-[var(--text-secondary)] hover:text-white transition-colors"
            >
              View Logs →
            </Link>
          </div>
        </div>
      </div>

      {/* Log level breakdown */}
      {stats && (
        <LogCounters logCounts={stats.log_counts} chartData={stats.chart_data} />
      )}

      {/* Recent errors */}
      {stats && (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5">
          <div className="mb-3 flex items-center gap-2">
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
              Recent Errors
            </p>
            {/* {stats.recent_errors.length > 0 && (
              <span className="rounded bg-[rgba(248,113,113,0.12)] px-1.5 py-0.5 text-[10px] font-semibold text-red-400">
                {stats.recent_errors.length}
              </span>
            )} */}
          </div>
          {stats.recent_errors.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">No errors recorded.</p>
          ) : (
            <div className="space-y-1">
              {stats.recent_errors.slice(0, 6).map((err) => (
                <div
                  key={err.id}
                  className="flex items-start gap-3 rounded border-l-2 border-red-500/50 bg-[var(--surface)] px-3 py-2"
                >
                  <span className="shrink-0 text-xs text-[var(--text-muted)] tabular-nums pt-0.5">
                    {relativeTime(err.created_at)}
                  </span>
                  <p className="truncate text-sm text-[var(--text-secondary)]">
                    {err.message ?? <span className="italic text-[var(--text-muted)]">no message</span>}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Performance */}
      {stats?.performance && (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5">
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
            Performance
          </p>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
              <p className="text-xs text-[var(--text-muted)] mb-1">Avg CPU</p>
              <p className="text-xl font-bold text-white">{stats.performance.avg_cpu}<span className="text-sm font-normal text-[var(--text-muted)]">%</span></p>
            </div>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
              <p className="text-xs text-[var(--text-muted)] mb-1">Avg Memory</p>
              <p className="text-xl font-bold text-white">
                {stats.performance.avg_memory_used}
                <span className="text-sm font-normal text-[var(--text-muted)]">
                  {' '}/ {stats.performance.avg_memory_total} MB
                </span>
              </p>
            </div>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
              <p className="text-xs text-[var(--text-muted)] mb-1">Process Uptime</p>
              <p className="text-xl font-bold text-white">{formatUptime(stats.performance.last_uptime_seconds)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
