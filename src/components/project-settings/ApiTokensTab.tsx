"use client";

import { useState, useEffect } from "react";
import { Copy, Check, Trash2, RefreshCw, Plus } from "lucide-react";
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
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    setError(null);
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
    setError(null);
    if (!revokeTarget) return;
    try {
      const res = await apiFetch(`/api/projects/${projectName}/tokens/${revokeTarget.id}`, {
        method: "DELETE",
      }, true);
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Failed to revoke token");
      }
      setTokens((prev) => prev.filter((t) => t.id !== revokeTarget.id));
      setRevokeTarget(null);
    } catch (err) {
      setError(process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : (err instanceof Error ? err.message : "Failed to revoke token"));
    }
  }

  function handleCopy(token: ApiToken) {
    navigator.clipboard.writeText(token.token_prefix).catch(() => { });
    setCopiedId(token.id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  if (loading) return <p className="text-sm text-[var(--text-muted)]">Loading tokens…</p>;

  return (
    <div className="space-y-4">
      {error && (
        <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}

      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <p style={{ fontSize: 13, color: "#6B7280" }}>
          {tokens.length} active token{tokens.length !== 1 ? "s" : ""}
        </p>
        {can("tokens:manage") && (
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 16px",
              borderRadius: 8,
              border: "none",
              backgroundColor: "#02F194",
              color: "#0D0F16",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            <Plus size={13} /> Generate token
          </button>
        )}
      </div>

      {/* Empty state */}
      {tokens.length === 0 && (
        <div
          style={{
            backgroundColor: "#13161F",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 12,
            padding: 24,
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: 13, color: "#6B7280" }}>No API tokens yet.</p>
        </div>
      )}

      {/* Token cards */}
      {tokens.map((token) => (
        <div
          key={token.id}
          style={{
            backgroundColor: "#13161F",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 12,
            padding: 24,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: "white", marginBottom: 6 }}>
                {token.name}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <code
                  style={{
                    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                    fontSize: 12,
                    color: "#9BA3AF",
                    backgroundColor: "rgba(255,255,255,0.04)",
                    padding: "4px 10px",
                    borderRadius: 6,
                  }}
                >
                  {token.token_prefix}…
                </code>
                {token.source_name && (
                  <span
                    style={{
                      fontSize: 11,
                      backgroundColor: "rgba(2,241,148,0.08)",
                      color: "#02F194",
                      border: "1px solid rgba(2,241,148,0.3)",
                      padding: "2px 8px",
                      borderRadius: 20,
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    {token.source_name}
                  </span>
                )}
              </div>
            </div>

            {can("tokens:manage") && (
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                <button
                  type="button"
                  title="Copy prefix"
                  onClick={() => handleCopy(token)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 7,
                    border: `1px solid ${copiedId === token.id ? "rgba(2,241,148,0.3)" : "rgba(255,255,255,0.08)"}`,
                    backgroundColor: copiedId === token.id ? "rgba(2,241,148,0.08)" : "transparent",
                    color: copiedId === token.id ? "#02F194" : "#6B7280",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.15s",
                  }}
                >
                  {copiedId === token.id ? <Check size={13} /> : <Copy size={13} />}
                </button>
                <button
                  type="button"
                  title="Rotate token"
                  onClick={() => setRotateTarget(token)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 7,
                    border: "1px solid rgba(255,255,255,0.08)",
                    backgroundColor: "transparent",
                    color: "#6B7280",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <RefreshCw size={13} />
                </button>
                <button
                  type="button"
                  title="Revoke token"
                  onClick={() => setRevokeTarget(token)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 7,
                    border: "1px solid rgba(255,255,255,0.08)",
                    backgroundColor: "transparent",
                    color: "#EF4444",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            )}
          </div>

          {token.permissions?.length > 0 && (
            <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 4 }}>
              {token.permissions.map((p) => (
                <span
                  key={p}
                  style={{
                    fontSize: 10,
                    fontFamily: "'JetBrains Mono', monospace",
                    backgroundColor: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    color: "#6B7280",
                    padding: "2px 8px",
                    borderRadius: 4,
                  }}
                >
                  {p}
                </span>
              ))}
            </div>
          )}

          <div style={{ marginTop: 12, display: "flex", gap: 20, fontSize: 11, color: "#4B5563" }}>
            <span>Created {new Date(token.created_at).toLocaleDateString()}</span>
            {token.last_used_at && (
              <span>Last used {new Date(token.last_used_at).toLocaleDateString()}</span>
            )}
          </div>
        </div>
      ))}

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
