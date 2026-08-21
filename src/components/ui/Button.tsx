/**
 * F-23: Aurora Glassmorphic Button Component.
 * 
 * Design direction:
 * - Primary: Aurora gradient accent with subtle inner highlight
 * - Secondary: Glass surface with controlled blur
 * - Ghost: Transparent with subtle border focus
 * - Outline: Border-based with soft hover expansion
 * - Glass: True glassmorphism with backdrop-filter
 * - Danger: Muted red with soft accent
 * - Link: Text-like underline interaction
 * 
 * All states: default, hover, active, focus, disabled, loading
 * Framer Motion micro-interactions handled by parent components
 * CSS custom properties from design tokens (--primary, --aurora-*)
 */

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "outline" | "glass" | "danger" | "link";
export type ButtonSize = "default" | "sm" | "lg" | "icon";

/** Color mapping for button variants using CSS custom properties and Aurora tokens */
const variantColors: Record<ButtonVariant, {
  bg: string;
  fg: string;
  hoverBg: string;
  activeBg: string;
  border: string;
}> = {
  primary: {
    bg: "bg-gradient-to-br from-aurora-cyan to-aurora-blue hover:from-aurora-cyan/90 hover:to-aurora-blue/90 active:from-aurora-cyan/80 active:to-aurora-blue/80",
    fg: "text-white",
    hoverBg: "hover:from-aurora-cyan/80 hover:to-aurora-blue/80",
    activeBg: "active:from-aurora-cyan/70 active:to-aurora-blue/70",
    border: "border-transparent",
  },
  secondary: {
    bg: "glass glass-subtle",
    fg: "text-foreground dark:text-dark-foreground",
    hoverBg: "hover:glass-medium",
    activeBg: "active:glass-medium",
    border: "border-border/30 dark:border-border/30",
  },
  ghost: {
    bg: "bg-transparent",
    fg: "text-foreground dark:text-dark-foreground",
    hoverBg: "hover:bg-surface-muted dark:hover:bg-surface-muted/30",
    activeBg: "active:bg-surface-muted dark:active:bg-surface-muted/30",
    border: "border-border/20 dark:border-border/20 hover:border-primary",
  },
  outline: {
    bg: "bg-transparent",
    fg: "text-foreground dark:text-dark-foreground",
    hoverBg: "hover:bg-surface-muted dark:hover:bg-surface-muted/30",
    activeBg: "active:bg-surface-muted dark:active:bg-surface-muted/30",
    border: "border-border hover:border-primary/40 dark:hover:border-primary/40 dark:active:border-primary/30",
  },
  glass: {
    bg: "bg-surface-50/5 dark:bg-neutral-900/20 backdrop-blur-md hover:bg-surface-50/10 dark:hover:bg-neutral-900/30",
    fg: "text-foreground dark:text-dark-foreground",
    hoverBg: "hover:bg-surface-50/10 dark:hover:bg-neutral-900/40",
    activeBg: "active:bg-surface-50/5 dark:active:bg-neutral-900/20",
    border: "border-border/30 dark:border-border/30 hover:border-primary/40",
  },
  danger: {
    bg: "bg-red-600/10 dark:bg-red-600/20",
    fg: "text-red-600 dark:text-red-400",
    hoverBg: "hover:bg-red-600/20",
    activeBg: "active:bg-red-600/20",
    border: "border-red-600/20 dark:border-red-600/30",
  },
  link: {
    bg: "bg-transparent underline-offset-4 hover:underline text-aurora-blue",
    fg: "text-aurora-blue",
    hoverBg: "bg-transparent",
    activeBg: "bg-transparent",
    border: "border-transparent underline",
  },
};

/** Size mapping for button variants */
const variantSizes: Record<ButtonSize, {
  height: string;
  padding: string;
  fontSize: string;
}> = {
  default: {
    height: "h-11",
    padding: "px-5 py-2.5",
    fontSize: "sm",
  },
  sm: {
    height: "h-9",
    padding: "px-3",
    fontSize: "sm",
  },
  lg: {
    height: "h-12",
    padding: "px-6",
    fontSize: "sm",
  },
  icon: {
    height: "h-10 w-10",
    padding: "0",
    fontSize: "sm",
  },
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "default", isLoading, children, disabled, type, ...props }, ref) => {
    const sizeStyles = variantSizes[size];

    return (
      <button
        ref={ref}
        type={type ?? "button"}
        disabled={disabled || isLoading}
        className={cn(
          // Base button styles - premium SaaS button foundation
          "inline-flex items-center justify-center whitespace-nowrap rounded-lg transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer disabled:cursor-not-relative",
          // Variant-specific glass/gradient styles
          variantColors[variant],
          // Size-specific styles
          sizeStyles.height,
          sizeStyles.padding,
          `text-${sizeStyles.fontSize} font-medium`,
          // State
          isLoading && "relative overflow-hidden",
          className
        )}
        {...props}
      >
        {isLoading && (
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-3.5 w-3.5 animate-spin">
            <svg className="h-3.5 w-3.5 stroke-current" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="10 8 12 12 14 8"></polyline>
            </svg>
          </span>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";