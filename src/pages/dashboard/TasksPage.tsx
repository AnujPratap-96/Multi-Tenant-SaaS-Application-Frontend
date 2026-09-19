import { useState, useCallback, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Plus,
  Columns3,
  List,
  Table2,
  Circle,
  CheckCircle2,
  Clock,
  AlertCircle,
  Ban,
  ArrowUp,
  ArrowDown,
  CalendarDays,
  UserPlus,
  MessageSquare,
  Trash2,
  X,
  Pencil,
  History,
  Timer,
  Play,
  Square,
  FolderKanban,
  type LucideIcon,
} from "lucide-react";
import { useProjects } from "@/features/projects/projectsQueries";
import { useMembers } from "@/features/tenant/tenantQueries";
import { useDepartments } from "@/features/departments/departmentsQueries";
import { useTenantStore } from "@/features/tenant/tenantStore";
import { useAuthStore } from "@/features/auth/authStore";
import {
  useTasks,
  useTask,
  useTaskComments,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  useAddAssignee,
  useAddComment,
  useAddAssigneeToTask,
  useRemoveAssignee,
  useUpdateComment,
  useTaskActivity,
  useTimeEntries,
  useStartTimer,
  useStopTimer,
  useDeleteTimeEntry,
} from "@/features/tasks/tasksQueries";
import type { CreateTaskInput } from "@/features/tasks/tasksApi";
import { useDebounce } from "@/hooks/useDebounce";
import Modal from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import PageLoader from "@/components/ui/PageLoader";
import SearchInput from "@/components/ui/SearchInput";
import { Select } from "@/components/ui/Select";
import Pagination from "@/components/ui/Pagination";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { GlassCard } from "@/components/glass/GlassCard";
import { GlassButton } from "@/components/glass/GlassButton";
import type { Task, User } from "@/types/domain";

const PRIORITY_ICONS: Record<string, LucideIcon> = { HIGH: ArrowUp, MEDIUM: ArrowDown, LOW: ArrowDown };
const PRIORITY_COLORS: Record<string, string> = {
  HIGH: "text-rose-500 dark:text-rose-400",
  MEDIUM: "text-amber-500 dark:text-amber-400",
  LOW: "text-emerald-500 dark:text-emerald-400",
};
const PRIORITY_BG: Record<string, string> = {
  HIGH: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  MEDIUM: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  LOW: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
};

interface StatusConfig {
  label: string;
  icon: LucideIcon;
  color: string;
  bg: string;
  border: string;
  iconBg: string;
  dotBg: string;
}

const STATUS_CONFIG: Record<string, StatusConfig> = {
  TODO: {
    label: "To Do",
    icon: Circle,
    color: "text-neutral-500 dark:text-neutral-400",
    bg: "bg-neutral-50/50 dark:bg-neutral-900/30",
    border: "border-neutral-200/60 dark:border-white/10",
    iconBg: "text-neutral-400",
    dotBg: "bg-neutral-400",
  },
  IN_PROGRESS: {
    label: "In Progress",
    icon: Clock,
    color: "text-brand-600 dark:text-brand-400",
    bg: "bg-brand-50/20 dark:bg-brand-950/20",
    border: "border-brand-500/20",
    iconBg: "text-brand-500",
    dotBg: "bg-brand-500",
  },
  IN_REVIEW: {
    label: "In Review",
    icon: AlertCircle,
    color: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-50/20 dark:bg-indigo-950/20",
    border: "border-indigo-500/20",
    iconBg: "text-indigo-500",
    dotBg: "bg-indigo-500",
  },
  BLOCKED: {
    label: "Blocked",
    icon: AlertCircle,
    color: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-50/20 dark:bg-rose-950/20",
    border: "border-rose-500/20",
    iconBg: "text-rose-500",
    dotBg: "bg-rose-500",
  },
  DONE: {
    label: "Done",
    icon: CheckCircle2,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50/20 dark:bg-emerald-950/20",
    border: "border-emerald-500/20",
    iconBg: "text-emerald-500",
    dotBg: "bg-emerald-500",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: Ban,
    color: "text-neutral-400 dark:text-neutral-500",
    bg: "bg-neutral-100/30 dark:bg-neutral-900/20",
    border: "border-neutral-200/40 dark:border-white/5",
    iconBg: "text-neutral-400",
    dotBg: "bg-neutral-400",
  },
};

const STATUSES = ["TODO", "IN_PROGRESS", "IN_REVIEW", "BLOCKED", "DONE", "CANCELLED"];
const PRIORITIES = ["LOW", "MEDIUM", "HIGH"];

type ViewMode = "kanban" | "table" | "list";

