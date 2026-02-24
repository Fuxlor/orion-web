import { Project, LogSource } from "@/types";
import { apiFetch } from "./api";

export function getProjectFromPathname(pathname: string): string | null {
  const match = pathname.match(/^\/dashboard\/projects\/([^/]+)/);
  return match ? match[1] : null;
}

function normalizeProject(p: { id: string | number; name: string; label: string }): Project {
  return { id: String(p.id), name: p.name, label: p.label };
}

function normalizeLogSource(s: { id: string | number; name: string; label: string }): LogSource {
  return { id: String(s.id), name: s.name, label: s.label };
}

export async function fetchProjects(): Promise<Project[]> {
  const res = await apiFetch("/api/projects");
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data.map(normalizeProject) : [];
}

export async function fetchProjectByName(name: string): Promise<Project | null> {
  const res = await apiFetch(`/api/projects/${encodeURIComponent(name)}`);
  if (!res.ok) return null;
  const data = await res.json();
  return data ? normalizeProject(data) : null;
}

export async function fetchLogSources(projectName: string): Promise<LogSource[]> {
  const res = await apiFetch(
    `/api/projects/${encodeURIComponent(projectName)}/log-sources`
  );
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data.map(normalizeLogSource) : [];
}
