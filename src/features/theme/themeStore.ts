/**
 * Theme architecture for the SaaS application.
 *
 * Supports:
 * - Light mode (intentionally designed)
 * - Dark mode (primary visual experience - Midnight Aurora)
 * - System theme (respects prefers-color-scheme)
 *
 * Uses `data-theme` attribute on documentElement for CSS variable switching.
 * Initial theme is applied at module load (before React renders) to prevent flash.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

interface ThemeState {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  initTheme: () => void;
}

const STORAGE_KEY = "nexus-theme";

function getDocument(): Document | undefined {
  return typeof document !== "undefined" ? document : undefined;
}

function resolveSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function resolveTheme(theme: Theme): ResolvedTheme {
  if (theme === "system") return resolveSystemTheme();
  return theme;
}

function applyResolvedTheme(resolved: ResolvedTheme) {
  const doc = getDocument();
  if (!doc) return;
  doc.documentElement.setAttribute("data-theme", resolved);
  if (resolved === "dark") {
    doc.documentElement.classList.add("dark");
  } else {
    doc.documentElement.classList.remove("dark");
  }
}

function readStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") return stored;
  } catch {
    // ignore
  }
  return "dark"; // Default to dark mode (primary experience)
}

function persistTheme(theme: Theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // ignore
  }
}

function getInitialResolved(): ResolvedTheme {
  return resolveTheme(readStoredTheme());
}

// Apply initial theme at module load so public pages are themed
// before any component mounts or renders.
if (typeof document !== "undefined") {
  applyResolvedTheme(getInitialResolved());
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: "dark",
      resolvedTheme: getInitialResolved(),

      setTheme: (theme: Theme) => {
        const resolved = resolveTheme(theme);
        applyResolvedTheme(resolved);
        persistTheme(theme);
        set({ theme, resolvedTheme: resolved });
      },

      toggleTheme: () => {
        const current = get().resolvedTheme;
        const next: Theme = current === "dark" ? "light" : "dark";
        get().setTheme(next);
      },

      initTheme: () => {
        const stored = readStoredTheme();
        const resolved = resolveTheme(stored);
        applyResolvedTheme(resolved);
        set({ theme: stored, resolvedTheme: resolved });
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);

// Subscribe to system theme changes when in "system" mode
if (typeof window !== "undefined" && window.matchMedia) {
  const mql = window.matchMedia("(prefers-color-scheme: dark)");
  const handler = () => {
    const state = useThemeStore.getState();
    if (state.theme === "system") {
      const resolved = resolveSystemTheme();
      applyResolvedTheme(resolved);
      useThemeStore.setState({ resolvedTheme: resolved });
    }
  };
  mql.addEventListener?.("change", handler);
}
