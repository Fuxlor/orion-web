"use client";

import { useState, useEffect } from "react";
import { startAuthentication } from "@simplewebauthn/browser";
import { apiFetch } from "@/lib/api";
import { User } from "@/types";

type Method = "password" | "totp" | "email_otp" | "passkey";

interface Props {
  user: User;
  onVerified: (actionToken: string) => void;
  onClose: () => void;
}

export default function VerifyIdentityModal({ user, onVerified, onClose }: Props) {
  const availableMethods: { id: Method; label: string }[] = [
    { id: "password", label: "Password" },
    ...(user.totp_enabled ? [{ id: "totp" as Method, label: "Authenticator" }] : []),
    ...(user.email_2fa_enabled ? [{ id: "email_otp" as Method, label: "Email code" }] : []),
    { id: "passkey", label: "Passkey" },
  ];

  const [method, setMethod] = useState<Method>(availableMethods[0].id);
  const [credential, setCredential] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Reset state when method changes
  function switchMethod(m: Method) {
    setMethod(m);
    setCredential("");
    setCodeSent(false);
    setError(null);
  }

  async function sendEmailCode() {
    setSending(true);
    setError(null);
    try {
      const res = await apiFetch("/api/auth/action-code/send", { method: "POST" });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Failed to send code");
      setCodeSent(true);
    } catch (err) {
      setError(process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : (err instanceof Error ? err.message : "Failed to send code"));
    } finally {
      setSending(false);
    }
  }

  async function verifyCredential() {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch("/api/auth/action-token", {
        method: "POST",
        body: JSON.stringify({ method, credential }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Verification failed");
      onVerified(d.actionToken);
    } catch (err) {
      setError(process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : (err instanceof Error ? err.message : "Verification failed"));
    } finally {
      setLoading(false);
    }
  }

  async function verifyPasskey() {
    setLoading(true);
    setError(null);
    try {
      const optRes = await apiFetch("/api/auth/passkey/action-options");
      const opts = await optRes.json();
      if (!optRes.ok) throw new Error(opts.error ?? "Failed to start passkey verification");

      const assertion = await startAuthentication({ optionsJSON: opts });

      const verifyRes = await apiFetch("/api/auth/passkey/action", {
        method: "POST",
        body: JSON.stringify(assertion),
      });
      const d = await verifyRes.json();
      if (!verifyRes.ok) throw new Error(d.error ?? "Passkey verification failed");
      onVerified(d.actionToken);
    } catch (err) {
      if (err instanceof Error && err.name === "NotAllowedError") {
        setError("Passkey verification was cancelled");
      } else {
        setError(process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : (err instanceof Error ? err.message : "Passkey verification failed"));
      }
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (method === "passkey") {
      verifyPasskey();
    } else {
      verifyCredential();
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <div
        className="w-full max-w-sm rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
          <h2 className="text-base font-semibold text-white">Verify your identity</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors text-xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          {/* Method selector */}
          {availableMethods.length > 1 && (
            <div className="flex gap-1 flex-wrap">
              {availableMethods.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => switchMethod(m.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${method === m.id
                      ? "border-[var(--primary)] bg-[var(--primary-muted)] text-[var(--primary)]"
                      : "border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--surface-input)]"
                    }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          )}

          {/* Method-specific input */}
          {method === "password" && (
            <div className="space-y-1">
              <label className="text-xs text-[var(--text-muted)]">Password</label>
              <input
                type="password"
                value={credential}
                onChange={(e) => setCredential(e.target.value)}
                placeholder="Your account password"
                autoFocus
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-input)] px-3 py-2 text-sm text-[var(--text-secondary)] focus:border-[var(--border-focus)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-muted)]"
              />
            </div>
          )}

          {method === "totp" && (
            <div className="space-y-1">
              <label className="text-xs text-[var(--text-muted)]">Authenticator code</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={credential}
                onChange={(e) => setCredential(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                autoFocus
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-input)] px-3 py-2 text-sm text-[var(--text-secondary)] font-mono tracking-widest focus:border-[var(--border-focus)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-muted)]"
              />
            </div>
          )}

          {method === "email_otp" && (
            <div className="space-y-2">
              {!codeSent ? (
                <button
                  type="button"
                  onClick={sendEmailCode}
                  disabled={sending}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-input)] px-3 py-2 text-sm text-[var(--text-secondary)] transition-colors hover:bg-[var(--card)] disabled:opacity-50"
                >
                  {sending ? "Sending…" : `Send code to ${user.email}`}
                </button>
              ) : (
                <div className="space-y-1">
                  <label className="text-xs text-[var(--text-muted)]">
                    Enter the 6-digit code sent to {user.email}
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={credential}
                    onChange={(e) => setCredential(e.target.value.replace(/\D/g, ""))}
                    placeholder="000000"
                    autoFocus
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-input)] px-3 py-2 text-sm text-[var(--text-secondary)] font-mono tracking-widest focus:border-[var(--border-focus)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-muted)]"
                  />
                  <button
                    type="button"
                    onClick={sendEmailCode}
                    disabled={sending}
                    className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors disabled:opacity-50"
                  >
                    {sending ? "Sending…" : "Resend code"}
                  </button>
                </div>
              )}
            </div>
          )}

          {method === "passkey" && (
            <p className="text-sm text-[var(--text-muted)]">
              Use your registered passkey to confirm this action.
            </p>
          )}

          {error && <p className="text-xs text-red-400">{error}</p>}

          {/* Footer buttons */}
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-input)]"
            >
              Cancel
            </button>
            {method === "passkey" ? (
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--surface)] transition-colors hover:bg-[var(--primary-hover)] disabled:opacity-50"
              >
                {loading ? "Verifying…" : "Verify with passkey"}
              </button>
            ) : method === "email_otp" && !codeSent ? null : (
              <button
                type="submit"
                disabled={loading || !credential.trim()}
                className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--surface)] transition-colors hover:bg-[var(--primary-hover)] disabled:opacity-50"
              >
                {loading ? "Verifying…" : "Confirm"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
