/**
 * API Client — centralised fetch wrapper with auth token management.
 * Vite dev-server proxies /api → localhost:3001 so base URL is empty.
 */

type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

let accessToken: string | null = localStorage.getItem("rf_access_token");
let refreshTokenValue: string | null = localStorage.getItem("rf_refresh_token");
let isRefreshing = false;
let refreshQueue: Array<() => void> = [];

/* ── Token helpers ─────────────────────────────────────── */

export function setTokens(access: string, refresh: string) {
  accessToken = access;
  refreshTokenValue = refresh;
  localStorage.setItem("rf_access_token", access);
  localStorage.setItem("rf_refresh_token", refresh);
}

export function getAccessToken() {
  return accessToken;
}

export function clearTokens() {
  accessToken = null;
  refreshTokenValue = null;
  localStorage.removeItem("rf_access_token");
  localStorage.removeItem("rf_refresh_token");
}

/* ── Internal fetch helper ─────────────────────────────── */

async function request<T = unknown>(
  method: HttpMethod,
  url: string,
  body?: unknown,
  retry = true
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // 401 → attempt silent refresh then retry the original request once
  if (res.status === 401 && retry && refreshTokenValue) {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const refreshRes = await fetch("/api/v1/auth/refresh", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken: refreshTokenValue }),
        });

        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          setTokens(
            refreshData.data.accessToken,
            refreshData.data.refreshToken
          );
          isRefreshing = false;
          // Drain the queue
          refreshQueue.forEach((cb) => cb());
          refreshQueue = [];
          // Retry original request
          return request<T>(method, url, body, false);
        } else {
          // Refresh failed — force logout
          clearTokens();
          isRefreshing = false;
          refreshQueue = [];
          window.location.href = "/";
          throw new Error("Session expired");
        }
      } catch {
        clearTokens();
        isRefreshing = false;
        refreshQueue = [];
        window.location.href = "/";
        throw new Error("Session expired");
      }
    } else {
      // Another refresh is already in-flight — queue this request
      return new Promise<T>((resolve, reject) => {
        refreshQueue.push(() => {
          request<T>(method, url, body, false).then(resolve).catch(reject);
        });
      });
    }
  }

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    const message =
      (errBody as { message?: string })?.message ||
      `Request failed: ${res.status}`;
    throw new Error(message);
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

/* ── Public API ────────────────────────────────────────── */

export function apiGet<T = unknown>(url: string) {
  return request<T>("GET", url);
}

export function apiPost<T = unknown>(url: string, body?: unknown) {
  return request<T>("POST", url, body);
}

export function apiPatch<T = unknown>(url: string, body?: unknown) {
  return request<T>("PATCH", url, body);
}

export function apiDelete<T = unknown>(url: string, body?: unknown) {
  return request<T>("DELETE", url, body);
}
