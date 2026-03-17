"use client";

import { useState } from "react";
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
      <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-[var(--text-secondary)]">Native Levels</h2>
          {canWrite && (
            <button
              type="button"
              onClick={() => setEditOpen(true)}
              className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-input)]"
            >
              Edit Log Levels
            </button>
          )}
        </div>
        <p className="text-xs text-[var(--text-muted)]">
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
      <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] p-5 space-y-3">
        <h2 className="text-sm font-medium text-[var(--text-secondary)]">Custom Levels</h2>
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
