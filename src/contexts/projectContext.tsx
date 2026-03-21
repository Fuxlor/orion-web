"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { LogSource, Project, ProjectSettings, ServerSummary } from "@/types";
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
  settings: ProjectSettings | null;
  settingsLoading: boolean;
  settingsError: string | null;
  updateSettings: (partial: Partial<ProjectSettings>) => void;
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
  const [settings, setSettings] = useState<ProjectSettings | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  const updateSettings = useCallback((partial: Partial<ProjectSettings>) => {
    setSettings((s) => s ? { ...s, ...partial } : s);
  }, []);

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
        .catch(() => {
          setError(process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : 'An error occurred');
        });

      apiFetch(`/api/projects/${projectName}/servers`)
        .then(res => res.json())
        .then(data => {
          if (!data.error) setServers(data.servers ?? []);
        })
        .catch(() => {});

      setSettingsLoading(true);
      setSettingsError(null);
      apiFetch(`/api/projects/${projectName}/settings`)
        .then(res => res.json())
        .then(data => {
          if (data.ok) {
            setSettings(data as ProjectSettings);
          } else {
            setSettingsError(data.message ?? "Failed to load settings");
          }
        })
        .catch(() => setSettingsError("Failed to load settings"))
        .finally(() => setSettingsLoading(false));
    }
  }, [projectName]);

  return (
    <ProjectContext.Provider value={{ projectName, project, sources, servers, settings, settingsLoading, settingsError, updateSettings }}>
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