function formatDate(d?: string | null) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatDateTime(d?: string | null) {
  if (!d) return "";
  return new Date(d).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function UserAvatar({ user, size = "sm" }: { user?: User; size?: "sm" | "lg" }) {
  const s = size === "sm" ? "h-6 w-6 text-[10px]" : "h-8 w-8 text-xs";
  return (
    <div
      className={`${s} rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center font-bold text-white shrink-0 ring-1 ring-white dark:ring-neutral-900 shadow-xs`}
      title={user?.firstName ? `${user.firstName} ${user.lastName || ""}` : user?.email}
    >
      {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || "?"}
    </div>
  );
}

function AssigneeAvatars({ assignees, max = 3 }: { assignees?: { userId: string; user?: User }[]; max?: number }) {
  const visible = assignees?.slice(0, max) || [];
  const remaining = (assignees?.length || 0) - max;
  if (!visible.length) return <span className="text-xs text-neutral-400">—</span>;
  return (
    <div className="flex items-center -space-x-1.5">
      {visible.map((a) => (
        <UserAvatar key={a.userId} user={a.user} />
      ))}
      {remaining > 0 && (
        <div className="h-6 w-6 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-[10px] font-bold text-neutral-500 -ml-1.5 ring-1 ring-white dark:ring-neutral-900">
          +{remaining}
        </div>
      )}
    </div>
  );
}

function PriorityBadge({ priority }: { priority?: string }) {
  const Icon = priority ? PRIORITY_ICONS[priority] : undefined;
  const label: Record<string, string> = { HIGH: "High", MEDIUM: "Medium", LOW: "Low" };
  if (!priority) return null;
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${
        PRIORITY_BG[priority] ?? "bg-neutral-100 text-neutral-600"
      }`}
    >
      {Icon && <Icon className={`h-3 w-3 ${PRIORITY_COLORS[priority]}`} />}
      {label[priority] || priority}
    </span>
  );
}

interface CreateForm {
  title: string;
  description: string;
  priority: string;
  dueDate: string;
  departmentIds: string[];
  assigneeIds: string[];
}

const CREATE_FORM_DEFAULTS: CreateForm = {
  title: "",
  description: "",
  priority: "MEDIUM",
  dueDate: "",
  departmentIds: [],
  assigneeIds: [],
};

export default function TasksPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTenant = useTenantStore((s) => s.currentTenant);
  const { user: currentUser } = useAuthStore();
  const { data: projectsData } = useProjects({ limit: 100 });

  const projects = useMemo(() => projectsData?.projects ?? [], [projectsData]);
  const initialTaskId = searchParams.get("taskId") || null;
  const [selectedProjectId, setSelectedProjectId] = useState(() => searchParams.get("projectId") || "");

  const [viewMode, setViewMode] = useState<ViewMode>("kanban");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 300);

  const queryParams = useMemo(
    () => ({
      page,
      limit: 50,
      ...(statusFilter && { status: statusFilter }),
      ...(priorityFilter && { priority: priorityFilter }),
      ...(debouncedSearch && { search: debouncedSearch }),
    }),
    [page, statusFilter, priorityFilter, debouncedSearch]
  );

  const { data: tasksData, isLoading: tasksLoading } = useTasks(selectedProjectId, queryParams);
  const createTask = useCreateTask();
  const addAssigneeToTask = useAddAssigneeToTask();
  const { data: departmentsData } = useDepartments({ limit: 100 });
  const deleteTask = useDeleteTask(selectedProjectId);

  const { data: membersData } = useMembers(currentTenant?.id, { limit: 100 });
  const projectMembers = useMemo(() => membersData?.members ?? [], [membersData]);

  const tasks = useMemo(() => tasksData?.tasks ?? [], [tasksData]);
  const pagination = tasksData?.pagination;

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateForm>(CREATE_FORM_DEFAULTS);

  const [detailTaskId, setDetailTaskId] = useState<string | null>(initialTaskId);
  const { data: detailTask } = useTask(detailTaskId ?? undefined);
  const { data: comments } = useTaskComments(detailTaskId ?? undefined);
  const updateTask = useUpdateTask(detailTaskId ?? undefined);
  const addAssignee = useAddAssignee(detailTaskId ?? undefined);
  const addComment = useAddComment(detailTaskId ?? undefined);
  const removeAssignee = useRemoveAssignee(detailTaskId ?? undefined);
  const updateComment = useUpdateComment(detailTaskId ?? undefined);
  const { data: activityData } = useTaskActivity(detailTaskId ?? undefined);
  const { data: timeData } = useTimeEntries(detailTaskId ?? undefined);
  const startTimer = useStartTimer(detailTaskId ?? undefined);
  const stopTimer = useStopTimer();
  const deleteTimeEntry = useDeleteTimeEntry(detailTaskId ?? undefined);

  const [detailAssignModal, setDetailAssignModal] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [editingComment, setEditingComment] = useState<{ id: string; text: string } | null>(null);
  const [commentMentions, setCommentMentions] = useState<string[]>([]);
  const [showMentionList, setShowMentionList] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<Task | null>(null);
  const dragTaskRef = useRef<{ taskId: string; status: string } | null>(null);

  const handleProjectChange = useCallback(
    (val: string) => {
      setSelectedProjectId(val);
      setPage(1);
      setDetailTaskId(null);
      if (val) {
        setSearchParams({ projectId: val });
      } else {
        setSearchParams({});
      }
    },
    [setSearchParams]
  );

  const handleCreateSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!createForm.title.trim() || !selectedProjectId) return;
      const assigneeIds = createForm.assigneeIds;
      createTask.mutate(
        {
          projectId: selectedProjectId,
          title: createForm.title.trim(),
          description: createForm.description.trim() || undefined,
          priority: createForm.priority,
          dueDate: createForm.dueDate ? new Date(createForm.dueDate).toISOString() : undefined,
          departmentIds: createForm.departmentIds.length ? createForm.departmentIds : undefined,
        },
        {
          onSuccess: (created) => {
            const newId = created?.id;
            if (newId && assigneeIds.length) {
              assigneeIds.forEach((uid) => addAssigneeToTask.mutate({ taskId: newId, userId: uid }));
            }
            setCreateModalOpen(false);
            setCreateForm(CREATE_FORM_DEFAULTS);
          },
        }
      );
    },
    [createForm, selectedProjectId, createTask, addAssigneeToTask]
  );

  const handleStatusChange = useCallback(
    (taskId: string, newStatus: string) => {
      updateTask.mutate({ id: taskId, status: newStatus, projectId: selectedProjectId });
    },
    [updateTask, selectedProjectId]
  );

  const handleQuickUpdate = useCallback(
    (taskId: string, field: string, value: string | null | undefined) => {
      updateTask.mutate({
        id: taskId,
        projectId: selectedProjectId,
        [field]: value,
      } as Partial<CreateTaskInput> & { projectId?: string; id: string });
    },
    [updateTask, selectedProjectId]
  );

  const handleAddAssigneeToTask = useCallback(
    (userId: string) => {
      addAssignee.mutate(userId);
    },
    [addAssignee]
  );

  const handleAddComment = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!commentText.trim()) return;
      addComment.mutate(
        { comment: commentText.trim(), mentionIds: commentMentions },
        {
          onSuccess: () => {
            setCommentText("");
            setCommentMentions([]);
          },
        }
      );
    },
    [commentText, commentMentions, addComment]
  );

  const handleUpdateComment = useCallback(
    (commentId: string) => {
      if (!editingComment || !editingComment.text.trim()) return;
      updateComment.mutate(
        { commentId, comment: editingComment.text.trim() },
        { onSuccess: () => setEditingComment(null) }
      );
    },
    [editingComment, updateComment]
  );

  // ── Drag & Drop ──────────────────────────────────────────────────────────────
  const handleDragStart = useCallback((e: React.DragEvent, taskId: string, status: string) => {
    dragTaskRef.current = { taskId, status };
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, targetStatus: string) => {
      e.preventDefault();
      const src = dragTaskRef.current;
      if (!src || src.status === targetStatus) return;
      handleStatusChange(src.taskId, targetStatus);
      dragTaskRef.current = null;
    },
    [handleStatusChange]
  );

  // ── Kanban grouping ──────────────────────────────────────────────────────────
  const kanbanTasks = useMemo(() => {
    const grouped: Record<string, Task[]> = {
      TODO: [],
      IN_PROGRESS: [],
      IN_REVIEW: [],
      BLOCKED: [],
      DONE: [],
      CANCELLED: [],
    };
    tasks.forEach((t) => {
      if (t.status) (grouped[t.status] ??= []).push(t);
    });
    return grouped;
  }, [tasks]);

  const availableAssignees = useMemo(() => {
    if (!detailTask || !projectMembers.length) return [];
    const assignedIds = new Set(detailTask.assignees?.map((a) => a.userId) ?? []);
    return projectMembers.filter((m) => !assignedIds.has(m.userId));
  }, [detailTask, projectMembers]);

  const selectedProject = useMemo(() => {
    return projects.find((p) => p.id === selectedProjectId);
  }, [projects, selectedProjectId]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight flex items-center gap-3">
            <span>Sprint Tasks</span>
            {selectedProject && (
              <span className="text-sm font-semibold px-3 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
                {selectedProject.name}
              </span>
            )}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Track sprints, assign contributors, and monitor cycle velocity in real-time.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Select
            value={selectedProjectId}
            onChange={(e) => handleProjectChange(e.target.value)}
            className="w-56 h-10 px-3 rounded-xl border border-neutral-300 dark:border-white/10 bg-white dark:bg-card-dark text-sm font-medium text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition shadow-sm"
          >
            <option value="">Choose Workspace…</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>

          <GlassButton
            variant="primary"
            size="md"
            className="shadow-sm"
            onClick={() => setCreateModalOpen(true)}
            disabled={!selectedProjectId}
          >
            <Plus className="h-4 w-4 mr-1.5" /> New Task
          </GlassButton>
        </div>
      </div>

      {!selectedProjectId ? (
        <div className="space-y-6">
          <GlassCard className="p-8 sm:p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center">
              <FolderKanban className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">Select a Project Workspace</h2>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm max-w-md mx-auto mb-8">
              Select an active workspace from below to view its Kanban board, track task assignments, and log sprint hours.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto text-left">
              {projects.map((p) => (
                <div
                  key={p.id}
                  onClick={() => handleProjectChange(p.id)}
                  className="p-5 rounded-xl border border-neutral-200/70 dark:border-white/10 bg-white/70 dark:bg-card-dark/70 hover:border-brand-500/50 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-brand-500" />
                    <h3 className="font-bold text-neutral-900 dark:text-white group-hover:text-brand-500 transition-colors truncate">
                      {p.name}
                    </h3>
                  </div>
                  {p.description && (
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 mb-3">
                      {p.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs text-neutral-400 pt-2 border-t border-neutral-100 dark:border-white/5">
                    <span>Active Workspace</span>
                    <span className="text-brand-500 font-semibold group-hover:translate-x-0.5 transition-transform">
                      Open Board →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      ) : (
        <>
          {/* Toolbar & Filter Bar */}
          <GlassCard className="p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 flex-wrap w-full sm:w-auto">
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Search tasks…"
                className="w-full sm:w-56"
              />
              <Select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="h-10 text-xs font-semibold px-3 rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-card-dark text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">All statuses</option>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_CONFIG[s].label}
                  </option>
                ))}
              </Select>
              <Select
                value={priorityFilter}
                onChange={(e) => {
                  setPriorityFilter(e.target.value);
                  setPage(1);
                }}
                className="h-10 text-xs font-semibold px-3 rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-card-dark text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">All priorities</option>
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p.charAt(0) + p.slice(1).toLowerCase()}
                  </option>
                ))}
              </Select>
            </div>

            <div className="flex items-center border border-neutral-200 dark:border-white/10 rounded-xl overflow-hidden bg-neutral-100/50 dark:bg-white/5 p-0.5">
              {(
                [
                  { key: "kanban", icon: Columns3, label: "Kanban" },
                  { key: "table", icon: Table2, label: "Table" },
                  { key: "list", icon: List, label: "List" },
                ] as { key: ViewMode; icon: LucideIcon; label: string }[]
              ).map(({ key, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setViewMode(key)}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === key
                      ? "bg-white dark:bg-card-dark text-brand-600 dark:text-brand-400 shadow-xs"
                      : "text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                  }`}
                  title={key}
                >
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          </GlassCard>

          {tasksLoading ? (
            <PageLoader />
          ) : tasks.length === 0 ? (
            <GlassCard className="p-12 text-center">
              <div className="h-12 w-12 mx-auto rounded-2xl bg-neutral-100 dark:bg-white/5 flex items-center justify-center mb-3">
                <List className="h-6 w-6 text-neutral-400" />
              </div>
              <p className="text-neutral-700 dark:text-neutral-300 font-bold mb-1">No tasks in this workspace</p>
              <p className="text-neutral-500 dark:text-neutral-400 text-xs mb-4">
                Start tracking sprint progress by adding the first task.
              </p>
              <GlassButton size="sm" variant="primary" onClick={() => setCreateModalOpen(true)}>
                <Plus className="h-4 w-4 mr-1.5" /> Create First Task
              </GlassButton>
            </GlassCard>
          ) : (
            <>
              {/* ── View: Table ───────────────────────────────────────────────── */}
              {viewMode === "table" && (
                <GlassCard className="overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-neutral-200/60 dark:border-white/10 bg-neutral-50/50 dark:bg-white/[0.02]">
                          <th className="text-left px-5 py-3.5 font-bold text-neutral-500 dark:text-neutral-400 text-xs uppercase tracking-wider">
                            Task
                          </th>
                          <th className="text-left px-5 py-3.5 font-bold text-neutral-500 dark:text-neutral-400 text-xs uppercase tracking-wider">
                            Status
                          </th>
                          <th className="text-left px-5 py-3.5 font-bold text-neutral-500 dark:text-neutral-400 text-xs uppercase tracking-wider">
                            Priority
                          </th>
                          <th className="text-left px-5 py-3.5 font-bold text-neutral-500 dark:text-neutral-400 text-xs uppercase tracking-wider">
                            Assignees
                          </th>
                          <th className="text-left px-5 py-3.5 font-bold text-neutral-500 dark:text-neutral-400 text-xs uppercase tracking-wider">
                            Due Date
                          </th>
                          <th className="text-right px-5 py-3.5 font-bold text-neutral-500 dark:text-neutral-400 text-xs uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100 dark:divide-white/5">
                        {tasks.map((task) => (
                          <tr
                            key={task.id}
                            className="hover:bg-neutral-50/50 dark:hover:bg-white/[0.02] transition-colors"
                          >
                            <td className="px-5 py-4">
                              <button
                                onClick={() => setDetailTaskId(task.id)}
                                className="text-sm font-semibold text-neutral-900 dark:text-white hover:text-brand-500 dark:hover:text-brand-400 text-left transition-colors"
                              >
                                {task.title}
                              </button>
                              {task.description && (
                                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 line-clamp-1">
                                  {task.description}
                                </p>
                              )}
                            </td>
                            <td className="px-5 py-4">
                              <Select
                                value={task.status}
                                onChange={(e) => handleQuickUpdate(task.id, "status", e.target.value)}
                                className={`text-xs font-semibold rounded-lg px-2.5 py-1 border ${
                                  STATUS_CONFIG[task.status ?? ""]?.bg
                                } ${STATUS_CONFIG[task.status ?? ""]?.color} ${
                                  STATUS_CONFIG[task.status ?? ""]?.border
                                } focus:outline-none cursor-pointer`}
                              >
                                {STATUSES.map((s) => (
                                  <option key={s} value={s}>
                                    {STATUS_CONFIG[s].label}
                                  </option>
                                ))}
                              </Select>
                            </td>
                            <td className="px-5 py-4">
                              <Select
                                value={task.priority}
                                onChange={(e) => handleQuickUpdate(task.id, "priority", e.target.value)}
                                className={`text-xs font-semibold rounded-lg px-2.5 py-1 border ${
                                  PRIORITY_BG[task.priority ?? ""]
                                } focus:outline-none cursor-pointer`}
                              >
                                {PRIORITIES.map((p) => (
                                  <option key={p} value={p}>
                                    {p.charAt(0) + p.slice(1).toLowerCase()}
                                  </option>
                                ))}
                              </Select>
                            </td>
                            <td className="px-5 py-4">
                              <AssigneeAvatars assignees={task.assignees} />
                            </td>
                            <td className="px-5 py-4 text-xs text-neutral-500">
                              {task.dueDate ? (
                                <span className="flex items-center gap-1.5 font-medium">
                                  <CalendarDays className="h-3.5 w-3.5 text-neutral-400" />
                                  {formatDate(task.dueDate)}
                                </span>
                              ) : (
                                "—"
                              )}
                            </td>
                            <td className="px-5 py-4 text-right">
                              <button
                                onClick={() => setDeleteConfirm(task)}
                                className="p-1.5 rounded-lg hover:bg-rose-500/10 text-neutral-400 hover:text-rose-500 transition-colors"
                                title="Delete task"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="px-5 py-3.5 border-t border-neutral-200/60 dark:border-white/10">
                    <Pagination page={page} totalPages={pagination?.totalPages || 1} onChange={setPage} />
                  </div>
                </GlassCard>
              )}

              {/* ── View: Kanban ──────────────────────────────────────────────── */}
              {viewMode === "kanban" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 min-h-[550px]">
                  {STATUSES.map((status) => {
                    const cfg = STATUS_CONFIG[status];
                    const Icon = cfg.icon;
                    const items = kanbanTasks[status] ?? [];
                    return (
                      <div
                        key={status}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, status)}
                        className={`rounded-2xl border ${cfg.border} ${cfg.bg} backdrop-blur-md flex flex-col p-3 shadow-sm min-h-[480px] transition-all`}
                      >
                        <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-neutral-200/50 dark:border-white/5">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${cfg.dotBg}`} />
                            <Icon className={`h-3.5 w-3.5 ${cfg.iconBg}`} />
                            <span className={`text-xs font-bold ${cfg.color}`}>{cfg.label}</span>
                          </div>
                          <span className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 bg-white/80 dark:bg-white/10 px-2 py-0.5 rounded-full">
                            {items.length}
                          </span>
                        </div>

                        <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[640px] pr-0.5">
                          {items.length === 0 && (
                            <div className="h-32 flex flex-col items-center justify-center border border-dashed border-neutral-200/60 dark:border-white/10 rounded-xl text-[11px] text-neutral-400 text-center p-2">
                              Drop tasks here
                            </div>
                          )}
                          {items.map((task) => (
                            <div
                              key={task.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, task.id, task.status ?? "")}
                              onClick={() => setDetailTaskId(task.id)}
                              className="bg-white/90 dark:bg-card-dark/90 backdrop-blur-md rounded-xl border border-neutral-200/70 dark:border-white/10 p-3.5 shadow-xs hover:shadow-md hover:border-brand-500/40 transition-all cursor-pointer active:opacity-60 group"
                            >
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <p className="text-xs font-bold text-neutral-900 dark:text-white leading-snug line-clamp-2 flex-1 group-hover:text-brand-500 transition-colors">
                                  {task.title}
                                </p>
                              </div>

                              {task.description && (
                                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mb-2 line-clamp-2">
                                  {task.description}
                                </p>
                              )}

                              <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-100 dark:border-white/5">
                                <span className="shrink-0">
                                  <PriorityBadge priority={task.priority} />
                                </span>
                                <div className="flex items-center gap-1.5 ml-auto">
                                  <AssigneeAvatars assignees={task.assignees} max={2} />
                                </div>
                              </div>

                              {task.dueDate && (
                                <div className="mt-2 text-[10px] font-semibold text-neutral-400 flex items-center gap-1">
                                  <CalendarDays className="h-3 w-3" />
                                  {formatDate(task.dueDate)}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ── View: List ────────────────────────────────────────────────── */}
              {viewMode === "list" && (
                <div className="space-y-2.5">
                  {tasks.map((task) => (
                    <GlassCard
                      key={task.id}
                      className="px-4 py-3.5 flex items-center gap-4 hover:border-brand-500/30 transition-all"
                    >
                      <button
                        onClick={() => {
                          const next =
                            task.status === "DONE"
                              ? "TODO"
                              : task.status === "TODO"
                              ? "IN_PROGRESS"
                              : "DONE";
                          handleQuickUpdate(task.id, "status", next);
                        }}
                        className={`shrink-0 transition-colors ${
                          task.status === "DONE"
                            ? "text-emerald-500"
                            : "text-neutral-300 dark:text-neutral-600 hover:text-brand-500"
                        }`}
                      >
                        <CheckCircle2 className="h-5 w-5" />
                      </button>

                      <div
                        className={`flex-1 min-w-0 cursor-pointer ${
                          task.status === "DONE" ? "line-through text-neutral-400 dark:text-neutral-500" : ""
                        }`}
                        onClick={() => setDetailTaskId(task.id)}
                      >
                        <p className="text-sm font-semibold text-neutral-900 dark:text-white truncate">
                          {task.title}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <PriorityBadge priority={task.priority} />
                        <AssigneeAvatars assignees={task.assignees} max={2} />
                        {task.dueDate && (
                          <span className="text-xs text-neutral-400 flex items-center gap-1">
                            <CalendarDays className="h-3.5 w-3.5" />
                            {formatDate(task.dueDate)}
                          </span>
                        )}
                        <button
                          onClick={() => setDeleteConfirm(task)}
                          className="p-1 rounded-lg hover:bg-rose-500/10 text-neutral-400 hover:text-rose-500 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </GlassCard>
                  ))}
                  <Pagination page={page} totalPages={pagination?.totalPages || 1} onChange={setPage} />
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* ── Create Task Modal ──────────────────────────────────────────────────── */}
      <Modal open={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Create New Sprint Task" size="lg">
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
              Task Title
            </label>
            <Input
              value={createForm.title}
              onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
              placeholder="e.g. Implement multi-factor authentication callback"
              autoFocus
              className="bg-neutral-50 dark:bg-[#080d1a] border-neutral-200 dark:border-white/10"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
              Description & Acceptance Criteria
            </label>
            <textarea
              value={createForm.description}
              onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
              rows={3}
              placeholder="Provide context, links, or requirements for contributors…"
              className="w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-[#080d1a] text-neutral-900 dark:text-white px-3.5 py-2.5 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-accent-cyan/50 resize-none transition-colors"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
                Priority Level
              </label>
              <select
                value={createForm.priority}
                onChange={(e) => setCreateForm({ ...createForm, priority: e.target.value })}
                className="w-full h-11 px-3 rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-[#080d1a] text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-cyan/50 transition"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
                Target Due Date
              </label>
              <input
                type="date"
                value={createForm.dueDate}
                onChange={(e) => setCreateForm({ ...createForm, dueDate: e.target.value })}
                className="w-full h-11 px-3 rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-[#080d1a] text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-cyan/50 transition"
              />
            </div>
          </div>

          {/* Departments */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
              Departments
            </label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {(departmentsData?.departments ?? []).length === 0 && (
                <p className="text-xs text-neutral-400">No departments configured</p>
              )}
              {(departmentsData?.departments ?? []).map((d) => {
                const active = createForm.departmentIds.includes(d.id);
                return (
                  <button
                    type="button"
                    key={d.id}
                    onClick={() =>
                      setCreateForm((f) => ({
                        ...f,
                        departmentIds: active
                          ? f.departmentIds.filter((x) => x !== d.id)
                          : [...f.departmentIds, d.id],
                      }))
                    }
                    className={`text-xs px-3 py-1 rounded-full border font-semibold transition-colors ${
                      active
                        ? "bg-brand-500/10 text-brand-600 dark:text-brand-400 border-brand-500/30"
                        : "border-neutral-200 dark:border-white/10 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-white/5"
                    }`}
                  >
                    {d.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Assignees */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
              Assign Contributor
            </label>
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
              {projectMembers.length === 0 && (
                <p className="text-xs text-neutral-400">No members available in this organization</p>
              )}
              {projectMembers.map((m) => {
                const u = m.user;
                const name = u?.firstName
                  ? `${u.firstName} ${u.lastName || ""}`.trim()
                  : u?.email || "Unknown";
                const active = createForm.assigneeIds.includes(m.userId);
                return (
                  <button
                    type="button"
                    key={m.userId}
                    onClick={() =>
                      setCreateForm((f) => ({
                        ...f,
                        assigneeIds: active
                          ? f.assigneeIds.filter((x) => x !== m.userId)
                          : [...f.assigneeIds, m.userId],
                      }))
                    }
                    className={`text-xs px-3 py-1 rounded-full border font-semibold transition-colors ${
                      active
                        ? "bg-brand-500/10 text-brand-600 dark:text-brand-400 border-brand-500/30"
                        : "border-neutral-200 dark:border-white/10 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-white/5"
                    }`}
                  >
                    {name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <GlassButton type="button" variant="ghost" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </GlassButton>
            <GlassButton type="submit" variant="primary" isLoading={createTask.isPending}>
              Create Sprint Task
            </GlassButton>
          </div>
        </form>
      </Modal>

      {/* ── Task Detail Modal ──────────────────────────────────────────────────── */}
      <Modal open={!!detailTaskId} onClose={() => setDetailTaskId(null)} title="Task Inspection & Tracking" size="xl">
        {detailTask ? (
          <div className="space-y-6">
            {/* Title & Quick Status Bar */}
            <div className="pb-4 border-b border-neutral-200/60 dark:border-white/10">
              <input
                defaultValue={detailTask.title}
                onBlur={(e) => {
                  const val = e.target.value.trim();
                  if (val && val !== detailTask.title) {
                    handleQuickUpdate(detailTask.id, "title", val);
                  }
                }}
                className="w-full text-xl font-bold bg-transparent border-none outline-none text-neutral-900 dark:text-white px-0 focus:ring-0"
              />
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Status:</label>
                  <Select
                    value={detailTask.status}
                    onChange={(e) => handleQuickUpdate(detailTask.id, "status", e.target.value)}
                    className={`text-xs font-semibold rounded-lg px-2.5 py-1 border ${
                      STATUS_CONFIG[detailTask.status ?? ""]?.bg
                    } ${STATUS_CONFIG[detailTask.status ?? ""]?.color} ${
                      STATUS_CONFIG[detailTask.status ?? ""]?.border
                    } focus:outline-none cursor-pointer`}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_CONFIG[s].label}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Priority:</label>
                  <Select
                    value={detailTask.priority}
                    onChange={(e) => handleQuickUpdate(detailTask.id, "priority", e.target.value)}
                    className={`text-xs font-semibold rounded-lg px-2.5 py-1 border ${
                      PRIORITY_BG[detailTask.priority ?? ""]
                    } focus:outline-none cursor-pointer`}
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>
                        {p.charAt(0) + p.slice(1).toLowerCase()}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Due:</label>
                  <input
                    type="date"
                    value={detailTask.dueDate ? detailTask.dueDate.split("T")[0] : ""}
                    onChange={(e) => {
                      const val = e.target.value ? new Date(e.target.value).toISOString() : null;
                      handleQuickUpdate(detailTask.id, "dueDate", val);
                    }}
                    className="text-xs rounded-lg px-2.5 py-1 border border-neutral-200 dark:border-white/10 bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                Description
              </label>
              <textarea
                defaultValue={detailTask.description || ""}
                onBlur={(e) => {
                  const val = e.target.value.trim() || undefined;
                  if (val !== detailTask.description) {
                    handleQuickUpdate(detailTask.id, "description", val);
                  }
                }}
                rows={3}
                placeholder="Add acceptance criteria or technical context…"
                className="w-full rounded-xl border border-neutral-300 dark:border-white/10 bg-neutral-50 dark:bg-card-dark text-neutral-900 dark:text-white px-3.5 py-2.5 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none transition-colors"
              />
            </div>

            {/* Assignees */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Assigned Contributors
                </label>
                <GlassButton size="sm" variant="ghost" onClick={() => setDetailAssignModal(true)}>
                  <UserPlus className="h-3.5 w-3.5 mr-1 text-brand-500" /> Assign
                </GlassButton>
              </div>
              <div className="flex flex-wrap gap-2">
                {detailTask.assignees?.length === 0 && (
                  <p className="text-xs text-neutral-400">No assignees assigned</p>
                )}
                {detailTask.assignees?.map((a) => (
                  <div
                    key={a.userId}
                    className="flex items-center gap-1.5 bg-neutral-100 dark:bg-white/5 border border-neutral-200/60 dark:border-white/10 rounded-full pl-1.5 pr-2 py-1 text-xs"
                  >
                    <UserAvatar user={a.user} />
                    <span className="text-neutral-700 dark:text-neutral-300 font-medium">
                      {a.user?.firstName ? `${a.user.firstName} ${a.user.lastName || ""}` : a.user?.email || "Unknown"}
                    </span>
                    <button
                      onClick={() => removeAssignee.mutate({ userId: a.userId })}
                      className="ml-0.5 p-0.5 rounded-full hover:bg-rose-500/10 text-neutral-400 hover:text-rose-500 transition-colors"
                      aria-label="Remove assignee"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Time Tracking */}
            <div className="border-t border-neutral-200/60 dark:border-white/10 pt-4">
              <h4 className="text-sm font-bold text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
                <Timer className="h-4 w-4 text-brand-500" /> Sprint Timer & Hours
              </h4>
              {(() => {
                const running = timeData?.items?.find((e) => !e.endedAt);
                return (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      {running ? (
                        <GlassButton size="sm" variant="danger" onClick={() => stopTimer.mutate(running.id)}>
                          <Square className="h-3.5 w-3.5 mr-1" /> Stop Timer
                        </GlassButton>
                      ) : (
                        <GlassButton
                          size="sm"
                          variant="primary"
                          onClick={() => startTimer.mutate({})}
                          disabled={startTimer.isPending}
                        >
                          <Play className="h-3.5 w-3.5 mr-1" /> Start Timer
                        </GlassButton>
                      )}
                      <span className="text-xs font-semibold text-neutral-500 flex items-center gap-1.5">
                        {running && (
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                          </span>
                        )}
                        {running ? "Session currently running" : "No active session"}
                      </span>
                    </div>
                    {timeData?.items?.length ? (
                      <ul className="space-y-1.5 max-h-32 overflow-y-auto">
                        {timeData.items.map((e) => (
                          <li
                            key={e.id}
                            className="flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-300 p-2 rounded-lg bg-neutral-50 dark:bg-white/[0.02]"
                          >
                            <span>
                              {formatDateTime(e.startedAt)} → {e.endedAt ? formatDateTime(e.endedAt) : "running"}
                            </span>
                            <span className="flex items-center gap-2">
                              <span className="font-semibold text-brand-500">
                                {e.durationMinutes ? `${e.durationMinutes}m` : ""}
                              </span>
                              {e.endedAt && (
                                <button
                                  onClick={() => deleteTimeEntry.mutate(e.id)}
                                  className="text-neutral-400 hover:text-rose-500"
                                  aria-label="Delete time entry"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-neutral-400">No time logged yet</p>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Comments Thread */}
            <div className="border-t border-neutral-200/60 dark:border-white/10 pt-4">
              <h4 className="text-sm font-bold text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-brand-500" />
                Comments & Mentions ({comments?.length || 0})
              </h4>
              <form onSubmit={handleAddComment} className="flex gap-2 mb-2">
                <input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Share updates or feedback with team…"
                  className="flex-1 h-10 rounded-xl border border-neutral-300 dark:border-white/10 bg-neutral-50 dark:bg-card-dark px-3.5 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                />
                <GlassButton
                  type="submit"
                  size="sm"
                  variant="primary"
                  disabled={!commentText.trim()}
                  isLoading={addComment.isPending}
                >
                  Post
                </GlassButton>
              </form>
              <div className="flex items-center gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setShowMentionList((v) => !v)}
                  className="text-xs text-brand-500 hover:underline font-semibold"
                >
                  @ Mention Contributor
                </button>
                {commentMentions.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {commentMentions.map((id) => {
                      const m = projectMembers.find((p) => p.user?.id === id);
                      return (
                        <span
                          key={id}
                          className="text-[10px] bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded-full px-2 py-0.5 font-bold flex items-center gap-1"
                        >
                          @{m?.user?.firstName || m?.user?.email || "user"}
                          <button type="button" onClick={() => setCommentMentions((p) => p.filter((x) => x !== id))}>
                            <X className="h-2.5 w-2.5" />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
              {showMentionList && (
                <div className="mb-3 max-h-32 overflow-y-auto border border-neutral-200 dark:border-white/10 rounded-xl p-2.5 space-y-1 bg-neutral-50 dark:bg-card-dark">
                  {projectMembers.map((m) => (
                    <label
                      key={m.user?.id}
                      className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-300 cursor-pointer hover:bg-neutral-100 dark:hover:bg-white/5 p-1 rounded-md"
                    >
                      <input
                        type="checkbox"
                        checked={commentMentions.includes(m.user?.id ?? "")}
                        onChange={(e) =>
                          setCommentMentions((prev) =>
                            e.target.checked
                              ? [...prev, m.user?.id ?? ""]
                              : prev.filter((x) => x !== m.user?.id)
                          )
                        }
                      />
                      <span>
                        {m.user?.firstName ? `${m.user.firstName} ${m.user.lastName || ""}` : m.user?.email || "Unknown"}
                      </span>
                    </label>
                  ))}
                </div>
              )}
              <div className="space-y-3 max-h-56 overflow-y-auto">
                {comments?.length === 0 && (
                  <p className="text-xs text-neutral-400 text-center py-4">No comments posted yet</p>
                )}
                {comments?.map((c) => {
                  const isAuthor = c.user?.id === currentUser?.id;
                  const isEditing = editingComment?.id === c.id;
                  return (
                    <div key={c.id} className="flex gap-3">
                      <UserAvatar user={c.user} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-neutral-900 dark:text-white">
                            {c.user?.firstName ? `${c.user.firstName} ${c.user.lastName || ""}` : c.user?.email || "Unknown"}
                          </span>
                          <span className="text-[10px] text-neutral-400">{formatDateTime(c.createdAt)}</span>
                          {c.editedAt && <span className="text-[10px] text-neutral-400">(edited)</span>}
                          {isAuthor && !isEditing && (
                            <button
                              onClick={() => setEditingComment({ id: c.id, text: c.comment })}
                              className="ml-auto p-0.5 rounded text-neutral-400 hover:text-brand-500 transition-colors"
                              aria-label="Edit comment"
                            >
                              <Pencil className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                        {isEditing ? (
                          <div className="mt-1.5 flex gap-2">
                            <input
                              autoFocus
                              value={editingComment?.text ?? ""}
                              onChange={(e) => setEditingComment({ id: c.id, text: e.target.value })}
                              className="flex-1 h-9 rounded-xl border border-neutral-300 dark:border-white/10 bg-neutral-50 dark:bg-card-dark px-2.5 text-sm"
                            />
                            <GlassButton size="sm" variant="primary" onClick={() => handleUpdateComment(c.id)}>
                              Save
                            </GlassButton>
                            <GlassButton size="sm" variant="ghost" onClick={() => setEditingComment(null)}>
                              Cancel
                            </GlassButton>
                          </div>
                        ) : (
                          <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 mt-1 whitespace-pre-wrap leading-relaxed">
                            {c.comment}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Activity History */}
            <div className="border-t border-neutral-200/60 dark:border-white/10 pt-4">
              <h4 className="text-sm font-bold text-neutral-900 dark:text-white mb-2 flex items-center gap-2">
                <History className="h-4 w-4 text-neutral-400" /> Audit Log
              </h4>
              {activityData?.items?.length ? (
                <ul className="space-y-1.5 max-h-36 overflow-y-auto text-xs text-neutral-500">
                  {activityData.items.map((a) => (
                    <li key={a.id}>
                      <span className="text-neutral-400">{formatDateTime(a.createdAt)}</span> —{" "}
                      <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                        {a.user?.firstName || a.user?.email || "System"}
                      </span>{" "}
                      {a.action}
                      {a.field && <span className="text-neutral-400"> ({a.field})</span>}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-neutral-400">No activity recorded</p>
              )}
            </div>
          </div>
        ) : (
          <PageLoader />
        )}
      </Modal>

      {/* Assignee Picker Modal */}
      <Modal open={detailAssignModal} onClose={() => setDetailAssignModal(false)} title="Assign Contributor" size="sm">
        <div className="space-y-1.5 max-h-64 overflow-y-auto">
          {availableAssignees.length === 0 && (
            <p className="text-sm text-neutral-400 text-center py-4">All organization members are assigned</p>
          )}
          {availableAssignees.map((m) => (
            <button
              key={m.userId}
              onClick={() => {
                handleAddAssigneeToTask(m.userId);
                setDetailAssignModal(false);
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors text-left"
            >
              <UserAvatar user={m.user} />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-neutral-900 dark:text-white truncate">
                  {m.user?.firstName ? `${m.user.firstName} ${m.user.lastName || ""}` : m.user?.email || "Unknown"}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">{m.user?.email}</p>
              </div>
            </button>
          ))}
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => {
          if (deleteConfirm)
            deleteTask.mutate(deleteConfirm.id, {
              onSuccess: () => {
                setDeleteConfirm(null);
                if (detailTaskId === deleteConfirm.id) setDetailTaskId(null);
              },
            });
        }}
        title="Delete Sprint Task"
        description={`Are you sure you want to delete "${deleteConfirm?.title}"? This action cannot be undone.`}
        confirmLabel="Delete Task"
        isLoading={deleteTask.isPending}
      />
    </div>
  );
}
