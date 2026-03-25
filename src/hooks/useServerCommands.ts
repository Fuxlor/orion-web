"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import { ServerCommand } from "@/types";
import { toast } from "sonner";
import { useOrionWs } from "@/contexts/orionWsContext";

interface CommandStatusPayload {
  commandId: number;
  hostname: string;
  type: 'restart' | 'stop' | 'start';
  status: 'ack' | 'failed';
  source_name: string | null;
  acked_at: string | null;
}

export function useServerCommands(
  projectName: string | null,
  serverName: string | null
): {
  commands: ServerCommand[];
  hasPendingCommand: (type: 'restart' | 'stop' | 'start', sourceName?: string) => boolean;
  refetch: () => void;
} {
  const [commands, setCommands] = useState<ServerCommand[]>([]);
  const prevCommandsRef = useRef<ServerCommand[]>([]);
  const { subscribe } = useOrionWs();

  const fetchCommands = async () => {
    if (!projectName || !serverName) return;
    let cancelled = false;

    apiFetch(`/api/projects/${projectName}/servers/${encodeURIComponent(serverName)}/commands`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const fresh: ServerCommand[] = data.commands ?? [];
        prevCommandsRef.current = fresh;
        setCommands(fresh);
      })
      .catch(() => {
        // Silently ignore errors on initial load
      });

    return () => {
      cancelled = true;
    };
  };

  const refetch = useCallback(() => {
    fetchCommands();
  }, [projectName, serverName]);

  useEffect(() => {
    fetchCommands();
  }, [projectName, serverName]);

  useEffect(() => {
    if (!projectName || !serverName) return;
    return subscribe<CommandStatusPayload>("command_status", (envelope) => {
      if (envelope.projectName !== projectName) return;
      if (envelope.payload.hostname !== serverName) return;

      const incoming = envelope.payload;
      const label = incoming.type === 'restart' ? 'Restart' : incoming.type === 'stop' ? 'Stop' : 'Start';
      const suffix = incoming.source_name ? ` (${incoming.source_name})` : '';

      setCommands((prev) => {
        const existing = prev.find((c) => c.id === incoming.commandId);
        if (existing?.status === 'pending') {
          if (incoming.status === 'ack') {
            toast.success(`${label} command acknowledged by the server${suffix}.`);
          } else {
            toast.error(`${label} command failed — no response from server${suffix}.`);
          }
        }

        const updated: ServerCommand = {
          id: incoming.commandId,
          type: incoming.type,
          status: incoming.status,
          created_at: existing?.created_at ?? new Date().toISOString(),
          acked_at: incoming.acked_at,
          source_name: incoming.source_name,
        };

        if (existing) {
          return prev.map((c) => c.id === incoming.commandId ? updated : c);
        }
        return [...prev, updated];
      });
    });
  }, [projectName, serverName, subscribe]);

  const hasPendingCommand = (type: 'restart' | 'stop' | 'start', sourceName?: string): boolean => {
    return commands.some(
      (c) =>
        c.status === 'pending' &&
        c.type === type &&
        (sourceName === undefined || c.source_name === sourceName)
    );
  };

  return { commands, hasPendingCommand, refetch };
}
