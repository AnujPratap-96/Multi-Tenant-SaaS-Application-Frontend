import { create } from "zustand";
import api from "@/lib/axios";

// F-02/F-13: current tenant role + effective permission set.
// Populated by TenantProvider on boot/tenant switch (GET /rbac/my).

interface PermissionState {
  permissions: string[];
  role: string | null;
  isLoading: boolean;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  fetchPermissions: (tenantId?: string) => Promise<void>;
  clearPermissions: () => void;
}

export const usePermissionStore = create<PermissionState>((set, get) => ({
  permissions: [],
  role: null,
  isLoading: false,

  hasPermission: (permission) => get().permissions.includes(permission),

  hasAnyPermission: (permissions) =>
    permissions.some((p) => get().permissions.includes(p)),

  fetchPermissions: async (tenantId) => {
    if (!tenantId) {
      set({ permissions: [], role: null, isLoading: false });
      return;
    }
    set({ isLoading: true });
    try {
      const res = await api.get("/rbac/my");
      const data = res.data?.data ?? {};
      set({
        permissions: Array.isArray(data.permissions) ? data.permissions : [],
        role: data.role ?? null,
        isLoading: false,
      });
    } catch {
      set({ permissions: [], role: null, isLoading: false });
    }
  },

  clearPermissions: () => set({ permissions: [], role: null, isLoading: false }),
}));
