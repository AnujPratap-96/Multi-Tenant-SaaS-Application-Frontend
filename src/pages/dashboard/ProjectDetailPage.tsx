import { useState, useMemo } from "react";
import { Select } from "@/components/ui/Select";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  CheckCircle2,
  Clock,
  Search,
  Percent,
  Plus,
  Edit,
  Trash2,
  UserPlus,
  Circle,
  FolderKanban,
  Calendar,
  Layers,
  ChevronRight,
  Shield,
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
import Modal from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import PageLoader from "@/components/ui/PageLoader";
import Badge, { type BadgeVariant } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { GlassCard } from "@/components/glass/GlassCard";
import { GlassButton } from "@/components/glass/GlassButton";
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
  {
    key: "TODO",
    label: "To Do",
    icon: Circle,
    color: "border-neutral-200/60 dark:border-white/10",
    bg: "bg-neutral-50/50 dark:bg-neutral-900/30",
    iconColor: "text-neutral-400",
  },
  {
    key: "IN_PROGRESS",
    label: "In Progress",
    icon: Clock,
    color: "border-brand-500/20 dark:border-brand-500/20",
    bg: "bg-brand-50/30 dark:bg-brand-950/20",
    iconColor: "text-brand-500",
  },
  {
    key: "DONE",
    label: "Completed",
    icon: CheckCircle2,
    color: "border-emerald-500/20 dark:border-emerald-500/20",
    bg: "bg-emerald-50/30 dark:bg-emerald-950/20",
    iconColor: "text-emerald-500",
  },
];

