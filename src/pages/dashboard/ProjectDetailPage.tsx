import { useState, useMemo } from "react";
import { Select } from "@/components/ui/Select";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  AlignLeft,
  Edit,
  Trash2,
  UserPlus,
  Circle,
  CheckCircle2,
  Clock,
  Search,
  Percent,
  type LucideIcon,
} from "lucide-react";
import {
  useProject,
  useProjectDashboard,
  useUpdateProject,
  useDeleteProject,
  useAddMember,
  useUpdateMemberRole,
  useRemoveMember,
} from "@/features/projects/projectsQueries";
import { useTasks } from "@/features/tasks/tasksQueries";
import { useMembers } from "@/features/tenant/tenantQueries";
import { useTenantStore } from "@/features/tenant/tenantStore";
import { useDebounce } from "@/hooks/useDebounce";
import { Button } from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import PageLoader from "@/components/ui/PageLoader";
import Badge, { type BadgeVariant } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import type { ProjectMember, Task } from "@/types/domain";

const PROJECT_ROLE_VARIANTS: Record<string, BadgeVariant> = {
  OWNER: "admin",
  MAINTAINER: "manager",
  MEMBER: "user",
};

interface TaskStatusColumn {
  key: string;
  label: string;
  icon: LucideIcon;
  color: string;
  bg: string;
  iconColor: string;
}

const TASK_STATUSES: TaskStatusColumn[] = [
  { key: "TODO", label: "To Do", icon: Circle, color: "text-gray-400 border-gray-100 dark:border-gray-800", bg: "bg-gray-50 dark:bg-gray-800/50", iconColor: "text-gray-400" },
  { key: "IN_PROGRESS", label: "In Progress", icon: Clock, color: "text-blue-500 border-blue-100 dark:border-blue-900/30", bg: "bg-blue-50 dark:bg-blue-900/10", iconColor: "text-blue-500" },
  { key: "DONE", label: "Done", icon: CheckCircle2, color: "text-green-500 border-green-100 dark:border-green-900/30", bg: "bg-green-50 dark:bg-green-900/10", iconColor: "text-green-500" },
];

const PRIORITY_BADGE: Record<string, string> = {
  HIGH: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300",
  MEDIUM: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300",
  LOW: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300",
};

