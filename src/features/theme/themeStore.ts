/**
 * F-23: Theme architecture for the SaaS application.
 * 
 * Supports:
 * - Light mode (intentionally designed, not just white)
 * - Dark mode (intentionally designed, not just inverted)
 * - System theme (respects prefers-color-scheme)
 * 
 * Theme values are centralized in the CSS @theme rules in index.css.
 * Components reference CSS custom properties (--foreground, --background, etc.)
 * rather than hardcoding colors.
 * 
 * Theme flashing prevention: initial theme is applied at module load
 * before any layout renders, based on localStorage or system preference.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "light" | "dark" | "system";

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  initTheme: () => void;
}

function applyTheme(theme: Theme, doc: Document) {
  if (theme === "dark") {
    doc.documentElement.classList.add("dark");
  } else {
    doc.documentElement.classList.remove("dark");
  }
}

function resolveInitialTheme(): Theme {
  try {
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    // ignore storage errors
  }
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyInitialTheme(doc: Document) {
  const initial = resolveInitialTheme();
  applyTheme(initial, doc);
}

function getDocument(): Document | undefined {
  return typeof document !== "undefined" ? document : undefined;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "system",
      setTheme: (theme: Theme) => {
        set({ theme });
        const doc = getDocument();
        if (doc) applyTheme(theme, doc);
      },
      initTheme: () => {
        const doc = getDocument();
        if (doc) {
          applyInitialTheme(doc);
          set({ theme: resolveInitialTheme() });
        }
      },
    }),
    {
      name: "theme",
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);

// Initialize theme on mount and subscribe to changes
useThemeStore.subscribe((state, prev) => {
  if (state.theme !== prev.theme) {
    const doc = getDocument();
    if (doc) applyInitialTheme(doc);
  }
});

// Apply initial theme at module load so public pages (Landing, auth) are themed
// before any layout calls initTheme.
if (typeof document !== "undefined") {
  applyInitialTheme(document);
}