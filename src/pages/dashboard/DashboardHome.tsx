import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/features/auth/authStore";
import { useTenantStore } from "@/features/tenant/tenantStore";
import { GlassCard, GlassCardHeader, GlassCardTitle } from "@/components/glass/GlassCard";
import { GlassButton } from "@/components/glass/GlassButton";
import api from "@/lib/axios";
import { projectsApi } from "@/features/projects/projectsApi";
import { useCreateTask } from "@/features/tasks/tasksQueries";
import { useCommandPaletteStore } from "@/features/command-palette/commandPaletteStore";
import {
  FolderKanban,
  CheckSquare,
  Users,
  TrendingUp,
  Building2,
  KanbanSquare,
  Clock,
  ArrowRight,
  UserPlus,
  Plus,
  Sparkles,
  Command,
  ShieldCheck,
  Calendar,
  Layers,
} from "lucide-react";
import type { Project } from "@/types/domain";

interface DashboardStats {
  projects?: { total?: number };
  tasks?: { total?: number; DONE?: number };
  members?: { total?: number };
}

interface StatCard {
  label: string;
  value: number | string;
  delta: string;
  sub: string;
  icon: typeof FolderKanban | typeof CheckSquare | typeof Users | typeof TrendingUp;
  style: string;
}

interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  actor?: { email?: string; firstName?: string; lastName?: string };
  createdAt: string;
}

const ACTION_LABELS: Record<string, string> = {
  PROJECT_CREATE: "Created project",
  PROJECT_UPDATE: "Updated project",
  PROJECT_DELETE: "Deleted project",
  PROJECT_ARCHIVE: "Archived project",
  PROJECT_MEMBER_ADD: "Added project member",
  PROJECT_MEMBER_REMOVE: "Removed project member",
  TASK_CREATE: "Created task",
  TASK_UPDATE: "Updated task",
  TASK_DELETE: "Deleted task",
  TASK_STATUS_CHANGE: "Changed task status",
  ADD_MEMBER: "Added member",
  REMOVE_MEMBER: "Removed member",
  INVITE: "Invited user",
  ROLE_CHANGE: "Changed role",
  TENANT_SWITCH: "Switched organization",
  CREATE: "Created",
  UPDATE: "Updated",
  DELETE: "Deleted",
};

