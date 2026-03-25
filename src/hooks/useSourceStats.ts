"use client";

import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import { SourceStats, SourceStatus, StatsWindow } from "@/types";
import { useOrionWs } from "@/contexts/orionWsContext";

interface StatsUpdatePayload {
  projectName: string;
  sourceName?: string;
}

export function useSourceStats(projectName: string | null, sourceName: string | null, window: StatsWindow) {
  const [stats, setStats] = useState<SourceStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { subscribe } = useOrionWs();

  const fetchStats = useCallback(() => {
    if (!projectName || !sourceName) return;
    setLoading(true);
    apiFetch(`/api/projects/${projectName}/sources/${encodeURIComponent(sourceName)}/stats?window=${window}`)
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
  }, [projectName, sourceName, window]);

  useEffect(() => {
    if (!projectName || !sourceName) return;
    fetchStats();
    const id = setInterval(fetchStats, 15_000);
    return () => clearInterval(id);
  }, [projectName, sourceName, window, fetchStats]);

  useEffect(() => {
    if (!projectName || !sourceName) return;
    return subscribe<StatsUpdatePayload>("stats_update", (envelope) => {
      if (envelope.projectName !== projectName) return;
      if (envelope.payload.sourceName && envelope.payload.sourceName !== sourceName) return;
      fetchStats();
    });
  }, [projectName, sourceName, subscribe, fetchStats]);

  useEffect(() => {
    if (!projectName || !sourceName) return;
    return subscribe<{ source: string; cpu: number; memory_used: number; memory_total: number; uptime_seconds: number }>("performance", (envelope) => {
      if (envelope.projectName !== projectName || envelope.payload.source !== sourceName) return;
      setStats((prev) => prev ? {
        ...prev,
        performance: {
          avg_cpu: envelope.payload.cpu,
          avg_memory_used: envelope.payload.memory_used,
          avg_memory_total: envelope.payload.memory_total,
          last_uptime_seconds: envelope.payload.uptime_seconds,
        },
      } : prev);
    });
  }, [projectName, sourceName, subscribe]);

  useEffect(() => {
    if (!projectName || !sourceName) return;
    return subscribe<{ source: string; status: string | null; last_ping_at: string | null }>("heartbeat", (envelope) => {
      if (envelope.projectName !== projectName || envelope.payload.source !== sourceName) return;
      if (envelope.payload.status === 'running') envelope.payload.status = 'started';
      setStats((prev) => prev ? {
        ...prev,
        status: envelope.payload.status as SourceStatus,
        last_seen_at: envelope.payload.last_ping_at,
      } : prev);
    });
  }, [projectName, sourceName, subscribe]);

  return { stats, loading, error };
}
