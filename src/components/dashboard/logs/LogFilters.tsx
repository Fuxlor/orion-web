"use client";

import { useState, useRef, useEffect } from "react";

const LOG_LEVELS = [
  { value: "info", label: "Info", color: "text-blue-400" },
  { value: "warn", label: "Warn", color: "text-yellow-400" },
  { value: "error", label: "Error", color: "text-red-400" },
  { value: "debug", label: "Debug", color: "text-gray-400" },
  { value: "verbose", label: "Verbose", color: "text-violet-400" },
  { value: "trace", label: "Trace", color: "text-green-300" },
];

interface FilterDropdownProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  colorMap?: Record<string, string>;
  activeCount?: number;
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

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border transition-colors ${
          count > 0
            ? "border-[var(--primary)] text-[var(--primary)] bg-[var(--primary-muted)]"
            : "border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-focus)] hover:text-white"
        }`}
      >
        {label}
        {count > 0 && (
          <span className="bg-[var(--primary)] text-[var(--surface)] text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
            {count}
          </span>
        )}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 min-w-[160px] rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] shadow-xl py-1">
          {options.length === 0 && (
            <p className="px-3 py-2 text-xs text-[var(--text-muted)]">No options</p>
          )}
          {options.map(opt => (
            <label key={opt} className="flex items-center gap-2 px-3 py-1.5 hover:bg-[var(--border)] cursor-pointer text-sm transition-colors">
              <input
                type="checkbox"
                checked={selected.includes(opt)}
                onChange={() => toggle(opt)}
                className="accent-[var(--primary)]"
              />
              <span className={colorMap?.[opt] ?? "text-white"}>{opt}</span>
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
          className={`px-2 py-1.5 text-sm rounded-lg border bg-[var(--surface-input)] focus:outline-none focus:border-[var(--border-focus)] transition-colors ${
            from ? "border-[var(--primary)] text-white" : "border-[var(--border)] text-[var(--text-muted)]"
          }`}
        />
        <span className="text-[var(--text-muted)] text-xs">→</span>
        <input
          type="date"
          value={to}
          onChange={e => onToChange(e.target.value)}
          className={`px-2 py-1.5 text-sm rounded-lg border bg-[var(--surface-input)] focus:outline-none focus:border-[var(--border-focus)] transition-colors ${
            to ? "border-[var(--primary)] text-white" : "border-[var(--border)] text-[var(--text-muted)]"
          }`}
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
          className="text-xs text-[var(--text-muted)] hover:text-white underline transition-colors ml-1"
        >
          Clear all
        </button>
      )}
    </div>
  );
}