function formatDueDate(d?: string | null): string {
  if (!d) return "";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

interface ProjectStats {
  totalTasks?: number;
  memberCount?: number;
  taskStats?: Record<string, number>;
}

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentTenant = useTenantStore((s) => s.currentTenant);

  const { data: project, isLoading: projectLoading } = useProject(id);
  const { data: dashboard, isLoading: dashboardLoading } = useProjectDashboard(id);
  const { data: tenantMembersData } = useMembers(currentTenant?.id, { limit: 100 });
  const updateProject = useUpdateProject(id);
  const deleteProject = useDeleteProject();
  const addMember = useAddMember(id);
  const updateRole = useUpdateMemberRole(id);
  const removeMember = useRemoveMember(id);
  const { data: projectTasksData } = useTasks(id);
  const tasksByStatus = useMemo(() => {
    const map: Record<string, Task[]> = { TODO: [], IN_PROGRESS: [], DONE: [] };
    const list = projectTasksData?.tasks ?? [];
    for (const t of list) {
      const s = t.status && map[t.status] ? t.status : "TODO";
      map[s].push(t);
    }
    return map;
  }, [projectTasksData]);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", description: "" });
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [addMemberModal, setAddMemberModal] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");
  const debouncedMemberSearch = useDebounce(memberSearch, 200);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [memberRole, setMemberRole] = useState("MEMBER");
  const [confirmRemove, setConfirmRemove] = useState<ProjectMember | null>(null);

  const tenantMembers = useMemo(() => tenantMembersData?.members ?? [], [tenantMembersData]);

  const filteredMembers = useMemo(() => {
    if (!debouncedMemberSearch) return tenantMembers;
    const q = debouncedMemberSearch.toLowerCase();
    return tenantMembers.filter(
      (m) =>
        m.user?.firstName?.toLowerCase().includes(q) ||
        m.user?.lastName?.toLowerCase().includes(q) ||
        m.user?.email?.toLowerCase().includes(q)
    );
  }, [tenantMembers, debouncedMemberSearch]);

  const alreadyMembers = useMemo(() => {
    return new Set(project?.members?.map((m) => m.userId) ?? []);
  }, [project?.members]);

  const availableMembers = useMemo(
    () => filteredMembers.filter((m) => !alreadyMembers.has(m.userId)),
    [filteredMembers, alreadyMembers]
  );

  if (projectLoading || dashboardLoading) return <PageLoader />;
  if (!project) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p className="text-lg mb-2">Project not found</p>
        <Button variant="outline" onClick={() => navigate("/dashboard/projects")}>
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Projects
        </Button>
      </div>
    );
  }

  const p = project;
  const d = dashboard ?? {};
  const stats = (d.stats ?? {}) as ProjectStats;
  const userRole = (p.userRole as string | undefined) ?? (d.userRole as string | undefined);
  const isOwner = userRole === "OWNER";
  const canManage = isOwner || userRole === "MAINTAINER";

  const totalTasks = stats.totalTasks ?? 0;
  const completedTasks = stats.taskStats?.DONE ?? 0;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const openEditModal = () => {
    setEditForm({ name: p.name, description: p.description || "" });
    setEditModalOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProject.mutate(
      { name: editForm.name.trim(), description: editForm.description.trim() || undefined },
      { onSuccess: () => setEditModalOpen(false) }
    );
  };

  const handleDelete = () => {
    if (id) deleteProject.mutate(id, { onSuccess: () => navigate("/dashboard/projects") });
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;
    addMember.mutate(
      { userId: selectedUserId, role: memberRole },
      {
        onSuccess: () => {
          setAddMemberModal(false);
          setMemberSearch("");
          setSelectedUserId("");
          setMemberRole("MEMBER");
        },
      }
    );
  };

  const handleRoleChange = (userId: string, role: string) => {
    updateRole.mutate({ userId, role });
  };

  const openAddMember = () => {
    setMemberSearch("");
    setSelectedUserId("");
    setMemberRole("MEMBER");
    setAddMemberModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => navigate("/dashboard/projects")}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white truncate">{p.name}</h1>
            {p.description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{p.description}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {canManage && (
            <Button variant="outline" size="sm" onClick={openEditModal}>
              <Edit className="h-4 w-4 mr-1.5" /> Edit
            </Button>
          )}
          {isOwner && (
            <Button
              variant="outline"
              size="sm"
              className="text-red-500 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
              onClick={() => setDeleteConfirm(true)}
            >
              <Trash2 className="h-4 w-4 mr-1.5" /> Delete
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4">
          <div className="flex items-center gap-2 text-gray-400 mb-1">
            <Users className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Members</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.memberCount ?? p.members?.length ?? 0}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4">
          <div className="flex items-center gap-2 text-gray-400 mb-1">
            <AlignLeft className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Total Tasks</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalTasks}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4">
          <div className="flex items-center gap-2 text-blue-400 mb-1">
            <Clock className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wider">In Progress</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.taskStats?.IN_PROGRESS ?? 0}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4">
          <div className="flex items-center gap-2 text-green-400 mb-1">
            <Percent className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Completion</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{completionRate}%</p>
          {totalTasks > 0 && (
            <div className="mt-2 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all duration-500"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Members */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-400" />
            Team Members ({stats.memberCount ?? p.members?.length ?? 0})
          </h2>
          {canManage && (
            <Button size="sm" variant="outline" onClick={openAddMember}>
              <UserPlus className="h-4 w-4 mr-1" /> Add Member
            </Button>
          )}
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {p.members?.length === 0 ? (
            <div className="px-6 py-8 text-center text-sm text-gray-400">No members yet</div>
          ) : (
            p.members?.map((member) => (
              <div key={member.userId} className="flex items-center justify-between px-6 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-xs font-medium text-primary-700 dark:text-primary-400 shrink-0">
                    {member.user?.firstName?.[0] || member.user?.email?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {member.user?.firstName
                        ? `${member.user.firstName} ${member.user.lastName || ""}`
                        : member.user?.email || "Unknown"}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{member.user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {canManage && member.role !== "OWNER" ? (
                    <Select
                      value={member.role}
                      onChange={(e) => handleRoleChange(member.userId, e.target.value)}
                      className="h-8 px-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
                    >
                      <option value="MEMBER">Member</option>
                      <option value="MAINTAINER">Maintainer</option>
                    </Select>
                  ) : (
                    <Badge
                      label={
                        member.role === "OWNER"
                          ? "Owner"
                          : member.role === "MAINTAINER"
                            ? "Maintainer"
                            : "Member"
                      }
                      variant={PROJECT_ROLE_VARIANTS[member.role]}
                    />
                  )}
                  {canManage && member.role !== "OWNER" && (
                    <button
                      onClick={() => setConfirmRemove(member)}
                      className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Kanban-Ready Task Columns */}
      <div>
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <AlignLeft className="h-4 w-4 text-gray-400" />
          Tasks
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {TASK_STATUSES.map(({ key, label, icon: Icon, color, bg, iconColor }) => {
            const items = tasksByStatus[key] ?? [];
            return (
              <div key={key} className={`rounded-xl border ${color} ${bg}`}>
                <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                  <Icon className={`h-4 w-4 ${iconColor}`} />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
                  <span className="ml-auto text-xs font-semibold text-gray-400 bg-white dark:bg-gray-800 px-2 py-0.5 rounded-full">
                    {items.length}
                  </span>
                </div>
                <div className="p-3 min-h-[120px] space-y-2">
                  {items.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-8">No tasks</p>
                  ) : (
                    items.map((task) => (
                      <div
                        key={task.id}
                        className="bg-white dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800 p-3 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                      >
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          {task.priority && (
                            <span
                              className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full ${
                                PRIORITY_BADGE[task.priority] ?? ""
                              }`}
                            >
                              {task.priority}
                            </span>
                          )}
                          {task.dueDate && (
                            <span className="text-[10px] text-gray-400">{formatDueDate(task.dueDate)}</span>
                          )}
                          {task.assignees && task.assignees.length > 0 && (
                            <div className="flex -space-x-1.5 ml-auto">
                              {task.assignees.slice(0, 3).map((a) => {
                                const first = a.user?.firstName?.[0] ?? "";
                                const last = a.user?.lastName?.[0] ?? "";
                                const initials = (first + last) || a.user?.email?.[0] || "?";
                                return (
                                  <span
                                    key={a.userId}
                                    title={a.user?.email ?? ""}
                                    className="h-5 w-5 rounded-full bg-gray-200 dark:bg-gray-700 text-[9px] font-semibold text-gray-600 dark:text-gray-200 flex items-center justify-center ring-1 ring-white dark:ring-gray-900"
                                  >
                                    {initials.toUpperCase()}
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Project Modal */}
      <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Project">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Project Name
            </label>
            <Input
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              rows={3}
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none transition-colors"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={updateProject.isPending}>
              Save
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Member Modal */}
      <Modal open={addMemberModal} onClose={() => setAddMemberModal(false)} title="Add Team Member" size="lg">
        <form onSubmit={handleAddMember} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Search Member
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                placeholder="Search by name or email..."
                autoFocus
                className="w-full pl-9 pr-3 h-10 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
              />
            </div>
          </div>

          {availableMembers.length > 0 && (
            <div className="max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg divide-y divide-gray-100 dark:divide-gray-800">
              {availableMembers.map((m) => (
                <button
                  key={m.userId}
                  type="button"
                  onClick={() => setSelectedUserId(m.userId)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
                    selectedUserId === m.userId ? "bg-primary-50 dark:bg-primary-900/20" : ""
                  }`}
                >
                  <div
                    className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-medium shrink-0 ${
                      selectedUserId === m.userId
                        ? "bg-primary-200 dark:bg-primary-800 text-primary-700 dark:text-primary-300"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    {m.user?.firstName?.[0] || m.user?.email?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {m.user?.firstName
                        ? `${m.user.firstName} ${m.user.lastName || ""}`
                        : m.user?.email || "Unknown"}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{m.user?.email}</p>
                  </div>
                  {selectedUserId === m.userId && (
                    <CheckCircle2 className="h-4 w-4 text-primary-600 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}

          {availableMembers.length === 0 && memberSearch && (
            <p className="text-sm text-gray-400 text-center py-2">
              No matching members found in the organization.
            </p>
          )}

          {!tenantMembers.length && (
            <p className="text-sm text-gray-400 text-center py-2">Loading members...</p>
          )}

          {selectedUserId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Role
              </label>
              <Select
                value={memberRole}
                onChange={(e) => setMemberRole(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
              >
                <option value="MEMBER">Member</option>
                <option value="MAINTAINER">Maintainer</option>
              </Select>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setAddMemberModal(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!selectedUserId} isLoading={addMember.isPending}>
              <UserPlus className="h-4 w-4 mr-1.5" /> Add Member
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteConfirm}
        onClose={() => setDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Project"
        description={`Are you sure you want to delete "${p.name}"? This action cannot be undone.`}
        confirmLabel="Delete Project"
        isLoading={deleteProject.isPending}
      />

      {/* Remove Member Confirmation */}
      <ConfirmDialog
        open={!!confirmRemove}
        onClose={() => setConfirmRemove(null)}
        onConfirm={() => {
          if (confirmRemove) removeMember.mutate(confirmRemove.userId);
          setConfirmRemove(null);
        }}
        title="Remove Member"
        description={`Remove ${confirmRemove?.user?.firstName || confirmRemove?.user?.email || "this member"} from the project?`}
        confirmLabel="Remove"
        isLoading={removeMember.isPending}
      />
    </div>
  );
}
