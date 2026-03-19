"use client";

import { notFound } from "next/navigation";
import { useParams } from "next/navigation";
import { useProject } from "@/contexts/projectContext";
import { useProjects } from "@/contexts/projectsContext";
import { useSourceStats } from "@/hooks/useSourceStats";
import { useLogFilters } from "@/hooks/useLogFilters";
import { useLogSearch } from "@/hooks/useLogSearch";
import { useTags } from "@/hooks/useTags";
import { useServers } from "@/hooks/useServers";
import ActivityChart from "@/components/dashboard/ActivityChart";
import LogSearchBar from "@/components/dashboard/logs/LogSearchBar";
import LogFilters from "@/components/dashboard/logs/LogFilters";
import LogViewer from "@/components/dashboard/logs/LogViewer";
import LogLoadMore from "@/components/dashboard/logs/LogLoadMore";
import LogExportButton from "@/components/dashboard/logs/LogExportButton";

export default function SourceLogsPage() {
  const params = useParams<{ name: string; sourceName: string }>();
  const { project, projectName } = useProject();
  const { loading } = useProjects();
  const { stats } = useSourceStats(params.name, params.sourceName, '24h');

  const filterState = useLogFilters([params.sourceName]);
  const {
    search, setSearch,
    levels, setLevels,
    servers: selectedServers, setServers,
    from, setFrom,
    to, setTo,
    tags: selectedTags, setTags,
    limit, setLimit,
    filters,
  } = filterState;

  // isFiltered for source page is always true since source is pre-set — always query mode
  const { logs, loading: logsLoading, error: searchError } = useLogSearch(projectName, filters, true);
  const { tags: availableTags } = useTags(projectName);
  const { servers: serverList } = useServers(projectName);

  const serverNames = serverList.map(s => s.hostname);

  if (loading) return <div className="text-[var(--text-muted)]">Loading…</div>;
  if (projectName && !project) notFound();

  const uptimeDisplay = stats?.uptime_percent != null ? `${stats.uptime_percent}%` : "—";

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <h1 className="text-xl font-semibold text-white">
          Logs — {project?.label} / {params.sourceName}
        </h1>
        <LogExportButton
          projectName={projectName ?? ""}
          filters={filters}
          currentCount={logs.length}
        />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
        <div className="p-3 rounded-lg border border-[var(--border)] bg-[var(--card)]">
          <p className="text-xs text-[var(--text-muted)]">Total (24h)</p>
          <p className="text-lg font-semibold text-[var(--primary)]">
            {stats?.log_counts.total ?? logs.length ?? "—"}
          </p>
        </div>
        <div className="p-3 rounded-lg border border-[var(--border)] bg-[var(--card)]">
          <p className="text-xs text-[var(--text-muted)]">Errors (24h)</p>
          <p className="text-lg font-semibold text-[var(--primary)]">
            {stats?.log_counts.error ?? "—"}
          </p>
        </div>
        <div className="p-3 rounded-lg border border-[var(--border)] bg-[var(--card)]">
          <p className="text-xs text-[var(--text-muted)]">Warnings (24h)</p>
          <p className="text-lg font-semibold text-[var(--primary)]">
            {stats?.log_counts.warn ?? "—"}
          </p>
        </div>
        <div className="p-3 rounded-lg border border-[var(--border)] bg-[var(--card)]">
          <p className="text-xs text-[var(--text-muted)]">Uptime (24h)</p>
          <p className="text-lg font-semibold text-[var(--primary)]">{uptimeDisplay}</p>
        </div>
      </div>

      {/* Activity chart */}
      {stats?.chart_data && stats.chart_data.length > 0 && (
        <div className="shrink-0 overflow-hidden">
          <ActivityChart chartData={stats.chart_data} window="24h" />
        </div>
      )}

      {/* Search */}
      <div className="shrink-0">
        <LogSearchBar value={search} onChange={setSearch} />
      </div>

      {/* Filters — source hidden since it's pre-selected */}
      <div className="shrink-0">
        <LogFilters
          availableSources={[]}
          availableServers={serverNames}
          availableTags={availableTags}
          levels={levels}
          sources={[params.sourceName]}
          servers={selectedServers}
          from={from}
          to={to}
          tags={selectedTags}
          isFiltered={
            levels.length > 0 || selectedServers.length > 0 || !!from || !!to || selectedTags.length > 0 || !!search
          }
          hideSources
          onLevelsChange={setLevels}
          onSourcesChange={() => { }}
          onServersChange={setServers}
          onFromChange={setFrom}
          onToChange={setTo}
          onTagsChange={setTags}
          onClear={() => {
            setSearch("");
            setLevels([]);
            setServers([]);
            setFrom("");
            setTo("");
            setTags([]);
          }}
        />
      </div>

      {/* Search error */}
      {searchError && (
        <p className="text-sm text-red-400 shrink-0">{searchError}</p>
      )}

      {/* Log viewer */}
      <LogViewer logs={logs} isLive={false} loading={logsLoading} />

      {/* Load more */}
      <div className="shrink-0">
        <LogLoadMore
          currentLimit={limit}
          onLoad={(n) => setLimit(n)}
          loading={logsLoading}
        />
      </div>
    </div>
  );
}
