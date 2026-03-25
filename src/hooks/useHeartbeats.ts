"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { HeartbeatStatus } from "@/types";
import { useOrionWs } from "@/contexts/orionWsContext";

interface HeartbeatPayload {
  source: string;
  status: string | null;
  last_ping_at: string | null;
  projectName: string;
}

export function useHeartbeats(projectName: string | null) {
  const [heartbeats, setHeartbeats] = useState<HeartbeatStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { subscribe } = useOrionWs();

  useEffect(() => {
    if (!projectName) return;
    let cancelled = false;

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

    return () => {
      cancelled = true;
    };
  }, [projectName]);

  useEffect(() => {
    if (!projectName) return;
    return subscribe<HeartbeatPayload>("heartbeat", (envelope) => {
      if (envelope.projectName !== projectName) return;
      const status = envelope.payload.status === 'running' ? 'started' : envelope.payload.status as HeartbeatStatus["status"];
      setHeartbeats((prev) => {
        const exists = prev.some((h) => h.source === envelope.payload.source);
        if (exists) {
          return prev.map((h) =>
            h.source === envelope.payload.source
              ? { ...h, status, last_ping_at: envelope.payload.last_ping_at }
              : h
          );
        }
        return [...prev, { source: envelope.payload.source, status, last_ping_at: envelope.payload.last_ping_at, interval_seconds: 0 }];
      });
    });
  }, [projectName, subscribe]);

  return { heartbeats, loading, error };
}
