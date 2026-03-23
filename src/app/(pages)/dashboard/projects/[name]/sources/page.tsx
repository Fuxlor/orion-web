"use client";

import { useProject } from "@/contexts/projectContext";
import { apiFetch } from "@/lib/api";
import { SourceStatus, SourceStats } from "@/types";
import { useEffect, useState } from "react";

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

function SourceStatusBadge({ status }: { status: SourceStatus }) {
  const config: Record<SourceStatus, { label: string; bg: string; text: string }> = {
    UP: { label: "UP", bg: "rgba(2,241,148,0.12)", text: "#02f194" },
    DOWN: { label: "DOWN", bg: "rgba(248,113,113,0.12)", text: "#f87171" },
  };
  const c = config[status];
  if (!c) return null;
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
          data.status = data.performance === null ? 'DOWN' : 'UP';
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
                <tr key={src.id} className="hover:bg-[var(--surface)] transition-colors hover:cursor-pointer" onClick={() => window.location.href = `/dashboard/projects/${projectName}/sources/${encodeURIComponent(src.name)}`}>
                  <td className="px-4 py-3">{src.name}</td>
                  <td className="px-4 py-3">{src.environment}</td>
                  <td className="px-4 py-3">{src.description}</td>
                  <td className="px-4 py-3">{sourcesStats[src.name]?.server?.name}</td>
                  <td className="px-4 py-3">{sourcesStats[src.name]?.uptime_percent}%</td>
                  <td className="px-4 py-3"><SourceStatusBadge status={sourcesStats[src.name]?.status || 'DOWN'} /></td>
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
