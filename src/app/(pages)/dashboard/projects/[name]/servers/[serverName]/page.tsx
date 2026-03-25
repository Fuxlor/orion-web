"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useServerDetail } from "@/hooks/useServerDetail";
import { useServerCommands } from "@/hooks/useServerCommands";
import { apiFetch } from "@/lib/api";
import UptimeBlock from "@/components/dashboard/UptimeBlock";
import AlertsSection from "@/components/dashboard/AlertsSection";
import { ServerStatus, StatsWindow } from "@/types";

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

function ServerStatusBadge({ status }: { status: ServerStatus }) {
  const config: Record<ServerStatus, { label: string; bg: string; text: string }> = {
    online: { label: "Online", bg: "rgba(2,241,148,0.12)", text: "#02f194" },
    partial: { label: "Partial", bg: "rgba(250,204,21,0.12)", text: "#facc15" },
    offline: { label: "Offline", bg: "rgba(248,113,113,0.12)", text: "#f87171" },
    archived: { label: "Archived", bg: "rgba(255,255,255,0.06)", text: "var(--text-muted)" },
  };
  const c = config[status];
  return (
    <span
      className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
      style={{ background: c.bg, color: c.text }}
    >
      {c.label}
    </span>
  );
}

function SourceStatusBadge({ status }: { status: 'started' | 'partial' | 'stopped' | null }) {
  if (status === 'started') return (
    <span className="rounded-full bg-[rgba(2,241,148,0.12)] px-2 py-0.5 text-[11px] font-semibold text-[#02f194]">Started</span>
  );
  if (status === 'partial') return (
    <span className="rounded-full bg-[rgba(250,204,21,0.12)] px-2 py-0.5 text-[11px] font-semibold text-[#facc15]">Partial</span>
  );
  if (status === 'stopped') return (
    <span className="rounded-full bg-[rgba(248,113,113,0.12)] px-2 py-0.5 text-[11px] font-semibold text-red-400">Stopped</span>
  );
  return (
    <span className="rounded-full bg-[var(--surface)] px-2 py-0.5 text-[11px] font-semibold text-[var(--text-muted)]">Unknown</span>
  );
}

function CommandButton({ projectName, serverName, type, onSuccess, disabled }: {
  projectName: string;
  serverName: string;
  type: 'restart' | 'stop';
  onSuccess?: () => void;
  disabled?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      await apiFetch(`/api/projects/${projectName}/servers/${encodeURIComponent(serverName)}/commands`, {
        method: 'POST',
        body: JSON.stringify({ type }),
      });
      setSent(true);
      setTimeout(() => setSent(false), 3000);
      onSuccess?.();
    } finally {
      setLoading(false);
    }
  };

  const isStop = type === 'stop';
  return (
    <button
      onClick={handleClick}
      disabled={loading || disabled}
      className={`hover:cursor-pointer px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${isStop
        ? "bg-[rgba(248,113,113,0.12)] text-red-400 hover:bg-[rgba(248,113,113,0.2)]"
        : "bg-[var(--primary-muted)] text-[var(--primary)] hover:opacity-80"
        }`}
    >
      {sent ? "Sent!" : loading ? "…" : disabled ? "Pending…" : type === 'restart' ? "Restart" : "Stop"}
    </button>
  );
}

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
