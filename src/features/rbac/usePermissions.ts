import { useQuery } from "@tanstack/react-query";
import { rbacApi } from "./rbacApi";

// F-13: current-user permission set (effective = role + overrides).
// Used by PermissionRoute to gate routes.

interface MyPermissions {
  permissions: string[];
  role?: string;
}

export function usePermissions(tenantId?: string) {
  return useQuery<MyPermissions>({
    queryKey: ["rbac", tenantId, "my"],
    queryFn: async () => {
      const res = await rbacApi.my();
      return (res.data?.data ?? { permissions: [] }) as MyPermissions;
    },
    enabled: !!tenantId,
  });
}

export function can(permissions: string[] | undefined, permission: string) {
  return permissions?.includes(permission) ?? false;
}
