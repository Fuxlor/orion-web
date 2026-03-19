"use client";

import { useState, useEffect, useRef } from "react";
import { User } from "@/types";
import { apiFetch } from "@/lib/api";
import { ProjectProvider } from "@/contexts/projectContext";
import { Header, Navbar } from "./index";

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  });

  const [accessToken] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("accessToken");
  });

  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendSent, setResendSent] = useState(false);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function startCooldown(seconds: number) {
    setResendCooldown(seconds);
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  async function handleResend() {
    if (resendCooldown > 0) return;
    const res = await apiFetch("/api/auth/resend-verification", { method: "POST" }, true);
    const data = await res.json();
    if (res.status === 429) {
      startCooldown(data.retryAfter ?? 60);
    } else if (res.ok) {
      setResendSent(true);
      startCooldown(60);
    }
  }

  useEffect(() => {
    return () => { if (cooldownRef.current) clearInterval(cooldownRef.current); };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!accessToken) {
      window.location.href = "/login";
      return;
    }
    if (!user && accessToken !== null) {
      apiFetch("/api/auth/me")
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("user");
            window.location.href = "/login";
          } else {
            setUser(data.user as User);
            localStorage.setItem("user", JSON.stringify(data.user));
          }
        })
        .catch(() => {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("user");
          window.location.href = "/login";
        });
    }
  }, [accessToken, user]);

  return (
    <ProjectProvider>
      <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "var(--background)" }}>
        {/* Sidebar */}
        <Navbar />

        {/* Main column */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <Header user={user} />
          {user && !user.email_verified && (
            <div
              className="flex items-center justify-center gap-3 px-4 py-2 text-sm shrink-0"
              style={{
                backgroundColor: "rgba(2,241,148,0.08)",
                borderBottom: "1px solid rgba(2,241,148,0.2)",
              }}
            >
              <span style={{ color: "#02f194" }}>⚠</span>
              <span style={{ color: "var(--text-secondary)" }}>
                {resendSent
                  ? "Verification email sent! Check your inbox."
                  : "Please verify your email address. Check your inbox for a confirmation link."}
                {" "}
                <button
                  onClick={handleResend}
                  disabled={resendCooldown > 0}
                  style={{
                    color: resendCooldown > 0 ? "var(--text-muted)" : "var(--primary)",
                    textDecoration: "underline",
                    background: "none",
                    border: "none",
                    padding: 0,
                    cursor: resendCooldown > 0 ? "default" : "pointer",
                    fontSize: "inherit",
                  }}
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend email"}
                </button>
              </span>
            </div>
          )}
          <main
            className="flex-1 overflow-auto p-6"
            style={{ backgroundColor: "var(--page-bg)" }}
          >
            {children}
          </main>
        </div>
      </div>
    </ProjectProvider>
  );
}
