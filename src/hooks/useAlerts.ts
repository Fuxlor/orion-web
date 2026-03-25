"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { Alert, AlertRule } from "@/types";
import { useOrionWs } from "@/contexts/orionWsContext";

export interface AlertFilters {
  status?: string;
  level?: string;
  source?: string;
}

export function useAlerts(projectName: string, filters: AlertFilters = {}) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const { subscribe } = useOrionWs();

  const { status, level, source } = filters;

  useEffect(() => {
    if (!projectName) return;
    let cancelled = false;

    const fetchAlerts = () => {
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      if (level) params.set("level", level);
      if (source) params.set("source", source);
      const qs = params.toString();

      setLoading(true);
      apiFetch(`/api/projects/${projectName}/alerts${qs ? `?${qs}` : ""}`)
        .then((res) => res.json())
        .then((data) => {
          if (cancelled) return;
          if (Array.isArray(data)) {
            setAlerts(data);
            setError(null);
          } else {
            setError(data.error ?? "Failed to fetch alerts");
          }
        })
        .catch(() => { if (!cancelled) setError("Failed to fetch alerts"); })
        .finally(() => { if (!cancelled) setLoading(false); });
    };

    fetchAlerts();
    return () => { cancelled = true; };
  }, [projectName, tick, status, level, source]);

  useEffect(() => {
    if (!projectName) return;
    return subscribe<{
      id: number; rule_name: string | null; source_name: string | null;
      server_hostname: string | null; level: string; message: string | null;
      status: string; silenced_until: string | null; resolved_at: string | null;
      resolved_by_pseudo: string | null; created_at: string;
    }>("alert", (envelope) => {
      if (envelope.projectName !== projectName) return;
      if (status && status !== 'active') return;
      if (level && level !== envelope.payload.level) return;
      if (source && source !== envelope.payload.source_name) return;
      setAlerts((prev) => [envelope.payload as Alert, ...prev]);
    });
  }, [projectName, subscribe, status, level, source]);

  return { alerts, loading, error, refresh: () => setTick((t) => t + 1) };
}

export function useActiveAlertCount(projectName: string) {
  const [count, setCount] = useState(0);
  const { subscribe } = useOrionWs();
  const pathname = usePathname();

  useEffect(() => {
    if (!projectName) return;
    apiFetch(`/api/projects/${projectName}/alerts?status=active`)
      .then((res) => res.json())
      .then((data) => { if (Array.isArray(data)) setCount(data.length); })
      .catch(() => {});
  }, [projectName, pathname]);

  useEffect(() => {
    if (!projectName) return;
    return subscribe<{ level: string }>("alert", (envelope) => {
      if (envelope.projectName !== projectName) return;
      setCount((c) => c + 1);
    });
  }, [projectName, subscribe]);

  return count;
}

export function useAlertRules(projectName: string) {
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!projectName) return;
    let cancelled = false;

    const fetchRules = () => {
      setLoading(true);
      apiFetch(`/api/projects/${projectName}/alerts/rules`)
        .then((res) => res.json())
        .then((data) => {
          if (cancelled) return;
          if (Array.isArray(data)) {
            setRules(data);
            setError(null);
          } else {
            setError(data.error ?? "Failed to fetch rules");
          }
        })
        .catch(() => { if (!cancelled) setError("Failed to fetch rules"); })
        .finally(() => { if (!cancelled) setLoading(false); });
    };

    fetchRules();
    return () => { cancelled = true; };
  }, [projectName, tick]);

  return { rules, loading, error, refresh: () => setTick((t) => t + 1) };
}
