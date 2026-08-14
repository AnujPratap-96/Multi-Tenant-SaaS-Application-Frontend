import api from "@/lib/axios";

// F-13: RBAC admin API surface (roles, user assignments, permission overrides).
// Note: tenant is resolved server-side from the x-tenant-id header;
// roles are read-only in this version (D-13) — CRUD routes are not wired.

export interface RbacPermission {
  id: string;
  resource: string;
  action: string;
}

export interface RbacRole {
  id: string;
  name: string;
  description?: string | null;
  isSystem?: boolean;
  rolePermissions?: {
    permissionId?: string;
    permission?: RbacPermission;
  }[];
}

export interface RbacUserAssignment {
  userId: string;
  role: string;
  user: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
}

export interface CreateRoleInput {
  name: string;
  description?: string;
}

const unwrap = <T>(res: { data?: { data?: T } }): T | undefined => res.data?.data;

export const rbacApi = {
  roles: () =>
    api
      .get("/rbac/roles")
      .then((res) => (unwrap<RbacRole[]>(res) ?? []) as RbacRole[]),

  createRole: (data: CreateRoleInput) => api.post("/rbac/roles", data),

  updateRole: (roleId: string, data: CreateRoleInput) =>
    api.patch(`/rbac/roles/${roleId}`, data),

  removeRole: (roleId: string) => api.delete(`/rbac/roles/${roleId}`),

  updateRolePermissions: (roleId: string, permissionIds: string[]) =>
    api.put(`/rbac/roles/${roleId}/permissions`, { permissionIds }),

  rbacUsers: () =>
    api
      .get("/rbac/users")
      .then((res) => (unwrap<RbacUserAssignment[]>(res) ?? []) as RbacUserAssignment[]),

  updateUserRole: (userId: string, roleId: string) =>
    api.patch(`/rbac/users/${userId}/role`, { roleId }),

  assignUserPermission: (userId: string, permissionId: string, isAllowed: boolean) =>
    api.post("/rbac/assign", { userId, permissionId, isAllowed }),

  permissions: () =>
    api
      .get("/rbac/permissions")
      .then((res) => (unwrap<RbacPermission[]>(res) ?? []) as RbacPermission[]),
};
