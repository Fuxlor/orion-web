"use client";

import { useEffect } from "react";
import { notFound } from "next/navigation";
import { useProject } from "@/contexts/projectContext";
import { useProjects } from "@/contexts/projectsContext";
import { useLogs } from "@/contexts/logsContext";
import { LogSource } from "@/types";
import { useError } from "@/contexts/errorContext";

export default function ProjectLogsPage() {
  const { project, projectSlug, sources } = useProject();
  const { error } = useError();
  const { loading } = useProjects();
  const { logs, setSource } = useLogs();

  useEffect(() => {
    setSource({ name: "all", description: "All", environment: "all" } as LogSource);
  }, [setSource]);

  if (loading) return <div className="text-[var(--text-muted)]">Loading…</div>;
  if (projectSlug && !project) notFound();

  return (
    <div className="flex flex-col h-full gap-4">
      <h1 className="text-xl font-semibold text-white shrink-0">
        Logs — {project?.label}
      </h1>

      {/* Stats row – little stats at top */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
        <div className="p-3 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)]">
          <p className="text-xs text-[var(--text-muted)]">Total entries</p>
          <p className="text-lg font-semibold text-white">{logs?.length || "-"}</p>
        </div>
        <div className="p-3 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)]">
          <p className="text-xs text-[var(--text-muted)]">Errors (24h)</p>
          <p className="text-lg font-semibold text-white">{logs?.filter((log) => log.level === "error").length || "-"}</p>
        </div>
        <div className="p-3 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)]">
          <p className="text-xs text-[var(--text-muted)]">Warnings (24h)</p>
          <p className="text-lg font-semibold text-white">{logs?.filter((log) => log.level === "warn").length || "-"}</p>
        </div>
        <div className="p-3 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)]">
          <p className="text-xs text-[var(--text-muted)]">Sources</p>
          <p className="text-lg font-semibold text-white">{sources?.length || "-"}</p>
        </div>
      </div>

      {/* Logs reader */}
      <div className="flex-1 min-h-0 rounded-lg border border-[var(--border)] bg-[var(--surface-input)] font-mono text-sm overflow-auto">
        <div className="p-4 text-[var(--text-muted)]">
          {error ? (
            <>
              <p>An error occured :</p>
              <p className="text-red-500">{error}</p>
            </>
          ) : (
            logs?.map((log) => (
              <div key={log.id}>
                <p>[{log.timestamp.toISOString()}] [{log.level}] [{log.source}] {log.message}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div >
  );
}
