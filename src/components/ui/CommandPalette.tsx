import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  LayoutDashboard,
  Building2,
  FolderKanban,
  CheckSquare,
  Users,
  Shield,
  ClipboardList,
  Settings,
  UserCircle,
  Plus,
  SunMoon,
  ArrowRight,
  Sparkles,
  Command,
  X,
} from "lucide-react";
import { useTenantStore } from "@/features/tenant/tenantStore";
import { useThemeStore } from "@/features/theme/themeStore";

interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  category: "Navigation" | "Actions" | "Organizations";
  icon: React.ElementType;
  shortcut?: string;
  perform: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const { tenants, setCurrentTenant } = useTenantStore();
  const { toggleTheme } = useThemeStore();

  const handleClose = useCallback(() => {
    setQuery("");
    setSelectedIndex(0);
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const items: CommandItem[] = useMemo(() => {
    const list: CommandItem[] = [
      // Navigation
      {
        id: "nav-dashboard",
        title: "Dashboard Overview",
        subtitle: "Key metrics, active tasks & velocity",
        category: "Navigation",
        icon: LayoutDashboard,
        shortcut: "G D",
        perform: () => {
          navigate("/dashboard");
          onClose();
        },
      },
      {
        id: "nav-tenants",
        title: "Organizations",
        subtitle: "Manage all tenants and subscriptions",
        category: "Navigation",
        icon: Building2,
        shortcut: "G O",
        perform: () => {
          navigate("/dashboard/tenants");
          onClose();
        },
      },
      {
        id: "nav-projects",
        title: "Projects",
        subtitle: "View active repositories and roadmaps",
        category: "Navigation",
        icon: FolderKanban,
        shortcut: "G P",
        perform: () => {
          navigate("/dashboard/projects");
          onClose();
        },
      },
      {
        id: "nav-tasks",
        title: "Task Board",
        subtitle: "Kanban board and sprint planning",
        category: "Navigation",
        icon: CheckSquare,
        shortcut: "G T",
        perform: () => {
          navigate("/dashboard/tasks");
          onClose();
        },
      },
      {
        id: "nav-my-tasks",
        title: "My Assigned Tasks",
        subtitle: "Tasks assigned specifically to you",
        category: "Navigation",
        icon: CheckSquare,
        perform: () => {
          navigate("/dashboard/my-tasks");
          onClose();
        },
      },
      {
        id: "nav-departments",
        title: "Departments",
        subtitle: "Team divisions and hierarchy",
        category: "Navigation",
        icon: Building2,
        perform: () => {
          navigate("/dashboard/departments");
          onClose();
        },
      },
      {
        id: "nav-team",
        title: "Team & Members",
        subtitle: "Manage collaborators and invitations",
        category: "Navigation",
        icon: Users,
        shortcut: "G M",
        perform: () => {
          navigate("/dashboard/team");
          onClose();
        },
      },
      {
        id: "nav-roles",
        title: "RBAC & Permissions",
        subtitle: "Security roles, policy matrix",
        category: "Navigation",
        icon: Shield,
        perform: () => {
          navigate("/dashboard/roles");
          onClose();
        },
      },
      {
        id: "nav-audit-logs",
        title: "Audit Logs",
        subtitle: "Immutable security event history",
        category: "Navigation",
        icon: ClipboardList,
        perform: () => {
          navigate("/dashboard/audit-logs");
          onClose();
        },
      },
      {
        id: "nav-profile",
        title: "User Profile",
        subtitle: "Personal settings & session",
        category: "Navigation",
        icon: UserCircle,
        perform: () => {
          navigate("/dashboard/profile");
          onClose();
        },
      },
      {
        id: "nav-settings",
        title: "Tenant Settings",
        subtitle: "Organization profile, domains, security",
        category: "Navigation",
        icon: Settings,
        shortcut: "G S",
        perform: () => {
          navigate("/dashboard/settings");
          onClose();
        },
      },
      // Actions
      {
        id: "act-new-task",
        title: "Create New Task",
        subtitle: "Add task with priority and deadline",
        category: "Actions",
        icon: Plus,
        shortcut: "C T",
        perform: () => {
          navigate("/dashboard/tasks");
          onClose();
        },
      },
      {
        id: "act-new-project",
        title: "Create New Project",
        subtitle: "Initialize a new project workspace",
        category: "Actions",
        icon: Plus,
        shortcut: "C P",
        perform: () => {
          navigate("/dashboard/projects");
          onClose();
        },
      },
      {
        id: "act-invite",
        title: "Invite Teammate",
        subtitle: "Send email invite with role assignment",
        category: "Actions",
        icon: Users,
        perform: () => {
          navigate("/dashboard/team");
          onClose();
        },
      },
      {
        id: "act-theme",
        title: "Toggle Theme",
        subtitle: "Switch between dark and light appearance",
        category: "Actions",
        icon: SunMoon,
        perform: () => {
          toggleTheme();
          onClose();
        },
      },
    ];

    // Add tenants
    if (tenants.length > 0) {
      tenants.forEach((t) => {
        list.push({
          id: `tenant-${t.id}`,
          title: `Switch to ${t.name}`,
          subtitle: `Plan: ${t.plan || "Free"} • Active Workspace`,
          category: "Organizations",
          icon: Building2,
          perform: () => {
            setCurrentTenant(t.id);
            onClose();
          },
        });
      });
    }

    return list;
  }, [navigate, onClose, tenants, setCurrentTenant, toggleTheme]);

  const filteredItems = useMemo(() => {
    if (!query.trim()) return items;
    const lower = query.toLowerCase();
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(lower) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(lower)) ||
        item.category.toLowerCase().includes(lower)
    );
  }, [items, query]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % (filteredItems.length || 1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          filteredItems[selectedIndex].perform();
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, handleClose]);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selectedElem = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      if (selectedElem) {
        selectedElem.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 sm:px-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-md"
          />

          {/* Modal dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-2xl rounded-2xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#0c1220] shadow-2xl backdrop-blur-2xl overflow-hidden z-10"
          >
            {/* Search Input Bar */}
            <div className="relative flex items-center px-4 py-3.5 border-b border-neutral-200 dark:border-white/10">
              <Search className="h-5 w-5 text-accent-cyan mr-3 flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                placeholder="Type a command, page, or organization..."
                className="w-full bg-transparent text-text-primary text-base placeholder:text-text-muted focus:outline-none"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="p-1 rounded-md text-text-muted hover:text-text-primary mr-2"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-mono text-text-muted bg-neutral-100 dark:bg-white/10 rounded border border-neutral-200 dark:border-white/10">
                ESC
              </kbd>
            </div>

            {/* Command List */}
            <div
              ref={listRef}
              className="max-h-[380px] overflow-y-auto p-2 space-y-1 scrollbar-thin"
            >
              {filteredItems.length === 0 ? (
                <div className="py-12 text-center">
                  <Sparkles className="h-8 w-8 text-accent-cyan/40 mx-auto mb-2" />
                  <p className="text-text-muted text-sm">No matching commands found</p>
                  <p className="text-text-muted/60 text-xs mt-1">Try searching for &quot;Projects&quot;, &quot;Tasks&quot;, or &quot;Theme&quot;</p>
                </div>
              ) : (
                filteredItems.map((item, index) => {
                  const Icon = item.icon;
                  const isSelected = index === selectedIndex;
                  return (
                    <button
                      key={item.id}
                      data-index={index}
                      onClick={item.perform}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all duration-150 ${
                        isSelected
                          ? "bg-accent-cyan/15 text-text-primary border border-accent-cyan/30 shadow-sm"
                          : "text-text-muted hover:bg-neutral-100 dark:hover:bg-white/5 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`p-2 rounded-lg flex-shrink-0 transition-colors ${
                            isSelected
                              ? "bg-accent-cyan text-neutral-950 font-bold"
                              : "bg-neutral-100 dark:bg-white/10 text-text-muted"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="truncate">
                          <p
                            className={`text-sm font-medium ${
                              isSelected ? "text-text-primary" : "text-text-secondary"
                            }`}
                          >
                            {item.title}
                          </p>
                          {item.subtitle && (
                            <p className="text-xs text-text-muted truncate">
                              {item.subtitle}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-neutral-100 dark:bg-white/10 text-text-muted">
                          {item.category}
                        </span>
                        {item.shortcut && (
                          <kbd className="hidden sm:inline-flex text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-white/10 text-text-muted border border-neutral-200 dark:border-white/10">
                            {item.shortcut}
                          </kbd>
                        )}
                        <ArrowRight
                          className={`h-3.5 w-3.5 transition-transform ${
                            isSelected ? "text-accent-cyan translate-x-0.5" : "text-transparent"
                          }`}
                        />
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 bg-neutral-50 dark:bg-[#070b14] border-t border-neutral-200 dark:border-white/10 flex items-center justify-between text-[11px] text-text-muted">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-neutral-200/80 dark:bg-white/10 rounded border border-neutral-300 dark:border-white/10">↑</kbd>
                  <kbd className="px-1.5 py-0.5 bg-neutral-200/80 dark:bg-white/10 rounded border border-neutral-300 dark:border-white/10">↓</kbd>
                  Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-neutral-200/80 dark:bg-white/10 rounded border border-neutral-300 dark:border-white/10">↵</kbd>
                  Execute
                </span>
              </div>
              <div className="flex items-center gap-1 text-accent-cyan/80">
                <Command className="h-3 w-3" />
                <span>Nexus Command v2.0</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
