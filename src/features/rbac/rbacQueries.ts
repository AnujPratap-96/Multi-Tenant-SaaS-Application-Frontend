import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  rbacApi,
  type CreateRoleInput,
  type RbacPermission,
  type RbacRole,
  type RbacUserAssignment,
} from "./rbacApi";

// F-13: RBAC admin query + mutation hooks.

const handleError = (err: unknown) => {
  const message =
    (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
    "Something went wrong";
  toast.error(message);
};

export const useRoles = (tenantId?: string) =>
  useQuery<RbacRole[]>({
    queryKey: ["rbac", tenantId, "roles"],
    queryFn: () => rbacApi.roles(),
    enabled: !!tenantId,
  });

export const useCreateRole = (tenantId?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRoleInput) => rbacApi.createRole(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rbac", tenantId, "roles"] });
      toast.success("Role created");
    },
    onError: handleError,
  });
};

export const useUpdateRole = (tenantId?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { id: string; data: CreateRoleInput }) =>
      rbacApi.updateRole(payload.id, payload.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rbac", tenantId, "roles"] });
      toast.success("Role updated");
    },
    onError: handleError,
  });
};

export const useDeleteRole = (tenantId?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (roleId: string) => rbacApi.removeRole(roleId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rbac", tenantId, "roles"] });
      toast.success("Role deleted");
    },
    onError: handleError,
  });
};

export const useUpdateRolePermissions = (tenantId?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { roleId?: string; permissionIds: string[] }) =>
      rbacApi.updateRolePermissions(payload.roleId ?? "", payload.permissionIds),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rbac", tenantId, "roles"] });
      toast.success("Permissions updated");
    },
    onError: handleError,
  });
};

export const useRbacUsers = (tenantId?: string) =>
  useQuery<RbacUserAssignment[]>({
    queryKey: ["rbac", tenantId, "users"],
    queryFn: () => rbacApi.rbacUsers(),
    enabled: !!tenantId,
  });

export const useUpdateUserRole = (tenantId?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { userId?: string; roleId?: string }) =>
      rbacApi.updateUserRole(payload.userId ?? "", payload.roleId ?? ""),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rbac", tenantId, "users"] });
      toast.success("Role updated");
    },
    onError: handleError,
  });
};

export const useAssignUserPermission = (tenantId?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { userId?: string; permissionId?: string; isAllowed?: boolean }) =>
      rbacApi.assignUserPermission(
        payload.userId ?? "",
        payload.permissionId ?? "",
        payload.isAllowed ?? true
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rbac", tenantId, "users"] });
      toast.success("Permission override saved");
    },
    onError: handleError,
  });
};

export const usePermissions = (tenantId?: string) =>
  useQuery<RbacPermission[]>({
    queryKey: ["rbac", tenantId, "permissions"],
    queryFn: () => rbacApi.permissions(),
    enabled: !!tenantId,
  });
