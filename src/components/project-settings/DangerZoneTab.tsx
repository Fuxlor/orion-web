"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { ProjectSettings } from "@/types";

interface Props {
  projectName: string;
  settings: ProjectSettings;
}

export default function DangerZoneTab({ projectName, settings }: Props) {
  const router = useRouter();
  const [archiving, setArchiving] = useState(false);
  const [archiveError, setArchiveError] = useState<string | null>(null);
  const [confirmName, setConfirmName] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const isArchived = false; // The settings page only opens for active projects

  async function handleArchive() {
    setArchiving(true);
    setArchiveError(null);
    try {
      const res = await apiFetch(`/api/projects/${projectName}/archive`, { method: "PATCH" });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Failed to archive");
      router.push("/dashboard");
    } catch (err) {
      setArchiveError(err instanceof Error ? err.message : "Failed to archive project");
    } finally {
      setArchiving(false);
    }
  }

  async function handleDelete() {
    if (confirmName !== projectName) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await apiFetch(`/api/projects/${projectName}`, {
        method: "DELETE",
        body: JSON.stringify({ confirmName: projectName }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Failed to delete");
      }
      router.push("/dashboard");
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Failed to delete project");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Archive */}
      <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-5 space-y-3">
        <div>
          <h2 className="text-sm font-semibold text-yellow-400">Archive Project</h2>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            The project will be hidden from your dashboard. All data is preserved for 1 year.
          </p>
        </div>
        {archiveError && <p className="text-xs text-red-400">{archiveError}</p>}
        <button
          type="button"
          onClick={handleArchive}
          disabled={archiving || isArchived}
          className="rounded-lg border border-yellow-500/40 bg-yellow-500/10 px-4 py-2 text-sm font-medium text-yellow-400 transition-colors hover:bg-yellow-500/20 disabled:opacity-50"
        >
          {archiving ? "Archiving…" : "Archive Project"}
        </button>
      </div>

      {/* Delete */}
      <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-5 space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-red-400">Delete Project</h2>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Permanently destroys the project and all associated data. This action{" "}
            <strong className="text-[var(--text-secondary)]">cannot be undone</strong>.
          </p>
        </div>
        <div className="space-y-2">
          <label className="text-xs text-[var(--text-muted)]">
            Type <span className="font-mono text-[var(--text-secondary)]">{projectName}</span> to confirm
          </label>
          <input
            type="text"
            value={confirmName}
            onChange={(e) => setConfirmName(e.target.value)}
            placeholder={projectName}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-input)] px-3 py-2 text-sm text-[var(--text-secondary)] focus:border-red-500/60 focus:outline-none font-mono"
          />
        </div>
        {deleteError && <p className="text-xs text-red-400">{deleteError}</p>}
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting || confirmName !== projectName}
          className="rounded-lg bg-red-500/90 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-500 disabled:opacity-40"
        >
          {deleting ? "Deleting…" : "Delete Project Permanently"}
        </button>
      </div>
    </div>
  );
}
