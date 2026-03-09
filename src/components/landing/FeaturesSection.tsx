import { RadioReceiver, Settings, BellRing, Activity } from 'lucide-react';

const features = [
  {
    icon: <RadioReceiver className="w-6 h-6 text-[var(--primary)]" />,
    title: "Real-time multi-source collection",
    description: "Stream logs from dozens of services instantly. Perfect for microservices architecture."
  },
  {
    icon: <Settings className="w-6 h-6 text-[var(--primary)]" />,
    title: "Simple SDK integration",
    description: "Drop-in configuration for Express, Fastify, and plain Node.js apps in under 3 minutes."
  },
  {
    icon: <BellRing className="w-6 h-6 text-[var(--primary)]" />,
    title: "Smart alerts & notifications",
    description: "Get notified via Slack, Email or Webhook before your users even notice an error."
  },
  {
    icon: <Activity className="w-6 h-6 text-[var(--primary)]" />,
    title: "Centralized monitoring dashboard",
    description: "A beautiful, fast, and intuitive interface to query, filter, and analyze all your logs."
  }
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-[var(--surface)] text-white relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">Everything you need to monitor</h2>
          <p className="text-[var(--text-muted)] text-lg max-w-2xl mx-auto">
            Built by developers for developers. Don't waste time configuring complex logging stacks.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, i) => (
            <div key={i} className="group p-8 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] hover:border-[var(--primary-muted)] transition-all hover:shadow-[0_0_30px_var(--primary-muted)]/10 text-left">
              <div className="w-12 h-12 rounded-lg bg-[#0d0f16] border border-[var(--border)] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-[var(--text-muted)] leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
