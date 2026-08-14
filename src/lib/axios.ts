import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";

declare module "axios" {
  export interface AxiosRequestConfig {
    // Skip the 401-refresh → /login redirect (used by checkAuth on boot).
    skipAuthRedirect?: boolean;
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

    // CSRF token expired/invalid — clear cached token and retry once
    if (error.response?.status === 403 && !originalRequest._csrfRetry) {
      originalRequest._csrfRetry = true;
      csrfToken = null;
      const token = await getCsrfToken();
      if (token) originalRequest.headers["x-csrf-token"] = token;
      return api(originalRequest);
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
