"use client";

import { useEffect } from "react";
import { apiFetch } from "@/lib/api";

export default function StandalonePageWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("accessToken");
    if (!token) {
      window.location.href = "/login";
      return;
    }
    apiFetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("user");
          window.location.href = "/login";
        }
      })
      .catch(() => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
      });
  }, []);

  return <>{children}</>;
}
