"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { Project } from "@/types";
import { fetchProjects } from "@/lib/projects";

interface ProjectsContextValue {
  projects: Project[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const ProjectsContext = createContext<ProjectsContextValue | null>(null);

export function ProjectsProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    fetchProjects()
      .then(setProjects)
      .catch((err) => {
        setError(err?.message ?? "Failed to load projects");
        setProjects([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <ProjectsContext.Provider value={{ projects, loading, error, refetch: load }}>
      {children}
    </ProjectsContext.Provider>
  );
}

export function useProjects() {
  const ctx = useContext(ProjectsContext);
  if (!ctx) {
    throw new Error("useProjects must be used within ProjectsProvider");
  }
  return ctx;
}
