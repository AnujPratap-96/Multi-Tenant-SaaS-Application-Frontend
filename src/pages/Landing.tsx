import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "../components/ui/Button";
import ThemeToggle from "../components/ui/ThemeToggle";
import {
  Hexagon,
  CheckCircle,
  Shield,
  Users,
  KanbanSquare,
  ClipboardList,
  Zap,
  type LucideIcon,
} from "lucide-react";

interface Feature {
  name: string;
  description: string;
  icon: LucideIcon;
}

const FEATURES: Feature[] = [
  {
    name: "Multi-Tenant Architecture",
    description: "Complete data isolation and customized experiences for every organization.",
    icon: Users,
  },
  {
    name: "Advanced RBAC",
    description: "Granular permissions and roles for secure access control.",
    icon: Shield,
  },
  {
    name: "Project Management",
    description: "Organize work into projects with dedicated teams and resources.",
    icon: KanbanSquare,
  },
  {
    name: "Task Tracking",
    description: "Detailed task management with priorities, assignees, and comments.",
    icon: CheckCircle,
  },
  {
    name: "Audit Logging",
    description: "Comprehensive activity tracking for security and compliance.",
    icon: ClipboardList,
  },
  {
    name: "High Performance",
    description: "Lightning-fast interactions powered by Redis caching and optimized APIs.",
    icon: Zap,
  },
];

export default function Landing() {
  return (
    <div className="bg-white dark:bg-gray-950 min-h-screen font-sans text-gray-900 dark:text-gray-100">
      {/* Navigation */}
      <nav className="border-b border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-gray-950/50 backdrop-blur-md fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => window.scrollTo(0, 0)}
          >
            <div className="bg-primary-600 p-2 rounded-lg">
              <Hexagon className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">Nexus</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600 dark:text-gray-300">
            <a href="#features" className="hover:text-primary-600 transition-colors">
              Features
            </a>
            <a href="#testimonials" className="hover:text-primary-600 transition-colors">
              Testimonials
            </a>
            <a href="#pricing" className="hover:text-primary-600 transition-colors">
              Pricing
            </a>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link to="/login" className="text-sm font-medium hover:text-primary-600 transition-colors">
              Log in
            </Link>
            <Link to="/signup">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-500/10 rounded-full blur-3xl -z-10" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            The Ultimate Platform for <br />{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-purple-600">
              SaaS Collaboration
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-3xl mx-auto">
            Build, scale, and manage multiple organizations securely with our advanced multi-tenant
            architecture, robust RBAC, and seamless project management.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup">
              <Button size="lg" className="w-full sm:w-auto text-lg px-8">
                Start for free
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8">
                View Demo
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section
        id="features"
        className="py-20 bg-gray-50 dark:bg-gray-900 border-y border-gray-100 dark:border-gray-800"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Enterprise-Grade Features</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Everything you need to manage your teams, projects, and tasks across multiple
              organizations.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((feature, idx) => (
              <motion.div
                key={feature.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/30 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.name}</h3>
                <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Placeholder */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-4">Simple, transparent pricing</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-16">Start for free, upgrade when you need to.</p>
        <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-12 max-w-3xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-left">
            <h3 className="text-2xl font-bold mb-2">Pro Plan</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Perfect for growing teams and organizations.
            </p>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-4xl font-bold">$29</span>
              <span className="text-gray-500">/mo per tenant</span>
            </div>
            <ul className="space-y-2 mb-8">
              {["Unlimited Projects", "Advanced RBAC", "Priority Support"].map((i) => (
                <li
                  key={i}
                  className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
                >
                  <CheckCircle className="w-4 h-4 text-green-500" /> {i}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <Link to="/signup">
              <Button size="lg" className="w-full">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 py-20 px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
          Ready to transform your workflow?
        </h2>
        <p className="text-primary-100 mb-10 max-w-2xl mx-auto text-lg">
          Join thousands of teams already using Nexus to build and manage their projects.
        </p>
        <Link to="/signup">
          <Button
            size="lg"
            variant="outline"
            className="bg-white text-primary-600 hover:bg-gray-50 border-white"
          >
            Create Free Account
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 dark:border-gray-800 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => window.scrollTo(0, 0)}
          >
            <Hexagon className="h-6 w-6 text-primary-600" />
            <span className="text-xl font-bold">Nexus</span>
          </div>
          <div className="flex gap-6 text-sm text-gray-500 dark:text-gray-400">
            <a href="#" className="hover:text-primary-600 transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-primary-600 transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-primary-600 transition-colors">
              Contact
            </a>
          </div>
          <p className="text-sm text-gray-500">© 2026 Nexus Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
