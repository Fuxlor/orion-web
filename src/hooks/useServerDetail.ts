"use client";

import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import { ServerDetail } from "@/types";

export function useServerDetail(projectName: string | null, serverName: string | null) {
  const [server, setServer] = useState<ServerDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
  }, [fetchServer]);

  return { server, loading, error, refetch: fetchServer };
}
