import { Project } from "@/types";
import { apiFetch } from "@/lib/api";

export function getProjectFromPathname(pathname: string): string | null {
  const match = pathname.match(/^\/dashboard\/projects\/([^/]+)/);
  return match ? match[1] : null;
}

function normalizeProject(p: { id: string | number; name: string; label: string }): Project {
  return { id: String(p.id), name: p.name, label: p.label };
}

export async function fetchProjects(): Promise<Project[]> {
  const res = await apiFetch("/api/projects", {
    method: "GET",
  });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data.map(normalizeProject) : [];
}

export async function fetchProjectByName(name: string): Promise<Project | null> {
  const res = await apiFetch(`/api/projects/${encodeURIComponent(name)}`, {
    method: "GET",
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data ? normalizeProject(data) : null;
}