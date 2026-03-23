import { HeartbeatStatus } from "@/types";

interface Props {
  heartbeats: HeartbeatStatus[];
}

function relativeTime(isoString: string | null): string {
  if (!isoString) return "never";
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return `${diffSec}s`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  return `${diffH}h`;
}

function StatusBadge({ status }: { status: 'UP' | 'DOWN' | null }) {
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

export default function SourcesGrid({ heartbeats }: Props) {
  if (heartbeats.length === 0) {
    return (
      <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5">
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
          Sources Status
        </p>
        <p className="text-sm text-[var(--text-muted)]">No sources configured.</p>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-3 text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
        Sources Status
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {heartbeats.map((hb) => (
          <div
            key={hb.source}
            className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-[var(--text-muted)]">
                {hb.source}
              </span>
              <StatusBadge status={hb.status} />
            </div>
            <p className="text-xs text-[var(--text-muted)]">
              Last ping: {relativeTime(hb.last_ping_at)} ago
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
