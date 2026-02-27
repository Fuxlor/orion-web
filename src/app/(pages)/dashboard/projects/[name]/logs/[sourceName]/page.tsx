"use client";

import { notFound } from "next/navigation";
import { useParams } from "next/navigation";
import { useProject } from "@/contexts/projectContext";
import { useProjects } from "@/contexts/projectsContext";
import { useLogs } from "@/contexts/logsContext";
import { useError } from "@/contexts/errorContext";
import { useEffect } from "react";
import { LogSource } from "@/types";

export default function SourceLogsPage() {
  const params = useParams<{ name: string; sourceName: string }>();
  const { project, projectSlug } = useProject();
  const { loading } = useProjects();
  const { logs, setSource, setProjectName } = useLogs();
  const { error } = useError();

  useEffect(() => {
    setSource({ name: params.sourceName, description: "", environment: "" } as LogSource);
    setProjectName(params.name);
  }, [setSource, params.sourceName, setProjectName, params.name]);

  if (loading) return <div className="text-[var(--text-muted)]">Loading…</div>;
  if (projectSlug && !project) notFound();

  return (
    <div className="flex flex-col h-full gap-4">
      <h1 className="text-xl font-semibold text-white mb-2">
        Logs — {project?.label} / {params.sourceName}
      </h1>
      <p className="text-[var(--text-secondary)]">
        Logs from the {params.sourceName} source.
      </p>

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
                <p>[{new Date(log.timestamp).toISOString()}] [{log.level}] [{log.source}] {log.message}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
