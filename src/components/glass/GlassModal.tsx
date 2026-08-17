import { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { GlassButton } from "./GlassButton";
import { X } from "lucide-react";

interface GlassModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  className?: string;
}

const sizeStyles = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  full: "max-w-4xl",
};

export function GlassModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = "md",
  className,
}: GlassModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
      aria-describedby={description ? "modal-description" : undefined}
    >
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", damping: 30, stiffness: 400 }}
        className={cn(
          "glass-modal relative flex max-h-[85vh] w-full flex-col overflow-hidden rounded-2xl",
          sizeStyles[size],
          className
        )}
      >
        {(title || description) && (
          <div className="flex flex-shrink-0 items-start justify-between gap-4 border-b border-glass-border/50 p-5">
            <div>
              {title && (
                <h2 id="modal-title" className="text-heading-sm font-semibold text-text-primary">
                  {title}
                </h2>
              )}
              {description && (
                <p id="modal-description" className="mt-1 text-body-sm text-text-muted">
                  {description}
                </p>
              )}
            </div>
            <GlassButton
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label="Close modal"
              className="flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </GlassButton>
          </div>
        )}
        <div className="min-h-0 flex-1 overflow-y-auto p-5">{children}</div>
      </motion.div>
    </motion.div>,
    document.body
  );
}

interface GlassConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "primary";
  isLoading?: boolean;
}

export function GlassConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "primary",
  isLoading,
}: GlassConfirmModalProps) {
  return (
    <GlassModal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      {description && (
        <p className="text-body-base text-text-muted mb-6">{description}</p>
      )}
      <div className="flex justify-end gap-3">
        <GlassButton variant="ghost" onClick={onClose} disabled={isLoading}>
          {cancelText}
        </GlassButton>
        <GlassButton variant={variant} onClick={onConfirm} isLoading={isLoading}>
          {confirmText}
        </GlassButton>
      </div>
    </GlassModal>
  );
}