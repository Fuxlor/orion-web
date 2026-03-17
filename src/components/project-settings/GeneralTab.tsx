"use client";

import { useState } from "react";
import { ProjectSettings } from "@/types";
import EditLabelModal from "./modals/EditLabelModal";

interface Props {
  projectName: string;
  settings: ProjectSettings;
  can: (perm: string) => boolean;
  onUpdate: (label: string) => void;
}

export default function GeneralTab({ projectName, settings, can, onUpdate }: Props) {
  const [label, setLabel] = useState(settings.label ?? "");
  const [editOpen, setEditOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Label */}
      <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-[var(--text-secondary)]">Project Label</h2>
          {can("settings:write") && (
            <button
              type="button"
              onClick={() => setEditOpen(true)}
              className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-input)]"
            >
              Edit
            </button>
          )}
        </div>
        <div className="space-y-1">
          <p className="text-xs text-[var(--text-muted)]">Display name</p>
          <p className="rounded-lg border border-[var(--border)] bg-[var(--surface-input)] px-3 py-2 text-sm text-[var(--text-secondary)]">
            {label || <span className="text-[var(--text-muted)] italic">No label set</span>}
          </p>
        </div>
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

      {editOpen && (
        <EditLabelModal
          projectName={projectName}
          currentLabel={label}
          onSaved={(newLabel) => {
            setLabel(newLabel);
            onUpdate(newLabel);
          }}
          onClose={() => setEditOpen(false)}
        />
      )}
    </div>
  );
}
