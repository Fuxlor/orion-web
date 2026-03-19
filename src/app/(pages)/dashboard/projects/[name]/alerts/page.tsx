"use client";

import { useState } from "react";
import { notFound } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
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
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex gap-0">
          {([
            { key: "alerts" as Tab, label: "Alerts", count: alerts.length },
            { key: "rules" as Tab, label: "Rules", count: rules.length },
          ]).map(({ key, label, count }) => (
            <motion.button
              key={key}
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveTab(key)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "10px 16px",
                fontSize: 13,
                fontWeight: activeTab === key ? 600 : 500,
                color: activeTab === key ? "#02f194" : "#6b7280",
                backgroundColor: "transparent",
                border: "none",
                borderBottom: `2px solid ${activeTab === key ? "#02f194" : "transparent"}`,
                marginBottom: -1,
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "color 0.15s",
              }}
            >
              {label}
              <span
                style={{
                  borderRadius: 9999,
                  padding: "1px 7px",
                  fontSize: 11,
                  backgroundColor: activeTab === key ? "rgba(2,241,148,0.12)" : "rgba(255,255,255,0.05)",
                  color: activeTab === key ? "#02f194" : "#6b7280",
                }}
              >
                {count}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
        >
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
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
