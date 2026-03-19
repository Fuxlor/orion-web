import { Terminal } from 'lucide-react';
import Link from 'next/link';

export function QuickstartSection() {
  return (
    <section className="py-24 bg-[var(--surface)] text-white border-y border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">Up and running in minutes</h2>
          <p className="text-[var(--text-muted)] text-lg max-w-2xl mx-auto">
            Three simple steps to integrate Orion into your Node.js application.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="relative p-8 rounded-2xl bg-[#0A0D14] border border-[var(--border)] group">
            <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-[var(--primary)] text-[var(--surface)] flex items-center justify-center font-bold text-lg shadow-[0_0_15px_var(--primary-muted)]">1</div>
            <h3 className="text-xl font-semibold mb-4 text-white">Install CLI & SDK</h3>
            <div className="p-4 rounded-lg bg-[#0d0f16] border border-[#252b3b] font-mono text-sm text-[var(--text-muted)] flex flex-col gap-2">
              <div><span className="text-[var(--primary)]">❯</span> npx orion-cli</div>
              <div><span className="text-[var(--primary)]">❯</span> npm install orion</div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative p-8 rounded-2xl bg-[#0A0D14] border border-[var(--border)] group">
            <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-[var(--primary)] text-[var(--surface)] flex items-center justify-center font-bold text-lg shadow-[0_0_15px_var(--primary-muted)]">2</div>
            <h3 className="text-xl font-semibold mb-4 text-white">Initialize Logger</h3>
            <div className="p-4 px-1 rounded-lg bg-[#0d0f16] border border-[#252b3b] font-mono text-xs md:text-sm text-[var(--text-muted)] overflow-x-auto whitespace-nowrap">
              <span className="text-purple-400">import</span> {'{'} <span className="text-yellow-200">createLogger</span> {'}'} <span className="text-purple-400">from</span> <span className="text-green-300">'orion'</span>;<br />
              <br />
              <span className="text-blue-400">const</span> logger = <span className="text-blue-400">await</span> <span className="text-yellow-200">createLogger</span>();
              <br />
              logger.<span className="text-yellow-200">info</span>(<span className="text-green-300">'Good to go!'</span>);
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative p-8 rounded-2xl bg-[#0A0D14] border border-[var(--border)] group">
            <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-[var(--primary)] text-[var(--surface)] flex items-center justify-center font-bold text-lg shadow-[0_0_15px_var(--primary-muted)]">3</div>
            <h3 className="text-xl font-semibold mb-4 text-white">Start Monitoring</h3>
            <div className="p-4 rounded-lg flex items-center justify-center h-[120px] bg-gradient-to-br from-[#0d0f16] to-[var(--card)] border border-[#252b3b]">
              <Link href="/register" className="flex items-center gap-2 px-6 py-3 rounded-lg bg-[var(--primary)] text-[var(--surface)] font-medium hover:scale-105 transition-transform shadow-[0_0_15px_var(--primary-muted)]">
                <Terminal className="w-5 h-5" /> Open Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
