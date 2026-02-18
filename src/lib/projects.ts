import { Project, LogSource } from "@/types";

// Placeholder – replace with API fetch when available
export const MOCK_PROJECTS: Project[] = [
  { id: "1", name: "api-gateway", label: "API Gateway" },
  { id: "2", name: "web-app", label: "Web App" },
  { id: "3", name: "mobile-backend", label: "Mobile Backend" },
];

export function getProjectFromPathname(pathname: string): string | null {
  const match = pathname.match(/^\/dashboard\/projects\/([^/]+)/);
  return match ? match[1] : null;
}

export function getProjectByName(name: string): Project | undefined {
  return MOCK_PROJECTS.find((p) => p.name === name);
}

// Placeholder – log sources per project; replace with API fetch when available
export const MOCK_LOG_SOURCES: LogSource[] = [
  { id: "1", name: "production", label: "Production" },
  { id: "2", name: "staging", label: "Staging" },
  { id: "3", name: "development", label: "Development" },
];
