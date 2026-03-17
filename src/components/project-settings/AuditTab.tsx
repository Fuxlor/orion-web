"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";

interface AuditLog {
  id: number;
  action: string;
  details: Record<string, unknown> | null;
  ip: string | null;
  created_at: string;
  pseudo: string | null;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
}

const ACTION_LABELS: Record<string, string> = {
  token_created: "Token created",
  token_revoked: "Token revoked",
  member_invited: "Member invited",
  member_removed: "Member removed",
  source_deleted: "Source deleted",
  settings_updated: "Settings updated",
  alert_resolved: "Alert resolved",
};

const ACTION_COLORS: Record<string, string> = {
  token_created: "text-[var(--primary)]",
  token_revoked: "text-red-400",
  member_invited: "text-blue-400",
  member_removed: "text-orange-400",
  source_deleted: "text-red-400",
  settings_updated: "text-yellow-400",
  alert_resolved: "text-green-400",
};

interface Props {
  projectName: string;
}

export default function AuditTab({ projectName }: Props) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [filterAction, setFilterAction] = useState("");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");

  function fetchLogs(p = 1) {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({ page: String(p), limit: "25" });
    if (filterAction) params.set("action", filterAction);
    if (filterFrom) params.set("from", filterFrom);
    if (filterTo) params.set("to", filterTo);

    apiFetch(`/api/projects/${projectName}/settings/audit?${params}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) {
          setLogs(d.logs);
          setTotal(d.total);
          setPage(d.page);
          setTotalPages(d.totalPages);
        } else {
          setError(d.error ?? "Failed to load audit logs");
        }
      })
      .catch(() => setError("Failed to load audit logs"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchLogs(1);
  }, [projectName]);

  function handleSearch() {
    setPage(1);
    fetchLogs(1);
  }

  function formatDetails(action: string, details: Record<string, unknown> | null): string {
    if (!details) return "";
    if (action === "token_created") return `"${details.name}" (${(details.permissions as string[])?.join(", ")})`;
    if (action === "token_revoked") return `"${details.name}"`;
    if (action === "member_invited") return `${details.email}`;
    if (action === "member_removed") return `${details.email}`;
    if (action === "source_deleted") return `"${details.name}"`;
    if (action === "settings_updated") return `Fields: ${(details.fields as string[])?.join(", ")}`;
    if (action === "alert_resolved") return `Alert #${details.alertId}`;
    return JSON.stringify(details);
  }

  function formatUser(log: AuditLog): string {
    if (log.pseudo) return `@${log.pseudo}`;
    if (log.first_name) return `${log.first_name} ${log.last_name ?? ""}`.trim();
    return log.email ?? "Unknown";
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-white">Audit Logs</h2>
        <p className="mt-0.5 text-xs text-[var(--text-muted)]">
          All significant actions performed in this project. Visible only to the owner.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-[var(--text-muted)]">Action</label>
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="h-8 rounded border border-[var(--border)] bg-[var(--surface)] px-2 text-xs text-white focus:outline-none focus:border-[var(--primary)]"
          >
            <option value="">All actions</option>
            {Object.entries(ACTION_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-[var(--text-muted)]">From</label>
          <input
            type="date"
            value={filterFrom}
            onChange={(e) => setFilterFrom(e.target.value)}
            className="h-8 rounded border border-[var(--border)] bg-[var(--surface)] px-2 text-xs text-white focus:outline-none focus:border-[var(--primary)]"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-[var(--text-muted)]">To</label>
          <input
            type="date"
            value={filterTo}
            onChange={(e) => setFilterTo(e.target.value)}
            className="h-8 rounded border border-[var(--border)] bg-[var(--surface)] px-2 text-xs text-white focus:outline-none focus:border-[var(--primary)]"
          />
        </div>
        <button
          type="button"
          onClick={handleSearch}
          className="h-8 rounded bg-[var(--primary)] px-3 text-xs font-medium text-black hover:opacity-90 transition-opacity"
        >
          Search
        </button>
        {(filterAction || filterFrom || filterTo) && (
          <button
            type="button"
            onClick={() => { setFilterAction(""); setFilterFrom(""); setFilterTo(""); fetchLogs(1); }}
            className="h-8 rounded border border-[var(--border)] px-3 text-xs text-[var(--text-muted)] hover:text-white transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      {error && (
        <p className="rounded border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">{error}</p>
      )}

      {loading ? (
        <p className="text-xs text-[var(--text-muted)]">Loading…</p>
      ) : logs.length === 0 ? (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] p-8 text-center">
          <p className="text-sm text-[var(--text-muted)]">No audit logs found</p>
        </div>
      ) : (
        <>
          <p className="text-xs text-[var(--text-muted)]">{total} event{total !== 1 ? "s" : ""} total</p>
          <div className="overflow-x-auto rounded-lg border border-[var(--border)]">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--surface-elevated)]">
                  <th className="px-3 py-2 text-left font-medium text-[var(--text-muted)]">Action</th>
                  <th className="px-3 py-2 text-left font-medium text-[var(--text-muted)]">Details</th>
                  <th className="px-3 py-2 text-left font-medium text-[var(--text-muted)]">User</th>
                  <th className="px-3 py-2 text-left font-medium text-[var(--text-muted)]">IP</th>
                  <th className="px-3 py-2 text-left font-medium text-[var(--text-muted)]">Date</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-elevated)] transition-colors">
                    <td className="px-3 py-2.5">
                      <span className={`font-medium ${ACTION_COLORS[log.action] ?? "text-[var(--text-secondary)]"}`}>
                        {ACTION_LABELS[log.action] ?? log.action}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-[var(--text-muted)] max-w-[200px] truncate">
                      {formatDetails(log.action, log.details)}
                    </td>
                    <td className="px-3 py-2.5 text-[var(--text-secondary)]">
                      {formatUser(log)}
                    </td>
                    <td className="px-3 py-2.5 text-[var(--text-muted)] font-mono">
                      {log.ip ?? "—"}
                    </td>
                    <td className="px-3 py-2.5 text-[var(--text-muted)] whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString("en-GB", {
                        day: "2-digit", month: "short", year: "numeric",
                        hour: "2-digit", minute: "2-digit"
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center gap-2 justify-end">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => fetchLogs(page - 1)}
                className="h-7 px-3 rounded border border-[var(--border)] text-xs text-[var(--text-muted)] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="text-xs text-[var(--text-muted)]">
                Page {page} / {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => fetchLogs(page + 1)}
                className="h-7 px-3 rounded border border-[var(--border)] text-xs text-[var(--text-muted)] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
