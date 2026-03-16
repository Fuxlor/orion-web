"use client";

import { useEffect } from "react";
import { notFound } from "next/navigation";
import { useProject } from "@/contexts/projectContext";
import { useProjects } from "@/contexts/projectsContext";
import { useLogs } from "@/contexts/logsContext";
import { LogSource } from "@/types";
import { useLogFilters } from "@/hooks/useLogFilters";
import { useLogSearch } from "@/hooks/useLogSearch";
import { useTags } from "@/hooks/useTags";
import { useServers } from "@/hooks/useServers";
import LogSearchBar from "@/components/dashboard/logs/LogSearchBar";
import LogFilters from "@/components/dashboard/logs/LogFilters";
import LogViewer from "@/components/dashboard/logs/LogViewer";
import LogLoadMore from "@/components/dashboard/logs/LogLoadMore";
import LogExportButton from "@/components/dashboard/logs/LogExportButton";

export default function ProjectLogsPage() {
  const { project, projectName, sources } = useProject();
  const { loading } = useProjects();
  const { logs: liveLogs, setSource } = useLogs();

  const filterState = useLogFilters();
  const {
    search, setSearch,
    levels, setLevels,
    sources: selectedSources, setSources,
    servers: selectedServers, setServers,
    from, setFrom,
    to, setTo,
    tags: selectedTags, setTags,
    limit, setLimit,
    isFiltered,
    clearAll,
    filters,
  } = filterState;

  const { logs: searchLogs, loading: searchLoading, error: searchError } = useLogSearch(
    projectName,
    filters,
    isFiltered
  );
  const { tags: availableTags } = useTags(projectName);
  const { servers: serverList } = useServers(projectName);

  // For real-time mode: subscribe to "all" source
  useEffect(() => {
    if (!isFiltered) {
      setSource({ name: "all", description: "All", environment: "all" } as LogSource);
    }
  }, [isFiltered, setSource]);

  const displayedLogs = isFiltered ? searchLogs : (liveLogs ?? []);
  const isLive = !isFiltered;

  const sourceNames = sources?.map(s => s.name) ?? [];
  const serverNames = serverList.map(s => s.hostname);

  if (loading) return <div className="text-[var(--text-muted)]">Loading…</div>;
  if (projectName && !project) notFound();

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <h1 className="text-xl font-semibold text-white">Logs — {project?.label}</h1>
        <LogExportButton
          projectName={projectName ?? ""}
          filters={filters}
          currentCount={displayedLogs.length}
        />
      </div>

      {/* Search */}
      <div className="shrink-0">
        <LogSearchBar value={search} onChange={setSearch} />
      </div>

      {/* Filters */}
      <div className="shrink-0">
        <LogFilters
          availableSources={sourceNames}
          availableServers={serverNames}
          availableTags={availableTags}
          levels={levels}
          sources={selectedSources}
          servers={selectedServers}
          from={from}
          to={to}
          tags={selectedTags}
          isFiltered={isFiltered}
          onLevelsChange={setLevels}
          onSourcesChange={setSources}
          onServersChange={setServers}
          onFromChange={setFrom}
          onToChange={setTo}
          onTagsChange={setTags}
          onClear={clearAll}
        />
      </div>

      {/* Search error */}
      {searchError && (
        <p className="text-sm text-red-400 shrink-0">{searchError}</p>
      )}

      {/* Log viewer */}
      <LogViewer logs={displayedLogs} isLive={isLive} loading={searchLoading} />

      {/* Load more */}
      <div className="shrink-0">
        <LogLoadMore
          currentLimit={limit}
          onLoad={(n) => setLimit(n)}
          loading={searchLoading}
        />
      </div>
    </div>
  );
}
