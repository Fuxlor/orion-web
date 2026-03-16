'use client';

import { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { fetchPlans, PlansConfig } from '@/lib/plans';

export function PricingSection() {
  const [plans, setPlans] = useState<PlansConfig | null>(null);

  useEffect(() => {
    fetchPlans().then(setPlans).catch(() => {});
  }, []);

  async function handleGetPro() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!token) {
      window.location.href = '/register';
      return;
    }
    const res = await apiFetch('/api/billing/checkout', { method: 'POST' });
    const data = await res.json();
    if (data.ok && data.url) window.location.href = data.url;
  }

  function handleStartFree() {
    window.location.href = '/register';
  }

  const d = plans?.display;
  const skeletonCell = <td className="p-6"><div className="h-4 w-16 bg-[var(--border)] rounded animate-pulse" /></td>;

  return (
    <section id="pricing" className="py-24 bg-[var(--page-bg)] text-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">Simple, transparent pricing</h2>
          <p className="text-[var(--text-muted)] text-lg max-w-2xl mx-auto">
            Start for free, upgrade when you need more power. No hidden limits.
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)]">
          <table className="w-full min-w-[800px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[#0A0D14]">
                <th className="p-6 w-1/4 font-medium text-[var(--text-muted)]">Features</th>
                <th className="p-6 w-1/4">
                  <div className="text-xl font-bold text-white mb-1">Standard</div>
                  <div className="text-sm font-normal text-[var(--text-muted)]">Free</div>
                </th>
                <th className="p-6 w-1/4 relative bg-[var(--primary-muted)]/10 border-x border-[var(--primary-muted)] shadow-[inset_0_4px_0_0_var(--primary)]">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--primary)] text-[var(--surface)] text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full whitespace-nowrap z-10">Most Popular</div>
                  <div className="text-xl font-bold text-[var(--primary)] mb-1">Pro</div>
                  <div className="text-sm font-normal text-[var(--text-muted)]">{d?.pro.price ?? '$10 / month'}</div>
                </th>
                <th className="p-6 w-1/4">
                  <div className="text-xl font-bold text-white mb-1">Enterprise</div>
                  <div className="text-sm font-normal text-[var(--text-muted)]">{d?.enterprise.price ?? 'Custom'}</div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] text-sm">
              <tr>
                <td className="p-6 text-[var(--text-secondary)] font-medium">Logs / month</td>
                {d ? <td className="p-6 text-white font-medium">{d.free.logs}</td> : skeletonCell}
                {d ? <td className="p-6 bg-[var(--primary-muted)]/5 border-x border-[var(--primary-muted)] text-white font-medium">{d.pro.logs}</td> : skeletonCell}
                {d ? <td className="p-6 text-white font-medium">{d.enterprise.logs}</td> : skeletonCell}
              </tr>
              <tr>
                <td className="p-6 text-[var(--text-secondary)] font-medium">Retention</td>
                {d ? <td className="p-6">{d.free.retention}</td> : skeletonCell}
                {d ? <td className="p-6 bg-[var(--primary-muted)]/5 border-x border-[var(--primary-muted)] font-medium text-[var(--primary)]">{d.pro.retention}</td> : skeletonCell}
                {d ? <td className="p-6">{d.enterprise.retention}</td> : skeletonCell}
              </tr>
              <tr>
                <td className="p-6 text-[var(--text-secondary)] font-medium">Storage</td>
                {d ? <td className="p-6">{d.free.storage}</td> : skeletonCell}
                {d ? <td className="p-6 bg-[var(--primary-muted)]/5 border-x border-[var(--primary-muted)]">{d.pro.storage}</td> : skeletonCell}
                {d ? <td className="p-6">{d.enterprise.storage}</td> : skeletonCell}
              </tr>
              <tr>
                <td className="p-6 text-[var(--text-secondary)] font-medium">Sources max</td>
                {d ? <td className="p-6">{d.free.sources}</td> : skeletonCell}
                {d ? <td className="p-6 bg-[var(--primary-muted)]/5 border-x border-[var(--primary-muted)]">{d.pro.sources}</td> : skeletonCell}
                {d ? <td className="p-6">{d.enterprise.sources}</td> : skeletonCell}
              </tr>
              <tr>
                <td className="p-6 text-[var(--text-secondary)] font-medium">Alerts</td>
                <td className="p-6 flex"><X className="w-5 h-5 text-gray-500" /></td>
                <td className="p-6 bg-[var(--primary-muted)]/5 border-x border-[var(--primary-muted)]"><div className="flex items-center gap-2"><Check className="w-5 h-5 text-[var(--primary)]" />{d?.pro.alerts || 'Yes'}</div></td>
                <td className="p-6"><div className="flex items-center gap-2"><Check className="w-5 h-5 text-[var(--primary)]" />{d?.enterprise.alerts || 'Advanced'}</div></td>
              </tr>
              <tr>
                <td className="p-6 text-[var(--text-secondary)] font-medium">Support</td>
                {d ? <td className="p-6">{d.free.support}</td> : skeletonCell}
                {d ? <td className="p-6 bg-[var(--primary-muted)]/5 border-x border-[var(--primary-muted)]">{d.pro.support}</td> : skeletonCell}
                {d ? <td className="p-6">{d.enterprise.support}</td> : skeletonCell}
              </tr>
              <tr className="bg-[#0A0D14]">
                <td className="p-6"></td>
                <td className="p-6"><button onClick={handleStartFree} className="w-full py-2 rounded-lg border border-[var(--border)] hover:bg-[var(--surface)] text-sm font-medium transition-colors cursor-pointer">Start Free</button></td>
                <td className="p-6 bg-[var(--primary-muted)]/5 border-x border-b border-[var(--primary-muted)]"><button onClick={handleGetPro} className="w-full py-2 rounded-lg bg-[var(--primary)] text-[var(--surface)] hover:bg-[var(--primary-hover)] text-sm font-bold transition-all hover:scale-105 cursor-pointer shadow-[0_0_15px_var(--primary-muted)]">Get Pro</button></td>
                <td className="p-6"><a href="mailto:contact@orion.dev" className="block w-full py-2 rounded-lg border border-[var(--border)] hover:bg-[var(--surface)] text-sm font-medium transition-colors text-center cursor-pointer">Contact Us</a></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
