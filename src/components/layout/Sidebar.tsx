import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Shield,
  FolderKanban,
  CheckSquare,
  Settings,
  X,
  Hexagon,
  ClipboardList,
  Building2,
  UserCircle,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePermissionStore } from "../../features/auth/permissionStore";

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  end?: boolean;
  permission?: string;
}

const NAV: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, end: true },
  { name: "Organizations", href: "/dashboard/tenants", icon: Building2 },
  { name: "Users", href: "/dashboard/users", icon: UserCircle },
  { name: "Projects", href: "/dashboard/projects", icon: FolderKanban },
  { name: "Tasks", href: "/dashboard/tasks", icon: CheckSquare },
  { name: "Team", href: "/dashboard/team", icon: Users, permission: "view:users" },
  { name: "Roles", href: "/dashboard/roles", icon: Shield, permission: "view:roles" },
  { name: "Audit Logs", href: "/dashboard/audit-logs", icon: ClipboardList, permission: "view:audit-logs" },
  { name: "Settings", href: "/dashboard/settings", icon: Settings, permission: "manage:tenant" },
];

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const { hasPermission, role } = usePermissionStore();
  const isAdmin = role === "ADMIN" || role === "OWNER";

  const sidebarClassName = cn(
    "fixed inset-y-0 left-0 z-30 w-64 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0",
    isOpen ? "translate-x-0" : "-translate-x-full"
  );

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={sidebarClassName}>
        {/* Logo */}
        <div className="h-14 flex items-center justify-between px-6 border-b border-border dark:border-dark-border flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="bg-primary-600 p-1.5 rounded-lg">
              <Hexagon className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">Nexus</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden text-muted-foreground hover:text-foreground dark:hover:text-dark-foreground"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5 ">
          {NAV.map((item) => {
            if (item.permission && !hasPermission(item.permission) && !isAdmin) return null;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                end={item.end}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400"
                      : "text-muted-foreground dark:text-muted-foreground hover:bg-gray-50 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-gray-100"
                  )
                }
              >
                <item.icon className="h-4.5 w-4.5 flex-shrink-0" />
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        {/* Role badge */}
        {role && (
          <div className="px-5 py-4 border-t border-border dark:border-dark-border">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300">
              {role}
            </span>
          </div>
        )}
      </aside>
    </>
  );
}