"use client";

import { notFound } from "next/navigation";
import { useParams } from "next/navigation";
import { useProject } from "@/contexts/projectContext";
import { useProjects } from "@/contexts/projectsContext";
import { useLogs } from "@/contexts/logsContext";
import { useError } from "@/contexts/errorContext";
import { useSourceStats } from "@/hooks/useSourceStats";
import { useEffect, useRef, useState } from "react";
import { LogSource } from "@/types";
import ActivityChart from "@/components/dashboard/ActivityChart";

export default function SourceLogsPage() {
  const params = useParams<{ name: string; sourceName: string }>();
  const { project, projectName } = useProject();
  const { loading } = useProjects();
  const { logs, setSource } = useLogs();
  const { error } = useError();
  const { stats } = useSourceStats(params.name, params.sourceName, '24h');

  const scrollRef = useRef<HTMLDivElement>(null);
  const [isAutoScroll, setIsAutoScroll] = useState(true);

  useEffect(() => {
    setSource({ name: params.sourceName, description: "", environment: "" } as LogSource);
  }, [setSource, params.sourceName]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
    setIsAutoScroll(isAtBottom);
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
      setIsAutoScroll(true);
    }
  };

  useEffect(() => {
    if (isAutoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, isAutoScroll]);

  if (loading) return <div className="text-[var(--text-muted)]">Loading…</div>;
  if (projectName && !project) notFound();

  const uptimeDisplay = stats?.uptime_percent != null
    ? `${stats.uptime_percent}%`
    : "—";

  return (
    <div className="flex flex-col h-full gap-4">
      <h1 className="text-xl font-semibold text-white mb-2">
        Logs — {project?.label} / {params.sourceName}
      </h1>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
        <div className="p-3 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)]">
          <p className="text-xs text-[var(--text-muted)]">Total (24h)</p>
          <p className="text-lg font-semibold  text-[var(--primary)]">
            {stats?.log_counts.total ?? logs?.length ?? "—"}
          </p>
        </div>
        <div className="p-3 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)]">
          <p className="text-xs text-[var(--text-muted)]">Errors (24h)</p>
          <p className="text-lg font-semibold  text-[var(--primary)]">
            {stats?.log_counts.error ?? "—"}
          </p>
        </div>
        <div className="p-3 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)]">
          <p className="text-xs text-[var(--text-muted)]">Warnings (24h)</p>
          <p className="text-lg font-semibold  text-[var(--primary)]">
            {stats?.log_counts.warn ?? "—"}
          </p>
        </div>
        <div className="p-3 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)]">
          <p className="text-xs text-[var(--text-muted)]">Uptime (24h)</p>
          <p className="text-lg font-semibold text-[var(--primary)]">{uptimeDisplay}</p>
        </div>
      </div>

      {/* Compact activity chart */}
      {stats?.chart_data && stats.chart_data.length > 0 && (
        <div className="shrink-0 overflow-hidden">
          <ActivityChart chartData={stats.chart_data} window="24h" />
        </div>
      )}

      <div className="flex-1 min-h-0 relative">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="h-full rounded-lg border border-[var(--border)] bg-[var(--surface-input)] font-mono text-sm overflow-auto"
        >
          <div className="p-4 text-[var(--text-muted)]">
            {error ? (
              <>
                <p>An error occured :</p>
                <p className="text-red-500">{error}</p>
              </>
            ) : (
              logs?.map((log) => (
                <div key={log.id}>
                  <p>[{new Date(log.timestamp).toISOString()}] [{log.level}] [{log.source}] {log.message}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {!isAutoScroll && (
          <button
            onClick={scrollToBottom}
            className="absolute bottom-4 right-6 bg-[var(--surface-elevated)] text-white p-2 rounded-full shadow-lg border border-[var(--border)] hover:bg-[var(--border)] transition-colors flex items-center justify-center cursor-pointer"
            title="Revenir en bas"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14" />
              <path d="m19 12-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
