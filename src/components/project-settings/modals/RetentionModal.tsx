"use client";

import { useState, useEffect } from "react";
import type { RetentionData, RetentionSetting } from "@/types";

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
  data: RetentionData;
  saving: boolean;
  externalError: string | null;
  update: (settings: RetentionSetting[]) => Promise<void>;
  onClose: () => void;
}

export default function RetentionModal({ data, saving, externalError, update, onClose }: Props) {
  const [localSettings, setLocalSettings] = useState<RetentionSetting[]>(
    data.settings.map((s) => ({ ...s }))
  );
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const handleChange = (level: string, days: number) => {
    setLocalSettings((prev) =>
      prev.map((s) => (s.level === level ? { ...s, retention_days: days } : s))
    );
    setSaveError(null);
  };

  const handleSave = async () => {
    setSaveError(null);
    try {
      await update(localSettings);
      onClose();
    } catch (err) {
      setSaveError((err as Error).message);
    }
  };

  const maxDays = data.max_retention_days;
  const planLabel = PLAN_LABELS[data.plan] ?? data.plan;
  const hasExceeded = localSettings.some((s) => s.retention_days > maxDays);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <div
        className="w-full max-w-lg rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-2xl max-h-[90vh] flex flex-col"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)] shrink-0">
          <h2 className="text-base font-semibold text-white">Edit Retention Settings</h2>
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
        <div className="px-5 py-4 space-y-4 overflow-y-auto">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface-input)] text-sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--primary)] shrink-0">
              <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
            </svg>
            <span className="text-[var(--text-muted)]">
              Your plan: <span className="text-white font-medium">{planLabel}</span> — max{" "}
              <span className="text-white font-medium">{maxDays} days</span> per level
            </span>
          </div>

          <div className="rounded-lg border border-[var(--border)] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--card)]">
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Level</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Retention (days)</th>
                  <th className="px-4 py-2.5 w-8"></th>
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
                          onChange={(e) => handleChange(s.level, parseInt(e.target.value, 10) || 1)}
                          className={`w-24 px-2 py-1 text-sm rounded-lg border bg-[var(--surface-input)] text-white focus:outline-none focus:border-[var(--border-focus)] transition-colors ${exceedsMax ? "border-red-500" : "border-[var(--border)]"
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

          {(saveError ?? externalError) && (
            <p className="text-xs text-red-400">{saveError ?? externalError}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-5 py-4 border-t border-[var(--border)] shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg border border-[var(--border)] px-4 py-2 text-sm text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-input)]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || hasExceeded}
            className="cursor-pointer rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--surface)] transition-colors hover:bg-[var(--primary-hover)] disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
