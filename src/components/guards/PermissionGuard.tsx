import type { ReactNode } from "react";
import { usePermissionStore } from "../../features/auth/permissionStore";

interface PermissionGuardProps {
  requiredPermission: string | string[];
  anyOf?: boolean;
  children: ReactNode;
}

export default function PermissionGuard({
  requiredPermission,
  anyOf = false,
  children,
}: PermissionGuardProps) {
  const { hasPermission, hasAnyPermission, isLoading } = usePermissionStore();

  if (isLoading) {
    return (
      <div className="p-8 animate-pulse flex space-x-4">
        <div className="flex-1 space-y-4 py-1">
          <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded"></div>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-4">
              <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded col-span-2"></div>
              <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded col-span-1"></div>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const hasAccess = Array.isArray(requiredPermission)
    ? anyOf
      ? hasAnyPermission(requiredPermission)
      : requiredPermission.every((p) => hasPermission(p))
    : hasPermission(requiredPermission);

  // If we don't have access, maybe render a 403 or redirect
  if (!hasAccess) {
    return (
      <div className="p-8 text-center max-w-md mx-auto mt-12 border border-gray-100 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-950">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h2>
        <p className="text-gray-500 dark:text-gray-400">
          You do not have the required permissions to view this content.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
