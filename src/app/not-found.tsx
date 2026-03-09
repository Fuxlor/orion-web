"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--page-bg)] flex flex-col">
      <main className="flex-1 relative flex items-center justify-center overflow-hidden py-24">
        {/* Background gradients */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[20%] left-[20%] w-[40%] h-[40%] bg-[var(--primary-muted)] blur-[120px] rounded-full opacity-30 mix-blend-screen" />
          <div className="absolute bottom-[20%] right-[20%] w-[30%] h-[30%] bg-[var(--primary-muted)] blur-[100px] rounded-full opacity-20 mix-blend-screen" />
          <div className="absolute inset-0 bg-grid-pattern [mask-image:linear-gradient(to_bottom,white,transparent)] opacity-20" />
        </div>

        <div className="relative z-10 max-w-2xl mx-auto px-6 flex flex-col items-center text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] mb-8 shadow-sm">
            <span className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] to-emerald-400">404</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
            Page not found
          </h1>
          
          <p className="text-lg text-[var(--text-muted)] mb-10 leading-relaxed max-w-md">
            Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
          </p>
          
          <Link href="/" className="btn-primary px-8 py-3 text-base flex items-center justify-center gap-2 group transition-all hover:scale-105 shadow-[0_0_20px_var(--primary-muted)]">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to home
          </Link>
        </div>
      </main>
    </div>
  );
}