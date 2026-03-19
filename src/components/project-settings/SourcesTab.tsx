"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { ProjectSource } from "@/types";
import ConfirmModal from "@/components/ConfirmModal";

const ENV_COLORS: Record<string, string> = {
  prod: "bg-destructive/15 text-destructive border-destructive/30",
  staging: "bg-[var(--status-warning)]/15 text-[var(--status-warning)] border-[var(--status-warning)]/30",
  dev: "bg-[var(--level-info)]/15 text-[var(--level-info)] border-[var(--level-info)]/30",
  test: "bg-[var(--level-debug)]/15 text-[var(--level-debug)] border-[var(--level-debug)]/30",
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
        <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}

      {sources.length === 0 ? (
        <div
          style={{
            backgroundColor: "#13161F",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 12,
            padding: 32,
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: 13, color: "#6B7280" }}>No sources yet.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "white" }}>Sources</h2>
          </div>
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
                        className={`rounded-full border px-2 py-0.5 text-xs font-medium ${ENV_COLORS[source.environment] ?? "bg-[var(--surface-input)] text-[var(--text-muted)] border-[var(--border)]"
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
                        className="text-xs text-destructive hover:text-destructive/70 transition-colors"
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
