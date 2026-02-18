"use client";

import { use, useEffect } from "react";
import { MOCK_PROJECTS } from "@/lib/projects";
import { useLogs } from "@/contexts/logsContext";
import { LogSource } from "@/types";

export default function ProjectLogsPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = use(params);
  const project = MOCK_PROJECTS.find((p) => p.name === name);
  const { logs, setLogSource, setLogSourceSlug } = useLogs();

  useEffect(() => {
    setLogSource({ id: "-1", name: "all", label: "All" } as LogSource);
    setLogSourceSlug("all");
  }, [setLogSource, setLogSourceSlug]);

  return (
    <div className="flex flex-col h-full gap-4">
      <h1 className="text-xl font-semibold text-white shrink-0">
        Logs — {project?.label}
      </h1>

      {/* Stats row – little stats at top */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
        <div className="p-3 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)]">
          <p className="text-xs text-[var(--text-muted)]">Total entries</p>
          <p className="text-lg font-semibold text-white">—</p>
        </div>
        <div className="p-3 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)]">
          <p className="text-xs text-[var(--text-muted)]">Errors (24h)</p>
          <p className="text-lg font-semibold text-white">—</p>
        </div>
        <div className="p-3 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)]">
          <p className="text-xs text-[var(--text-muted)]">Warnings (24h)</p>
          <p className="text-lg font-semibold text-white">—</p>
        </div>
        <div className="p-3 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)]">
          <p className="text-xs text-[var(--text-muted)]">Sources</p>
          <p className="text-lg font-semibold text-white">—</p>
        </div>
      </div>

      {/* Logs reader */}
      <div className="flex-1 min-h-0 rounded-lg border border-[var(--border)] bg-[var(--surface-input)] font-mono text-sm overflow-auto">
        <div className="p-4 text-[var(--text-muted)]">
          {logs?.map((log) => (
            <div key={log.id}>
              <p>[{log.timestamp.toISOString()}] [{log.level}] [{log.source}] {log.message}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
