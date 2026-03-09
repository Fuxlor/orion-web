import { Check, X } from 'lucide-react';

const limits = {
  free: {
    logs: "10 000",
    retention: "3 days",
    storage: "500 MB",
    sources: "1",
    alerts: false,
    support: "Community"
  },
  pro: {
    logs: "500 000",
    retention: "30 days",
    storage: "5 GB",
    sources: "10",
    alerts: "Yes",
    support: "Email"
  },
  enterprise: {
    logs: "Unlimited",
    retention: "90 days",
    storage: "50 GB",
    sources: "Unlimited",
    alerts: "Advanced",
    support: "Priority"
  }
};

export function PricingSection() {
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
                  <div className="text-sm font-normal text-[var(--text-muted)]">$29 / month</div>
                </th>
                <th className="p-6 w-1/4">
                  <div className="text-xl font-bold text-white mb-1">Enterprise</div>
                  <div className="text-sm font-normal text-[var(--text-muted)]">Custom</div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] text-sm">
              <tr>
                <td className="p-6 text-[var(--text-secondary)] font-medium">Logs / month</td>
                <td className="p-6 text-white font-medium">{limits.free.logs}</td>
                <td className="p-6 bg-[var(--primary-muted)]/5 border-x border-[var(--primary-muted)] text-white font-medium">{limits.pro.logs}</td>
                <td className="p-6 text-white font-medium">{limits.enterprise.logs}</td>
              </tr>
              <tr>
                <td className="p-6 text-[var(--text-secondary)] font-medium">Retention</td>
                <td className="p-6">{limits.free.retention}</td>
                <td className="p-6 bg-[var(--primary-muted)]/5 border-x border-[var(--primary-muted)] font-medium text-[var(--primary)]">{limits.pro.retention}</td>
                <td className="p-6">{limits.enterprise.retention}</td>
              </tr>
              <tr>
                <td className="p-6 text-[var(--text-secondary)] font-medium">Storage</td>
                <td className="p-6">{limits.free.storage}</td>
                <td className="p-6 bg-[var(--primary-muted)]/5 border-x border-[var(--primary-muted)]">{limits.pro.storage}</td>
                <td className="p-6">{limits.enterprise.storage}</td>
              </tr>
              <tr>
                <td className="p-6 text-[var(--text-secondary)] font-medium">Sources max</td>
                <td className="p-6">{limits.free.sources}</td>
                <td className="p-6 bg-[var(--primary-muted)]/5 border-x border-[var(--primary-muted)]">{limits.pro.sources}</td>
                <td className="p-6">{limits.enterprise.sources}</td>
              </tr>
              <tr>
                <td className="p-6 text-[var(--text-secondary)] font-medium">Alerts</td>
                <td className="p-6 flex"><X className="w-5 h-5 text-gray-500" /></td>
                <td className="p-6 bg-[var(--primary-muted)]/5 border-x border-[var(--primary-muted)]"><div className="flex items-center gap-2"><Check className="w-5 h-5 text-[var(--primary)]" /> Yes</div></td>
                <td className="p-6"><div className="flex items-center gap-2"><Check className="w-5 h-5 text-[var(--primary)]" /> Advanced</div></td>
              </tr>
              <tr>
                <td className="p-6 text-[var(--text-secondary)] font-medium">Support</td>
                <td className="p-6">{limits.free.support}</td>
                <td className="p-6 bg-[var(--primary-muted)]/5 border-x border-[var(--primary-muted)]">{limits.pro.support}</td>
                <td className="p-6">{limits.enterprise.support}</td>
              </tr>
              <tr className="bg-[#0A0D14]">
                <td className="p-6"></td>
                <td className="p-6"><button className="w-full py-2 rounded-lg border border-[var(--border)] hover:bg-[var(--surface)] text-sm font-medium transition-colors cursor-pointer">Start Free</button></td>
                <td className="p-6 bg-[var(--primary-muted)]/5 border-x border-b border-[var(--primary-muted)]"><button className="w-full py-2 rounded-lg bg-[var(--primary)] text-[var(--surface)] hover:bg-[var(--primary-hover)] text-sm font-bold transition-all hover:scale-105 cursor-pointer shadow-[0_0_15px_var(--primary-muted)]">Get Pro</button></td>
                <td className="p-6"><button className="w-full py-2 rounded-lg border border-[var(--border)] hover:bg-[var(--surface)] text-sm font-medium transition-colors cursor-pointer">Contact Us</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
