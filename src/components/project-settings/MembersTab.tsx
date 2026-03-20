"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { ProjectMember } from "@/types";
import ConfirmModal from "@/components/ConfirmModal";
import InviteMemberModal from "./modals/InviteMemberModal";

interface Props {
  projectName: string;
  can: (perm: string) => boolean;
  currentUserId?: number;
}

function MemberAvatar({ pseudo, avatarUrl }: { pseudo: string; avatarUrl?: string | null }) {
  if (avatarUrl) {
    return (
      <img src={avatarUrl} alt={pseudo} className="w-8 h-8 rounded-full object-cover" />
    );
  }
  return (
    <div className="w-8 h-8 rounded-full bg-[var(--primary-muted)] flex items-center justify-center text-xs font-semibold text-[var(--primary)] shrink-0">
      {pseudo.charAt(0).toUpperCase()}
    </div>
  );
}

export default function MembersTab({ projectName, can, currentUserId }: Props) {
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<ProjectMember | null>(null);
  const [transferTarget, setTransferTarget] = useState<ProjectMember | null>(null);

  useEffect(() => {
    apiFetch(`/api/projects/${projectName}/members`)
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) setMembers(d.members);
        else setError(d.error ?? "Failed to load members");
      })
      .catch(() => setError("Failed to load members"))
      .finally(() => setLoading(false));
  }, [projectName]);

  async function handleRemove() {
    if (!removeTarget?.id) return;
    try {
      const res = await apiFetch(`/api/projects/${projectName}/members/${removeTarget.id}`, {
        method: "DELETE",
      }, true);
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Failed to remove");
      }
      setMembers((prev) => prev.filter((m) => m.id !== removeTarget.id));
      setRemoveTarget(null);
    } catch (err) {
      setError(process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : (err instanceof Error ? err.message : "Failed to remove member"));
    }
  }

  async function handleRoleChange(member: ProjectMember, newRole: string) {
    if (!member.id) return;
    try {
      const res = await apiFetch(`/api/projects/${projectName}/members/${member.id}`, {
        method: "PATCH",
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Failed to update role");
      }
      setMembers((prev) => prev.map((m) => (m.id === member.id ? { ...m, role: newRole } : m)));
    } catch (err) {
      setError(process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : (err instanceof Error ? err.message : "Failed to update role"));
    }
  }

  async function handleTransferOwnership() {
    if (!transferTarget) return;
    try {
      const res = await apiFetch(`/api/projects/${projectName}/members/transfer-ownership`, {
        method: "POST",
        body: JSON.stringify({ userId: transferTarget.user_id }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Failed to transfer ownership");
      }
      const refreshRes = await apiFetch(`/api/projects/${projectName}/members`);
      const refreshData = await refreshRes.json();
      if (refreshData.ok) setMembers(refreshData.members);
      setTransferTarget(null);
    } catch (err) {
      setError(process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : (err instanceof Error ? err.message : "Failed to transfer ownership"));
    }
  }

  if (loading) return <p className="text-sm text-[var(--text-muted)]">Loading members…</p>;

  return (
    <div className="space-y-6">
      {error && (
        <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}

      {/* Members list */}
      <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "white" }}>Members</h2>
          {can("members:manage") && (
            <button
              type="button"
              onClick={() => setInviteOpen(true)}
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
              Invite Member
            </button>
          )}
        </div>
        {members.map((member) => (
          <div
            key={member.user_id}
            className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border)] last:border-0"
          >
            <MemberAvatar pseudo={member.pseudo} avatarUrl={member.avatar_url} />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[var(--text-secondary)] font-medium truncate">{member.pseudo}</p>
              <p className="text-xs text-[var(--text-muted)] truncate">{member.email}</p>
            </div>

            {/* Role badge / selector */}
            {member.role === "owner" || !can("members:manage") ? (
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${member.role === "owner"
                    ? "bg-[var(--primary-muted)] text-[var(--primary)]"
                    : "bg-[var(--surface-input)] text-[var(--text-muted)] border border-[var(--border)]"
                  }`}
              >
                {member.role}
              </span>
            ) : (
              <select
                value={member.role}
                onChange={(e) => handleRoleChange(member, e.target.value)}
                className="rounded-lg border border-[var(--border)] bg-[var(--surface-input)] px-2 py-1 text-xs text-[var(--text-secondary)] focus:outline-none"
              >
                <option value="member">member</option>
                <option value="owner">owner</option>
              </select>
            )}

            {/* Actions (owner-only, not on own row) */}
            {can("members:manage") && member.role !== "owner" && member.user_id !== currentUserId && (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setTransferTarget(member)}
                  className="text-xs text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors"
                >
                  Transfer ownership
                </button>
                <button
                  type="button"
                  onClick={() => setRemoveTarget(member)}
                  className="text-xs text-red-400 hover:text-red-300 transition-colors"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {inviteOpen && (
        <InviteMemberModal
          projectName={projectName}
          onInvited={(member) => setMembers((prev) => [...prev, member])}
          onClose={() => setInviteOpen(false)}
        />
      )}

      {removeTarget && (
        <ConfirmModal
          title={`Remove ${removeTarget.pseudo}?`}
          message={`${removeTarget.pseudo} will lose access to this project.`}
          confirmLabel="Remove Member"
          onConfirm={handleRemove}
          onCancel={() => setRemoveTarget(null)}
        />
      )}

      {transferTarget && (
        <ConfirmModal
          title={`Transfer ownership to ${transferTarget.pseudo}?`}
          message={`You will become a regular member and ${transferTarget.pseudo} will become the new owner. This cannot be undone unless they transfer it back.`}
          confirmLabel="Transfer Ownership"
          onConfirm={handleTransferOwnership}
          onCancel={() => setTransferTarget(null)}
        />
      )}
    </div>
  );
}
