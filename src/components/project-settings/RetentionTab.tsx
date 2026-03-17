"use client";

import { useState } from "react";
import { useRetentionSettings } from "@/hooks/useRetentionSettings";
import RetentionModal from "./modals/RetentionModal";

const LEVEL_COLORS: Record<string, string> = {
  info: "text-blue-400",
  warn: "text-yellow-400",
  error: "text-red-400",
  debug: "text-gray-400",
  verbose: "text-violet-400",
  trace: "text-green-300",
};

const PLAN_LABELS: Record<string, string> = {
  free: "Free",
  pro: "Pro",
  enterprise: "Enterprise",
};

interface Props {
  projectName: string;
  can: (perm: string) => boolean;
}

export default function RetentionTab({ projectName, can }: Props) {
  const { data, loading, saving, error, update } = useRetentionSettings(projectName);
  const [editOpen, setEditOpen] = useState(false);

  const canWrite = can("settings:write");

  if (loading) return <div className="text-sm text-[var(--text-muted)]">Loading…</div>;
  if (!data) return null;

  const maxDays = data.max_retention_days;
  const planLabel = PLAN_LABELS[data.plan] ?? data.plan;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-white">Log Retention</h2>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Configure how long logs are kept for each level. A daily cleanup job removes expired logs.
        </p>
      </div>

      {/* Plan info */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] text-sm">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--primary)] shrink-0">
          <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
        </svg>
        <span className="text-[var(--text-muted)]">
          Your plan: <span className="text-white font-medium">{planLabel}</span> — max{" "}
          <span className="text-white font-medium">{maxDays} days</span> per level
        </span>
      </div>

      {/* Settings table */}
      <div className="rounded-lg border border-[var(--border)] overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--border)] bg-[var(--surface-elevated)]">
          <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Retention per level</span>
          {canWrite && (
            <button
              type="button"
              onClick={() => setEditOpen(true)}
              className="rounded-lg border border-[var(--border)] px-3 py-1 text-xs text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-input)]"
            >
              Edit Retention
            </button>
          )}
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--surface-elevated)]">
              <th className="px-4 py-2.5 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Level</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Retention (days)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {data.settings.map((s) => (
              <tr key={s.level} className="bg-[var(--surface)]">
                <td className="px-4 py-3">
                  <span className={`font-medium capitalize ${LEVEL_COLORS[s.level] ?? "text-white"}`}>
                    {s.level}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">
                  {s.retention_days}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {editOpen && (
        <RetentionModal
          data={data}
          saving={saving}
          externalError={error}
          update={update}
          onClose={() => setEditOpen(false)}
        />
      )}
    </div>
  );
}
