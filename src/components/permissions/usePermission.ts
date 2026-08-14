import { usePermissionStore } from "../../features/auth/permissionStore";

export function usePermission() {
  const { hasPermission, hasAnyPermission, permissions, role, isLoading } = usePermissionStore();

  return {
    can: hasPermission,
    canAny: hasAnyPermission,
    permissions,
    role,
    isLoading,
    isAdmin: role === "ADMIN" || role === "OWNER",
  };
}
