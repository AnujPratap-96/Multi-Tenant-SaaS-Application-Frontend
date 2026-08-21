import { useState } from "react";
import {
  Shield,
  Check,
  X as XIcon,
  Users,
  Key,
  Layers,
  ChevronRight,
  ChevronDown,
  Ban,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { useTenantStore } from "@/features/tenant/tenantStore";
import { Select } from "@/components/ui/Select";
import {
  useRoles,
  useRbacUsers,
  useUpdateUserRole,
  useAssignUserPermission,
  usePermissions,
} from "@/features/rbac/rbacQueries";
import type { RbacPermission, RbacRole } from "@/features/rbac/rbacApi";
import Badge, { type BadgeVariant } from "@/components/ui/Badge";
import SearchInput from "@/components/ui/SearchInput";
import { cn } from "@/lib/utils";

const SYSTEM_ORDER: Record<string, number> = { admin: 0, manager: 1, user: 2 };

function groupBy<T>(ary: T[], keyFn: (item: T) => string) {
  const map: Record<string, T[]> = {};
  for (const item of ary) {
    const k = keyFn(item);
    if (!map[k]) map[k] = [];
    map[k].push(item);
  }
  return map;
}

function DynamicPermissionMatrix({
  role,
  onToggle,
  tenantId,
  allPermissions: externalPermissions,
}: {
  role: RbacRole;
  onToggle?: (permissionId: string) => void;
  tenantId?: string;
  allPermissions?: RbacPermission[];
}) {
  const { data: fetchedPermissions } = usePermissions(tenantId);
  const allPermissions = externalPermissions || fetchedPermissions || [];

  const grouped = groupBy(allPermissions, (p) => p.resource);

  const hasPerm = (permId: string) =>
    role.rolePermissions?.some(
      (rp) => rp.permissionId === permId || rp.permission?.id === permId
    );

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 dark:border-gray-800">
            <th className="text-left py-2 pr-4 font-medium text-gray-500 dark:text-gray-400">
              Resource
            </th>
            {Array.from(new Set(allPermissions.map((p) => p.action))).map((action) => (
              <th
                key={action}
                className="text-center py-2 px-3 font-medium text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider"
              >
                {action}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Object.entries(grouped).map(([resource, perms]) => (
            <tr key={resource} className="border-b border-gray-50 dark:border-gray-800/50">
              <td className="py-2.5 pr-4 font-medium text-gray-700 dark:text-gray-300 capitalize">
                {resource}
              </td>
              {Array.from(new Set(allPermissions.map((p) => p.action))).map((action) => {
                const perm = perms.find((p) => p.action === action);
                const enabled = perm && hasPerm(perm.id);
                return (
                  <td key={action} className="text-center py-2.5 px-3">
                    {perm ? (
                      onToggle ? (
                        <button
                          onClick={() => onToggle(perm.id)}
                          className={cn(
                            "w-7 h-7 rounded-md flex items-center justify-center transition-colors mx-auto",
                            enabled
                              ? "bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300"
                              : "bg-gray-50 dark:bg-gray-800/50 text-gray-300 dark:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                          )}
                        >
                          {enabled ? <Check className="h-4 w-4" /> : <XIcon className="h-4 w-4" />}
                        </button>
                      ) : (
                        <span
                          className={cn(
                            "w-7 h-7 rounded-md inline-flex items-center justify-center mx-auto",
                            enabled
                              ? "bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300"
                              : "bg-gray-50 dark:bg-gray-800/50 text-gray-300 dark:text-gray-600"
                          )}
                        >
                          {enabled ? <Check className="h-4 w-4" /> : <XIcon className="h-4 w-4" />}
                        </span>
                      )
                    ) : (
                      <span className="text-gray-200 dark:text-gray-700 text-xs">—</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function UserRoleAssignment({ tenantId }: { tenantId?: string }) {
  const { data: users, isLoading } = useRbacUsers(tenantId);
  const { data: roles } = useRoles(tenantId);
  const updateUserRole = useUpdateUserRole(tenantId);
  const [search, setSearch] = useState("");

  const filtered =
    users?.filter(
      (u) =>
        !search ||
        u.user?.firstName?.toLowerCase().includes(search.toLowerCase()) ||
        u.user?.lastName?.toLowerCase().includes(search.toLowerCase()) ||
        u.user?.email?.toLowerCase().includes(search.toLowerCase())
    ) || [];

  if (isLoading) {
    return <div className="animate-pulse h-48 bg-gray-100 dark:bg-gray-800 rounded-xl" />;
  }

  return (
    <div className="space-y-4">
      <SearchInput value={search} onChange={setSearch} placeholder="Search members…" className="max-w-xs" />
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">
                Member
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">
                Current Role
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">
                Change Role
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((member) => (
              <tr key={member.userId} className="border-b border-gray-50 dark:border-gray-800/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold">
                      {member.user?.firstName?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">
                        {member.user?.firstName} {member.user?.lastName}
                      </p>
                      <p className="text-xs text-gray-500">{member.user?.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge label={member.role} variant={(member.role as BadgeVariant) ?? "default"} />
                </td>
                <td className="px-4 py-3">
                  <Select
                    value={member.role}
                    onChange={(e) => updateUserRole.mutate({ userId: member.userId, roleId: e.target.value })}
                    className="text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {roles?.map((r) => (
                      <option key={r.id} value={r.name}>
                        {r.name}
                      </option>
                    ))}
                  </Select>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={3} className="text-center py-8 text-gray-400 text-sm">
                  No members found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function UserPermissionOverrides({ tenantId }: { tenantId?: string }) {
  const { data: users, isLoading: usersLoading } = useRbacUsers(tenantId);
  const { data: allPermissions } = usePermissions(tenantId);
  const assignPermission = useAssignUserPermission(tenantId);
  const [search, setSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [localOverrides, setLocalOverrides] = useState<Record<string, "ALLOW" | "DENY">>({});

  const filtered =
    users?.filter(
      (u) =>
        !search ||
        u.user?.firstName?.toLowerCase().includes(search.toLowerCase()) ||
        u.user?.lastName?.toLowerCase().includes(search.toLowerCase()) ||
        u.user?.email?.toLowerCase().includes(search.toLowerCase())
    ) || [];

  const selectedUser = users?.find((u) => u.userId === selectedUserId);
  const grouped = groupBy(allPermissions || [], (p) => p.resource);

  const handleOverride = (permissionId: string) => {
    if (!selectedUserId) return;
    const key = `${selectedUserId}:${permissionId}`;
    const current = localOverrides[key];
    let newState: "ALLOW" | "DENY" | null;
    if (!current) {
      newState = "ALLOW";
    } else if (current === "ALLOW") {
      newState = "DENY";
    } else {
      newState = null;
    }

    const updated = { ...localOverrides };
    if (newState) {
      updated[key] = newState;
    } else {
      delete updated[key];
    }
    setLocalOverrides(updated);

    if (newState) {
      assignPermission.mutate({
        userId: selectedUserId,
        permissionId,
        isAllowed: newState === "ALLOW",
      });
    }
  };

  const getOverrideIcon = (permId: string) => {
    if (!selectedUserId) return null;
    const state = localOverrides[`${selectedUserId}:${permId}`];
    if (!state) return null;
    if (state === "ALLOW") return <ToggleRight className="h-4 w-4 text-green-500" />;
    return <Ban className="h-4 w-4 text-red-400" />;
  };

  const getOverrideHint = (permId: string) => {
    if (!selectedUserId) return "Click to override";
    const state = localOverrides[`${selectedUserId}:${permId}`];
    if (!state) return "Role-based (click to allow)";
    if (state === "ALLOW") return "Override: allowed (click to deny)";
    return "Override: denied (click to reset)";
  };

  if (usersLoading) {
    return <div className="animate-pulse h-48 bg-gray-100 dark:bg-gray-800 rounded-xl" />;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-4 space-y-2">
        <SearchInput value={search} onChange={setSearch} placeholder="Search members…" className="mb-3" />
        {filtered.map((member) => (
          <button
            key={member.userId}
            onClick={() => {
              setSelectedUserId(member.userId);
              setLocalOverrides({});
            }}
            className={cn(
              "w-full text-left p-3 rounded-xl border transition-colors",
              selectedUserId === member.userId
                ? "bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800"
                : "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:border-primary-100 dark:hover:border-primary-800/50"
            )}
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {member.user?.firstName?.[0]?.toUpperCase() || "?"}
              </div>
              <div className="min-w-0">
                <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                  {member.user?.firstName} {member.user?.lastName}
                </p>
                <p className="text-xs text-gray-500 truncate">{member.user?.email}</p>
              </div>
              <Badge
                label={member.role}
                variant={(member.role as BadgeVariant) ?? "default"}
                className="ml-auto shrink-0"
              />
            </div>
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="text-center py-8 text-gray-400 text-sm">No members found</p>
        )}
      </div>

      <div className="lg:col-span-8">
        {selectedUser ? (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-bold">
                  {selectedUser.user?.firstName?.[0]?.toUpperCase() || "?"}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {selectedUser.user?.firstName} {selectedUser.user?.lastName}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {selectedUser.user?.email} ·{" "}
                    <Badge
                      label={selectedUser.role}
                      variant={(selectedUser.role as BadgeVariant) ?? "default"}
                      className="inline"
                    />
                  </p>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-400 mb-4">
              Click a permission to override the role-based setting.{" "}
              <ToggleRight className="h-3 w-3 inline text-green-500" /> = allowed,{" "}
              <Ban className="h-3 w-3 inline text-red-400" /> = denied, empty = inherited from role.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    <th className="text-left py-2 pr-4 font-medium text-gray-500 dark:text-gray-400">
                      Resource
                    </th>
                    {Array.from(new Set((allPermissions || []).map((p) => p.action))).map((action) => (
                      <th
                        key={action}
                        className="text-center py-2 px-3 font-medium text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider"
                      >
                        {action}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(grouped).map(([resource, perms]) => (
                    <tr key={resource} className="border-b border-gray-50 dark:border-gray-800/50">
                      <td className="py-2.5 pr-4 font-medium text-gray-700 dark:text-gray-300 capitalize">
                        {resource}
                      </td>
                      {Array.from(new Set((allPermissions || []).map((p) => p.action))).map((action) => {
                        const perm = perms.find((p) => p.action === action);
                        return (
                          <td key={action} className="text-center py-2.5 px-3">
                            {perm ? (
                              <button
                                onClick={() => handleOverride(perm.id)}
                                title={getOverrideHint(perm.id)}
                                className={cn(
                                  "w-8 h-8 rounded-md flex items-center justify-center transition-colors mx-auto group relative",
                                  localOverrides[`${selectedUserId}:${perm.id}`]
                                    ? localOverrides[`${selectedUserId}:${perm.id}`] === "ALLOW"
                                      ? "bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                                      : "bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400"
                                    : "bg-gray-50 dark:bg-gray-800/50 text-gray-300 dark:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                                )}
                              >
                                {getOverrideIcon(perm.id) || <ToggleLeft className="h-4 w-4 opacity-50" />}
                              </button>
                            ) : (
                              <span className="text-gray-200 dark:text-gray-700 text-xs">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-12 text-center text-gray-400">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Select a member to manage their permission overrides</p>
          </div>
        )}
      </div>
    </div>
  );
}

function RoleHierarchyView({ roles }: { roles?: RbacRole[] }) {
  const [expanded, setExpanded] = useState(true);

  if (!roles || roles.length === 0) return null;

  const systemRoles = roles
    .filter((r) => r.isSystem)
    .sort((a, b) => (SYSTEM_ORDER[a.name] ?? 99) - (SYSTEM_ORDER[b.name] ?? 99));
  const customRoles = roles.filter((r) => !r.isSystem);

  const maxPerms = Math.max(...roles.map((r) => r.rolePermissions?.length || 0), 1);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Layers className="h-5 w-5 text-primary-600" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Role Hierarchy</h3>
        </div>
        <span className="text-xs text-gray-400">{roles.length} roles</span>
      </div>

      {/* System tier */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            System Roles
          </span>
          <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800" />
        </div>
        {expanded && (
          <div className="space-y-0">
            {systemRoles.map((role, idx) => {
              const permCount = role.rolePermissions?.length || 0;
              const pct = (permCount / maxPerms) * 100;
              const levels = ["Full Access", "Elevated Access", "Limited Access"];
              const level = SYSTEM_ORDER[role.name] ?? 2;
              return (
                <div key={role.id} className="relative">
                  {idx > 0 && (
                    <div className="absolute left-[17px] -top-0 w-px h-6 bg-gray-200 dark:bg-gray-700" />
                  )}
                  {idx < systemRoles.length - 1 && (
                    <div className="absolute left-[17px] top-8 w-px h-4 bg-gray-200 dark:bg-gray-700" />
                  )}
                  <div className="flex items-start gap-4 py-3 pl-1">
                    <div
                      className={cn(
                        "w-9 h-9 rounded-full flex items-center justify-center shrink-0 border-2 text-xs font-bold",
                        level === 0
                          ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-600 text-yellow-700 dark:text-yellow-400"
                          : level === 1
                            ? "bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-400"
                            : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400"
                      )}
                    >
                      {level + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-900 dark:text-white text-sm">
                          {role.name}
                        </span>
                        <Badge label="System" variant="admin" className="text-[10px]" />
                        <span className="text-xs text-gray-400">{levels[level]}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {role.description || "No description"}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex-1 max-w-[200px] h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all",
                              level === 0 ? "bg-yellow-400" : level === 1 ? "bg-blue-400" : "bg-gray-400"
                            )}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 font-medium">
                          {permCount} / {maxPerms} permissions
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Custom roles tier */}
      {customRoles.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Custom Roles
            </span>
            <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {customRoles.map((role) => {
              const permCount = role.rolePermissions?.length || 0;
              const pct = (permCount / maxPerms) * 100;
              return (
                <div
                  key={role.id}
                  className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30"
                >
                  <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 border-2 border-primary-200 dark:border-primary-700 flex items-center justify-center text-xs font-bold text-primary-600 dark:text-primary-400 shrink-0">
                    C
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 dark:text-white text-sm">
                        {role.name}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                      {role.description || "Custom role"}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex-1 max-w-[120px] h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-primary-400" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-gray-500">{permCount} perms</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

type TabId = "roles" | "users" | "overrides" | "hierarchy";

export default function RolesPage() {
  const { currentTenant } = useTenantStore();
  const tenantId = currentTenant?.id;
  const { data: roles, isLoading } = useRoles(tenantId);

  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("roles");

  const selectedRole = roles?.find((r) => r.id === selectedRoleId) || roles?.[0];

  const rolesKey = roles ? roles.map((r) => r.id).join(",") : null;
  const [prevRolesKey, setPrevRolesKey] = useState<string | null>(null);
  if (rolesKey !== prevRolesKey) {
    setPrevRolesKey(rolesKey);
    if (roles && roles.length > 0 && !selectedRoleId) {
      setSelectedRoleId(roles[0].id);
    }
  }

  const tabs = [
    { id: "roles" as TabId, label: "Roles & Permissions", icon: Shield },
    { id: "users" as TabId, label: "User Roles", icon: Users },
    { id: "overrides" as TabId, label: "Permission Overrides", icon: Key },
    { id: "hierarchy" as TabId, label: "Hierarchy", icon: Layers },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Roles & Permissions</h1>
        <div className="animate-pulse h-64 bg-gray-100 dark:bg-gray-800 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Roles & Permissions</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Manage roles, permissions, and user assignments
          </p>
        </div>
      </div>

      <div className="border-b border-gray-200 dark:border-gray-800">
        <nav className="flex gap-1 -mb-px">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
                activeTab === t.id
                  ? "border-primary-600 text-primary-600 dark:text-primary-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              )}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === "roles" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3 space-y-2">
            {roles?.map((role) => {
              const permCount = role.rolePermissions?.length || 0;
              const isSelected = role.id === selectedRole?.id;
              return (
                <button
                  key={role.id}
                  onClick={() => setSelectedRoleId(role.id)}
                  className={cn(
                    "w-full text-left p-4 rounded-xl border transition-colors",
                    isSelected
                      ? "bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800"
                      : "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:border-primary-100 dark:hover:border-primary-800/50"
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-gray-900 dark:text-white text-sm">
                      {role.name}
                    </span>
                    {role.isSystem && (
                      <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                        System
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mb-2 line-clamp-1">
                    {role.description || "No description"}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge label={`${permCount} permissions`} variant="user" />
                  </div>
                </button>
              );
            })}
          </div>

          <div className="lg:col-span-9">
            {selectedRole ? (
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                      {selectedRole.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {selectedRole.description || "No description"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Key className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-500">
                      {selectedRole.rolePermissions?.length || 0} permissions
                    </span>
                  </div>
                </div>
                <DynamicPermissionMatrix role={selectedRole} tenantId={tenantId} />
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-12 text-center text-gray-400">
                <Shield className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Select a role to manage its permissions</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "users" && <UserRoleAssignment tenantId={tenantId} />}

      {activeTab === "overrides" && <UserPermissionOverrides tenantId={tenantId} />}

      {activeTab === "hierarchy" && <RoleHierarchyView roles={roles} />}

      <p className="text-xs text-gray-400">
        Roles are read-only in this version. Role changes are managed by the platform.
      </p>
    </div>
  );
}
