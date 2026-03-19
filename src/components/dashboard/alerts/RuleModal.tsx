"use client";

import { useEffect } from "react";
import { AlertRule, LogSource } from "@/types";
import RuleForm from "./RuleForm";

interface RuleModalProps {
  projectName: string;
  sources: LogSource[];
  rule?: AlertRule;
  onSaved: () => void;
  onClose: () => void;
}

export default function RuleModal({ projectName, sources, rule, onSaved, onClose }: RuleModalProps) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
          <h2 className="text-base font-semibold text-white">
            {rule ? "Edit rule" : "Create rule"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded p-1.5 text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-input)] hover:text-white"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[80vh] overflow-y-auto p-6">
          <RuleForm
            projectName={projectName}
            sources={sources}
            rule={rule}
            onSaved={onSaved}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
}
