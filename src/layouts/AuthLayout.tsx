import { Outlet, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Hexagon } from "lucide-react";
import ThemeToggle from "../components/ui/ThemeToggle";

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-canvas relative overflow-hidden flex flex-col">
      {/* Aurora background */}
      <div className="aurora pointer-events-none" aria-hidden="true" />
      <div className="absolute inset-0 -z-10 bg-mesh opacity-30" aria-hidden="true" />

      {/* Header */}
      <header className="h-14 glass border-b border-glass-border/50 flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
        <Link to="/" className="flex items-center gap-2" aria-label="Nexus Home">
          <div className="bg-gradient-to-br from-accent-cyan to-accent-blue p-2 rounded-xl">
            <Hexagon className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-text-primary">Nexus</span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </header>

      {/* Page content */}
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex-1 flex items-center justify-center p-4 lg:p-6 relative z-10"
      >
        <Outlet />
      </motion.main>
    </div>
  );
}