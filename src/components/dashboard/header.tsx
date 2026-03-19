"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { LayoutGrid, Plus, ChevronDown, Settings, LogOut } from "lucide-react";
import { User } from "@/types";
import { useProject } from "@/contexts/projectContext";
import { useProjects } from "@/contexts/projectsContext";
import UserAvatar from "@/components/UserAvatar";

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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const projectLabel = project?.label ?? "Overview";

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setDropdownOpen(false);
      }
      if (
        projectDropdownRef.current &&
        !projectDropdownRef.current.contains(target)
      ) {
        setProjectDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleLogout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    window.location.href = "/login";
  }

  return (
    <header
      className="h-12 flex items-center px-5 shrink-0 gap-4"
      style={{
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        backgroundColor: "var(--surface)",
      }}
    >
      {/* Left spacer */}
      <div className="flex-1" />

      {/* Project selector (centered) */}
      <div
        className="flex items-center gap-2 min-w-0"
        ref={projectDropdownRef}
      >
        <div className="relative flex min-w-0 gap-0">
          <motion.button
            type="button"
            whileHover={{ backgroundColor: "rgba(255,255,255,0.08)" }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setProjectDropdownOpen((o) => !o)}
            className="flex flex-1 min-w-0 items-center gap-2 px-3 py-[6px] rounded-l-lg rounded-r-none text-[13px] font-medium text-left cursor-pointer"
            style={{
              backgroundColor: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRight: "none",
              color: "white",
            }}
            aria-expanded={projectDropdownOpen}
          >
            <LayoutGrid
              size={13}
              style={{ color: "var(--primary)", flexShrink: 0 }}
            />
            <span className="flex-1 truncate font-medium">{projectLabel}</span>
            <ChevronDown
              size={12}
              className={`shrink-0 transition-transform ${projectDropdownOpen ? "rotate-180" : ""}`}
              style={{ color: "#6b7280" }}
            />
          </motion.button>

          <Link href="/dashboard/projects/new" aria-label="New project">
            <motion.div
              whileHover={{
                scale: 1.08,
                boxShadow: "0 0 16px rgba(2,241,148,0.4)",
              }}
              whileTap={{ scale: 0.9 }}
              className="w-[30px] h-full flex items-center justify-center rounded-r-lg rounded-l-none"
              style={{ backgroundColor: "var(--primary)" }}
            >
              <Plus
                size={15}
                style={{ color: "#0d0f16" }}
                strokeWidth={2.5}
              />
            </motion.div>
          </Link>

          <AnimatePresence>
            {projectDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 right-0 top-full mt-1.5 py-1 rounded-[10px] overflow-hidden z-50"
                style={{
                  backgroundColor: "#13161f",
                  border: "1px solid rgba(255,255,255,0.1)",
                  boxShadow: "0 16px 40px rgba(0,0,0,0.5)",
                  minWidth: 200,
                }}
              >
                <p
                  className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: "#374151" }}
                >
                  Projects
                </p>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 px-3 py-2 text-[13px] transition-colors hover:bg-white/5"
                  style={{ color: "#d1d5db" }}
                  onClick={() => setProjectDropdownOpen(false)}
                >
                  <LayoutGrid size={13} style={{ color: "#4b5563" }} />
                  Overview
                </Link>
                <div
                  className="my-1"
                  style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
                />
                {projects.map((p) => (
                  <Link
                    key={p.id}
                    href={`/dashboard/projects/${p.name}`}
                    className="flex items-center gap-2 px-3 py-2 text-[13px] transition-colors hover:bg-white/5"
                    style={{
                      color:
                        project?.name === p.name ? "var(--primary)" : "#d1d5db",
                    }}
                    onClick={() => setProjectDropdownOpen(false)}
                  >
                    <LayoutGrid
                      size={13}
                      style={{
                        color:
                          project?.name === p.name
                            ? "var(--primary)"
                            : "#4b5563",
                      }}
                    />
                    {p.label}
                    {project?.name === p.name && (
                      <span
                        className="ml-auto w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: "var(--primary)" }}
                      />
                    )}
                  </Link>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Right: user menu */}
      <div className="flex-1 flex justify-end">
      <div className="relative shrink-0" ref={dropdownRef}>
        <motion.button
          type="button"
          whileHover={{ backgroundColor: "rgba(255,255,255,0.06)" }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setDropdownOpen((o) => !o)}
          className="flex items-center gap-2 px-2.5 py-[5px] rounded-lg cursor-pointer"
          aria-expanded={dropdownOpen}
        >
          {mounted && <UserAvatar user={user} size={26} />}
          <span
            className="text-[13px] font-medium hidden sm:inline max-w-[140px] truncate"
            style={{ color: "white" }}
          >
            {mounted ? (user?.pseudo ?? user?.email ?? "Account") : null}
          </span>
          <ChevronDown
            size={12}
            className={`transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
            style={{ color: "#6b7280" }}
          />
        </motion.button>

        <AnimatePresence>
          {dropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-1.5 w-56 py-1 rounded-[10px] z-50 overflow-hidden"
              style={{
                backgroundColor: "#13161f",
                border: "1px solid rgba(255,255,255,0.1)",
                boxShadow: "0 16px 40px rgba(0,0,0,0.5)",
              }}
            >
              <div
                className="px-4 py-3"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
              >
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-white truncate">
                    {user?.pseudo ?? "User"}
                  </p>
                  {user?.plan && (
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                      style={{
                        backgroundColor: "rgba(2,241,148,0.12)",
                        color: "var(--primary)",
                      }}
                    >
                      {user.plan.slice(0, 1).toUpperCase() +
                        user.plan.slice(1)}
                    </span>
                  )}
                </div>
                <p
                  className="text-xs truncate mt-0.5"
                  style={{ color: "#6b7280" }}
                >
                  {user?.email}
                </p>
              </div>
              <Link
                href="/settings"
                className="flex items-center gap-2 px-4 py-2 text-sm transition-colors hover:bg-white/5"
                style={{ color: "#d1d5db" }}
                onClick={() => setDropdownOpen(false)}
              >
                <Settings size={14} style={{ color: "#6b7280" }} />
                Settings
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm transition-colors hover:bg-white/5"
                style={{ color: "#f87171" }}
              >
                <LogOut size={14} />
                Sign out
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      </div>
    </header>
  );
}
