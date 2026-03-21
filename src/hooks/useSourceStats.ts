"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { SourceStats, StatsWindow } from "@/types";

export function useSourceStats(projectName: string | null, sourceName: string | null, window: StatsWindow) {
  const [stats, setStats] = useState<SourceStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectName || !sourceName) return;
    let cancelled = false;

    const fetchStats = () => {
      setLoading(true);
      apiFetch(`/api/projects/${projectName}/sources/${encodeURIComponent(sourceName)}/stats?window=${window}`)
        .then((r) => r.json())
        .then((data) => {
          if (!cancelled) {
            console.log(data)
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
    return () => {
      cancelled = true;
    };
  }, [projectName, sourceName, window]);

  return { stats, loading, error };
}
