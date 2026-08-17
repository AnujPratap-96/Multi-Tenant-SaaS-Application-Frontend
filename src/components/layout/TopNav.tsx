import { useEffect, useRef, useState } from "react";
import { Menu, ChevronDown, LogOut, User, Settings, Plus, Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../features/auth/authStore";
import { useTenantStore } from "../../features/tenant/tenantStore";
import { GlassButton } from "@/components/glass/GlassButton";
import { GlassCard } from "@/components/glass/GlassCard";
import { GlassDropdown, GlassDropdownItem, GlassDropdownSection, GlassDropdownDivider } from "@/components/glass/GlassDropdown";
import Breadcrumbs from "./Breadcrumbs";
import ThemeToggle from "../ui/ThemeToggle";
import { useToast } from "@/context/ToastProvider";

function TenantSwitcher() {
  const { tenants, currentTenant, setCurrentTenant } = useTenantStore();

  return (
    <GlassDropdown trigger={
      <GlassButton variant="ghost" className="h-10 min-w-[200px] justify-start gap-2">
        <span className="h-8 w-8 rounded-xl bg-gradient-to-br from-accent-cyan to-accent-blue flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0">
          {currentTenant?.name?.[0]?.toUpperCase() || "+"}
        </span>
        <span className="truncate max-w-[160px] text-sm font-medium text-text-primary">{currentTenant?.name || "Select Organization"}</span>
        <ChevronDown className="h-3.5 w-3.5 text-text-muted flex-shrink-0 ml-auto" />
      </GlassButton>
    } align="left">
      <GlassDropdownSection title="Organizations">
        {tenants.length > 0 && tenants.map((t) => (
          <GlassDropdownItem
            key={t.id}
            onClick={() => {
              setCurrentTenant(t.id);
            }}
          >
            <span className="h-8 w-8 rounded-xl bg-gradient-to-br from-accent-cyan to-accent-blue flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0">
              {t.name?.[0]?.toUpperCase()}
            </span>
            {t.name}
          </GlassDropdownItem>
        ))}
        {tenants.length === 0 && (
          <GlassDropdownItem disabled className="text-text-muted">
            No organizations yet
          </GlassDropdownItem>
        )}
      </GlassDropdownSection>
      <GlassDropdownDivider />
      <GlassDropdownItem
        onClick={() => {
          // Navigate to create tenant
        }}
      >
        <Plus className="h-4 w-4" />
        New organization
      </GlassDropdownItem>
    </GlassDropdown>
  );
}

function ProfileDropdown() {
  const { user, logout } = useAuthStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { addToast } = useToast();

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

  return (
    <div className="relative" ref={ref}>
      <GlassButton
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => setOpen((o) => !o)}
        aria-label="Profile menu"
      >
        {initials ? (
          <span className="text-sm font-semibold text-text-primary">{initials}</span>
        ) : (
          <User className="h-4 w-4" />
        )}
      </GlassButton>

      {open && (
        <GlassCard variant="strong" padding="none" className="absolute top-full right-0 mt-2 w-56 animate-slide-in-up">
          <div className="p-4 border-b border-glass-border/50">
            <p className="text-sm font-medium truncate text-text-primary">{displayName}</p>
            <p className="text-xs text-text-muted truncate">{user?.email}</p>
          </div>
          <Link
            to="/dashboard/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-text-muted hover:text-text-primary hover:bg-tint transition-colors"
          >
            <User className="h-4 w-4" />
            My Profile
          </Link>
          <Link
            to="/dashboard/settings"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-text-muted hover:text-text-primary hover:bg-tint transition-colors"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>
          <GlassDropdownDivider />
          <button
            onClick={() => {
              setOpen(false);
              logout();
              addToast("Signed out successfully", "info");
            }}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-danger-400 hover:text-danger-300 hover:bg-tint transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </GlassCard>
      )}
    </div>
  );
}

function NotificationsPanel() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Mock notifications
  const notifications = [
    { id: 1, title: "New member joined", description: "Sarah Chen joined Acme Corp", time: "2m ago", read: false },
    { id: 2, title: "Project updated", description: "Website Redesign progress: 65%", time: "1h ago", read: false },
    { id: 3, title: "Task assigned", description: "You were assigned to \"API Migration\"", time: "3h ago", read: true },
  ];

  return (
    <div className="relative" ref={ref}>
      <GlassButton
        variant="ghost"
        size="icon"
        className="h-8 w-8 relative"
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
      >
        <Bell className="h-4.5 w-4.5" />
        {notifications.some(n => !n.read) && (
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-accent-cyan" />
        )}
      </GlassButton>

      {open && (
        <GlassCard variant="strong" padding="none" className="absolute top-full right-0 mt-2 w-80 animate-slide-in-up max-h-[400px] flex flex-col">
          <div className="p-4 border-b border-glass-border/50 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-text-primary">Notifications</h3>
            <button className="text-xs text-accent-cyan hover:text-accent-blue font-medium">Mark all read</button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-text-muted text-sm">No notifications</div>
            ) : (
              notifications.map((n) => (
                <Link
                  key={n.id}
                  to="#"
                  className={`flex items-start gap-3 p-3 rounded-xl transition-colors ${
                    !n.read ? "bg-accent-cyan/5" : ""
                  } hover:bg-tint`}
                  onClick={() => setOpen(false)}
                >
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${!n.read ? "bg-accent-cyan" : "bg-text-muted"}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!n.read ? "font-semibold text-text-primary" : "font-medium text-text-secondary"}`}>{n.title}</p>
                    <p className="text-xs text-text-muted truncate">{n.description}</p>
                    <p className="text-[10px] text-text-muted mt-1">{n.time}</p>
                  </div>
                </Link>
              ))
            )}
          </div>
          <div className="p-3 border-t border-glass-border/50">
            <Link
              to="/dashboard/notifications"
              className="block text-center text-sm text-accent-cyan hover:text-accent-blue font-medium"
              onClick={() => setOpen(false)}
            >
              View all notifications
            </Link>
          </div>
        </GlassCard>
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
      className="h-14 glass sticky top-0 z-40 border-b border-glass-border/50 flex items-center justify-between px-4 lg:px-6 flex-shrink-0"
    >
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden glass p-2 rounded-xl hover:bg-tint transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5 text-text-muted" />
        </button>
        <TenantSwitcher />
        <div className="hidden sm:block h-4 w-px bg-glass-border" />
        <div className="hidden sm:block">
          <Breadcrumbs />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <NotificationsPanel />
        <ProfileDropdown />
      </div>
    </header>
  );
}