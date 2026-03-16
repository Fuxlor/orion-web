"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { ProjectSource } from "@/types";
import ConfirmModal from "@/components/ConfirmModal";

const ENV_COLORS: Record<string, string> = {
  prod: "bg-red-500/15 text-red-400 border-red-500/30",
  staging: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  dev: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  test: "bg-purple-500/15 text-purple-400 border-purple-500/30",
};

interface Props {
  projectName: string;
  can: (perm: string) => boolean;
}

export default function SourcesTab({ projectName, can }: Props) {
  const [sources, setSources] = useState<ProjectSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProjectSource | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    apiFetch(`/api/projects/${projectName}/settings/sources`)
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) setSources(d.sources);
        else setError(d.error ?? "Failed to load sources");
      })
      .catch(() => setError("Failed to load sources"))
      .finally(() => setLoading(false));
  }, [projectName]);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await apiFetch(`/api/projects/${projectName}/sources/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Failed to delete");
      }
      setSources((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete source");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) return <p className="text-sm text-[var(--text-muted)]">Loading sources…</p>;

  return (
    <div className="space-y-4">
      {error && (
        <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}

      {sources.length === 0 ? (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] p-8 text-center">
          <p className="text-sm text-[var(--text-muted)]">No sources yet.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs text-[var(--text-muted)]">
                <th className="px-4 py-3 text-left font-medium">Name</th>
                <th className="px-4 py-3 text-left font-medium">Environment</th>
                <th className="px-4 py-3 text-left font-medium">Server</th>
                <th className="px-4 py-3 text-left font-medium">Created</th>
                {can("sources:manage") && <th className="px-4 py-3" />}
              </tr>
            </thead>
            <tbody>
              {sources.map((source) => (
                <tr key={source.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="px-4 py-3 font-mono text-[var(--text-secondary)]">{source.name}</td>
                  <td className="px-4 py-3">
                    {source.environment ? (
                      <span
                        className={`rounded-full border px-2 py-0.5 text-xs font-medium ${
                          ENV_COLORS[source.environment] ?? "bg-[var(--surface-input)] text-[var(--text-muted)] border-[var(--border)]"
                        }`}
                      >
                        {source.environment}
                      </span>
                    ) : (
                      <span className="text-[var(--text-muted)]">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[var(--text-muted)]">
                    {source.server_hostname ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-[var(--text-muted)]">
                    {new Date(source.created_at).toLocaleDateString()}
                  </td>
                  {can("sources:manage") && (
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(source)}
                        className="text-xs text-red-400 hover:text-red-300 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {deleteTarget && (
        <ConfirmModal
          title={`Delete source "${deleteTarget.name}"?`}
          message="This will permanently delete the source and all its logs. This action cannot be undone."
          confirmLabel={deleting ? "Deleting…" : "Delete Source"}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
