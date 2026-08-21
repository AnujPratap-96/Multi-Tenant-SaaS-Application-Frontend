import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Search, SlidersHorizontal, UserPlus, Trash2, Users } from "lucide-react";
import api from "@/lib/axios";
import { usePermissionStore } from "@/features/auth/permissionStore";
import Badge, { type BadgeVariant } from "@/components/ui/Badge";
import Pagination from "@/components/ui/Pagination";
import Modal from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import PageLoader from "@/components/ui/PageLoader";
import { toast } from "sonner";
import type { ApiError } from "@/types/domain";

const ROLE_OPTIONS = [
  { value: "ALL", label: "All Roles" },
  { value: "admin", label: "Admin" },
  { value: "manager", label: "Manager" },
  { value: "user", label: "User" },
];

const STATUS_OPTIONS = [
  { value: "ALL", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
];

interface AdminUser {
  id: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  email: string;
  emailVerified?: boolean;
  isActive?: boolean;
  membershipRole?: string;
  membershipStatus?: string;
  lastLoginAt?: string;
}

interface UsersResponse {
  users: AdminUser[];
  pagination?: { page: number; totalPages: number; total: number };
}

interface EditUserForm {
  firstName: string;
  lastName: string;
  avatarUrl: string;
  emailVerified: boolean;
  isActive: boolean;
  role: string;
  status: string;
}

function StatusBadge({ status, isActive }: { status?: string; isActive?: boolean }) {
  if (status === "suspended") return <Badge label="Suspended" variant="suspended" />;
  if (!isActive) return <Badge label="Inactive" variant="removed" />;
  return <Badge label="Active" variant="active" />;
}

function RoleBadge({ role }: { role?: string }) {
  const map: Record<string, BadgeVariant> = { admin: "admin", manager: "manager", user: "user" };
  const variant: BadgeVariant = role ? (map[role] || "user") : "user";
  return <Badge label={role} variant={variant} />;
}

interface EditUserModalProps {
  open: boolean;
  onClose: () => void;
  user: AdminUser | null;
  onSave: (form: EditUserForm) => void;
}

function EditUserModal({ open, onClose, user, onSave }: EditUserModalProps) {
  const [form, setForm] = useState<EditUserForm>({
    firstName: "",
    lastName: "",
    avatarUrl: "",
    emailVerified: false,
    isActive: true,
    role: "user",
    status: "active",
  });

  const [prevUserId, setPrevUserId] = useState<string | null>(null);
  if (user?.id !== prevUserId) {
    setPrevUserId(user?.id ?? null);
    if (user) {
      setForm({
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
        avatarUrl: user.avatarUrl ?? "",
        emailVerified: user.emailVerified ?? false,
        isActive: user.isActive ?? true,
        role: user.membershipRole ?? "user",
        status: user.membershipStatus === "suspended" ? "suspended" : "active",
      });
    }
  }

  const set = (field: keyof EditUserForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...form });
  };

  return (
    <Modal open={open} onClose={onClose} title="Edit User" size="lg">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
<div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              First Name
            </label>
            <Input value={form.firstName} onChange={set("firstName")} placeholder="First name" />
          </div>
<div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Last Name
            </label>
            <Input value={form.lastName} onChange={set("lastName")} placeholder="Last name" />
          </div>
        </div>

<div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Avatar URL
          </label>
          <Input
            value={form.avatarUrl}
            onChange={set("avatarUrl")}
            placeholder="https://example.com/avatar.jpg"
          />
        </div>

        <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">Account</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Role
              </label>
              <Select
                value={form.role}
                onChange={set("role")}
                className="w-full h-9 px-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-surface-50 dark:bg-neutral-900 text-sm text-gray-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
              >
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="user">User</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Membership
              </label>
              <Select
                value={form.status}
                onChange={set("status")}
                className="w-full h-9 px-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-surface-50 dark:bg-neutral-900 text-sm text-gray-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
              >
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </Select>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">Flags</p>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={set("isActive")}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-neutral-700 dark:text-neutral-300">User Active</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.emailVerified}
                onChange={set("emailVerified")}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-neutral-700 dark:text-neutral-300">Email Verified</span>
            </label>
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-2 border-t border-gray-100 dark:border-gray-800">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Save Changes</Button>
        </div>
      </form>
    </Modal>
  );
}

