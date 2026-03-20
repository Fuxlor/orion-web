"use client";

import { useState, useEffect, useRef } from "react";
import { apiFetch } from "@/lib/api";
import { LogEntry } from "@/types";

export interface LogSearchFilters {
  search?: string;
  levels?: string[];
  sources?: string[];
  servers?: string[];
  from?: string;
  to?: string;
  tags?: string[];
  limit?: number;
}

function buildQueryString(filters: LogSearchFilters): string {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.levels?.length) params.set("level", filters.levels.join(","));
  if (filters.sources?.length) params.set("source", filters.sources.join(","));
  if (filters.servers?.length) params.set("server", filters.servers.join(","));
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  if (filters.tags?.length) params.set("tags", filters.tags.join(","));
  if (filters.limit) params.set("limit", String(filters.limit));
  return params.toString();
}

export function useLogSearch(projectName: string | null, filters: LogSearchFilters, enabled: boolean) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!projectName || !enabled) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      let cancelled = false;
      setLoading(true);
      const qs = buildQueryString(filters);
      apiFetch(`/api/projects/${projectName}/logs${qs ? `?${qs}` : ""}`)
        .then((r) => r.json())
        .then((data: unknown) => {
          if (!cancelled) {
            if (!Array.isArray(data)) {
              setError((data as { error?: string }).error ?? 'Unexpected server response');
              setLogs([]);
              return;
            }
            const mapped: LogEntry[] = (data as Array<Record<string, unknown>>).map((r) => ({
              id: r.id as string,
              timestamp: new Date(r.timestamp as string),
              message: r.message as string,
              level: r.level as string,
              source: r.source as string,
              server: r.server as string | null,
              project: projectName,
              metadata: r.metadata as Record<string, unknown> | null,
              tags: r.tags as string[],
            }));
            setLogs(mapped);
            setError(null);
          }
        })
        .catch((err: Error) => {
          if (!cancelled) setError(process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });

      return () => { cancelled = true; };
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectName, enabled, JSON.stringify(filters)]);

  return { logs, loading, error };
}
