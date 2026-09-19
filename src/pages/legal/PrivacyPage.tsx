import { Link } from "react-router-dom";
import { ArrowLeft, Shield, Lock, Eye, FileText, CheckCircle2 } from "lucide-react";
import { GlassButton } from "@/components/glass/GlassButton";

export default function PrivacyPage() {
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

          <div className="flex items-center gap-3">
            <span className="text-xs px-2.5 py-1 rounded-full bg-accent-cyan/10 text-accent-cyan font-mono border border-accent-cyan/20">
              Version 2.4 — Updated Sept 2026
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* Title */}
        <div className="space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan text-xs font-bold uppercase tracking-wider">
            <Shield className="h-4 w-4" /> Enterprise Privacy Policy
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-display">
            Privacy & Data Protection Notice
          </h1>
          <p className="text-base sm:text-lg text-text-muted leading-relaxed">
            At Nexus SaaS, we operate on a strict Zero-Trust foundation. We hold data security and customer privacy as our core architectural guarantees. This policy outlines how tenant data is collected, isolated, and safeguarded.
          </p>
        </div>

        {/* Content Card */}
        <div className="rounded-3xl bg-white dark:bg-[#0c1220] border border-neutral-200/90 dark:border-white/10 p-6 sm:p-10 shadow-2xl space-y-10">
          {/* Section 1 */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2.5 text-neutral-900 dark:text-white">
              <Lock className="h-5 w-5 text-accent-cyan" /> 1. Strict Multi-Tenant Data Isolation
            </h2>
            <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-300 leading-relaxed">
              Every customer organization operates within a cryptographically isolated tenant boundary.
              We enforce row-level scoping and schema separation at both the application middleware layer and the database layer. No tenant data is ever visible to, combined with, or accessible by unauthorized third parties or adjacent tenants.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-[#080d1a] border border-neutral-200/80 dark:border-white/5">
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Encryption at Rest
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  All databases and backups are encrypted via FIPS 140-2 validated AES-256 keys.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-[#080d1a] border border-neutral-200/80 dark:border-white/5">
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Encryption in Transit
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  Enforced TLS 1.3 for all REST API endpoints, WebSockets, and database pooling.
                </p>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2.5 text-neutral-900 dark:text-white">
              <Eye className="h-5 w-5 text-accent-blue" /> 2. Information We Collect
            </h2>
            <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-300 leading-relaxed">
              We collect only the minimum required metadata necessary to provide high-performance multi-tenant services:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-neutral-600 dark:text-neutral-300">
              <li><strong className="text-neutral-900 dark:text-white">Account Information:</strong> Name, work email address, hashed credentials, and authentication method.</li>
              <li><strong className="text-neutral-900 dark:text-white">Organization Configuration:</strong> Tenant name, custom domains, department hierarchies, and user role assignments.</li>
              <li><strong className="text-neutral-900 dark:text-white">Telemetry & Audit Trails:</strong> Timestamped records of tenant mutations, login events, and API request volume for security compliance.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2.5 text-neutral-900 dark:text-white">
              <FileText className="h-5 w-5 text-accent-purple" /> 3. Data Ownership & Portability
            </h2>
            <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-300 leading-relaxed">
              You maintain 100% ownership of your organization’s data, project records, audit logs, and employee lists.
              At any time, tenant administrators may trigger an encrypted data export or submit a hard-delete purge request in accordance with GDPR Article 17 and CCPA statutory guidelines.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2.5 text-neutral-900 dark:text-white">
              <Shield className="h-5 w-5 text-accent-cyan" /> 4. Data Protection Officer (DPO) Contact
            </h2>
            <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-300 leading-relaxed">
              For any data access inquiries, compliance certifications, or custom Data Processing Agreements (DPA), contact our Security and Privacy Team directly:
            </p>
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-[#080d1a] border border-neutral-200/80 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs uppercase font-bold text-accent-cyan">Security & Compliance Office</div>
                <div className="font-semibold text-neutral-900 dark:text-white text-sm">privacy@nexus-platform.io</div>
              </div>
              <Link to="/security">
                <GlassButton variant="primary" size="sm">
                  View Security Center
                </GlassButton>
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
