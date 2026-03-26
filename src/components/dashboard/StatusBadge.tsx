import { ServerStatus, SourceStatus } from "@/types";

export function HeartbeatStatusBadge({ status }: { status: 'UP' | 'DOWN' | null }) {
  if (status === 'UP') {
    return (
      <span className="rounded-full bg-[var(--primary-muted)] px-2 py-0.5 text-[11px] font-semibold text-[var(--primary)]">
        UP
      </span>
    );
  }
  if (status === 'DOWN') {
    return (
      <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[11px] font-semibold text-destructive">
        DOWN
      </span>
    );
  }
  return (
    <span className="rounded-full bg-[var(--surface)] px-2 py-0.5 text-[11px] font-semibold text-[var(--text-muted)]">
      UNKNOWN
    </span>
  );
}

export function SourceStatusBadge({ status }: { status: SourceStatus | null }) {
  if (!status) return null;
  const config: Record<SourceStatus, { label: string; bg: string; text: string }> = {
    started: { label: "Started", bg: "rgba(2,241,148,0.12)", text: "#02f194" },
    partial: { label: "Partial", bg: "rgba(250,204,21,0.12)", text: "#facc15" },
    stopped: { label: "Stopped", bg: "rgba(248,113,113,0.12)", text: "#f87171" },
  };
  const c = config[status];
  return (
    <span
      className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
      style={{ background: c.bg, color: c.text }}
    >
      {c.label}
    </span>
  );
}

export function ServerStatusBadge({ status }: { status: ServerStatus }) {
  const config: Record<ServerStatus, { label: string; bg: string; text: string }> = {
    online: { label: "Online", bg: "rgba(2,241,148,0.12)", text: "#02f194" },
    partial: { label: "Partial", bg: "rgba(250,204,21,0.12)", text: "#facc15" },
    offline: { label: "Offline", bg: "rgba(248,113,113,0.12)", text: "#f87171" },
    archived: { label: "Archived", bg: "rgba(255,255,255,0.06)", text: "var(--text-muted)" },
  };
  const c = config[status];
  return (
    <span
      className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
      style={{ background: c.bg, color: c.text }}
    >
      {c.label}
    </span>
  );
}

export function EnvironmentBadge({ env }: { env: string | null }) {
  if (!env) return null;
  const config: Record<string, { bg: string; text: string }> = {
    prod: { bg: "rgba(248,113,113,0.15)", text: "#f87171" },
    staging: { bg: "rgba(250,204,21,0.15)", text: "#facc15" },
    test: { bg: "rgba(96,165,250,0.15)", text: "#60a5fa" },
    dev: { bg: "rgba(255,255,255,0.06)", text: "var(--text-muted)" },
  };
  const c = config[env] ?? config.dev;
  return (
    <span
      className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
      style={{ background: c.bg, color: c.text }}
    >
      {env}
    </span>
  );
}
