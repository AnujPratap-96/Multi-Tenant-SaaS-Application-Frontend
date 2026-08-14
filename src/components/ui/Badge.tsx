/**
 * F-23: Aurora Glassmorphic Badge Component.
 * 
 * Design direction using the new Aurora Glassmorphic palette:
 * - Status badges use subtle aura colors with glass treatment
 * - Consistent with the overall design system
 * - Light/dark mode compatible
 * - Pill-shaped with icon + label layout
 */

import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

export type BadgeVariant =
  | "active"
  | "invited"
  | "suspended"
  | "removed"
  | "pending"
  | "cancelled"
  | "accepted"
  | "rejected"
  | "admin"
  | "manager"
  | "user"
  | "free"
  | "pro"
  | "enterprise"
  | "default";

const VARIANTS: Record<BadgeVariant, string> = {
  active: "glass glass-subtle text-aurora-green bg-aurora-green/5 border border-aurora-green/10",
  invited: "glass glass-subtle text-aurora-amber bg-aurora-amber/5 border border-aurora-amber/10",
  suspended: "glass glass-subtle text-aurora-red bg-aurora-red/5 border border-aurora-red/10",
  removed: "bg-gray-100/30 dark:bg-gray-900/40 text-gray-400 dark:text-gray-500 rounded-full px-2 py-0.5 text-xs font-medium",
  pending: "glass glass-subtle text-aurora-amber bg-aurora-amber/5 border border-aurora-amber/10",
  cancelled: "bg-gray-100/30 dark:bg-gray-900/40 text-gray-400 dark:text-gray-500 rounded-full px-2 py-0.5 text-xs font-medium",
  accepted: "glass glass-subtle text-aurora-green bg-aurora-green/5 border border-aurora-green/10",
  rejected: "glass glass-subtle text-aurora-red bg-aurora-red/5 border border-aurora-red/10",
  admin: "glass glass-subtle text-aurora-purple bg-aurora-purple/5 border border-aurora-purple/10",
  manager: "glass glass-subtle text-aurora-blue bg-aurora-blue/5 border border-aurora-blue/10",
  user: "bg-gray-100/30 dark:bg-gray-900/40 text-gray-400 dark:text-gray-500 rounded-full px-2 py-0.5 text-xs font-medium",
  free: "bg-gray-100/30 dark:bg-gray-900/40 text-gray-400 dark:text-gray-500 rounded-full px-2 py-0.5 text-xs font-medium",
  pro: "glass glass-subtle text-primary bg-primary/10 border border-primary/20",
  enterprise: "glass glass-subtle text-aurora-amber bg-aurora-amber/5 border border-aurora-amber/10",
  default: "bg-gray-100/30 dark:bg-gray-900/40 text-gray-400 dark:text-gray-500 rounded-full px-2 py-0.5 text-xs font-medium",
};

export default function Badge({
  label,
  variant = "default",
  icon,
  className,
}: {
  label: string;
  variant?: BadgeVariant;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        VARIANTS[variant],
        className
      )}
    >
      {icon}
      {label}
    </span>
  );
}