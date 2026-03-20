"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { ProjectStats, StatsWindow } from "@/types";

export function useDashboardStats(projectName: string | null, window: StatsWindow) {
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectName) return;
    let cancelled = false;

    const fetchStats = () => {
      setLoading(true);
      apiFetch(`/api/projects/${projectName}/stats?window=${window}`)
        .then((r) => r.json())
        .then((data) => {
          if (!cancelled) {
            setStats(data);
            setError(null);
          }
        })
        .catch((err: Error) => {
          if (!cancelled) setError(process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    };

    fetchStats();
    const id = setInterval(fetchStats, 30_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [projectName, window]);

  return { stats, loading, error };
}
