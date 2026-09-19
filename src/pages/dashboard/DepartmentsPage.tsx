import { useMemo, useState } from "react";
import { Building2, Plus, Trash2, Users, UserPlus, X } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import PageLoader from "@/components/ui/PageLoader";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { toast } from "sonner";
import { useTenantStore } from "@/features/tenant/tenantStore";
import { usePermissionStore } from "@/features/auth/permissionStore";
import { useMembers } from "@/features/tenant/tenantQueries";
import {
  useDepartments,
  useDepartmentMembers,
  useCreateDepartment,
  useDeleteDepartment,
  useAddDepartmentMember,
  useRemoveDepartmentMember,
} from "@/features/departments/departmentsQueries";
import type { User } from "@/types/domain";

function Avatar({ user, size = "sm" }: { user?: User | null; size?: "sm" | "lg" }) {
  const initials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() ||
      user.email?.[0]?.toUpperCase() ||
      "?"
    : "?";
  const dim = size === "lg" ? "h-9 w-9 text-sm" : "h-7 w-7 text-xs";
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-medium flex-shrink-0 ${dim}`}
    >
      {initials}
    </span>
  );
}

function userName(u?: User | null) {
  if (!u) return "Unknown";
  return u.firstName ? `${u.firstName} ${u.lastName || ""}`.trim() : u.email;
}

export default function DepartmentsPage() {
  const currentTenant = useTenantStore((s) => s.currentTenant);
  const { role } = usePermissionStore();
  const isAdmin = role === "ADMIN" || role === "OWNER";

  const { data, isLoading } = useDepartments({ limit: 50 });
  const { data: membersData } = useMembers(currentTenant?.id, { limit: 100 });
  const members = useMemo(() => membersData?.members ?? [], [membersData]);

  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", managerId: "" });
  const createDept = useCreateDepartment();

  const [detailId, setDetailId] = useState<string | null>(null);
  const { data: deptMembers, isLoading: membersLoading } = useDepartmentMembers(detailId ?? undefined, {
    limit: 100,
  });
  const addMember = useAddDepartmentMember(detailId ?? undefined);
  const removeMember = useRemoveDepartmentMember(detailId ?? undefined);
  const deleteDept = useDeleteDepartment();

  const [addUserId, setAddUserId] = useState("");
  const [addRole, setAddRole] = useState<"MANAGER" | "LEAD" | "MEMBER">("MEMBER");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const departments = data?.departments ?? [];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Name is required");
    if (!form.managerId) return toast.error("Select a manager");
    createDept.mutate(
      { name: form.name.trim(), description: form.description.trim() || undefined, managerId: form.managerId },
      {
        onSuccess: () => {
          setCreateOpen(false);
          setForm({ name: "", description: "", managerId: "" });
        },
      }
    );
  };

  const handleAddMember = () => {
    if (!addUserId) return toast.error("Select a member");
    addMember.mutate({ userId: addUserId, role: addRole }, { onSuccess: () => setAddUserId("") });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteDept.mutate(deleteTarget, {
      onSuccess: () => {
        setDeleteTarget(null);
        setDetailId(null);
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Building2 className="h-6 w-6 text-primary-500" /> Departments
        </h1>
        {isAdmin && (
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-1.5" /> New Department
          </Button>
        )}
      </div>

      {isLoading ? (
        <PageLoader />
      ) : departments.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-12 text-center">
          <Building2 className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">No departments yet</p>
          {isAdmin && (
            <Button className="mt-4" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-1.5" /> Create Department
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {departments.map((d) => (
            <div
              key={d.id}
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setDetailId(d.id)}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="h-9 w-9 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400">
                  <Building2 className="h-4 w-4" />
                </span>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">{d.name}</h3>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 min-h-[2.5rem]">
                {d.description || "No description"}
              </p>
              <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
                <span className="flex items-center gap-1.5">
                  <Avatar user={d.manager} /> {userName(d.manager)}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" /> {d.memberCount ?? 0}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New Department" size="md">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Engineering"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              placeholder="Optional"
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Manager</label>
            <Select
              value={form.managerId}
              onChange={(e) => setForm({ ...form, managerId: e.target.value })}
              className="w-full h-10 px-3 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
            >
              <option value="">Select manager…</option>
              {members.map((m) => (
                <option key={m.userId} value={m.userId}>
                  {userName(m.user)}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={createDept.isPending}>
              Create
            </Button>
          </div>
        </form>
      </Modal>

      {/* Detail modal */}
      <Modal open={!!detailId} onClose={() => setDetailId(null)} title="Department" size="lg">
        {detailId && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="h-9 w-9 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400">
                  <Building2 className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                    {departments.find((d) => d.id === detailId)?.name}
                  </h3>
                  <p className="text-xs text-gray-400">
                    Manager: {userName(departments.find((d) => d.id === detailId)?.manager)}
                  </p>
                </div>
              </div>
              {isAdmin && (
                <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(detailId)}>
                  <Trash2 className="h-4 w-4 mr-1" /> Delete
                </Button>
              )}
            </div>

            <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-400" /> Members ({deptMembers?.members?.length || 0})
              </h4>

              {isAdmin && (
                <div className="flex gap-2 mb-4">
                  <Select
                    value={addUserId}
                    onChange={(e) => setAddUserId(e.target.value)}
                    className="flex-1 h-9 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
                  >
                    <option value="">Add member…</option>
                    {members.map((m) => (
                      <option key={m.userId} value={m.userId}>
                        {userName(m.user)}
                      </option>
                    ))}
                  </Select>
                  <Select
                    value={addRole}
                    onChange={(e) => setAddRole(e.target.value as "MANAGER" | "LEAD" | "MEMBER")}
                    className="h-9 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
                  >
                    <option value="MEMBER">Member</option>
                    <option value="LEAD">Lead</option>
                    <option value="MANAGER">Manager</option>
                  </Select>
                  <Button size="sm" onClick={handleAddMember} disabled={!addUserId}>
                    <UserPlus className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {membersLoading ? (
                <PageLoader />
              ) : (
                <ul className="space-y-2 max-h-60 overflow-y-auto">
                  {(deptMembers?.members ?? []).map((m) => (
                    <li
                      key={m.userId}
                      className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 rounded-lg px-3 py-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Avatar user={m.user} />
                        <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                          {userName(m.user)}
                        </span>
                        <span className="text-[10px] uppercase bg-gray-200 dark:bg-gray-700 text-gray-500 rounded px-1.5 py-0.5">
                          {m.role}
                        </span>
                      </div>
                      {isAdmin && (
                        <button
                          onClick={() => removeMember.mutate(m.userId)}
                          className="text-gray-400 hover:text-red-500"
                          aria-label="Remove member"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </li>
                  ))}
                  {(deptMembers?.members?.length ?? 0) === 0 && (
                    <p className="text-sm text-gray-400 text-center py-4">No members</p>
                  )}
                </ul>
              )}
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Department"
        description="This will permanently delete the department and its member links. This cannot be undone."
        confirmLabel="Delete"
        isLoading={deleteDept.isPending}
      />
    </div>
  );
}
