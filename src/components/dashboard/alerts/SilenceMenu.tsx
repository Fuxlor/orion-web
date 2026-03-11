"use client";

import { useRef, useEffect } from "react";

const DURATIONS = [
  { label: "2 hours", value: "2h" },
  { label: "4 hours", value: "4h" },
  { label: "12 hours", value: "12h" },
  { label: "Indefinitely", value: null },
] as const;

type Duration = "2h" | "4h" | "12h" | null;

interface SilenceMenuProps {
  onSelect: (duration: Duration) => void;
  onClose: () => void;
}

export default function SilenceMenu({ onSelect, onClose }: SilenceMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute right-0 top-8 z-50 min-w-[160px] rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] py-1 shadow-lg"
    >
      <p className="px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
        Silence for…
      </p>
      {DURATIONS.map((d) => (
        <button
          key={String(d.value)}
          type="button"
          onClick={() => {
            onSelect(d.value);
            onClose();
          }}
          className="w-full cursor-pointer px-3 py-1.5 text-left text-sm text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-input)] hover:text-white"
        >
          {d.label}
        </button>
      ))}
    </div>
  );
}