const PRIORITY_BADGE: Record<string, { bg: string; text: string; dot: string }> = {
  HIGH: {
    bg: "bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20",
    text: "High",
    dot: "bg-rose-500",
  },
  MEDIUM: {
    bg: "bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20",
    text: "Medium",
    dot: "bg-amber-500",
  },
  LOW: {
    bg: "bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
    text: "Low",
    dot: "bg-emerald-500",
  },
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

  const [activeTab, setActiveTab] = useState<"board" | "members" | "analytics">("board");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", description: "" });
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [addMemberModal, setAddMemberModal] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");
  const debouncedMemberSearch = useDebounce(memberSearch, 200);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [memberRole, setMemberRole] = useState("MEMBER");
  const [confirmRemove, setConfirmRemove] = useState<ProjectMember | null>(null);

  const tasksByStatus = useMemo(() => {
    const map: Record<string, Task[]> = { TODO: [], IN_PROGRESS: [], DONE: [] };
    const list = projectTasksData?.tasks ?? [];
    for (const t of list) {
      const s = t.status && map[t.status] ? t.status : "TODO";
      map[s].push(t);
    }
    return map;
  }, [projectTasksData]);

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
      <div className="text-center py-20">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 flex items-center justify-center">
          <FolderKanban className="w-8 h-8 text-neutral-400" />
        </div>
        <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">Project workspace not found</h3>
        <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-6 max-w-sm mx-auto">
          The requested project could not be found or you do not have permission to view it.
        </p>
        <GlassButton variant="primary" onClick={() => navigate("/dashboard/projects")}>
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Workspaces
        </GlassButton>
      </div>
    );
  }

  const p = project;
  const d = dashboard ?? {};
  const stats = (d.stats ?? {}) as ProjectStats;
  const userRole = (p.userRole as string | undefined) ?? (d.userRole as string | undefined);
  const isOwner = userRole === "OWNER";
  const canManage = isOwner || userRole === "MAINTAINER";

  const totalTasks = stats.totalTasks ?? (projectTasksData?.tasks?.length ?? 0);
  const inProgressTasks = stats.taskStats?.IN_PROGRESS ?? tasksByStatus.IN_PROGRESS.length;
  const completedTasks = stats.taskStats?.DONE ?? tasksByStatus.DONE.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const memberCount = stats.memberCount ?? p.members?.length ?? 0;

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
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Breadcrumbs & Navigation Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-neutral-500 dark:text-neutral-400 uppercase mb-2">
            <Link
              to="/dashboard/projects"
              className="hover:text-brand-500 dark:hover:text-brand-400 transition-colors flex items-center gap-1"
            >
              Workspaces
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-neutral-900 dark:text-white truncate max-w-[200px]">{p.name}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/dashboard/projects")}
              className="p-2 rounded-xl bg-neutral-100 dark:bg-white/5 hover:bg-neutral-200 dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-300 transition-colors shrink-0"
              title="Back to all projects"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight truncate">
                {p.name}
              </h1>
              {p.description && (
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-1 max-w-2xl">
                  {p.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Workspace Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <GlassButton
            variant="outline"
            size="sm"
            onClick={() => navigate(`/dashboard/tasks?projectId=${p.id}`)}
            className="font-medium"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5 text-brand-500" />
            New Task
          </GlassButton>

          {canManage && (
            <GlassButton variant="outline" size="sm" onClick={openAddMember} className="font-medium">
              <UserPlus className="h-3.5 w-3.5 mr-1.5 text-indigo-500" />
              Invite Member
            </GlassButton>
          )}

          {canManage && (
            <GlassButton variant="ghost" size="sm" onClick={openEditModal} className="font-medium">
              <Edit className="h-3.5 w-3.5 mr-1.5" />
              Settings
            </GlassButton>
          )}

          {isOwner && (
            <GlassButton
              variant="danger"
              size="sm"
              onClick={() => setDeleteConfirm(true)}
              className="font-medium opacity-80 hover:opacity-100"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              Delete
            </GlassButton>
          )}
        </div>
      </div>

      {/* Modern Bento KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard className="p-5 flex flex-col justify-between hover:border-brand-500/30 transition-all group">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Team Roster</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight">{memberCount}</p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Active team collaborators
            </p>
          </div>
        </GlassCard>

        <GlassCard className="p-5 flex flex-col justify-between hover:border-brand-500/30 transition-all group">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Total Tasks</span>
            <div className="w-8 h-8 rounded-xl bg-brand-500/10 dark:bg-brand-500/20 text-brand-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight">{totalTasks}</p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Across all sprint cycles</p>
          </div>
        </GlassCard>

        <GlassCard className="p-5 flex flex-col justify-between hover:border-amber-500/30 transition-all group">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">In Flight</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight">{inProgressTasks}</p>
              {inProgressTasks > 0 && (
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Currently active tasks</p>
          </div>
        </GlassCard>

        <GlassCard className="p-5 flex flex-col justify-between hover:border-emerald-500/30 transition-all group">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Velocity</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Percent className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline justify-between mb-1.5">
              <p className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight">{completionRate}%</p>
              <span className="text-xs font-semibold text-emerald-500 dark:text-emerald-400">
                {completedTasks}/{totalTasks} Done
              </span>
            </div>
            <div className="h-2 w-full bg-neutral-100 dark:bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Interactive Tabs Header */}
      <div className="flex items-center gap-2 border-b border-neutral-200/80 dark:border-white/10 pb-3">
        <button
          onClick={() => setActiveTab("board")}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === "board"
              ? "bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 shadow-sm"
              : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/5"
          }`}
        >
          <FolderKanban className="w-4 h-4" />
          Sprint Board
          <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-neutral-200/60 dark:bg-white/10">
            {totalTasks}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("members")}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === "members"
              ? "bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 shadow-sm"
              : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/5"
          }`}
        >
          <Users className="w-4 h-4" />
          Team Roster
          <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-neutral-200/60 dark:bg-white/10">
            {memberCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("analytics")}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === "analytics"
              ? "bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 shadow-sm"
              : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/5"
          }`}
        >
          <Percent className="w-4 h-4" />
          Workspace Insights
        </button>
      </div>

      {/* Tab 1: Sprint Board Columns */}
      {activeTab === "board" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TASK_STATUSES.map(({ key, label, icon: Icon, color, bg, iconColor }) => {
              const items = tasksByStatus[key] ?? [];
              return (
                <div
                  key={key}
                  className={`rounded-2xl border ${color} ${bg} backdrop-blur-md p-4 flex flex-col min-h-[380px] shadow-sm`}
                >
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-200/40 dark:border-white/5">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${iconColor}`} />
                      <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">{label}</h3>
                    </div>
                    <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 bg-white/80 dark:bg-white/10 px-2.5 py-0.5 rounded-full shadow-xs">
                      {items.length}
                    </span>
                  </div>

                  <div className="space-y-3 flex-1 overflow-y-auto">
                    {items.length === 0 ? (
                      <div className="h-44 flex flex-col items-center justify-center text-center p-4 border border-dashed border-neutral-200/60 dark:border-white/10 rounded-xl">
                        <Icon className="w-6 h-6 text-neutral-300 dark:text-neutral-600 mb-2" />
                        <p className="text-xs text-neutral-400 dark:text-neutral-500 font-medium">
                          No {label.toLowerCase()} tasks
                        </p>
                      </div>
                    ) : (
                      items.map((task) => (
                        <div
                          key={task.id}
                          onClick={() => navigate(`/dashboard/tasks?projectId=${p.id}&taskId=${task.id}`)}
                          className="bg-white dark:bg-[#0e1626] rounded-xl p-3.5 border border-neutral-200/80 dark:border-white/10 shadow-sm hover:shadow-md hover:border-brand-500/40 transition-all cursor-pointer group"
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <p className="text-sm font-semibold text-neutral-900 dark:text-white group-hover:text-brand-500 dark:group-hover:text-brand-400 transition-colors line-clamp-2 leading-snug">
                              {task.title}
                            </p>
                            {task.priority && (
                              <span
                                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${
                                  PRIORITY_BADGE[task.priority]?.bg ?? "bg-neutral-100 text-neutral-600"
                                }`}
                              >
                                {task.priority}
                              </span>
                            )}
                          </div>

                          {task.description && (
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 mb-3">
                              {task.description}
                            </p>
                          )}

                          <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-white/5 text-xs text-neutral-400">
                            {task.dueDate ? (
                              <span className="flex items-center gap-1 font-medium text-[11px] text-neutral-500 dark:text-neutral-400">
                                <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                                {formatDueDate(task.dueDate)}
                              </span>
                            ) : (
                              <span />
                            )}

                            {task.assignees && task.assignees.length > 0 && (
                              <div className="flex -space-x-2 ml-auto">
                                {task.assignees.slice(0, 3).map((a) => {
                                  const first = a.user?.firstName?.[0] ?? "";
                                  const last = a.user?.lastName?.[0] ?? "";
                                  const initials = first + last || a.user?.email?.[0] || "?";
                                  return (
                                    <div
                                      key={a.userId}
                                      title={a.user?.email ?? ""}
                                      className="h-6 w-6 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 text-[10px] font-bold text-white flex items-center justify-center ring-2 ring-white dark:ring-neutral-900 shadow-xs"
                                    >
                                      {initials.toUpperCase()}
                                    </div>
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

          <div className="flex items-center justify-end">
            <GlassButton
              variant="outline"
              size="sm"
              onClick={() => navigate(`/dashboard/tasks?projectId=${p.id}`)}
              className="text-xs font-semibold"
            >
              Open Full Kanban Manager & Time Tracker <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </GlassButton>
          </div>
        </div>
      )}

      {/* Tab 2: Team Roster */}
      {activeTab === "members" && (
        <GlassCard className="overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border-b border-neutral-200/60 dark:border-white/10">
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <Users className="h-4 w-4 text-brand-500" />
                Workspace Collaborators ({memberCount})
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Manage roles and access permissions for this project workspace
              </p>
            </div>
            {canManage && (
              <GlassButton size="sm" variant="primary" onClick={openAddMember}>
                <UserPlus className="h-3.5 w-3.5 mr-1.5" /> Add Member
              </GlassButton>
            )}
          </div>

          <div className="divide-y divide-neutral-100 dark:divide-white/5">
            {p.members?.length === 0 ? (
              <div className="py-12 text-center text-sm text-neutral-400">
                <Users className="w-8 h-8 mx-auto text-neutral-300 dark:text-neutral-600 mb-2" />
                No members in this project yet
              </div>
            ) : (
              p.members?.map((member) => (
                <div
                  key={member.userId}
                  className="flex items-center justify-between px-6 py-4 hover:bg-neutral-50/50 dark:hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-brand-500 to-indigo-600 text-white flex items-center justify-center text-sm font-bold shadow-sm shrink-0">
                      {member.user?.firstName?.[0] || member.user?.email?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-neutral-900 dark:text-white truncate">
                        {member.user?.firstName
                          ? `${member.user.firstName} ${member.user.lastName || ""}`
                          : member.user?.email || "Unknown Member"}
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">{member.user?.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {canManage && member.role !== "OWNER" ? (
                      <Select
                        value={member.role}
                        onChange={(e) => handleRoleChange(member.userId, e.target.value)}
                        className="h-8 px-2.5 rounded-lg border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#0e1626] text-xs font-semibold text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                      >
                        <option value="MEMBER">Member</option>
                        <option value="MAINTAINER">Maintainer</option>
                      </Select>
                    ) : (
                      <Badge
                        label={
                          member.role === "OWNER"
                            ? "Workspace Owner"
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
                        className="p-1.5 rounded-lg hover:bg-rose-500/10 text-neutral-400 hover:text-rose-500 transition-colors"
                        title="Remove member"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>
      )}

      {/* Tab 3: Analytics & Health */}
      {activeTab === "analytics" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <GlassCard className="p-6">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
              <Percent className="w-4 h-4 text-brand-500" /> Sprint Completion Breakdown
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-neutral-600 dark:text-neutral-300">To Do</span>
                  <span className="text-neutral-500">{tasksByStatus.TODO.length} tasks</span>
                </div>
                <div className="h-2 bg-neutral-100 dark:bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-neutral-400 rounded-full"
                    style={{
                      width: totalTasks > 0 ? `${(tasksByStatus.TODO.length / totalTasks) * 100}%` : "0%",
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-brand-600 dark:text-brand-400">In Progress</span>
                  <span className="text-neutral-500">{inProgressTasks} tasks</span>
                </div>
                <div className="h-2 bg-neutral-100 dark:bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-500 rounded-full"
                    style={{
                      width: totalTasks > 0 ? `${(inProgressTasks / totalTasks) * 100}%` : "0%",
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-emerald-600 dark:text-emerald-400">Done / Verified</span>
                  <span className="text-neutral-500">{completedTasks} tasks</span>
                </div>
                <div className="h-2 bg-neutral-100 dark:bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{
                      width: totalTasks > 0 ? `${(completedTasks / totalTasks) * 100}%` : "0%",
                    }}
                  />
                </div>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-500" /> Security & Governance
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed mb-4">
                This project inherits tenant isolation rules. Only authorized tenant members can view associated task
                artifacts and documents.
              </p>
              <div className="bg-neutral-50 dark:bg-white/5 rounded-xl p-4 border border-neutral-200/60 dark:border-white/10 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Workspace Role:</span>
                  <span className="font-bold text-neutral-900 dark:text-white">{userRole ?? "MEMBER"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Tenant Context:</span>
                  <span className="font-bold text-neutral-900 dark:text-white truncate max-w-[160px]">
                    {currentTenant?.name ?? "Enterprise Tenant"}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-neutral-200/60 dark:border-white/10 flex justify-end">
              <GlassButton
                variant="outline"
                size="sm"
                onClick={openEditModal}
                className="text-xs font-semibold"
              >
                Modify Project Settings
              </GlassButton>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Edit Project Modal */}
      <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)} title="Workspace Settings">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
              Project Name
            </label>
            <Input
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              autoFocus
              className="bg-neutral-50 dark:bg-[#080d1a] border-neutral-200 dark:border-white/10"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
              Description
            </label>
            <textarea
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              rows={3}
              className="w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-[#080d1a] text-neutral-900 dark:text-white px-3.5 py-2.5 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-accent-cyan/50 resize-none transition-colors"
            />
          </div>
          <div className="flex justify-end gap-3 pt-3">
            <GlassButton type="button" variant="ghost" onClick={() => setEditModalOpen(false)}>
              Cancel
            </GlassButton>
            <GlassButton type="submit" variant="primary" isLoading={updateProject.isPending}>
              Save Workspace
            </GlassButton>
          </div>
        </form>
      </Modal>

      {/* Add Member Modal */}
      <Modal open={addMemberModal} onClose={() => setAddMemberModal(false)} title="Invite Team Member" size="lg">
        <form onSubmit={handleAddMember} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
              Search Member from Organization
            </label>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
              <input
                type="text"
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                placeholder="Search by name or email address..."
                autoFocus
                className="w-full pl-10 pr-3.5 h-11 rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-[#080d1a] text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-accent-cyan/50 transition-colors"
              />
            </div>
          </div>

          {availableMembers.length > 0 && (
            <div className="max-h-52 overflow-y-auto border border-neutral-200 dark:border-white/10 rounded-xl divide-y divide-neutral-100 dark:divide-white/5">
              {availableMembers.map((m) => (
                <button
                  key={m.userId}
                  type="button"
                  onClick={() => setSelectedUserId(m.userId)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-left transition-colors hover:bg-accent-cyan/5 ${
                    selectedUserId === m.userId ? "bg-accent-cyan/10 dark:bg-accent-cyan/20" : ""
                  }`}
                >
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      selectedUserId === m.userId
                        ? "bg-accent-cyan text-white shadow-xs"
                        : "bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200"
                    }`}
                  >
                    {m.user?.firstName?.[0] || m.user?.email?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-neutral-900 dark:text-white truncate">
                      {m.user?.firstName
                        ? `${m.user.firstName} ${m.user.lastName || ""}`
                        : m.user?.email || "Unknown"}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">{m.user?.email}</p>
                  </div>
                  {selectedUserId === m.userId && (
                    <CheckCircle2 className="h-4 w-4 text-accent-cyan shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}

          {availableMembers.length === 0 && memberSearch && (
            <p className="text-sm text-neutral-400 text-center py-3">
              No matching members found in the organization.
            </p>
          )}

          {selectedUserId && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
                Assign Workspace Role
              </label>
              <select
                value={memberRole}
                onChange={(e) => setMemberRole(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-[#080d1a] text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-cyan/50 transition"
              >
                <option value="MEMBER">Member (standard contributor)</option>
                <option value="MAINTAINER">Maintainer (can edit project & add members)</option>
              </select>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-3">
            <GlassButton type="button" variant="ghost" onClick={() => setAddMemberModal(false)}>
              Cancel
            </GlassButton>
            <GlassButton
              type="submit"
              variant="primary"
              disabled={!selectedUserId}
              isLoading={addMember.isPending}
            >
              <UserPlus className="h-3.5 w-3.5 mr-1.5" /> Confirm Invitation
            </GlassButton>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteConfirm}
        onClose={() => setDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Project Workspace"
        description={`Are you sure you want to delete "${p.name}"? All associated tasks and documents will be archived.`}
        confirmLabel="Delete Workspace"
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
        title="Remove Member from Workspace"
        description={`Are you sure you want to remove ${
          confirmRemove?.user?.firstName || confirmRemove?.user?.email || "this member"
        } from "${p.name}"?`}
        confirmLabel="Remove Member"
        isLoading={removeMember.isPending}
      />
    </div>
  );
}
