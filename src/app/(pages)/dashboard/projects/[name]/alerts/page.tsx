"use client";

import { useState } from "react";
import { notFound } from "next/navigation";
import { useProject } from "@/contexts/projectContext";
import { useProjects } from "@/contexts/projectsContext";
import { useAlerts, useAlertRules } from "@/hooks/useAlerts";
import AlertsTab from "@/components/dashboard/alerts/AlertsTab";
import RulesTab from "@/components/dashboard/alerts/RulesTab";

type Tab = "alerts" | "rules";

export default function ProjectAlertsPage() {
  const { project, projectName, sources } = useProject();
  const { loading: projectsLoading } = useProjects();
  const [activeTab, setActiveTab] = useState<Tab>("alerts");

  const { alerts, loading: alertsLoading, refresh: refreshAlerts } = useAlerts(projectName ?? "");
  const { rules, loading: rulesLoading, refresh: refreshRules } = useAlertRules(projectName ?? "");

  if (projectsLoading) return <div className="text-[var(--text-muted)]">Loading…</div>;
  if (projectName && !project) notFound();

  const activeCount = alerts.filter((a) => a.status === "active").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Alerts</h1>
          {activeCount > 0 && (
            <p className="mt-0.5 text-sm text-red-400">
              {activeCount} active alert{activeCount > 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[var(--border)]">
        <div className="flex gap-1">
          {([
            { key: "alerts" as Tab, label: "Alerts", count: alerts.length },
            { key: "rules" as Tab, label: "Rules", count: rules.length },
          ]).map(({ key, label, count }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={`flex cursor-pointer items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === key
                  ? "border-[var(--primary)] text-[var(--primary)]"
                  : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              }`}
            >
              {label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-xs ${
                  activeTab === key
                    ? "bg-[var(--primary-muted)] text-[var(--primary)]"
                    : "bg-[var(--surface-input)] text-[var(--text-muted)]"
                }`}
              >
                {count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {activeTab === "alerts" ? (
        <AlertsTab
          projectName={projectName ?? ""}
          alerts={alerts}
          loading={alertsLoading}
          onRefresh={refreshAlerts}
        />
      ) : (
        <RulesTab
          projectName={projectName ?? ""}
          rules={rules}
          sources={sources}
          loading={rulesLoading}
          onRefresh={refreshRules}
        />
      )}
    </div>
  );
}
