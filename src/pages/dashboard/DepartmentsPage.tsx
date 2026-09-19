import { useMemo, useState } from "react";
import {
  Building2,
  Plus,
  Trash2,
  Users,
  UserPlus,
  X,
  Search,
  Shield,
  Layers,
  ChevronRight,
} from "lucide-react";
import Modal from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { GlassButton } from "@/components/glass/GlassButton";
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

function Avatar({ user, size = "sm" }: { user?: User | null; size?: "sm" | "md" | "lg" }) {
  const initials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() ||
      user.email?.[0]?.toUpperCase() ||
      "?"
    : "?";
  const dim =
    size === "lg"
      ? "h-11 w-11 text-sm ring-2 ring-accent-cyan/30"
      : size === "md"
      ? "h-9 w-9 text-xs"
      : "h-7 w-7 text-[11px]";
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full bg-gradient-to-br from-accent-cyan/20 to-accent-blue/30 text-accent-cyan font-bold flex-shrink-0 border border-accent-cyan/30 shadow-sm ${dim}`}
    >
      {initials}
    </span>
  );
}

function userName(u?: User | null) {
  if (!u) return "Unassigned";
  return u.firstName ? `${u.firstName} ${u.lastName || ""}`.trim() : u.email;
}

export default function DepartmentsPage() {
  const currentTenant = useTenantStore((s) => s.currentTenant);
  const { role } = usePermissionStore();
  const isAdmin = role === "ADMIN" || role === "OWNER";

  const { data, isLoading } = useDepartments({ limit: 50 });
  const { data: membersData } = useMembers(currentTenant?.id, { limit: 100 });
  const members = useMemo(() => membersData?.members ?? [], [membersData]);

  const [search, setSearch] = useState("");
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
  const filteredDepartments = useMemo(() => {
    if (!search.trim()) return departments;
    const q = search.toLowerCase();
    return departments.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        (d.description && d.description.toLowerCase().includes(q)) ||
        userName(d.manager).toLowerCase().includes(q)
    );
  }, [departments, search]);

  const totalMembersCount = useMemo(() => {
    return departments.reduce((acc, d) => acc + (d.memberCount ?? 0), 0);
  }, [departments]);

  const activeDepartment = useMemo(
    () => departments.find((d) => d.id === detailId),
    [departments, detailId]
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Department name is required");
    if (!form.managerId) return toast.error("Please assign a department manager");
    createDept.mutate(
      { name: form.name.trim(), description: form.description.trim() || undefined, managerId: form.managerId },
      {
        onSuccess: () => {
          setCreateOpen(false);
          setForm({ name: "", description: "", managerId: "" });
          toast.success("Department created successfully");
        },
      }
    );
  };

  const handleAddMember = () => {
    if (!addUserId) return toast.error("Select a team member to assign");
    addMember.mutate(
      { userId: addUserId, role: addRole },
      {
        onSuccess: () => {
          setAddUserId("");
          toast.success("Member added to department");
        },
      }
    );
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteDept.mutate(deleteTarget, {
      onSuccess: () => {
        setDeleteTarget(null);
        setDetailId(null);
        toast.success("Department removed");
      },
    });
  };

  return (
    <div className="space-y-8 pb-12">
      {/* ── Page Header ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent-cyan">
            <Layers className="h-3.5 w-3.5" /> Organizational Units
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white mt-1">
            Departments & Divisions
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Segment permissions, resources, and teams across isolated functional divisions.
          </p>
        </div>

        {isAdmin && (
          <GlassButton
            variant="primary"
            onClick={() => setCreateOpen(true)}
            leadingIcon={<Plus className="h-4 w-4" />}
            className="self-start sm:self-auto font-semibold shadow-lg shadow-accent-cyan/20"
          >
            New Department
          </GlassButton>
        )}
      </div>

      {/* ── Metrics Cards ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white dark:bg-[#0c1220] border border-neutral-200/90 dark:border-white/10 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Active Divisions
            </span>
            <div className="p-2 rounded-xl bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white mt-3 font-display">
            {departments.length}
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Multi-tenant organizational structures
          </p>
        </div>

        <div className="rounded-2xl bg-white dark:bg-[#0c1220] border border-neutral-200/90 dark:border-white/10 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Allocated Members
            </span>
            <div className="p-2 rounded-xl bg-accent-blue/10 text-accent-blue border border-accent-blue/20">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white mt-3 font-display">
            {totalMembersCount}
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Across {departments.length} departments
          </p>
        </div>

        <div className="rounded-2xl bg-white dark:bg-[#0c1220] border border-neutral-200/90 dark:border-white/10 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Security Governance
            </span>
            <div className="p-2 rounded-xl bg-accent-indigo/10 text-accent-indigo border border-accent-indigo/20">
              <Shield className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-500 dark:text-emerald-400 mt-3 font-display">
            Enforced
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            RBAC tenant scoping enabled
          </p>
        </div>
      </div>

      {/* ── Filter Bar ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search departments or managers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#0c1220] text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-accent-cyan/50 transition-all"
          />
        </div>
        <div className="text-xs text-neutral-500 dark:text-neutral-400 self-end sm:self-auto">
          Showing {filteredDepartments.length} of {departments.length} divisions
        </div>
      </div>

      {/* ── Content Grid ────────────────────────────────────────── */}
      {isLoading ? (
        <div className="py-20">
          <PageLoader />
        </div>
      ) : filteredDepartments.length === 0 ? (
        <div className="rounded-2xl bg-white dark:bg-[#0c1220] border border-neutral-200/90 dark:border-white/10 p-12 text-center shadow-sm">
          <div className="h-14 w-14 rounded-2xl bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center text-accent-cyan mx-auto mb-4">
            <Building2 className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
            {search ? "No matching departments found" : "No departments configured"}
          </h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 max-w-md mx-auto">
            {search
              ? "Try adjusting your search terms or filters."
              : "Departments allow you to organize projects, restrict sprint access, and assign leadership roles."}
          </p>
          {isAdmin && !search && (
            <GlassButton
              variant="primary"
              onClick={() => setCreateOpen(true)}
              leadingIcon={<Plus className="h-4 w-4" />}
              className="mt-5 font-semibold"
            >
              Create Department
            </GlassButton>
          )}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredDepartments.map((d) => (
            <div
              key={d.id}
              onClick={() => setDetailId(d.id)}
              className="group relative rounded-2xl bg-white dark:bg-[#0c1220] border border-neutral-200/90 dark:border-white/10 p-6 hover:border-accent-cyan/50 dark:hover:border-accent-cyan/50 transition-all duration-300 shadow-sm hover:shadow-[0_15px_35px_-10px_rgba(6,182,212,0.15)] cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center text-accent-cyan flex-shrink-0 group-hover:scale-105 transition-transform">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-neutral-900 dark:text-white group-hover:text-accent-cyan transition-colors">
                        {d.name}
                      </h3>
                      <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
                        Division
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-neutral-400 group-hover:text-accent-cyan group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1" />
                </div>

                <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 min-h-[2.5rem] leading-relaxed">
                  {d.description || "No description provided for this department."}
                </p>
              </div>

              <div className="pt-5 mt-5 border-t border-neutral-100 dark:border-white/[0.08] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Avatar user={d.manager} size="sm" />
                  <div className="truncate max-w-[130px]">
                    <div className="text-[10px] uppercase font-bold text-neutral-400">Lead</div>
                    <div className="font-semibold text-neutral-900 dark:text-white truncate">
                      {userName(d.manager)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-white/[0.05] border border-neutral-200 dark:border-white/10 text-neutral-600 dark:text-neutral-300 font-medium">
                  <Users className="h-3.5 w-3.5 text-accent-cyan" />
                  <span>{d.memberCount ?? 0} members</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Create Department Modal ─────────────────────────────── */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New Department" size="lg">
        <form onSubmit={handleCreate} className="space-y-5 pt-1">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
              Department Name *
            </label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Platform Engineering & Reliability"
              autoFocus
              className="bg-neutral-50 dark:bg-[#080d1a] border-neutral-200 dark:border-white/10"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
              Mission & Scope (Optional)
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              placeholder="Describe department responsibilities, scope, and objectives…"
              className="w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-[#080d1a] text-neutral-900 dark:text-white px-3.5 py-2.5 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-accent-cyan/50 resize-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
              Department Manager *
            </label>
            <select
              value={form.managerId}
              onChange={(e) => setForm({ ...form, managerId: e.target.value })}
              className="w-full h-11 px-3 rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-[#080d1a] text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent-cyan/50 transition-all"
            >
              <option value="">Select a team manager…</option>
              {members.map((m) => (
                <option key={m.userId} value={m.userId}>
                  {userName(m.user)} ({m.user?.email || "No email"})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100 dark:border-white/[0.08]">
            <GlassButton
              type="button"
              variant="ghost"
              onClick={() => setCreateOpen(false)}
            >
              Cancel
            </GlassButton>
            <GlassButton
              type="submit"
              variant="primary"
              isLoading={createDept.isPending}
              className="font-bold shadow-lg shadow-accent-cyan/25"
            >
              Create Department
            </GlassButton>
          </div>
        </form>
      </Modal>

      {/* ── Department Inspection & Member Modal ────────────────── */}
      <Modal
        open={!!detailId}
        onClose={() => setDetailId(null)}
        title={activeDepartment?.name || "Department Details"}
        size="xl"
      >
        {activeDepartment && (
          <div className="space-y-6">
            {/* Header info strip */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-neutral-50 dark:bg-[#080d1a] border border-neutral-200/80 dark:border-white/10">
              <div className="flex items-center gap-3">
                <Avatar user={activeDepartment.manager} size="lg" />
                <div>
                  <div className="text-xs uppercase font-bold text-accent-cyan tracking-wider">
                    Assigned Manager
                  </div>
                  <h4 className="text-base font-bold text-neutral-900 dark:text-white">
                    {userName(activeDepartment.manager)}
                  </h4>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {activeDepartment.manager?.email || "No email"}
                  </p>
                </div>
              </div>

              {isAdmin && (
                <GlassButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleteTarget(activeDepartment.id)}
                  className="text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 self-start sm:self-auto"
                  leadingIcon={<Trash2 className="h-4 w-4" />}
                >
                  Delete Department
                </GlassButton>
              )}
            </div>

            {activeDepartment.description && (
              <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                {activeDepartment.description}
              </p>
            )}

            {/* Member roster */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-white flex items-center gap-2">
                  <Users className="h-4 w-4 text-accent-cyan" /> Department Roster ({deptMembers?.members?.length || 0})
                </h4>
              </div>

              {/* Add member controls */}
              {isAdmin && (
                <div className="flex flex-col sm:flex-row gap-2.5 p-3 rounded-2xl bg-neutral-50 dark:bg-[#080d1a] border border-neutral-200/80 dark:border-white/10 mb-4">
                  <select
                    value={addUserId}
                    onChange={(e) => setAddUserId(e.target.value)}
                    className="flex-1 h-10 px-3 rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#0c1220] text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-cyan/50"
                  >
                    <option value="">Select team member to assign…</option>
                    {members
                      .filter(
                        (m) => !(deptMembers?.members ?? []).some((dm) => dm.userId === m.userId)
                      )
                      .map((m) => (
                        <option key={m.userId} value={m.userId}>
                          {userName(m.user)} ({m.user?.email || "No email"})
                        </option>
                      ))}
                  </select>

                  <select
                    value={addRole}
                    onChange={(e) => setAddRole(e.target.value as "MANAGER" | "LEAD" | "MEMBER")}
                    className="h-10 px-3 rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#0c1220] text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-cyan/50 sm:w-36"
                  >
                    <option value="MEMBER">Member</option>
                    <option value="LEAD">Lead</option>
                    <option value="MANAGER">Manager</option>
                  </select>

                  <GlassButton
                    variant="primary"
                    size="sm"
                    onClick={handleAddMember}
                    disabled={!addUserId || addMember.isPending}
                    leadingIcon={<UserPlus className="h-4 w-4" />}
                    className="font-semibold"
                  >
                    Assign
                  </GlassButton>
                </div>
              )}

              {/* Member list */}
              {membersLoading ? (
                <div className="py-8">
                  <PageLoader />
                </div>
              ) : (deptMembers?.members ?? []).length === 0 ? (
                <div className="p-8 text-center rounded-2xl border border-dashed border-neutral-200 dark:border-white/10">
                  <Users className="h-8 w-8 mx-auto text-neutral-400 mb-2 opacity-50" />
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    No contributors assigned to this department yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {(deptMembers?.members ?? []).map((m) => (
                    <div
                      key={m.userId}
                      className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-[#080d1a] border border-neutral-200/70 dark:border-white/5 hover:border-accent-cyan/30 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar user={m.user} size="md" />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-neutral-900 dark:text-white truncate">
                            {userName(m.user)}
                          </p>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                            {m.user?.email || "No email recorded"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                            m.role === "MANAGER"
                              ? "bg-accent-cyan/15 text-accent-cyan border-accent-cyan/30"
                              : m.role === "LEAD"
                              ? "bg-accent-purple/15 text-accent-purple border-accent-purple/30"
                              : "bg-neutral-200/60 dark:bg-white/10 text-neutral-600 dark:text-neutral-300 border-transparent"
                          }`}
                        >
                          {m.role}
                        </span>

                        {isAdmin && (
                          <button
                            onClick={() => removeMember.mutate(m.userId)}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                            title="Remove from department"
                            aria-label="Remove member"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* ── Confirmation Dialog ─────────────────────────────────── */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Department"
        description="Are you sure you want to permanently delete this department? All department member associations and task tags will be cleanly unlinked. This action cannot be reversed."
        confirmLabel="Delete Department"
        isLoading={deleteDept.isPending}
      />
    </div>
  );
}
