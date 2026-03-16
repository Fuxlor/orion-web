"use client";

import { useState, useRef, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import type { LogSearchFilters } from "@/hooks/useLogSearch";

interface Props {
  projectName: string;
  filters: LogSearchFilters;
  currentCount: number;
}

export default function LogExportButton({ projectName, filters, currentCount }: Props) {
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<"csv" | "json">("csv");
  const [quantity, setQuantity] = useState<"current" | "custom">("current");
  const [customQty, setCustomQty] = useState("1000");
  const [exporting, setExporting] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleExport = async () => {
    setExporting(true);
    try {
      const limit = quantity === "custom"
        ? Math.min(parseInt(customQty, 10) || 1000, 10000)
        : currentCount;

      const params = new URLSearchParams();
      params.set("format", format);
      params.set("limit", String(limit));
      if (filters.search) params.set("search", filters.search);
      if (filters.levels?.length) params.set("level", filters.levels.join(","));
      if (filters.sources?.length) params.set("source", filters.sources.join(","));
      if (filters.servers?.length) params.set("server", filters.servers.join(","));
      if (filters.from) params.set("from", filters.from);
      if (filters.to) params.set("to", filters.to);
      if (filters.tags?.length) params.set("tags", filters.tags.join(","));

      const res = await apiFetch(`/api/projects/${projectName}/logs/export?${params}`);
      if (!res.ok) throw new Error("Export failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `logs-export-${new Date().toISOString().slice(0, 10)}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setOpen(false);
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Export
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-1 z-50 w-56 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] shadow-xl p-4 space-y-3">
          <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Export logs</p>

          <div className="space-y-1">
            <p className="text-xs text-[var(--text-muted)]">Format</p>
            <div className="flex gap-3">
              {(["csv", "json"] as const).map(f => (
                <label key={f} className="flex items-center gap-1.5 text-sm text-white cursor-pointer">
                  <input type="radio" name="export-format" value={f} checked={format === f} onChange={() => setFormat(f)} className="accent-[var(--primary)]" />
                  {f.toUpperCase()}
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-[var(--text-muted)]">Quantity</p>
            <label className="flex items-center gap-1.5 text-sm text-white cursor-pointer">
              <input type="radio" name="export-qty" checked={quantity === "current"} onChange={() => setQuantity("current")} className="accent-[var(--primary)]" />
              Current ({currentCount})
            </label>
            <label className="flex items-center gap-1.5 text-sm text-white cursor-pointer">
              <input type="radio" name="export-qty" checked={quantity === "custom"} onChange={() => setQuantity("custom")} className="accent-[var(--primary)]" />
              Custom:
              <input
                type="number"
                min={1}
                max={10000}
                value={customQty}
                onChange={e => setCustomQty(e.target.value)}
                disabled={quantity !== "custom"}
                className="w-20 px-1.5 py-0.5 text-sm rounded border border-[var(--border)] bg-[var(--surface-input)] text-white focus:outline-none disabled:opacity-40"
              />
            </label>
          </div>

          <button
            onClick={handleExport}
            disabled={exporting}
            className="w-full py-1.5 text-sm rounded-lg bg-[var(--primary)] text-[var(--surface)] font-medium hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-50"
          >
            {exporting ? "Exporting…" : "Download"}
          </button>
        </div>
      )}
    </div>
  );
}
