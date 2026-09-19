import { useState, useCallback, useMemo, useRef } from "react";
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
import { Button } from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import PageLoader from "@/components/ui/PageLoader";
import SearchInput from "@/components/ui/SearchInput";
import { Select } from "@/components/ui/Select";
import Pagination from "@/components/ui/Pagination";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import type { Task, User } from "@/types/domain";

const PRIORITY_ICONS: Record<string, LucideIcon> = { HIGH: ArrowUp, MEDIUM: ArrowDown, LOW: ArrowDown };
const PRIORITY_COLORS: Record<string, string> = {
  HIGH: "text-red-500",
  MEDIUM: "text-yellow-500",
  LOW: "text-gray-400",
};
const PRIORITY_BG: Record<string, string> = {
  HIGH: "bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/20",
  MEDIUM: "bg-yellow-50 dark:bg-yellow-900/10 border-yellow-100 dark:border-yellow-900/20",
  LOW: "bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800",
};

interface StatusConfig {
  label: string;
  icon: LucideIcon;
  color: string;
  bg: string;
  border: string;
  iconBg: string;
}

const STATUS_CONFIG: Record<string, StatusConfig> = {
  TODO: { label: "To Do", icon: Circle, color: "text-gray-400", bg: "bg-gray-50 dark:bg-gray-800/50", border: "border-gray-100 dark:border-gray-800", iconBg: "text-gray-400" },
  IN_PROGRESS: { label: "In Progress", icon: Clock, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/10", border: "border-blue-100 dark:border-blue-900/20", iconBg: "text-blue-500" },
  IN_REVIEW: { label: "In Review", icon: AlertCircle, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-900/10", border: "border-purple-100 dark:border-purple-900/20", iconBg: "text-purple-500" },
  BLOCKED: { label: "Blocked", icon: AlertCircle, color: "text-red-500", bg: "bg-red-50 dark:bg-red-900/10", border: "border-red-100 dark:border-red-900/20", iconBg: "text-red-500" },
  DONE: { label: "Done", icon: CheckCircle2, color: "text-green-500", bg: "bg-green-50 dark:bg-green-900/10", border: "border-green-100 dark:border-green-900/20", iconBg: "text-green-500" },
  CANCELLED: { label: "Cancelled", icon: Ban, color: "text-gray-400", bg: "bg-gray-50 dark:bg-gray-800/50", border: "border-gray-100 dark:border-gray-800", iconBg: "text-gray-400" },
};

const STATUSES = ["TODO", "IN_PROGRESS", "IN_REVIEW", "BLOCKED", "DONE", "CANCELLED"];
const PRIORITIES = ["LOW", "MEDIUM", "HIGH"];

type ViewMode = "table" | "kanban" | "list";

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
      className={`${s} rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center font-medium text-primary-700 dark:text-primary-400 shrink-0`}
      title={user?.firstName ? `${user.firstName} ${user.lastName || ""}` : user?.email}
    >
      {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || "?"}
    </div>
  );
}

function AssigneeAvatars({ assignees, max = 3 }: { assignees?: { userId: string; user?: User }[]; max?: number }) {
  const visible = assignees?.slice(0, max) || [];
  const remaining = (assignees?.length || 0) - max;
  if (!visible.length) return <span className="text-xs text-gray-400">—</span>;
  return (
    <div className="flex items-center -space-x-1.5">
      {visible.map((a) => (
        <UserAvatar key={a.userId} user={a.user} />
      ))}
      {remaining > 0 && (
        <div className="h-6 w-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[10px] font-medium text-gray-500 -ml-1.5">
          +{remaining}
        </div>
      )}
    </div>
  );
}

