"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Plus, ArrowRight, Crown } from "lucide-react";
import { useProjects } from "@/contexts/projectsContext";

export default function OverviewPage() {
  const { projects, loading } = useProjects();

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: "var(--foreground)",
              marginBottom: 4,
            }}
          >
            Projects
          </h1>
          {!loading && (
            <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
              {projects.length} project{projects.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        <Link href="/dashboard/projects/new">
          <motion.div
            whileHover={{
              scale: 1.03,
              boxShadow: "0 0 20px rgba(2,241,148,0.3)",
            }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1.5 cursor-pointer"
            style={{
              backgroundColor: "var(--primary)",
              color: "var(--primary-foreground)",
              borderRadius: 9,
              padding: "9px 16px",
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            <Plus size={14} strokeWidth={2.5} /> New project
          </motion.div>
        </Link>
      </div>

      {/* Grid */}
      {loading ? (
        <div
          className="grid gap-3.5"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          }}
        >
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-lg"
              style={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                height: 160,
              }}
            />
          ))}
        </div>
      ) : (
        <div
          className="grid gap-3.5"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          }}
        >
          {projects.map((project, i) => (
            <Link key={project.id} href={`/dashboard/projects/${project.name}`}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.125 }}
                whileHover={{
                  y: -4,
                  borderColor: "var(--level-info-border)",
                  boxShadow: "0 16px 48px rgba(2,241,148,0.07)",
                }}
                whileTap={{ scale: 0.98 }}
                className="p-6 cursor-pointer"
                style={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 14,
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-3 mb-5">
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex gap-2">
                      {project.role === 'owner' && (
                        <Crown size={14} style={{ color: "var(--primary)", marginTop: "0.2em" }} />
                      )}
                      <div
                        title={project.label}
                        style={{
                          fontSize: 15,
                          fontWeight: 700,
                          color: "var(--foreground)",
                          marginBottom: 6,
                          letterSpacing: "-0.01em",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                        }}
                      >
                        {project.label}
                      </div>
                    </div>
                    <div
                      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold max-w-full"
                      style={{
                        backgroundColor: "var(--accent)",
                        color: "var(--primary)",
                      }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: "var(--primary)" }}
                      />
                      <span className="truncate">{project.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5" style={{ marginTop: 4 }}>
                    <ArrowRight size={16} style={{ color: "var(--text-muted)" }} />
                  </div>
                </div>

                {/* Footer */}
                <div
                  className="pt-3.5 flex items-center justify-end"
                  style={{ borderTop: "1px solid var(--border)" }}
                >
                  <span
                    className="flex items-center gap-1 text-[12px] font-semibold"
                    style={{ color: "var(--primary)" }}
                  >
                    View project <ArrowRight size={11} />
                  </span>
                </div>
              </motion.div>
            </Link>
          ))}

          {/* Add project card */}
          <Link href="/dashboard/projects/new">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.125 }}
              whileHover={{
                y: -4,
                borderColor: "var(--level-info-border)",
                backgroundColor: "var(--accent)",
              }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center flex-col gap-2 cursor-pointer"
              style={{
                backgroundColor: "transparent",
                border: "1px dashed var(--border)",
                borderRadius: 14,
                padding: 24,
                minHeight: 150,
                transition: "border-color 0.2s, background-color 0.2s",
              }}
            >
              <div
                className="flex items-center justify-center rounded-[10px]"
                style={{
                  width: 38,
                  height: 38,
                  backgroundColor: "var(--accent)",
                }}
              >
                <Plus size={18} style={{ color: "var(--primary)" }} />
              </div>
              <span
                style={{
                  fontSize: 13,
                  color: "var(--text-muted)",
                  fontWeight: 500,
                }}
              >
                New project
              </span>
            </motion.div>
          </Link>
        </div>
      )}
    </div>
  );
}
