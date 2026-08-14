// F-14: storage keys + typed query key factories
// All query keys are tenant-scoped (S-15 fix: keys MUST include tenantId)

export const STORAGE_KEYS = {
  auth: "auth-storage",
  tenant: "tenant-storage",
  theme: "theme-storage",
} as const;

export const QUERY_KEYS = {
  me: () => ["me"] as const,
  tenants: () => ["tenants"] as const,
  tenant: (tenantId: string) => ["tenants", tenantId] as const,
  permissions: (tenantId: string) => ["rbac", "my", tenantId] as const,
  users: (tenantId: string, params?: Record<string, unknown>) =>
    ["tenants", tenantId, "users", params ?? {}] as const,
  projects: (tenantId: string, params?: Record<string, unknown>) =>
    ["tenants", tenantId, "projects", params ?? {}] as const,
  project: (tenantId: string, projectId: string) =>
    ["tenants", tenantId, "projects", projectId] as const,
  tasks: (tenantId: string, projectId: string, filters?: Record<string, unknown>) =>
    ["tenants", tenantId, "projects", projectId, "tasks", filters ?? {}] as const,
  dashboard: (tenantId: string) => ["tenants", tenantId, "dashboard"] as const,
  auditLogs: (tenantId: string, filters?: Record<string, unknown>) =>
    ["tenants", tenantId, "audit-logs", filters ?? {}] as const,
  invites: (tenantId: string, filters?: Record<string, unknown>) =>
    ["tenants", tenantId, "invites", filters ?? {}] as const,
  settings: (tenantId: string) => ["tenants", tenantId, "settings"] as const,
  roles: (tenantId: string) => ["rbac", "roles", tenantId] as const,
  sessions: () => ["me", "sessions"] as const,
} as const;

export const TENANT_STORAGE_CURRENT = "tenant.current" as const;
