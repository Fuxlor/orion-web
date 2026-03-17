"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { ProjectSettings, User } from "@/types";
import DangerConfirmModal from "./modals/DangerConfirmModal";

interface Props {
  projectName: string;
  settings: ProjectSettings;
  user: User;
}

export default function DangerZoneTab({ projectName, user }: Props) {
  const router = useRouter();
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [archiveError, setArchiveError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleArchiveConfirmed(actionToken: string) {
    setArchiveOpen(false);
    setArchiving(true);
    setArchiveError(null);
    try {
      const res = await apiFetch(`/api/projects/${projectName}/archive`, {
        method: "PATCH",
        body: JSON.stringify({ actionToken }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Failed to archive");
      router.push("/dashboard");
    } catch (err) {
      setArchiveError(err instanceof Error ? err.message : "Failed to archive project");
    } finally {
      setArchiving(false);
    }
  }

  async function handleDeleteConfirmed(actionToken: string) {
    setDeleteOpen(false);
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await apiFetch(`/api/projects/${projectName}`, {
        method: "DELETE",
        body: JSON.stringify({ confirmName: projectName, actionToken }),
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
          onClick={() => setArchiveOpen(true)}
          disabled={archiving}
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
        {deleteError && <p className="text-xs text-red-400">{deleteError}</p>}
        <button
          type="button"
          onClick={() => setDeleteOpen(true)}
          disabled={deleting}
          className="rounded-lg bg-red-500/90 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-500 disabled:opacity-40"
        >
          {deleting ? "Deleting…" : "Delete Project Permanently"}
        </button>
      </div>

      {archiveOpen && (
        <DangerConfirmModal
          variant="archive"
          projectName={projectName}
          user={user}
          onConfirm={handleArchiveConfirmed}
          onClose={() => setArchiveOpen(false)}
        />
      )}

      {deleteOpen && (
        <DangerConfirmModal
          variant="delete"
          projectName={projectName}
          user={user}
          onConfirm={handleDeleteConfirmed}
          onClose={() => setDeleteOpen(false)}
        />
      )}
    </div>
  );
}
