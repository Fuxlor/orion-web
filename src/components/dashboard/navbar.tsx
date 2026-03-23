"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutGrid,
  FileText,
  Server,
  Bell,
  Settings,
  ChevronRight,
  SquareCode
} from "lucide-react";
import { useProject } from "@/contexts/projectContext";

function NavItem({
  href,
  icon,
  label,
  active,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ x: 2 }}
        whileTap={{ scale: 0.97 }}
        className="flex items-center gap-2 px-2.5 py-[7px] rounded-lg text-[13px] font-medium cursor-pointer mb-0.5 transition-colors"
        style={{
          color: active ? "var(--primary)" : "#9ba3af",
          backgroundColor: active ? "rgba(2,241,148,0.08)" : "transparent",
        }}
      >
        <span
          className="w-[15px] h-[15px] shrink-0 flex items-center justify-center"
          style={{ color: active ? "var(--primary)" : "#6b7280" }}
        >
          {icon}
        </span>
        <span className="truncate">{label}</span>
      </motion.div>
    </Link>
  );
}

function ExpandItem({
  href,
  icon,
  label,
  open,
  onToggle,
  active,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  open: boolean;
  onToggle: () => void;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-0.5">
      <div className="flex items-center gap-1 pr-1">
        <Link href={href} className="flex-1 min-w-0">
          <motion.div
            whileHover={{ x: 2 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-2.5 py-[7px] rounded-lg text-[13px] font-medium cursor-pointer transition-colors"
            style={{
              color: active ? "var(--primary)" : "#9ba3af",
              backgroundColor: active ? "rgba(2,241,148,0.08)" : "transparent",
            }}
          >
            <span
              className="w-[15px] h-[15px] shrink-0 flex items-center justify-center"
              style={{ color: active ? "var(--primary)" : "#6b7280" }}
            >
              {icon}
            </span>
            <span className="truncate flex-1">{label}</span>
          </motion.div>
        </Link>
        <button
          type="button"
          onClick={onToggle}
          className="p-1.5 rounded hover:bg-white/5 transition-colors"
          aria-label={open ? "Collapse" : "Expand"}
        >
          <motion.span
            animate={{ rotate: open ? 90 : 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-center"
            style={{ color: "#4b5563" }}
          >
            <ChevronRight size={13} />
          </motion.span>
        </button>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden pl-7"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SubLink({
  href,
  children,
  active,
}: {
  href: string;
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className="block px-2.5 py-[5px] rounded text-[12px] mb-px transition-colors truncate hover:text-white"
      style={{ color: active ? "var(--primary)" : "#6b7280" }}
    >
      {children}
    </Link>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [logsManuallyOpen, setLogsManuallyOpen] = useState(false);
  const [serversManuallyOpen, setServersManuallyOpen] = useState(false);
  const [sourcesManuallyOpen, setSourcesManuallyOpen] = useState(false);
  const logsOpen = pathname.includes("/logs") || logsManuallyOpen;
  const serversOpen = pathname.includes("/servers") || serversManuallyOpen;
  const sourcesOpen = pathname.includes("/sources") || sourcesManuallyOpen;
  const { sources, servers, projectName } = useProject();

  return (
    <nav
      className="w-[184px] shrink-0 h-full flex flex-col overflow-y-auto"
      style={{
        backgroundColor: "var(--sidebar)",
        borderRight: "1px solid var(--sidebar-border)",
      }}
    >
      {/* Brand */}
      <div
        className="h-12 flex items-center gap-2 px-4 shrink-0"
        style={{ borderBottom: "1px solid var(--sidebar-border)" }}
      >
        <div
          className="w-[26px] h-[26px] rounded-[7px] flex items-center justify-center overflow-hidden shrink-0"
          style={{ backgroundColor: "var(--primary)" }}
        >
          <Image
            src="/orion-nobg.png"
            alt="Orion"
            width={32}
            height={32}
            className="object-contain"
            style={{ filter: "brightness(0)" }}
          />
        </div>
        <span
          className="text-[15px] font-extrabold tracking-tight"
          style={{ color: "var(--sidebar-foreground)" }}
        >
          Orion
        </span>
      </div>

      {/* Nav */}
      <div className="flex-1 p-2.5 space-y-0.5">
        <NavItem
          href="/dashboard"
          icon={<LayoutGrid size={15} />}
          label="Overview"
          active={pathname === "/dashboard"}
        />

        <AnimatePresence>
          {projectName && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              <p
                className="px-2.5 pt-3.5 pb-1.5 text-[10px] font-bold uppercase tracking-widest"
                style={{ color: "#374151" }}
              >
                Project
              </p>

              <NavItem
                href={`/dashboard/projects/${projectName}`}
                icon={<LayoutGrid size={15} />}
                label="Dashboard"
                active={pathname === `/dashboard/projects/${projectName}`}
              />

              {sources?.length > 0 && (
                <>
                  <NavItem
                    href={`/dashboard/projects/${projectName}/logs`}
                    icon={<FileText size={15} />}
                    label="Logs"
                    active={
                      pathname === `/dashboard/projects/${projectName}/logs` ||
                      pathname.startsWith(
                        `/dashboard/projects/${projectName}/logs/`
                      )
                    }
                  />
                  {/* <ExpandItem
                    href={`/dashboard/projects/${projectName}/logs`}
                    icon={<FileText size={15} />}
                    label="Logs"
                    open={logsOpen}
                    onToggle={() => setLogsManuallyOpen((o) => !o)}
                    active={
                      pathname === `/dashboard/projects/${projectName}/logs` ||
                      pathname.startsWith(
                        `/dashboard/projects/${projectName}/logs/`
                      )
                    }
                  >
                    {sources.map((s) => (
                      <SubLink
                        key={s.name}
                        href={`/dashboard/projects/${projectName}/logs/${s.name}`}
                        active={
                          pathname ===
                          `/dashboard/projects/${projectName}/logs/${s.name}`
                        }
                      >
                        {s.name}
                      </SubLink>
                    ))}
                  </ExpandItem> */}

                  {servers?.length > 0 && (
                    <ExpandItem
                      href={`/dashboard/projects/${projectName}/servers`}
                      icon={<Server size={15} />}
                      label="Servers"
                      open={serversOpen}
                      onToggle={() => setServersManuallyOpen((o) => !o)}
                      active={
                        pathname ===
                        `/dashboard/projects/${projectName}/servers` ||
                        pathname.startsWith(
                          `/dashboard/projects/${projectName}/servers/`
                        )
                      }
                    >
                      {servers.map((srv) => (
                        <SubLink
                          key={srv.hostname}
                          href={`/dashboard/projects/${projectName}/servers/${encodeURIComponent(srv.hostname)}`}
                          active={
                            pathname ===
                            `/dashboard/projects/${projectName}/servers/${encodeURIComponent(srv.hostname)}`
                          }
                        >
                          {srv.hostname}
                        </SubLink>
                      ))}
                    </ExpandItem>
                  )}

                  <ExpandItem
                    href={`/dashboard/projects/${projectName}/sources`}
                    icon={<SquareCode size={15} />}
                    label="Sources"
                    open={sourcesOpen}
                    onToggle={() => setSourcesManuallyOpen((o) => !o)}
                    active={
                      pathname === `/dashboard/projects/${projectName}/sources` ||
                      pathname.startsWith(
                        `/dashboard/projects/${projectName}/sources/`
                      )
                    }
                  >
                    {sources.map((s) => (
                      <SubLink
                        key={s.name}
                        href={`/dashboard/projects/${projectName}/sources/${s.name}`}
                        active={
                          pathname ===
                          `/dashboard/projects/${projectName}/sources/${s.name}`
                        }
                      >
                        {s.name}
                      </SubLink>
                    ))}
                  </ExpandItem>

                  <NavItem
                    href={`/dashboard/projects/${projectName}/alerts`}
                    icon={<Bell size={15} />}
                    label="Alerts"
                    active={
                      pathname === `/dashboard/projects/${projectName}/alerts`
                    }
                  />

                  <NavItem
                    href={`/dashboard/projects/${projectName}/settings`}
                    icon={<Settings size={15} />}
                    label="Settings"
                    active={pathname.startsWith(
                      `/dashboard/projects/${projectName}/settings`
                    )}
                  />
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
