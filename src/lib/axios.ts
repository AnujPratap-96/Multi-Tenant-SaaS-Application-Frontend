import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import { useTenantStore } from "@/features/tenant/tenantStore";

declare module "axios" {
  export interface AxiosRequestConfig {
    // Skip the 401-refresh → /login redirect (used by checkAuth on boot).
    skipAuthRedirect?: boolean;
    _csrfRetry?: boolean;
  }
}

/**
 * C8: central "forbidden" handler. Fired when the server returns 403 for an
 * authorization reason (not a CSRF mismatch). Default behavior clears the
 * tenant context and bounces the user to the dashboard; callers may override
 * via `setForbiddenHandler` (e.g. to use the router).
 */
let forbiddenHandler: ((error: AxiosError) => void) | null = null;

export function setForbiddenHandler(handler: ((error: AxiosError) => void) | null) {
  forbiddenHandler = handler;
}

export function setTenantHeader(tenantId: string | null): void {
  const key = "tenant-storage";
  try {
    const raw = localStorage.getItem(key);
    const state = raw ? JSON.parse(raw) : {};
    state.state = { ...(state.state || {}), currentTenant: tenantId ? { id: tenantId } : null };
    localStorage.setItem(key, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

function handleForbidden(error: AxiosError) {
  if (forbiddenHandler) {
    forbiddenHandler(error);
    return;
  }
  // Default: drop tenant context and redirect.
  try {
    useTenantStore.getState().clearTenants();
  } catch {
    /* ignore */
  }
  if (window.location.pathname !== "/dashboard") {
    window.location.href = "/dashboard";
  }
}

export const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined) || "http://localhost:5000/api/v1";

export type RetryConfig = InternalAxiosRequestConfig & {
  _csrfRetry?: boolean;
  _retry?: boolean;
};

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Fetch and cache CSRF token (fetched once, reused until a 403 forces a refresh)
let csrfToken: string | null = null;
let isRefreshing = false;
let refreshSubscribers: (() => void)[] = [];

async function getCsrfToken(): Promise<string | null> {
  if (csrfToken) return csrfToken;
  const res = await axios.get(`${API_BASE_URL}/csrf-token`, { withCredentials: true });
  csrfToken = (res.data?.data?.token as string) ?? null;
  return csrfToken;
}

function onRefreshed() {
  refreshSubscribers.forEach((cb) => cb());
  refreshSubscribers = [];
}

const MUTATION_METHODS: string[] = ["post", "put", "patch", "delete"];

api.interceptors.request.use(async (config) => {
  // Attach tenant header from persisted store
  try {
    const tenantStorage = localStorage.getItem("tenant-storage");
    if (tenantStorage) {
      const tenantId = (JSON.parse(tenantStorage) as { state?: { currentTenant?: { id?: string } } })
        ?.state?.currentTenant?.id;
      if (tenantId) config.headers["x-tenant-id"] = tenantId;
    }
  } catch {
    /* ignore malformed storage */
  }

  // Attach CSRF token for mutating requests
  if (MUTATION_METHODS.includes(config.method?.toLowerCase() ?? "")) {
    const token = await getCsrfToken();
    if (token) config.headers["x-csrf-token"] = token;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryConfig;

    // 403: could be a CSRF mismatch (retry once) or an authorization failure.
    if (error.response?.status === 403) {
      if (!originalRequest._csrfRetry) {
        // First 403 — refresh CSRF token and retry once.
        originalRequest._csrfRetry = true;
        csrfToken = null;
        const token = await getCsrfToken();
        if (token) originalRequest.headers["x-csrf-token"] = token;
        return api(originalRequest);
      }
      // Already retried and still 403 → treat as authorization forbidden (C8).
      handleForbidden(error);
      return Promise.reject(error);
    }

    // Access token expired — refresh and retry once
    const isRefreshRequest = originalRequest.url?.includes("/auth/refresh-token");
    if (error.response?.status === 401 && !originalRequest._retry && !isRefreshRequest) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshSubscribers.push(() => resolve(api(originalRequest)));
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;
      csrfToken = null;

      try {
        await api.post("/auth/refresh-token");
        onRefreshed();
        return api(originalRequest);
      } catch (err) {
        refreshSubscribers = [];
        if (!originalRequest.skipAuthRedirect && window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
