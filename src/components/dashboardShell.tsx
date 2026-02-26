"use client";

import { useState, useEffect } from "react";
import { User } from "@/types";
import { apiFetch } from "@/lib/api";
import { ProjectProvider } from "@/contexts/projectContext";
import Header from "./header";
import Navbar from "./navbar";

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
      <div className="flex h-screen flex-col bg-[var(--background)]">
        <Header user={user} />
        <div className="flex flex-1 min-h-0">
          <Navbar />
          <main className="flex-1 overflow-auto p-6 bg-[var(--page-bg)]">{children}</main>
        </div>
      </div>
    </ProjectProvider>
  );
}
