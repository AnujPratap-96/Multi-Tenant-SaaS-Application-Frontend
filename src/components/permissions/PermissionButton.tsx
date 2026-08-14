import type { ReactNode } from "react";
import { usePermissionStore } from "../../features/auth/permissionStore";
import { Button, type ButtonProps } from "../ui/Button";

interface PermissionButtonProps extends ButtonProps {
  permission: string;
  children: ReactNode;
}

export function PermissionButton({ permission, children, ...props }: PermissionButtonProps) {
  const { hasPermission, isLoading } = usePermissionStore();
  const hasAccess = isLoading ? false : hasPermission(permission);

  return (
    <Button
      {...props}
      disabled={!hasAccess || props.disabled}
      title={!hasAccess ? "Insufficient permissions" : props.title}
    >
      {children}
    </Button>
  );
}
