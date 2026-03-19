'use client';

import Link from 'next/link';

export default function BillingCancelPage() {
  return (
    <div className="min-h-screen bg-[var(--page-bg)] flex items-center justify-center">
      <div className="text-center space-y-6 max-w-md px-6">
        <div className="w-16 h-16 rounded-full bg-[var(--card)] border border-[var(--border)] flex items-center justify-center mx-auto">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-secondary)] mb-2">Checkout cancelled</h1>
          <p className="text-sm text-[var(--text-muted)]">
            No charges were made. You can upgrade to Pro any time from your billing settings.
          </p>
        </div>
        <Link
          href="/settings#billing"
          className="inline-block px-6 py-2.5 border border-[var(--border)] text-[var(--text-secondary)] text-sm rounded-lg hover:bg-[var(--card)] transition-colors"
        >
          Back to billing
        </Link>
      </div>
    </div>
  );
}
