"use client";

import { useState, useEffect } from "react";
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
  onSaved: (levels: string[]) => void;
  onClose: () => void;
}

export default function LogLevelsModal({ projectName, settings, onSaved, onClose }: Props) {
  const [levels, setLevels] = useState<string[]>(settings.enabled_levels ?? ["info", "warn", "error"]);
  const [customInput, setCustomInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const customLevels = levels.filter((l) => !NATIVE_LEVELS.includes(l as never));

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  function toggleLevel(level: string) {
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
    try {
      const res = await apiFetch(`/api/projects/${projectName}/settings`, {
        method: "PATCH",
        body: JSON.stringify({ enabled_levels: levels }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save");
      onSaved(levels);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <div
        className="w-full max-w-lg rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] shadow-2xl max-h-[90vh] flex flex-col"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)] shrink-0">
          <h2 className="text-base font-semibold text-white">Edit Log Levels</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors text-xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-5 overflow-y-auto">
          {/* Native levels */}
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-[var(--text-secondary)]">Native Levels</p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Disabled levels are accepted by the API but immediately discarded.
              </p>
            </div>
            <div className="space-y-2">
              {NATIVE_LEVELS.map((level) => {
                const active = levels.includes(level);
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => toggleLevel(level)}
                    className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-sm transition-colors cursor-pointer hover:opacity-90 ${
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
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom levels */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-[var(--text-secondary)]">Custom Levels</p>
            {customLevels.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {customLevels.map((level) => (
                  <span
                    key={level}
                    className="flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface-input)] px-3 py-1 text-xs text-[var(--text-secondary)]"
                  >
                    <span className="font-mono">{level}</span>
                    <button
                      type="button"
                      onClick={() => removeCustomLevel(level)}
                      className="text-[var(--text-muted)] hover:text-red-400 transition-colors"
                      aria-label={`Remove ${level}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
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
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-5 py-4 border-t border-[var(--border)] shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-input)]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--surface)] transition-colors hover:bg-[var(--primary-hover)] disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
