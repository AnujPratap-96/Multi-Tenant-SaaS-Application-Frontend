import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Play,
  Square,
  Clock,
  CheckCircle2,
  Circle,
  AlertCircle,
  Ban,
  Calendar,
  User as UserIcon,
  UserPlus,
  Trash2,
  X,
  MessageSquare,
  Send,
  History,
  FolderKanban,
  Timer,
  Plus,
  Tag,
  Pencil,
  Check,
  type LucideIcon,
} from "lucide-react";
import {
  useTask,
  useUpdateTask,
  useDeleteTask,
  useTaskComments,
  useAddComment,
  useUpdateComment,
  useDeleteComment,
  useTaskActivity,
  useTimeEntries,
  useStartTimer,
  useStopTimer,
  useDeleteTimeEntry,
  useAddAssignee,
  useRemoveAssignee,
} from "@/features/tasks/tasksQueries";
import { useProject } from "@/features/projects/projectsQueries";
import { useMembers } from "@/features/tenant/tenantQueries";
import { useTenantStore } from "@/features/tenant/tenantStore";
import { useAuthStore } from "@/features/auth/authStore";
import { GlassCard } from "@/components/glass/GlassCard";
import { GlassButton } from "@/components/glass/GlassButton";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import PageLoader from "@/components/ui/PageLoader";

interface StageConfig {
  key: string;
  label: string;
  icon: LucideIcon;
  color: string;
  badge: string;
}

