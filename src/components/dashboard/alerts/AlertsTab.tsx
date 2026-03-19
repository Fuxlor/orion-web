"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { Alert } from "@/types";
import SilenceMenu from "./SilenceMenu";
import ConfirmModal from "@/components/ConfirmModal";

const LEVEL_COLORS: Record<string, string> = {
  error: "bg-[var(--level-error-bg)] text-[var(--level-error)]",
  warn: "bg-[var(--level-warn-bg)] text-[var(--level-warn)]",
  info: "bg-[var(--level-info-bg)] text-[var(--level-info)]",
  debug: "bg-[var(--level-debug-bg)] text-[var(--level-debug)]",
  verbose: "bg-[var(--level-verbose-bg)] text-[var(--level-verbose)]",
  trace: "bg-[var(--level-trace-bg)] text-[var(--level-trace)]",
};

const STATUS_COLORS: Record<string, string> = {
  active: "bg-[var(--primary-muted)] text-[var(--primary)]",
  silenced: "bg-[var(--level-trace-bg)] text-[var(--text-muted)]",
  resolved: "bg-[var(--status-success-bg)] text-[var(--status-success)]",
};

const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  silenced: "Silenced",
  resolved: "Resolved",
};

interface AlertsTabProps {
  projectName: string;
  alerts: Alert[];
  loading: boolean;
  onRefresh: () => void;
}

export default function AlertsTab({ projectName, alerts, loading, onRefresh }: AlertsTabProps) {
  const [statusFilter, setStatusFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [silenceOpenId, setSilenceOpenId] = useState<number | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  const filtered = alerts.filter((a) => {
    if (statusFilter && a.status !== statusFilter) return false;
    if (levelFilter && a.level !== levelFilter) return false;
    return true;
  });

  async function handleSilence(id: number, duration: "2h" | "4h" | "12h" | null) {
    await apiFetch(`/api/projects/${projectName}/alerts/${id}/silence`, {
      method: "POST",
      body: JSON.stringify({ duration }),
    });
    onRefresh();
  }

  async function handleResolve(id: number) {
    await apiFetch(`/api/projects/${projectName}/alerts/${id}/resolve`, { method: "POST" }, true);
    onRefresh();
  }

  async function handleDelete(id: number) {
    await apiFetch(`/api/projects/${projectName}/alerts/${id}`, { method: "DELETE" }, true);
    setDeleteTargetId(null);
    onRefresh();
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="cursor-pointer rounded-lg border border-[var(--border)] bg-[var(--surface-input)] px-3 py-1.5 text-sm text-[var(--text-secondary)] focus:border-[var(--border-focus)] focus:outline-none"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="silenced">Silenced</option>
          <option value="resolved">Resolved</option>
        </select>
        <select
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
          className="cursor-pointer rounded-lg border border-[var(--border)] bg-[var(--surface-input)] px-3 py-1.5 text-sm text-[var(--text-secondary)] focus:border-[var(--border-focus)] focus:outline-none"
        >
          <option value="">All levels</option>
          {["error", "warn", "info", "debug", "verbose", "trace"].map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-sm text-[var(--text-muted)]">Loading…</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-8 text-center">
          <p className="text-sm text-[var(--text-muted)]">No alerts yet</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-[var(--border)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--card)]">
                {["Level", "Message", "Source", "Server", "Triggered at", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] bg-[var(--surface)]">
              {filtered.map((alert) => (
                <tr key={alert.id} className="transition-colors hover:bg-[var(--card)]">
                  {/* Level */}
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${LEVEL_COLORS[alert.level] ?? "text-[var(--text-muted)]"}`}>
                      {alert.level}
                    </span>
                  </td>

                  {/* Message */}
                  <td className="max-w-xs px-4 py-3">
                    <span className="truncate text-[var(--text-secondary)]">{alert.message ?? "—"}</span>
                  </td>

                  {/* Source */}
                  <td className="px-4 py-3 text-[var(--text-muted)]">
                    {alert.source_name ?? "—"}
                  </td>

                  {/* Server */}
                  <td className="px-4 py-3 text-[var(--text-muted)]">
                    {alert.server_hostname ?? "—"}
                  </td>

                  {/* Date */}
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-[var(--text-muted)]">
                    {new Date(alert.created_at).toLocaleString("en-US", { dateStyle: "short", timeStyle: "short" })}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[alert.status]}`}>
                      {STATUS_LABELS[alert.status]}
                    </span>
                    {alert.status === "silenced" && alert.silenced_until && (
                      <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                        until {new Date(alert.silenced_until).toLocaleString("en-US", { dateStyle: "short", timeStyle: "short" })}
                      </p>
                    )}
                    {alert.status === "resolved" && alert.resolved_by_pseudo && (
                      <p className="mt-0.5 text-xs text-[var(--text-muted)]">by {alert.resolved_by_pseudo}</p>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="relative flex items-center gap-1">
                      {alert.status !== "resolved" && (
                        <>
                          {/* Silence */}
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setSilenceOpenId(silenceOpenId === alert.id ? null : alert.id)}
                              className="cursor-pointer rounded px-2 py-1 text-xs text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-input)] hover:text-white"
                            >
                              {alert.status === "silenced" ? "Re-silence" : "Silence"}
                            </button>
                            {silenceOpenId === alert.id && (
                              <SilenceMenu
                                onSelect={(d) => handleSilence(alert.id, d)}
                                onClose={() => setSilenceOpenId(null)}
                              />
                            )}
                          </div>

                          {/* Resolve */}
                          <button
                            type="button"
                            onClick={() => handleResolve(alert.id)}
                            className="cursor-pointer rounded px-2 py-1 text-xs text-[var(--primary)] transition-colors hover:bg-[var(--primary-muted)]"
                          >
                            Resolve
                          </button>
                        </>
                      )}

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => setDeleteTargetId(alert.id)}
                        className="cursor-pointer rounded p-1.5 text-[var(--text-muted)] transition-colors hover:bg-destructive/10 hover:text-destructive"
                        title="Delete"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14H6L5 6" />
                          <path d="M10 11v6M14 11v6" />
                          <path d="M9 6V4h6v2" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteTargetId !== null && (
        <ConfirmModal
          title="Delete alert"
          message="This alert will be permanently deleted and cannot be recovered."
          onConfirm={() => handleDelete(deleteTargetId)}
          onCancel={() => setDeleteTargetId(null)}
        />
      )}
    </div>
  );
}
