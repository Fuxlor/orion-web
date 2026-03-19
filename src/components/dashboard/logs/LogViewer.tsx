"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { LogEntry } from "@/types";

const LEVEL_CONFIG: Record<string, { color: string; bg: string; border: string }> = {
  info:    { color: "var(--level-info)",    bg: "var(--level-info-bg)",    border: "var(--level-info-border)" },
  warn:    { color: "var(--level-warn)",    bg: "var(--level-warn-bg)",    border: "var(--level-warn-border)" },
  error:   { color: "var(--level-error)",   bg: "var(--level-error-bg)",   border: "var(--level-error-border)" },
  debug:   { color: "var(--level-debug)",   bg: "var(--level-debug-bg)",   border: "var(--level-debug-border)" },
  verbose: { color: "var(--level-verbose)", bg: "var(--level-verbose-bg)", border: "var(--level-verbose-border)" },
  trace:   { color: "var(--level-trace)",   bg: "var(--level-trace-bg)",   border: "var(--level-trace-border)" },
};

const STATS_LEVELS = ["info", "warn", "error", "debug", "verbose", "trace"];

interface Props {
  logs: LogEntry[];
  isLive: boolean;
  loading?: boolean;
}

export default function LogViewer({ logs, isLive, loading }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isAutoScrollRef = useRef(true);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    isAutoScrollRef.current = scrollHeight - scrollTop - clientHeight < 50;
  };

  useEffect(() => {
    if (isAutoScrollRef.current && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const formatTimestamp = (ts: Date) => {
    try { return new Date(ts).toISOString(); } catch { return String(ts); }
  };

  const levelCounts = STATS_LEVELS.reduce<Record<string, number>>((acc, lvl) => {
    acc[lvl] = logs.filter(l => l.level === lvl).length;
    return acc;
  }, {});

  const activeLevels = STATS_LEVELS.filter(lvl => levelCounts[lvl] > 0);

  return (
    <div className="flex-1 min-h-0 flex flex-col rounded-[14px] overflow-hidden" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
      {/* Stats bar */}
      <div
        className="flex items-center gap-5 px-4 py-2 shrink-0"
        style={{ borderBottom: "1px solid var(--border)", fontSize: 12 }}
      >
        <span style={{ color: "var(--text-muted)" }}>
          <span style={{ color: "var(--foreground)", fontWeight: 600 }}>{logs.length}</span> events
        </span>
        {activeLevels.map(lvl => (
          <span key={lvl} style={{ color: LEVEL_CONFIG[lvl]?.color ?? "var(--foreground)" }}>
            {levelCounts[lvl]} {lvl}
          </span>
        ))}
        <div style={{ flex: 1 }} />
        {loading && (
          <span className="text-xs animate-pulse" style={{ color: "var(--text-muted)" }}>Loading…</span>
        )}
        {isLive ? (
          <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: "var(--primary)" }}>
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ repeat: Infinity, duration: 1.4 }}
              style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "var(--primary)", display: "inline-block" }}
            />
            Live
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: "var(--level-warn)" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "var(--level-warn)", display: "inline-block" }} />
            Paused
          </span>
        )}
      </div>

      {/* Log list */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-auto"
        style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}
      >
        {logs.length === 0 && !loading && (
          <p className="p-4" style={{ color: "var(--text-muted)" }}>No logs found.</p>
        )}
        <AnimatePresence initial={false}>
          {logs.map((log) => {
            const cfg = LEVEL_CONFIG[log.level];
            return (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.18 }}
                className="flex items-start gap-3 px-4 hover:bg-white/[0.02] transition-colors"
                style={{ paddingTop: 8, paddingBottom: 8, borderBottom: "1px solid var(--border)" }}
              >
                <span className="shrink-0" style={{ color: "var(--text-muted)", fontSize: 11, paddingTop: 1 }}>
                  {formatTimestamp(log.timestamp)}
                </span>
                <span
                  className="shrink-0"
                  style={{
                    color: cfg?.color ?? "var(--foreground)",
                    backgroundColor: cfg?.bg ?? "var(--input)",
                    border: `1px solid ${cfg?.border ?? "var(--border)"}`,
                    padding: "1px 6px",
                    borderRadius: 4,
                    fontSize: 10,
                    fontWeight: 700,
                    lineHeight: "16px",
                  }}
                >
                  {log.level.toUpperCase()}
                </span>
                <span
                  className="shrink-0"
                  style={{
                    color: "var(--text-muted)",
                    backgroundColor: "var(--input)",
                    padding: "1px 6px",
                    borderRadius: 4,
                    fontSize: 10,
                    lineHeight: "16px",
                  }}
                >
                  {log.source}
                </span>
                {log.server && (
                  <span
                    className="shrink-0"
                    style={{
                      color: "var(--text-muted)",
                      backgroundColor: "var(--border)",
                      padding: "1px 6px",
                      borderRadius: 4,
                      fontSize: 10,
                      lineHeight: "16px",
                    }}
                  >
                    {log.server}
                  </span>
                )}
                <span className="flex-1 min-w-0" style={{ color: "var(--foreground)" }}>
                  {log.message}
                </span>
                {log.metadata && Object.keys(log.metadata).length > 0 && (
                  <span className="shrink-0" style={{ color: "var(--text-muted)", fontSize: 11 }}>
                    {JSON.stringify(log.metadata)}
                  </span>
                )}
                {log.tags && log.tags.length > 0 && (
                  <span className="flex gap-1 shrink-0">
                    {log.tags.map(t => (
                      <span key={t} style={{ color: "var(--primary)", opacity: 0.7, fontSize: 11 }}>#{t}</span>
                    ))}
                  </span>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
