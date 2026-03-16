"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { ProjectSettings } from "@/types";

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
  const [customInput, setCustomInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const customLevels = levels.filter((l) => !NATIVE_LEVELS.includes(l as never));
  const canWrite = can("settings:write");

  function toggleLevel(level: string) {
    if (!canWrite) return;
    setLevels((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    );
  }

  function addCustomLevel() {
    const val = customInput.trim().toLowerCase();
    if (!val || levels.includes(val)) return;
    setLevels((prev) => [...prev, val]);
    setCustomInput("");
  }

  function removeCustomLevel(level: string) {
    setLevels((prev) => prev.filter((l) => l !== level));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await apiFetch(`/api/projects/${projectName}/settings`, {
        method: "PATCH",
        body: JSON.stringify({ enabled_levels: levels }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save");
      onUpdate(levels);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {!canWrite && (
        <p className="text-xs text-[var(--text-muted)] bg-[var(--surface-input)] px-3 py-2 rounded-lg border border-[var(--border)]">
          View only — you don&apos;t have permission to modify log levels.
        </p>
      )}

      {/* Native levels */}
      <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] p-5 space-y-3">
        <h2 className="text-sm font-medium text-[var(--text-secondary)]">Native Levels</h2>
        <p className="text-xs text-[var(--text-muted)]">
          Disabled levels are accepted by the API but immediately discarded — not stored or broadcast.
        </p>
        <div className="space-y-2">
          {NATIVE_LEVELS.map((level) => {
            const active = levels.includes(level);
            return (
              <button
                key={level}
                type="button"
                onClick={() => toggleLevel(level)}
                disabled={!canWrite}
                className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-sm transition-colors ${
                  active
                    ? "border-[var(--primary)] bg-[var(--primary-muted)]"
                    : "border-[var(--border)] bg-[var(--surface-input)] opacity-60"
                } ${canWrite ? "cursor-pointer hover:opacity-90" : "cursor-default"}`}
              >
                <span className={`font-mono font-medium ${LEVEL_COLORS[level] ?? "text-[var(--text-secondary)]"}`}>
                  {level}
                </span>
                <span
                  className={`text-xs font-medium ${active ? "text-[var(--primary)]" : "text-[var(--text-muted)]"}`}
                >
                  {active ? "ON" : "OFF"}
                </span>
              </button>
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
                {canWrite && (
                  <button
                    type="button"
                    onClick={() => removeCustomLevel(level)}
                    className="text-[var(--text-muted)] hover:text-red-400 transition-colors"
                    aria-label={`Remove ${level}`}
                  >
                    ×
                  </button>
                )}
              </span>
            ))}
          </div>
        )}

        {canWrite && (
          <div className="flex gap-2">
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCustomLevel()}
              placeholder="e.g. critical"
              className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface-input)] px-3 py-2 text-sm text-[var(--text-secondary)] focus:border-[var(--border-focus)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-muted)]"
            />
            <button
              type="button"
              onClick={addCustomLevel}
              className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-input)]"
            >
              Add
            </button>
          </div>
        )}
      </div>

      {canWrite && (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--surface)] transition-colors hover:bg-[var(--primary-hover)] disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
          {success && <span className="text-xs text-[var(--primary)]">Saved</span>}
          {error && <span className="text-xs text-red-400">{error}</span>}
        </div>
      )}
    </div>
  );
}
