import Link from 'next/link';
import Image from 'next/image';

export function Footer() {
  return (
    <footer className="bg-[#0A0D14] text-[var(--text-muted)] py-12 border-t border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-white font-bold text-lg tracking-tight">
            <div className="w-6 h-6 rounded bg-[var(--primary)] flex items-center justify-center">
              <Image src="/orion-nobg.png" alt="Orion" width={32} height={32} />
            </div>
            Orion
          </div>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm font-medium">
            <Link href="/docs" className="hover:text-white transition-colors">Documentation</Link>
            <a href="https://github.com/orion-moniroting" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">GitHub</a>
            <Link href="/status" className="hover:text-white transition-colors flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--primary)] shadow-[0_0_8px_var(--primary)]"></span> Status</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-[var(--border)] text-center text-sm opacity-60">
          &copy; {new Date().getFullYear()} Orion Monitoring. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
