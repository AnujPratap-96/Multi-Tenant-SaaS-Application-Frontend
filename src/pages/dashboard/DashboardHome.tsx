import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/features/auth/authStore";
import { useTenantStore } from "@/features/tenant/tenantStore";
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from "@/components/glass/GlassCard";
import { GlassButton } from "@/components/glass/GlassButton";
import api from "@/lib/axios";
import { projectsApi } from "@/features/projects/projectsApi";
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
  const { user } = useAuthStore();
  const { currentTenant } = useTenantStore();
  const name = user?.firstName || "there";

  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ["dashboard", "stats", currentTenant?.id],
    queryFn: () => api.get("/dashboard").then((r) => r.data.data as DashboardStats),
    enabled: !!currentTenant?.id,
  });

  const { data: recentProjects } = useQuery<Project[]>({
    queryKey: ["dashboard", "recent-projects", currentTenant?.id],
    queryFn: () => projectsApi.list({ limit: 5 }).then((r) => r.projects),
    enabled: !!currentTenant?.id,
  });

  const { data: recentActivity } = useQuery<AuditLog[]>({
    queryKey: ["dashboard", "recent-activity", currentTenant?.id],
    queryFn: () =>
      api.get("/audit-logs?limit=5").then((r) => (r.data.data?.logs as AuditLog[]) ?? []),
    enabled: !!currentTenant?.id,
  });

  const statCards: StatCard[] = [
    {
      label: "Projects",
      value: stats?.projects?.total ?? "—",
      icon: FolderKanban,
      style: "bg-accent-cyan/10 text-accent-cyan",
    },
    {
      label: "Tasks",
      value: stats?.tasks?.total ?? "—",
      icon: CheckSquare,
      style: "bg-accent-blue/10 text-accent-blue",
    },
    {
      label: "Team Members",
      value: stats?.members?.total ?? "—",
      icon: Users,
      style: "bg-accent-indigo/10 text-accent-indigo",
    },
    {
      label: "Completed",
      value: stats?.tasks?.DONE ?? "—",
      icon: TrendingUp,
      style: "bg-success/10 text-success",
    },
  ];

  const quickActions = [
    { label: "Create Project", icon: KanbanSquare, style: "bg-accent-cyan/10 text-accent-cyan", href: "/dashboard/projects" },
    { label: "New Task", icon: CheckSquare, style: "bg-accent-blue/10 text-accent-blue", href: "/dashboard/tasks" },
    { label: "Invite Member", icon: UserPlus, style: "bg-accent-indigo/10 text-accent-indigo", href: "/dashboard/team" },
    { label: "View Activity", icon: TrendingUp, style: "bg-success/10 text-success", href: "/dashboard/audit-logs" },
  ];

  return (
    <div className="space-y-8 max-w-full">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-heading-xl font-bold text-text-primary">
            Welcome back, {name}
          </h1>
          {currentTenant && (
            <div className="mt-1 flex items-center gap-2 text-sm text-text-muted">
              <Building2 className="h-4 w-4" />
              <span className="font-medium text-text-secondary">{currentTenant.name}</span>
              <span className="px-2 py-0.5 rounded-full text-xs bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20">
                Active
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Link to="/dashboard/projects">
            <GlassButton variant="outline" leadingIcon={<KanbanSquare className="h-4 w-4" />}>
              View All Projects
            </GlassButton>
          </Link>
          <Link to="/dashboard/projects">
            <GlassButton trailingIcon={<ArrowRight className="h-4 w-4" />}>
              New Project
            </GlassButton>
          </Link>
        </div>
      </motion.div>

      {/* KPI Cards - Bento Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {statCards.map((s, index) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 + index * 0.05 }}
            whileHover={{ y: -2, scale: 1.01 }}
            className="group"
          >
            <GlassCard variant="elevated" padding="lg" className="h-full border-gradient group-hover:border-accent-cyan/30 transition-all duration-300">
              <GlassCardContent className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-text-muted">{s.label}</p>
                    <div className={`${s.style} p-2 rounded-xl`}>
                      <s.icon className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-text-primary">{s.value}</p>
                </div>
              </GlassCardContent>
            </GlassCard>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Content Grid - Bento Layout */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-4"
      >
        {/* Recent Projects - 2/3 width */}
        <div className="lg:col-span-2 space-y-4">
          <GlassCard variant="elevated" padding="none" className="overflow-hidden border-gradient">
            <GlassCardHeader className="px-5 py-4 border-b border-glass-border/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-accent-cyan to-accent-blue p-2 rounded-xl">
                  <KanbanSquare className="h-5 w-5 text-white" />
                </div>
                <div>
                  <GlassCardTitle>Recent Projects</GlassCardTitle>
                  <p className="text-sm text-text-muted">Track progress across your active projects</p>
                </div>
              </div>
              <Link to="/dashboard/projects">
                <GlassButton variant="ghost" size="sm" leadingIcon={<ArrowRight className="h-3.5 w-3.5" />}>
                  View All
                </GlassButton>
              </Link>
            </GlassCardHeader>
            <div className="overflow-x-auto">
              {recentProjects && recentProjects.length > 0 ? (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-text-muted border-b border-glass-border/50">
                      <th className="px-5 py-3 font-medium">Project</th>
                      <th className="px-5 py-3 font-medium">Team</th>
                      <th className="px-5 py-3 font-medium">Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentProjects.map((project) => (
                      <tr key={project.id} className="border-b border-glass-border/30 last:border-0 hover:bg-tint transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="bg-accent-cyan/10 text-accent-cyan p-1.5 rounded-lg">
                              <FolderKanban className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-medium text-text-primary">{project.name}</p>
                              <p className="text-xs text-text-muted">{project.description || "No description"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-text-secondary">{project.members?.length ?? 0}</td>
                        <td className="px-5 py-4 text-text-muted">{timeAgo(project.updatedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-8 text-center text-text-muted">
                  <KanbanSquare className="h-12 w-12 mx-auto text-text-muted/30 mb-4" />
                  <p className="text-text-muted">No projects yet</p>
                  <Link to="/dashboard/projects" className="mt-3 inline-block">
                    <GlassButton size="sm" leadingIcon={<KanbanSquare className="h-3.5 w-3.5" />}>
                      Create Project
                    </GlassButton>
                  </Link>
                </div>
              )}
            </div>
          </GlassCard>
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <GlassCard variant="elevated" padding="none" className="overflow-hidden border-gradient">
            <GlassCardHeader className="px-5 py-4 border-b border-glass-border/50">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-accent-indigo to-accent-violet p-2 rounded-xl">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <GlassCardTitle>Quick Actions</GlassCardTitle>
                  <p className="text-sm text-text-muted">Common tasks and shortcuts</p>
                </div>
              </div>
            </GlassCardHeader>
            <GlassCardContent className="px-5 pb-5 space-y-2">
              {quickActions.map((action) => (
                <Link
                  key={action.label}
                  to={action.href}
                  className="flex items-center gap-3 p-3 rounded-xl glass hover:border-accent-cyan/30 hover:bg-accent-cyan/5 transition-all duration-200 group"
                >
                  <div className={`${action.style} p-2 rounded-lg`}>
                    <action.icon className="h-4.5 w-4.5" />
                  </div>
                  <span className="font-medium text-text-primary group-hover:text-accent-cyan transition-colors">{action.label}</span>
                  <ArrowRight className="h-4 w-4 text-text-muted group-hover:text-accent-cyan transition-colors ml-auto" />
                </Link>
              ))}
            </GlassCardContent>
          </GlassCard>

          {/* Recent Activity */}
          <GlassCard variant="elevated" padding="none" className="overflow-hidden border-gradient">
            <GlassCardHeader className="px-5 py-4 border-b border-glass-border/50">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-warning-500 to-accent-orange p-2 rounded-xl">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <div>
                  <GlassCardTitle>Recent Activity</GlassCardTitle>
                  <p className="text-sm text-text-muted">Latest updates across your workspace</p>
                </div>
              </div>
            </GlassCardHeader>
            <GlassCardContent className="px-5 pb-5 space-y-3">
              {recentActivity && recentActivity.length > 0 ? (
                recentActivity.map((activity) => {
                  const entityStyle =
                    activity.entityType === "PROJECT"
                      ? "bg-accent-cyan/10 text-accent-cyan"
                      : activity.entityType === "TASK"
                      ? "bg-accent-blue/10 text-accent-blue"
                      : "bg-accent-indigo/10 text-accent-indigo";
                  const EntityIcon =
                    activity.entityType === "PROJECT"
                      ? KanbanSquare
                      : activity.entityType === "TASK"
                      ? CheckSquare
                      : Users;
                  const actor =
                    (activity.actor?.firstName
                      ? `${activity.actor.firstName} ${activity.actor.lastName ?? ""}`.trim()
                      : activity.actor?.email) || "System";
                  return (
                    <div key={activity.id} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-tint transition-colors">
                      <div className={`${entityStyle} p-1.5 rounded-lg flex-shrink-0 mt-0.5`}>
                        <EntityIcon className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">
                          {ACTION_LABELS[activity.action] || activity.action}
                        </p>
                        <p className="text-xs text-text-muted mt-0.5">{actor} · {timeAgo(activity.createdAt)}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-6 text-center text-text-muted">
                  <Clock className="h-10 w-10 mx-auto text-text-muted/30 mb-3" />
                  <p className="text-text-muted">No recent activity</p>
                </div>
              )}
            </GlassCardContent>
          </GlassCard>
        </div>
      </motion.div>
    </div>
  );
}
