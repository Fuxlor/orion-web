const API_URL = "http://localhost:3001";

/** Returns the base API URL. */
export function getApiUrl(): string {
    console.log("API URL:", API_URL);
    return API_URL;
}

/**
 * A thin wrapper around `fetch` that:
 *  - Prepends the NEXT_PUBLIC_API_URL base URL
 *  - Automatically adds `Authorization: Bearer <token>` from localStorage when available
 *  - Sets `Content-Type: application/json` by default (can be overridden via `init.headers`)
 */
export function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(init.headers as Record<string, string> | undefined),
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    return fetch(`${API_URL}${path}`, {
        ...init,
        headers,
    });
}
