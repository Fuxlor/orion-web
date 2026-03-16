"use client";

import { useEffect, useRef, useState } from "react";
import { LogEntry } from "@/types";

const LEVEL_COLORS: Record<string, string> = {
  info: "text-blue-400",
  warn: "text-yellow-400",
  error: "text-red-400",
  debug: "text-gray-400",
  verbose: "text-violet-400",
  trace: "text-green-300",
};

interface Props {
  logs: LogEntry[];
  isLive: boolean;
  loading?: boolean;
}

export default function LogViewer({ logs, isLive, loading }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isAutoScroll, setIsAutoScroll] = useState(true);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    setIsAutoScroll(scrollHeight - scrollTop - clientHeight < 50);
  };

  useEffect(() => {
    if (isAutoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, isAutoScroll]);

  const formatTimestamp = (ts: Date) => {
    try { return new Date(ts).toISOString(); } catch { return String(ts); }
  };

  return (
    <div className="flex-1 min-h-0 relative">
      {/* Live / Loading indicator */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
        {loading && (
          <span className="text-xs text-[var(--text-muted)] animate-pulse">Loading…</span>
        )}
        {isLive ? (
          <span className="flex items-center gap-1 text-xs text-green-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Live
          </span>
        ) : (
          <span className="flex items-center gap-1 text-xs text-yellow-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-yellow-400" />
            Paused
          </span>
        )}
      </div>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="h-full rounded-lg border border-[var(--border)] bg-[var(--surface-input)] font-mono text-sm overflow-auto"
      >
        <div className="p-4 space-y-0.5">
          {logs.length === 0 && !loading && (
            <p className="text-[var(--text-muted)]">No logs found.</p>
          )}
          {logs.map((log) => (
            <div key={log.id} className="flex gap-2 leading-5 text-[var(--text-muted)] hover:bg-white/5 rounded px-1 -mx-1 transition-colors">
              <span className="shrink-0 text-xs opacity-60 pt-px">
                {formatTimestamp(log.timestamp)}
              </span>
              <span className={`shrink-0 font-semibold text-xs uppercase w-14 pt-px ${LEVEL_COLORS[log.level] ?? "text-white"}`}>
                [{log.level}]
              </span>
              <span className="shrink-0 text-xs opacity-70 pt-px">[{log.source}]</span>
              {log.server && (
                <span className="shrink-0 text-xs opacity-50 pt-px">[{log.server}]</span>
              )}
              <span className="text-white break-all">{log.message}</span>
              {log.metadata && Object.keys(log.metadata).length > 0 && (
                <span className="text-xs opacity-50 shrink-0 pt-px">
                  {JSON.stringify(log.metadata)}
                </span>
              )}
              {log.tags && log.tags.length > 0 && (
                <span className="flex gap-1 shrink-0 pt-px">
                  {log.tags.map(t => (
                    <span key={t} className="text-xs text-[var(--primary)] opacity-70">#{t}</span>
                  ))}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {!isAutoScroll && (
        <button
          onClick={() => {
            if (scrollRef.current) {
              scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
              setIsAutoScroll(true);
            }
          }}
          className="absolute bottom-4 right-6 bg-[var(--surface-elevated)] text-white p-2 rounded-full shadow-lg border border-[var(--border)] hover:bg-[var(--border)] transition-colors flex items-center justify-center cursor-pointer"
          title="Scroll to bottom"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14" /><path d="m19 12-7 7-7-7" />
          </svg>
        </button>
      )}
    </div>
  );
}
