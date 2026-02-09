"use client";

import { useState } from "react";
import Link from "next/link";

const BULLET = "•";

function maskPassword(password: string): string {
  if (password.length === 0) return "";
  return BULLET.repeat(password.length - 1) + password.slice(-1);
}

function passwordFromDisplay(prevPassword: string, display: string): string {
  const prevLen = prevPassword.length;
  const newLen = display.length;
  if (newLen > prevLen) {
    return prevPassword + display.slice(prevLen);
  }
  if (newLen < prevLen) {
    return prevPassword.slice(0, newLen);
  }
  return prevPassword.slice(0, -1) + display.slice(-1);
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: wire to auth
    console.log({ email, password });
  }

  function handlePasswordChange(e: React.ChangeEvent<HTMLInputElement>) {
    const display = e.target.value;
    setPassword((prev) => passwordFromDisplay(prev, display));
  }

  return (
    <div className="min-h-screen bg-[var(--surface)] flex items-center justify-center p-6">
      <div className="w-full max-w-[24rem] bg-[var(--surface-elevated)] border border-[var(--border)] rounded-2xl p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-white text-center tracking-tight m-0 mb-1">
          Orion
        </h1>
        <p className="text-[var(--text-muted)] text-sm text-center m-0 mb-7">
          Sign in to your account
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label htmlFor="email" className="text-sm font-medium text-[var(--text-secondary)]">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            className="w-full"
          />

          <label htmlFor="password" className="text-sm font-medium text-[var(--text-secondary)]">
            Password
          </label>
          <input
            id="password"
            type="text"
            inputMode="text"
            autoComplete="current-password"
            placeholder="••••••••"
            value={maskPassword(password)}
            onChange={handlePasswordChange}
            required
            className="w-full font-mono"
          />

          <button
            type="submit"
            className="w-full mt-2 py-3 px-5 rounded-lg font-semibold text-[var(--surface)] bg-[var(--primary)] hover:bg-[var(--primary-hover)] transition-colors border-0 cursor-pointer text-base"
          >
            Sign in
          </button>
        </form>
        <p className="text-[var(--text-muted)] text-sm text-center m-0 mt-2">
          Don&apos;t have an account? <Link href="/register" className="text-[var(--primary)] underline hover:no-underline">Register</Link>
        </p>
      </div>
    </div>
  );
}
