"use client";

import { useState, useEffect, use } from "react";
import { notFound } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { AlertTriangle } from "lucide-react";
import { useProject } from "@/contexts/projectContext";
import { useProjects } from "@/contexts/projectsContext";
import { apiFetch } from "@/lib/api";
import { ProjectSettings, User } from "@/types";
import GeneralTab from "@/components/project-settings/GeneralTab";
import LogLevelsTab from "@/components/project-settings/LogLevelsTab";
import SourcesTab from "@/components/project-settings/SourcesTab";
import MembersTab from "@/components/project-settings/MembersTab";
import ApiTokensTab from "@/components/project-settings/ApiTokensTab";
import DangerZoneTab from "@/components/project-settings/DangerZoneTab";
import RetentionTab from "@/components/project-settings/RetentionTab";
import AuditTab from "@/components/project-settings/AuditTab";

type SettingsTab = "general" | "log-levels" | "retention" | "sources" | "members" | "api-tokens" | "audit" | "danger";

const ALL_TABS: { id: SettingsTab; label: string }[] = [
  { id: "general", label: "General" },
  { id: "log-levels", label: "Log Levels" },
  { id: "retention", label: "Retention" },
  { id: "sources", label: "Sources" },
  { id: "members", label: "Members" },
  { id: "api-tokens", label: "API Tokens" },
  { id: "audit", label: "Audit" },
  { id: "danger", label: "Danger Zone" },
];

// Permission required to VIEW each tab
const TAB_VIEW_PERMS: Record<SettingsTab, string | null> = {
  general: "settings:read",
  "log-levels": "settings:read",
  retention: "settings:read",
  sources: "sources:read",
  members: "members:read",
  "api-tokens": "tokens:read",
  audit: null, // owner-only checked separately
  danger: null, // owner-only checked separately
};

export default function ProjectSettingsPage({ params }: { params: Promise<{ name: string }> }) {
  const { name: projectName } = use(params);
  const { project, settings, settingsLoading, settingsError, updateSettings } = useProject();
  const { loading: projectsLoading } = useProjects();

  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");

  useEffect(() => {
    const hash = window.location.hash.replace("#", "") as SettingsTab;
    if (ALL_TABS.find((t) => t.id === hash)) setActiveTab(hash);
  }, []);

  useEffect(() => {
    apiFetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data && !data.error) setUser(data);
      })
      .catch(() => {});
  }, []);

  // Sync active tab to first accessible tab once permissions are loaded
  useEffect(() => {
    if (!settings) return;
    const accessible = getAccessibleTabs(settings);
    if (!accessible.find((t) => t.id === activeTab)) {
      setActiveTab(accessible[0]?.id ?? "general");
    }
  }, [settings]);

  if (projectsLoading || settingsLoading) {
    return <div className="text-sm text-[var(--text-muted)]">Loading…</div>;
  }

  if (projectName && !project && !settingsLoading) notFound();

  if (settingsError) {
    return (
      <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-8 text-center space-y-2">
        <p className="text-sm font-medium text-[var(--text-secondary)]">Cannot access settings</p>
        <p className="text-xs text-[var(--text-muted)]">{settingsError}</p>
      </div>
    );
  }

  if (!settings) return null;

  const can = (perm: string) => settings.effective_permissions.includes(perm);
  const isOwner = settings.role === "owner";

  function getAccessibleTabs(s: ProjectSettings) {
    return ALL_TABS.filter((tab) => {
      if (tab.id === "danger" || tab.id === "audit") return s.role === "owner";
      const req = TAB_VIEW_PERMS[tab.id];
      if (!req) return true;
      return s.effective_permissions.includes(req) || s.role === "owner";
    });
  }

  const accessibleTabs = getAccessibleTabs(settings);

  function handleTabChange(tab: SettingsTab) {
    setActiveTab(tab);
    window.history.replaceState(null, "", `#${tab}`);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "white", letterSpacing: "-0.03em" }}>Settings</h1>
        <p className="mt-0.5 text-sm text-[var(--text-muted)]">{settings.label}</p>
      </div>

      {/* Tab nav */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div className="flex gap-0 flex-wrap">
          {accessibleTabs.filter(t => t.id !== "danger").map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <motion.button
                key={tab.id}
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={() => handleTabChange(tab.id)}
                style={{
                  padding: "10px 16px",
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? "#02f194" : "#6b7280",
                  backgroundColor: "transparent",
                  border: "none",
                  borderBottom: `2px solid ${isActive ? "#02f194" : "transparent"}`,
                  marginBottom: -1,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "color 0.15s",
                }}
              >
                {tab.label}
              </motion.button>
            );
          })}
        </div>
        {accessibleTabs.some(t => t.id === "danger") && (
          <motion.button
            type="button"
            whileHover={{ scale: 1.03, borderColor: "rgba(239,68,68,0.4)", backgroundColor: "rgba(239,68,68,0.08)", color: "#ef4444" }}
            whileTap={{ scale: 0.96 }}
            onClick={() => handleTabChange("danger")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 14px",
              borderRadius: 7,
              border: `1px solid ${activeTab === "danger" ? "rgba(239,68,68,0.4)" : "rgba(255,255,255,0.08)"}`,
              backgroundColor: activeTab === "danger" ? "rgba(239,68,68,0.08)" : "transparent",
              color: activeTab === "danger" ? "#ef4444" : "#6b7280",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all 0.2s",
            }}
          >
            <AlertTriangle size={13} /> Danger Zone
          </motion.button>
        )}
      </div>

      {/* Tab content */}
      <div className="max-w-[760px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            {activeTab === "general" && (
              <GeneralTab
                projectName={projectName}
                settings={settings}
                can={can}
                onUpdate={(label) => updateSettings({ label })}
              />
            )}
            {activeTab === "log-levels" && (
              <LogLevelsTab
                projectName={projectName}
                settings={settings}
                can={can}
                onUpdate={(levels) => updateSettings({ enabled_levels: levels })}
              />
            )}
            {activeTab === "retention" && (
              <RetentionTab projectName={projectName} can={can} />
            )}
            {activeTab === "sources" && (
              <SourcesTab projectName={projectName} can={can} />
            )}
            {activeTab === "members" && (
              <MembersTab
                projectName={projectName}
                can={can}
              />
            )}
            {activeTab === "api-tokens" && user && (
              <ApiTokensTab projectName={projectName} can={can} user={user} />
            )}
            {activeTab === "audit" && isOwner && (
              <AuditTab projectName={projectName} />
            )}
            {activeTab === "danger" && isOwner && user && (
              <DangerZoneTab projectName={projectName} settings={settings} user={user} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
