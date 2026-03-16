"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { ProjectSettings } from "@/types";

interface Props {
  projectName: string;
  settings: ProjectSettings;
  can: (perm: string) => boolean;
  onUpdate: (label: string) => void;
}

export default function GeneralTab({ projectName, settings, can, onUpdate }: Props) {
  const [label, setLabel] = useState(settings.label ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await apiFetch(`/api/projects/${projectName}/settings`, {
        method: "PATCH",
        body: JSON.stringify({ label }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save");
      onUpdate(label);
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
      {/* Label */}
      <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] p-5 space-y-4">
        <h2 className="text-sm font-medium text-[var(--text-secondary)]">Project Label</h2>
        <div className="space-y-1">
          <label className="text-xs text-[var(--text-muted)]">Display name</label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            disabled={!can("settings:write")}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-input)] px-3 py-2 text-sm text-[var(--text-secondary)] focus:border-[var(--border-focus)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-muted)] disabled:opacity-50"
          />
        </div>

        {can("settings:write") && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || label.trim() === settings.label}
              className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--surface)] transition-colors hover:bg-[var(--primary-hover)] disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save"}
            </button>
            {success && <span className="text-xs text-[var(--primary)]">Saved</span>}
            {error && <span className="text-xs text-red-400">{error}</span>}
          </div>
        )}
      </div>

      {/* Slug + metadata */}
      <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] p-5 space-y-4">
        <h2 className="text-sm font-medium text-[var(--text-secondary)]">Project Info</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <p className="text-xs text-[var(--text-muted)]">Slug (immutable)</p>
            <p className="font-mono text-sm text-[var(--text-secondary)] bg-[var(--surface-input)] px-3 py-2 rounded-lg border border-[var(--border)]">
              {settings.name}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-[var(--text-muted)]">Created</p>
            <p className="text-sm text-[var(--text-secondary)] bg-[var(--surface-input)] px-3 py-2 rounded-lg border border-[var(--border)]">
              {new Date(settings.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
