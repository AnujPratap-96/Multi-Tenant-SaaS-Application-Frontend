import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Hexagon,
  CheckCircle2,
  KanbanSquare,
  ClipboardList,
  ArrowRight,
  Sparkles,
  Building2,
  Database,
  Cpu,
  Search,
  Activity,
  Check,
  KeyRound,
  ShieldCheck,
} from "lucide-react";
import { GlassButton } from "@/components/glass/GlassButton";
import { GlassCard } from "@/components/glass/GlassCard";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { useCommandPaletteStore } from "@/features/command-palette/commandPaletteStore";

// ==========================================
// MOCK DATA FOR INTERACTIVE PRODUCT DEMO
// ==========================================

interface DemoTenant {
  id: string;
  name: string;
  plan: string;
  projects: number;
  members: number;
  storage: string;
  logoColor: string;
}

const DEMO_TENANTS: DemoTenant[] = [
  {
    id: "acme",
    name: "Acme Cloud Corp",
    plan: "Enterprise Plus",
    projects: 18,
    members: 64,
    storage: "1.4 TB",
    logoColor: "from-cyan-400 to-blue-600",
  },
  {
    id: "stark",
    name: "Stark Industries",
    plan: "Growth Tier",
    projects: 9,
    members: 28,
    storage: "420 GB",
    logoColor: "from-amber-400 to-orange-600",
  },
  {
    id: "cyber",
    name: "CyberDyne Robotics",
    plan: "Custom Scale",
    projects: 34,
    members: 142,
    storage: "4.8 TB",
    logoColor: "from-emerald-400 to-teal-600",
  },
];

interface DemoTask {
  id: string;
  title: string;
  tag: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  status: "todo" | "in_progress" | "done";
  assignee: string;
}

const INITIAL_DEMO_TASKS: DemoTask[] = [
  {
    id: "1",
    title: "Implement Zero-Trust JWT Refresh Rotation",
    tag: "Security",
    priority: "Critical",
    status: "in_progress",
    assignee: "Alex K.",
  },
  {
    id: "2",
    title: "Redis Cluster Sharding for Tenant Isolation",
    tag: "Infra",
    priority: "High",
    status: "done",
    assignee: "Elena M.",
  },
  {
    id: "3",
    title: "Audit Log Cryptographic Hash Verification",
    tag: "Compliance",
    priority: "High",
    status: "todo",
    assignee: "Marcus T.",
  },
  {
    id: "4",
    title: "Dynamic Granular RBAC Role Editor",
    tag: "Frontend",
    priority: "Medium",
    status: "in_progress",
    assignee: "Sarah C.",
  },
  {
    id: "5",
    title: "Automate Supabase Database Migrations",
    tag: "DevOps",
    priority: "Low",
    status: "done",
    assignee: "David R.",
  },
];

interface DemoAuditLog {
  id: string;
  time: string;
  actor: string;
  action: string;
  target: string;
  status: "VERIFIED" | "BLOCKED";
}

const DEMO_AUDIT_LOGS: DemoAuditLog[] = [
  {
    id: "evt-1",
    time: "2s ago",
    actor: "sarah@acme.com",
    action: "TENANT_SWITCH",
    target: "Acme Cloud Corp",
    status: "VERIFIED",
  },
  {
    id: "evt-2",
    time: "14s ago",
    actor: "marcus@stark.io",
    action: "ROLE_PERMISSION_UPDATE",
    target: "Admin -> manage:projects",
    status: "VERIFIED",
  },
  {
    id: "evt-3",
    time: "48s ago",
    actor: "192.241.142.11",
    action: "CSRF_TOKEN_CHALLENGE",
    target: "/api/v1/auth/verify-otp",
    status: "VERIFIED",
  },
  {
    id: "evt-4",
    time: "1m ago",
    actor: "elena@cyberdyne.ai",
    action: "TASK_STATUS_TRANSITION",
    target: "TASK-8904: DONE",
    status: "VERIFIED",
  },
];

