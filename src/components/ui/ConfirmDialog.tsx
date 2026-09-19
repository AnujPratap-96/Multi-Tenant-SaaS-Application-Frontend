import { forwardRef, useEffect, type HTMLAttributes } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ConfirmDialogProps extends HTMLAttributes<HTMLDivElement> {
  /** Whether the dialog is open */
  open?: boolean;
  /** Callback when dialog should close */
  onClose?: () => void;
  /** Callback when confirm action is triggered */
  onConfirm?: () => void;
  /** Dialog title */
  title: string;
  /** Dialog description */
  description: string;
  /** Confirm button text */
  confirmLabel?: string;
  /** Cancel button text */
  cancelLabel?: string;
  /** Whether confirm action is loading */
  isLoading?: boolean;
  /** Variant for visual emphasis */
  variant?: "danger" | "warning" | "primary";
}

export const ConfirmDialog = forwardRef<HTMLDivElement, ConfirmDialogProps>(
  (
    {
      className,
      open,
      onClose,
      onConfirm,
      title,
      description,
      confirmLabel = "Delete",
      cancelLabel = "Cancel",
      isLoading,
      variant = "danger",
      ...props
    },
    ref
  ) => {
    useEffect(() => {
      if (!open) return;
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape" && !isLoading) {
          e.stopPropagation();
          onClose?.();
        }
      };
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "";
      };
    }, [open, isLoading, onClose]);

    if (!open) return null;

    const isDanger = variant === "danger";

    return (
      <div
        ref={ref}
        className={cn(
          "fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in",
          className
        )}
        onClick={(e) => {
          if (e.target === e.currentTarget && !isLoading) {
            onClose?.();
          }
        }}
        {...props}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-dialog-title"
          aria-describedby="confirm-dialog-desc"
          className="relative w-full max-w-md bg-white dark:bg-[#0c1220] rounded-2xl p-6 sm:p-7 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6),0_0_40px_rgba(244,63,94,0.12)] border border-neutral-200/90 dark:border-white/10 outline-none overflow-hidden animate-scale-in"
        >
          {/* Subtle top indicator bar */}
          <div
            className={cn(
              "absolute top-0 inset-x-0 h-1",
              isDanger
                ? "bg-gradient-to-r from-rose-500 via-red-500 to-amber-500"
                : "bg-gradient-to-r from-accent-cyan via-accent-blue to-accent-indigo"
            )}
          />

          <div className="flex items-start gap-4">
            <div
              className={cn(
                "p-3 rounded-2xl flex-shrink-0 flex items-center justify-center",
                isDanger
                  ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
              )}
            >
              <AlertTriangle className="h-6 w-6" />
            </div>

            <div className="flex-1">
              <h3
                id="confirm-dialog-title"
                className="text-lg font-bold text-neutral-900 dark:text-white tracking-tight"
              >
                {title}
              </h3>
              <p
                id="confirm-dialog-desc"
                className="text-sm text-neutral-600 dark:text-neutral-300 mt-1.5 leading-relaxed"
              >
                {description}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-7 pt-4 border-t border-neutral-100 dark:border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2.5 text-sm font-semibold rounded-xl text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/5 border border-neutral-200 dark:border-white/10 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className={cn(
                "px-5 py-2.5 text-sm font-semibold rounded-xl text-white transition-all shadow-lg active:scale-[0.98] cursor-pointer flex items-center gap-2",
                isDanger
                  ? "bg-rose-600 hover:bg-rose-500 shadow-rose-600/25"
                  : "bg-accent-blue hover:bg-accent-blue/90 shadow-accent-blue/25",
                isLoading && "opacity-60 cursor-not-allowed"
              )}
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>{confirmLabel}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }
);
ConfirmDialog.displayName = "ConfirmDialog";