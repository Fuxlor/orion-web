"use client";

import { useState, useEffect, use } from "react";
import { notFound } from "next/navigation";
import { useProject } from "@/contexts/projectContext";
import { useProjects } from "@/contexts/projectsContext";
import { apiFetch } from "@/lib/api";
import { ProjectSettings } from "@/types";
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
  const { project } = useProject();
  const { loading: projectsLoading } = useProjects();

  const [settings, setSettings] = useState<ProjectSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");

  useEffect(() => {
    const hash = window.location.hash.replace("#", "") as SettingsTab;
    if (ALL_TABS.find((t) => t.id === hash)) setActiveTab(hash);
  }, []);

  useEffect(() => {
    apiFetch(`/api/projects/${projectName}/settings`)
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) {
          setSettings(d as ProjectSettings & { ok: boolean });
        } else {
          setFetchError(d.error ?? "Failed to load settings");
        }
      })
      .catch(() => setFetchError("Failed to load settings"))
      .finally(() => setLoading(false));
  }, [projectName]);

  // Sync active tab to first accessible tab once permissions are loaded
  useEffect(() => {
    if (!settings) return;
    const accessible = getAccessibleTabs(settings);
    if (!accessible.find((t) => t.id === activeTab)) {
      setActiveTab(accessible[0]?.id ?? "general");
    }
  }, [settings]);

  if (projectsLoading || loading) {
    return <div className="text-sm text-[var(--text-muted)]">Loading…</div>;
  }

  if (projectName && !project && !loading) notFound();

  if (fetchError) {
    return (
      <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] p-8 text-center space-y-2">
        <p className="text-sm font-medium text-[var(--text-secondary)]">Cannot access settings</p>
        <p className="text-xs text-[var(--text-muted)]">{fetchError}</p>
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
        <h1 className="text-xl font-semibold text-white">Settings</h1>
        <p className="mt-0.5 text-sm text-[var(--text-muted)]">{settings.label}</p>
      </div>

      {/* Tab nav */}
      <div className="border-b border-[var(--border)]">
        <div className="flex gap-1 flex-wrap">
          {accessibleTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={`border-b-2 px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? "border-[var(--primary)] text-[var(--primary)]"
                  : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              } ${tab.id === "danger" ? "ml-auto text-red-400 hover:text-red-300 data-[active=true]:border-red-400" : ""}`}
              data-active={activeTab === tab.id}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="max-w-2xl">
        {activeTab === "general" && (
          <GeneralTab
            projectName={projectName}
            settings={settings}
            can={can}
            onUpdate={(label) => setSettings((s) => s ? { ...s, label } : s)}
          />
        )}
        {activeTab === "log-levels" && (
          <LogLevelsTab
            projectName={projectName}
            settings={settings}
            can={can}
            onUpdate={(levels) => setSettings((s) => s ? { ...s, enabled_levels: levels } : s)}
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
        {activeTab === "api-tokens" && (
          <ApiTokensTab projectName={projectName} can={can} />
        )}
        {activeTab === "audit" && isOwner && (
          <AuditTab projectName={projectName} />
        )}
        {activeTab === "danger" && isOwner && (
          <DangerZoneTab projectName={projectName} settings={settings} />
        )}
      </div>
    </div>
  );
}
