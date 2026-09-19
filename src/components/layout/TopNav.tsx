import { useEffect, useRef, useState } from "react";
import { Menu, ChevronDown, LogOut, User, Settings, Plus, Bell, Hexagon } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../features/auth/authStore";
import { useTenantStore } from "../../features/tenant/tenantStore";
import {
  useNotifications,
  useUnreadCount,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from "@/features/notifications/notificationsQueries";
import { GlassButton } from "@/components/glass/GlassButton";
import { GlassCard } from "@/components/glass/GlassCard";
import { GlassDropdown, GlassDropdownItem, GlassDropdownSection, GlassDropdownDivider } from "@/components/glass/GlassDropdown";
import Breadcrumbs from "./Breadcrumbs";
import ThemeToggle from "../ui/ThemeToggle";
import { useToast } from "@/context/useToast";

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

const NOTIFICATIONS_PARAMS = { limit: 10 };

function NotificationsPanel() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { data: notificationsData } = useNotifications(NOTIFICATIONS_PARAMS);
  const { data: unreadCount = 0 } = useUnreadCount();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const items = notificationsData?.items ?? [];

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const [now] = useState(() => Date.now());

  const formatTime = (iso?: string) => {
    if (!iso) return "";
    const diff = now - new Date(iso).getTime();
    const mins = Math.round(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.round(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.round(hrs / 24)}d ago`;
  };

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
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-accent-cyan text-[10px] font-bold text-white flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </GlassButton>

      {open && (
        <GlassCard variant="strong" padding="none" className="absolute top-full right-0 mt-2 w-80 animate-slide-in-up max-h-[400px] flex flex-col">
          <div className="p-4 border-b border-glass-border/50 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-text-primary">Notifications</h3>
            <button
              className="text-xs text-accent-cyan hover:text-accent-blue font-medium disabled:opacity-40"
              onClick={() => markAllRead.mutate()}
              disabled={markAllRead.isPending || unreadCount === 0}
            >
              Mark all read
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {items.length === 0 ? (
              <div className="p-8 text-center text-text-muted text-sm">No notifications</div>
            ) : (
              items.map((n) => (
                <button
                  key={n.id}
                  className={`w-full text-left flex items-start gap-3 p-3 rounded-xl transition-colors ${
                    !n.readAt ? "bg-accent-cyan/5" : ""
                  } hover:bg-tint`}
                  onClick={() => {
                    if (!n.readAt) markRead.mutate(n.id);
                    setOpen(false);
                  }}
                >
                  <div
                    className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                      !n.readAt ? "bg-accent-cyan" : "bg-text-muted"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm ${
                        !n.readAt ? "font-semibold text-text-primary" : "font-medium text-text-secondary"
                      }`}
                    >
                      {n.message}
                    </p>
                    <p className="text-[10px] text-text-muted mt-1">{formatTime(n.createdAt)}</p>
                  </div>
                </button>
              ))
            )}
          </div>
          <div className="p-2 border-t border-glass-border/50">
            <Link
              to="/dashboard/notifications"
              onClick={() => setOpen(false)}
              className="block text-center text-xs text-accent-cyan hover:text-accent-blue font-medium py-1.5"
            >
              View all
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
      className="h-14 glass sticky top-0 z-40 border-b border-glass-border/50 flex items-center justify-between pl-4 pr-4 flex-shrink-0"
    >
      <div className="flex items-center gap-3 min-w-0">
        {/* Logo block: width matches the sidebar on desktop, with a divider marking that boundary */}
        <div className="flex items-center  lg:w-60 lg:flex-shrink-0 lg:border-r lg:border-glass-border/60">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden glass p-2 rounded-xl hover:bg-tint transition-colors"
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5 text-text-muted" />
          </button>
          <Link to="/dashboard" className="flex items-center gap-2 flex-shrink-0" aria-label="Nexus">
            <div className="bg-gradient-to-br from-accent-cyan to-accent-blue p-2 rounded-xl">
              <Hexagon className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-text-primary hidden sm:block">Nexus</span>
          </Link>
        </div>
        <TenantSwitcher />
        <div className="hidden sm:block h-4 w-px bg-glass-border" />
        <div className="hidden sm:block min-w-0">
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