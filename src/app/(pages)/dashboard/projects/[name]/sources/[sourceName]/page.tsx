"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useSourceStats } from "@/hooks/useSourceStats";
import { useServerCommands } from "@/hooks/useServerCommands";
import UptimeBlock from "@/components/dashboard/UptimeBlock";
import TimeWindowSelector from "@/components/dashboard/TimeWindowSelector";
import { LogSource, StatsWindow } from "@/types";
import LogCounters from "@/components/dashboard/LogCounters";
import { useLogs } from "@/contexts/logsContext";
import LogViewer from "@/components/dashboard/logs/LogViewer";
import { useLogFilters } from "@/hooks/useLogFilters";
import { useLogSearch } from "@/hooks/useLogSearch";
import LogSearchBar from "@/components/dashboard/logs/LogSearchBar";

import { relativeTime, formatUptime, formatBytes } from "@/lib/format";
import { SourceStatusBadge } from "@/components/dashboard/StatusBadge";
import { CommandButton } from "@/components/dashboard/CommandButton";

export default function SourceStatsPage() {
  const params = useParams<{ name: string; sourceName: string }>();
  const sourceName = decodeURIComponent(params.sourceName);
  const [statsWindow, setStatsWindow] = useState<StatsWindow>("24h");
  const { stats, loading } = useSourceStats(params.name, sourceName, statsWindow);
  const serverHostname = stats?.server?.hostname ?? null;
  const { hasPendingCommand, refetch: refetchCommands } = useServerCommands(params.name, serverHostname);
  const { logs: liveLogs, setSource } = useLogs();

  // For real-time mode: subscribe to "all" source
  useEffect(() => {
    setSource({ name: sourceName, description: sourceName, environment: stats?.environment ?? "all" } as LogSource);
  }, [setSource]);

  if (stats?.status === 'stopped') {
    console.log(stats);
    console.log(stats?.status);
  }

  if (loading && !stats) {
    return <div className="text-[var(--text-muted)]">Loading…</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-xl font-semibold text-white">{sourceName}</h1>
          <SourceStatusBadge status={stats?.status ?? null} />
          {stats?.server && (
            <Link
              href={`/dashboard/projects/${params.name}/servers/${encodeURIComponent(stats.server.hostname)}`}
              className="text-xs text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors"
            >
              ↗ {stats.server.name || stats.server.hostname}
            </Link>
          )}
        </div>
        <TimeWindowSelector value={statsWindow} onChange={setStatsWindow} />
      </div>

      {/* Uptime + Actions */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <UptimeBlock uptimePercent={stats?.uptime_percent ?? null} timeWindow={statsWindow} />
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
                  type="start"
                  disabled={hasPendingCommand('start', sourceName)}
                  onSuccess={refetchCommands}
                />
                <CommandButton
                  projectName={params.name}
                  serverName={stats.server.hostname}
                  sourceName={sourceName}
                  type="restart"
                  disabled={hasPendingCommand('restart', sourceName)}
                  unjoinable={stats?.status === 'stopped'}
                  onSuccess={refetchCommands}
                />
                <CommandButton
                  projectName={params.name}
                  serverName={stats.server.hostname}
                  sourceName={sourceName}
                  type="stop"
                  disabled={hasPendingCommand('stop', sourceName)}
                  unjoinable={stats?.status === 'stopped'}
                  onSuccess={refetchCommands}
                />
              </>
            ) : (
              <p className="text-xs text-[var(--text-muted)]">Commands require a linked server.</p>
            )}
            {/* <Link
              href={`/dashboard/projects/${params.name}/logs/${encodeURIComponent(sourceName)}`}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--secondary)] text-[var(--text-secondary)] hover:text-white transition-colors"
            >
              View Logs →
            </Link> */}
          </div>
        </div>
      </div>

      {/* Log level breakdown */}
      {stats && (
        <LogCounters logCounts={stats.log_counts} chartData={stats.chart_data} timeWindow={statsWindow} />
      )}

      {/* Recent errors */}
      <div className="grid grid-cols-2 gap-4 shrink-0">
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

        <div className="flex flex-col gap-3 h-[306px]">
          <LogViewer logs={liveLogs} isLive={true} loading={false} header={false} />
        </div>
      </div>

      <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5">
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
          Performance {stats?.performance === null ? <span className="text-red-400">No data from last 2 minutes</span> : ''}
        </p>
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
            <p className="text-xs text-[var(--text-muted)] mb-1">Avg CPU</p>
            <p className="text-xl font-bold text-white">{stats?.performance?.avg_cpu ?? "-"}<span className="text-sm font-normal text-[var(--text-muted)]">%</span></p>
          </div>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
            <p className="text-xs text-[var(--text-muted)] mb-1">Avg Memory</p>
            <p className="text-xl font-bold text-white">
              {formatBytes(stats?.performance?.avg_memory_used) ?? "-"}
              <span className="text-sm font-normal text-[var(--text-muted)]">
                {' '}/ {formatBytes(stats?.performance?.avg_memory_total) ?? "-"}
              </span>
            </p>
          </div>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
            <p className="text-xs text-[var(--text-muted)] mb-1">Process Uptime</p>
            <p className="text-xl font-bold text-white">{formatUptime(stats?.performance?.last_uptime_seconds ?? 0)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
