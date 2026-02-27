"use client";

import { createContext, useContext, useState, useEffect, useRef } from "react";
import { LogSource, LogEntry } from "@/types";
import { apiFetch } from "@/lib/api";

interface LogsContextValue {
  source: LogSource | null;
  sourceName: string | null;
  socket: WebSocket | null;
  logs: LogEntry[] | null;
  projectName: string | null;
  setSource: (source: LogSource) => void;
  setSourceName: (sourceName: string) => void;
  setSocket: (socket: WebSocket) => void;
  setLogs: (logs: LogEntry[]) => void;
  setProjectName: (projectName: string) => void;
}

const LogsContext = createContext<LogsContextValue | null>(null);

export function LogsProvider({ children }: { children: React.ReactNode }) {
  const [source, setSource] = useState<LogSource | null>(null);
  const [sourceName, setSourceName] = useState<string | null>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [logs, setLogs] = useState<LogEntry[] | null>(null);
  const [projectName, setProjectName] = useState<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!source) return;

    apiFetch(`/api/projects/${projectName}/sources/${source.name}/logs`, {
      method: "GET",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch logs");
        return res.json();
      })
      .then((data) => {
        setLogs(data);
      })
      .catch(() => {
        setLogs([]);
      });

    let cancelled = false;

    apiFetch("/api/ws/create", {
      method: "POST",
      body: JSON.stringify({ sourceName: source.name }),
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
        queueMicrotask(() => setSocket(socket));
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
      queueMicrotask(() => setSocket(null));
      setLogs(null);
    };
  }, [source]);

  return (
    <LogsContext.Provider value={{ source, sourceName, socket, logs, projectName, setSource, setSourceName, setSocket, setLogs, setProjectName }}>
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
