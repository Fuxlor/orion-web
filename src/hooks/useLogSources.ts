"use client";

import { useState, useEffect } from "react";
import { LogSource } from "@/types";
import { fetchLogSources } from "@/lib/projects";

export function useLogSources(projectName: string | null): {
  logSources: LogSource[];
  loading: boolean;
} {
  const [logSources, setLogSources] = useState<LogSource[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!projectName) {
      setLogSources([]);
      return;
    }
    setLoading(true);
    fetchLogSources(projectName)
      .then(setLogSources)
      .catch(() => setLogSources([]))
      .finally(() => setLoading(false));
  }, [projectName]);

  return { logSources, loading };
}