function timeAgo(iso?: string): string {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export default function DashboardHome() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { currentTenant } = useTenantStore();
  const openCommandPalette = useCommandPaletteStore((s) => s.open);
  const createTask = useCreateTask();

  const [quickTaskTitle, setQuickTaskTitle] = useState("");
  const name = user?.firstName || user?.name || "there";

  const todayStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["dashboard", "stats", currentTenant?.id],
    queryFn: () => api.get("/dashboard").then((r) => r.data.data as DashboardStats),
    enabled: !!currentTenant?.id,
  });

  const { data: recentProjects, isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ["dashboard", "recent-projects", currentTenant?.id],
    queryFn: () => projectsApi.list({ limit: 5 }).then((r) => r.projects),
    enabled: !!currentTenant?.id,
  });

  const { data: recentActivity, isLoading: activityLoading } = useQuery<AuditLog[]>({
    queryKey: ["dashboard", "recent-activity", currentTenant?.id],
    queryFn: () =>
      api.get("/audit-logs?limit=5").then((r) => (r.data.data?.logs as AuditLog[]) ?? []),
    enabled: !!currentTenant?.id,
  });

  const totalTasks = stats?.tasks?.total ?? 0;
  const doneTasks = stats?.tasks?.DONE ?? 0;
  const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const statCards: StatCard[] = [
    {
      label: "Active Projects",
      value: statsLoading ? "—" : (stats?.projects?.total ?? 0),
      delta: "+2 this week",
      sub: "Active workspaces",
      icon: FolderKanban,
      style: "bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20",
    },
    {
      label: "Open Tasks",
      value: statsLoading ? "—" : totalTasks,
      delta: `${doneTasks} completed`,
      sub: "Sprint backlog",
      icon: CheckSquare,
      style: "bg-accent-blue/10 text-accent-blue border border-accent-blue/20",
    },
    {
      label: "Team Members",
      value: statsLoading ? "—" : (stats?.members?.total ?? 1),
      delta: "Active seats",
      sub: "Collaborators",
      icon: Users,
      style: "bg-accent-indigo/10 text-accent-indigo border border-accent-indigo/20",
    },
    {
      label: "Sprint Velocity",
      value: statsLoading ? "—" : `${completionRate}%`,
      delta: "Completion rate",
      sub: "On schedule",
      icon: TrendingUp,
      style: "bg-success-500/10 text-success-400 border border-success-500/20",
    },
  ];

  const quickActions = [
    {
      label: "New Project",
      icon: FolderKanban,
      color: "text-accent-cyan bg-accent-cyan/10",
      desc: "Initialize workspace",
      onClick: () => navigate("/dashboard/projects"),
    },
    {
      label: "Task Board",
      icon: KanbanSquare,
      color: "text-accent-blue bg-accent-blue/10",
      desc: "Sprint Kanban view",
      onClick: () => navigate("/dashboard/tasks"),
    },
    {
      label: "Invite Teammate",
      icon: UserPlus,
      color: "text-accent-indigo bg-accent-indigo/10",
      desc: "Send email invite",
      onClick: () => navigate("/dashboard/team"),
    },
    {
      label: "Audit Stream",
      icon: ShieldCheck,
      color: "text-success-400 bg-success-500/10",
      desc: "Security event log",
      onClick: () => navigate("/dashboard/audit-logs"),
    },
  ];

  const handleQuickTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTaskTitle.trim()) return;
    createTask.mutate(
      { title: quickTaskTitle.trim() },
      {
        onSuccess: () => setQuickTaskTitle(""),
      }
    );
  };

  return (
    <div className="space-y-6 max-w-full pb-10">
      {/* ============================================================
          EXECUTIVE WELCOME HEADER
          ============================================================ */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 glass p-6 rounded-2xl border-glass-border/60 shadow-lg"
      >
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-text-muted mb-1">
            <Calendar className="h-3.5 w-3.5 text-accent-cyan" />
            <span>{todayStr}</span>
            <span>•</span>
            <span className="text-accent-cyan font-mono">Workspace Overview</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-text-primary tracking-tight">
            Welcome back, <span className="gradient-text-cyan">{name}</span>
          </h1>

          {currentTenant && (
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-text-muted">
              <span className="flex items-center gap-1.5 font-medium text-text-secondary bg-surface-900/80 px-2.5 py-1 rounded-lg border border-glass-border">
                <Building2 className="h-3.5 w-3.5 text-accent-cyan" />
                {currentTenant.name}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/30">
                {currentTenant.plan || "PRO"}
              </span>
              <span className="flex items-center gap-1 text-[11px] text-success-400">
                <span className="w-1.5 h-1.5 rounded-full bg-success-400 animate-ping" />
                Virtual Isolation Enforced
              </span>
            </div>
          )}
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={openCommandPalette}
            className="flex items-center gap-2 px-3 py-2 rounded-xl glass hover:border-accent-cyan/40 text-text-muted hover:text-text-primary transition-all text-xs font-medium"
          >
            <Command className="h-3.5 w-3.5 text-accent-cyan" />
            <span>Command Menu</span>
            <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-surface-800 text-text-muted border border-glass-border">⌘K</kbd>
          </button>

          <Link to="/dashboard/tasks">
            <GlassButton variant="primary" size="sm" className="font-semibold shadow-md shadow-accent-cyan/20" leadingIcon={<Plus className="h-4 w-4" />}>
              New Task
            </GlassButton>
          </Link>
        </div>
      </motion.div>

      {/* ============================================================
          QUICK TASK CAPTURE BAR
          ============================================================ */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
      >
        <form
          onSubmit={handleQuickTaskSubmit}
          className="flex items-center gap-2 p-2 rounded-xl glass border-glass-border/50 hover:border-accent-cyan/30 transition-all focus-within:border-accent-cyan/60 shadow-sm"
        >
          <div className="pl-2">
            <Sparkles className="h-4 w-4 text-accent-cyan animate-pulse" />
          </div>
          <input
            type="text"
            value={quickTaskTitle}
            onChange={(e) => setQuickTaskTitle(e.target.value)}
            placeholder="Quick capture a task to your current sprint backlog... (Press Enter to save)"
            className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none px-2"
          />
          <GlassButton
            type="submit"
            variant="ghost"
            size="sm"
            disabled={!quickTaskTitle.trim() || createTask.isPending}
            className="text-xs font-semibold text-accent-cyan hover:bg-accent-cyan/10"
          >
            {createTask.isPending ? "Adding..." : "Add Task"}
          </GlassButton>
        </form>
      </motion.div>

      {/* ============================================================
          KPI CARDS BENTO GRID
          ============================================================ */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {statCards.map((s) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
              className="group"
            >
              <GlassCard
                variant="elevated"
                padding="md"
                className="h-full border-glass-border/60 group-hover:border-accent-cyan/40 transition-all glow-border-interactive relative overflow-hidden"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">{s.label}</p>
                    <p className="text-2xl sm:text-3xl font-black font-display text-text-primary mt-1">{s.value}</p>
                  </div>
                  <div className={`${s.style} p-2.5 rounded-xl shadow-sm`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>

                <div className="pt-2 border-t border-glass-border/40 flex items-center justify-between text-xs">
                  <span className="text-text-secondary font-medium">{s.delta}</span>
                  <span className="text-[11px] text-text-muted">{s.sub}</span>
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </motion.div>

      {/* ============================================================
          MAIN BENTO SECTION: RECENT PROJECTS & ACTIVITY
          ============================================================ */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* LEFT 2 COLUMNS: RECENT PROJECTS */}
        <div className="lg:col-span-2 space-y-4">
          <GlassCard variant="elevated" padding="none" className="overflow-hidden border-glass-border/60 shadow-xl">
            <GlassCardHeader className="px-5 py-4 border-b border-glass-border/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-accent-cyan to-accent-blue p-2 rounded-xl shadow">
                  <FolderKanban className="h-4 w-4 text-white" />
                </div>
                <div>
                  <GlassCardTitle className="text-base font-bold">Active Projects</GlassCardTitle>
                  <p className="text-xs text-text-muted">Repository pipelines and sprint roadmaps</p>
                </div>
              </div>
              <Link to="/dashboard/projects">
                <GlassButton variant="ghost" size="sm" className="text-xs text-accent-cyan" trailingIcon={<ArrowRight className="h-3.5 w-3.5" />}>
                  View All ({stats?.projects?.total ?? 0})
                </GlassButton>
              </Link>
            </GlassCardHeader>

            <div className="overflow-x-auto">
              {projectsLoading ? (
                <div className="p-6 space-y-3">
                  <div className="h-10 skeleton w-full" />
                  <div className="h-10 skeleton w-full" />
                  <div className="h-10 skeleton w-full" />
                </div>
              ) : recentProjects && recentProjects.length > 0 ? (
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-glass-border/50 bg-neutral-100/70 dark:bg-black/20 text-xs font-semibold text-text-muted uppercase">
                      <th className="px-5 py-3">Project Workspace</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Members</th>
                      <th className="px-5 py-3 text-right">Updated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-glass-border/30">
                    {recentProjects.map((project) => (
                      <tr
                        key={project.id}
                        onClick={() => navigate(`/dashboard/projects/${project.id}`)}
                        className="hover:bg-tint cursor-pointer transition-colors group"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center text-accent-cyan font-bold text-xs">
                              {project.name[0]?.toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-text-primary group-hover:text-accent-cyan transition-colors truncate">
                                {project.name}
                              </p>
                              <p className="text-[11px] text-text-muted truncate max-w-xs">
                                {project.description || "No description provided"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan" />
                            {typeof project.status === "string" ? project.status : "ACTIVE"}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-xs text-text-secondary">
                          <span className="font-medium">{project.members?.length ?? 1}</span> seats
                        </td>
                        <td className="px-5 py-3.5 text-right text-xs text-text-muted font-mono">
                          {timeAgo(project.updatedAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="py-12 px-4 text-center">
                  <FolderKanban className="h-10 w-10 mx-auto text-text-muted/40 mb-3" />
                  <p className="text-sm font-semibold text-text-primary">No projects created yet</p>
                  <p className="text-xs text-text-muted mt-1 mb-4">Initialize your first workspace to start collaborating</p>
                  <Link to="/dashboard/projects">
                    <GlassButton variant="primary" size="sm">
                      Create Project
                    </GlassButton>
                  </Link>
                </div>
              )}
            </div>
          </GlassCard>
        </div>

        {/* RIGHT COLUMN: QUICK SHORTCUTS & ACTIVITY */}
        <div className="space-y-6">
          {/* Quick Shortcuts */}
          <GlassCard variant="elevated" padding="none" className="overflow-hidden border-glass-border/60 shadow-xl">
            <GlassCardHeader className="px-5 py-3.5 border-b border-glass-border/50">
              <GlassCardTitle className="text-sm font-bold flex items-center gap-2">
                <Layers className="h-4 w-4 text-accent-cyan" />
                Quick Workflows
              </GlassCardTitle>
            </GlassCardHeader>
            <div className="p-3 grid grid-cols-2 gap-2">
              {quickActions.map((action) => {
                const ActionIcon = action.icon;
                return (
                  <button
                    key={action.label}
                    onClick={action.onClick}
                    className="p-3 rounded-xl glass hover:border-accent-cyan/40 hover:bg-accent-cyan/5 transition-all text-left group"
                  >
                    <div className={`w-8 h-8 rounded-lg ${action.color} flex items-center justify-center mb-2`}>
                      <ActionIcon className="h-4 w-4" />
                    </div>
                    <p className="text-xs font-bold text-text-primary group-hover:text-accent-cyan transition-colors">
                      {action.label}
                    </p>
                    <p className="text-[10px] text-text-muted truncate mt-0.5">{action.desc}</p>
                  </button>
                );
              })}
            </div>
          </GlassCard>

          {/* Audit Activity Stream */}
          <GlassCard variant="elevated" padding="none" className="overflow-hidden border-glass-border/60 shadow-xl">
            <GlassCardHeader className="px-5 py-3.5 border-b border-glass-border/50 flex items-center justify-between">
              <GlassCardTitle className="text-sm font-bold flex items-center gap-2">
                <Clock className="h-4 w-4 text-warning-400" />
                Audit Trail
              </GlassCardTitle>
              <Link to="/dashboard/audit-logs" className="text-[11px] text-accent-cyan hover:underline font-mono">
                Full Log →
              </Link>
            </GlassCardHeader>

            <div className="divide-y divide-glass-border/30">
              {activityLoading ? (
                <div className="p-4 space-y-2">
                  <div className="h-8 skeleton w-full" />
                  <div className="h-8 skeleton w-full" />
                </div>
              ) : recentActivity && recentActivity.length > 0 ? (
                recentActivity.map((activity) => {
                  const actor =
                    (activity.actor?.firstName
                      ? `${activity.actor.firstName} ${activity.actor.lastName ?? ""}`.trim()
                      : activity.actor?.email) || "System";

                  return (
                    <div key={activity.id} className="p-3.5 hover:bg-tint transition-colors">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-text-primary truncate">
                          {ACTION_LABELS[activity.action] || activity.action}
                        </span>
                        <span className="text-[10px] font-mono text-text-muted flex-shrink-0">
                          {timeAgo(activity.createdAt)}
                        </span>
                      </div>
                      <p className="text-[11px] text-text-muted truncate mt-0.5">
                        by <span className="text-text-secondary">{actor}</span>
                      </p>
                    </div>
                  );
                })
              ) : (
                <div className="p-6 text-center text-xs text-text-muted">
                  No recent audit events recorded
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      </motion.div>
    </div>
  );
}
