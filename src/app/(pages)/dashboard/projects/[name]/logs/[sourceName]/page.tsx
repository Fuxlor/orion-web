"use client";

import { notFound } from "next/navigation";
import { useParams } from "next/navigation";
import { useProject } from "@/contexts/projectContext";
import { useProjects } from "@/contexts/projectsContext";
import { useLogSources } from "@/hooks/useLogSources";

export default function SourceLogsPage() {
  const params = useParams<{ name: string; sourceName: string }>();
  const { project, projectSlug } = useProject();
  const { loading } = useProjects();
  const { logSources } = useLogSources(projectSlug);

  const source = logSources.find((s) => s.name === params.sourceName);

  if (loading) return <div className="text-[var(--text-muted)]">Loading…</div>;
  if (projectSlug && !project) notFound();

  return (
    <div>
      <h1 className="text-xl font-semibold text-white mb-2">
        Logs — {project?.label} / {source?.label ?? params.sourceName}
      </h1>
      <p className="text-[var(--text-secondary)]">
        Logs from the {source?.label ?? params.sourceName} source.
      </p>
    </div>
  );
}
