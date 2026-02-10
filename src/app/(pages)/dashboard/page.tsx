"use client";
import { useState, useEffect } from "react";
import { User } from "@/types";

export default function DashboardPage() {
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
        }
        if (!user && accessToken !== null) {
            fetch("http://localhost:3001/api/auth/me", {
                headers: {
                    "Authorization": `Bearer ${accessToken}`
                }
            }).then(res => res.json()).then(data => {
                if (data.error) {
                    localStorage.removeItem("accessToken");
                    localStorage.removeItem("user");
                    window.location.href = "/login";
                } else {
                    setUser(data.user as User);
                    localStorage.setItem("user", JSON.stringify(data.user));
                }
            }).catch(err => {
                console.error(err);
                localStorage.removeItem("accessToken");
                localStorage.removeItem("user");
                window.location.href = "/login";
            });
        }
    }, [accessToken, user]);

    return (
        <div>
            <h1>Dashboard</h1>
            <p>Welcome to your dashboard</p>
            <p>You are logged in as {user?.email}</p>
        </div>
    );
}