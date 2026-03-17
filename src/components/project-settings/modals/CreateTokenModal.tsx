"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { ApiToken, ProjectSource } from "@/types";

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
  { id: "performance:write", label: "performance:write", description: "Emit performance metrics" },
  { id: "heartbeat:write", label: "heartbeat:write", description: "Emit heartbeat events" },
];

interface Props {
  projectName: string;
  sources: ProjectSource[];
  onCreated: (token: ApiToken) => void;
  onClose: () => void;
}

export default function CreateTokenModal({ projectName, sources, onCreated, onClose }: Props) {
  const [name, setName] = useState("");
  const [perms, setPerms] = useState<string[]>(["logs:write", "logs:read"]);
  const [source, setSource] = useState<string>("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdToken, setCreatedToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  function togglePerm(perm: string) {
    setPerms((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  }

  async function handleCreate() {
    if (!name.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const body: Record<string, unknown> = { name: name.trim(), permissions: perms };
      if (source) body.source = source;
      const res = await apiFetch(`/api/projects/${projectName}/tokens`, {
        method: "POST",
        body: JSON.stringify(body),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Failed to create token");
      setCreatedToken(d.token);
      onCreated({
        id: d.id,
        name: d.name,
        token_prefix: d.token_prefix,
        permissions: d.permissions,
        source_name: d.source_name ?? null,
        last_used_at: null,
        created_at: d.created_at,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create token");
    } finally {
      setCreating(false);
    }
  }

  async function copyToken() {
    if (!createdToken) return;
    await navigator.clipboard.writeText(createdToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onMouseDown={createdToken ? undefined : onClose}
    >
      <div
        className="w-full max-w-2xl rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] shadow-2xl max-h-[90vh] flex flex-col"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)] shrink-0">
          <h2 className="text-base font-semibold text-white">
            {createdToken ? "Token Created" : "Create API Token"}
          </h2>
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
        <div className="px-5 py-4 overflow-y-auto">
          {createdToken ? (
            /* One-time token display */
            <div className="space-y-4">
              <div className="rounded-lg border border-[var(--primary)] bg-[var(--primary-muted)] p-4 space-y-3">
                <div>
                  <p className="text-sm font-medium text-[var(--primary)]">Copy your token now!</p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    This token will not be shown again once you close this dialog.
                  </p>
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
            </div>
          ) : (
            /* Creation form */
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-[var(--text-muted)]">Token name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Production SDK"
                  autoFocus
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-input)] px-3 py-2 text-sm text-[var(--text-secondary)] focus:border-[var(--border-focus)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-muted)]"
                />
              </div>

              {sources.length > 0 && (
                <div className="space-y-1">
                  <label className="text-xs text-[var(--text-muted)]">
                    Bind to source{" "}
                    <span className="text-[var(--text-muted)]">(optional — required for SDK tokens)</span>
                  </label>
                  <select
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-input)] px-3 py-2 text-sm text-[var(--text-secondary)] focus:border-[var(--border-focus)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-muted)]"
                  >
                    <option value="">— No source binding —</option>
                    {sources.map((s) => (
                      <option key={s.name} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>
              )}

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
                        checked={perms.includes(perm.id)}
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

              {error && <p className="text-xs text-red-400">{error}</p>}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-5 py-4 border-t border-[var(--border)] shrink-0">
          {createdToken ? (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--surface)] transition-colors hover:bg-[var(--primary-hover)]"
            >
              Done
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-input)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreate}
                disabled={creating || !name.trim()}
                className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--surface)] transition-colors hover:bg-[var(--primary-hover)] disabled:opacity-50"
              >
                {creating ? "Creating…" : "Create Token"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
