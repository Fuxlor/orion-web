"use client";

import { notFound } from "next/navigation";
import { useProject } from "@/contexts/projectContext";
import { useProjects } from "@/contexts/projectsContext";

export default function ProjectAlertsPage() {
  const { project, projectName } = useProject();
  const { loading } = useProjects();

  if (loading) return <div className="text-[var(--text-muted)]">Loading…</div>;
  if (projectName && !project) notFound();

  return (
    <div>
      Alerts of the project {project?.label}
    </div>
  );
}
