'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { fetchPlans, PlansConfig } from '@/lib/plans';
import { User } from '@/types';

interface Props {
  user: User;
}

interface Subscription {
  plan: 'free' | 'pro' | 'enterprise';
  subscription_status: string | null;
  subscription_id: string | null;
  stripe_customer_id: string | null;
}

const PLAN_LABELS: Record<string, string> = {
  free: 'Free',
  pro: 'Pro',
  enterprise: 'Enterprise',
};

const PLAN_COLORS: Record<string, string> = {
  free: 'var(--text-muted)',
  pro: 'var(--primary)',
  enterprise: '#a78bfa',
};

export default function BillingTab({ user }: Props) {
  const [sub, setSub] = useState<Subscription | null>(null);
  const [plans, setPlans] = useState<PlansConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      apiFetch('/api/billing/subscription').then(r => r.json()).then(d => { if (d.ok) setSub(d.subscription); }),
      fetchPlans().then(setPlans).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  const plan = sub?.plan ?? user.plan ?? 'free';
  const status = sub?.subscription_status;
  const isPro = plan === 'pro' || plan === 'enterprise';

  async function handleUpgrade() {
    setCheckoutLoading(true);
    try {
      const res = await apiFetch('/api/billing/checkout', { method: 'POST' });
      const data = await res.json();
      if (data.ok && data.url) window.location.href = data.url;
    } finally {
      setCheckoutLoading(false);
    }
  }

  async function handlePortal() {
    setPortalLoading(true);
    try {
      const res = await apiFetch('/api/billing/portal', { method: 'POST' });
      const data = await res.json();
      if (data.ok && data.url) window.location.href = data.url;
    } finally {
      setPortalLoading(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-[var(--text-muted)]">Loading billing info…</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-[var(--text-secondary)] mb-1">Billing & Plan</h2>
        <p className="text-sm text-[var(--text-muted)]">Manage your subscription and usage.</p>
      </div>

      {/* Current plan card */}
      <div className="p-5 bg-[var(--surface-elevated)] border border-[var(--border)] rounded-lg space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide mb-1">Current plan</p>
            <p className="text-2xl font-bold" style={{ color: PLAN_COLORS[plan] ?? 'var(--text-secondary)' }}>
              {PLAN_LABELS[plan] ?? plan}
            </p>
            {status && status !== 'active' && (
              <p className="text-xs mt-1" style={{ color: status === 'past_due' ? '#f59e0b' : 'var(--text-muted)' }}>
                {status === 'past_due' ? 'Payment overdue — please update billing details' : status}
              </p>
            )}
          </div>

          <div className="flex gap-2">
            {isPro ? (
              <button
                type="button"
                onClick={handlePortal}
                disabled={portalLoading}
                className="px-4 py-2 text-sm border border-[var(--border)] rounded-lg text-[var(--text-secondary)] hover:bg-[var(--surface)] transition-colors disabled:opacity-50"
              >
                {portalLoading ? 'Redirecting…' : 'Manage billing'}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleUpgrade}
                disabled={checkoutLoading}
                className="px-4 py-2 text-sm bg-[var(--primary)] text-black font-medium rounded-lg hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-50"
              >
                {checkoutLoading ? 'Redirecting…' : 'Upgrade to Pro'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Plan comparison */}
      <div>
        <p className="text-sm font-medium text-[var(--text-secondary)] mb-3">Plan comparison</p>
        <div className="border border-[var(--border)] rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--surface)]">
                <th className="text-left px-4 py-3 text-[var(--text-muted)] font-medium">Feature</th>
                <th className="text-center px-4 py-3 text-[var(--text-muted)] font-medium">Free</th>
                <th className="text-center px-4 py-3 font-medium" style={{ color: 'var(--primary)' }}>Pro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {[
                { label: 'Projects', free: plans?.limits.free ? (plans.limits.free.maxProjects === Infinity ? 'Unlimited' : String(plans.limits.free.maxProjects)) : '2', pro: plans?.limits.pro ? (plans.limits.pro.maxProjects === Infinity ? 'Unlimited' : String(plans.limits.pro.maxProjects)) : 'Unlimited' },
                { label: 'Sources / project', free: plans?.display.free.sources ?? '1', pro: plans?.display.pro.sources ?? '10' },
                { label: 'Logs / month', free: plans?.display.free.logs ?? '10K', pro: plans?.display.pro.logs ?? '500K' },
                { label: 'Log retention', free: plans?.display.free.retention ?? '3 days', pro: plans?.display.pro.retention ?? '30 days' },
                { label: 'Alert rules', free: '—', pro: plans?.limits.pro?.alertsEnabled ? 'Unlimited' : '—' },
                { label: 'Price', free: '$0', pro: plans?.display.pro.price ?? '$10 / month' },
              ].map(row => (
                <tr key={row.label} className="bg-[var(--surface-elevated)]">
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{row.label}</td>
                  <td className="px-4 py-3 text-center text-[var(--text-muted)]">{row.free}</td>
                  <td className="px-4 py-3 text-center" style={{ color: 'var(--primary)' }}>{row.pro}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {!isPro && (
        <p className="text-xs text-[var(--text-muted)]">
          Need unlimited resources?{' '}
          <button type="button" onClick={handleUpgrade} className="text-[var(--primary)] hover:underline">
            Upgrade to Pro
          </button>{' '}
          for {plans?.display.pro.price ?? '$10 / month'}.
        </p>
      )}
    </div>
  );
}
