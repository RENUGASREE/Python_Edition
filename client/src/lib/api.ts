export const API_BASE = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/+$/, "");

export function apiUrl(path: string): string {
  const clean = path.replace(/^https?:\/\/[^/]+/i, "").replace(/^\/+/, "");
  if (clean.startsWith("api/")) return `${API_BASE}/${clean.slice(4)}`;
  return `${API_BASE}/${clean}`;
}

const ACCESS_KEY = "token";
const REFRESH_KEY = "refresh_token";

export function getToken(): string | null {
  return localStorage.getItem(ACCESS_KEY) || localStorage.getItem("access_token");
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY);
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem("access_token");
  localStorage.removeItem(REFRESH_KEY);
}

export function storeTokens(access: string, refresh?: string): void {
  localStorage.setItem(ACCESS_KEY, access);
  localStorage.setItem("access_token", access);
  if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
}

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refresh = getRefreshToken();
  if (!refresh) return null;
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const res = await fetch(apiUrl("/auth/refresh"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken: refresh }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          clearTokens();
          return null;
        }
        storeTokens(data.token, data.refreshToken);
        return data.token as string;
      } catch {
        clearTokens();
        return null;
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
}

/** Authenticated fetch with automatic token refresh on 401 */
export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
  retried = false
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(apiUrl(path), { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (res.status === 401 && !retried && getRefreshToken()) {
    const newToken = await refreshAccessToken();
    if (newToken) return apiFetch<T>(path, options, true);
    clearTokens();
    if (typeof window !== "undefined" && !window.location.pathname.startsWith("/auth")) {
      window.location.href = "/auth";
    }
  }

  if (!res.ok) throw new Error(data.message || res.statusText || "Request failed");
  return data as T;
}
