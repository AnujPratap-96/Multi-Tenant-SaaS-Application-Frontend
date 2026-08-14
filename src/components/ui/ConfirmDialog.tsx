/**
 * F-23: ConfirmDialog component.
 * 
 * Confirmation dialog with title, description, and action buttons.
 * Compatible with the old API used by existing pages.
 * Uses CSS custom properties for colors consistent with the design system.
 */

import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps extends HTMLAttributes<HTMLDivElement> {
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
}

export const ConfirmDialog = forwardRef<HTMLDivElement, ConfirmDialogProps>(
  ({ 
    className, 
    open, 
    onClose, 
    onConfirm, 
    title, 
    description, 
    confirmLabel = "Delete", 
    cancelLabel = "Cancel", 
    isLoading,
    ...props 
  }, ref) => {
    if (!open) return null;

    return (
      <div
        ref={ref}
        className={cn(
          "fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4",
          className
        )}
        {...props}
      >
        <div
          className={cn(
            "bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md shadow-lg border border-gray-200 dark:border-gray-800",
            "animate-slide-in-from-right-0 sm:animate-slide-in-from-right-sm"
          )}
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-dialog-title"
        >
          <h3 id="confirm-dialog-title" className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {title}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 line-height-relaxed">
            {description}
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className={cn(
                "px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors",
                "w-40",
                isLoading && "opacity-50 cursor-not-allowed"
              )}
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={cn(
                "px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-md transition-colors",
                "w-40",
                isLoading && "opacity-50 cursor-not-allowed"
              )}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="10 8 12 12 14 8"></polyline>
                  </svg>
                  {confirmLabel}
                </span>
              ) : (
                confirmLabel
              )}
            </button>
          </div>
        </div>
      </div>
    )
  }
);
ConfirmDialog.displayName = "ConfirmDialog";