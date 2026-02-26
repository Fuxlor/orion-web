"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Project, LogSource } from "@/types";
import { getProjectFromPathname } from "@/lib/projects";
import { apiFetch } from "@/lib/api";
import { useProjects } from "./projectsContext";
import { useError } from "./errorContext";

interface ProjectContextValue {
  /** Current project when viewing a project-scoped route, null on Overview */
  project: Project | null;
  /** URL slug (project name) when in project context */
  projectSlug: string | null;
  sources: LogSource[];
}

const ProjectContext = createContext<ProjectContextValue | null>(null);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const { setError } = useError();
  const pathname = usePathname();
  const projectSlug = getProjectFromPathname(pathname);
  const { projects } = useProjects();
  const project = projectSlug
    ? projects.find((p) => p.name === projectSlug) ?? null
    : null;
  const [sources, setSources] = useState<LogSource[]>([]);

  useEffect(() => {
    if (project) {
      apiFetch(`/api/projects/${project.name}/sources`)
        .then(res => res.json())
        .then(data => {
          if (data.error) {
            setError(data.message);
          } else {
            setError("");
            setSources(data.sources);
          }
        })
        .catch(err => {
          setError("An error occurred: " + err.message);
        });
    }
  }, [project]);

  return (
    <ProjectContext.Provider value={{ project, projectSlug, sources }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const ctx = useContext(ProjectContext);
  if (!ctx) {
    throw new Error("useProject must be used within ProjectProvider");
  }
  return ctx;
}
