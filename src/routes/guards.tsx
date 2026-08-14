import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/features/auth/authStore";
import { useTenant } from "@/features/tenant/tenantProvider";
import { usePermissions, can } from "@/features/rbac/usePermissions";
import { Spinner } from "@/components/ui/PageLoader";

// F-18: route guards. Protected = auth; Tenant = active membership; Permission = specific right.

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Spinner />
      </div>
    );
  }
  if (!isAuthenticated) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }
  return <>{children}</>;
}

export function GuestRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Spinner />
      </div>
    );
  }
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export function TenantRoute({ children }: { children: ReactNode }) {
  const { currentTenant, isBootValidating } = useTenant();
  const location = useLocation();
  if (isBootValidating) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Spinner />
      </div>
    );
  }
  if (!currentTenant && location.pathname !== "/dashboard/tenants") {
    return <Navigate to="/dashboard/tenants" replace />;
  }
  return <>{children}</>;
}

export function PermissionRoute({
  permission,
  children,
}: {
  permission: string;
  children: ReactNode;
}) {
  const { currentTenant } = useTenant();
  const { data } = usePermissions(currentTenant?.id);
  if (!can(data?.permissions, permission)) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}
