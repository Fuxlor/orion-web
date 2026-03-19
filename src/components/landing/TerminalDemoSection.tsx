"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, ChevronRight } from "lucide-react";
import Link from "next/link";

interface DemoLog { level: string; msg: string; time: string; uid: number; }

const DEMO_LOGS = [
  { level: "info", msg: "Server started on port 3000", time: "09:42:01" },
  { level: "info", msg: "Database connection established", time: "09:42:02" },
  { level: "warn", msg: "Rate limit approaching for user_id: 1234", time: "09:42:05" },
  { level: "error", msg: "TypeError: Cannot read property 'id' of undefined", time: "09:42:08" },
  { level: "info", msg: "Cache warmed up: 2,341 keys loaded", time: "09:42:10" },
  { level: "info", msg: "Request GET /api/users 200 42ms", time: "09:42:12" },
  { level: "warn", msg: "Memory usage at 78% — consider scaling", time: "09:42:15" },
  { level: "info", msg: "Scheduled job \"cleanup\" completed", time: "09:42:18" },
  { level: "error", msg: "Connection timeout: Redis not responding", time: "09:42:21" },
  { level: "info", msg: "Worker pool: 4/8 threads active", time: "09:42:24" },
];

const levelStyle: Record<string, { color: string; bg: string }> = {
  info: { color: "#02f194", bg: "rgba(2,241,148,0.1)" },
  warn: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  error: { color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
};

const highlights = [
  "Structured JSON logging support",
  "Filter by level, service or keyword",
  "Smart error grouping & deduplication",
];

export function TerminalDemoSection() {
  const [visibleLogs, setVisibleLogs] = useState<DemoLog[]>(() =>
    DEMO_LOGS.slice(0, 4).map((log, i) => ({ ...log, uid: i }))
  );
  const uidRef = useRef(4);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let idx = 4;
    const interval = setInterval(() => {
      const next = DEMO_LOGS[idx % DEMO_LOGS.length];
      const uid = uidRef.current++;
      setVisibleLogs((prev) => [...prev.slice(-5), { ...next, uid }]);
      idx++;
    }, 1400);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [visibleLogs]);

  return (
    <section className="max-w-6xl mx-auto px-6 py-12 pb-28">
      <div className="grid md:grid-cols-2 gap-14 items-center">
        {/* Left: copy */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2
            style={{
              fontSize: "clamp(24px, 3.5vw, 42px)",
              fontWeight: 800,
              letterSpacing: "-0.04em",
              marginBottom: 16,
              color: "white",
            }}
          >
            Watch your logs{" "}
            <span style={{ color: "#9241c8" }}>come alive</span>
          </h2>
          <p style={{ color: "#9ba3af", fontSize: 15, lineHeight: 1.8, marginBottom: 24 }}>
            Real-time streaming logs with full-text search, filtering by level and smart grouping.
            Never miss a critical event.
          </p>
          <div className="flex flex-col gap-3">
            {highlights.map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    backgroundColor: "rgba(2,241,148,0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Check size={12} style={{ color: "#02f194" }} />
                </div>
                <span style={{ fontSize: 14, color: "#d1d5db" }}>{item}</span>
              </div>
            ))}
          </div>
          <Link href="/register">
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 mt-8 cursor-pointer"
              style={{
                color: "#02f194",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              See it in action <ChevronRight size={15} />
            </motion.div>
          </Link>
        </motion.div>

        {/* Right: terminal */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{
            backgroundColor: "#0a0c13",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
          }}
        >
          {/* Terminal header */}
          <div
            style={{
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              gap: 8,
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              backgroundColor: "#0d0f16",
            }}
          >
            <div className="flex gap-1.5">
              {["#ef4444", "#f59e0b", "#22c55e"].map((c) => (
                <div
                  key={c}
                  style={{ width: 11, height: 11, borderRadius: "50%", backgroundColor: c }}
                />
              ))}
            </div>
            <span
              style={{
                fontSize: 12,
                color: "#4b5563",
                marginLeft: 6,
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              orion — live stream
            </span>
            <div
              className="ml-auto flex items-center gap-1.5"
              style={{
                backgroundColor: "rgba(2,241,148,0.1)",
                border: "1px solid rgba(2,241,148,0.2)",
                borderRadius: 999,
                padding: "2px 10px",
              }}
            >
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ repeat: Infinity, duration: 1.4 }}
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  backgroundColor: "#02f194",
                  display: "inline-block",
                }}
              />
              <span style={{ fontSize: 11, color: "#02f194", fontWeight: 600 }}>LIVE</span>
            </div>
          </div>

          {/* Log stream */}
          <div
            ref={terminalRef}
            style={{
              padding: "16px 20px",
              height: 300,
              overflowY: "auto",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 12,
              lineHeight: 1.6,
            }}
          >
            <AnimatePresence initial={false}>
              {visibleLogs.map((log) => (
                <motion.div
                  key={log.uid}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25 }}
                  style={{
                    display: "flex",
                    gap: 12,
                    marginBottom: 10,
                    alignItems: "flex-start",
                  }}
                >
                  <span style={{ color: "#374151", flexShrink: 0 }}>{log.time}</span>
                  <span
                    style={{
                      color: levelStyle[log.level]?.color ?? "#9ba3af",
                      backgroundColor: levelStyle[log.level]?.bg ?? "transparent",
                      flexShrink: 0,
                      borderRadius: 4,
                      padding: "0 6px",
                      fontSize: 10,
                      fontWeight: 700,
                      lineHeight: "18px",
                    }}
                  >
                    {log.level.toUpperCase()}
                  </span>
                  <span style={{ color: "#d1d5db" }}>{log.msg}</span>
                </motion.div>
              ))}
            </AnimatePresence>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
              <span style={{ color: "#02f194" }}>❯</span>
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
                style={{ color: "#02f194" }}
              >
                █
              </motion.span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
