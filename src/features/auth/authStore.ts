import { create } from "zustand";
import { authApi } from "./authApi";
import type { User } from "@/types/domain";

// F-18/F-19: auth session store. Plain (non-persisted) store — the server
// session is cookie-based, so the UI state is re-validated on boot via checkAuth.

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  login: (user) => set({ user, isAuthenticated: true, isLoading: false }),

  logout: async () => {
    try {
      await authApi.logout();
    } catch {
      // best-effort; clear local state regardless
    }
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const res = await authApi.me();
      set({ user: res.data?.data ?? null, isAuthenticated: true, isLoading: false });
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
