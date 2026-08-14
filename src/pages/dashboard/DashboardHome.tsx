import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useAuthStore } from "../../features/auth/authStore";
import { useTenantStore } from "../../features/tenant/tenantStore";
import { Card } from "@/components/ui/Card";
import api from "../../lib/axios";
import { FolderKanban, CheckSquare, Users, TrendingUp, ChevronDown } from "lucide-react";

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

  const statCards: StatCard[] = [
    {
      label: "Projects",
      value: stats?.projects?.total ?? "—",
      icon: FolderKanban,
    },
    {
      label: "Tasks",
      value: stats?.tasks?.total ?? "—",
      icon: CheckSquare,
    },
    {
      label: "Team Members",
      value: stats?.members?.total ?? "—",
      icon: Users,
    },
    {
      label: "Completed",
      value: stats?.tasks?.DONE ?? "—",
      icon: TrendingUp,
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-bold text-foreground">
          Welcome back, {name} 👋
        </h1>
        {currentTenant && (
          <p className="text-sm text-muted-foreground dark:text-dark-muted-foreground">
            {currentTenant.name}
          </p>
        )}
      </div>

      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-2xl">
        {statCards.map((s) => (
          <motion.div
            key={s.label}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="group rounded-2xl border border-border bg-card dark:bg-dark-card p-5 flex items-center gap-3 hover:bg-primary/5 transition-colors dark:hover:bg-primary/10"
            style={{
              backgroundImage:
                s.icon === TrendingUp
                  ? "linear-gradient(135deg, rgba(75, 84, 214, 0.25) 0%, transparent 50%)"
                  : "",
            }}
          >
            <div
              className="p-2 rounded-lg bg-primary/10 dark:bg-primary/10 group-hover:bg-primary/15 dark:group-hover:bg-primary/20 flex-shrink-0"
            >
              <s.icon className="h-5 w-5 group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground dark:text-dark-muted-foreground">{s.label}</p>
              <p className="text-xl font-bold text-foreground dark:text-dark-foreground">
                {s.value}
              </p>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity absolute right-3 top-3" />
          </motion.div>
        ))}
      </motion.div>

      <Card className="rounded-2xl border border-border bg-card dark:bg-dark-card p-6 rounded-xl">
        <p className="text-muted-foreground dark:text-dark-muted-foreground">
          Projects & tasks overview coming in the next phase
        </p>
      </Card>
    </div>
  );
}