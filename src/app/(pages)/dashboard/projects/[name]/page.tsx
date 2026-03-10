"use client";

import { useState } from "react";
import { notFound } from "next/navigation";
import { useProject } from "@/contexts/projectContext";
import { useProjects } from "@/contexts/projectsContext";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useHeartbeats } from "@/hooks/useHeartbeats";
import { useQuickShortcuts } from "@/hooks/useQuickShortcuts";
import { StatsWindow } from "@/types";
import TimeWindowSelector from "@/components/dashboard/TimeWindowSelector";
import UptimeBlock from "@/components/dashboard/UptimeBlock";
import AlertsSection from "@/components/dashboard/AlertsSection";
import SourcesGrid from "@/components/dashboard/SourcesGrid";
import LogCounters from "@/components/dashboard/LogCounters";
import ActivityChart from "@/components/dashboard/ActivityChart";
import QuickShortcuts from "@/components/dashboard/QuickShortcuts";

export default function ProjectDashboardPage() {
  const { project, projectName } = useProject();
  const { loading } = useProjects();
  const [statsWindow, setStatsWindow] = useState<StatsWindow>("24h");

  const { stats } = useDashboardStats(projectName, statsWindow);
  const { heartbeats } = useHeartbeats(projectName);
  const shortcuts = useQuickShortcuts();

  if (loading) return <div className="text-[var(--text-muted)]">Loading…</div>;
  if (projectName && !project) notFound();

  return (
    <div className="space-y-6">
      {/* Header + window selector */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-white">
          {project?.label ?? projectName}
        </h1>
        <TimeWindowSelector value={statsWindow} onChange={setStatsWindow} />
      </div>

      {/* Uptime + Alerts */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <UptimeBlock uptimePercent={stats?.uptime_percent ?? null} />
        <AlertsSection />
      </div>

      {/* Log counters + sparklines */}
      {stats && (
        <LogCounters
          logCounts={stats.log_counts}
          chartData={stats.chart_data}
        />
      )}

      {/* Activity chart */}
      {stats && (
        <ActivityChart chartData={stats.chart_data} window={statsWindow} />
      )}

      {/* Sources grid */}
      <SourcesGrid heartbeats={heartbeats} />

      {/* Quick shortcuts */}
      <QuickShortcuts {...shortcuts} />
    </div>
  );
}
