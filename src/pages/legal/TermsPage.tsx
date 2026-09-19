import { Link } from "react-router-dom";
import { ArrowLeft, FileCheck, Scale, AlertCircle, RefreshCw, ShieldCheck } from "lucide-react";
import { GlassButton } from "@/components/glass/GlassButton";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-canvas text-text-primary selection:bg-accent-cyan/20 relative overflow-hidden">
      <div className="aurora pointer-events-none" aria-hidden="true" />
      <div className="absolute inset-0 -z-10 bg-mesh opacity-20" aria-hidden="true" />

      {/* Navigation header */}
      <header className="sticky top-0 z-50 border-b border-glass-border/50 bg-canvas/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm font-semibold text-text-muted hover:text-accent-cyan transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Nexus Platform</span>
          </Link>

          <span className="text-xs px-2.5 py-1 rounded-full bg-accent-blue/10 text-accent-blue font-mono border border-accent-blue/20">
            Enterprise Cloud Agreement
          </span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-accent-blue/10 border border-accent-blue/20 text-accent-blue text-xs font-bold uppercase tracking-wider">
            <Scale className="h-4 w-4" /> Legal & Terms
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-display">
            Terms of Service
          </h1>
          <p className="text-base sm:text-lg text-text-muted leading-relaxed">
            These terms govern your subscription and use of the Nexus multi-tenant platform, developer APIs, and software services.
          </p>
        </div>

        <div className="rounded-3xl bg-white dark:bg-[#0c1220] border border-neutral-200/90 dark:border-white/10 p-6 sm:p-10 shadow-2xl space-y-10">
          <section className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2.5 text-neutral-900 dark:text-white">
              <FileCheck className="h-5 w-5 text-accent-cyan" /> 1. Acceptance of Terms
            </h2>
            <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-300 leading-relaxed">
              By accessing or using the Nexus SaaS services or creating an organization tenant, you agree to be bound by these Terms of Service. If you represent an organization or corporate entity, you certify that you have the administrative authority to bind that entity to this agreement.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2.5 text-neutral-900 dark:text-white">
              <ShieldCheck className="h-5 w-5 text-accent-blue" /> 2. Tenant Responsibilities & Access Control
            </h2>
            <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-300 leading-relaxed">
              Tenant administrators are responsible for managing member invitations, maintaining role-based access privileges, and safeguarding master authentication credentials.
              Nexus is not responsible for unauthorized data actions performed by users granted elevated privileges by your organization’s administrators.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2.5 text-neutral-900 dark:text-white">
              <RefreshCw className="h-5 w-5 text-accent-purple" /> 3. Service Level Agreement (SLA) & Uptime
            </h2>
            <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-300 leading-relaxed">
              Nexus maintains a target service availability of 99.99% for Pro and Enterprise subscribers. All primary API clusters are deployed with automated failover, distributed database read replicas, and geographically distributed edge caching.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2.5 text-neutral-900 dark:text-white">
              <AlertCircle className="h-5 w-5 text-accent-amber" /> 4. Acceptable Use Policy
            </h2>
            <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-300 leading-relaxed">
              You agree not to reverse engineer the multi-tenant isolation mechanics, execute unauthorized penetration testing against production clusters, or deploy malicious workloads. Any violation may result in immediate suspension of tenant access.
            </p>
          </section>

          <div className="pt-6 border-t border-neutral-100 dark:border-white/[0.08] flex items-center justify-between">
            <div className="text-xs text-neutral-500 dark:text-neutral-400">
              Questions regarding these terms? Contact legal@nexus-platform.io
            </div>
            <Link to="/privacy">
              <GlassButton variant="ghost" size="sm">
                View Privacy Policy
              </GlassButton>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