function PriorityBadge({ priority }: { priority?: string }) {
  const Icon = priority ? PRIORITY_ICONS[priority] : undefined;
  const label: Record<string, string> = { HIGH: "High", MEDIUM: "Medium", LOW: "Low" };
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium ${
        priority ? PRIORITY_COLORS[priority] : ""
      }`}
    >
      {Icon && <Icon className="h-3 w-3" />}
      {priority ? label[priority] : ""}
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
  const currentTenant = useTenantStore((s) => s.currentTenant);
  const { user: currentUser } = useAuthStore();
  const { data: projectsData } = useProjects({ limit: 100 });

  const projects = projectsData?.projects ?? [];
  const [selectedProjectId, setSelectedProjectId] = useState("");
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

  const [detailTaskId, setDetailTaskId] = useState<string | null>(null);
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

  const handleProjectChange = useCallback((val: string) => {
    setSelectedProjectId(val);
    setPage(1);
    setDetailTaskId(null);
  }, []);

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
      TODO: [], IN_PROGRESS: [], IN_REVIEW: [], BLOCKED: [], DONE: [], CANCELLED: [],
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

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tasks</h1>
        <div className="flex items-center gap-3">
          <Select value={selectedProjectId} onChange={(e) => handleProjectChange(e.target.value)}>
            <option value="">Select project…</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
          <Button size="lg" className="flex-shrink-0" onClick={() => setCreateModalOpen(true)} disabled={!selectedProjectId}>
            <Plus className="h-4 w-4 mr-1.5" /> New Task
          </Button>
        </div>
      </div>

      {!selectedProjectId ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-12 text-center">
          <Columns3 className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Select a project to view and manage tasks
          </p>
        </div>
      ) : (
        <>
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <SearchInput value={search} onChange={setSearch} placeholder="Search tasks…" className="w-56" />
              <Select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
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
              >
                <option value="">All priorities</option>
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p.charAt(0) + p.slice(1).toLowerCase()}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              {(
                [
                  { key: "table", icon: Table2 },
                  { key: "kanban", icon: Columns3 },
                  { key: "list", icon: List },
                ] as { key: ViewMode; icon: LucideIcon }[]
              ).map(({ key, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setViewMode(key)}
                  className={`p-2 transition-colors ${
                    viewMode === key
                      ? "bg-primary-600 text-white"
                      : "text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>

          {tasksLoading ? (
            <PageLoader />
          ) : tasks.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-12 text-center">
              <div className="h-12 w-12 mx-auto rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
                <List className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">No tasks found</p>
              <Button size="sm" onClick={() => setCreateModalOpen(true)}>
                <Plus className="h-4 w-4 mr-1" /> Create first task
              </Button>
            </div>
          ) : (
            <>
              {viewMode === "table" && (
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                        <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Task</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Status</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Priority</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Assignees</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Due Date</th>
                        <th className="text-right px-4 py-3 font-medium text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {tasks.map((task) => (
                        <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                          <td className="px-4 py-3">
                            <button
                              onClick={() => setDetailTaskId(task.id)}
                              className="text-sm font-medium text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 text-left"
                            >
                              {task.title}
                            </button>
                            {task.description && (
                              <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{task.description}</p>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <Select
                              value={task.status}
                              onChange={(e) => handleQuickUpdate(task.id, "status", e.target.value)}
                              className={`text-xs font-medium rounded-lg px-2 py-1 border ${
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
                          <td className="px-4 py-3">
                            <Select
                              value={task.priority}
                              onChange={(e) => handleQuickUpdate(task.id, "priority", e.target.value)}
                              className={`text-xs font-medium rounded-lg px-2 py-1 border ${
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
                          <td className="px-4 py-3">
                            <AssigneeAvatars assignees={task.assignees} />
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-500">
                            {task.dueDate ? (
                              <span className="flex items-center gap-1">
                                <CalendarDays className="h-3 w-3" />
                                {formatDate(task.dueDate)}
                              </span>
                            ) : (
                              "—"
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => setDeleteConfirm(task)}
                              className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800">
                    <Pagination page={page} totalPages={pagination?.totalPages || 1} onChange={setPage} />
                  </div>
                </div>
              )}

              {viewMode === "kanban" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[500px]">
                  {STATUSES.map((status) => {
                    const cfg = STATUS_CONFIG[status];
                    const Icon = cfg.icon;
                    const items = kanbanTasks[status] ?? [];
                    return (
                      <div
                        key={status}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, status)}
                        className={`rounded-xl border ${cfg.bg} ${cfg.border} flex flex-col`}
                      >
                        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                          <Icon className={`h-4 w-4 ${cfg.iconBg}`} />
                          <span className={`text-sm font-medium ${cfg.color}`}>{cfg.label}</span>
                          <span className="ml-auto text-xs font-semibold text-gray-400 bg-white dark:bg-gray-800 px-2 py-0.5 rounded-full">
                            {items.length}
                          </span>
                        </div>
                        <div className="p-2 space-y-2 flex-1 overflow-y-auto max-h-[600px]">
                          {items.length === 0 && (
                            <div className="text-center py-8 text-xs text-gray-400">Drop tasks here</div>
                          )}
                          {items.map((task) => (
                            <div
                              key={task.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, task.id, task.status ?? "")}
                              onClick={() => setDetailTaskId(task.id)}
                              className="bg-white dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800 p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer active:opacity-60"
                            >
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <p className="text-sm font-medium text-gray-900 dark:text-white leading-snug line-clamp-2 flex-1">
                                  {task.title}
                                </p>
                                <span className="shrink-0">
                                  <PriorityBadge priority={task.priority} />
                                </span>
                              </div>
                              {task.description && (
                                <p className="text-xs text-gray-400 mb-2 line-clamp-2">{task.description}</p>
                              )}
                              <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50 dark:border-gray-800">
                                <div className="flex items-center gap-1.5">
                                  <AssigneeAvatars assignees={task.assignees} max={2} />
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                  {task.dueDate && (
                                    <span className="flex items-center gap-1">
                                      <CalendarDays className="h-3 w-3" />
                                      {formatDate(task.dueDate)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {viewMode === "list" && (
                <div className="space-y-2">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 px-4 py-3 flex items-center gap-4 hover:shadow-sm transition-shadow"
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
                        className={`shrink-0 ${
                          task.status === "DONE"
                            ? "text-green-500"
                            : "text-gray-300 dark:text-gray-600 hover:text-gray-400"
                        }`}
                      >
                        <CheckCircle2 className="h-5 w-5" />
                      </button>
                      <div
                        className={`flex-1 min-w-0 cursor-pointer ${
                          task.status === "DONE" ? "line-through text-gray-400" : ""
                        }`}
                        onClick={() => setDetailTaskId(task.id)}
                      >
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {task.title}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <PriorityBadge priority={task.priority} />
                        <AssigneeAvatars assignees={task.assignees} max={2} />
                        {task.dueDate && (
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <CalendarDays className="h-3 w-3" />
                            {formatDate(task.dueDate)}
                          </span>
                        )}
                        <button
                          onClick={() => setDeleteConfirm(task)}
                          className="p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <Pagination page={page} totalPages={pagination?.totalPages || 1} onChange={setPage} />
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* ── Create Task Modal ──────────────────────────────────────────────────── */}
      <Modal open={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Create Task" size="lg">
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
            <Input
              value={createForm.title}
              onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
              placeholder="Enter task title"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={createForm.description}
              onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
              rows={3}
              placeholder="Optional description…"
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none transition-colors"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Priority
              </label>
              <Select
                value={createForm.priority}
                onChange={(e) => setCreateForm({ ...createForm, priority: e.target.value })}
                className="w-full h-10 px-3 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={createForm.dueDate}
                onChange={(e) => setCreateForm({ ...createForm, dueDate: e.target.value })}
                className="w-full h-10 px-3 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
              />
            </div>
          </div>

          {/* Departments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Departments
            </label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {(departmentsData?.departments ?? []).length === 0 && (
                <p className="text-xs text-gray-400">No departments yet</p>
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
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                      active
                        ? "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border-primary-300 dark:border-primary-700"
                        : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Assignees
            </label>
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
              {projectMembers.length === 0 && (
                <p className="text-xs text-gray-400">No members available</p>
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
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                      active
                        ? "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border-primary-300 dark:border-primary-700"
                        : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                  >
                    {name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={createTask.isPending}>
              Create Task
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Task Detail Panel ──────────────────────────────────────────────────── */}
      <Modal open={!!detailTaskId} onClose={() => setDetailTaskId(null)} title="Task Details" size="xl">
        {detailTask ? (
          <div className="space-y-5">
            {/* Title & Quick Actions */}
            <div>
              <input
                defaultValue={detailTask.title}
                onBlur={(e) => {
                  const val = e.target.value.trim();
                  if (val && val !== detailTask.title) {
                    handleQuickUpdate(detailTask.id, "title", val);
                  }
                }}
                className="w-full text-lg font-semibold bg-transparent border-none outline-none text-gray-900 dark:text-white px-0"
              />
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-400">Status:</label>
                  <Select
                    value={detailTask.status}
                    onChange={(e) => handleQuickUpdate(detailTask.id, "status", e.target.value)}
                    className={`text-xs font-medium rounded-lg px-2 py-1 border ${
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
                  <label className="text-xs text-gray-400">Priority:</label>
                  <Select
                    value={detailTask.priority}
                    onChange={(e) => handleQuickUpdate(detailTask.id, "priority", e.target.value)}
                    className={`text-xs font-medium rounded-lg px-2 py-1 border ${
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
                  <label className="text-xs text-gray-400">Due:</label>
                  <input
                    type="date"
                    value={detailTask.dueDate ? detailTask.dueDate.split("T")[0] : ""}
                    onChange={(e) => {
                      const val = e.target.value ? new Date(e.target.value).toISOString() : null;
                      handleQuickUpdate(detailTask.id, "dueDate", val);
                    }}
                    className="text-xs rounded-lg px-2 py-1 border border-gray-200 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Description</label>
              <textarea
                defaultValue={detailTask.description || ""}
                onBlur={(e) => {
                  const val = e.target.value.trim() || undefined;
                  if (val !== detailTask.description) {
                    handleQuickUpdate(detailTask.id, "description", val);
                  }
                }}
                rows={3}
                placeholder="Add a description…"
                className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none transition-colors"
              />
            </div>

            {/* Assignees */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-gray-400">Assignees</label>
                <Button size="sm" variant="ghost" onClick={() => setDetailAssignModal(true)}>
                  <UserPlus className="h-3.5 w-3.5 mr-1" /> Assign
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {detailTask.assignees?.length === 0 && <p className="text-xs text-gray-400">No assignees</p>}
                {detailTask.assignees?.map((a) => (
                  <div
                    key={a.userId}
                    className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 rounded-full pl-1 pr-1.5 py-1 text-xs"
                  >
                    <UserAvatar user={a.user} />
                    <span className="text-gray-700 dark:text-gray-300">
                      {a.user?.firstName ? `${a.user.firstName} ${a.user.lastName || ""}` : a.user?.email || "Unknown"}
                    </span>
                    <button
                      onClick={() => removeAssignee.mutate({ userId: a.userId })}
                      className="ml-0.5 p-0.5 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-500 transition-colors"
                      aria-label="Remove assignee"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline Info */}
            <div className="text-xs text-gray-400 space-y-1 border-t border-gray-100 dark:border-gray-800 pt-3">
              <div className="flex items-center gap-4">
                <span>Created {formatDateTime(detailTask.createdAt)}</span>
                {detailTask.createdBy && (
                  <span>
                    by {detailTask.createdBy.firstName || detailTask.createdBy.email}
                  </span>
                )}
              </div>
              {detailTask.completedAt && <span>Completed {formatDateTime(detailTask.completedAt)}</span>}
            </div>

            {/* Comments */}
            <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-gray-400" />
                Comments ({comments?.length || 0})
              </h4>
              <form onSubmit={handleAddComment} className="flex gap-2 mb-2">
                <input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment…"
                  className="flex-1 h-9 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-3 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={!commentText.trim()}
                  isLoading={addComment.isPending}
                >
                  Send
                </Button>
              </form>
              <div className="flex items-center gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setShowMentionList((v) => !v)}
                  className="text-xs text-primary-500 hover:underline"
                >
                  Mention a member
                </button>
                {commentMentions.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {commentMentions.map((id) => {
                      const m = projectMembers.find((p) => p.user?.id === id);
                      return (
                        <span
                          key={id}
                          className="text-[10px] bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded px-1.5 py-0.5 flex items-center gap-1"
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
                <div className="mb-3 max-h-32 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-2 space-y-1">
                  {projectMembers.map((m) => (
                    <label key={m.user?.id} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300 cursor-pointer">
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
                      <span>{m.user?.firstName ? `${m.user.firstName} ${m.user.lastName || ""}` : m.user?.email || "Unknown"}</span>
                    </label>
                  ))}
                </div>
              )}
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {comments?.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-4">No comments yet</p>
                )}
                {comments?.map((c) => {
                  const isAuthor = c.user?.id === currentUser?.id;
                  const isEditing = editingComment?.id === c.id;
                  return (
                    <div key={c.id} className="flex gap-2.5">
                      <UserAvatar user={c.user} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-gray-900 dark:text-white">
                            {c.user?.firstName ? `${c.user.firstName} ${c.user.lastName || ""}` : c.user?.email || "Unknown"}
                          </span>
                          <span className="text-[10px] text-gray-400">{formatDateTime(c.createdAt)}</span>
                          {c.editedAt && <span className="text-[10px] text-gray-400">(edited)</span>}
                          {isAuthor && !isEditing && (
                            <button
                              onClick={() => setEditingComment({ id: c.id, text: c.comment })}
                              className="ml-auto p-0.5 rounded text-gray-400 hover:text-primary-500 transition-colors"
                              aria-label="Edit comment"
                            >
                              <Pencil className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                        {isEditing ? (
                          <div className="mt-1 flex gap-2">
                            <input
                              autoFocus
                              value={editingComment?.text ?? ""}
                              onChange={(e) => setEditingComment({ id: c.id, text: e.target.value })}
                              className="flex-1 h-8 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-2 text-sm"
                            />
                            <Button size="sm" onClick={() => handleUpdateComment(c.id)}>Save</Button>
                            <Button size="sm" variant="ghost" onClick={() => setEditingComment(null)}>Cancel</Button>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5 whitespace-pre-wrap">{c.comment}</p>
                        )}
                        {c.mentions && c.mentions.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {c.mentions.map((m) => (
                              <span
                                key={m.userId}
                                className="text-[10px] bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded px-1.5 py-0.5"
                              >
                                @{m.user?.firstName || m.user?.email || "user"}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Time Tracking */}
            <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Timer className="h-4 w-4 text-gray-400" /> Time Tracking
              </h4>
              {(() => {
                const running = timeData?.items?.find((e) => !e.endedAt);
                return (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {running ? (
                        <Button size="sm" variant="ghost" onClick={() => stopTimer.mutate(running.id)}>
                          <Square className="h-3.5 w-3.5 mr-1" /> Stop
                        </Button>
                      ) : (
                        <Button size="sm" onClick={() => startTimer.mutate({})} disabled={startTimer.isPending}>
                          <Play className="h-3.5 w-3.5 mr-1" /> Start
                        </Button>
                      )}
                      <span className="text-xs text-gray-400">{running ? "Timer running" : "No active timer"}</span>
                    </div>
                    {timeData?.items?.length ? (
                      <ul className="space-y-1 max-h-28 overflow-y-auto">
                        {timeData.items.map((e) => (
                          <li key={e.id} className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
                            <span>
                              {formatDateTime(e.startedAt)} → {e.endedAt ? formatDateTime(e.endedAt) : "running"}
                            </span>
                            <span className="flex items-center gap-2">
                              <span className="text-gray-400">{e.durationMinutes ? `${e.durationMinutes}m` : ""}</span>
                              {e.endedAt && (
                                <button
                                  onClick={() => deleteTimeEntry.mutate(e.id)}
                                  className="text-gray-400 hover:text-red-500"
                                  aria-label="Delete time entry"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              )}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-gray-400">No time logged</p>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Activity */}
            <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <History className="h-4 w-4 text-gray-400" /> Activity
              </h4>
              {activityData?.items?.length ? (
                <ul className="space-y-1.5 max-h-40 overflow-y-auto">
                  {activityData.items.map((a) => (
                    <li key={a.id} className="text-xs text-gray-600 dark:text-gray-300">
                      <span className="text-gray-400">{formatDateTime(a.createdAt)}</span>{" "}
                      <span className="font-medium">{a.user?.firstName || a.user?.email || "System"}</span>{" "}
                      {a.action}
                      {a.field && <span className="text-gray-400"> ({a.field})</span>}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-gray-400">No activity recorded</p>
              )}
            </div>
          </div>
        ) : (
          <PageLoader />
        )}
      </Modal>

      {/* Assignee Picker Modal */}
      <Modal open={detailAssignModal} onClose={() => setDetailAssignModal(false)} title="Add Assignee" size="sm">
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {availableAssignees.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">All members are already assigned</p>
          )}
          {availableAssignees.map((m) => (
            <button
              key={m.userId}
              onClick={() => {
                handleAddAssigneeToTask(m.userId);
                setDetailAssignModal(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
            >
              <UserAvatar user={m.user} />
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {m.user?.firstName ? `${m.user.firstName} ${m.user.lastName || ""}` : m.user?.email || "Unknown"}
                </p>
                <p className="text-xs text-gray-400 truncate">{m.user?.email}</p>
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
        title="Delete Task"
        description={`Are you sure you want to delete "${deleteConfirm?.title}"? This action cannot be undone.`}
        confirmLabel="Delete Task"
        isLoading={deleteTask.isPending}
      />
    </div>
  );
}
