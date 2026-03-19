"use client";

import { useState } from "react";
import { Edit3, Save, Check } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { ProjectSettings } from "@/types";

interface Props {
  projectName: string;
  settings: ProjectSettings;
  can: (perm: string) => boolean;
  onUpdate: (label: string) => void;
}

export default function GeneralTab({ projectName, settings, can, onUpdate }: Props) {
  const [label, setLabel] = useState(settings.label ?? "");
  const [editing, setEditing] = useState(false);
  const [draftLabel, setDraftLabel] = useState(settings.label ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  function startEdit() {
    setDraftLabel(label);
    setSaveError(null);
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
    setSaveError(null);
  }

  async function handleSave() {
    if (!draftLabel.trim() || draftLabel === label) {
      setEditing(false);
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const res = await apiFetch(`/api/projects/${projectName}/settings`, {
        method: "PATCH",
        body: JSON.stringify({ label: draftLabel }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save");
      setLabel(draftLabel);
      onUpdate(draftLabel);
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2200);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Project Label */}
      <div
        style={{
          backgroundColor: "#13161F",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 12,
          padding: 24,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "white" }}>Project Label</h2>
          {can("settings:write") && !editing && (
            <button
              type="button"
              onClick={startEdit}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                borderRadius: 7,
                border: "1px solid rgba(255,255,255,0.1)",
                backgroundColor: "transparent",
                color: "#9BA3AF",
                fontSize: 12,
                cursor: "pointer",
                fontFamily: "inherit",
                fontWeight: 500,
              }}
            >
              <Edit3 size={12} /> Edit
            </button>
          )}
          {editing && (
            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                onClick={cancelEdit}
                style={{
                  padding: "6px 12px",
                  borderRadius: 7,
                  border: "1px solid rgba(255,255,255,0.1)",
                  backgroundColor: "transparent",
                  color: "#9BA3AF",
                  fontSize: 12,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !draftLabel.trim() || draftLabel === label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 14px",
                  borderRadius: 7,
                  border: "none",
                  backgroundColor: "#02F194",
                  color: "#0D0F16",
                  fontSize: 12,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontWeight: 700,
                  opacity: saving ? 0.7 : 1,
                }}
              >
                <Save size={12} /> {saving ? "Saving…" : "Save"}
              </button>
            </div>
          )}
        </div>

        <div>
          <p style={{ fontSize: 12, color: "#6B7280", marginBottom: 6, fontWeight: 500 }}>Display name</p>
          {editing ? (
            <input
              value={draftLabel}
              onChange={(e) => setDraftLabel(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
                if (e.key === "Escape") cancelEdit();
              }}
              autoFocus
              style={{
                width: "100%",
                backgroundColor: "rgba(2,241,148,0.04)",
                border: "1px solid rgba(2,241,148,0.3)",
                borderRadius: 8,
                padding: "10px 14px",
                fontSize: 13,
                color: "white",
                outline: "none",
                fontFamily: "inherit",
                boxShadow: "0 0 0 3px rgba(2,241,148,0.08)",
                boxSizing: "border-box",
              }}
            />
          ) : (
            <div
              style={{
                backgroundColor: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 8,
                padding: "10px 14px",
                fontSize: 13,
                color: label ? "white" : "#6B7280",
                fontStyle: label ? "normal" : "italic",
              }}
            >
              {label || "No label set"}
            </div>
          )}
        </div>

        {saveError && (
          <p style={{ marginTop: 8, fontSize: 12, color: "#ef4444" }}>{saveError}</p>
        )}

        {saved && (
          <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#02F194" }}>
            <Check size={13} /> Changes saved successfully
          </div>
        )}
      </div>

      {/* Project Info */}
      <div
        style={{
          backgroundColor: "#13161F",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 12,
          padding: 24,
        }}
      >
        <h2 style={{ fontSize: 15, fontWeight: 700, color: "white", marginBottom: 20 }}>Project Info</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p style={{ fontSize: 12, color: "#6B7280", marginBottom: 6, fontWeight: 500 }}>Slug (immutable)</p>
            <div
              style={{
                backgroundColor: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 8,
                padding: "10px 14px",
                fontSize: 13,
                color: "white",
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              }}
            >
              {settings.name}
            </div>
          </div>
          <div>
            <p style={{ fontSize: 12, color: "#6B7280", marginBottom: 6, fontWeight: 500 }}>Created</p>
            <div
              style={{
                backgroundColor: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 8,
                padding: "10px 14px",
                fontSize: 13,
                color: "white",
              }}
            >
              {new Date(settings.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
