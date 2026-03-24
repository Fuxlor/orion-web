"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useProject } from "./projectContext";

export type WsMessageType =
  | "log"
  | "performance"
  | "heartbeat"
  | "alert"
  | "stats_update"
  | "server_status";

export interface WsEnvelope<T = unknown> {
  type: WsMessageType;
  payload: T;
  projectName: string;
  timestamp: string;
}

type MessageHandler<T = unknown> = (envelope: WsEnvelope<T>) => void;

interface OrionWsContextValue {
  connected: boolean;
  subscribe: <T>(type: WsMessageType, handler: MessageHandler<T>) => () => void;
}

const OrionWsContext = createContext<OrionWsContextValue | null>(null);

const RECONNECT_DELAY_MS = 5_000;

export function OrionWsProvider({ children }: { children: React.ReactNode }) {
  const { projectName } = useProject();
  const [connected, setConnected] = useState(false);

  const socketRef = useRef<WebSocket | null>(null);
  const handlersRef = useRef<Map<WsMessageType, Set<MessageHandler>>>(new Map());
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelledRef = useRef(false);

  const subscribe = useCallback(<T,>(type: WsMessageType, handler: MessageHandler<T>) => {
    if (!handlersRef.current.has(type)) {
      handlersRef.current.set(type, new Set());
    }
    handlersRef.current.get(type)!.add(handler as MessageHandler);
    return () => {
      handlersRef.current.get(type)?.delete(handler as MessageHandler);
    };
  }, []);

  useEffect(() => {
    if (!projectName) return;

    cancelledRef.current = false;

    const connect = () => {
      if (cancelledRef.current) return;

      apiFetch("/api/ws/create", {
        method: "POST",
        body: JSON.stringify({ projectName }),
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to create WebSocket ticket");
          return res.json();
        })
        .then((data: { url?: string }) => {
          if (cancelledRef.current || !data.url) return;

          const ws = new WebSocket(data.url);
          socketRef.current = ws;

          ws.onopen = () => {
            if (!cancelledRef.current) setConnected(true);
          };

          ws.onmessage = (event) => {
            try {
              const envelope = JSON.parse(event.data as string) as WsEnvelope;
              const handlers = handlersRef.current.get(envelope.type);
              if (handlers) {
                for (const h of handlers) h(envelope);
              }
            } catch {
              // ignore parse errors
            }
          };

          ws.onclose = () => {
            if (cancelledRef.current) return;
            setConnected(false);
            socketRef.current = null;
            reconnectTimerRef.current = setTimeout(connect, RECONNECT_DELAY_MS);
          };

          ws.onerror = () => {
            ws.close();
          };
        })
        .catch(() => {
          if (!cancelledRef.current) {
            reconnectTimerRef.current = setTimeout(connect, RECONNECT_DELAY_MS);
          }
        });
    };

    connect();

    return () => {
      cancelledRef.current = true;
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      socketRef.current?.close();
      socketRef.current = null;
      setConnected(false);
    };
  }, [projectName]);

  return (
    <OrionWsContext.Provider value={{ connected, subscribe }}>
      {children}
    </OrionWsContext.Provider>
  );
}

export function useOrionWs() {
  const ctx = useContext(OrionWsContext);
  if (!ctx) throw new Error("useOrionWs must be used within OrionWsProvider");
  return ctx;
}
