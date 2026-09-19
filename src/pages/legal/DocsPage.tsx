import { Link } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  Code2,
  Terminal,
} from "lucide-react";
import { GlassButton } from "@/components/glass/GlassButton";

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-canvas text-text-primary selection:bg-accent-cyan/20 relative overflow-hidden">
      <div className="aurora pointer-events-none" aria-hidden="true" />
      <div className="absolute inset-0 -z-10 bg-mesh opacity-20" aria-hidden="true" />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-glass-border/50 bg-canvas/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm font-semibold text-text-muted hover:text-accent-cyan transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Nexus Platform</span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="text-xs px-2.5 py-1 rounded-full bg-accent-cyan/10 text-accent-cyan font-mono border border-accent-cyan/20">
              API v1.0 • REST
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan text-xs font-bold uppercase tracking-wider">
            <BookOpen className="h-4 w-4" /> Platform & API Documentation
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-display">
            Nexus Platform Documentation
          </h1>
          <p className="text-base sm:text-lg text-text-muted leading-relaxed max-w-3xl">
            Complete technical guide for building, managing tenants, integrating REST API endpoints, and orchestrating sprint workflows on the Nexus SaaS platform.
          </p>
        </div>

        {/* Documentation Sections */}
        <div className="space-y-8">
          {/* Quickstart */}
          <div className="rounded-3xl bg-white dark:bg-[#0c1220] border border-neutral-200/90 dark:border-white/10 p-6 sm:p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-3 mb-4">
              <Terminal className="h-6 w-6 text-accent-cyan" /> 1. Quick Start & Architecture
            </h2>
            <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-300 leading-relaxed mb-6">
              Nexus is architected around multi-tenant isolation. Each user can belong to multiple tenants, with permissions resolved through tenant-scoped memberships (`TenantUser`).
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#080d1a] border border-neutral-200/80 dark:border-white/5">
                <div className="text-xs uppercase font-bold text-accent-cyan mb-1">Step 1</div>
                <h3 className="font-bold text-neutral-900 dark:text-white text-sm">Create Organization</h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  Provision an isolated tenant boundary with custom subdomain and billing tier.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#080d1a] border border-neutral-200/80 dark:border-white/5">
                <div className="text-xs uppercase font-bold text-accent-blue mb-1">Step 2</div>
                <h3 className="font-bold text-neutral-900 dark:text-white text-sm">Configure Departments</h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  Assign leads and link projects to functional departments for access segmentation.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#080d1a] border border-neutral-200/80 dark:border-white/5">
                <div className="text-xs uppercase font-bold text-accent-purple mb-1">Step 3</div>
                <h3 className="font-bold text-neutral-900 dark:text-white text-sm">Sprint Tasks & Workspaces</h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  Create sprint tasks with real-time status tracking, assignees, and audit trails.
                </p>
              </div>
            </div>
          </div>

          {/* API Endpoints */}
          <div className="rounded-3xl bg-white dark:bg-[#0c1220] border border-neutral-200/90 dark:border-white/10 p-6 sm:p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-3 mb-4">
              <Code2 className="h-6 w-6 text-accent-blue" /> 2. Core REST API Endpoints
            </h2>
            <div className="space-y-3 font-mono text-xs">
              <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-[#080d1a] border border-neutral-200/80 dark:border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-bold">GET</span>
                  <span className="text-neutral-900 dark:text-white">/api/v1/health</span>
                </div>
                <span className="text-neutral-400">Database & Redis ping check</span>
              </div>
              <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-[#080d1a] border border-neutral-200/80 dark:border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded-md bg-accent-blue/10 text-accent-blue border border-accent-blue/20 font-bold">POST</span>
                  <span className="text-neutral-900 dark:text-white">/api/v1/auth/login-otp</span>
                </div>
                <span className="text-neutral-400">Initiate passwordless login</span>
              </div>
              <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-[#080d1a] border border-neutral-200/80 dark:border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded-md bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20 font-bold">GET</span>
                  <span className="text-neutral-900 dark:text-white">/api/v1/tenants/my</span>
                </div>
                <span className="text-neutral-400">Fetch authenticated user organizations</span>
              </div>
              <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-[#080d1a] border border-neutral-200/80 dark:border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded-md bg-accent-blue/10 text-accent-blue border border-accent-blue/20 font-bold">POST</span>
                  <span className="text-neutral-900 dark:text-white">/api/v1/tasks</span>
                </div>
                <span className="text-neutral-400">Create new sprint task</span>
              </div>
              <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-[#080d1a] border border-neutral-200/80 dark:border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded-md bg-accent-purple/10 text-accent-purple border border-accent-purple/20 font-bold">GET</span>
                  <span className="text-neutral-900 dark:text-white">/api/v1/audit-logs</span>
                </div>
                <span className="text-neutral-400">Paginated tenant audit log trail</span>
              </div>
            </div>
          </div>

          {/* Action callout */}
          <div className="rounded-3xl bg-neutral-50 dark:bg-[#080d1a] border border-neutral-200/90 dark:border-white/10 p-8 text-center">
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
              Ready to Explore the Platform?
            </h3>
            <p className="text-sm text-text-muted mb-6 max-w-md mx-auto">
              Test out real-time task workflows, role transitions, and department structuring in the interactive dashboard.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link to="/login">
                <GlassButton variant="primary" className="font-semibold">
                  Access Platform
                </GlassButton>
              </Link>
              <Link to="/">
                <GlassButton variant="ghost">
                  Back to Home
                </GlassButton>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
