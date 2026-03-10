"use client";

/**
 * Page : /auth/cli?state=<uuid>
 *
 * ROLE:
 * This page is opened by the CLI in the user's browser.
 * It orchestrates the confirmation on the web side.
 *
 * POSSIBLE PAGE STATES:
 *
 *  ① "confirm"   → User is logged in, waiting for explicit confirmation
 *  ② "loading"   → Confirmation in progress (calling /confirm)
 *  ③ "success"   → Token sent to CLI, showing a success message
 *  ④ "error"     → Invalid/expired state or network error
 *  ⑤ "no-state"  → URL has no ?state= (direct page access)
 *
 * FLOW:
 *
 *  If logged in:
 *    → Show account and request confirmation
 *    → On confirmation: POST /api/auth/cli/confirm { state }
 *    → Receives { callbackPort, token }
 *    → Redirects to http://localhost:callbackPort/callback?token=xxx
 *    → Shows "You can close this tab"
 *
 *  If not logged in:
 *    → Redirects to /login?next=/auth/cli?state=xxx
 *    → After login, /login redirects back here → same flow
 */

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

type PageState = "confirm" | "loading" | "success" | "error" | "no-state";

interface StoredUser {
    name?: string;
    email?: string;
}

export default function CliAuthPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const state = searchParams.get("state");

    const [status, setStatus] = useState<PageState>("loading");
    const [errorMessage, setErrorMessage] = useState("");
    const [user, setUser] = useState<StoredUser | null>(null);

    useEffect(() => {
        // Case ⑤: no state in the URL → direct page access, not useful
        if (!state) {
            setStatus("no-state");
            return;
        }

        const accessToken = localStorage.getItem("accessToken");

        // Case: user not logged in → redirect to login with ?next= to come back here
        if (!accessToken) {
            const currentUrl = `/auth/cli?state=${encodeURIComponent(state)}`;
            router.replace(`/login?next=${encodeURIComponent(currentUrl)}`);
            return;
        }

        // Case: user logged in → show the confirmation step
        const raw = localStorage.getItem("user");
        if (raw) {
            try {
                setUser(JSON.parse(raw) as StoredUser);
            } catch {
                // ignore
            }
        }
        setStatus("confirm");
    }, [state]);

    async function confirmCliAuth() {
        if (!state) return;
        setStatus("loading");
        try {
            const res = await apiFetch("/api/auth/cli/confirm", {
                method: "POST",
                body: JSON.stringify({ state }),
            });

            if (!res.ok) {
                const err = await res.json();
                setErrorMessage(err.message ?? "Unknown error");
                setStatus("error");
                return;
            }

            const { callbackPort, token } = await res.json();

            window.location.href = `http://localhost:${callbackPort}/callback?token=${encodeURIComponent(token)}`;

            setStatus("success");
        } catch {
            setErrorMessage("Could not reach the server. Please try again.");
            setStatus("error");
        }
    }

    function handleSignOut() {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        const currentUrl = `/auth/cli?state=${encodeURIComponent(state ?? "")}`;
        router.replace(`/login?next=${encodeURIComponent(currentUrl)}`);
    }

    return (
        <div className="min-h-screen bg-[var(--surface)] flex items-center justify-center p-6">
            <div className="w-full max-w-[24rem] bg-[var(--surface-elevated)] border border-[var(--border)] rounded-2xl p-8 shadow-xl text-center">

                {/* Logo / titre */}
                <h1 className="text-2xl font-bold text-white tracking-tight mb-1">Orion</h1>
                <p className="text-[var(--text-muted)] text-sm mb-8">CLI Authentication</p>

                {/* ① Confirmation */}
                {status === "confirm" && (
                    <div className="flex flex-col items-center gap-5">
                        {/* Avatar */}
                        <div className="w-14 h-14 rounded-full bg-[var(--primary-muted)] border border-[var(--primary)]/30 flex items-center justify-center">
                            <span className="text-[var(--primary)] text-2xl font-bold">
                                {user?.name?.[0]?.toUpperCase() ?? "?"}
                            </span>
                        </div>
                        <div>
                            <p className="text-white font-semibold">{user?.name ?? "User"}</p>
                            {user?.email && (
                                <p className="text-[var(--text-muted)] text-sm">{user.email}</p>
                            )}
                        </div>
                        <p className="text-[var(--text-secondary)] text-sm">
                            Orion CLI is requesting access to this account.
                        </p>
                        <button
                            onClick={confirmCliAuth}
                            className="w-full py-2.5 px-5 rounded-lg font-semibold text-[var(--surface)] bg-[var(--primary)] hover:bg-[var(--primary-hover)] transition-colors cursor-pointer border-0 text-sm"
                        >
                            Confirm sign-in
                        </button>
                        <button
                            onClick={handleSignOut}
                            className="text-sm text-[var(--text-muted)] hover:text-white transition-colors bg-transparent border-0 cursor-pointer"
                        >
                            Not you? Sign out
                        </button>
                    </div>
                )}

                {/* ② Loading */}
                {status === "loading" && (
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-10 h-10 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
                        <p className="text-[var(--text-secondary)] text-sm">
                            Signing in…
                        </p>
                    </div>
                )}

                {/* ③ Success */}
                {status === "success" && (
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                            <span className="text-green-400 text-2xl">✓</span>
                        </div>
                        <div>
                            <p className="text-white font-semibold mb-1">Authentication successful!</p>
                            <p className="text-[var(--text-muted)] text-sm">
                                You can close this tab and return to your terminal.
                            </p>
                        </div>
                    </div>
                )}

                {/* ④ Error */}
                {status === "error" && (
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                            <span className="text-red-400 text-2xl">✗</span>
                        </div>
                        <div>
                            <p className="text-white font-semibold mb-1">Authentication failed</p>
                            <p className="text-red-400 text-sm mb-4">{errorMessage}</p>
                            <p className="text-[var(--text-muted)] text-sm">
                                Restart <code className="text-[var(--primary)]">orion-cli</code> in your terminal.
                            </p>
                        </div>
                    </div>
                )}

                {/* ⑤ Direct access without state */}
                {status === "no-state" && (
                    <div>
                        <p className="text-[var(--text-secondary)] text-sm">
                            This page is reserved for authentication via the Orion CLI.
                        </p>
                        <p className="text-[var(--text-muted)] text-sm mt-2">
                            Run <code className="text-[var(--primary)]">npx orion-cli</code> in your terminal.
                        </p>
                    </div>
                )}

            </div>
        </div>
    );
}
