"use client";

import { useState, useEffect, useRef } from "react";
import { apiFetch } from "@/lib/api";
import { ServerCommand } from "@/types";
import { toast } from "sonner";

export function useServerCommands(
  projectName: string | null,
  serverName: string | null
): {
  commands: ServerCommand[];
  hasPendingCommand: (type: 'restart' | 'stop', sourceName?: string) => boolean;
} {
  const [commands, setCommands] = useState<ServerCommand[]>([]);
  const prevCommandsRef = useRef<ServerCommand[]>([]);

  useEffect(() => {
    if (!projectName || !serverName) return;
    let cancelled = false;

    const fetchCommands = () => {
      apiFetch(`/api/projects/${projectName}/servers/${encodeURIComponent(serverName)}/commands`)
        .then((r) => r.json())
        .then((data) => {
          if (cancelled) return;
          const fresh: ServerCommand[] = data.commands ?? [];

          const prev = prevCommandsRef.current;
          for (const freshCmd of fresh) {
            const prevCmd = prev.find((p) => p.id === freshCmd.id);
            if (!prevCmd) continue;
            if (prevCmd.status === 'pending' && freshCmd.status === 'ack') {
              const label = freshCmd.type === 'restart' ? 'Restart' : 'Stop';
              const suffix = freshCmd.source_name ? ` (${freshCmd.source_name})` : '';
              toast.success(`${label} command acknowledged by the server${suffix}.`);
            } else if (prevCmd.status === 'pending' && freshCmd.status === 'failed') {
              const label = freshCmd.type === 'restart' ? 'Restart' : 'Stop';
              const suffix = freshCmd.source_name ? ` (${freshCmd.source_name})` : '';
              toast.error(`${label} command failed — no response from server${suffix}.`);
            }
          }

          prevCommandsRef.current = fresh;
          setCommands(fresh);
        })
        .catch(() => {
          // Silently ignore errors — polling is best-effort
        });
    };

    fetchCommands();
    const id = setInterval(fetchCommands, 5_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [projectName, serverName]);

  const hasPendingCommand = (type: 'restart' | 'stop', sourceName?: string): boolean => {
    return commands.some(
      (c) =>
        c.status === 'pending' &&
        c.type === type &&
        (sourceName === undefined || c.source_name === sourceName)
    );
  };

  return { commands, hasPendingCommand };
}
