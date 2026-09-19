import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  className?: string;
}

const sizes = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  "2xl": "max-w-5xl",
  full: "max-w-6xl",
};

// Modern, accessible, high-contrast modal dialog
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  size = "md",
  className,
}: DialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (e.key !== "Tab" || !panel) return;
      const focusables = panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusables.length === 0) {
        e.preventDefault();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    const focusTimer = setTimeout(() => {
      const firstField = panel?.querySelector<HTMLElement>(
        "input:not([disabled]), textarea:not([disabled]), select:not([disabled])"
      );
      (firstField ??
        panel?.querySelector<HTMLElement>(
          "a[href], button:not([disabled]), [tabindex]:not([tabindex='-1'])"
        ) ??
        panel)?.focus();
    }, 0);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      clearTimeout(focusTimer);
      previouslyFocused.current?.focus();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-black/75 backdrop-blur-md transition-all animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "dialog-title" : undefined}
        aria-describedby={description ? "dialog-description" : undefined}
        className={cn(
          "relative flex flex-col max-h-[90vh] w-full bg-white dark:bg-[#0c1220] rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6),0_0_40px_rgba(99,102,241,0.08)] border border-neutral-200/90 dark:border-white/10 outline-none overflow-hidden animate-scale-in",
          sizes[size],
          className
        )}
      >
        {/* Sleek top accent highlight gradient */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-accent-cyan via-accent-blue to-accent-indigo pointer-events-none" />

        {(title || description) && (
          <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-neutral-100 dark:border-white/[0.08] bg-neutral-50/50 dark:bg-white/[0.02]">
            <div className="pr-4">
              {title && (
                <h2
                  id="dialog-title"
                  className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white"
                >
                  {title}
                </h2>
              )}
              {description && (
                <p
                  id="dialog-description"
                  className="mt-1 text-sm text-neutral-500 dark:text-neutral-400"
                >
                  {description}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              aria-label="Close dialog"
              className="p-1.5 -mr-1 rounded-xl text-neutral-400 hover:text-neutral-800 dark:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-6 py-5 custom-scrollbar">{children}</div>
      </div>
    </div>
  );
}

// Legacy adapter — keeps Modal API used by existing pages (F-11 migration shim)
export default function Modal(props: DialogProps) {
  return <Dialog {...props} />;
}
