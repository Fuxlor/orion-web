"use client";

import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import type { RetentionData, RetentionSetting } from "@/types";

export function useRetentionSettings(projectName: string | null) {
  const [data, setData] = useState<RetentionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(() => {
    if (!projectName) return;
    let cancelled = false;
    setLoading(true);
    apiFetch(`/api/projects/${projectName}/settings/retention`)
      .then((r) => r.json())
      .then((d: RetentionData & { ok: boolean }) => {
        if (!cancelled) {
          setData({ settings: d.settings, max_retention_days: d.max_retention_days, plan: d.plan });
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
  }, [projectName]);

  useEffect(() => {
    return fetch();
  }, [fetch]);

  const update = useCallback(async (settings: RetentionSetting[]) => {
    if (!projectName) return;
    setSaving(true);
    setError(null);
    try {
      const res = await apiFetch(`/api/projects/${projectName}/settings/retention`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });
      if (!res.ok) {
        const d = await res.json() as { error?: string };
        throw new Error(d.error ?? "Failed to save retention settings");
      }
      await fetch();
    } catch (err) {
      setError(process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : (err as Error).message);
      throw err;
    } finally {
      setSaving(false);
    }
  }, [projectName, fetch]);

  return { data, loading, saving, error, update };
}
