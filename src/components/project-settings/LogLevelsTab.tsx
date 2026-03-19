"use client";

import { useState } from "react";
import { Edit3 } from "lucide-react";
import { ProjectSettings } from "@/types";
import LogLevelsModal from "./modals/LogLevelsModal";

const NATIVE_LEVELS = ["info", "warn", "error", "debug", "trace", "verbose"] as const;

const LEVEL_COLORS: Record<string, string> = {
  info: "text-blue-400",
  warn: "text-yellow-400",
  error: "text-red-400",
  debug: "text-purple-400",
  trace: "text-cyan-400",
  verbose: "text-gray-400",
};

interface Props {
  projectName: string;
  settings: ProjectSettings;
  can: (perm: string) => boolean;
  onUpdate: (levels: string[]) => void;
}

export default function LogLevelsTab({ projectName, settings, can, onUpdate }: Props) {
  const [levels, setLevels] = useState<string[]>(settings.enabled_levels ?? ["info", "warn", "error"]);
  const [editOpen, setEditOpen] = useState(false);

  const customLevels = levels.filter((l) => !NATIVE_LEVELS.includes(l as never));
  const canWrite = can("settings:write");

  return (
    <div className="space-y-6">
      {!canWrite && (
        <p className="text-xs text-[var(--text-muted)] bg-[var(--surface-input)] px-3 py-2 rounded-lg border border-[var(--border)]">
          View only — you don&apos;t have permission to modify log levels.
        </p>
      )}

      {/* Native levels */}
      <div
        style={{
          backgroundColor: "#13161F",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 12,
          padding: 24,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "white" }}>Native Levels</h2>
          {canWrite && (
            <button
              type="button"
              onClick={() => setEditOpen(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                borderRadius: 7,
                border: "1px solid rgba(255,255,255,0.1)",
                backgroundColor: "transparent",
                color: "#9BA3AF",
                fontSize: 12,
                cursor: "pointer",
                fontFamily: "inherit",
                fontWeight: 500,
              }}
            >
              <Edit3 size={12} /> Edit Log Levels
            </button>
          )}
        </div>
        <p className="text-xs text-[var(--text-muted)]" style={{ marginBottom: 12 }}>
          Disabled levels are accepted by the API but immediately discarded — not stored or broadcast.
        </p>
        <div className="space-y-2">
          {NATIVE_LEVELS.map((level) => {
            const active = levels.includes(level);
            return (
              <div
                key={level}
                className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-sm ${
                  active
                    ? "border-[var(--primary)] bg-[var(--primary-muted)]"
                    : "border-[var(--border)] bg-[var(--surface-input)] opacity-60"
                }`}
              >
                <span className={`font-mono font-medium ${LEVEL_COLORS[level] ?? "text-[var(--text-secondary)]"}`}>
                  {level}
                </span>
                <span className={`text-xs font-medium ${active ? "text-[var(--primary)]" : "text-[var(--text-muted)]"}`}>
                  {active ? "ON" : "OFF"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom levels */}
      <div
        style={{
          backgroundColor: "#13161F",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 12,
          padding: 24,
        }}
      >
        <h2 style={{ fontSize: 15, fontWeight: 700, color: "white", marginBottom: 16 }}>Custom Levels</h2>
        {customLevels.length === 0 ? (
          <p className="text-xs text-[var(--text-muted)]">No custom levels added yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {customLevels.map((level) => (
              <span
                key={level}
                className="flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface-input)] px-3 py-1 text-xs text-[var(--text-secondary)]"
              >
                <span className="font-mono">{level}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {editOpen && (
        <LogLevelsModal
          projectName={projectName}
          settings={{ ...settings, enabled_levels: levels }}
          onSaved={(newLevels) => {
            setLevels(newLevels);
            onUpdate(newLevels);
          }}
          onClose={() => setEditOpen(false)}
        />
      )}
    </div>
  );
}
