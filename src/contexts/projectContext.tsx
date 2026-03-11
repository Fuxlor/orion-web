"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { LogSource, Project, ServerSummary } from "@/types";
import { getProjectFromPathname } from "@/lib/projects";
import { apiFetch } from "@/lib/api";
import { useError } from "./errorContext";
import { useProjects } from "./projectsContext";

interface ProjectContextValue {
  /** URL slug (project name) when in project context */
  projectName: string | null;
  project: Project | null;
  sources: LogSource[];
  servers: ServerSummary[];
}

const ProjectContext = createContext<ProjectContextValue | null>(null);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const { setError } = useError();
  const pathname = usePathname();
  const projectName = getProjectFromPathname(pathname);
  const { projects } = useProjects();
  const project = projectName
    ? projects.find((p) => p.name === projectName) ?? null
    : null;

  const [sources, setSources] = useState<LogSource[]>([]);
  const [servers, setServers] = useState<ServerSummary[]>([]);

  useEffect(() => {
    if (projectName) {
      apiFetch(`/api/projects/${projectName}/sources`)
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

      apiFetch(`/api/projects/${projectName}/servers`)
        .then(res => res.json())
        .then(data => {
          if (!data.error) setServers(data.servers ?? []);
        })
        .catch(() => {});
    }
  }, [projectName]);

  return (
    <ProjectContext.Provider value={{ projectName, project, sources, servers }}>
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
