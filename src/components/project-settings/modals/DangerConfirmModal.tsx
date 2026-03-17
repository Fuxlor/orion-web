"use client";

import { useState, useEffect } from "react";
import { User } from "@/types";
import VerifyIdentityModal from "@/components/VerifyIdentityModal";

interface Props {
  variant: "archive" | "delete";
  projectName: string;
  user: User;
  onConfirm: (actionToken: string) => void;
  onClose: () => void;
}

export default function DangerConfirmModal({ variant, projectName, user, onConfirm, onClose }: Props) {
  const [confirmName, setConfirmName] = useState("");
  const [showVerify, setShowVerify] = useState(variant === "archive");

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  function handleVerified(actionToken: string) {
    onConfirm(actionToken);
  }

  // For delete: first confirm project name, then verify identity
  if (showVerify) {
    return (
      <VerifyIdentityModal
        user={user}
        onVerified={handleVerified}
        onClose={onClose}
      />
    );
  }

  // Delete variant: project name confirmation step
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <div
        className="w-full max-w-sm rounded-xl border border-red-500/30 bg-[var(--surface-elevated)] shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
          <h2 className="text-base font-semibold text-red-400">Delete Project</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors text-xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="px-5 py-4 space-y-4">
          <p className="text-sm text-[var(--text-muted)]">
            Permanently destroys the project and all associated data. This action{" "}
            <strong className="text-[var(--text-secondary)]">cannot be undone</strong>.
          </p>
          <div className="space-y-1">
            <label className="text-xs text-[var(--text-muted)]">
              Type <span className="font-mono text-[var(--text-secondary)]">{projectName}</span> to continue
            </label>
            <input
              type="text"
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              placeholder={projectName}
              autoFocus
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-input)] px-3 py-2 text-sm text-[var(--text-secondary)] focus:border-red-500/60 focus:outline-none font-mono"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-input)]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => setShowVerify(true)}
              disabled={confirmName !== projectName}
              className="rounded-lg bg-red-500/90 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-500 disabled:opacity-40"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
