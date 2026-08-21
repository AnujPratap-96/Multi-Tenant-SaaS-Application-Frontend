import { useState } from "react";
import { MoreHorizontal, UserMinus, ShieldOff, ShieldCheck, type LucideIcon } from "lucide-react";
import {
  useMembers,
  useRemoveMember,
  useSuspendMember,
  useRestoreMember,
  useUpdateMember,
} from "@/features/tenant/tenantQueries";
import { useTenantStore } from "@/features/tenant/tenantStore";
import { useAuthStore } from "@/features/auth/authStore";
import { usePermissionStore } from "@/features/auth/permissionStore";
import Badge from "@/components/ui/Badge";
import SearchInput from "@/components/ui/SearchInput";
import { Select } from "@/components/ui/Select";
import Pagination from "@/components/ui/Pagination";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { cn } from "@/lib/utils";
import type { Member } from "@/types/domain";

interface RoleSelectProps {
  member: Member;
  tenantId?: string;
  disabled: boolean;
}

function RoleSelect({ member, tenantId, disabled }: RoleSelectProps) {
  const update = useUpdateMember(tenantId ?? "");
  return (
    <Select
      value={member.role}
      disabled={disabled || update.isPending}
      onChange={(e) => update.mutate({ userId: member.userId, data: { role: e.target.value } })}
      className="text-xs px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:opacity-50"
    >
      {["admin", "manager", "user"].map((r) => (
        <option key={r} value={r}>
          {r}
        </option>
      ))}
    </Select>
  );
}

interface ConfirmState {
  label: string;
  action: () => void;
}

interface ActionItem {
  label: string;
  icon: LucideIcon;
  danger: boolean;
  onClick: () => void;
}

interface ActionMenuProps {
  member: Member;
  tenantId?: string;
  canManage: boolean;
}

function ActionMenu({ member, tenantId, canManage }: ActionMenuProps) {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);
  const remove = useRemoveMember(tenantId ?? "");
  const suspend = useSuspendMember(tenantId ?? "");
  const restore = useRestoreMember(tenantId ?? "");

  if (!canManage) return null;

  const actions: ActionItem[] = [];
  if (member.status === "ACTIVE") {
    actions.push({
      label: "Suspend",
      icon: ShieldOff,
      danger: true,
      onClick: () => setConfirm({ label: "Suspend", action: () => suspend.mutate(member.userId) }),
    });
  }
  if (member.status === "SUSPENDED") {
    actions.push({
      label: "Restore",
      icon: ShieldCheck,
      danger: false,
      onClick: () => setConfirm({ label: "Restore", action: () => restore.mutate(member.userId) }),
    });
  }
  actions.push({
    label: "Remove",
    icon: UserMinus,
    danger: true,
    onClick: () => setConfirm({ label: "Remove", action: () => remove.mutate(member.userId) }),
  });

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setOpen((o) => !o)}
          className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div className="absolute right-0 mt-1 w-36 bg-surface-50 dark:bg-neutral-950 rounded-xl shadow-lg border border-neutral-100 dark:border-neutral-800 py-1 z-20">
              {actions.map((a) => (
                <button
                  key={a.label}
                  onClick={() => {
                    setOpen(false);
                    a.onClick();
                  }}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors",
                    a.danger ? "text-red-600 dark:text-red-400" : "text-neutral-700 dark:text-neutral-300"
                  )}
                >
                  <a.icon className="h-3.5 w-3.5" />
                  {a.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
      <ConfirmDialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title={`${confirm?.label ?? ""} member`}
        description={`Are you sure you want to ${confirm?.label?.toLowerCase() ?? ""} this member?`}
        confirmLabel={confirm?.label}
        isLoading={remove.isPending || suspend.isPending || restore.isPending}
        onConfirm={() => {
          confirm?.action();
          setConfirm(null);
        }}
      />
    </>
  );
}

export default function MembersTable() {
  const { currentTenant } = useTenantStore();
  const { user } = useAuthStore();
  const { role } = usePermissionStore();
  const canManage = role === "ADMIN" || role === "OWNER";

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const LIMIT = 10;

  const params = {
    page,
    limit: LIMIT,
    ...(statusFilter && { status: statusFilter }),
    ...(roleFilter && { role: roleFilter }),
  };
  const { data, isLoading, isFetching } = useMembers(currentTenant?.id, params);

  const members = data?.members ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / LIMIT);

  const filtered = search
    ? members.filter(
        (m) =>
          m.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
          `${m.user?.firstName ?? ""} ${m.user?.lastName ?? ""}`
            .toLowerCase()
            .includes(search.toLowerCase())
      )
    : members;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <SearchInput
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Search members…"
          className="sm:w-64"
        />
        <Select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="invited">Invited</option>
          <option value="suspended">Suspended</option>
        </Select>
        <Select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All roles</option>
          <option value="ADMIN">Admin</option>
          <option value="MANAGER">Manager</option>
          <option value="USER">User</option>
        </Select>
      </div>

      <div
        className={cn(
          "rounded-xl border border-neutral-100 dark:border-neutral-800 overflow-hidden bg-surface-50 dark:bg-neutral-950",
          isFetching && "opacity-70"
        )}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/30">
                <th className="text-left px-4 py-3 font-medium text-neutral-500 dark:text-neutral-400">Member</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-500 dark:text-neutral-400">Role</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-500 dark:text-neutral-400">Status</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-500 dark:text-neutral-400">Joined</th>
                {canManage && <th className="px-4 py-3 w-10" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: canManage ? 5 : 4 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={canManage ? 5 : 4} className="px-4 py-10 text-center text-neutral-400">
                    No members found
                  </td>
                </tr>
              ) : (
                filtered.map((m) => {
                  const isSelf = m.userId === user?.id;
                  const name = m.user?.firstName
                    ? `${m.user.firstName} ${m.user.lastName ?? ""}`.trim()
                    : m.user?.email;
                  const initials = name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2);
                  return (
                    <tr
                      key={m.userId}
                      className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 flex items-center justify-center font-semibold text-xs flex-shrink-0">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-neutral-900 dark:text-neutral-100 truncate">{name}</p>
                            <p className="text-xs text-neutral-500 truncate">{m.user?.email}</p>
                          </div>
                          {isSelf && <span className="text-xs text-neutral-400">(you)</span>}
                        </div>
                      </td>
<td className="px-4 py-3">
                          {canManage && !isSelf ? (
                            <RoleSelect member={m} tenantId={currentTenant?.id} disabled={false} />
                          ) : (
                            <Badge label={m.role} variant={m.role === "admin"
                              ? "admin"
                              : m.role === "manager"
                                ? "manager"
                                : "user"} />
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            label={m.status}
                            variant={m.status === "ACTIVE"
                              ? "active"
                              : m.status === "SUSPENDED"
                                ? "suspended"
                                : "removed"} />
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                        {m.joinedAt ? new Date(m.joinedAt).toLocaleDateString() : "—"}
                      </td>
                      {canManage && (
                        <td className="px-4 py-3 text-right">
                          {!isSelf && (
                            <ActionMenu member={m} tenantId={currentTenant?.id} canManage={canManage} />
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      {total > 0 && (
        <p className="text-xs text-neutral-400 text-right">
          {total} total member{total !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
