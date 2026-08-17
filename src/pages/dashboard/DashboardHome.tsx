import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/features/auth/authStore";
import { useTenantStore } from "@/features/tenant/tenantStore";
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from "@/components/glass/GlassCard";
import { GlassButton } from "@/components/glass/GlassButton";
import api from "@/lib/axios";
import {
  FolderKanban,
  CheckSquare,
  Users,
  TrendingUp,
  Building2,
  KanbanSquare,
  Clock,
  ArrowRight,
} from "lucide-react";

interface DashboardStats {
  projects?: { total?: number };
  tasks?: { total?: number; DONE?: number };
  members?: { total?: number };
}

const STAT_PLACEHOLDER: DashboardStats = {
  projects: { total: 0 },
  tasks: { total: 0, DONE: 0 },
  members: { total: 0 },
};

interface StatCard {
  label: string;
  value: number | string;
  icon: typeof FolderKanban | typeof CheckSquare | typeof Users | typeof TrendingUp;
  color: string;
  trend?: string;
  trendUp?: boolean;
}

interface Project {
  id: string;
  name: string;
  status: string;
  progress: number;
  members: number;
  updatedAt: string;
}

interface RecentActivity {
  id: string;
  type: string;
  description: string;
  user: string;
  time: string;
}

export default function DashboardHome() {
  const { user } = useAuthStore();
  const { currentTenant } = useTenantStore();
  const name = user?.firstName || "there";

  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ["dashboard", "stats", currentTenant?.id],
    queryFn: () => api.get("/dashboard").then((r) => r.data.data as DashboardStats),
    enabled: !!currentTenant?.id,
    placeholderData: STAT_PLACEHOLDER,
  });

  const { data: recentProjects } = useQuery<Project[]>({
    queryKey: ["dashboard", "recent-projects", currentTenant?.id],
    queryFn: () => api.get("/dashboard/recent-projects").then((r) => r.data.data),
    enabled: !!currentTenant?.id,
  });

  const { data: recentActivity } = useQuery<RecentActivity[]>({
    queryKey: ["dashboard", "recent-activity", currentTenant?.id],
    queryFn: () => api.get("/dashboard/recent-activity").then((r) => r.data.data),
    enabled: !!currentTenant?.id,
  });

  const statCards: StatCard[] = [
    {
      label: "Projects",
      value: stats?.projects?.total ?? "—",
      icon: FolderKanban,
      color: "accent-cyan",
      trend: "+12%",
      trendUp: true,
    },
    {
      label: "Tasks",
      value: stats?.tasks?.total ?? "—",
      icon: CheckSquare,
      color: "accent-blue",
      trend: "+8%",
      trendUp: true,
    },
    {
      label: "Team Members",
      value: stats?.members?.total ?? "—",
      icon: Users,
      color: "accent-indigo",
      trend: "+3",
      trendUp: true,
    },
    {
      label: "Completed",
      value: stats?.tasks?.DONE ?? "—",
      icon: TrendingUp,
      color: "success",
      trend: "+15%",
      trendUp: true,
    },
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
          <GlassButton variant="outline" leadingIcon={<KanbanSquare className="h-4 w-4" />}>
            View All Projects
          </GlassButton>
          <GlassButton trailingIcon={<ArrowRight className="h-4 w-4" />}>
            New Project
          </GlassButton>
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
                    <div className={`bg-${s.color}/10 text-${s.color} p-2 rounded-xl`}>
                      <s.icon className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-text-primary">{s.value}</p>
                  {s.trend && (
                    <div className="mt-2 flex items-center gap-1">
                      <TrendingUp className={`h-3.5 w-3.5 ${s.trendUp ? "text-success-500" : "text-danger-500"}`} />
                      <span className={`text-xs font-medium ${s.trendUp ? "text-success-500" : "text-danger-500"}`}>
                        {s.trend} vs last month
                      </span>
                    </div>
                  )}
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
              <GlassButton variant="ghost" size="sm" leadingIcon={<ArrowRight className="h-3.5 w-3.5" />}>
                View All
              </GlassButton>
            </GlassCardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-text-muted border-b border-glass-border/50">
                    <th className="px-5 py-3 font-medium">Project</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Progress</th>
                    <th className="px-5 py-3 font-medium">Team</th>
                    <th className="px-5 py-3 font-medium">Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {(recentProjects && recentProjects.length > 0 ? recentProjects : [
                    { id: "1", name: "Website Redesign", status: "Active", progress: 65, members: 8, updatedAt: "2h ago" },
                    { id: "2", name: "Mobile App v2.0", status: "Active", progress: 42, members: 12, updatedAt: "5h ago" },
                    { id: "3", name: "API Migration", status: "Review", progress: 90, members: 5, updatedAt: "1d ago" },
                    { id: "4", name: "Analytics Dashboard", status: "Planning", progress: 15, members: 4, updatedAt: "2d ago" },
                    { id: "5", name: "Auth System Refactor", status: "Active", progress: 30, members: 6, updatedAt: "3d ago" },
                  ]).map((project) => (
                    <tr key={project.id} className="border-b border-glass-border/30 last:border-0 hover:bg-tint transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`bg-${project.status === "Active" ? "accent-cyan" : project.status === "Review" ? "accent-blue" : "accent-violet"}/10 text-${project.status === "Active" ? "accent-cyan" : project.status === "Review" ? "accent-blue" : "accent-violet"} p-1.5 rounded-lg`}>
                            <FolderKanban className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium text-text-primary">{project.name}</p>
                            <p className="text-xs text-text-muted">{project.members} members</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
                          project.status === "Active"
                            ? "bg-accent-cyan/15 text-accent-cyan"
                            : project.status === "Review"
                            ? "bg-accent-blue/15 text-accent-blue"
                            : "bg-accent-violet/15 text-accent-violet"
                        }`}>
                          {project.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="w-32 h-1.5 bg-glass-border rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-accent-cyan to-accent-blue rounded-full transition-all duration-500"
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                      </td>
                      <td className="px-5 py-4 text-text-secondary">{project.members}</td>
                      <td className="px-5 py-4 text-text-muted">{project.updatedAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
              {[
                { label: "Create Project", icon: KanbanSquare, color: "accent-cyan", href: "/dashboard/projects/new" },
                { label: "New Task", icon: CheckSquare, color: "accent-blue", href: "/dashboard/tasks/new" },
                { label: "Invite Member", icon: Users, color: "accent-indigo", href: "/dashboard/team/invite" },
                { label: "View Reports", icon: TrendingUp, color: "success", href: "/dashboard/analytics" },
              ].map((action) => (
                <Link
                  key={action.label}
                  to={action.href}
                  className="flex items-center gap-3 p-3 rounded-xl glass hover:border-accent-cyan/30 hover:bg-accent-cyan/5 transition-all duration-200 group"
                >
                  <div className={`bg-${action.color}/10 text-${action.color} p-2 rounded-lg`}>
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
              {(recentActivity && recentActivity.length > 0 ? recentActivity : [
                { id: "1", type: "project", description: "Website Redesign progress updated to 65%", user: "Sarah Chen", time: "2 min ago" },
                { id: "2", type: "task", description: "New task \"Design system audit\" assigned to you", user: "Marcus Johnson", time: "1 hour ago" },
                { id: "3", type: "member", description: "Emily Rodriguez joined the team", user: "System", time: "3 hours ago" },
                { id: "4", type: "project", description: "API Migration moved to Review", user: "David Park", time: "1 day ago" },
              ]).map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-tint transition-colors">
                  <div className={`bg-${activity.type === "project" ? "accent-cyan" : activity.type === "task" ? "accent-blue" : "accent-indigo"}/10 text-${activity.type === "project" ? "accent-cyan" : activity.type === "task" ? "accent-blue" : "accent-indigo"} p-1.5 rounded-lg flex-shrink-0 mt-0.5`}>
                    {activity.type === "project" && <KanbanSquare className="h-3.5 w-3.5" />}
                    {activity.type === "task" && <CheckSquare className="h-3.5 w-3.5" />}
                    {activity.type === "member" && <Users className="h-3.5 w-3.5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-secondary">{activity.description}</p>
                    <p className="text-xs text-text-muted">{activity.user} · {activity.time}</p>
                  </div>
                </div>
              ))}
            </GlassCardContent>
          </GlassCard>
        </div>
      </motion.div>
    </div>
  );
}