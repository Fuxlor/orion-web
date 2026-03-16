"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";

export function useTags(projectName: string | null) {
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!projectName) return;
    let cancelled = false;
    setLoading(true);
    apiFetch(`/api/projects/${projectName}/tags`)
      .then((r) => r.json())
      .then((data: { tags?: string[] }) => {
        if (!cancelled) setTags(data.tags ?? []);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [projectName]);

  return { tags, loading };
}
