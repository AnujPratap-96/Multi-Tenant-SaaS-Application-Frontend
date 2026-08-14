import { useState, useEffect, useMemo } from "react";
import { Search, UserPlus, Shield, Mail, Ban, Undo2, Trash2, Users } from "lucide-react";
import { useTenantStore } from "@/features/tenant/tenantStore";
import {
  useMembers,
  useUpdateMember,
  useRemoveMember,
  useSuspendMember,
  useRestoreMember,
  useCreateInvite,
} from "@/features/tenant/tenantQueries";
import type { MemberUpdateInput } from "@/features/tenant/tenantApi";
import Badge from "@/components/ui/Badge";
import Pagination from "@/components/ui/Pagination";
import Modal from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import PageLoader from "@/components/ui/PageLoader";
import type { Member } from "@/types/domain";

const ROLE_OPTIONS = [
  { value: "", label: "All Roles" },
  { value: "admin", label: "Admin" },
  { value: "manager", label: "Manager" },
  { value: "user", label: "User" },
];

const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
];

function RoleBadge({ role }: { role?: string }) {
  const map: Record<string, "admin" | "manager" | "user"> = { admin: "admin", manager: "manager", user: "user" };
  const variant = role ? (map[role] || "user") : "user";
  return <Badge label={role} variant={variant} />;
}

function StatusBadge({ status }: { status?: string }) {
  if (status === "suspended") return <Badge label="Suspended" variant="suspended" />;
  return <Badge label="Active" variant="active" />;
}

// ─── Invite Member Modal ───────────────────────────────────

function InviteModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const tenantId = useTenantStore((s) => s.currentTenant?.id);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user");
  const createInvite = useCreateInvite(tenantId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    createInvite.mutate(
      { email: email.trim(), role },
      {
        onSuccess: () => {
          onClose();
          setEmail("");
          setRole("user");
        },
      }
    );
  };

  return (
    <Modal open={open} onClose={onClose} title="Invite Member">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email address
          </label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="colleague@company.com"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full h-9 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
          >
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="user">User</option>
          </select>
        </div>
        <div className="flex gap-3 justify-end pt-2 border-t border-gray-100 dark:border-gray-800">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={createInvite.isPending}>
            <Mail className="h-4 w-4 mr-1.5" />
            Send Invite
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Edit Role Modal ───────────────────────────────────────

interface EditRoleModalProps {
  open: boolean;
  onClose: () => void;
  member: Member | null;
  onSave: (data: { userId: string; data: MemberUpdateInput }) => void;
}

function EditRoleModal({ open, onClose, member, onSave }: EditRoleModalProps) {
  const [role, setRole] = useState("user");

  const [prevMemberId, setPrevMemberId] = useState<string | null>(null);
  if (member?.userId !== prevMemberId) {
    setPrevMemberId(member?.userId ?? null);
    if (member) setRole(member.role);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (member) onSave({ userId: member.userId, data: { role } });
  };

  return (
    <Modal open={open} onClose={onClose} title="Change Role">
      <form onSubmit={handleSubmit} className="space-y-5">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Update role for{" "}
          <span className="font-medium text-gray-900 dark:text-white">
            {member?.user?.firstName || member?.user?.email}
          </span>
        </p>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full h-9 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
          >
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="user">User</option>
          </select>
        </div>
        <div className="flex gap-3 justify-end pt-2 border-t border-gray-100 dark:border-gray-800">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Save</Button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Main Page ─────────────────────────────────────────────

export default function TeamPage() {
  const tenantId = useTenantStore((s) => s.currentTenant?.id);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [inviteOpen, setInviteOpen] = useState(false);
  const [editMember, setEditMember] = useState<Member | null>(null);
  const [removeTarget, setRemoveTarget] = useState<Member | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const filterKey = `${debouncedSearch}|${roleFilter}|${statusFilter}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setPage(1);
  }

  const queryParams = useMemo(() => {
    const p: Record<string, unknown> = { page, limit: "20" };
    if (roleFilter) p.role = roleFilter;
    if (statusFilter) p.status = statusFilter;
    return p;
  }, [page, roleFilter, statusFilter]);

  const { data, isLoading } = useMembers(tenantId, queryParams);
  const updateMember = useUpdateMember(tenantId);
  const removeMember = useRemoveMember(tenantId);
  const suspendMember = useSuspendMember(tenantId);
  const restoreMember = useRestoreMember(tenantId);

  const members = (() => {
    if (!data?.members) return [];
    if (!debouncedSearch) return data.members;
    const q = debouncedSearch.toLowerCase();
    return data.members.filter((m) => {
      const u = m.user;
      const name = `${u?.firstName ?? ""} ${u?.lastName ?? ""}`.toLowerCase();
      return name.includes(q) || (u?.email ?? "").toLowerCase().includes(q);
    });
  })();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Team</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your organization&apos;s members, roles, and access.
          </p>
        </div>
        <Button onClick={() => setInviteOpen(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Invite Member
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full pl-9 pr-3 h-9 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="h-9 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
        >
          {ROLE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        {isLoading ? (
          <div className="p-12">
            <PageLoader />
          </div>
        ) : !members.length ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">
            <Users className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
            <p className="font-medium">No members found</p>
            <p className="text-sm mt-1">
              {debouncedSearch || roleFilter || statusFilter
                ? "Try adjusting your filters."
                : "Invite your first team member to get started."}
            </p>
            {!(debouncedSearch || roleFilter || statusFilter) && (
              <Button variant="outline" size="sm" className="mt-4" onClick={() => setInviteOpen(true)}>
                <UserPlus className="h-4 w-4 mr-1.5" /> Invite Member
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Member</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {members.map((m) => {
                  const u = m.user;
                  const name = [u?.firstName, u?.lastName].filter(Boolean).join(" ") || u?.email;
                  const initial = (u?.firstName?.[0] || u?.email?.[0] || "?").toUpperCase();

                  return (
                    <tr key={m.id ?? m.userId} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-700 dark:text-primary-300 font-semibold text-sm flex-shrink-0">
                            {initial}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{u?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <RoleBadge role={m.role} />
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={m.status} />
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-500 dark:text-gray-400">
                        {m.joinedAt ? new Date(m.joinedAt).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setEditMember(m)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                            title="Change role"
                          >
                            <Shield className="h-4 w-4" />
                          </button>
                          {m.status === "SUSPENDED" ? (
                            <button
                              onClick={() => restoreMember.mutate(m.userId)}
                              className="p-1.5 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                              title="Restore member"
                            >
                              <Undo2 className="h-4 w-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => suspendMember.mutate(m.userId)}
                              className="p-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                              title="Suspend member"
                            >
                              <Ban className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => setRemoveTarget(m)}
                            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                            title="Remove member"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {data?.pagination && (
        <Pagination page={data.pagination.page} totalPages={data.pagination.totalPages} onChange={setPage} />
      )}

      {/* Invite Modal */}
      {inviteOpen && <InviteModal open={inviteOpen} onClose={() => setInviteOpen(false)} />}

      {/* Edit Role Modal */}
      {editMember && (
        <EditRoleModal
          open={!!editMember}
          onClose={() => setEditMember(null)}
          member={editMember}
          onSave={(data) =>
            updateMember.mutate(data, {
              onSuccess: () => setEditMember(null),
            })
          }
        />
      )}

      {/* Remove Confirm */}
      {removeTarget && (
        <ConfirmDialog
          open={!!removeTarget}
          onClose={() => setRemoveTarget(null)}
          onConfirm={() =>
            removeMember.mutate(removeTarget.userId, {
              onSuccess: () => setRemoveTarget(null),
            })
          }
          title="Remove Member"
          description={`Are you sure you want to remove ${removeTarget?.user?.firstName || removeTarget?.user?.email} from this organization?`}
          confirmLabel="Remove"
          isLoading={removeMember.isPending}
        />
      )}
    </div>
  );
}
