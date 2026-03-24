"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { LogSource, LogEntry } from "@/types";
import { apiFetch } from "@/lib/api";
import { useProject } from "./projectContext";
import { useOrionWs } from "./orionWsContext";

const WS_SOURCE_ALL = "all";

interface LogEntryPayload {
  id?: string;
  timestamp: string;
  message: string;
  level: string;
  source: string;
  project?: string;
}

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
}

const LogsContext = createContext<LogsContextValue | null>(null);

export function LogsProvider({ children }: { children: React.ReactNode }) {
  const [source, setSource] = useState<LogSource | null>(null);
  const [sourceName, setSourceName] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[] | null>(null);
  const { projectName } = useProject();
  const { subscribe } = useOrionWs();

  useEffect(() => {
    if (!source || !projectName) return;

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

    const unsubscribe = subscribe<LogEntryPayload>("log", (envelope) => {
      if (source.name !== WS_SOURCE_ALL && envelope.payload.source !== source.name) return;
      const entry: LogEntry = {
        id: envelope.payload.id ?? crypto.randomUUID(),
        timestamp: new Date(envelope.payload.timestamp),
        message: envelope.payload.message,
        level: envelope.payload.level,
        source: envelope.payload.source,
        project: envelope.payload.project ?? "",
      };
      setLogs((prev) => [...(prev ?? []), entry]);
    });

    return () => {
      unsubscribe();
      setLogs(null);
    };
  }, [source, projectName, subscribe]);

  return (
    <LogsContext.Provider value={{
      source,
      sourceName,
      socket: null,
      logs,
      projectName,
      setSource,
      setSourceName,
      setSocket: () => {},
      setLogs,
    }}>
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
