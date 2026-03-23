export default function AlertsSection() {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5">
      <div className="mb-1 flex items-center gap-2">
        <p className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">
          Pending Alerts
        </p>
        <span className="rounded bg-[var(--surface)] px-1.5 py-0.5 text-[10px] text-[var(--text-muted)] opacity-60">
          coming soon
        </span>
      </div>
      <div className="mt-3 flex items-center gap-2 text-[var(--text-muted)]">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        <span className="text-sm">No pending alerts</span>
      </div>
    </div>
  );
}
