"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";

interface CommandButtonProps {
  projectName: string;
  serverName: string;
  sourceName?: string;
  type: 'restart' | 'start' | 'stop';
  disabled?: boolean;
  unjoinable?: boolean;
  onSuccess?: () => void;
}

export function CommandButton({ projectName, serverName, sourceName, type, disabled, unjoinable, onSuccess }: CommandButtonProps) {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const body: Record<string, string> = { type };
      if (sourceName) body.source = sourceName;
      await apiFetch(`/api/projects/${projectName}/servers/${encodeURIComponent(serverName)}/commands`, {
        method: 'POST',
        body: JSON.stringify(body),
      });
      setSent(true);
      setTimeout(() => setSent(false), 3000);
      onSuccess?.();
    } finally {
      setLoading(false);
    }
  };

  const label = unjoinable
    ? type.charAt(0).toUpperCase() + type.slice(1)
    : sent ? "Sent!" : loading ? "…" : disabled ? "Pending…" : type.charAt(0).toUpperCase() + type.slice(1);

  switch (type) {
    case 'restart':
      return (
        <button
          onClick={handleClick}
          disabled={loading || disabled || sent || unjoinable}
          className="hover:cursor-pointer px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 bg-[rgba(251,146,60,0.12)] text-orange-400 hover:bg-[rgba(251,146,60,0.2)]"
        >
          {label}
        </button>
      );
    case 'start':
      return (
        <button
          onClick={handleClick}
          disabled={loading || disabled || sent || unjoinable}
          className="hover:cursor-pointer px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 bg-[var(--primary-muted)] text-[var(--primary)] hover:opacity-80"
        >
          {label}
        </button>
      );
    case 'stop':
      return (
        <button
          onClick={handleClick}
          disabled={loading || disabled || sent || unjoinable}
          className="hover:cursor-pointer px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 bg-[rgba(248,113,113,0.12)] text-red-400 hover:bg-[rgba(248,113,113,0.2)]"
        >
          {label}
        </button>
      );
  }
}
