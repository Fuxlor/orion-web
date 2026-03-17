"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { ApiToken, ProjectSource, User } from "@/types";
import ConfirmModal from "@/components/ConfirmModal";
import CreateTokenModal from "./modals/CreateTokenModal";
import RotateTokenModal from "./modals/RotateTokenModal";

interface Props {
  projectName: string;
  can: (perm: string) => boolean;
  user: User;
}

export default function ApiTokensTab({ projectName, can, user }: Props) {
  const [tokens, setTokens] = useState<ApiToken[]>([]);
  const [sources, setSources] = useState<ProjectSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<ApiToken | null>(null);
  const [rotateTarget, setRotateTarget] = useState<ApiToken | null>(null);

  useEffect(() => {
    Promise.all([
      apiFetch(`/api/projects/${projectName}/tokens`).then((r) => r.json()),
      apiFetch(`/api/projects/${projectName}/sources`).then((r) => r.json()),
    ])
      .then(([tokensData, sourcesData]) => {
        if (tokensData.ok) setTokens(tokensData.tokens);
        else setError(tokensData.error ?? "Failed to load tokens");
        if (Array.isArray(sourcesData)) setSources(sourcesData);
      })
      .catch(() => setError("Failed to load tokens"))
      .finally(() => setLoading(false));
  }, [projectName]);

  async function handleRevoke() {
    if (!revokeTarget) return;
    try {
      const res = await apiFetch(`/api/projects/${projectName}/tokens/${revokeTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Failed to revoke token");
      }
      setTokens((prev) => prev.filter((t) => t.id !== revokeTarget.id));
      setRevokeTarget(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to revoke token");
    }
  }

  if (loading) return <p className="text-sm text-[var(--text-muted)]">Loading tokens…</p>;

  return (
    <div className="space-y-6">
      {error && (
        <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}

      {/* Token list */}
      {tokens.length === 0 ? (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--border)]">
            <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">API Tokens</span>
            {can("tokens:manage") && (
              <button
                type="button"
                onClick={() => setCreateOpen(true)}
                className="rounded-lg bg-[var(--primary)] px-3 py-1.5 text-xs font-medium text-[var(--surface)] transition-colors hover:bg-[var(--primary-hover)]"
              >
                Create Token
              </button>
            )}
          </div>
          <div className="p-8 text-center">
            <p className="text-sm text-[var(--text-muted)]">No API tokens yet.</p>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--border)]">
            <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">API Tokens</span>
            {can("tokens:manage") && (
              <button
                type="button"
                onClick={() => setCreateOpen(true)}
                className="rounded-lg bg-[var(--primary)] px-3 py-1.5 text-xs font-medium text-[var(--surface)] transition-colors hover:bg-[var(--primary-hover)]"
              >
                Create Token
              </button>
            )}
          </div>
          {tokens.map((token) => (
            <div key={token.id} className="px-4 py-3 border-b border-[var(--border)] last:border-0 space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-[var(--text-secondary)]">{token.name}</p>
                    <code className="text-xs font-mono text-[var(--text-muted)] bg-[var(--surface-input)] px-2 py-0.5 rounded border border-[var(--border)]">
                      {token.token_prefix}…
                    </code>
                    {token.source_name && (
                      <span className="text-xs bg-[var(--primary-muted)] text-[var(--primary)] border border-[var(--primary)]/30 px-2 py-0.5 rounded-full font-mono">
                        {token.source_name}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {token.permissions.map((p) => (
                      <span
                        key={p}
                        className="rounded-full bg-[var(--surface-input)] border border-[var(--border)] px-2 py-0.5 text-xs text-[var(--text-muted)] font-mono"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
                {can("tokens:manage") && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setRotateTarget(token)}
                      className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
                    >
                      Rotate
                    </button>
                    <button
                      type="button"
                      onClick={() => setRevokeTarget(token)}
                      className="text-xs text-red-400 hover:text-red-300 transition-colors"
                    >
                      Revoke
                    </button>
                  </div>
                )}
              </div>
              <p className="text-xs text-[var(--text-muted)]">
                Created {new Date(token.created_at).toLocaleDateString()}
                {token.last_used_at && (
                  <> · Last used {new Date(token.last_used_at).toLocaleDateString()}</>
                )}
              </p>
            </div>
          ))}
        </div>
      )}

      {createOpen && (
        <CreateTokenModal
          projectName={projectName}
          sources={sources}
          onCreated={(token) => setTokens((prev) => [token, ...prev])}
          onClose={() => setCreateOpen(false)}
        />
      )}

      {revokeTarget && (
        <ConfirmModal
          title={`Revoke token "${revokeTarget.name}"?`}
          message="Any SDK or API using this token will get 401 Unauthorized errors immediately."
          confirmLabel="Revoke Token"
          onConfirm={handleRevoke}
          onCancel={() => setRevokeTarget(null)}
        />
      )}

      {rotateTarget && (
        <RotateTokenModal
          token={rotateTarget}
          projectName={projectName}
          user={user}
          onRotated={(newPrefix) => {
            setTokens((prev) =>
              prev.map((t) => t.id === rotateTarget.id ? { ...t, token_prefix: newPrefix } : t)
            );
          }}
          onClose={() => setRotateTarget(null)}
        />
      )}
    </div>
  );
}
