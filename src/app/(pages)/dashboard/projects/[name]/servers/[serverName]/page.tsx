"use client";

import { useParams } from "next/navigation";
import { useServerDetail } from "@/hooks/useServerDetail";
import { useServerCommands } from "@/hooks/useServerCommands";
import UptimeBlock from "@/components/dashboard/UptimeBlock";
import AlertsSection from "@/components/dashboard/AlertsSection";
import { relativeTime } from "@/lib/format";
import { ServerStatusBadge, SourceStatusBadge } from "@/components/dashboard/StatusBadge";
import { CommandButton } from "@/components/dashboard/CommandButton";

export default function ServerDetailPage() {
  const params = useParams<{ name: string; serverName: string }>();
  const { server, loading } = useServerDetail(params.name, decodeURIComponent(params.serverName));
  const { hasPendingCommand, refetch: refetchCommands } = useServerCommands(params.name, decodeURIComponent(params.serverName));

  if (loading && !server) {
    return <div className="text-[var(--text-muted)]">Loading…</div>;
  }

  if (!server) {
    return <div className="text-[var(--text-muted)]">Server not found.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-xl font-semibold text-white">{server.hostname}</h1>
          <ServerStatusBadge status={server.status} />
          {server.ip && (
            <span className="rounded bg-[var(--surface)] px-2 py-0.5 text-xs text-[var(--text-muted)] font-mono">
              {server.ip}
            </span>
          )}
          {server.last_seen_at && (
            <span className="text-xs text-[var(--text-muted)]">
              Last seen {relativeTime(server.last_seen_at)}
            </span>
          )}
        </div>
      </div>

      {/* Uptime + Actions */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <UptimeBlock uptimePercent={server.uptime_percent ?? null} />
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5">
          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
            Remote Commands
          </p>
          <p className="mb-3 text-xs text-[var(--text-muted)]">
            Commands are queued and executed by the SDK on next heartbeat.
          </p>
          <div className="flex gap-3">
            <CommandButton
              projectName={params.name}
              serverName={server.hostname}
              type="restart"
              onSuccess={refetchCommands}
              disabled={hasPendingCommand('restart')}
            />
            <CommandButton
              projectName={params.name}
              serverName={server.hostname}
              type="stop"
              onSuccess={refetchCommands}
              disabled={hasPendingCommand('stop')}
            />
          </div>
        </div>
      </div>

      {/* Sources table */}
      <div>
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
          Sources on this server
        </p>
        {server.sources.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">No sources linked to this server.</p>
        ) : (
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Environment</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Last Ping</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {server.sources.map((src) => (
                  <tr key={src.name} className="hover:bg-[var(--surface)] transition-colors hover:cursor-pointer" onClick={() => window.location.href = `/dashboard/projects/${params.name}/sources/${encodeURIComponent(src.name)}`}>
                    <td className="px-4 py-3">{src.name}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-[var(--text-muted)]">{src.environment}</span>
                    </td>
                    <td className="px-4 py-3"><SourceStatusBadge status={src.status} /></td>
                    <td className="px-4 py-3 text-[var(--text-muted)]">{relativeTime(src.last_ping_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Alerts */}
      <AlertsSection />
    </div>
  );
}
