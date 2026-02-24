"use client";

import { createContext, useContext } from "react";
import { usePathname } from "next/navigation";
import { Project } from "@/types";
import { getProjectFromPathname } from "@/lib/projects";
import { useProjects } from "./projectsContext";

interface ProjectContextValue {
  /** Current project when viewing a project-scoped route, null on Overview */
  project: Project | null;
  /** URL slug (project name) when in project context */
  projectSlug: string | null;
}

const ProjectContext = createContext<ProjectContextValue | null>(null);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const projectSlug = getProjectFromPathname(pathname);
  const { projects } = useProjects();
  const project = projectSlug
    ? projects.find((p) => p.name === projectSlug) ?? null
    : null;

  return (
    <ProjectContext.Provider value={{ project, projectSlug }}>
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
