'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import ConfirmModal from '@/components/ConfirmModal';

interface ProjectRow {
  id: number;
  name: string;
  label: string;
  created_at: string;
  archived: boolean;
  archived_at: string | null;
  role: 'owner' | 'member';
}

export default function ProjectsTab() {
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [archiveTarget, setArchiveTarget] = useState<ProjectRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProjectRow | null>(null);
  const [confirmName, setConfirmName] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    apiFetch('/api/projects/settings/list')
      .then(r => r.json())
      .then(d => setProjects(d.projects ?? []))
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  async function archive(project: ProjectRow) {
    setActionLoading(project.id);
    try {
      const res = await apiFetch(`/api/projects/${project.name}/archive`, { method: 'PATCH' });
      if (res.ok) {
        setProjects(prev => prev.map(p =>
          p.id === project.id ? { ...p, archived: true, archived_at: new Date().toISOString() } : p
        ));
      }
    } finally {
      setActionLoading(null);
    }
  }

  async function restore(project: ProjectRow) {
    setActionLoading(project.id);
    try {
      const res = await apiFetch(`/api/projects/${project.name}/restore`, { method: 'PATCH' });
      if (res.ok) {
        setProjects(prev => prev.map(p =>
          p.id === project.id ? { ...p, archived: false, archived_at: null } : p
        ));
      }
    } finally {
      setActionLoading(null);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleteError(null);
    setActionLoading(deleteTarget.id);
    try {
      const res = await apiFetch(`/api/projects/${deleteTarget.name}`, {
        method: 'DELETE',
        body: JSON.stringify({ confirmName }),
      });
      if (res.ok || res.status === 204) {
        setProjects(prev => prev.filter(p => p.id !== deleteTarget.id));
        setDeleteTarget(null);
        setConfirmName('');
      } else {
        const data = await res.json();
        setDeleteError(data.error || 'Failed to delete project');
      }
    } catch {
      setDeleteError('Network error');
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) return <p className="text-sm text-[var(--text-muted)]">Loading projects…</p>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-[var(--text-secondary)] mb-1">Your projects</h2>
        <p className="text-sm text-[var(--text-muted)]">
          Archive projects to hide them temporarily, or delete them permanently.
        </p>
      </div>

      {projects.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)]">No projects found.</p>
      ) : (
        <div className="space-y-2">
          {projects.map(project => (
            <div
              key={project.id}
              className="flex items-center justify-between p-4 bg-[var(--card)] border border-[var(--border)] rounded-lg"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-[var(--text-secondary)] truncate">{project.label}</p>
                  <span className="text-xs text-[var(--text-muted)] font-mono">{project.name}</span>
                  {project.archived && (
                    <span className="text-xs text-[var(--status-warning)] bg-[var(--status-warning)]/10 px-2 py-0.5 rounded-full">Archived</span>
                  )}
                  <span className="text-xs text-[var(--text-muted)] bg-[var(--surface-input)] px-2 py-0.5 rounded-full capitalize">
                    {project.role}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-muted)]">
                  Created {new Date(project.created_at).toLocaleDateString()}
                  {project.archived_at && ` · Archived ${new Date(project.archived_at).toLocaleDateString()}`}
                </p>
              </div>

              {project.role === 'owner' && (
                <div className="flex items-center gap-3 ml-4 shrink-0">
                  {project.archived ? (
                    <button
                      type="button"
                      onClick={() => restore(project)}
                      disabled={actionLoading === project.id}
                      className="cursor-pointer text-sm text-[var(--primary)] hover:opacity-80 transition-opacity"
                    >
                      Restore
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setArchiveTarget(project)}
                      disabled={actionLoading === project.id}
                      className="cursor-pointer text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
                    >
                      Archive
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => { setDeleteTarget(project); setConfirmName(''); setDeleteError(null); }}
                    className="cursor-pointer text-sm text-destructive hover:text-destructive/70 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {archiveTarget && (
        <ConfirmModal
          title="Archive project"
          message={`"${archiveTarget.label}" will be hidden from your dashboard. You can restore it at any time.`}
          confirmLabel="Archive"
          onConfirm={() => { archive(archiveTarget); setArchiveTarget(null); }}
          onCancel={() => setArchiveTarget(null)}
        />
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-base font-semibold text-[var(--text-secondary)] mb-2">Delete project</h3>
            <p className="text-sm text-[var(--text-muted)] mb-4">
              This will permanently delete <strong className="text-[var(--text-secondary)]">{deleteTarget.label}</strong> and all its data.
              This action cannot be undone.
            </p>
            <p className="text-sm text-[var(--text-muted)] mb-2">
              Type <strong className="text-[var(--text-secondary)] font-mono">{deleteTarget.name}</strong> to confirm:
            </p>
            <input
              type="text"
              value={confirmName}
              onChange={e => setConfirmName(e.target.value)}
              placeholder={deleteTarget.name}
              className="w-full mb-4"
              autoFocus
            />
            {deleteError && <p className="text-sm text-destructive mb-3">{deleteError}</p>}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={confirmDelete}
                disabled={confirmName !== deleteTarget.name || actionLoading === deleteTarget.id}
                className="flex-1 px-4 py-2 bg-destructive hover:bg-destructive/90 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
              >
                {actionLoading === deleteTarget.id ? 'Deleting…' : 'Delete permanently'}
              </button>
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 border border-[var(--border)] rounded-lg text-sm text-[var(--text-muted)] hover:border-[var(--primary)] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
