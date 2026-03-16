"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { startAuthentication } from "@simplewebauthn/browser";
import { apiFetch } from "@/lib/api";

const BULLET = "•";

function maskPassword(password: string): string {
  if (password.length === 0) return "";
  return BULLET.repeat(password.length - 1) + password.slice(-1);
}

function passwordFromDisplay(prevPassword: string, display: string): string {
  const prevLen = prevPassword.length;
  const newLen = display.length;
  if (newLen > prevLen) return prevPassword + display.slice(prevLen);
  if (newLen < prevLen) return prevPassword.slice(0, newLen);
  return prevPassword.slice(0, -1) + display.slice(-1);
}

export default function LoginPage() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [passkeyLoading, setPasskeyLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }).then(res => res.json()).then(data => {
      if (data.error) {
        setError(data.message);
      } else {
        setError("");
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("user", JSON.stringify(data.user));
        const next = searchParams.get("next");
        window.location.href = next ?? "/dashboard";
      }
    }).catch(err => {
      setError("An error occurred: " + err.message);
    });
  }

  async function handlePasskeyLogin() {
    setError("");
    setPasskeyLoading(true);
    try {
      const optRes = await apiFetch("/api/auth/passkey/login-options", {
        method: "POST",
        body: JSON.stringify({ email: email || undefined }),
      });
      if (!optRes.ok) {
        setError("Failed to start passkey authentication");
        return;
      }
      const options = await optRes.json();
      const response = await startAuthentication({ optionsJSON: options });
      const loginRes = await apiFetch("/api/auth/passkey/login", {
        method: "POST",
        body: JSON.stringify(response),
      });
      const data = await loginRes.json();
      if (!loginRes.ok) {
        setError(data.error || "Passkey authentication failed");
        return;
      }
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("user", JSON.stringify(data.user));
      const next = searchParams.get("next");
      window.location.href = next ?? "/dashboard";
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "NotAllowedError") {
        setError(err.message || "Passkey authentication failed");
      }
    } finally {
      setPasskeyLoading(false);
    }
  }

  function handlePasswordChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPassword((prev) => passwordFromDisplay(prev, e.target.value));
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
            className="w-full text-[var(--text-secondary)]"
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
            className="w-full font-mono text-[var(--text-secondary)]"
          />

          {error && (
            <p className="text-sm text-red-400 m-0 -mt-2" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full mt-2 py-3 px-5 rounded-lg font-semibold text-[var(--surface)] bg-[var(--primary)] hover:bg-[var(--primary-hover)] transition-colors border-0 cursor-pointer text-base"
          >
            Sign in
          </button>
        </form>

        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 border-t border-[var(--border)]" />
          <span className="text-xs text-[var(--text-muted)]">or</span>
          <div className="flex-1 border-t border-[var(--border)]" />
        </div>

        <button
          type="button"
          onClick={handlePasskeyLogin}
          disabled={passkeyLoading}
          className="w-full py-3 px-5 rounded-lg font-semibold text-[var(--text-secondary)] bg-transparent border border-[var(--border)] hover:border-[var(--primary)] transition-colors cursor-pointer text-base"
        >
          {passkeyLoading ? "Waiting for authenticator…" : "Sign in with passkey"}
        </button>

        <p className="text-[var(--text-muted)] text-sm text-center m-0 mt-4">
          Don&apos;t have an account? <Link href="/register" className="text-[var(--primary)] underline hover:no-underline">Register</Link>
        </p>
      </div>
    </div>
  );
}
