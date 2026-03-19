"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

type Status = "loading" | "success" | "error";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<Status>("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setErrorMessage("No verification token provided.");
      setStatus("error");
      return;
    }

    apiFetch(`/api/auth/verify-email/${token}`)
      .then(async (res) => {
        if (res.ok) {
          setStatus("success");
        } else {
          const data = await res.json().catch(() => ({}));
          setErrorMessage(data.error ?? "Verification failed. The link may have expired.");
          setStatus("error");
        }
      })
      .catch((error) => {
        console.error(error);
        setErrorMessage("Could not reach the server. Please try again.");
        setStatus("error");
      });
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--page-bg)] px-4">
      <div className="w-full max-w-sm bg-[var(--card)] border border-[var(--border)] rounded-2xl p-8 flex flex-col items-center text-center gap-6">

        {/* Logo */}
        <span style={{ fontSize: "20px", fontWeight: 700, color: "var(--primary)", letterSpacing: "-0.5px" }}>
          ▲&nbsp;Orion
        </span>

        {status === "loading" && (
          <>
            <div style={{
              width: 48, height: 48, borderRadius: "50%",
              border: "3px solid var(--border)",
              borderTopColor: "var(--primary)",
              animation: "spin 0.8s linear infinite"
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <div>
              <p className="font-semibold" style={{ color: "var(--foreground)" }}>Verifying your email…</p>
              <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>This will only take a moment.</p>
            </div>
          </>
        )}

        {status === "success" && (
          <>
            <div style={{
              width: 48, height: 48, borderRadius: "50%",
              backgroundColor: "rgba(2,241,148,0.1)",
              border: "1px solid rgba(2,241,148,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22, color: "var(--primary)"
            }}>
              ✓
            </div>
            <div>
              <p className="font-semibold text-lg" style={{ color: "var(--foreground)" }}>Email verified!</p>
              <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                Your email address has been confirmed. You can now sign in.
              </p>
            </div>
            <Link
              href="/login"
              className="w-full py-3 rounded-lg font-semibold text-sm text-center"
              style={{ backgroundColor: "var(--primary)", color: "#08090e", textDecoration: "none" }}
            >
              Go to login
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div style={{
              width: 48, height: 48, borderRadius: "50%",
              backgroundColor: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22, color: "#ef4444"
            }}>
              ✕
            </div>
            <div>
              <p className="font-semibold text-lg" style={{ color: "var(--foreground)" }}>Verification failed</p>
              <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>{errorMessage}</p>
            </div>
            <div className="w-full flex flex-col gap-3">
              <Link
                href="/login"
                className="w-full py-3 rounded-lg font-semibold text-sm text-center"
                style={{ backgroundColor: "var(--primary)", color: "#08090e", textDecoration: "none" }}
              >
                Go to login
              </Link>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                Signed in?{" "}
                <Link href="/dashboard" style={{ color: "var(--primary)", textDecoration: "underline" }}>
                  Resend from the dashboard
                </Link>
              </p>
            </div>
          </>
        )}

      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