const STAGES: StageConfig[] = [
  { key: "TODO", label: "To Do", icon: Circle, color: "text-neutral-500", badge: "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300" },
  { key: "IN_PROGRESS", label: "In Progress", icon: Clock, color: "text-blue-600 dark:text-blue-400", badge: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20" },
  { key: "IN_REVIEW", label: "In Review", icon: AlertCircle, color: "text-indigo-600 dark:text-indigo-400", badge: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20" },
  { key: "DONE", label: "Done", icon: CheckCircle2, color: "text-emerald-600 dark:text-emerald-400", badge: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20" },
];

const EXTRA_STATUSES = ["BLOCKED", "CANCELLED"];

const PRIORITY_META: Record<string, { label: string; color: string; bg: string }> = {
  HIGH: { label: "High Priority", color: "text-rose-700 dark:text-rose-400", bg: "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30" },
  MEDIUM: { label: "Medium Priority", color: "text-amber-700 dark:text-amber-400", bg: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30" },
  LOW: { label: "Low Priority", color: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30" },
};

function formatDuration(totalMinutes?: number | null): string {
  if (!totalMinutes || totalMinutes <= 0) return "0m";
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

function formatStopwatch(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

function formatDate(d?: string | null): string {
  if (!d) return "—";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatDateTime(d?: string | null): string {
  if (!d) return "—";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function timeAgo(dateString?: string | null): string {
  if (!dateString) return "";
  const now = new Date();
  const date = new Date(dateString);
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diffSec < 60) return "just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 30) return `${diffDay}d ago`;
  return formatDate(dateString);
}

export default function TaskDetailPage() {
  const { id: taskId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const currentTenant = useTenantStore((s) => s.currentTenant);

  // Queries
  const { data: task, isLoading: taskLoading } = useTask(taskId);
  const { data: project } = useProject(task?.projectId);
  const { data: comments, isLoading: commentsLoading } = useTaskComments(taskId);
  const { data: timeEntriesData } = useTimeEntries(taskId, { limit: 100 });
  const { data: activityData, isLoading: activityLoading } = useTaskActivity(taskId, { limit: 50 });
  const { data: membersData } = useMembers(currentTenant?.id, { limit: 100 });

  const projectMembers = useMemo(() => membersData?.members ?? [], [membersData]);
  const timeEntries = useMemo(() => timeEntriesData?.items ?? [], [timeEntriesData]);
  const activities = useMemo(() => activityData?.items ?? [], [activityData]);

  // Active running timer entry
  const activeEntry = useMemo(() => timeEntries.find((e) => !e.endedAt), [timeEntries]);

  // Live stopwatch counter
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!activeEntry) {
      setElapsedSeconds(0);
      return;
    }
    const startMs = new Date(activeEntry.startedAt).getTime();
    const update = () => {
      const nowMs = Date.now();
      setElapsedSeconds(Math.max(0, Math.floor((nowMs - startMs) / 1000)));
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [activeEntry]);

  // Total recorded minutes
  const totalLoggedMinutes = useMemo(() => {
    return timeEntries.reduce((sum, entry) => sum + (entry.durationMinutes || 0), 0);
  }, [timeEntries]);

  // Mutations
  const updateTask = useUpdateTask(taskId);
  const deleteTask = useDeleteTask(task?.projectId);
  const startTimer = useStartTimer(taskId);
  const stopTimer = useStopTimer(taskId);
  const deleteTimeEntry = useDeleteTimeEntry(taskId);
  const addComment = useAddComment(taskId);
  const updateComment = useUpdateComment(taskId);
  const deleteComment = useDeleteComment(taskId);
  const addAssignee = useAddAssignee(taskId);
  const removeAssignee = useRemoveAssignee(taskId);

  // Active Tabs: "overview" | "timesheet" | "discussion" | "activity"
  const [activeTab, setActiveTab] = useState<"overview" | "timesheet" | "discussion" | "activity">("overview");

  // Inline editing states
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [descDraft, setDescDraft] = useState("");

  // Comment composer state
  const [newCommentText, setNewCommentText] = useState("");
  const [commentMentions, setCommentMentions] = useState<string[]>([]);
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState("");

  // Modals
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [manualTimeModalOpen, setManualTimeModalOpen] = useState(false);
  const [manualTimeMinutes, setManualTimeMinutes] = useState(60);
  const [manualTimeDesc, setManualTimeDesc] = useState("");
  const [manualTimeDate, setManualTimeDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // Sync drafts when task loads
  useEffect(() => {
    if (task) {
      setTitleDraft(task.title || "");
      setDescDraft(task.description || "");
    }
  }, [task]);

  // Timer actions
  const handleStartTimer = () => {
    startTimer.mutate({ startedAt: new Date().toISOString() });
  };

  const handleStopTimer = () => {
    if (!activeEntry) return;
    stopTimer.mutate(activeEntry.id);
  };

  const handleSaveTitle = () => {
    if (!titleDraft.trim() || titleDraft.trim() === task?.title) {
      setIsEditingTitle(false);
      return;
    }
    updateTask.mutate(
      { title: titleDraft.trim(), id: taskId, projectId: task?.projectId },
      { onSuccess: () => setIsEditingTitle(false) }
    );
  };

  const handleSaveDesc = () => {
    updateTask.mutate(
      { description: descDraft.trim() || undefined, id: taskId, projectId: task?.projectId },
      { onSuccess: () => setIsEditingDesc(false) }
    );
  };

  const handleStageClick = (stageKey: string) => {
    if (stageKey === task?.status) return;
    updateTask.mutate({ status: stageKey, id: taskId, projectId: task?.projectId });
  };

  const handleCreateComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    addComment.mutate(
      {
        comment: newCommentText.trim(),
        mentionIds: commentMentions.length ? commentMentions : undefined,
      },
      {
        onSuccess: () => {
          setNewCommentText("");
          setCommentMentions([]);
          setShowMentionDropdown(false);
        },
      }
    );
  };

  const handleSaveEditedComment = (commentId: string) => {
    if (!editingCommentText.trim()) return;
    updateComment.mutate(
      { commentId, comment: editingCommentText.trim() },
      {
        onSuccess: () => {
          setEditingCommentId(null);
          setEditingCommentText("");
        },
      }
    );
  };

  const handleAddManualTime = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualTimeMinutes <= 0) return;
    const start = new Date(manualTimeDate);
    start.setHours(9, 0, 0, 0);

    startTimer.mutate(
      {
        startedAt: start.toISOString(),
        description: manualTimeDesc.trim() || "Manual sprint work log",
      },
      {
        onSuccess: (entry: any) => {
          setManualTimeModalOpen(false);
          setManualTimeDesc("");
          if (entry?.id) {
            stopTimer.mutate(entry.id);
          }
        },
      }
    );
  };

  if (taskLoading) {
    return (
      <div className="py-20 flex justify-center">
        <PageLoader />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">Task Not Found</h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
          The task you are searching for does not exist or you do not have permission to view it.
        </p>
        <GlassButton variant="primary" onClick={() => navigate("/dashboard/tasks")}>
          Back to Tasks
        </GlassButton>
      </div>
    );
  }

  const isOverdue =
    task.dueDate &&
    task.status !== "DONE" &&
    task.status !== "CANCELLED" &&
    new Date(task.dueDate).getTime() < Date.now();

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* ── Top Navigation & Breadcrumb ─────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 flex-wrap">
          <Link
            to={`/dashboard/tasks?projectId=${task.projectId}`}
            className="inline-flex items-center gap-1.5 font-medium hover:text-brand-600 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Board
          </Link>
          <span className="opacity-40">/</span>
          {project && (
            <>
              <Link
                to={`/dashboard/projects/${project.id}`}
                className="inline-flex items-center gap-1 hover:text-brand-600 dark:hover:text-white transition-colors font-medium text-neutral-600 dark:text-neutral-300"
              >
                <FolderKanban className="h-3.5 w-3.5" />
                {project.name}
              </Link>
              <span className="opacity-40">/</span>
            </>
          )}
          <span className="font-semibold text-neutral-900 dark:text-white truncate max-w-[200px] sm:max-w-xs">
            {task.title}
          </span>
        </div>

        {/* Webkul ERP Start / Stop Timer Action Bar */}
        <div className="flex items-center gap-3">
          {activeEntry ? (
            <div className="flex items-center gap-2.5 bg-rose-500/10 dark:bg-rose-950/30 border border-rose-500/30 px-3.5 py-1.5 rounded-xl shadow-xs">
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                </span>
                <span className="font-mono text-xs font-bold text-rose-700 dark:text-rose-400 tracking-wider">
                  {formatStopwatch(elapsedSeconds)}
                </span>
              </div>
              <button
                onClick={handleStopTimer}
                disabled={stopTimer.isPending}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-colors cursor-pointer"
                title="Stop running timer and record session"
              >
                <Square className="h-3.5 w-3.5 fill-current" />
                Stop Timer
              </button>
            </div>
          ) : (
            <button
              onClick={handleStartTimer}
              disabled={startTimer.isPending}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md shadow-emerald-500/15 transition-all cursor-pointer hover:scale-[1.02]"
              title="Start recording work on this task"
            >
              <Play className="h-4 w-4 fill-current" />
              Start Timer
            </button>
          )}

          <GlassButton variant="ghost" size="sm" onClick={() => setManualTimeModalOpen(true)}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Log Time
          </GlassButton>
        </div>
      </div>

      {/* ── Main Task Header Card ─────────────────────────────────────────── */}
      <GlassCard className="p-5 sm:p-6 space-y-5 border-neutral-200/80 dark:border-white/10">
        {/* Title and Badges */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2 flex-1 min-w-0">
            {isEditingTitle ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={titleDraft}
                  onChange={(e) => setTitleDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveTitle();
                    if (e.key === "Escape") setIsEditingTitle(false);
                  }}
                  autoFocus
                  className="w-full text-xl sm:text-2xl font-bold bg-white dark:bg-[#0e1626] border border-brand-500 rounded-xl px-3 py-1.5 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <button
                  onClick={handleSaveTitle}
                  className="p-2 rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition"
                  title="Save title"
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setIsEditingTitle(false)}
                  className="p-2 rounded-lg bg-neutral-200 dark:bg-white/10 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-300 transition"
                  title="Cancel"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 group">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-white tracking-tight leading-tight break-words">
                  {task.title}
                </h1>
                <button
                  onClick={() => setIsEditingTitle(true)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-neutral-100 dark:hover:bg-white/10 text-neutral-400 hover:text-neutral-700 dark:hover:text-white transition-opacity"
                  title="Edit task title"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Quick summary line */}
            <div className="flex items-center gap-3 flex-wrap text-xs text-neutral-500 dark:text-neutral-400 pt-1">
              <span className={`px-2.5 py-0.5 rounded-full font-bold border ${PRIORITY_META[task.priority || "MEDIUM"]?.bg}`}>
                {PRIORITY_META[task.priority || "MEDIUM"]?.label}
              </span>

              {task.dueDate && (
                <span
                  className={`inline-flex items-center gap-1 font-medium px-2.5 py-0.5 rounded-full border ${
                    isOverdue
                      ? "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20"
                      : "bg-neutral-100 dark:bg-white/5 border-neutral-200 dark:border-white/10"
                  }`}
                >
                  <Calendar className="h-3.5 w-3.5" />
                  Due: {formatDate(task.dueDate)} {isOverdue && "(Overdue)"}
                </span>
              )}

              <span className="inline-flex items-center gap-1 font-medium px-2.5 py-0.5 rounded-full bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10">
                <Timer className="h-3.5 w-3.5 text-brand-500" />
                Logged: {formatDuration(totalLoggedMinutes)}
              </span>
            </div>
          </div>
        </div>

        {/* ── Webkul / Odoo Stage Pipeline Workflow Bar ───────────────── */}
        <div className="pt-3 border-t border-neutral-200/60 dark:border-white/5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">
            Workflow Stage
          </div>
          <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
            {STAGES.map((s) => {
              const active = task.status === s.key;
              const Icon = s.icon;
              return (
                <button
                  key={s.key}
                  onClick={() => handleStageClick(s.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    active
                      ? "bg-brand-600 text-white shadow-sm ring-2 ring-brand-500/30"
                      : "bg-neutral-100 hover:bg-neutral-200/80 text-neutral-700 dark:bg-white/5 dark:hover:bg-white/10 dark:text-neutral-300"
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${active ? "text-white" : s.color}`} />
                  <span>{s.label}</span>
                </button>
              );
            })}

            {/* Blocked and Cancelled extra status toggles */}
            {EXTRA_STATUSES.map((st) => {
              const active = task.status === st;
              return (
                <button
                  key={st}
                  onClick={() => handleStageClick(st)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    active
                      ? st === "BLOCKED"
                        ? "bg-rose-600 text-white shadow-sm"
                        : "bg-neutral-600 text-white shadow-sm"
                      : "bg-neutral-100 hover:bg-neutral-200/80 text-neutral-500 dark:bg-white/5 dark:hover:bg-white/10 dark:text-neutral-400"
                  }`}
                >
                  {st === "BLOCKED" ? <AlertCircle className="h-3.5 w-3.5" /> : <Ban className="h-3.5 w-3.5" />}
                  <span>{st.charAt(0) + st.slice(1).toLowerCase()}</span>
                </button>
              );
            })}
          </div>
        </div>
      </GlassCard>

      {/* ── Main Two-Column Layout ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Tabs & Deep View */}
        <div className="lg:col-span-8 space-y-6">
          {/* Tabs header */}
          <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-white/10 pb-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 ${
                activeTab === "overview"
                  ? "bg-brand-500/10 text-brand-600 dark:text-accent-cyan border border-brand-500/20"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              <Tag className="h-4 w-4" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab("timesheet")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 ${
                activeTab === "timesheet"
                  ? "bg-brand-500/10 text-brand-600 dark:text-accent-cyan border border-brand-500/20"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              <Timer className="h-4 w-4" />
              Timesheets
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-neutral-200 dark:bg-white/10 font-bold">
                {timeEntries.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("discussion")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 ${
                activeTab === "discussion"
                  ? "bg-brand-500/10 text-brand-600 dark:text-accent-cyan border border-brand-500/20"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              Discussion & Chatter
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-neutral-200 dark:bg-white/10 font-bold">
                {comments?.length || 0}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("activity")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 ${
                activeTab === "activity"
                  ? "bg-brand-500/10 text-brand-600 dark:text-accent-cyan border border-brand-500/20"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              <History className="h-4 w-4" />
              Activity Log
            </button>
          </div>

          {/* ── TAB 1: OVERVIEW ───────────────────────────────────────────── */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Description Card */}
              <GlassCard className="p-5 sm:p-6 space-y-3 border-neutral-200/80 dark:border-white/10">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300">
                    Description & Acceptance Criteria
                  </h3>
                  {!isEditingDesc && (
                    <button
                      onClick={() => setIsEditingDesc(true)}
                      className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-accent-cyan inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Edit Description
                    </button>
                  )}
                </div>

                {isEditingDesc ? (
                  <div className="space-y-3 pt-2">
                    <textarea
                      rows={5}
                      value={descDraft}
                      onChange={(e) => setDescDraft(e.target.value)}
                      placeholder="Add detailed task context, sprint requirements, or links…"
                      className="w-full rounded-xl border border-brand-500 bg-white dark:bg-[#0e1626] text-neutral-900 dark:text-white p-3.5 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                    <div className="flex justify-end gap-2">
                      <GlassButton size="sm" variant="ghost" onClick={() => setIsEditingDesc(false)}>
                        Cancel
                      </GlassButton>
                      <GlassButton size="sm" variant="primary" onClick={handleSaveDesc} isLoading={updateTask.isPending}>
                        Save Description
                      </GlassButton>
                    </div>
                  </div>
                ) : (
                  <div className="pt-2 text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap">
                    {task.description ? (
                      task.description
                    ) : (
                      <p className="text-neutral-400 italic">
                        No description provided. Click "Edit Description" to add technical details and acceptance criteria.
                      </p>
                    )}
                  </div>
                )}
              </GlassCard>

              {/* Quick Sprint Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <GlassCard className="p-4 border-neutral-200/70 dark:border-white/10">
                  <div className="text-xs text-neutral-500 dark:text-neutral-400 font-medium mb-1">Time Logged</div>
                  <div className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                    <Clock className="h-5 w-5 text-brand-500" />
                    {formatDuration(totalLoggedMinutes)}
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-1">{timeEntries.length} timesheet records</div>
                </GlassCard>

                <GlassCard className="p-4 border-neutral-200/70 dark:border-white/10">
                  <div className="text-xs text-neutral-500 dark:text-neutral-400 font-medium mb-1">Target Due Date</div>
                  <div className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-indigo-500" />
                    {formatDate(task.dueDate)}
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-1">
                    {isOverdue ? (
                      <span className="text-rose-500 font-bold">Past Deadline</span>
                    ) : (
                      "Scheduled deadline"
                    )}
                  </div>
                </GlassCard>

                <GlassCard className="p-4 border-neutral-200/70 dark:border-white/10">
                  <div className="text-xs text-neutral-500 dark:text-neutral-400 font-medium mb-1">Contributors</div>
                  <div className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                    <UserIcon className="h-5 w-5 text-emerald-500" />
                    {task.assignees?.length || 0} Assigned
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-1">
                    {task.assignees?.length ? "Active team members" : "Unassigned"}
                  </div>
                </GlassCard>
              </div>
            </div>
          )}

          {/* ── TAB 2: TIMESHEETS & LOGS (Webkul ERP module) ──────────────── */}
          {activeTab === "timesheet" && (
            <GlassCard className="p-5 sm:p-6 space-y-5 border-neutral-200/80 dark:border-white/10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                    Timesheet & Work Logs
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                    Start/stop tracking entries and manually logged sprint hours for this task.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <GlassButton size="sm" variant="primary" onClick={() => setManualTimeModalOpen(true)}>
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add Time Entry
                  </GlassButton>
                </div>
              </div>

              {/* Total Banner */}
              <div className="p-4 rounded-xl bg-neutral-100/70 dark:bg-white/5 border border-neutral-200/60 dark:border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">Total Time Spent:</span>
                  <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                    {formatDuration(totalLoggedMinutes)}
                  </div>
                </div>
                {activeEntry && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30 text-xs font-bold animate-pulse">
                    <span className="h-2 w-2 rounded-full bg-rose-500" />
                    Timer in progress ({formatStopwatch(elapsedSeconds)})
                  </div>
                )}
              </div>

              {/* Time Entries Table */}
              {timeEntries.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-neutral-300 dark:border-white/10 rounded-xl">
                  <Timer className="h-8 w-8 mx-auto text-neutral-400 mb-2" />
                  <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">No time recorded yet</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    Click "Start Timer" in the top bar or "Add Time Entry" to log hours.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-neutral-200/80 dark:border-white/10">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-neutral-100/60 dark:bg-white/5 text-neutral-600 dark:text-neutral-400 border-b border-neutral-200/80 dark:border-white/10">
                        <th className="px-4 py-3 font-bold">Date & Time</th>
                        <th className="px-4 py-3 font-bold">Description</th>
                        <th className="px-4 py-3 font-bold">Duration</th>
                        <th className="px-4 py-3 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200/60 dark:divide-white/5">
                      {timeEntries.map((entry) => {
                        const isRunning = !entry.endedAt;
                        return (
                          <tr
                            key={entry.id}
                            className={`hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors ${
                              isRunning ? "bg-rose-50/40 dark:bg-rose-950/20" : ""
                            }`}
                          >
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="font-semibold text-neutral-900 dark:text-white">
                                {formatDate(entry.startedAt)}
                              </div>
                              <div className="text-[11px] text-neutral-500">
                                {formatDateTime(entry.startedAt).split(",")[1]?.trim()}
                                {entry.endedAt ? ` – ${formatDateTime(entry.endedAt).split(",")[1]?.trim()}` : " (Running)"}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-neutral-700 dark:text-neutral-300">
                              {entry.description || "Sprint task work"}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              {isRunning ? (
                                <span className="inline-flex items-center gap-1 font-mono font-bold text-xs px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20">
                                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping" />
                                  {formatStopwatch(elapsedSeconds)}
                                </span>
                              ) : (
                                <span className="font-bold text-neutral-900 dark:text-white">
                                  {formatDuration(entry.durationMinutes)}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right whitespace-nowrap">
                              {isRunning ? (
                                <button
                                  onClick={handleStopTimer}
                                  className="px-2.5 py-1 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition-colors"
                                >
                                  Stop
                                </button>
                              ) : (
                                <button
                                  onClick={() => deleteTimeEntry.mutate(entry.id)}
                                  className="p-1 rounded text-neutral-400 hover:text-rose-500 transition-colors"
                                  title="Delete time entry"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </GlassCard>
          )}

          {/* ── TAB 3: DISCUSSION & CHATTER (Webkul Chatter module) ────────── */}
          {activeTab === "discussion" && (
            <GlassCard className="p-5 sm:p-6 space-y-6 border-neutral-200/80 dark:border-white/10">
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                  Discussion & Team Chatter
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Leave comments, share updates, and tag team members with @ mentions.
                </p>
              </div>

              {/* Comment Composer */}
              <form onSubmit={handleCreateComment} className="space-y-3">
                <div className="relative">
                  <textarea
                    rows={3}
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    placeholder="Write a message, share progress, or tag team members…"
                    className="w-full rounded-xl border border-neutral-300 dark:border-white/10 bg-white dark:bg-[#0e1626] text-neutral-900 dark:text-white p-3.5 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all resize-none shadow-xs"
                  />
                </div>

                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowMentionDropdown((v) => !v)}
                      className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      @ Mention Contributor
                    </button>

                    {commentMentions.length > 0 && (
                      <div className="flex flex-wrap gap-1 items-center">
                        {commentMentions.map((id) => {
                          const m = projectMembers.find((p) => p.user?.id === id);
                          return (
                            <span
                              key={id}
                              className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-brand-500/15 text-brand-700 dark:text-accent-cyan flex items-center gap-1"
                            >
                              @{m?.user?.firstName || m?.user?.email || "user"}
                              <button
                                type="button"
                                onClick={() => setCommentMentions((p) => p.filter((x) => x !== id))}
                                className="hover:text-rose-500"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <GlassButton
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={!newCommentText.trim()}
                    isLoading={addComment.isPending}
                  >
                    <Send className="h-3.5 w-3.5 mr-1" /> Post Comment
                  </GlassButton>
                </div>

                {/* Mention picker dropdown */}
                {showMentionDropdown && (
                  <div className="p-2 border border-neutral-200 dark:border-white/10 rounded-xl bg-white dark:bg-[#0e1626] shadow-xl max-h-40 overflow-y-auto space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-2 py-1">
                      Select Member to Tag
                    </div>
                    {projectMembers.map((m) => {
                      const u = m.user;
                      const uid = u?.id || m.userId;
                      const name = u?.firstName ? `${u.firstName} ${u.lastName || ""}`.trim() : u?.email || "Unknown";
                      const isSelected = commentMentions.includes(uid);
                      return (
                        <button
                          key={uid}
                          type="button"
                          onClick={() => {
                            if (!isSelected) {
                              setCommentMentions((p) => [...p, uid]);
                              setNewCommentText((prev) => `${prev} @${name} `);
                            }
                            setShowMentionDropdown(false);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition-colors ${
                            isSelected
                              ? "bg-brand-500/15 text-brand-700 font-bold"
                              : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/10"
                          }`}
                        >
                          <span>{name}</span>
                          <span className="text-[10px] text-neutral-400">{u?.email}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </form>

              {/* Comments Feed */}
              <div className="space-y-4 pt-4 border-t border-neutral-200/60 dark:border-white/5">
                {commentsLoading ? (
                  <div className="py-6 text-center text-sm text-neutral-400">Loading comments…</div>
                ) : !comments || comments.length === 0 ? (
                  <div className="py-8 text-center text-xs text-neutral-400">
                    No comments yet. Start the conversation above!
                  </div>
                ) : (
                  comments.map((c) => {
                    const authorName = c.user?.firstName
                      ? `${c.user.firstName} ${c.user.lastName || ""}`.trim()
                      : c.user?.email || "User";
                    const isAuthor = c.user?.id === currentUser?.id;
                    const isEditingThis = editingCommentId === c.id;

                    return (
                      <div
                        key={c.id}
                        className="p-4 rounded-xl bg-neutral-50/70 dark:bg-white/[0.02] border border-neutral-200/60 dark:border-white/5 space-y-2 group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-xs">
                              {authorName[0]?.toUpperCase()}
                            </div>
                            <div>
                              <span className="text-xs font-bold text-neutral-900 dark:text-white">
                                {authorName}
                              </span>
                              <span className="text-[11px] text-neutral-400 ml-2">
                                {timeAgo(c.createdAt)}
                              </span>
                            </div>
                          </div>

                          {isAuthor && !isEditingThis && (
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => {
                                  setEditingCommentId(c.id);
                                  setEditingCommentText(c.comment);
                                }}
                                className="p-1 text-neutral-400 hover:text-brand-600 rounded"
                                title="Edit comment"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => deleteComment.mutate(c.id)}
                                className="p-1 text-neutral-400 hover:text-rose-500 rounded"
                                title="Delete comment"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          )}
                        </div>

                        {isEditingThis ? (
                          <div className="space-y-2 pt-1">
                            <textarea
                              rows={2}
                              value={editingCommentText}
                              onChange={(e) => setEditingCommentText(e.target.value)}
                              className="w-full text-xs rounded-lg border border-brand-500 bg-white dark:bg-[#0e1626] text-neutral-900 dark:text-white p-2"
                            />
                            <div className="flex justify-end gap-2">
                              <GlassButton size="sm" variant="ghost" onClick={() => setEditingCommentId(null)}>
                                Cancel
                              </GlassButton>
                              <GlassButton
                                size="sm"
                                variant="primary"
                                onClick={() => handleSaveEditedComment(c.id)}
                                isLoading={updateComment.isPending}
                              >
                                Save
                              </GlassButton>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs sm:text-sm text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap leading-relaxed">
                            {c.comment}
                          </p>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </GlassCard>
          )}

          {/* ── TAB 4: ACTIVITY LOG ───────────────────────────────────────── */}
          {activeTab === "activity" && (
            <GlassCard className="p-5 sm:p-6 space-y-4 border-neutral-200/80 dark:border-white/10">
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                Task Activity History
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Audit trail of changes, state transitions, and contributors on this task.
              </p>

              {activityLoading ? (
                <div className="py-6 text-center text-sm text-neutral-400">Loading activity…</div>
              ) : activities.length === 0 ? (
                <div className="py-8 text-center text-xs text-neutral-400">No activity logged yet.</div>
              ) : (
                <div className="space-y-3 pt-2">
                  {activities.map((act) => (
                    <div
                      key={act.id}
                      className="flex items-start gap-3 text-xs p-3 rounded-xl bg-neutral-50/60 dark:bg-white/[0.02] border border-neutral-200/50 dark:border-white/5"
                    >
                      <div className="h-6 w-6 rounded-full bg-brand-500/10 text-brand-600 dark:text-accent-cyan flex items-center justify-center shrink-0 mt-0.5">
                        <History className="h-3 w-3" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-neutral-800 dark:text-neutral-200 font-medium">
                          <span className="font-bold text-neutral-900 dark:text-white">
                            {act.actor?.firstName || act.user?.firstName || "System"}
                          </span>{" "}
                          {act.action}
                          {act.field && <span className="font-semibold text-brand-600"> ({act.field})</span>}
                          {act.toValue && <span className="text-neutral-500"> to "{act.toValue}"</span>}
                        </p>
                        <span className="text-[10px] text-neutral-400">{formatDateTime(act.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>
          )}
        </div>

        {/* Right Column (4 cols): Task Properties & Contributors Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Properties Card */}
          <GlassCard className="p-5 space-y-4 border-neutral-200/80 dark:border-white/10">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Task Properties
            </h3>

            {/* Status Picker */}
            <div>
              <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                Status
              </label>
              <Select
                value={task.status}
                onChange={(e) => updateTask.mutate({ status: e.target.value, id: taskId, projectId: task.projectId })}
                className="w-full h-9 px-3 rounded-xl border border-neutral-300 dark:border-white/10 bg-white dark:bg-[#0e1626] text-xs font-semibold text-neutral-900 dark:text-white"
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="DONE">Done</option>
                <option value="BLOCKED">Blocked</option>
                <option value="CANCELLED">Cancelled</option>
              </Select>
            </div>

            {/* Priority Picker */}
            <div>
              <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                Priority
              </label>
              <Select
                value={task.priority}
                onChange={(e) => updateTask.mutate({ priority: e.target.value, id: taskId, projectId: task.projectId })}
                className="w-full h-9 px-3 rounded-xl border border-neutral-300 dark:border-white/10 bg-white dark:bg-[#0e1626] text-xs font-semibold text-neutral-900 dark:text-white"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </Select>
            </div>

            {/* Target Due Date */}
            <div>
              <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                Target Due Date
              </label>
              <input
                type="date"
                value={task.dueDate ? task.dueDate.split("T")[0] : ""}
                onChange={(e) => {
                  const val = e.target.value ? new Date(e.target.value).toISOString() : null;
                  updateTask.mutate({ dueDate: val as any, id: taskId, projectId: task.projectId });
                }}
                className="w-full h-9 px-3 rounded-xl border border-neutral-300 dark:border-white/10 bg-white dark:bg-[#0e1626] text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            {/* Project info */}
            {project && (
              <div className="pt-2 border-t border-neutral-200/60 dark:border-white/5">
                <span className="text-[11px] text-neutral-500 block">Workspace Project</span>
                <Link
                  to={`/dashboard/projects/${project.id}`}
                  className="text-xs font-bold text-brand-600 dark:text-accent-cyan hover:underline inline-flex items-center gap-1 mt-0.5"
                >
                  <FolderKanban className="h-3.5 w-3.5" /> {project.name}
                </Link>
              </div>
            )}

            {/* Departments */}
            {task.departments && task.departments.length > 0 && (
              <div className="pt-2 border-t border-neutral-200/60 dark:border-white/5">
                <span className="text-[11px] text-neutral-500 block mb-1">Departments</span>
                <div className="flex flex-wrap gap-1">
                  {task.departments.map((d) => (
                    <span
                      key={d.departmentId}
                      className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 dark:bg-white/10 text-neutral-700 dark:text-neutral-300"
                    >
                      {d.department?.name || "Department"}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </GlassCard>

          {/* Assigned Contributors Card */}
          <GlassCard className="p-5 space-y-4 border-neutral-200/80 dark:border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Assigned Team ({task.assignees?.length || 0})
              </h3>
              <button
                onClick={() => setAssignModalOpen(true)}
                className="text-xs font-semibold text-brand-600 dark:text-accent-cyan hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <UserPlus className="h-3.5 w-3.5" /> Assign
              </button>
            </div>

            <div className="space-y-2">
              {!task.assignees || task.assignees.length === 0 ? (
                <p className="text-xs text-neutral-400 italic">No team members assigned yet</p>
              ) : (
                task.assignees.map((a) => {
                  const u = a.user;
                  const name = u?.firstName ? `${u.firstName} ${u.lastName || ""}`.trim() : u?.email || "Member";
                  return (
                    <div
                      key={a.userId}
                      className="flex items-center justify-between p-2 rounded-xl bg-neutral-50 dark:bg-white/[0.02] border border-neutral-200/60 dark:border-white/5"
                    >
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-xs">
                          {name[0]?.toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-neutral-900 dark:text-white truncate">{name}</p>
                          <p className="text-[10px] text-neutral-400 truncate">{u?.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeAssignee.mutate({ userId: a.userId })}
                        className="p-1 text-neutral-400 hover:text-rose-500 rounded"
                        title="Remove assignee"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </GlassCard>

          {/* Danger Zone */}
          <GlassCard className="p-4 border-rose-500/20 bg-rose-500/5 space-y-2">
            <span className="text-xs font-bold text-rose-700 dark:text-rose-400 block">Danger Zone</span>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              Permanently delete this task and remove all associated timesheet logs and comments.
            </p>
            <button
              onClick={() => setDeleteConfirmOpen(true)}
              className="w-full py-2 px-3 rounded-xl border border-rose-500/30 text-rose-600 hover:bg-rose-500/10 text-xs font-bold transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete Task
            </button>
          </GlassCard>
        </div>
      </div>

      {/* ── MODAL: Assign Contributor ────────────────────────────────────── */}
      <Modal open={assignModalOpen} onClose={() => setAssignModalOpen(false)} title="Assign Contributor" size="md">
        <div className="space-y-4">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Select an active member from this workspace organization to contribute to this sprint task:
          </p>
          <div className="max-h-60 overflow-y-auto space-y-1 divide-y divide-neutral-100 dark:divide-white/5">
            {projectMembers.map((m) => {
              const u = m.user;
              const uid = u?.id || m.userId;
              const name = u?.firstName ? `${u.firstName} ${u.lastName || ""}`.trim() : u?.email || "Unknown";
              const isAssigned = task.assignees?.some((a) => a.userId === uid);

              return (
                <div key={uid} className="flex items-center justify-between py-2 px-1">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-xs">
                      {name[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-neutral-900 dark:text-white">{name}</div>
                      <div className="text-[10px] text-neutral-400">{u?.email}</div>
                    </div>
                  </div>

                  {isAssigned ? (
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <Check className="h-3.5 w-3.5" /> Assigned
                    </span>
                  ) : (
                    <GlassButton
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        addAssignee.mutate(uid, {
                          onSuccess: () => setAssignModalOpen(false),
                        });
                      }}
                    >
                      Assign
                    </GlassButton>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </Modal>

      {/* ── MODAL: Manual Log Time ───────────────────────────────────────── */}
      <Modal open={manualTimeModalOpen} onClose={() => setManualTimeModalOpen(false)} title="Log Work Hours" size="md">
        <form onSubmit={handleAddManualTime} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 mb-1">
              Date Worked
            </label>
            <Input
              type="date"
              value={manualTimeDate}
              onChange={(e) => setManualTimeDate(e.target.value)}
              className="bg-white dark:bg-[#0e1626]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 mb-1">
              Duration (Minutes)
            </label>
            <Input
              type="number"
              min={1}
              step={5}
              value={manualTimeMinutes}
              onChange={(e) => setManualTimeMinutes(Number(e.target.value))}
              placeholder="e.g. 60 (for 1 hour)"
              className="bg-white dark:bg-[#0e1626]"
            />
            <span className="text-[11px] text-neutral-400 mt-1 block">
              = {formatDuration(manualTimeMinutes)}
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 mb-1">
              Work Description
            </label>
            <Input
              value={manualTimeDesc}
              onChange={(e) => setManualTimeDesc(e.target.value)}
              placeholder="e.g. Debugged token expiration issue and wrote unit tests"
              className="bg-white dark:bg-[#0e1626]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <GlassButton type="button" variant="ghost" onClick={() => setManualTimeModalOpen(false)}>
              Cancel
            </GlassButton>
            <GlassButton type="submit" variant="primary" isLoading={startTimer.isPending}>
              Save Timesheet Entry
            </GlassButton>
          </div>
        </form>
      </Modal>

      {/* ── MODAL: Delete Task Confirmation ──────────────────────────────── */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={() => {
          if (!taskId) return;
          deleteTask.mutate(taskId, {
            onSuccess: () => {
              setDeleteConfirmOpen(false);
              navigate(task.projectId ? `/dashboard/tasks?projectId=${task.projectId}` : "/dashboard/tasks");
            },
          });
        }}
        title="Delete Task"
        description="Are you sure you want to permanently delete this task? All comments and recorded work logs will be deleted."
        confirmLabel="Yes, Delete Task"
        variant="danger"
      />
    </div>
  );
}
