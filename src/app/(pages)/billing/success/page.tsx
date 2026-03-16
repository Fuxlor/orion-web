'use client';

import Link from 'next/link';

export default function BillingSuccessPage() {
  return (
    <div className="min-h-screen bg-[var(--page-bg)] flex items-center justify-center">
      <div className="text-center space-y-6 max-w-md px-6">
        <div className="w-16 h-16 rounded-full bg-[var(--primary-muted)] flex items-center justify-center mx-auto">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-secondary)] mb-2">You're on Pro!</h1>
          <p className="text-sm text-[var(--text-muted)]">
            Your subscription is now active. Enjoy unlimited projects, 500K logs/month, and alert rules.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="inline-block px-6 py-2.5 bg-[var(--primary)] text-black font-medium text-sm rounded-lg hover:bg-[var(--primary-hover)] transition-colors"
        >
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}