export default function UsersPage() {
  const queryClient = useQueryClient();
  const { role } = usePermissionStore();
  const isAdmin = role === "admin" || role === "OWNER";

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const userFilterKey = `${debouncedSearch}|${roleFilter}|${statusFilter}`;
  const [prevFilterKey, setPrevFilterKey] = useState(userFilterKey);
  if (userFilterKey !== prevFilterKey) {
    setPrevFilterKey(userFilterKey);
    setPage(1);
  }

  const { data, isLoading } = useQuery<UsersResponse, ApiError>({
    queryKey: ["users", page, debouncedSearch, roleFilter, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: "10" });
      if (debouncedSearch) params.set("q", debouncedSearch);
      if (roleFilter !== "ALL") params.set("role", roleFilter);
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      const res = await api.get<{ data: UsersResponse }>(`/users?${params}`);
      return res.data.data;
    },
    placeholderData: (prev) => prev,
  });

  const updateMutation = useMutation<unknown, ApiError, { id: string } & Record<string, unknown>>({
    mutationFn: async ({ id, ...data }) => {
      const res = await api.patch(`/users/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setEditUser(null);
      toast.success("User updated");
    },
    onError: (err: ApiError) => {
      toast.error(err.response?.data?.message ?? "Failed to update user");
    },
  });

  const deleteMutation = useMutation<unknown, ApiError, string>({
    mutationFn: async (id) => {
      await api.delete(`/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setDeleteTarget(null);
      toast.success("User deleted");
    },
    onError: (err: ApiError) => {
      toast.error(err.response?.data?.message ?? "Failed to delete user");
    },
  });

  const handleEditSave = useCallback(
    (formData: EditUserForm) => {
      if (!editUser) return;
      updateMutation.mutate({ id: editUser.id, ...formData });
    },
    [editUser, updateMutation]
  );

  const handleDelete = useCallback(() => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id);
  }, [deleteTarget, deleteMutation]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Users</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Manage team members and their access.
          </p>
        </div>
        <Link to="/dashboard/team">
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Invite Member
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full pl-9 pr-3 h-9 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-surface-50 dark:bg-neutral-900 text-sm text-gray-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
          />
        </div>
        <div className="flex gap-2">
          <Select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="h-9 px-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-surface-50 dark:bg-neutral-900 text-sm text-gray-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
          >
            {ROLE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-surface-50 dark:bg-neutral-900 text-sm text-gray-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface-50 dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        {isLoading ? (
          <div className="p-12">
            <PageLoader />
          </div>
        ) : !data?.users?.length ? (
          <div className="p-12 text-center text-neutral-500 dark:text-neutral-400">
            <Users className="h-12 w-12 mx-auto mb-3 text-neutral-300 dark:text-neutral-600" />
            <p className="font-medium">No users found</p>
            <p className="text-sm mt-1">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">User</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Role</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Last Login</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {data.users.map((user) => (
                  <tr key={user.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors">
                    <td className="px-5 py-3.5">
                      <Link to={`/dashboard/users/${user.id}`} className="flex items-center gap-3 group">
                        <div className="h-9 w-9 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-700 dark:text-primary-300 font-semibold text-sm flex-shrink-0">
                          {(user.firstName?.[0] ?? user.email[0]).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors truncate">
                            {user.firstName || user.lastName
                              ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()
                              : "Unnamed User"}
                          </p>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">{user.email}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-5 py-3.5">
                      <RoleBadge role={user.membershipRole} />
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={user.membershipStatus} isActive={user.isActive} />
                    </td>
                    <td className="px-5 py-3.5 text-sm text-neutral-500 dark:text-neutral-400">
                      {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : "Never"}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setEditUser(user)}
                          className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
                          title="Edit user"
                        >
                          <SlidersHorizontal className="h-4 w-4" />
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => setDeleteTarget(user)}
                            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                            title="Deactivate user"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {data?.pagination && (
        <Pagination page={data.pagination.page} totalPages={data.pagination.totalPages} onChange={setPage} />
      )}

      {/* Edit Modal */}
      {editUser && (
        <EditUserModal
          open={!!editUser}
          onClose={() => setEditUser(null)}
          user={editUser}
          onSave={handleEditSave}
        />
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <ConfirmDialog
          open={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          title="Deactivate User"
          description={`Are you sure you want to deactivate ${deleteTarget.firstName || deleteTarget.email}? They will lose access to this organization.`}
          confirmLabel="Deactivate"
          isLoading={deleteMutation.isPending}
        />
      )}
    </div>
  );
}
