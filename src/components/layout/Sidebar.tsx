import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Shield,
  FolderKanban,
  CheckSquare,
  Settings,
  X,
  ClipboardList,
  Building2,
  UserCircle,
  Bell,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePermissionStore } from "../../features/auth/permissionStore";
import { useTenantStore } from "../../features/tenant/tenantStore";

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  end?: boolean;
  permission?: string;
  requiresTenant?: boolean;
}

const NAV: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, end: true },
  { name: "Organizations", href: "/dashboard/tenants", icon: Building2 },
  { name: "Users", href: "/dashboard/users", icon: UserCircle, requiresTenant: true },
  { name: "Projects", href: "/dashboard/projects", icon: FolderKanban, requiresTenant: true },
  { name: "Tasks", href: "/dashboard/tasks", icon: CheckSquare, requiresTenant: true },
  { name: "My Tasks", href: "/dashboard/my-tasks", icon: CheckSquare, requiresTenant: true },
  { name: "Departments", href: "/dashboard/departments", icon: Building2, requiresTenant: true },
  { name: "Notifications", href: "/dashboard/notifications", icon: Bell, requiresTenant: true },
  { name: "Team", href: "/dashboard/team", icon: Users, permission: "view:users", requiresTenant: true },
  { name: "Roles", href: "/dashboard/roles", icon: Shield, permission: "view:roles", requiresTenant: true },
  { name: "Audit Logs", href: "/dashboard/audit-logs", icon: ClipboardList, permission: "view:audit-logs", requiresTenant: true },
  { name: "Settings", href: "/dashboard/settings", icon: Settings, permission: "manage:tenant", requiresTenant: true },
];

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const { hasPermission, role } = usePermissionStore();
  const { tenants } = useTenantStore();
  const isAdmin = role === "ADMIN" || role === "OWNER";
  const hasTenant = tenants.length > 0;

  const sidebarClassName = cn(
    "fixed left-0 top-14 bottom-0 z-30 w-64 flex flex-col overflow-hidden glass transition-transform duration-300 ease-in-out lg:translate-x-0",
    isOpen ? "translate-x-0" : "-translate-x-full"
  );

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-midnight-950/30 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside className={sidebarClassName}>
        {/* Mobile close */}
        <div className="h-14 flex items-center justify-end px-4 border-b border-glass-border/50 flex-shrink-0 lg:hidden">
          <button
            onClick={() => setIsOpen(false)}
            className="text-text-muted hover:text-text-primary transition-colors"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-thin">
          {NAV.map((item) => {
            if (item.requiresTenant && !hasTenant) return null;
            if (item.permission && !hasPermission(item.permission) && !isAdmin) return null;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                end={item.end}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20"
                      : "text-text-muted hover:bg-tint hover:text-text-primary"
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
          <div className="px-4 py-2.5 border-t border-glass-border/50 flex-shrink-0">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/20">
              {role}
            </span>
          </div>
        )}
      </aside>
    </>
  );
}