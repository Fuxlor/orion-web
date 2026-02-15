"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getProjectFromPathname } from "@/lib/projects";

function NavIcon({ children, active }: { children: React.ReactNode; active?: boolean }) {
  return (
    <span
      className={`flex items-center justify-center w-5 h-5 shrink-0 ${active ? "text-[var(--primary)]" : "text-[var(--text-muted)]"}`}
    >
      {children}
    </span>
  );
}

const icons = {
  overview: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  ),
  dashboard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  ),
  source: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  logs: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  ),
  alert: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
};

function NavLink({
  href,
  icon,
  children,
  active,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        active
          ? "bg-[var(--primary-muted)] text-[var(--primary)]"
          : "text-[var(--text-secondary)] hover:bg-[var(--surface-input)] hover:text-white"
      }`}
    >
      <NavIcon active={active}>{icon}</NavIcon>
      <span className="truncate">{children}</span>
    </Link>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const projectId = getProjectFromPathname(pathname);

  return (
    <nav className="w-56 shrink-0 h-full flex flex-col border-r border-[var(--border)] bg-[var(--surface-elevated)] overflow-y-auto">
      <div className="p-3 space-y-1">
        <NavLink href="/dashboard" icon={icons.overview} active={pathname === "/dashboard"}>
          Overview
        </NavLink>

        {projectId && (
          <>
            <div className="pt-2 pb-1">
              <p className="px-3 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                Project
              </p>
            </div>
            <NavLink
              href={`/dashboard/projects/${projectId}`}
              icon={icons.dashboard}
              active={pathname === `/dashboard/projects/${projectId}`}
            >
              Dashboard
            </NavLink>
            <NavLink
              href={`/dashboard/projects/${projectId}/sources`}
              icon={icons.source}
              active={pathname === `/dashboard/projects/${projectId}/sources`}
            >
              Log Sources
            </NavLink>
            <NavLink
              href={`/dashboard/projects/${projectId}/logs`}
              icon={icons.logs}
              active={pathname === `/dashboard/projects/${projectId}/logs`}
            >
              Logs
            </NavLink>
            <NavLink
              href={`/dashboard/projects/${projectId}/alerts`}
              icon={icons.alert}
              active={pathname === `/dashboard/projects/${projectId}/alerts`}
            >
              Alerts
            </NavLink>
          </>
        )}
      </div>
    </nav>
  );
}
