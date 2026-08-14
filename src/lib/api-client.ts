import axios, {
  AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";
import { env } from "@/config/env";

// F-01: single typed API client.
// - CSRF token fetched once, cached, attached to mutating requests
// - 401 -> refresh once (single-flight queue), then retry
// - 403 -> CSRF retry once; if it still fails, hand to the app's onForbidden handler
// - tenant header injected by TenantProvider (F-02), NOT parsed from localStorage
export const API_BASE_URL = env.VITE_API_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

type RetryConfig = InternalAxiosRequestConfig & {
  _csrfRetry?: boolean;
  _retry?: boolean;
  skipAuthRedirect?: boolean;
};

let currentTenantId: string | null = null;

/** TenantProvider calls this on boot/switch; clears on logout/removal (F-02). */
export const setTenantHeader = (tenantId: string | null) => {
  currentTenantId = tenantId;
};

type ForbiddenHandler = (payload: { status: number; url: string }) => void;
let onForbidden: ForbiddenHandler | null = null;

/** App-level handler for real 403s (e.g. removed tenant -> clear store + redirect). */
export const setOnForbidden = (handler: ForbiddenHandler | null) => {
  onForbidden = handler;
};

let csrfToken: string | null = null;

async function fetchCsrfToken(): Promise<string | null> {
  if (csrfToken) return csrfToken;
  try {
    const res = await axios.get(`${API_BASE_URL}/csrf-token`, {
      withCredentials: true,
    });
    csrfToken = (res.data?.token as string) ?? null;
  } catch {
    csrfToken = null;
  }
  return csrfToken;
}

export const resetCsrfToken = () => {
  csrfToken = null;
};

let isRefreshing = false;
let refreshSubscribers: Array<() => void> = [];

function onRefreshed() {
  const cbs = refreshSubscribers;
  refreshSubscribers = [];
  cbs.forEach((cb) => cb());
}

const MUTATION_METHODS = new Set(["post", "put", "patch", "delete"]);

apiClient.interceptors.request.use(async (config) => {
  if (currentTenantId) {
    config.headers["x-tenant-id"] = currentTenantId;
  }
  const method = (config.method ?? "get").toLowerCase();
  if (MUTATION_METHODS.has(method)) {
    const token = await fetchCsrfToken();
    if (token) config.headers["x-csrf-token"] = token;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetryConfig | undefined;
    if (!original) return Promise.reject(error);

    const status = error.response?.status;

    // CSRF token expired/invalid — refetch once and retry
    if (status === 403 && !original._csrfRetry) {
      original._csrfRetry = true;
      csrfToken = null;
      const token = await fetchCsrfToken();
      if (token) original.headers["x-csrf-token"] = token;
      return apiClient(original);
    }

    // Access token expired — refresh once (cookie-based), single-flight, then retry
    const isRefreshRequest = original.url?.includes("/auth/refresh-token");
    if (status === 401 && !original._retry && !isRefreshRequest) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshSubscribers.push(() => resolve(apiClient(original)));
        });
      }
      original._retry = true;
      isRefreshing = true;
      csrfToken = null;
      try {
        await apiClient.post("/auth/refresh-token");
        onRefreshed();
        return apiClient(original);
      } catch (refreshError) {
        refreshSubscribers = [];
        if (!original.skipAuthRedirect && window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Genuine 403 (survived the CSRF retry) — surface to the app
    if (status === 403 && original._csrfRetry) {
      onForbidden?.({ status, url: original.url ?? "" });
    }

    return Promise.reject(error);
  }
);

export default apiClient;
