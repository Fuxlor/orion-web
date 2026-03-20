"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { ServerSummary } from "@/types";

export function useServers(projectName: string | null) {
  const [servers, setServers] = useState<ServerSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectName) return;
    let cancelled = false;

    const fetchServers = () => {
      setLoading(true);
      apiFetch(`/api/projects/${projectName}/servers`)
        .then((r) => r.json())
        .then((data) => {
          if (!cancelled) {
            setServers(data.servers ?? []);
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

    fetchServers();
    const id = setInterval(fetchServers, 30_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [projectName]);

  return { servers, loading, error };
}
