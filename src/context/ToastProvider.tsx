import React, { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  Info,
  AlertTriangle,
  X,
} from "lucide-react";
import { ToastContext, type Toast, type ToastType } from "./toastContext";

const TOAST_DURATION = 4000;

const toastConfig: Record<
  ToastType,
  {
    icon: React.ReactNode;
    iconClass: string;
    boxClass: string;
    barClass: string;
  }
> = {
  success: {
    icon: <CheckCircle className="text-xl flex-shrink-0" />,
    iconClass: "text-success-500",
    boxClass:
      "bg-success-500/10 border-success-500/30 text-success-300",
    barClass: "bg-success-500",
  },
  error: {
    icon: <XCircle className="text-xl flex-shrink-0" />,
    iconClass: "text-danger-500",
    boxClass: "bg-danger-500/10 border-danger-500/30 text-danger-300",
    barClass: "bg-danger-500",
  },
  info: {
    icon: <Info className="text-xl flex-shrink-0" />,
    iconClass: "text-accent-cyan",
    boxClass: "bg-accent-cyan/10 border-accent-cyan/30 text-accent-cyan",
    barClass: "bg-accent-cyan",
  },
  warning: {
    icon: <AlertTriangle className="text-xl flex-shrink-0" />,
    iconClass: "text-warning-500",
    boxClass: "bg-warning-500/10 border-warning-500/30 text-warning-300",
    barClass: "bg-warning-500",
  },
};

interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, type: ToastType = "info") => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        removeToast(id);
      }, TOAST_DURATION);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}

      {/* Toast container */}
      <div className="fixed top-4 right-4 z-[9999] flex w-[calc(100vw-2rem)] max-w-[380px] flex-col gap-2.5 pointer-events-none">
        <AnimatePresence initial={false}>
          {toasts.map((toast) => {
            const config = toastConfig[toast.type] || toastConfig.info;
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, x: 60, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 60, scale: 0.9 }}
                transition={{
                  duration: 0.3,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className={`relative flex items-start gap-3 overflow-hidden rounded-2xl border bg-surface-900/90 px-4 py-3 shadow-2xl shadow-black/40 backdrop-blur-xl backdrop-saturate-150 pointer-events-auto ${config.boxClass}`}
              >
                {/* Colored left bar */}
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1 ${config.barClass}`}
                />

                {/* Icon */}
                <span className={`ml-1 ${config.iconClass}`}>
                  {config.icon}
                </span>

                {/* Message */}
                <p className="flex-1 text-sm font-medium leading-snug text-text-primary">
                  {toast.message}
                </p>

                {/* Close */}
                <button
                  onClick={() => removeToast(toast.id)}
                  className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-text-muted transition-all hover:bg-tint-strong hover:text-text-primary"
                  aria-label="Dismiss"
                >
                  <X className="text-xs" />
                </button>

                {/* Auto-dismiss progress bar */}
                <motion.div
                  className={`absolute bottom-0 left-0 h-0.5 opacity-70 ${config.barClass}`}
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{
                    duration: TOAST_DURATION / 1000,
                    ease: "linear",
                  }}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};