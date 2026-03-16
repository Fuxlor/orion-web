"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useProject } from "@/contexts/projectContext";

function NavIcon({ children, active }: { children: React.ReactNode; active?: boolean }) {
  return (
    <span
      className={`flex items-center justify-center w-5 h-5 shrink-0 ${active ? "text-[var(--primary)]" : "text-[var(--text-muted)]"}`}
    >
      {children}
    </span>
  );
}

const icons: Record<string, React.ReactNode> = {
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
  servers: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="2" width="20" height="8" rx="2" />
      <rect x="2" y="14" width="20" height="8" rx="2" />
      <line x1="6" y1="6" x2="6.01" y2="6" />
      <line x1="6" y1="18" x2="6.01" y2="18" />
    </svg>
  ),
  settings: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
};

function ChevronRight({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-4 h-4 text-[var(--text-muted)] transition-transform shrink-0 ${open ? "rotate-90" : ""}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

function SubLink({ href, children, active }: { href: string; children: React.ReactNode; active?: boolean }) {
  return (
    <Link
      href={href}
      className={`block px-3 py-1.5 pl-11 rounded text-sm transition-colors truncate ${active ? "text-[var(--primary)] font-medium" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
        }`}
    >
      {children}
    </Link>
  );
}

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
      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${active
        ? "bg-[var(--primary-muted)] text-[var(--primary)]"
        : "text-[var(--text-secondary)] hover:bg-[var(--surface-input)] hover:text-white"
        }`}
    >
      <NavIcon active={active}>{icon}</NavIcon>
      <span className="truncate">{children}</span>
    </Link>
  );
}

function NavSectionWithLink({
  href,
  label,
  icon,
  open,
  onToggle,
  active,
  children,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  open: boolean;
  onToggle: () => void;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-0.5">
      <div className="flex items-center gap-1 px-1 py-0.5">
        <Link
          href={href}
          className={`flex flex-1 items-center gap-3 px-2 py-2 rounded-lg text-sm font-medium transition-colors min-w-0 ${active
            ? "bg-[var(--primary-muted)] text-[var(--primary)]"
            : "text-[var(--text-secondary)] hover:bg-[var(--surface-input)] hover:text-white"
            }`}
        >
          <NavIcon active={active}>{icon}</NavIcon>
          <span className="truncate">{label}</span>
        </Link>
        <button
          type="button"
          onClick={onToggle}
          className="p-1.5 rounded hover:bg-[var(--surface-input)] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
          aria-label={open ? "Collapse" : "Expand"}
        >
          <ChevronRight open={open} />
        </button>
      </div>
      {open && <div className="space-y-0.5">{children}</div>}
    </div>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [logsManuallyOpen, setLogsManuallyOpen] = useState(false);
  const [serversManuallyOpen, setServersManuallyOpen] = useState(false);
  const logsOpen = pathname.includes("/logs") || logsManuallyOpen;
  const serversOpen = pathname.includes("/servers") || serversManuallyOpen;
  const { sources, servers, projectName } = useProject();

  return (
    <nav className="w-56 shrink-0 h-full flex flex-col border-r border-[var(--border)] bg-[var(--surface-elevated)] overflow-y-auto">
      <div className="p-3 space-y-1">
        <NavLink href="/dashboard" icon={icons.overview} active={pathname === "/dashboard"}>
          Overview
        </NavLink>

        {projectName && (
          <>
            <div className="pt-2 pb-1">
              <p className="px-3 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                Project
              </p>
            </div>
            <NavLink
              href={`/dashboard/projects/${projectName}`}
              icon={icons.dashboard}
              active={pathname === `/dashboard/projects/${projectName}`}
            >
              Dashboard
            </NavLink>
            {sources?.length > 0 && <><NavSectionWithLink
              href={`/dashboard/projects/${projectName}/logs`}
              label="Logs"
              icon={icons.logs}
              open={logsOpen}
              onToggle={() => setLogsManuallyOpen((o) => !o)}
              active={
                pathname === `/dashboard/projects/${projectName}/logs` ||
                pathname.startsWith(`/dashboard/projects/${projectName}/logs/`)
              }
            >
              {sources?.map((s) => (
                <SubLink
                  key={s.name}
                  href={`/dashboard/projects/${projectName}/logs/${s.name}`}
                  active={pathname === `/dashboard/projects/${projectName}/logs/${s.name}`}
                >
                  {s.name}
                </SubLink>
              ))}
            </NavSectionWithLink>
              {servers?.length > 0 && (
                <NavSectionWithLink
                  href={`/dashboard/projects/${projectName}/servers`}
                  label="Servers"
                  icon={icons.servers}
                  open={serversOpen}
                  onToggle={() => setServersManuallyOpen((o) => !o)}
                  active={
                    pathname === `/dashboard/projects/${projectName}/servers` ||
                    pathname.startsWith(`/dashboard/projects/${projectName}/servers/`)
                  }
                >
                  {servers.map((srv) => (
                    <SubLink
                      key={srv.hostname}
                      href={`/dashboard/projects/${projectName}/servers/${encodeURIComponent(srv.hostname)}`}
                      active={pathname === `/dashboard/projects/${projectName}/servers/${encodeURIComponent(srv.hostname)}`}
                    >
                      {srv.hostname}
                    </SubLink>
                  ))}
                </NavSectionWithLink>
              )}
              <NavLink
                href={`/dashboard/projects/${projectName}/alerts`}
                icon={icons.alert}
                active={pathname === `/dashboard/projects/${projectName}/alerts`}
              >
                Alerts
              </NavLink>
              <NavLink
                href={`/dashboard/projects/${projectName}/settings`}
                icon={icons.settings}
                active={pathname.startsWith(`/dashboard/projects/${projectName}/settings`)}
              >
                Settings
              </NavLink></>}
          </>
        )}
      </div>
    </nav>
  );
}
