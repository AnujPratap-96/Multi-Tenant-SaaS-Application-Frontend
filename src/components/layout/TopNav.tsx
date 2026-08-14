import { useEffect, useRef, useState } from "react";
import { Menu, ChevronDown, LogOut, User, Settings, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../features/auth/authStore";
import { useTenantStore } from "../../features/tenant/tenantStore";
import Breadcrumbs from "./Breadcrumbs";
import NotificationsPanel from "./NotificationsPanel";
import ThemeToggle from "../ui/ThemeToggle";

function TenantSwitcher() {
  const { tenants, currentTenant, setCurrentTenant } = useTenantStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Always return a single div element
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium hover:bg-surface-muted dark:hover:bg-surface-muted/30 transition-colors"
      >
        <span className="h-5 w-5 rounded bg-primary-100 flex items-center justify-center text-primary-600 text-[10px] font-bold flex-shrink-0">
          {currentTenant?.name?.[0]?.toUpperCase() || "+"}
        </span>
        <span className="truncate max-w-[160px] text-sm font-medium text-foreground">{currentTenant?.name || "Select Org"}</span>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
      </button>

      {open && (
        <div
          className="absolute top-full left-0 mt-1 w-64 bg-surface elevated rounded-xl border border-border dark:bg-dark-elevated dark:border-dark-border py-1 z-50"
        >
          {tenants.length > 0 && (
            <div>
              <p className="px-3 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Organizations
              </p>
              {tenants.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setCurrentTenant(t.id);
                    setOpen(false);
                  }}
                  className="w-full text-left px-3 py-2.5 text-sm flex items-center gap-2 rounded-md hover:bg-surface-dark dark:hover:bg-surface-dark/30 transition-colors">
                    <span
                      className="h-4 w-4 rounded bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                    >
                      {t.name?.[0]?.toUpperCase()}
                    </span>
                    {t.name}
                  </button>
                ))}
              <div className="border-t border-border dark:border-dark-border my-1" />
            </div>
          )}
          <button
            onClick={() => {
              setOpen(false);
            }}
            className="w-full text-left px-3 py-2.5 text-sm flex items-center gap-2 rounded-md hover:bg-surface-dark dark:hover:bg-surface-dark/30 transition-colors">
            <Plus className="h-4 w-4" />
            New organization
          </button>
        </div>
      )}
    </div>
  );
}

function ProfileDropdown() {
  const { user, logout } = useAuthStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const displayName = user?.firstName
    ? `${user.firstName} ${user.lastName || ""}`.trim()
    : user?.name || "User";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Always return a single div element
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-center h-8 w-8 rounded-full bg-surface elevated dark:bg-dark-elevated border border-border dark:border-dark-border hover:bg-surface-dark dark:hover:bg-surface-dark/30 transition-colors"
        aria-label="Profile"
      >
        {initials || <User className="h-4 w-4" />}
      </button>

      {open && (
        <div
          className="absolute top-full right-0 mt-1 w-64 bg-white dark:bg-gray-900 rounded-xl border border-border dark:bg-dark-elevated dark:border-dark-border shadow-premium-low py-1 z-50"
        >
          <div className="px-4 py-2.5 border-b border-border dark:border-dark-border">
            <p className="text-sm font-medium truncate text-foreground">{displayName}</p>
            <p className="text-xs text-muted-foreground dark:text-dark-muted-foreground truncate">{user?.email}</p>
          </div>
          <Link
            to="/dashboard/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-muted-foreground dark:text-dark-muted-foreground hover:bg-surface-dark dark:hover:bg-surface-dark/30 transition-colors"
          >
            <User className="h-4 w-4" />
            My Profile
          </Link>
          <Link
            to="/dashboard/settings"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-muted-foreground dark:text-dark-muted-foreground hover:bg-surface-dark dark:hover:bg-surface-dark/30 transition-colors"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>
          <button
            onClick={() => {
              setOpen(false);
              logout();
            }}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-surface-dark dark:hover:bg-surface-dark/30 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

interface TopNavProps {
  setSidebarOpen: (open: boolean) => void;
}

export default function TopNav({ setSidebarOpen }: TopNavProps) {
  return (
    <header
      className="h-14 bg-transparent backdrop-blur-xl border-b border-border/20 dark:border-dark-border/20 flex items-center justify-between px-4 lg:px-6 flex-shrink-0"
    >
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden p-2 rounded-lg hover:bg-surface-muted dark:hover:bg-surface-muted/30 transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5 text-muted-foreground" />
        </button>
        <TenantSwitcher />
        <div className="hidden sm:block h-4 w-px bg-gray-200 dark:bg-gray-700" />
        <div className="hidden sm:block">
          <Breadcrumbs />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        <NotificationsPanel />
        <ProfileDropdown />
      </div>
    </header>
  );
}