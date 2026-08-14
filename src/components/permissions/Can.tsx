import type { ReactNode } from "react";
import { usePermissionStore } from "../../features/auth/permissionStore";

interface CanProps {
  permission: string | string[];
  anyOf?: boolean;
  fallback?: ReactNode;
  children: ReactNode;
}

export function Can({ permission, anyOf, fallback = null, children }: CanProps) {
  const { hasPermission, hasAnyPermission, isLoading } = usePermissionStore();

  if (isLoading) return null;

  const hasAccess = Array.isArray(permission)
    ? anyOf
      ? hasAnyPermission(permission)
      : permission.every((p) => hasPermission(p))
    : hasPermission(permission);

  if (!hasAccess) return fallback;
  return <>{children}</>;
}
