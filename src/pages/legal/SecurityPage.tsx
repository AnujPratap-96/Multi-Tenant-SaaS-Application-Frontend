import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ShieldCheck,
  Lock,
  Database,
  KeyRound,
  Activity,
} from "lucide-react";
import { GlassButton } from "@/components/glass/GlassButton";

export default function SecurityPage() {
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

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-mono text-text-primary">Zero-Trust Active</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="h-4 w-4" /> Security & Compliance Architecture
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-display">
            Built from the ground up for zero-compromise security
          </h1>
          <p className="text-base sm:text-lg text-text-muted leading-relaxed max-w-3xl">
            Nexus SaaS implements defense-in-depth across our infrastructure, application logic, and database storage tiers. Every request is verified, scoped, and audited.
          </p>
        </div>

        {/* Security Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="rounded-3xl bg-white dark:bg-[#0c1220] border border-neutral-200/90 dark:border-white/10 p-7 shadow-xl">
            <div className="p-3 rounded-2xl bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan inline-flex mb-4">
              <Database className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
              Row-Level Tenant Isolation
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed mb-4">
              Every database query executed through our Prisma service layer includes cryptographically validated `tenantId` parameter scoping. Queries without valid tenant context are rejected by middleware before reaching PostgreSQL.
            </p>
            <div className="space-y-2 text-xs font-mono text-accent-cyan bg-neutral-100 dark:bg-[#080d1a] p-3 rounded-xl border border-neutral-200 dark:border-white/5">
              ✓ WHERE tenant_id = req.tenant.id<br />
              ✓ Automatic cross-tenant leakage prevention<br />
              ✓ Indexed compound keys for zero performance tax
            </div>
          </div>

          <div className="rounded-3xl bg-white dark:bg-[#0c1220] border border-neutral-200/90 dark:border-white/10 p-7 shadow-xl">
            <div className="p-3 rounded-2xl bg-accent-blue/10 border border-accent-blue/20 text-accent-blue inline-flex mb-4">
              <KeyRound className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
              JWT Rotation & Double CSRF
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed mb-4">
              Our authentication infrastructure pairs short-lived access tokens with rotating refresh tokens stored in httpOnly, SameSite=Strict cookies, guarded by double-submit CSRF tokens.
            </p>
            <div className="space-y-2 text-xs font-mono text-accent-blue bg-neutral-100 dark:bg-[#080d1a] p-3 rounded-xl border border-neutral-200 dark:border-white/5">
              ✓ RS256 / HS256 signed asymmetric signatures<br />
              ✓ Strict SameSite & Secure cookie policies<br />
              ✓ Cryptographic OTP challenge verification
            </div>
          </div>

          <div className="rounded-3xl bg-white dark:bg-[#0c1220] border border-neutral-200/90 dark:border-white/10 p-7 shadow-xl">
            <div className="p-3 rounded-2xl bg-accent-purple/10 border border-accent-purple/20 text-accent-purple inline-flex mb-4">
              <Activity className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
              Immutable Audit Logging
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed mb-4">
              All high-privilege actions (member role changes, project creations, department assignments, and data exports) generate background BullMQ audit events preserved in immutable logs.
            </p>
            <div className="space-y-2 text-xs font-mono text-accent-purple bg-neutral-100 dark:bg-[#080d1a] p-3 rounded-xl border border-neutral-200 dark:border-white/5">
              ✓ High-throughput async BullMQ processing<br />
              ✓ Actor, IP address, user-agent timestamping<br />
              ✓ Exportable compliance trails for SOC 2 audits
            </div>
          </div>

          <div className="rounded-3xl bg-white dark:bg-[#0c1220] border border-neutral-200/90 dark:border-white/10 p-7 shadow-xl">
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 inline-flex mb-4">
              <Lock className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
              Infrastructure & Network Defense
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed mb-4">
              Deployed behind enterprise DDoS mitigation layers with automatic rate limiting, Helmet security headers, SQL injection sanitation, and TLS 1.3 encryption.
            </p>
            <div className="space-y-2 text-xs font-mono text-emerald-400 bg-neutral-100 dark:bg-[#080d1a] p-3 rounded-xl border border-neutral-200 dark:border-white/5">
              ✓ Distributed Edge DDoS Shielding<br />
              ✓ Strict Content Security Policy (CSP)<br />
              ✓ Automated vulnerability scanning in CI/CD
            </div>
          </div>
        </div>

        {/* Action callout */}
        <div className="rounded-3xl bg-gradient-to-r from-accent-cyan/15 via-accent-blue/10 to-accent-indigo/15 border border-accent-cyan/30 p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
              Need a Custom Security Assessment or DPA?
            </h3>
            <p className="text-sm text-text-muted mt-1 max-w-xl">
              Our security engineering team provides automated vendor questionnaires, SOC 2 bridge letters, and custom enterprise data processing agreements.
            </p>
          </div>
          <a href="mailto:security@nexus-platform.io">
            <GlassButton variant="primary" className="font-semibold whitespace-nowrap">
              Contact Security Team
            </GlassButton>
          </a>
        </div>
      </main>
    </div>
  );
}
