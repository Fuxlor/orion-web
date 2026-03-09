import Link from 'next/link';
import { Terminal, ArrowRight } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center pt-24 pb-16 overflow-hidden">
      {/* Background gradients and grid */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-[var(--primary-muted)] blur-[120px] rounded-full opacity-50 mix-blend-screen" />
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] bg-[var(--primary-muted)] blur-[100px] rounded-full opacity-30 mix-blend-screen" />
        <div className="absolute inset-0 bg-grid-pattern [mask-image:linear-gradient(to_bottom,white,transparent)] opacity-20" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--surface-elevated)] border border-[var(--border)] text-sm font-medium text-[var(--primary)] mb-8 shadow-sm">
          <span className="flex h-2 w-2 rounded-full bg-[var(--primary)] animate-pulse"></span>
          Orion v1.0 is now live
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6 max-w-4xl leading-tight">
          Ship with confidence.<br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] to-emerald-400">
            Monitor with clarity.
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-[var(--text-muted)] max-w-2xl mb-10 leading-relaxed">
          The ultimate logging and monitoring platform for modern Node.js applications. 
          Real-time insights, zero configuration, infinite scalability.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-20 w-full justify-center">
          <Link href="/register" className="w-full sm:w-64 btn-primary px-8 py-4 text-base flex items-center justify-center gap-2 group transition-all hover:scale-105 shadow-[0_0_20px_var(--primary-muted)]">
            Get started for free
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="/docs" className="w-full sm:w-64 px-8 py-2.5 text-base font-medium rounded-lg bg-[var(--surface-elevated)] border border-[var(--border)] text-white hover:bg-[var(--border)] transition-colors flex items-center justify-center gap-2">
            <Terminal className="w-4 h-4 text-[var(--text-muted)]" />
            View documentation
          </Link>
        </div>
      </div>
    </section>
  );
}
