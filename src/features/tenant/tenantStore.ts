import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "@/lib/axios";
import type { Tenant } from "@/types/domain";

// F-02: tenant membership store. Persisted under "tenant-storage"
// (read by lib/axios.ts interceptor for the x-tenant-id header).

interface TenantState {
  tenants: Tenant[];
  currentTenant: Tenant | null;
  isBootValidating: boolean;
  fetchTenants: () => Promise<void>;
  setCurrentTenant: (tenantId: string) => Promise<void>;
  clearTenants: () => void;
}

export const useTenantStore = create<TenantState>()(
  persist(
    (set, get) => ({
      tenants: [],
      currentTenant: null,
      isBootValidating: false,

      fetchTenants: async () => {
        try {
          const res = await api.get("/tenants/my");
          const list = res.data?.data ?? [];
          set({ tenants: list });
        } catch {
          set({ tenants: [] });
        }
      },

      setCurrentTenant: async (tenantId) => {
        const tenant = get().tenants.find((t) => t.id === tenantId) ?? null;
        set({ currentTenant: tenant });
      },

      clearTenants: () => {
        set({ tenants: [], currentTenant: null });
      },
    }),
    {
      name: "tenant-storage",
      partialize: (state) => ({ currentTenant: state.currentTenant }),
    }
  )
);
