const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export function getApiUrl() {
  return API_URL;
}

export function apiFetch(path: string, options?: RequestInit): Promise<Response> {
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  return fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...options?.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}
