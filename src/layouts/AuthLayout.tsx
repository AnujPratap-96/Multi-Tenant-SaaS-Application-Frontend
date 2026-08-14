import { Outlet, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Hexagon } from "lucide-react";
import ThemeToggle from "../components/ui/ThemeToggle";

const accentColors = ["from-primary-500/40", "via-purple-500/30", "to-pink-500/20"];

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div
          className={`absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br ${accentColors.join(
            " "
          )} rounded-full blur-3xl`}
        />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-primary-500/20 via-purple-500/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-50 dark:opacity-20" />
      </div>

      {/* Theme toggle */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="relative w-full max-w-md bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-8 rounded-2xl shadow-2xl z-10 border border-gray-200/50 dark:border-gray-700/50"
      >
        {/* Accent bar */}
        <div className="absolute top-0 left-8 right-8 h-0.5 bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500 rounded-full" />

        {/* Logo */}
        <div className="flex flex-col items-center justify-center text-center mt-2">
          <Link to="/" className="flex items-center gap-2 mb-6 cursor-pointer group">
            <div className="bg-primary-600 p-2 rounded-xl group-hover:shadow-lg group-hover:shadow-primary-500/25 transition-shadow">
              <Hexagon className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">Nexus</span>
          </Link>
        </div>

        <Outlet />
      </motion.div>
    </div>
  );
}
