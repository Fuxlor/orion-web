"use client";

import Link from "next/link";
import { useProject } from "@/contexts/projectContext";
import { useServers } from "@/hooks/useServers";
import { relativeTime } from "@/lib/format";
import { ServerStatusBadge } from "@/components/dashboard/StatusBadge";

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
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Display Name</th>
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
                  <td className="px-4 py-3 text-[var(--text-muted)]">{srv.name ?? "—"}</td>
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
