import { NavLink, Link } from "react-router-dom";
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
          className="fixed inset-0 z-20 bg-midnight-950/30 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside className={sidebarClassName}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-glass-border/50 flex-shrink-0">
          <Link to="/dashboard" className="flex items-center gap-2" aria-label="Nexus Dashboard">
            <div className="bg-gradient-to-br from-accent-cyan to-accent-blue p-2 rounded-xl">
              <Hexagon className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-text-primary">Nexus</span>
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden text-text-muted hover:text-text-primary transition-colors"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
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
          <div className="px-4 py-4 border-t border-glass-border/50">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/20">
              {role}
            </span>
          </div>
        )}
      </aside>
    </>
  );
}