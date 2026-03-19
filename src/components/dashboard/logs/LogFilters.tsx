"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

const LOG_LEVELS = [
  { value: "info", label: "Info", color: "var(--level-info)", bg: "var(--level-info-bg)", border: "var(--level-info-border)" },
  { value: "warn", label: "Warn", color: "var(--level-warn)", bg: "var(--level-warn-bg)", border: "var(--level-warn-border)" },
  { value: "error", label: "Error", color: "var(--level-error)", bg: "var(--level-error-bg)", border: "var(--level-error-border)" },
  { value: "debug", label: "Debug", color: "var(--level-debug)", bg: "var(--level-debug-bg)", border: "var(--level-debug-border)" },
  { value: "verbose", label: "Verbose", color: "var(--level-verbose)", bg: "var(--level-verbose-bg)", border: "var(--level-verbose-border)" },
  { value: "trace", label: "Trace", color: "var(--level-trace)", bg: "var(--level-trace-bg)", border: "var(--level-trace-border)" },
];

interface FilterDropdownProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  colorMap?: Record<string, string>;
}

function FilterDropdown({ label, options, selected, onChange, colorMap }: FilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (val: string) => {
    onChange(selected.includes(val) ? selected.filter(s => s !== val) : [...selected, val]);
  };

  const count = selected.length;
  const isActive = count > 0;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 cursor-pointer transition-all"
        style={{
          padding: "6px 12px",
          borderRadius: 8,
          border: `1px solid ${isActive ? "var(--level-info-border)" : "var(--border)"}`,
          backgroundColor: isActive ? "var(--accent)" : "transparent",
          fontSize: 12,
          fontWeight: 600,
          color: isActive ? "var(--primary)" : "var(--text-muted)",
          fontFamily: "inherit",
        }}
      >
        {label}
        {isActive && (
          <span
            style={{
              backgroundColor: "var(--primary)",
              color: "var(--primary-foreground)",
              fontSize: 10,
              fontWeight: 700,
              borderRadius: "50%",
              width: 16,
              height: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {count}
          </span>
        )}
        <ChevronDown size={12} style={{ opacity: 0.6 }} />
      </button>
      {open && (
        <div
          className="absolute top-full left-0 mt-1 z-50 py-1"
          style={{
            minWidth: 160,
            borderRadius: 10,
            border: "1px solid var(--border)",
            backgroundColor: "var(--card)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          }}
        >
          {options.length === 0 && (
            <p className="px-3 py-2 text-xs" style={{ color: "var(--text-muted)" }}>No options</p>
          )}
          {options.map(opt => (
            <label
              key={opt}
              className="flex items-center gap-2 px-3 py-1.5 cursor-pointer text-sm transition-colors hover:bg-white/5"
            >
              <input
                type="checkbox"
                checked={selected.includes(opt)}
                onChange={() => toggle(opt)}
                className="accent-[var(--primary)]"
              />
              <span style={{ color: colorMap?.[opt] ?? "var(--foreground)", fontSize: 12 }}>{opt}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

interface Props {
  availableSources: string[];
  availableServers: string[];
  availableTags: string[];
  levels: string[];
  sources: string[];
  servers: string[];
  from: string;
  to: string;
  tags: string[];
  isFiltered: boolean;
  hideSources?: boolean;
  onLevelsChange: (v: string[]) => void;
  onSourcesChange: (v: string[]) => void;
  onServersChange: (v: string[]) => void;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
  onTagsChange: (v: string[]) => void;
  onClear: () => void;
}

const LEVEL_COLOR_MAP = Object.fromEntries(LOG_LEVELS.map(l => [l.value, l.color]));

export default function LogFilters({
  availableSources, availableServers, availableTags,
  levels, sources, servers, from, to, tags,
  isFiltered, hideSources,
  onLevelsChange, onSourcesChange, onServersChange,
  onFromChange, onToChange, onTagsChange, onClear,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <FilterDropdown
        label="Level"
        options={LOG_LEVELS.map(l => l.value)}
        selected={levels}
        onChange={onLevelsChange}
        colorMap={LEVEL_COLOR_MAP}
      />
      {!hideSources && (
        <FilterDropdown
          label="Source"
          options={availableSources}
          selected={sources}
          onChange={onSourcesChange}
        />
      )}
      <FilterDropdown
        label="Server"
        options={availableServers}
        selected={servers}
        onChange={onServersChange}
      />

      {/* Date range */}
      <div className="flex items-center gap-1.5">
        <input
          type="date"
          value={from}
          onChange={e => onFromChange(e.target.value)}
          className="text-sm focus:outline-none transition-colors"
          style={{
            padding: "5px 10px",
            borderRadius: 8,
            border: `1px solid ${from ? "var(--level-info-border)" : "var(--border)"}`,
            backgroundColor: from ? "var(--accent)" : "transparent",
            color: from ? "var(--foreground)" : "var(--text-muted)",
            fontSize: 12,
          }}
        />
        <span style={{ color: "var(--text-muted)", fontSize: 12 }}>→</span>
        <input
          type="date"
          value={to}
          onChange={e => onToChange(e.target.value)}
          className="text-sm focus:outline-none transition-colors"
          style={{
            padding: "5px 10px",
            borderRadius: 8,
            border: `1px solid ${to ? "var(--level-info-border)" : "var(--border)"}`,
            backgroundColor: to ? "var(--accent)" : "transparent",
            color: to ? "var(--foreground)" : "var(--text-muted)",
            fontSize: 12,
          }}
        />
      </div>

      {availableTags.length > 0 && (
        <FilterDropdown
          label="Tags"
          options={availableTags}
          selected={tags}
          onChange={onTagsChange}
        />
      )}

      {isFiltered && (
        <button
          onClick={onClear}
          className="transition-colors"
          style={{ fontSize: 12, color: "var(--text-muted)", textDecoration: "underline", background: "none", border: "none", cursor: "pointer", marginLeft: 4 }}
        >
          Clear all
        </button>
      )}
    </div>
  );
}
