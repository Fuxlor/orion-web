"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { User } from "@/types";
import { useProject } from "@/contexts/projectContext";
import { useProjects } from "@/contexts/projectsContext";

function Logo() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      <circle cx="16" cy="16" r="14" stroke="var(--primary)" strokeWidth="2" fill="none" />
      <circle cx="16" cy="16" r="6" fill="var(--primary)" opacity="0.6" />
      <circle cx="16" cy="8" r="2" fill="var(--primary)" />
    </svg>
  );
}

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function LogOutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function LayoutGridIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

interface HeaderProps {
  user: User | null;
}

export default function Header({ user }: HeaderProps) {
  const { project } = useProject();
  const { projects } = useProjects();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const projectDropdownRef = useRef<HTMLDivElement>(null);

  const projectLabel = project?.label ?? "Overview";

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setDropdownOpen(false);
      }
      if (projectDropdownRef.current && !projectDropdownRef.current.contains(target)) {
        setProjectDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = user?.pseudo
    ? user.pseudo.slice(0, 2).toUpperCase()
    : user?.first_name && user?.last_name
      ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
      : user?.email?.slice(0, 2).toUpperCase() ?? "?";

  function handleLogout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    window.location.href = "/login";
  }

  return (
    <header className="h-14 border-b border-[var(--border)] bg-[var(--surface-elevated)] flex items-center justify-between px-4 shrink-0 gap-4">
      <Link
        href="/dashboard"
        className="flex items-center gap-2 text-white font-semibold text-lg tracking-tight hover:opacity-90 transition-opacity shrink-0"
      >
        <Logo />
        <span>Orion</span>
      </Link>

      {/* Project selector + create button */}
      <div className="relative flex flex-1 max-w-xs min-w-0 gap-0" ref={projectDropdownRef}>
        <button
          type="button"
          onClick={() => setProjectDropdownOpen((o) => !o)}
          className="flex flex-1 min-w-0 items-center gap-2 px-3 py-2 rounded-l-lg rounded-r-none border border-[var(--border)] border-r-0 bg-[var(--surface-input)] hover:border-[var(--primary)] transition-colors text-left"
          aria-expanded={projectDropdownOpen}
          aria-haspopup="listbox"
        >
          <LayoutGridIcon />
          <span className="flex-1 truncate text-sm font-medium text-[var(--text-secondary)]">
            {projectLabel}
          </span>
          <ChevronDown className={`shrink-0 text-[var(--text-muted)] transition-transform ${projectDropdownOpen ? "rotate-180" : ""}`} />
        </button>
        <Link
          href="/dashboard/projects/new"
          className="flex items-center justify-center w-10 shrink-0 py-2 rounded-r-lg rounded-l-none border border-[var(--primary)] bg-[var(--primary)] text-[var(--surface)] hover:bg-[var(--primary-hover)] transition-colors"
          aria-label="New project"
        >
          <PlusIcon />
        </Link>
        {projectDropdownOpen && (
          <div
            className="absolute left-0 right-0 top-full mt-2 py-1 bg-[var(--surface-elevated)] border border-[var(--border)] rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto"
            role="listbox"
          >
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--surface-input)] hover:text-white transition-colors"
              onClick={() => setProjectDropdownOpen(false)}
            >
              <LayoutGridIcon />
              Overview
            </Link>
            <div className="border-t border-[var(--border)] my-1" />
            {projects.map((p) => (
              <Link
                key={p.id}
                href={`/dashboard/projects/${p.name}`}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--surface-input)] hover:text-white transition-colors"
                onClick={() => setProjectDropdownOpen(false)}
              >
                {p.label}
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="relative shrink-0" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setDropdownOpen((o) => !o)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[var(--surface-input)] transition-colors border border-transparent hover:border-[var(--border)]"
          aria-expanded={dropdownOpen}
          aria-haspopup="true"
        >
          <div className="w-8 h-8 rounded-full bg-[var(--primary)] text-[var(--surface)] flex items-center justify-center text-sm font-semibold">
            {initials}
          </div>
          <span className="text-sm text-[var(--text-secondary)] hidden sm:inline max-w-[140px] truncate">
            {user?.pseudo ?? user?.email ?? "Account"}
          </span>
          <ChevronDown className={`text-[var(--text-muted)] transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 top-full mt-2 w-56 py-1 bg-[var(--surface-elevated)] border border-[var(--border)] rounded-lg shadow-xl z-50">
            <div className="px-4 py-3 border-b border-[var(--border)]">
              <p className="text-sm font-medium text-white truncate">{user?.pseudo ?? "User"}</p>
              <p className="text-xs text-[var(--text-muted)] truncate">{user?.email}</p>
            </div>
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--surface-input)] hover:text-white transition-colors"
              onClick={() => setDropdownOpen(false)}
            >
              <SettingsIcon />
              Settings
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-[var(--surface-input)] hover:text-red-300 transition-colors"
            >
              <LogOutIcon />
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
