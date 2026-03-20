"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { HeartbeatStatus } from "@/types";

export function useHeartbeats(projectName: string | null) {
  const [heartbeats, setHeartbeats] = useState<HeartbeatStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectName) return;
    let cancelled = false;

    const fetchHeartbeats = () => {
      setLoading(true);
      apiFetch(`/api/projects/${projectName}/heartbeats`)
        .then((r) => r.json())
        .then((data) => {
          if (!cancelled) {
            setHeartbeats(data.heartbeats ?? []);
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

    fetchHeartbeats();
    const id = setInterval(fetchHeartbeats, 30_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [projectName]);

  return { heartbeats, loading, error };
}
