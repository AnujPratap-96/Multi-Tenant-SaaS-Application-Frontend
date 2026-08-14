import { Moon, Sun } from "lucide-react";
import { useThemeStore } from "../../features/theme/themeStore";
import { cn } from "../../lib/utils";

interface ThemeToggleProps {
  className?: string;
}

export default function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme } = useThemeStore();

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className={cn(
        "text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors",
        className
      )}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}
