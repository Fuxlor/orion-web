"use client";

import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import { ProjectStats, StatsWindow } from "@/types";
import { useOrionWs } from "@/contexts/orionWsContext";

interface StatsUpdatePayload {
  projectName: string;
  sourceName?: string;
}

export function useDashboardStats(projectName: string | null, window: StatsWindow) {
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { subscribe } = useOrionWs();

  const fetchStats = useCallback(() => {
    if (!projectName) return;
    setLoading(true);
    apiFetch(`/api/projects/${projectName}/stats?window=${window}`)
      .then((r) => r.json())
      .then((data) => {
        setStats(data);
        setError(null);
      })
      .catch((err: Error) => {
        setError(process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [projectName, window]);

  useEffect(() => {
    if (!projectName) return;
    fetchStats();
    const id = setInterval(fetchStats, 30_000);
    return () => clearInterval(id);
  }, [projectName, window, fetchStats]);

  useEffect(() => {
    if (!projectName) return;
    return subscribe<StatsUpdatePayload>("stats_update", (envelope) => {
      if (envelope.projectName !== projectName) return;
      fetchStats();
    });
  }, [projectName, subscribe, fetchStats]);

  return { stats, loading, error };
}
