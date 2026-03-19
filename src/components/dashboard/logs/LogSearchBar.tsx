"use client";

import { useRef, useEffect } from "react";

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function LogSearchBar({ value, onChange, placeholder = "Search logs…" }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync external value changes (e.g. "clear all" button)
  useEffect(() => {
    if (inputRef.current && inputRef.current.value !== value) {
      inputRef.current.value = value;
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onChange(v), 300);
  };

  const handleClear = () => {
    if (inputRef.current) inputRef.current.value = "";
    if (debounceRef.current) clearTimeout(debounceRef.current);
    onChange("");
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div className="relative" style={{ flex: 1, maxWidth: 400 }}>
      <span className="absolute pointer-events-none" style={{ left: 11, top: "50%", transform: "translateY(-50%)", color: "#4b5563" }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      </span>
      <input
        ref={inputRef}
        type="text"
        defaultValue={value}
        onChange={handleChange}
        placeholder={placeholder}
        style={{
          width: "100%",
          backgroundColor: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          padding: "8px 32px 8px 32px",
          fontSize: 13,
          color: "white",
          outline: "none",
        }}
      />
      {value && (
        <button
          onClick={handleClear}
          className="absolute transition-colors hover:text-white"
          style={{ right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#6b7280", cursor: "pointer" }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18" /><path d="m6 6 12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
