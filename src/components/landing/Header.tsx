"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${scrolled ? "bg-[#0d0f16]/80 backdrop-blur-md border-[var(--border)]" : "bg-transparent border-transparent"}`}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-[var(--primary)] flex items-center justify-center">
              <Image src="/orion-nobg.png" alt="Orion Logo" width={128} height={128} />
            </div>
            Orion
          </Link>
          <nav className="hidden md:flex gap-6 text-sm font-medium text-[var(--text-muted)]">
            <Link href="#features" className="hover:text-white transition-colors">Features</Link>
            <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="/docs" className="hover:text-white transition-colors">Docs</Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-white hover:text-[var(--primary)] transition-colors hidden md:block">
            Login
          </Link>
          <Link href="/register" className="btn-primary text-sm px-4 py-2">
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}
