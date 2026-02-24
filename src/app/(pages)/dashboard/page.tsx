"use client";

import Link from "next/link";
import { useProjects } from "@/contexts/projectsContext";

export default function OverviewPage() {
  const { projects, loading } = useProjects();

  return (
    <div>
      {/* <h1 className="text-xl font-semibold text-white mb-2">Overview</h1>
      <p className="text-[var(--text-secondary)] mb-6">
        High-level view across all your projects. Select a project above to drill into its logs, sources, and alerts.
      </p> */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p className="text-[var(--text-muted)] col-span-full">Loading projects…</p>
        ) : projects.length === 0 ? (
          <Link
            href="/dashboard/projects/new"
            className="block p-4 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] hover:border-[var(--primary)] transition-colors"
          >
            <h2 className="font-medium text-white">New project</h2>
            <p className="text-sm text-[var(--text-muted)] mt-1">Create your first project →</p>
          </Link>
        ) : (
          <>
            {projects.map((p) => (
              <Link
                key={p.id}
                href={`/dashboard/projects/${p.name}`}
                className="block p-4 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] hover:border-[var(--primary)] transition-colors"
              >
                <h2 className="font-medium text-white">{p.label}</h2>
                <p className="text-sm text-[var(--text-muted)] mt-1">View project details →</p>
              </Link>
            ))}
          </>
        )}
      </div>
    </div>
  );
}