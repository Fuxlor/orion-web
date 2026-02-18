"use client";

import { createContext, useContext, useState, useEffect, useRef } from "react";
import { LogSource, LogEntry } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

interface LogsContextValue {
  logSource: LogSource | null;
  logSourceSlug: string | null;
  logSocket: WebSocket | null;
  logs: LogEntry[] | null;
  setLogSource: (logSource: LogSource) => void;
  setLogSourceSlug: (logSourceSlug: string) => void;
  setLogSocket: (logSocket: WebSocket) => void;
  setLogs: (logs: LogEntry[]) => void;
}

const LogsContext = createContext<LogsContextValue | null>(null);

export function LogsProvider({ children }: { children: React.ReactNode }) {
  const [logSource, setLogSource] = useState<LogSource | null>(null);
  const [logSourceSlug, setLogSourceSlug] = useState<string | null>(null);
  const [logSocket, setLogSocket] = useState<WebSocket | null>(null);
  const [logs, setLogs] = useState<LogEntry[] | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!logSource) return;

    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    if (!token) return;

    let cancelled = false;

    fetch(`${API_URL}/api/ws/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ sourceName: logSource.name }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to create WebSocket");
        return res.json();
      })
      .then((data) => {
        if (cancelled || !data.url) return;
        const socket = new WebSocket(data.url);
        socketRef.current = socket;
        socket.onmessage = (event) => {
          try {
            const payload = JSON.parse(event.data);
            const raw = Array.isArray(payload) ? payload : [payload];
            const entries: LogEntry[] = raw.map((e: { id?: string; timestamp: string; message: string; level: string; source: string; project?: string }) => ({
              id: e.id ?? crypto.randomUUID(),
              timestamp: new Date(e.timestamp),
              message: e.message,
              level: e.level,
              source: e.source,
              project: e.project ?? ""
            }));
            setLogs((prev) => [...(prev ?? []), ...entries]);
          } catch {
            // ignore parse errors
          }
        };
        queueMicrotask(() => setLogSocket(socket));
      })
      .catch(() => {
        if (!cancelled) setLogs([]);
      });

    return () => {
      cancelled = true;
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      queueMicrotask(() => setLogSocket(null));
      setLogs(null);
    };
  }, [logSource]);

  return (
    <LogsContext.Provider value={{ logSource, logSourceSlug, logSocket, logs, setLogSource, setLogSourceSlug, setLogSocket, setLogs }}>
      {children}
    </LogsContext.Provider>
  );
}

export function useLogs() {
  const ctx = useContext(LogsContext);
  if (!ctx) {
    throw new Error("useLogs must be used within LogsProvider");
  }
  return ctx;
}
