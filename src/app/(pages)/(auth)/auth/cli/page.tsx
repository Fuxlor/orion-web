"use client";

/**
 * Page : /auth/cli?state=<uuid>
 *
 * RÔLE :
 * Cette page est ouverte par le CLI dans le navigateur de l'utilisateur.
 * Elle orchestre la confirmation côté web.
 *
 * ÉTATS POSSIBLE DE LA PAGE :
 *
 *  ① "loading"   → On vérifie si l'user est connecté, on appelle /confirm
 *  ② "success"   → Token envoyé au CLI, on affiche un message de succès
 *  ③ "error"     → State invalide/expiré ou erreur réseau
 *  ④ "no-state"  → L'URL n'a pas de ?state= (accès direct à la page)
 *
 * FLOW :
 *
 *  Si connecté :
 *    → POST /api/auth/cli/confirm { state }
 *    → Reçoit { callbackPort, token }
 *    → Redirige vers http://localhost:callbackPort/callback?token=xxx
 *    → Affiche "Vous pouvez fermer cet onglet"
 *
 *  Si pas connecté :
 *    → Redirige vers /login?next=/auth/cli?state=xxx
 *    → Après login, /login renvoie ici → même flow
 */

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

type PageState = "loading" | "success" | "error" | "no-state";

export default function CliAuthPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const state = searchParams.get("state");

    const [status, setStatus] = useState<PageState>("loading");
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        // Cas ④ : pas de state dans l'URL → accès direct à la page, inutile
        if (!state) {
            setStatus("no-state");
            return;
        }

        // Récupère le token de l'user depuis le localStorage
        // (c'est là que ton app le stocke après le login classique)
        const accessToken = localStorage.getItem("accessToken");

        // Cas : user pas connecté → redirect vers login avec ?next= pour revenir ici
        if (!accessToken) {
            const currentUrl = `/auth/cli?state=${encodeURIComponent(state)}`;
            router.replace(`/login?next=${encodeURIComponent(currentUrl)}`);
            return;
        }

        // Cas : user connecté → on confirme l'auth CLI
        confirmCliAuth(state);
    }, [state]);

    async function confirmCliAuth(state: string) {
        try {
            const res = await apiFetch("/api/auth/cli/confirm", {
                method: "POST",
                body: JSON.stringify({ state }),
            });

            if (!res.ok) {
                const err = await res.json();
                setErrorMessage(err.message ?? "Erreur inconnue");
                setStatus("error");
                return;
            }

            const { callbackPort, token } = await res.json();

            window.location.href = `http://localhost:${callbackPort}/callback?token=${encodeURIComponent(token)}`;

            setStatus("success");
        } catch {
            setErrorMessage("Impossible de contacter le serveur. Réessayez.");
            setStatus("error");
        }
    }

    return (
        <div className="min-h-screen bg-[var(--surface)] flex items-center justify-center p-6">
            <div className="w-full max-w-[24rem] bg-[var(--surface-elevated)] border border-[var(--border)] rounded-2xl p-8 shadow-xl text-center">

                {/* Logo / titre */}
                <h1 className="text-2xl font-bold text-white tracking-tight mb-1">Orion</h1>
                <p className="text-[var(--text-muted)] text-sm mb-8">Authentification CLI</p>

                {/* ① Chargement */}
                {status === "loading" && (
                    <div className="flex flex-col items-center gap-4">
                        {/* Spinner simple CSS */}
                        <div className="w-10 h-10 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
                        <p className="text-[var(--text-secondary)] text-sm">
                            Connexion en cours…
                        </p>
                    </div>
                )}

                {/* ② Succès */}
                {status === "success" && (
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                            <span className="text-green-400 text-2xl">✓</span>
                        </div>
                        <div>
                            <p className="text-white font-semibold mb-1">Authentification réussie !</p>
                            <p className="text-[var(--text-muted)] text-sm">
                                Vous pouvez fermer cet onglet et retourner dans le terminal.
                            </p>
                        </div>
                    </div>
                )}

                {/* ③ Erreur */}
                {status === "error" && (
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                            <span className="text-red-400 text-2xl">✗</span>
                        </div>
                        <div>
                            <p className="text-white font-semibold mb-1">Échec de l&apos;authentification</p>
                            <p className="text-red-400 text-sm mb-4">{errorMessage}</p>
                            <p className="text-[var(--text-muted)] text-sm">
                                Relancez <code className="text-[var(--primary)]">orion-cli</code> dans votre terminal.
                            </p>
                        </div>
                    </div>
                )}

                {/* ④ Accès direct sans state */}
                {status === "no-state" && (
                    <div>
                        <p className="text-[var(--text-secondary)] text-sm">
                            Cette page est réservée à l&apos;authentification via le CLI Orion.
                        </p>
                        <p className="text-[var(--text-muted)] text-sm mt-2">
                            Lancez <code className="text-[var(--primary)]">npx orion-cli</code> dans votre terminal.
                        </p>
                    </div>
                )}

            </div>
        </div>
    );
}