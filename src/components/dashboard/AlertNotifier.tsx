"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { useOrionWs } from "@/contexts/orionWsContext";
import { useProject } from "@/contexts/projectContext";

const LEVEL_COLORS: Record<string, string> = {
  error: "#ef4444",
  warn: "#f59e0b",
  info: "#3b82f6",
  debug: "#8b5cf6",
  verbose: "#6b7280",
  trace: "#6b7280",
};

export default function AlertNotifier() {
  const { subscribe } = useOrionWs();
  const { projectName } = useProject();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!projectName) return;
    return subscribe<{
      rule_name: string | null;
      level: string;
      message: string | null;
      source_name: string | null;
    }>("alert", (envelope) => {
      if (envelope.projectName !== projectName) return;
      if (pathname.endsWith("/alerts")) return;

      const { level, message, rule_name, source_name } = envelope.payload;
      const color = LEVEL_COLORS[level] ?? "#6b7280";
      const alertsPath = `/dashboard/projects/${projectName}/alerts`;

      toast(rule_name ?? "Alert triggered", {
        description: (
          <span className="flex flex-col gap-1">
            <span className="flex items-center gap-1.5">
              <span
                className="inline-block rounded px-1.5 py-px text-[10px] font-semibold uppercase"
                style={{ backgroundColor: `${color}22`, color }}
              >
                {level}
              </span>
              {source_name && (
                <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>
                  {source_name}
                </span>
              )}
            </span>
            {message && (
              <span style={{ color: "var(--text-secondary)", fontSize: "12px" }}>
                {message.length > 80 ? `${message.slice(0, 80)}…` : message}
              </span>
            )}
          </span>
        ),
        duration: 6000,
        action: {
          label: "View alerts",
          onClick: () => router.push(alertsPath),
        },
      });
    });
  }, [projectName, pathname, subscribe, router]);

  return null;
}
