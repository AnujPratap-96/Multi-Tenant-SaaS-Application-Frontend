/**
 * F-23: Aurora Glassmorphic Card Component.
 * 
 * Design direction using CSS custom properties from the new design system:
 * - default: Solid card with subtle premium border (most common)
 * - glass: Subtle glass effect with 16px backdrop blur (Layer 2)
 * - glassElevated: Stronger glass for important cards (Layer 2 premium)
 * - glassStrong: Maximum translucency for modals/dialogs (Layer 3)
 * - glassModal: Modal-level glass with maximum blur (Layer 3 maximum)
 * 
 * Glass is used strategically for hierarchy, NOT on every element.
 * Different surfaces get different depth - no copy-paste values.
 */

import { type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "glassElevated" | "glassStrong" | "glassModal";
}

export function Card({ className, variant = "default", children, ...props }: CardProps) {
  if (variant === "default") {
    return (
      <div
        className={cn(
          // Premium solid card - no glass, has subtle depth
          "rounded-2xl border border-border bg-card dark:bg-dark-card shadow-premium-low",
          className
        )}
        {...props}
      />
    );
  }

  // Glass variants use backdrop-filter for the glassmorphism effect
  // Each variant gets appropriate depth values
  return (
    <div
      className={cn(
        // Glass surface with controlled blur - using CSS custom properties
        `rounded-2xl overflow-hidden backdrop-blur-${variant === "glass" ? "xl" : variant === "glassElevated" ? "2xl" : variant === "glassStrong" ? "3xl" : "xl"} ${variant === "glass"
          ? "bg-surface-50/4 dark:bg-neutral-900/40 border border-neutral-100 dark:border-neutral-700/30"
          : variant === "glassElevated"
            ? "bg-surface-50/6 dark:bg-neutral-900/55 border border-neutral-100 dark:border-neutral-700/40"
            : variant === "glassStrong"
              ? "bg-surface-50/3 dark:bg-neutral-900/45 border border-neutral-100 dark:border-gray-700/45"
              : variant === "glassModal"
                ? "bg-surface-50/8 dark:bg-neutral-900/70 border border-neutral-100 dark:border-gray-700/35"
                : ""}`,
        "shadow-glass",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-6 py-4 border-b border-border dark:border-dark-border", className)} {...props} />;
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-base font-semibold text-foreground dark:text-dark-foreground", className)} {...props} />;
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-6 py-5", className)} {...props} />;
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-6 py-4 border-t border-border-dark", className)} {...props} />;
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-muted-foreground dark:text-dark-muted-foreground", className)} {...props} />;
}

export default function CardDefault({ children, className, variant }: { children: ReactNode; className?: string; variant?: "default" | "glass" | "glassElevated" | "glassStrong" | "glassModal" }) {
  return <Card className={className} variant={variant}>{children}</Card>;
}