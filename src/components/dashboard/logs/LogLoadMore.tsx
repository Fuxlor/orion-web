"use client";

import { useState } from "react";

interface Props {
  currentLimit: number;
  onLoad: (limit: number) => void;
  loading?: boolean;
}

export default function LogLoadMore({ currentLimit, onLoad, loading }: Props) {
  const [value, setValue] = useState(String(currentLimit));

  const handleLoad = () => {
    const n = Math.min(Math.max(parseInt(value, 10) || 500, 1), 10000);
    setValue(String(n));
    onLoad(n);
  };

  return (
    <div className="flex items-center gap-2 pt-2">
      <span className="text-xs text-[var(--text-muted)]">Load</span>
      <input
        type="number"
        min={1}
        max={10000}
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => e.key === "Enter" && handleLoad()}
        className="w-24 px-2 py-1 text-sm rounded-lg border border-[var(--border)] bg-[var(--surface-input)] text-white focus:outline-none focus:border-[var(--border-focus)] text-center"
      />
      <span className="text-xs text-[var(--text-muted)]">logs</span>
      <button
        onClick={handleLoad}
        disabled={loading}
        className="px-3 py-1 text-sm rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors disabled:opacity-50"
      >
        {loading ? "Loading…" : "Load"}
      </button>
      <span className="text-xs text-[var(--text-muted)] ml-1">(max 10 000)</span>
    </div>
  );
}
