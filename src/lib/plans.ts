import { getApiUrl } from './api';

export interface PlanDisplay {
  price: string;
  logs: string;
  sources: string;
  retention: string;
  storage: string;
  alerts: string | false;
  support: string;
}

export interface PlanLimits {
  maxProjects: number;
  maxSourcesPerProject: number;
  maxLogsPerMonth: number;
  alertsEnabled: boolean;
  retentionDays: number;
}

export interface PlansConfig {
  limits: Record<string, PlanLimits>;
  display: Record<string, PlanDisplay>;
}

export async function fetchPlans(): Promise<PlansConfig> {
  const res = await fetch(`${getApiUrl()}/api/billing/plans`);
  const data = await res.json();
  return data.plans as PlansConfig;
}