export default function Landing() {
  const openCommandPalette = useCommandPaletteStore((s) => s.open);

  // Interactive Demo State
  const [activeTab, setActiveTab] = useState<"tenants" | "kanban" | "rbac" | "audit">("kanban");
  const [selectedTenant, setSelectedTenant] = useState<DemoTenant>(DEMO_TENANTS[0]);
  const [demoTasks, setDemoTasks] = useState<DemoTask[]>(INITIAL_DEMO_TASKS);
  const [activeRbacRole, setActiveRbacRole] = useState<"ADMIN" | "MANAGER" | "MEMBER">("ADMIN");

  // Pricing toggle state
  const [annualBilling, setAnnualBilling] = useState(true);

  // Cycle tasks when clicked in demo
  const handleCycleTaskStatus = (taskId: string) => {
    setDemoTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const nextStatus =
          t.status === "todo" ? "in_progress" : t.status === "in_progress" ? "done" : "todo";
        return { ...t, status: nextStatus };
      })
    );
  };

  return (
    <div className="relative min-h-screen bg-canvas font-sans text-text-primary overflow-x-hidden">
      {/* Background Aurora Lighting Effect */}
      <div className="aurora pointer-events-none fixed inset-0 z-0" aria-hidden="true" />
      <div className="absolute inset-0 -z-10 bg-mesh opacity-25 fixed" aria-hidden="true" />

      {/* ============================================================
          TOP NAVIGATION
          ============================================================ */}
      <header className="sticky top-0 z-50 glass border-b border-glass-border/60 backdrop-blur-2xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 cursor-pointer group" aria-label="Nexus Home">
            <div className="bg-gradient-to-br from-accent-cyan via-accent-blue to-accent-indigo p-2.5 rounded-xl shadow-lg shadow-accent-cyan/20 group-hover:scale-105 transition-transform duration-300">
              <Hexagon className="h-5 w-5 text-white animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-text-primary flex items-center gap-1.5 font-display">
                Nexus <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/30">v2.0</span>
              </span>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-text-muted">
            <a
              href="#demo"
              className="hover:text-accent-cyan transition-colors relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-accent-cyan after:transition-all hover:after:w-full"
            >
              Live Demo
            </a>
            <a
              href="#features"
              className="hover:text-accent-cyan transition-colors relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-accent-cyan after:transition-all hover:after:w-full"
            >
              Architecture
            </a>
            <a
              href="#security"
              className="hover:text-accent-cyan transition-colors relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-accent-cyan after:transition-all hover:after:w-full"
            >
              Security
            </a>
            <a
              href="#pricing"
              className="hover:text-accent-cyan transition-colors relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-accent-cyan after:transition-all hover:after:w-full"
            >
              Pricing
            </a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Quick Command Launcher */}
            <button
              onClick={openCommandPalette}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl glass border-glass-border/60 hover:border-accent-cyan/40 text-text-muted hover:text-text-primary transition-all text-xs"
              title="Open Command Palette (⌘K)"
            >
              <Search className="h-3.5 w-3.5 text-accent-cyan" />
              <span>Search</span>
              <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-surface-800 text-text-muted border border-glass-border">⌘K</kbd>
            </button>

            <ThemeToggle />

            <Link
              to="/login"
              className="text-sm font-semibold text-text-muted hover:text-accent-cyan transition-colors px-2 py-1"
            >
              Log in
            </Link>

            <Link to="/signup">
              <GlassButton
                variant="primary"
                size="sm"
                className="font-semibold shadow-lg shadow-accent-cyan/20"
                trailingIcon={<ArrowRight className="h-3.5 w-3.5" />}
              >
                Launch Console
              </GlassButton>
            </Link>
          </div>
        </div>
      </header>

      {/* ============================================================
          HERO SECTION
          ============================================================ */}
      <section className="relative pt-16 sm:pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center relative max-w-4xl mx-auto"
        >
          {/* Live Product Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass border-accent-cyan/40 bg-accent-cyan/10 text-accent-cyan text-xs font-semibold mb-6 shimmer-badge">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-cyan opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-cyan" />
            </span>
            <span className="tracking-wide">Nexus 2.0 Engine • High Performance Multi-Tenancy</span>
          </div>

          {/* Main Display Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-[1.08] font-display">
            The Multi-Tenant Engine for <br />
            <span className="gradient-text">High-Velocity Teams</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-text-muted max-w-2xl mx-auto mb-10 leading-relaxed">
            Complete database isolation, sub-millisecond Redis session caching, cryptographically verified audit trails,
            and granular RBAC permissions — unified in a single high-performance dashboard.
          </p>

          {/* Dual CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <Link to="/signup" className="w-full sm:w-auto">
              <GlassButton
                variant="primary"
                size="lg"
                className="w-full sm:w-auto text-base px-8 py-3.5 font-bold shadow-xl shadow-accent-cyan/25 glow-cyan"
                trailingIcon={<ArrowRight className="h-4 w-4" />}
              >
                Start Free Trial (14 Days)
              </GlassButton>
            </Link>
            <a href="#demo" className="w-full sm:w-auto">
              <GlassButton
                variant="outline"
                size="lg"
                className="w-full sm:w-auto text-base px-8 py-3.5 font-semibold text-text-primary"
              >
                Explore Interactive Demo
              </GlassButton>
            </a>
          </div>

          {/* Core Metric Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto text-left">
            {[
              { label: "Data Isolation", val: "100%", sub: "Strict tenant isolation" },
              { label: "Redis Caching", val: "< 12ms", sub: "P99 session response" },
              { label: "Uptime SLA", val: "99.99%", sub: "High availability engine" },
              { label: "Enterprise RBAC", val: "40+", sub: "Granular atomic permissions" },
            ].map((stat, i) => (
              <div
                key={i}
                className="glass rounded-xl p-3.5 border-glass-border/50 hover:border-accent-cyan/30 transition-all glow-border-interactive"
              >
                <p className="text-2xl font-black font-display text-accent-cyan">{stat.val}</p>
                <p className="text-xs font-semibold text-text-primary mt-0.5">{stat.label}</p>
                <p className="text-[11px] text-text-muted">{stat.sub}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ============================================================
            INTERACTIVE LIVE PRODUCT DEMO (HERO SHOWCASE)
            ============================================================ */}
        <motion.div
          id="demo"
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative mt-16 max-w-5xl mx-auto"
        >
          {/* Subtle surrounding ambient glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-accent-cyan/20 via-accent-blue/20 to-accent-indigo/20 rounded-3xl blur-2xl opacity-50 -z-10" />

          <GlassCard variant="strong" padding="none" className="overflow-hidden border border-accent-cyan/30 shadow-2xl">
            {/* Demo App Window Topbar */}
            <div className="h-12 bg-surface-950/80 border-b border-glass-border/60 px-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-danger-500/80" />
                  <div className="w-3 h-3 rounded-full bg-warning-500/80" />
                  <div className="w-3 h-3 rounded-full bg-success-500/80" />
                </div>
                <span className="text-xs font-mono text-text-muted ml-3 hidden sm:inline">
                  nexus-console://live-preview
                </span>
              </div>

              {/* Demo Mode Tabs */}
              <div className="flex items-center gap-1 bg-surface-900/90 p-1 rounded-xl border border-glass-border/40 text-xs">
                <button
                  onClick={() => setActiveTab("kanban")}
                  className={`px-3 py-1 rounded-lg font-medium transition-all ${
                    activeTab === "kanban"
                      ? "bg-accent-cyan text-midnight-950 font-bold shadow"
                      : "text-text-muted hover:text-text-primary"
                  }`}
                >
                  Kanban Board
                </button>
                <button
                  onClick={() => setActiveTab("tenants")}
                  className={`px-3 py-1 rounded-lg font-medium transition-all ${
                    activeTab === "tenants"
                      ? "bg-accent-cyan text-midnight-950 font-bold shadow"
                      : "text-text-muted hover:text-text-primary"
                  }`}
                >
                  Multi-Tenant
                </button>
                <button
                  onClick={() => setActiveTab("rbac")}
                  className={`px-3 py-1 rounded-lg font-medium transition-all ${
                    activeTab === "rbac"
                      ? "bg-accent-cyan text-midnight-950 font-bold shadow"
                      : "text-text-muted hover:text-text-primary"
                  }`}
                >
                  RBAC Matrix
                </button>
                <button
                  onClick={() => setActiveTab("audit")}
                  className={`px-3 py-1 rounded-lg font-medium transition-all ${
                    activeTab === "audit"
                      ? "bg-accent-cyan text-midnight-950 font-bold shadow"
                      : "text-text-muted hover:text-text-primary"
                  }`}
                >
                  Audit Stream
                </button>
              </div>

              <div className="hidden sm:flex items-center gap-2 text-xs text-text-muted">
                <span className="w-2 h-2 rounded-full bg-success-400 animate-ping" />
                <span>Live Sandbox</span>
              </div>
            </div>

            {/* Demo Screen Interior */}
            <div className="p-5 sm:p-7 min-h-[420px] bg-canvas/90">
              <AnimatePresence mode="wait">
                {/* TAB 1: KANBAN BOARD */}
                {activeTab === "kanban" && (
                  <motion.div
                    key="kanban"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
                          <KanbanSquare className="h-4 w-4 text-accent-cyan" />
                          Interactive Task Velocity Board
                        </h3>
                        <p className="text-xs text-text-muted">Click any task card to transition its sprint state</p>
                      </div>
                      <span className="text-xs font-mono text-accent-cyan bg-accent-cyan/10 px-2.5 py-1 rounded-full border border-accent-cyan/20">
                        {demoTasks.filter((t) => t.status === "done").length} / {demoTasks.length} Completed
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Column: To-Do */}
                      <div className="glass rounded-xl p-3.5 border-glass-border/40">
                        <div className="flex items-center justify-between text-xs font-bold text-text-muted uppercase tracking-wider mb-3">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-text-muted" /> Backlog
                          </span>
                          <span className="font-mono">{demoTasks.filter((t) => t.status === "todo").length}</span>
                        </div>
                        <div className="space-y-2.5">
                          {demoTasks
                            .filter((t) => t.status === "todo")
                            .map((task) => (
                              <div
                                key={task.id}
                                onClick={() => handleCycleTaskStatus(task.id)}
                                className="p-3 rounded-xl bg-surface-900/90 border border-glass-border hover:border-accent-cyan/50 cursor-pointer transition-all hover:scale-[1.02] shadow-sm"
                              >
                                <div className="flex items-center justify-between mb-1.5">
                                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-800 text-text-muted">
                                    {task.tag}
                                  </span>
                                  <span
                                    className={`text-[10px] font-bold ${
                                      task.priority === "Critical"
                                        ? "text-danger-400"
                                        : task.priority === "High"
                                        ? "text-warning-400"
                                        : "text-text-muted"
                                    }`}
                                  >
                                    {task.priority}
                                  </span>
                                </div>
                                <p className="text-xs font-semibold text-text-primary leading-snug">{task.title}</p>
                                <div className="mt-2.5 flex items-center justify-between text-[11px] text-text-muted">
                                  <span>{task.assignee}</span>
                                  <span className="text-accent-cyan font-mono text-[10px]">Click to advance →</span>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>

                      {/* Column: In Progress */}
                      <div className="glass rounded-xl p-3.5 border-accent-cyan/30 bg-accent-cyan/[0.03]">
                        <div className="flex items-center justify-between text-xs font-bold text-accent-cyan uppercase tracking-wider mb-3">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse" /> In Progress
                          </span>
                          <span className="font-mono">{demoTasks.filter((t) => t.status === "in_progress").length}</span>
                        </div>
                        <div className="space-y-2.5">
                          {demoTasks
                            .filter((t) => t.status === "in_progress")
                            .map((task) => (
                              <div
                                key={task.id}
                                onClick={() => handleCycleTaskStatus(task.id)}
                                className="p-3 rounded-xl bg-surface-900/90 border border-accent-cyan/40 hover:border-accent-cyan cursor-pointer transition-all hover:scale-[1.02] shadow-sm glow-cyan"
                              >
                                <div className="flex items-center justify-between mb-1.5">
                                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-accent-cyan/15 text-accent-cyan">
                                    {task.tag}
                                  </span>
                                  <span
                                    className={`text-[10px] font-bold ${
                                      task.priority === "Critical"
                                        ? "text-danger-400"
                                        : task.priority === "High"
                                        ? "text-warning-400"
                                        : "text-text-muted"
                                    }`}
                                  >
                                    {task.priority}
                                  </span>
                                </div>
                                <p className="text-xs font-semibold text-text-primary leading-snug">{task.title}</p>
                                <div className="mt-2.5 flex items-center justify-between text-[11px] text-text-muted">
                                  <span>{task.assignee}</span>
                                  <span className="text-success-400 font-mono text-[10px]">Click to finish →</span>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>

                      {/* Column: Done */}
                      <div className="glass rounded-xl p-3.5 border-success-500/20 bg-success-500/[0.02]">
                        <div className="flex items-center justify-between text-xs font-bold text-success-400 uppercase tracking-wider mb-3">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-success-400" /> Completed
                          </span>
                          <span className="font-mono">{demoTasks.filter((t) => t.status === "done").length}</span>
                        </div>
                        <div className="space-y-2.5">
                          {demoTasks
                            .filter((t) => t.status === "done")
                            .map((task) => (
                              <div
                                key={task.id}
                                onClick={() => handleCycleTaskStatus(task.id)}
                                className="p-3 rounded-xl bg-surface-900/90 border border-success-500/30 hover:border-success-400 cursor-pointer transition-all hover:scale-[1.02] shadow-sm opacity-90"
                              >
                                <div className="flex items-center justify-between mb-1.5">
                                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-success-500/15 text-success-400">
                                    {task.tag}
                                  </span>
                                  <CheckCircle2 className="h-3.5 w-3.5 text-success-400" />
                                </div>
                                <p className="text-xs font-medium text-text-muted line-through leading-snug">{task.title}</p>
                                <div className="mt-2.5 flex items-center justify-between text-[11px] text-text-muted">
                                  <span>{task.assignee}</span>
                                  <span className="text-text-muted font-mono text-[10px]">Reset ↺</span>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* TAB 2: MULTI-TENANT ISOLATION */}
                {activeTab === "tenants" && (
                  <motion.div
                    key="tenants"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <div>
                      <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-accent-cyan" />
                        Dynamic Tenant Isolation Switcher
                      </h3>
                      <p className="text-xs text-text-muted">
                        Select an organization to simulate header injection (`x-tenant-id`) and isolated data tenancy
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {DEMO_TENANTS.map((tenant) => {
                        const isSelected = tenant.id === selectedTenant.id;
                        return (
                          <div
                            key={tenant.id}
                            onClick={() => setSelectedTenant(tenant)}
                            className={`p-4 rounded-xl cursor-pointer transition-all ${
                              isSelected
                                ? "bg-accent-cyan/10 border-2 border-accent-cyan shadow-lg glow-cyan"
                                : "glass border-glass-border hover:border-accent-cyan/40"
                            }`}
                          >
                            <div className="flex items-center gap-3 mb-3">
                              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${tenant.logoColor} flex items-center justify-center text-white font-bold text-sm shadow`}>
                                {tenant.name[0]}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-text-primary leading-tight">{tenant.name}</p>
                                <p className="text-[11px] text-accent-cyan font-mono">{tenant.plan}</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-1 pt-2 border-t border-glass-border/40 text-center text-xs">
                              <div>
                                <p className="font-bold text-text-primary">{tenant.projects}</p>
                                <p className="text-[10px] text-text-muted">Projects</p>
                              </div>
                              <div>
                                <p className="font-bold text-text-primary">{tenant.members}</p>
                                <p className="text-[10px] text-text-muted">Seats</p>
                              </div>
                              <div>
                                <p className="font-bold text-text-primary">{tenant.storage}</p>
                                <p className="text-[10px] text-text-muted">Storage</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Active Context Simulation Box */}
                    <div className="glass rounded-xl p-4 border-accent-cyan/30 bg-surface-950/60 font-mono text-xs space-y-2">
                      <div className="flex items-center justify-between text-text-muted border-b border-glass-border/40 pb-2">
                        <span className="flex items-center gap-1 text-accent-cyan font-bold">
                          <Database className="h-3.5 w-3.5" /> Row-Level Tenant Security Context
                        </span>
                        <span className="text-[11px] text-success-400">● Isolation Enforced</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-text-secondary">
                        <div>
                          <span className="text-text-muted">x-tenant-id:</span> &quot;{selectedTenant.id}-org-uuid&quot;
                        </div>
                        <div>
                          <span className="text-text-muted">redis-cache-namespace:</span> &quot;tenant:{selectedTenant.id}:*&quot;
                        </div>
                        <div>
                          <span className="text-text-muted">postgres-rls-filter:</span> &quot;WHERE tenant_id = &apos;{selectedTenant.id}&apos;&quot;
                        </div>
                        <div>
                          <span className="text-text-muted">subscription-quota:</span> &quot;Active ({selectedTenant.plan})&quot;
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* TAB 3: RBAC PERMISSION MATRIX */}
                {activeTab === "rbac" && (
                  <motion.div
                    key="rbac"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4 text-accent-cyan" />
                          Granular Role-Based Security Matrix
                        </h3>
                        <p className="text-xs text-text-muted">Switch roles to view dynamic permissions resolution</p>
                      </div>
                      <div className="flex gap-1.5 bg-surface-900 p-1 rounded-xl border border-glass-border">
                        {(["ADMIN", "MANAGER", "MEMBER"] as const).map((r) => (
                          <button
                            key={r}
                            onClick={() => setActiveRbacRole(r)}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                              activeRbacRole === r
                                ? "bg-accent-cyan text-midnight-950 font-bold"
                                : "text-text-muted hover:text-text-primary"
                            }`}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {[
                        { perm: "tenants:manage", desc: "Modify organization billing, domains & settings", min: "ADMIN" },
                        { perm: "roles:assign", desc: "Assign security roles and customize user permissions", min: "ADMIN" },
                        { perm: "projects:delete", desc: "Hard delete projects and archived task histories", min: "ADMIN" },
                        { perm: "projects:create", desc: "Create new workspaces and invite department members", min: "MANAGER" },
                        { perm: "tasks:manage", desc: "Reassign tasks, change deadlines and project milestones", min: "MANAGER" },
                        { perm: "audit:view", desc: "Inspect immutable compliance audit logs and login telemetry", min: "MANAGER" },
                        { perm: "tasks:view", desc: "View task boards, status columns and comment threads", min: "MEMBER" },
                        { perm: "comments:create", desc: "Post discussion comments and mention teammates", min: "MEMBER" },
                      ].map((item, idx) => {
                        const isAllowed =
                          activeRbacRole === "ADMIN"
                            ? true
                            : activeRbacRole === "MANAGER"
                            ? item.min !== "ADMIN"
                            : item.min === "MEMBER";

                        return (
                          <div
                            key={idx}
                            className={`p-3 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                              isAllowed
                                ? "bg-surface-900/80 border-accent-cyan/30"
                                : "bg-surface-950/40 border-glass-border/30 opacity-50"
                            }`}
                          >
                            <div className="min-w-0">
                              <p className="text-xs font-mono font-semibold text-accent-cyan">{item.perm}</p>
                              <p className="text-[11px] text-text-muted leading-tight mt-0.5">{item.desc}</p>
                            </div>
                            <span
                              className={`flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                isAllowed
                                  ? "bg-success-500/15 text-success-400 border border-success-500/30"
                                  : "bg-danger-500/15 text-danger-400 border border-danger-500/30"
                              }`}
                            >
                              {isAllowed ? "ALLOWED" : "DENIED"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* TAB 4: REALTIME AUDIT STREAM */}
                {activeTab === "audit" && (
                  <motion.div
                    key="audit"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
                          <Activity className="h-4 w-4 text-accent-cyan" />
                          Cryptographic Compliance Audit Feed
                        </h3>
                        <p className="text-xs text-text-muted">Real-time immutable ledger with sha256 non-repudiation</p>
                      </div>
                      <span className="flex items-center gap-1.5 text-xs text-success-400 font-mono">
                        <span className="w-2 h-2 rounded-full bg-success-400 animate-pulse" />
                        Listening for events
                      </span>
                    </div>

                    <div className="glass rounded-xl border-glass-border/60 overflow-hidden font-mono text-xs">
                      <div className="grid grid-cols-4 px-4 py-2.5 bg-surface-950/80 border-b border-glass-border/40 text-text-muted font-semibold text-[11px]">
                        <span>TIMESTAMP</span>
                        <span>ACTOR</span>
                        <span>SECURITY ACTION</span>
                        <span className="text-right">INTEGRITY</span>
                      </div>
                      <div className="divide-y divide-glass-border/30">
                        {DEMO_AUDIT_LOGS.map((log) => (
                          <div
                            key={log.id}
                            className="grid grid-cols-4 px-4 py-3 items-center hover:bg-tint transition-colors text-[11px]"
                          >
                            <span className="text-text-muted">{log.time}</span>
                            <span className="text-text-primary truncate">{log.actor}</span>
                            <div>
                              <span className="text-accent-cyan font-bold">{log.action}</span>
                              <p className="text-[10px] text-text-muted truncate">{log.target}</p>
                            </div>
                            <div className="text-right">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-success-500/15 text-success-400 border border-success-500/30">
                                <ShieldCheck className="h-3 w-3" />
                                {log.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </GlassCard>
        </motion.div>
      </section>

      {/* ============================================================
          ENTERPRISE LOGO / SOCIAL PROOF TICKER
          ============================================================ */}
      <section className="py-12 border-y border-glass-border/40 bg-surface-950/40 relative z-10">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-text-muted font-bold mb-6">
            Empowering modern engineering teams worldwide
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 opacity-70 grayscale hover:grayscale-0 transition-all duration-300">
            {["STRIPE", "VERCEL", "SUPABASE", "DATADOG", "SNOWFLAKE", "CLOUDFLARE"].map((logo) => (
              <span key={logo} className="font-display font-extrabold tracking-wider text-base sm:text-xl text-text-muted hover:text-accent-cyan transition-colors">
                {logo}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          BENTO GRID CORE ARCHITECTURE
          ============================================================ */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border-accent-cyan/40 bg-accent-cyan/10 text-accent-cyan text-xs font-bold uppercase tracking-widest mb-3">
            <Sparkles className="h-3.5 w-3.5" /> High-Performance Infrastructure
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold font-display tracking-tight text-text-primary">
            Engineered for Extreme Multi-Tenant Scale
          </h2>
          <p className="text-text-muted text-base sm:text-lg mt-4">
            Nexus solves the complex friction of SaaS architectures so you can focus on building your core product.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Bento Card 1: Giant 2-col card */}
          <GlassCard variant="elevated" padding="lg" className="md:col-span-2 relative overflow-hidden group hover:border-accent-cyan/40 transition-all">
            <div className="flex flex-col h-full justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-accent-cyan/10 border border-accent-cyan/30 flex items-center justify-center text-accent-cyan mb-5 shadow-sm">
                  <Database className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold font-display text-text-primary mb-2">
                  Zero Data Leakage with Virtual Tenant Partitioning
                </h3>
                <p className="text-text-muted text-sm leading-relaxed max-w-xl">
                  Every query is guaranteed to execute within tenant boundaries using Prisma relational constraints and
                  enforced header resolution. No shared un-scoped models, ever.
                </p>
              </div>

              {/* Code snippet visualization */}
              <div className="mt-8 p-4 rounded-xl bg-surface-950/80 border border-glass-border/50 font-mono text-xs text-text-muted space-y-1.5 shadow-inner">
                <p className="text-accent-cyan">// Express 5.0 Tenant Context Pipeline</p>
                <p>router.use(requireAccessToken);</p>
                <p>router.use(resolveTenant); <span className="text-success-400">// Cached in Redis</span></p>
                <p>router.use(requireTenant); <span className="text-accent-blue">// Injects req.tenantId</span></p>
              </div>
            </div>
          </GlassCard>

          {/* Bento Card 2 */}
          <GlassCard variant="elevated" padding="lg" className="hover:border-accent-blue/40 transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-accent-blue/10 border border-accent-blue/30 flex items-center justify-center text-accent-blue mb-5">
                <Cpu className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold font-display text-text-primary mb-2">Sub-10ms Redis Cache</h3>
              <p className="text-text-muted text-sm leading-relaxed">
                Token verification and tenant memberships are cached in cloud Redis. Session lookups never choke your primary database.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2 text-xs font-mono text-success-400 bg-success-500/10 p-2.5 rounded-lg border border-success-500/20">
              <Check className="h-4 w-4" />
              <span>P99 Query: 4.2 milliseconds</span>
            </div>
          </GlassCard>

          {/* Bento Card 3 */}
          <GlassCard variant="elevated" padding="lg" className="hover:border-accent-indigo/40 transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-accent-indigo/10 border border-accent-indigo/30 flex items-center justify-center text-accent-indigo mb-5">
                <KeyRound className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold font-display text-text-primary mb-2">Cryptographic CSRF Shield</h3>
              <p className="text-text-muted text-sm leading-relaxed">
                Double-submit cookie defense with cross-origin SameSite=None support across Render and Vercel cloud domains.
              </p>
            </div>
            <div className="mt-6 text-xs text-text-muted font-mono bg-surface-950 p-2.5 rounded-lg border border-glass-border">
              <span>SHA-256 HMAC protected</span>
            </div>
          </GlassCard>

          {/* Bento Card 4: Giant 2-col card */}
          <GlassCard variant="elevated" padding="lg" className="md:col-span-2 hover:border-accent-cyan/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-accent-violet/10 border border-accent-violet/30 flex items-center justify-center text-accent-violet mb-5">
              <ClipboardList className="h-6 w-6" />
            </div>
            <h3 className="text-2xl font-bold font-display text-text-primary mb-2">
              Audit Trails with Cryptographic Non-Repudiation
            </h3>
            <p className="text-text-muted text-sm leading-relaxed max-w-xl">
              Log every state mutation, role promotion, project assignment, and login attempt with complete IP and user agent telemetry.
              Audit logs are append-only and ready for SOC2 compliance reports.
            </p>
          </GlassCard>
        </div>
      </section>

      {/* ============================================================
          COMPARISON SECTION: MONOLITH VS NEXUS ENGINE
          ============================================================ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-4xl font-bold font-display text-text-primary">
            Why Modern SaaS Teams Choose Nexus
          </h2>
          <p className="text-text-muted text-sm mt-2">Traditional monolithic tenancy vs. Nexus Multi-Tenant 2.0</p>
        </div>

        <div className="glass rounded-2xl border border-glass-border/60 overflow-hidden shadow-2xl">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-glass-border/60 bg-surface-950/60 text-xs font-bold text-text-muted uppercase">
                <th className="py-4 px-6">Capability</th>
                <th className="py-4 px-6 text-text-muted">Legacy In-House SaaS</th>
                <th className="py-4 px-6 text-accent-cyan">Nexus Platform</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-glass-border/30 text-xs sm:text-sm">
              {[
                {
                  cap: "Tenant Isolation",
                  legacy: "Manual WHERE tenant_id filter (prone to leaks)",
                  nexus: "Enforced Middleware & Relational Foreign Bounds",
                },
                {
                  cap: "Cross-Domain Auth",
                  legacy: "Broken cookies on subdomains / Vercel-Render",
                  nexus: "Double-CSRF + Secure SameSite None Architecture",
                },
                {
                  cap: "Session Speed",
                  legacy: "Hit DB on every single authenticated request",
                  nexus: "Sub-millisecond Redis Memory Cache Tier",
                },
                {
                  cap: "Audit Logging",
                  legacy: "Raw console logs or unindexed tables",
                  nexus: "Real-time compliance feed & cryptographic verification",
                },
                {
                  cap: "Role Granularity",
                  legacy: "Simple is_admin boolean",
                  nexus: "40+ atomic scopes with dynamic permission overrides",
                },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-tint transition-colors">
                  <td className="py-4 px-6 font-bold text-text-primary">{row.cap}</td>
                  <td className="py-4 px-6 text-text-muted">{row.legacy}</td>
                  <td className="py-4 px-6 text-accent-cyan font-semibold flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-accent-cyan flex-shrink-0" />
                    <span>{row.nexus}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ============================================================
          TRANSPARENT TIERED PRICING SECTION
          ============================================================ */}
      <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border-accent-cyan/40 bg-accent-cyan/10 text-accent-cyan text-xs font-bold uppercase tracking-widest mb-3">
            Predictable Pricing
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold font-display tracking-tight text-text-primary">
            Scale from Day 1 to Millions
          </h2>
          <p className="text-text-muted text-base mt-3">Simple pricing with no hidden seat fees or surge costs.</p>

          {/* Billing Switcher */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <span className={`text-xs font-bold ${!annualBilling ? "text-text-primary" : "text-text-muted"}`}>
              Monthly Billing
            </span>
            <button
              onClick={() => setAnnualBilling(!annualBilling)}
              className="w-12 h-6 rounded-full bg-surface-800 p-1 border border-glass-border flex items-center transition-colors"
            >
              <div
                className={`w-4 h-4 rounded-full bg-accent-cyan shadow transition-transform ${
                  annualBilling ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
            <span className={`text-xs font-bold flex items-center gap-1.5 ${annualBilling ? "text-text-primary" : "text-text-muted"}`}>
              Annual Billing
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/30">
                Save 20%
              </span>
            </span>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Tier 1: Starter */}
          <GlassCard variant="strong" padding="lg" className="flex flex-col justify-between hover:border-glass-border-strong transition-all">
            <div>
              <p className="text-base font-bold text-text-primary font-display">Starter Developer</p>
              <p className="text-xs text-text-muted mt-1">Perfect for early MVPs & side projects</p>
              <div className="my-6">
                <span className="text-4xl font-extrabold font-display text-text-primary">$0</span>
                <span className="text-xs text-text-muted ml-1">/ forever</span>
              </div>
              <ul className="space-y-3 text-xs text-text-muted">
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-accent-cyan" /> Up to 3 Organizations</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-accent-cyan" /> 10 Team Members</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-accent-cyan" /> Standard RBAC Roles</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-accent-cyan" /> 7-day Audit Log History</li>
              </ul>
            </div>
            <Link to="/signup" className="mt-8 block">
              <GlassButton variant="outline" className="w-full text-xs font-bold">
                Deploy Free
              </GlassButton>
            </Link>
          </GlassCard>

          {/* Tier 2: Pro (Featured) */}
          <GlassCard variant="elevated" padding="lg" className="flex flex-col justify-between border-2 border-accent-cyan shadow-2xl glow-cyan relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-accent-cyan text-midnight-950 font-mono shadow">
              Most Popular
            </div>
            <div>
              <p className="text-base font-bold text-text-primary font-display">Growth Scale</p>
              <p className="text-xs text-text-muted mt-1">For rapidly scaling SaaS companies</p>
              <div className="my-6">
                <span className="text-4xl font-extrabold font-display text-accent-cyan">
                  ${annualBilling ? "39" : "49"}
                </span>
                <span className="text-xs text-text-muted ml-1">/ month</span>
              </div>
              <ul className="space-y-3 text-xs text-text-secondary">
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-accent-cyan" /> Unlimited Organizations</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-accent-cyan" /> 100 Team Members</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-accent-cyan" /> Custom RBAC Overrides</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-accent-cyan" /> 90-day Audit History & Export</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-accent-cyan" /> Priority Redis Caching</li>
              </ul>
            </div>
            <Link to="/signup" className="mt-8 block">
              <GlassButton variant="primary" className="w-full text-xs font-bold shadow-lg shadow-accent-cyan/20">
                Start 14-Day Free Trial
              </GlassButton>
            </Link>
          </GlassCard>

          {/* Tier 3: Enterprise */}
          <GlassCard variant="strong" padding="lg" className="flex flex-col justify-between hover:border-glass-border-strong transition-all">
            <div>
              <p className="text-base font-bold text-text-primary font-display">Enterprise Cloud</p>
              <p className="text-xs text-text-muted mt-1">Dedicated tenancy, SLAs & compliance</p>
              <div className="my-6">
                <span className="text-4xl font-extrabold font-display text-text-primary">$199</span>
                <span className="text-xs text-text-muted ml-1">/ month</span>
              </div>
              <ul className="space-y-3 text-xs text-text-muted">
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-accent-cyan" /> Dedicated VPC / DB Clustering</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-accent-cyan" /> Unlimited Seats & Storage</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-accent-cyan" /> Unlimited Audit Log Archive</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-accent-cyan" /> 99.99% Uptime SLA Guarantee</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-accent-cyan" /> Custom Domain / White-labeling</li>
              </ul>
            </div>
            <Link to="/signup" className="mt-8 block">
              <GlassButton variant="outline" className="w-full text-xs font-bold">
                Contact Sales
              </GlassButton>
            </Link>
          </GlassCard>
        </div>
      </section>

      {/* ============================================================
          BOTTOM CTA SECTION
          ============================================================ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto relative z-10 text-center">
        <GlassCard variant="elevated" padding="lg" className="relative overflow-hidden p-8 sm:p-14 border border-accent-cyan/30 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-accent-cyan/10 via-transparent to-accent-blue/10 pointer-events-none" />
          <h2 className="text-3xl sm:text-5xl font-bold font-display text-text-primary mb-4">
            Ready to Upgrade Your SaaS Architecture?
          </h2>
          <p className="text-text-muted text-base max-w-xl mx-auto mb-8">
            Deploy your first multi-tenant organization in under 60 seconds with full security isolation.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup" className="w-full sm:w-auto">
              <GlassButton variant="primary" size="lg" className="w-full sm:w-auto font-bold px-8" trailingIcon={<ArrowRight className="h-4 w-4" />}>
                Create Your Account Now
              </GlassButton>
            </Link>
            <Link to="/login" className="w-full sm:w-auto">
              <GlassButton variant="ghost" size="lg" className="w-full sm:w-auto font-semibold">
                Sign in to Existing Workspace
              </GlassButton>
            </Link>
          </div>
        </GlassCard>
      </section>

      {/* ============================================================
          MODERN FOOTER
          ============================================================ */}
      <footer className="border-t border-glass-border/50 bg-surface-950/80 py-12 px-4 sm:px-6 lg:px-8 relative z-10 text-xs text-text-muted">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-accent-cyan to-accent-blue p-2 rounded-xl">
              <Hexagon className="h-4 w-4 text-white" />
            </div>
            <span className="text-base font-bold text-text-primary font-display">Nexus SaaS</span>
            <span className="text-text-muted">© 2026 Nexus Cloud. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6">
            {/* Real-time status pill */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full glass border-glass-border">
              <span className="w-2 h-2 rounded-full bg-success-400 animate-ping" />
              <span className="text-[11px] font-mono text-text-primary">All Systems Operational</span>
            </div>

            <a href="#features" className="hover:text-text-primary transition-colors">Documentation</a>
            <a href="#security" className="hover:text-text-primary transition-colors">Security</a>
            <a href="#pricing" className="hover:text-text-primary transition-colors">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}