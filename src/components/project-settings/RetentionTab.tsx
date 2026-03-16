"use client";

import { useState, useEffect } from "react";
import { useRetentionSettings } from "@/hooks/useRetentionSettings";
import type { RetentionSetting } from "@/types";

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
  const [localSettings, setLocalSettings] = useState<RetentionSetting[]>([]);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (data) setLocalSettings(data.settings.map(s => ({ ...s })));
  }, [data]);

  const handleChange = (level: string, days: number) => {
    setLocalSettings(prev => prev.map(s => s.level === level ? { ...s, retention_days: days } : s));
    setSaved(false);
    setSaveError(null);
  };

  const handleSave = async () => {
    setSaveError(null);
    try {
      await update(localSettings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setSaveError((err as Error).message);
    }
  };

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
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--surface-elevated)]">
              <th className="px-4 py-2.5 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Level</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Retention (days)</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider w-8"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {localSettings.map((s) => {
              const exceedsMax = s.retention_days > maxDays;
              return (
                <tr key={s.level} className="bg-[var(--surface)]">
                  <td className="px-4 py-3">
                    <span className={`font-medium capitalize ${LEVEL_COLORS[s.level] ?? "text-white"}`}>
                      {s.level}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min={1}
                      max={maxDays}
                      value={s.retention_days}
                      onChange={e => handleChange(s.level, parseInt(e.target.value, 10) || 1)}
                      disabled={!canWrite}
                      className={`w-24 px-2 py-1 text-sm rounded-lg border bg-[var(--surface-input)] text-white focus:outline-none focus:border-[var(--border-focus)] transition-colors disabled:opacity-50 ${
                        exceedsMax ? "border-red-500" : "border-[var(--border)]"
                      }`}
                    />
                  </td>
                  <td className="px-4 py-3">
                    {exceedsMax && (
                      <span title={`Exceeds your plan limit of ${maxDays} days`} className="text-red-400">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {canWrite && (
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving || localSettings.some(s => s.retention_days > maxDays)}
            className="px-4 py-2 text-sm rounded-lg bg-[var(--primary)] text-[var(--surface)] font-medium hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save retention settings"}
          </button>
          {saved && (
            <span className="text-sm text-green-400">Saved!</span>
          )}
          {(saveError ?? error) && (
            <span className="text-sm text-red-400">{saveError ?? error}</span>
          )}
        </div>
      )}
    </div>
  );
}
