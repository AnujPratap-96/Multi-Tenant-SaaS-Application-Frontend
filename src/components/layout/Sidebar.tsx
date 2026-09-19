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
  Command,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePermissionStore } from "../../features/auth/permissionStore";
import { useTenantStore } from "../../features/tenant/tenantStore";
import { useCommandPaletteStore } from "@/features/command-palette/commandPaletteStore";

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  end?: boolean;
  permission?: string;
  requiresTenant?: boolean;
  badge?: string;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: "Overview",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, end: true },
      { name: "Organizations", href: "/dashboard/tenants", icon: Building2 },
    ],
  },
  {
    title: "Workspaces",
    items: [
      { name: "Projects", href: "/dashboard/projects", icon: FolderKanban, requiresTenant: true },
      { name: "Task Board", href: "/dashboard/tasks", icon: CheckSquare, requiresTenant: true },
      { name: "My Tasks", href: "/dashboard/my-tasks", icon: CheckSquare, requiresTenant: true },
      { name: "Departments", href: "/dashboard/departments", icon: Building2, requiresTenant: true },
      { name: "Directory", href: "/dashboard/users", icon: UserCircle, requiresTenant: true },
    ],
  },
  {
    title: "Governance & Access",
    items: [
      { name: "Team Members", href: "/dashboard/team", icon: Users, permission: "view:users", requiresTenant: true },
      { name: "Roles & RBAC", href: "/dashboard/roles", icon: Shield, permission: "view:roles", requiresTenant: true },
      { name: "Audit Stream", href: "/dashboard/audit-logs", icon: ClipboardList, permission: "view:audit-logs", requiresTenant: true },
      { name: "Tenant Settings", href: "/dashboard/settings", icon: Settings, permission: "manage:tenant", requiresTenant: true },
    ],
  },
];

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const { hasPermission, role } = usePermissionStore();
  const { tenants, currentTenant } = useTenantStore();
  const openCommandPalette = useCommandPaletteStore((s) => s.open);
  const isAdmin = role === "ADMIN" || role === "OWNER";
  const hasTenant = tenants.length > 0;

  const sidebarClassName = cn(
    "fixed left-0 top-14 bottom-0 z-30 w-64 flex flex-col overflow-hidden glass border-r border-glass-border/60 transition-transform duration-300 ease-in-out lg:translate-x-0 bg-midnight-950/80 backdrop-blur-2xl",
    isOpen ? "translate-x-0" : "-translate-x-full"
  );

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-midnight-950/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside className={sidebarClassName}>
        {/* Mobile close */}
        <div className="h-12 flex items-center justify-between px-4 border-b border-glass-border/50 flex-shrink-0 lg:hidden">
          <span className="text-xs font-bold text-text-primary uppercase tracking-wider">Navigation</span>
          <button
            onClick={() => setIsOpen(false)}
            className="text-text-muted hover:text-text-primary transition-colors p-1 rounded-lg"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6 scrollbar-thin">
          {NAV_SECTIONS.map((section, sIdx) => {
            const visibleItems = section.items.filter((item) => {
              if (item.requiresTenant && !hasTenant) return false;
              if (item.permission && !hasPermission(item.permission) && !isAdmin) return false;
              return true;
            });

            if (visibleItems.length === 0) return null;

            return (
              <div key={sIdx} className="space-y-1">
                {section.title && (
                  <p className="px-3 text-[10px] font-bold text-text-muted/70 uppercase tracking-widest mb-2 font-mono">
                    {section.title}
                  </p>
                )}
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.name}
                      to={item.href}
                      end={item.end}
                      onClick={() => setIsOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 group relative",
                          isActive
                            ? "bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/30 shadow-sm"
                            : "text-text-muted hover:bg-surface-800/50 hover:text-text-primary"
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={cn(
                                "p-1 rounded-lg transition-colors flex-shrink-0",
                                isActive
                                  ? "bg-accent-cyan text-midnight-950 font-bold"
                                  : "text-text-muted group-hover:text-accent-cyan"
                              )}
                            >
                              <Icon className="h-3.5 w-3.5" />
                            </div>
                            <span className="truncate">{item.name}</span>
                          </div>

                          {isActive && (
                            <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan shadow-sm shadow-accent-cyan animate-pulse" />
                          )}
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* Command Palette Launcher button at bottom */}
        <div className="p-3 border-t border-glass-border/50 flex-shrink-0 space-y-2">
          <button
            onClick={openCommandPalette}
            className="w-full flex items-center justify-between p-2 rounded-xl glass hover:border-accent-cyan/40 hover:bg-accent-cyan/5 text-text-muted hover:text-text-primary transition-all text-xs group"
          >
            <span className="flex items-center gap-2">
              <Command className="h-3.5 w-3.5 text-accent-cyan" />
              <span>Search Actions</span>
            </span>
            <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-surface-800 text-text-muted border border-glass-border">⌘K</kbd>
          </button>

          {/* Active Tenant / Role Badge */}
          {role && (
            <div className="px-2 py-1 flex items-center justify-between text-[11px] text-text-muted font-mono">
              <span className="truncate max-w-[120px] text-text-secondary">
                {currentTenant?.name || "No tenant"}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/30">
                {role}
              </span>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}