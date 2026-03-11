"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { AlertRule, AlertChannel, LogSource } from "@/types";

const LEVELS = ["error", "warn", "info", "debug", "verbose", "trace"];
const WINDOWS = [
  { label: "1 minute", value: 60 },
  { label: "2 minutes", value: 120 },
  { label: "5 minutes", value: 300 },
  { label: "10 minutes", value: 600 },
  { label: "30 minutes", value: 1800 },
  { label: "1 hour", value: 3600 },
];

interface RuleFormProps {
  projectName: string;
  sources: LogSource[];
  rule?: AlertRule;
  onSaved: () => void;
  onCancel: () => void;
}

export default function RuleForm({ projectName, sources, rule, onSaved, onCancel }: RuleFormProps) {
  const [name, setName] = useState(rule?.name ?? "");
  const [level, setLevel] = useState(rule?.level ?? "error");
  const [threshold, setThreshold] = useState(rule?.threshold ?? 5);
  const [windowSeconds, setWindowSeconds] = useState(rule?.window_seconds ?? 120);
  const [sourceName, setSourceName] = useState<string>(rule?.source_name ?? "");
  const [enabled, setEnabled] = useState(rule?.enabled ?? true);
  const [channels, setChannels] = useState<AlertChannel[]>(
    rule?.channels ?? [{ type: "email", target: "" }]
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addChannel() {
    setChannels((prev) => [...prev, { type: "webhook", target: "" }]);
  }

  function removeChannel(idx: number) {
    setChannels((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateChannel(idx: number, patch: Partial<AlertChannel>) {
    setChannels((prev) => prev.map((ch, i) => (i === idx ? { ...ch, ...patch } : ch)));
  }

  async function handleTestWebhook(ruleId: number) {
    await apiFetch(`/api/projects/${projectName}/alerts/rules/${ruleId}/test`, { method: "POST" }, true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError("Name is required"); return; }
    const validChannels = channels.filter((ch) => ch.target.trim());
    setSaving(true);
    setError(null);
    try {
      const body = { name: name.trim(), level, threshold, window_seconds: windowSeconds, source_name: sourceName || null, channels: validChannels, enabled };
      const res = rule
        ? await apiFetch(`/api/projects/${projectName}/alerts/rules/${rule.id}`, { method: "PUT", body: JSON.stringify(body) })
        : await apiFetch(`/api/projects/${projectName}/alerts/rules`, { method: "POST", body: JSON.stringify(body) });
      if (res.ok) {
        onSaved();
      } else {
        const data = await res.json();
        setError(data.error ?? "Error while saving");
      }
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        {/* Name */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">Rule name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Too many errors"
            className="w-full !h-10 !px-3 !py-2 !text-sm rounded-lg border border-[var(--border)] bg-[var(--surface-input)] text-[var(--text-secondary)] focus:border-[var(--border-focus)] focus:outline-none"
            required
          />
        </div>
        {/* Source */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">Scope</label>
          <select
            value={sourceName}
            onChange={(e) => setSourceName(e.target.value)}
            className="w-full cursor-pointer !h-10 !px-3 !py-2 !text-sm rounded-lg border border-[var(--border)] bg-[var(--surface-input)] text-[var(--text-secondary)] focus:border-[var(--border-focus)] focus:outline-none"
          >
            <option value="">All sources</option>
            {sources.map((s) => (
              <option key={s.name} value={s.name}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Condition row */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">Level</label>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="w-full cursor-pointer !h-10 !px-3 !py-2 !text-sm rounded-lg border border-[var(--border)] bg-[var(--surface-input)] text-[var(--text-secondary)] focus:border-[var(--border-focus)] focus:outline-none"
          >
            {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">Threshold (occurrences)</label>
          <input
            type="number"
            min={1}
            value={threshold}
            onChange={(e) => setThreshold(parseInt(e.target.value, 10))}
            className="w-full !h-10 !px-3 !py-2 !text-sm rounded-lg border border-[var(--border)] bg-[var(--surface-input)] text-[var(--text-secondary)] focus:border-[var(--border-focus)] focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">Time window</label>
          <select
            value={windowSeconds}
            onChange={(e) => setWindowSeconds(parseInt(e.target.value, 10))}
            className="w-full cursor-pointer !h-10 !px-3 !py-2 !text-sm rounded-lg border border-[var(--border)] bg-[var(--surface-input)] text-[var(--text-secondary)] focus:border-[var(--border-focus)] focus:outline-none"
          >
            {WINDOWS.map((w) => <option key={w.value} value={w.value}>{w.label}</option>)}
          </select>
        </div>
      </div>

      {/* Channels */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-xs font-medium text-[var(--text-muted)]">Notification channels</label>
          <button
            type="button"
            onClick={addChannel}
            className="cursor-pointer rounded px-2 py-1 text-xs text-[var(--primary)] transition-colors hover:bg-[var(--primary-muted)]"
          >
            + Add
          </button>
        </div>
        <div className="space-y-2">
          {channels.map((ch, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <select
                value={ch.type}
                onChange={(e) => updateChannel(idx, { type: e.target.value as "email" | "webhook" })}
                className="cursor-pointer !h-10 !px-3 !py-2 !text-sm rounded-lg border border-[var(--border)] bg-[var(--surface-input)] text-[var(--text-secondary)] focus:border-[var(--border-focus)] focus:outline-none"
              >
                <option value="email">Email</option>
                <option value="webhook">Webhook</option>
              </select>
              <input
                type={ch.type === "email" ? "email" : "url"}
                value={ch.target}
                onChange={(e) => updateChannel(idx, { target: e.target.value })}
                placeholder={ch.type === "email" ? "admin@example.com" : "https://discord.com/api/webhooks/..."}
                className="flex-1 !h-10 !px-3 !py-2 !text-sm rounded-lg border border-[var(--border)] bg-[var(--surface-input)] text-[var(--text-secondary)] focus:border-[var(--border-focus)] focus:outline-none"
              />
              {/* {rule && ch.type === "webhook" && ch.target && (
                <button
                  type="button"
                  onClick={() => handleTestWebhook(rule.id)}
                  title="Send test"
                  className="cursor-pointer rounded px-2 py-1.5 text-xs text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-input)] hover:text-white"
                >
                  Test
                </button>
              )} */}
              <button
                type="button"
                onClick={() => removeChannel(idx)}
                className="cursor-pointer rounded p-1.5 text-[var(--text-muted)] transition-colors hover:bg-[rgba(248,113,113,0.12)] hover:text-red-400"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Enabled toggle */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          onClick={() => setEnabled((v) => !v)}
          className={`relative h-5 w-9 cursor-pointer rounded-full transition-colors ${enabled ? "bg-[var(--primary)]" : "bg-[var(--border)]"}`}
        >
          <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${enabled ? "" : "translate-x-[-1rem]"}`} />
        </button>
        <span className="text-sm text-[var(--text-secondary)]">Rule enabled</span>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {/* Actions */}
      <div className="flex justify-end gap-2 border-t border-[var(--border)] pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="cursor-pointer rounded-lg border border-[var(--border)] px-4 py-2 text-sm text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-input)]"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="btn-primary cursor-pointer rounded-lg px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Saving…" : rule ? "Update" : "Create rule"}
        </button>
      </div>
    </form>
  );
}
