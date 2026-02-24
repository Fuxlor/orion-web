"use client";

import { useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { useProjects } from "@/contexts/projectsContext";

function normalizeName(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function NewProjectPage() {
  const { refetch } = useProjects();
  const [name, setName] = useState("");
  const [label, setLabel] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [memberEmails, setMemberEmails] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<{ name: string; label: string; token: string } | null>(null);
  const [copied, setCopied] = useState(false);

  async function copyToken() {
    if (!created?.token) return;
    try {
      await navigator.clipboard.writeText(created.token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value.toLowerCase().replace(/\s+/g, "-");
    setName(v);
  }

  function addMember() {
    const email = memberEmail.trim().toLowerCase();
    if (!email) return;
    apiFetch("/api/projects/validate-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.ok) {
          throw new Error(data.message ?? data.error ?? "No account found with this email");
        }
        setMemberEmails((prev) => [...prev, email]);
        setMemberEmail("");
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "An error occurred while adding the member");
      });
  }

  function removeMember(email: string) {
    setMemberEmails((prev) => prev.filter((e) => e !== email));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const normalizedName = normalizeName(name);
    if (!normalizedName) {
      setError("Name is required (lowercase, use - for spaces)");
      return;
    }
    setSubmitting(true);
    apiFetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: normalizedName,
        label: label.trim(),
        memberEmails: memberEmails.length ? memberEmails : undefined,
      }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message ?? data.error ?? "Failed to create project");
        }
        setCreated({ name: data.name, label: data.label, token: data.token });
        refetch();
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to create project");
      })
      .finally(() => setSubmitting(false));
  }

  if (created) {
    return (
      <div className="min-h-screen bg-[var(--surface)] flex items-center justify-center p-6">
        <div className="w-full max-w-[24rem] bg-[var(--surface-elevated)] border border-[var(--border)] rounded-2xl p-8 shadow-xl">
          <h1 className="text-2xl font-bold text-white text-center tracking-tight m-0 mb-1">
            Orion
          </h1>
          <p className="text-[var(--text-muted)] text-sm text-center m-0 mb-6">
            Project created
          </p>
          <p className="text-[var(--text-secondary)] text-sm m-0 mb-4">
            <strong>{created.label}</strong> ({created.name})
          </p>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
            Project token
          </label>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-[var(--surface-input)] mb-4">
            <code className="flex-1 min-w-0 text-[var(--text-secondary)] text-sm font-mono break-all select-all">
              {created.token}
            </code>
            <button
              type="button"
              onClick={copyToken}
              className="shrink-0 p-1.5 rounded text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--primary-muted)] transition-colors cursor-pointer"
              aria-label={copied ? "Copied" : "Copy token"}
            >
              {copied ? (
                <svg className="w-4 h-4 text-[var(--primary)]" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 4h3a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h3m0 3h6m-6 7 2 2 4-4m-5-9v4h4V3h-4Z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 4h3a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h3m0 3h6m-6 5h6m-6 4h6M10 3v4h4V3h-4Z" />
                </svg>
              )}
            </button>
          </div>
          <p className="text-xs text-[var(--text-muted)] m-0 mb-6">
            Use this token to link your script. Keep it secret.
          </p>
          <div className="flex gap-3">
            <Link
              href="/dashboard"
              className="flex-1 py-3 px-5 rounded-lg font-medium text-[var(--text-secondary)] bg-[var(--surface-input)] border border-[var(--border)] hover:border-[var(--text-muted)] transition-colors cursor-pointer text-center text-base"
            >
              Dashboard
            </Link>
            <Link
              href={`/dashboard/projects/${created.name}`}
              className="flex-1 py-3 px-5 rounded-lg font-semibold text-[var(--surface)] bg-[var(--primary)] hover:bg-[var(--primary-hover)] transition-colors border-0 cursor-pointer text-center text-base"
            >
              Go to project
            </Link>
          </div>
          <p className="text-[var(--text-muted)] text-sm text-center m-0 mt-5">
            <Link href="/dashboard" className="text-[var(--primary)] underline hover:no-underline">
              Back to dashboard
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--surface)] flex items-center justify-center p-6">
      <div className="w-full max-w-[24rem] bg-[var(--surface-elevated)] border border-[var(--border)] rounded-2xl p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-white text-center tracking-tight m-0 mb-1">
          Orion
        </h1>
        <p className="text-[var(--text-muted)] text-sm text-center m-0 mb-6">
          New project
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label htmlFor="name" className="text-sm font-medium text-[var(--text-secondary)]">
            Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={handleNameChange}
            placeholder="my-project"
            autoComplete="off"
            className="w-full"
          />

          <label htmlFor="label" className="text-sm font-medium text-[var(--text-secondary)]">
            Label
          </label>
          <input
            id="label"
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="My Project"
            autoComplete="off"
            className="w-full"
          />

          <label className="text-sm font-medium text-[var(--text-secondary)]">
            Add members
          </label>
          <div className="flex gap-2">
            <input
              type="email"
              value={memberEmail}
              onChange={(e) => setMemberEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addMember())}
              placeholder="email@example.com"
              className="flex-1 min-w-0"
            />
            <button
              type="button"
              onClick={addMember}
              className="shrink-0 w-10 h-[2.625rem] flex items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface-input)] text-[var(--primary)] hover:border-[var(--primary)] transition-colors cursor-pointer text-lg leading-none"
              aria-label="Add member"
            >
              +
            </button>
          </div>
          {memberEmails.length > 0 && (
            <div className="flex flex-col gap-2">
              {memberEmails.map((email) => (
                <span
                  key={email}
                  className="flex items-center gap-2 w-[16.875rem] h-[2rem] px-3 pr-1 rounded-lg bg-[var(--surface-input)] border border-[var(--border)] text-[var(--text-secondary)]"
                >
                  <span className="flex-1 min-w-0 truncate text-sm">{email}</span>
                  <button
                    type="button"
                    onClick={() => removeMember(email)}
                    className="shrink-0 w-5 h-5 flex items-center justify-center rounded text-[var(--text-muted)] hover:text-red-400 hover:bg-red-400/10 transition-colors cursor-pointer"
                    aria-label={`Remove ${email}`}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          )}

          {error && (
            <p className="text-sm text-red-400 m-0 -mt-2" role="alert">
              {error}
            </p>
          )}

          <div className="flex gap-3 mt-2">
            <Link
              href="/dashboard"
              className="py-3 px-5 rounded-lg font-medium text-[var(--text-secondary)] bg-[var(--surface-input)] border border-[var(--border)] hover:border-[var(--text-muted)] transition-colors cursor-pointer text-base"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 px-5 rounded-lg font-semibold text-[var(--surface)] bg-[var(--primary)] hover:bg-[var(--primary-hover)] disabled:opacity-50 transition-colors border-0 cursor-pointer text-base"
            >
              {submitting ? "Creating…" : "Create project"}
            </button>
          </div>
        </form>

        <p className="text-[var(--text-muted)] text-sm text-center m-0 mt-5">
          <Link href="/dashboard" className="text-[var(--primary)] underline hover:no-underline">
            Back to dashboard
          </Link>
        </p>
      </div>
    </div>
  );
}
