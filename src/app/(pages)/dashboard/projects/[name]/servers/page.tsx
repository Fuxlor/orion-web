"use client";

import Link from "next/link";
import { useProject } from "@/contexts/projectContext";
import { useServers } from "@/hooks/useServers";
import { ServerStatus } from "@/types";

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

export default function ServersPage() {
  const { projectName } = useProject();
  const { servers, loading } = useServers(projectName);

  if (loading && servers.length === 0) {
    return <div className="text-[var(--text-muted)]">Loading…</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-white">Servers</h1>

      {servers.length === 0 ? (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-8 text-center">
          <p className="text-[var(--text-muted)]">No servers detected yet.</p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Servers appear automatically when the SDK sends a heartbeat with a hostname.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Hostname</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">IP</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Sources</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Last Seen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {servers.map((srv) => (
                <tr key={srv.id} className="hover:bg-[var(--surface)] transition-colors hover:cursor-pointer" onClick={() => window.location.href = `/dashboard/projects/${projectName}/servers/${encodeURIComponent(srv.hostname)}`}>
                  <td className="px-4 py-3">{srv.hostname}</td>
                  <td className="px-4 py-3 text-[var(--text-muted)]">{srv.ip ?? "—"}</td>
                  <td className="px-4 py-3"><ServerStatusBadge status={srv.status} /></td>
                  <td className="px-4 py-3 text-[var(--text-muted)]">{srv.source_count}</td>
                  <td className="px-4 py-3 text-[var(--text-muted)]">{relativeTime(srv.last_seen_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
