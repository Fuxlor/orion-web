import { HeartbeatStatus } from "@/types";
import { relativeTimeShort } from "@/lib/format";
import { HeartbeatStatusBadge } from "@/components/dashboard/StatusBadge";

interface Props {
  heartbeats: HeartbeatStatus[];
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
              <HeartbeatStatusBadge status={hb.status === 'started' ? 'UP' : hb.status != null ? 'DOWN' : null} />
            </div>
            <p className="text-xs text-[var(--text-muted)]">
              Last ping: {relativeTimeShort(hb.last_ping_at)} ago
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
