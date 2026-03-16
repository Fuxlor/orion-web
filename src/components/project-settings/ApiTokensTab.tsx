"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { ApiToken } from "@/types";
import ConfirmModal from "@/components/ConfirmModal";

const ALL_PERMISSIONS = [
  { id: "logs:write", label: "logs:write", description: "Emit logs via SDK" },
  { id: "logs:read", label: "logs:read", description: "Query / read logs" },
  { id: "sources:read", label: "sources:read", description: "View sources list" },
  { id: "sources:manage", label: "sources:manage", description: "Create / delete sources" },
  { id: "members:read", label: "members:read", description: "View member list" },
  { id: "members:manage", label: "members:manage", description: "Invite / remove members" },
  { id: "tokens:read", label: "tokens:read", description: "View API token list" },
  { id: "tokens:manage", label: "tokens:manage", description: "Create / revoke tokens" },
  { id: "settings:read", label: "settings:read", description: "View project settings" },
  { id: "settings:write", label: "settings:write", description: "Modify project settings" },
];

interface Props {
  projectName: string;
  can: (perm: string) => boolean;
}

export default function ApiTokensTab({ projectName, can }: Props) {
  const [tokens, setTokens] = useState<ApiToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create form
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPerms, setNewPerms] = useState<string[]>(["logs:write", "logs:read"]);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createdToken, setCreatedToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Revoke
  const [revokeTarget, setRevokeTarget] = useState<ApiToken | null>(null);

  useEffect(() => {
    apiFetch(`/api/projects/${projectName}/tokens`)
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) setTokens(d.tokens);
        else setError(d.error ?? "Failed to load tokens");
      })
      .catch(() => setError("Failed to load tokens"))
      .finally(() => setLoading(false));
  }, [projectName]);

  function togglePerm(perm: string) {
    setNewPerms((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  }

  async function handleCreate() {
    if (!newName.trim()) return;
    setCreating(true);
    setCreateError(null);
    try {
      const res = await apiFetch(`/api/projects/${projectName}/tokens`, {
        method: "POST",
        body: JSON.stringify({ name: newName.trim(), permissions: newPerms }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Failed to create token");
      setCreatedToken(d.token);
      // Add to list without the full token
      setTokens((prev) => [
        {
          id: d.id,
          name: d.name,
          token_prefix: d.token_prefix,
          permissions: d.permissions,
          last_used_at: null,
          created_at: d.created_at,
        },
        ...prev,
      ]);
      setNewName("");
      setNewPerms(["logs:write", "logs:read"]);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Failed to create token");
    } finally {
      setCreating(false);
    }
  }

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

  async function copyToken() {
    if (!createdToken) return;
    await navigator.clipboard.writeText(createdToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) return <p className="text-sm text-[var(--text-muted)]">Loading tokens…</p>;

  return (
    <div className="space-y-6">
      {error && (
        <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}

      {/* Created token banner */}
      {createdToken && (
        <div className="rounded-lg border border-[var(--primary)] bg-[var(--primary-muted)] p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-medium text-[var(--primary)]">Token created — copy it now!</p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                This token will not be shown again.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCreatedToken(null)}
              className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors text-lg leading-none"
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-lg bg-[var(--surface-input)] border border-[var(--border)] px-3 py-2 text-xs font-mono text-[var(--text-secondary)] break-all">
              {createdToken}
            </code>
            <button
              type="button"
              onClick={copyToken}
              className="shrink-0 rounded-lg border border-[var(--border)] px-3 py-2 text-xs text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-input)]"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
      )}

      {/* Token list */}
      {tokens.length === 0 ? (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] p-8 text-center">
          <p className="text-sm text-[var(--text-muted)]">No API tokens yet.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] overflow-hidden">
          {tokens.map((token) => (
            <div key={token.id} className="px-4 py-3 border-b border-[var(--border)] last:border-0 space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-[var(--text-secondary)]">{token.name}</p>
                    <code className="text-xs font-mono text-[var(--text-muted)] bg-[var(--surface-input)] px-2 py-0.5 rounded border border-[var(--border)]">
                      {token.token_prefix}…
                    </code>
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
                  <button
                    type="button"
                    onClick={() => setRevokeTarget(token)}
                    className="shrink-0 text-xs text-red-400 hover:text-red-300 transition-colors"
                  >
                    Revoke
                  </button>
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

      {/* Create token form */}
      {can("tokens:manage") && (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] p-5 space-y-4">
          <h2 className="text-sm font-medium text-[var(--text-secondary)]">Create API Token</h2>

          <div className="space-y-1">
            <label className="text-xs text-[var(--text-muted)]">Token name</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Production SDK"
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-input)] px-3 py-2 text-sm text-[var(--text-secondary)] focus:border-[var(--border-focus)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-muted)]"
            />
          </div>

          <div className="space-y-2">
            <p className="text-xs text-[var(--text-muted)]">Permissions</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {ALL_PERMISSIONS.map((perm) => (
                <label
                  key={perm.id}
                  className="flex items-start gap-2.5 cursor-pointer rounded-lg border border-[var(--border)] bg-[var(--surface-input)] px-3 py-2.5 hover:border-[var(--border-focus)] transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={newPerms.includes(perm.id)}
                    onChange={() => togglePerm(perm.id)}
                    className="mt-0.5 accent-[var(--primary)]"
                  />
                  <div>
                    <p className="text-xs font-mono text-[var(--text-secondary)]">{perm.label}</p>
                    <p className="text-xs text-[var(--text-muted)]">{perm.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {createError && <p className="text-xs text-red-400">{createError}</p>}

          <button
            type="button"
            onClick={handleCreate}
            disabled={creating || !newName.trim()}
            className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--surface)] transition-colors hover:bg-[var(--primary-hover)] disabled:opacity-50"
          >
            {creating ? "Creating…" : "Create Token"}
          </button>
        </div>
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
    </div>
  );
}
