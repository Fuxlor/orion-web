"use client";

import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import { ServerDetail } from "@/types";
import { useOrionWs } from "@/contexts/orionWsContext";

interface ServerStatusPayload {
  serverId: number;
  hostname: string;
  status: string;
  sources: { name: string; environment: string; status: string | null; last_ping_at: string | null }[];
  projectName: string;
}

export function useServerDetail(projectName: string | null, serverName: string | null) {
  const [server, setServer] = useState<ServerDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { subscribe } = useOrionWs();

  const fetchServer = useCallback(() => {
    if (!projectName || !serverName) return;
    setLoading(true);
    apiFetch(`/api/projects/${projectName}/servers/${encodeURIComponent(serverName)}`)
      .then((r) => r.json())
      .then((data) => {
        setServer(data.server ?? null);
        setError(null);
      })
      .catch((err: Error) => {
        setError(process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [projectName, serverName]);

  useEffect(() => {
    fetchServer();
    const id = setInterval(fetchServer, 15_000);
    return () => clearInterval(id);
  }, [fetchServer]);

  useEffect(() => {
    if (!projectName || !serverName) return;
    return subscribe<ServerStatusPayload>("server_status", (envelope) => {
      if (envelope.projectName !== projectName || envelope.payload.hostname !== serverName) return;
      setServer((prev) => prev ? {
        ...prev,
        status: envelope.payload.status as ServerDetail["status"],
        last_seen_at: envelope.timestamp,
        sources: envelope.payload.sources.map((s) => ({
          ...s,
          status: s.status as "UP" | "DOWN" | null,
        })),
      } : prev);
    });
  }, [projectName, serverName, subscribe, fetchServer]);

  return { server, loading, error, refetch: fetchServer };
}
