import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Hexagon,
  CheckCircle,
  Shield,
  Users,
  KanbanSquare,
  ClipboardList,
  Zap,
  ArrowRight,
  Globe,
  Sparkles,
  Sun,
} from "lucide-react";
import { GlassButton } from "@/components/glass/GlassButton";
import { GlassCard } from "@/components/glass/GlassCard";
import ThemeToggle from "@/components/ui/ThemeToggle";

interface Feature {
  name: string;
  description: string;
  icon: React.ElementType;
  accent: string;
}

const FEATURES: Feature[] = [
  {
    name: "Multi-Tenant Architecture",
    description: "Complete data isolation and customized experiences for every organization.",
    icon: Users,
    accent: "border-accent-cyan/30 bg-accent-cyan/10 text-accent-cyan",
  },
  {
    name: "Advanced RBAC",
    description: "Granular permissions and roles for secure access control.",
    icon: Shield,
    accent: "border-accent-blue/30 bg-accent-blue/10 text-accent-blue",
  },
  {
    name: "Project Management",
    description: "Organize work into projects with dedicated teams and resources.",
    icon: KanbanSquare,
    accent: "border-accent-indigo/30 bg-accent-indigo/10 text-accent-indigo",
  },
  {
    name: "Task Tracking",
    description: "Detailed task management with priorities, assignees, and comments.",
    icon: CheckCircle,
    accent: "border-success-500/30 bg-success-500/10 text-success-400",
  },
  {
    name: "Audit Logging",
    description: "Comprehensive activity tracking for security and compliance.",
    icon: ClipboardList,
    accent: "border-accent-violet/30 bg-accent-violet/10 text-accent-violet",
  },
  {
    name: "High Performance",
    description: "Lightning-fast interactions powered by Redis caching and optimized APIs.",
    icon: Zap,
    accent: "border-warning-500/30 bg-warning-500/10 text-warning-400",
  },
];

interface Stat {
  value: string;
  label: string;
}

const STATS: Stat[] = [
  { value: "10K+", label: "Organizations" },
  { value: "1M+", label: "Projects Created" },
  { value: "99.9%", label: "Uptime SLA" },
  { value: "50+", label: "Countries" },
];

