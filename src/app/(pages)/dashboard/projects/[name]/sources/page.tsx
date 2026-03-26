"use client";

import { useProject } from "@/contexts/projectContext";
import { apiFetch } from "@/lib/api";
import { SourceStats } from "@/types";
import { useEffect, useState } from "react";
import { relativeTime } from "@/lib/format";
import { SourceStatusBadge } from "@/components/dashboard/StatusBadge";

export default function ServersPage() {
  const { sources, projectName, settingsLoading } = useProject();
  const [sourcesStats, setSourcesStats] = useState<{ [key: string]: SourceStats }>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setSourcesStats(undefined);
    for (const source of sources) {
      apiFetch(`/api/projects/${projectName}/sources/${source.name}/stats`)
        .then((res) => res.json())
        .then((data) => {
          // status is computed server-side from heartbeat data
          setSourcesStats((prev) => ({ ...prev, [source.name]: data }));
        });
    }
    setLoading(false);
  }, [projectName, settingsLoading]);

  if (loading) {
    return <div className="text-[var(--text-muted)]">Loading…</div>;
  }

  if (sourcesStats === undefined) {
    return <div className="text-[var(--text-muted)]">Error while loading sources stats.</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-white">Sources</h1>

      {sources.length === 0 ? (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-8 text-center">
          <p className="text-[var(--text-muted)]">No sources created yet.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Environment</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Description</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Server</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Uptime</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Last Seen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {sources.map((src) => (
                <tr key={src.name} className="hover:bg-[var(--surface)] transition-colors hover:cursor-pointer" onClick={() => window.location.href = `/dashboard/projects/${projectName}/sources/${encodeURIComponent(src.name)}`}>
                  <td className="px-4 py-3">{src.name}</td>
                  <td className="px-4 py-3">{src.environment}</td>
                  <td className="px-4 py-3">{src.description}</td>
                  <td className="px-4 py-3">{sourcesStats[src.name]?.server?.name}</td>
                  <td className="px-4 py-3">{sourcesStats[src.name]?.uptime_percent}%</td>
                  <td className="px-4 py-3"><SourceStatusBadge status={sourcesStats[src.name]?.status ?? null} /></td>
                  <td className="px-4 py-3 text-[var(--text-muted)]">{relativeTime(sourcesStats[src.name]?.last_seen_at || null)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
