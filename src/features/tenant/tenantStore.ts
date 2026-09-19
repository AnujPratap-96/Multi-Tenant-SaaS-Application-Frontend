import { create } from "zustand";
import { persist } from "zustand/middleware";
import { tenantApi } from "./tenantApi";
import { queryClient } from "@/lib/queryClient";
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
          const list = await tenantApi.list();
          const current = get().currentTenant;
          const updatedCurrent =
            current && list.some((t) => t.id === current.id)
              ? current
              : list.length > 0
              ? list[0]
              : null;
          set({ tenants: list, currentTenant: updatedCurrent });
        } catch {
          set({ tenants: [] });
        }
      },

      setCurrentTenant: async (tenantId) => {
        const tenant = get().tenants.find((t) => t.id === tenantId) ?? null;
        set({ currentTenant: tenant });
        // C7: wipe all cached queries so no previous-tenant data lingers.
        await queryClient.cancelQueries();
        queryClient.clear();
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
