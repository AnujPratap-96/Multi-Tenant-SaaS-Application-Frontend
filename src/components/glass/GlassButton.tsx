import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type GlassButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "outline"
  | "glass"
  | "danger"
  | "link";

export type GlassButtonSize = "sm" | "md" | "lg" | "icon";

export interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: GlassButtonVariant;
  size?: GlassButtonSize;
  isLoading?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  children: ReactNode;
}

const baseStyles =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold tracking-tight transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:cursor-not-allowed disabled:opacity-50";

const sizeStyles: Record<GlassButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
  icon: "h-10 w-10 p-0",
};

const variantStyles: Record<GlassButtonVariant, string> = {
  primary:
    "bg-gradient-to-r from-accent-cyan to-accent-blue text-white shadow-[0_8px_32px_rgba(34,211,238,0.3)] hover:shadow-[0_12px_40px_rgba(34,211,238,0.4)] hover:-translate-y-0.5 active:translate-y-0 border-transparent",
  secondary:
    "glass border-glass-border text-text-primary hover:border-accent-cyan/40 hover:shadow-glass-lg hover:-translate-y-0.5",
  ghost:
    "bg-transparent text-text-secondary hover:bg-tint hover:text-text-primary",
  outline:
    "bg-transparent border-glass-border text-text-primary hover:border-accent-cyan/50 hover:bg-tint",
  glass:
    "glass border-glass-border text-text-primary hover:border-accent-cyan/40 hover:shadow-glass-lg",
  danger:
    "glass border-danger-500/30 text-danger-400 hover:border-danger-500/50 hover:bg-danger-500/10 hover:shadow-[0_8px_32px_rgba(239,68,68,0.2)]",
  link:
    "bg-transparent text-accent-cyan underline-offset-4 hover:underline",
};

export const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading,
      leadingIcon,
      trailingIcon,
      children,
      disabled,
      type,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type ?? "button"}
        disabled={disabled || isLoading}
        className={cn(
          baseStyles,
          sizeStyles[size],
          variantStyles[variant],
          isLoading && "relative overflow-hidden",
          className
        )}
        {...props}
      >
        {isLoading ? (
          <motion.svg
            className="h-4 w-4 animate-spin"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          >
            <motion.circle
              cx="12"
              cy="12"
              r="10"
              initial={{ strokeDasharray: 0 }}
              animate={{ strokeDasharray: 60 }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <polyline points="10 8 12 12 14 8" />
          </motion.svg>
        ) : (
          <>
            {leadingIcon && <span className="flex-shrink-0">{leadingIcon}</span>}
            {children}
            {trailingIcon && <span className="flex-shrink-0">{trailingIcon}</span>}
          </>
        )}
      </button>
    );
  }
);
GlassButton.displayName = "GlassButton";