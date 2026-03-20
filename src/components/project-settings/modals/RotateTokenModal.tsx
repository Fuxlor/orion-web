"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { ApiToken, User } from "@/types";
import VerifyIdentityModal from "@/components/VerifyIdentityModal";

interface Props {
  token: ApiToken;
  projectName: string;
  user: User;
  onRotated: (newPrefix: string) => void;
  onClose: () => void;
}

export default function RotateTokenModal({ token, projectName, user, onRotated, onClose }: Props) {
  const [actionToken, setActionToken] = useState<string | null>(null);
  const [newToken, setNewToken] = useState<string | null>(null);
  const [rotating, setRotating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleVerified(at: string) {
    setActionToken(at);
    setRotating(true);
    setError(null);
    try {
      const res = await apiFetch(`/api/projects/${projectName}/tokens/${token.id}/rotate`, {
        method: "POST",
        body: JSON.stringify({ actionToken: at }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Failed to rotate token");
      setNewToken(d.token);
      onRotated(d.token_prefix);
    } catch (err) {
      setError(process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : (err instanceof Error ? err.message : "Failed to rotate token"));
      setActionToken(null);
    } finally {
      setRotating(false);
    }
  }

  async function copyToken() {
    if (!newToken) return;
    await navigator.clipboard.writeText(newToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // Step 1: identity verification
  if (!actionToken && !rotating) {
    return (
      <VerifyIdentityModal
        user={user}
        onVerified={handleVerified}
        onClose={onClose}
      />
    );
  }

  // Step 2: rotating in progress
  if (rotating) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="w-full max-w-sm rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-2xl px-5 py-8 text-center">
          <p className="text-sm text-[var(--text-muted)]">Rotating token…</p>
        </div>
      </div>
    );
  }

  // Step 3: error
  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="w-full max-w-sm rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-2xl">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
            <h2 className="text-base font-semibold text-white">Rotation Failed</h2>
            <button type="button" onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] text-xl leading-none">×</button>
          </div>
          <div className="px-5 py-4 space-y-4">
            <p className="text-sm text-red-400">{error}</p>
            <div className="flex justify-end">
              <button type="button" onClick={onClose} className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--surface-input)]">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 4: new token display
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <div
        className="w-full max-w-md rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
          <h2 className="text-base font-semibold text-white">Token Rotated</h2>
        </div>
        <div className="px-5 py-4 space-y-4">
          <div className="rounded-lg border border-[var(--primary)] bg-[var(--primary-muted)] p-4 space-y-3">
            <div>
              <p className="text-sm font-medium text-[var(--primary)]">Copy your new token now!</p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                The old token is now invalid. This new token will not be shown again.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded-lg bg-[var(--surface-input)] border border-[var(--border)] px-3 py-2 text-xs font-mono text-[var(--text-secondary)] break-all">
                {newToken}
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
        <div className="flex justify-end px-5 py-4 border-t border-[var(--border)]">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--surface)] transition-colors hover:bg-[var(--primary-hover)]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
