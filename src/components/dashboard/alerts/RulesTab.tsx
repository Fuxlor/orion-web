"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { AlertRule, LogSource } from "@/types";
import RuleModal from "./RuleModal";
import ConfirmModal from "@/components/ConfirmModal";

const WINDOW_LABELS: Record<number, string> = {
  60: "1min",
  120: "2min",
  300: "5min",
  600: "10min",
  1800: "30min",
  3600: "1h",
};

function windowLabel(seconds: number): string {
  return WINDOW_LABELS[seconds] ?? `${seconds}s`;
}

interface RulesTabProps {
  projectName: string;
  rules: AlertRule[];
  sources: LogSource[];
  loading: boolean;
  onRefresh: () => void;
}

export default function RulesTab({ projectName, rules, sources, loading, onRefresh }: RulesTabProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingRule, setEditingRule] = useState<AlertRule | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [testingId, setTestingId] = useState<number | null>(null);

  async function handleToggle(rule: AlertRule) {
    await apiFetch(`/api/projects/${projectName}/alerts/rules/${rule.id}`, {
      method: "PUT",
      body: JSON.stringify({ enabled: !rule.enabled }),
    });
    onRefresh();
  }

  async function handleDelete(id: number) {
    await apiFetch(`/api/projects/${projectName}/alerts/rules/${id}`, { method: "DELETE" }, true);
    setDeleteTargetId(null);
    onRefresh();
  }

  async function handleTest(id: number) {
    setTestingId(id);
    try {
      await apiFetch(`/api/projects/${projectName}/alerts/rules/${id}/test`, { method: "POST" }, true);
    } finally {
      setTestingId(null);
    }
  }

  function handleSaved() {
    setShowForm(false);
    setEditingRule(null);
    onRefresh();
  }

  function handleCancel() {
    setShowForm(false);
    setEditingRule(null);
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--text-muted)]">
          {rules.length} rule{rules.length !== 1 ? "s" : ""} configured
        </p>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="btn-primary cursor-pointer rounded-lg px-3 py-1.5 text-sm"
        >
          + New rule
        </button>
      </div>

      {/* Rules list */}
      {loading ? (
        <p className="text-sm text-[var(--text-muted)]">Loading…</p>
      ) : rules.length === 0 && !showForm ? (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-8 text-center">
          <p className="text-sm text-[var(--text-muted)]">No rules configured</p>
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="mt-3 cursor-pointer text-sm text-[var(--primary)] hover:underline"
          >
            Create your first rule →
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className={`rounded-lg border p-4 transition-colors ${rule.enabled ? "border-[var(--border)] bg-[var(--card)]" : "border-[var(--border)] bg-[var(--surface)] opacity-60"}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  {/* Rule name + condition */}
                  <div className="flex items-center gap-2">
                    <p className="truncate font-medium text-[var(--foreground)]">{rule.name}</p>
                    {!rule.enabled && (
                      <span className="rounded bg-[var(--surface-input)] px-1.5 py-0.5 text-xs text-[var(--text-muted)]">
                        Disabled
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">
                    If <span className="font-medium text-[var(--text-secondary)]">{rule.level}</span> occurs{" "}
                    <span className="font-medium text-[var(--text-secondary)]">{rule.threshold}</span> times in{" "}
                    <span className="font-medium text-[var(--text-secondary)]">{windowLabel(rule.window_seconds)}</span>
                    {rule.source_name && (
                      <> on <span className="font-medium text-[var(--text-secondary)]">{rule.source_name}</span></>
                    )}
                  </p>

                  {/* Channels */}
                  {rule.channels.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {rule.channels.map((ch, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 rounded bg-[var(--surface-input)] px-2 py-0.5 text-xs text-[var(--text-muted)]"
                        >
                          {ch.type === "email" ? "✉" : "🔗"} {ch.target.length > 40 ? ch.target.slice(0, 40) + "…" : ch.target}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex shrink-0 items-center gap-1">
                  {/* Toggle */}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={rule.enabled}
                    onClick={() => handleToggle(rule)}
                    title={rule.enabled ? "Disable" : "Enable"}
                    className={`relative h-5 w-9 cursor-pointer rounded-full transition-colors ${rule.enabled ? "bg-[var(--primary)]" : "bg-[var(--border)]"}`}
                  >
                    <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white duration-300 shadow transition-transform ${rule.enabled ? "" : "translate-x-[-1rem]"}`} />
                  </button>

                  {/* Test webhook */}
                  {rule.channels.some((ch) => ch.type === "webhook") && (
                    <button
                      type="button"
                      onClick={() => handleTest(rule.id)}
                      disabled={testingId === rule.id}
                      className="cursor-pointer rounded px-2 py-1 text-xs text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-input)] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {testingId === rule.id ? "Sending…" : "Test"}
                    </button>
                  )}

                  {/* Edit */}
                  <button
                    type="button"
                    onClick={() => { setEditingRule(rule); setShowForm(false); }}
                    className="cursor-pointer rounded p-1.5 text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-input)] hover:text-white"
                    title="Edit"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => setDeleteTargetId(rule.id)}
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
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit rule modal */}
      {(showForm || editingRule) && (
        <RuleModal
          projectName={projectName}
          sources={sources}
          rule={editingRule ?? undefined}
          onSaved={handleSaved}
          onClose={handleCancel}
        />
      )}

      {/* Delete confirmation modal */}
      {deleteTargetId !== null && (
        <ConfirmModal
          title="Delete rule"
          message="This rule and all its notification channels will be permanently deleted."
          onConfirm={() => handleDelete(deleteTargetId)}
          onCancel={() => setDeleteTargetId(null)}
        />
      )}
    </div>
  );
}
