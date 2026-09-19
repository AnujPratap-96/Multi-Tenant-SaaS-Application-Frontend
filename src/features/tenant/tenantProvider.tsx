import { useEffect, type ReactNode } from "react";
import { setForbiddenHandler, setTenantHeader } from "@/lib/axios";
import { useAuthStore } from "../auth/authStore";
import { usePermissionStore } from "../auth/permissionStore";
import { useTenantStore } from "./tenantStore";

// F-02: tenant boot/switch wiring.
// - keeps the x-tenant-id header in sync with the current tenant
// - boots tenants + permissions once authenticated
// - handles real 403s (removed tenant) by clearing the store + redirecting

// eslint-disable-next-line react-refresh/only-export-components
export function useTenant() {
  const currentTenant = useTenantStore((s) => s.currentTenant);
  const isBootValidating = useTenantStore((s) => s.isBootValidating);
  return { currentTenant, isBootValidating };
}

export function TenantProvider({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const checkAuth = useAuthStore((s) => s.checkAuth);
  const { currentTenant, fetchTenants } = useTenantStore();
  const fetchPermissions = usePermissionStore((s) => s.fetchPermissions);
  const clearPermissions = usePermissionStore((s) => s.clearPermissions);
  const clearTenants = useTenantStore((s) => s.clearTenants);

  // Re-validate the cookie session on boot
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Keep the tenant header in sync (also clears it on logout)
  useEffect(() => {
    setTenantHeader(currentTenant?.id ?? null);
  }, [currentTenant?.id]);

  // Boot membership + permissions once authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      useTenantStore.setState({ isBootValidating: false });
      return;
    }
    useTenantStore.setState({ isBootValidating: true });
    const boot = Promise.all([fetchTenants(), fetchPermissions(currentTenant?.id)]);
    boot.finally(() => useTenantStore.setState({ isBootValidating: false }));
    return () => {
      void boot;
    };
  }, [isAuthenticated, fetchTenants, fetchPermissions, currentTenant?.id]);

  // Real 403 (e.g. removed from tenant) -> clear membership + return to /tenants
  useEffect(() => {
    setForbiddenHandler(() => {
      clearPermissions();
      clearTenants();
      if (window.location.pathname !== "/dashboard/tenants") {
        window.location.href = "/dashboard/tenants";
      }
    });
    return () => setForbiddenHandler(null);
  }, [clearPermissions, clearTenants]);

  return <>{children}</>;
}

export default TenantProvider;