export default function Landing() {
  return (
    <div className="relative h-screen bg-canvas font-sans text-text-primary overflow-x-hidden overflow-y-auto">
      {/* Aurora background */}
      <div className="aurora pointer-events-none" aria-hidden="true" />

      {/* Mesh gradient */}
      <div className="absolute inset-0 -z-10 bg-mesh opacity-30" aria-hidden="true" />

      {/* Navigation */}
      <nav className="sticky top-0 z-50 glass border-b border-glass-border/50 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 cursor-pointer"
            aria-label="Nexus Home"
          >
            <div className="bg-gradient-to-br from-accent-cyan to-accent-blue p-2 rounded-xl">
              <Hexagon className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-text-primary">Nexus</span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-text-muted">
            <a
              href="#features"
              className="hover:text-accent-cyan transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-accent-cyan after:transition-all hover:after:w-full"
            >
              Features
            </a>
            <a
              href="#testimonials"
              className="hover:text-accent-cyan transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-accent-cyan after:transition-all hover:after:w-full"
            >
              Testimonials
            </a>
            <a
              href="#pricing"
              className="hover:text-accent-cyan transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-accent-cyan after:transition-all hover:after:w-full"
            >
              Pricing
            </a>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link
              to="/login"
              className="hidden sm:block text-sm font-medium text-text-muted hover:text-accent-cyan transition-colors"
            >
              Log in
            </Link>
            <Link to="/signup">
              <GlassButton size="sm" trailingIcon={<ArrowRight className="h-3.5 w-3.5" />}>
                Get Started
              </GlassButton>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent-cyan/5 rounded-full blur-3xl" />
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent-blue/5 rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center relative"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border-accent-cyan/30 bg-accent-cyan/10 text-accent-cyan text-xs font-medium mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            <span className="uppercase tracking-[0.2em]">The Multi-Tenant SaaS Platform</span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8 leading-[1.02]">
            Build, Scale & Manage
            <br />
            <span className="gradient-text">Multiple Organizations</span>
            <br />
            <span className="text-text-secondary font-normal">Securely</span>
          </h1>

          <p className="text-xl md:text-2xl text-text-muted mb-12 max-w-3xl mx-auto leading-relaxed">
            The only platform that gives you complete data isolation, granular RBAC,
            and seamless project management across unlimited tenants — all from a single dashboard.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link to="/signup">
              <GlassButton size="lg" className="w-full sm:w-auto text-lg px-10" trailingIcon={<ArrowRight className="h-5 w-5" />}>
                Start Free Trial
              </GlassButton>
            </Link>
            <Link to="/login">
              <GlassButton variant="outline" size="lg" className="w-full sm:w-auto text-lg px-10">
                View Live Demo
              </GlassButton>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-2xl mx-auto">
            {STATS.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + index * 0.08 }}
                className="glass rounded-2xl p-4 md:p-6 border-glass-border/50"
              >
                <p className="text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary gradient-text-cyan">
                  {stat.value}
                </p>
                <p className="text-sm md:text-base text-text-muted mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Floating product preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative mt-16"
        >
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] bg-gradient-to-br from-accent-cyan/10 via-transparent to-accent-blue/10 rounded-[2rem] blur-3xl" />
          </div>

          <GlassCard variant="elevated" padding="none" className="overflow-hidden border-gradient">
            <div className="aspect-video bg-gradient-to-br from-midnight-900 via-midnight-950 to-midnight-900 relative overflow-hidden">
              {/* Mock dashboard preview */}
              <div className="absolute inset-0 p-6 md:p-8 flex flex-col">
                {/* Top bar */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-accent-cyan to-accent-blue p-2 rounded-xl">
                      <Hexagon className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-lg font-bold text-text-primary">Nexus Dashboard</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="glass rounded-lg px-3 py-1 text-xs text-text-muted flex items-center gap-1.5">
                      <Globe className="h-3 w-3" />
                      Acme Corp
                    </div>
                    <div className="glass p-1.5 rounded-lg">
                      <Sun className="h-3.5 w-3.5 text-amber-400" />
                    </div>
                  </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {[
                    { label: "Projects", value: "24", icon: KanbanSquare, color: "accent-cyan" },
                    { label: "Active Tasks", value: "156", icon: CheckCircle, color: "accent-blue" },
                    { label: "Team Members", value: "42", icon: Users, color: "accent-indigo" },
                    { label: "Completed", value: "89%", icon: Zap, color: "success" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="glass rounded-xl p-4 border-glass-border/50 hover:border-accent-cyan/30 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-text-muted uppercase tracking-wide">{item.label}</span>
                        <div className={`bg-${item.color}/10 text-${item.color} p-1.5 rounded-lg`}>
                          <item.icon className="h-4 w-4" />
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-text-primary">{item.value}</p>
                    </div>
                  ))}
                </div>

                {/* Projects Table Preview */}
                <div className="glass rounded-xl border-glass-border/50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-glass-border/50">
                    <h4 className="text-sm font-semibold text-text-primary">Recent Projects</h4>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-text-muted border-b border-glass-border/50">
                          <th className="px-4 py-3 font-medium">Project</th>
                          <th className="px-4 py-3 font-medium">Status</th>
                          <th className="px-4 py-3 font-medium">Progress</th>
                          <th className="px-4 py-3 font-medium">Team</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { name: "Website Redesign", status: "Active", progress: 65, team: 8 },
                          { name: "Mobile App v2.0", status: "Active", progress: 42, team: 12 },
                          { name: "API Migration", status: "Review", progress: 90, team: 5 },
                          { name: "Analytics Dashboard", status: "Planning", progress: 15, team: 4 },
                        ].map((project, i) => (
                          <tr key={i} className="border-b border-glass-border/30 last:border-0 hover:bg-tint transition-colors">
                            <td className="px-4 py-3 font-medium text-text-primary">{project.name}</td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
                                project.status === "Active"
                                  ? "bg-accent-cyan/15 text-accent-cyan"
                                  : project.status === "Review"
                                  ? "bg-accent-blue/15 text-accent-blue"
                                  : "bg-accent-violet/15 text-accent-violet"
                              }`}>
                                {project.status}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="w-24 h-1.5 bg-glass-border rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-accent-cyan to-accent-blue rounded-full"
                                  style={{ width: `${project.progress}%` }}
                                />
                              </div>
                            </td>
                            <td className="px-4 py-3 text-text-muted">{project.team} members</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section
        id="features"
        className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border-accent-cyan/30 bg-accent-cyan/10 text-accent-cyan text-xs font-medium uppercase tracking-[0.2em] mb-4">
            <Sparkles className="h-3 w-3" />
            Core Features
          </span>
          <h2 className="text-heading-xl md:text-heading-2xl text-text-primary">
            Everything you need to <span className="gradient-text">manage at scale</span>
          </h2>
          <p className="mx-auto max-w-2xl text-body-lg text-text-muted mt-4">
            Nexus combines multi-tenancy, RBAC, project management, and audit logging
            in a single delightful experience so you can ship faster with confidence.
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {FEATURES.map((feature, index) => (
            <motion.div
              key={feature.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <GlassCard variant="elevated" padding="lg" className="h-full flex flex-col gap-4 hover:border-accent-cyan/30 transition-all duration-300">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl border ${feature.accent}`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-heading-sm text-text-primary">{feature.name}</h3>
                <p className="text-body-sm text-text-muted flex-1">{feature.description}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section
        id="testimonials"
        className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border-accent-cyan/30 bg-accent-cyan/10 text-accent-cyan text-xs font-medium uppercase tracking-[0.2em] mb-4">
            <Sparkles className="h-3 w-3" />
            Trusted by Teams
          </span>
          <h2 className="text-heading-xl md:text-heading-2xl text-text-primary">
            Loved by developers <span className="gradient-text">worldwide</span>
          </h2>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              name: "Sarah Chen",
              role: "Engineering Lead at TechCorp",
              text: "Nexus transformed how we manage our client projects. The multi-tenant architecture means complete isolation without the overhead.",
              avatar: "https://i.pravatar.cc/150?img=10",
            },
            {
              name: "Marcus Johnson",
              role: "CTO at StartupXYZ",
              text: "Finally, a platform that understands multi-tenant SaaS. RBAC is intuitive, audit logs are comprehensive, and performance is incredible.",
              avatar: "https://i.pravatar.cc/150?img=12",
            },
            {
              name: "Emily Rodriguez",
              role: "VP Engineering at ScaleUp",
              text: "We migrated 50+ organizations to Nexus in a weekend. The team management and project tracking features saved us months of development.",
              avatar: "https://i.pravatar.cc/150?img=20",
            },
            {
              name: "David Park",
              role: "Founder at DevStudio",
              text: "The dashboard gives us complete visibility across all tenants. Our team loves the clean interface and powerful filtering.",
              avatar: "https://i.pravatar.cc/150?img=25",
            },
            {
              name: "Lisa Thompson",
              role: "Product Manager at CloudNine",
              text: "Audit logging alone is worth it. Compliance audits that used to take weeks now take hours. Nexus is a game-changer.",
              avatar: "https://i.pravatar.cc/150?img=30",
            },
            {
              name: "James Wilson",
              role: "Tech Lead at DataFlow",
              text: "Best multi-tenant platform we've evaluated. The attention to detail in the UX — glass surfaces, smooth animations — makes it a joy to use.",
              avatar: "https://i.pravatar.cc/150?img=35",
            },
          ].map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: index * 0.06 }}
            >
              <GlassCard variant="elevated" padding="lg" className="h-full flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="h-12 w-12 rounded-2xl border border-glass-border/50 object-cover"
                  />
                  <div>
                    <p className="text-body-sm font-semibold text-text-primary">{testimonial.name}</p>
                    <p className="text-body-xs text-text-muted">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex gap-1 text-accent-cyan/60 mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <CheckCircle key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="text-body-sm text-text-secondary flex-1">"{testimonial.text}"</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-gradient-to-br from-accent-cyan/10 via-brand-500/5 to-accent-blue/10 rounded-[3rem] blur-3xl" />
        </div>

        <GlassCard variant="elevated" padding="xl" className="relative text-center border-gradient overflow-hidden">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-heading-xl md:text-heading-2xl text-text-primary mb-4"
          >
            Ready to transform your <span className="gradient-text">multi-tenant workflow</span>?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-body-lg text-text-muted mb-10 max-w-2xl mx-auto"
          >
            Join thousands of teams already using Nexus to build, scale, and manage
            their organizations securely. Start your free trial today.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/signup">
              <GlassButton size="lg" className="w-full sm:w-auto text-lg px-10" trailingIcon={<ArrowRight className="h-5 w-5" />}>
                Create Free Account
              </GlassButton>
            </Link>
            <Link to="/login">
              <GlassButton variant="outline" size="lg" className="w-full sm:w-auto text-lg px-10">
                Schedule a Demo
              </GlassButton>
            </Link>
          </motion.div>
        </GlassCard>
      </section>

      {/* Footer */}
      <footer className="border-t border-glass-border/30 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <Link to="/" className="flex items-center gap-2 cursor-pointer">
            <div className="bg-gradient-to-br from-accent-cyan to-accent-blue p-2 rounded-xl">
              <Hexagon className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-text-primary">Nexus</span>
          </Link>
          <div className="flex gap-6 text-sm text-text-muted">
            <a href="#" className="hover:text-accent-cyan transition-colors">Privacy</a>
            <a href="#" className="hover:text-accent-cyan transition-colors">Terms</a>
            <a href="#" className="hover:text-accent-cyan transition-colors">Contact</a>
          </div>
          <p className="text-sm text-text-muted">© 2026 Nexus Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}