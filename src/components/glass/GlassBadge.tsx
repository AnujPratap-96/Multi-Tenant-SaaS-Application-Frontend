import { cn } from "@/lib/utils";

export interface GlassBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info" | "outline";
  size?: "sm" | "md" | "lg";
  dot?: boolean;
}

const variantStyles = {
  default: "bg-tint text-text-secondary border-glass-border",
  success: "bg-success-500/15 text-success-400 border-success-500/30",
  warning: "bg-warning-500/15 text-warning-400 border-warning-500/30",
  danger: "bg-danger-500/15 text-danger-400 border-danger-500/30",
  info: "bg-accent-cyan/15 text-accent-cyan border-accent-cyan/30",
  outline: "bg-transparent text-text-secondary border-glass-border",
};

const sizeStyles = {
  sm: "px-2 py-0.5 text-[10px] gap-1",
  md: "px-2.5 py-1 text-xs gap-1.5",
  lg: "px-3 py-1.5 text-sm gap-2",
};

const dotStyles = {
  success: "bg-success-500",
  warning: "bg-warning-500",
  danger: "bg-danger-500",
  info: "bg-accent-cyan",
  default: "bg-text-muted",
  outline: "bg-text-muted",
};

export function GlassBadge({
  className,
  variant = "default",
  size = "md",
  dot,
  children,
  ...props
}: GlassBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full border",
        "glass backdrop-blur-sm",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            "rounded-full",
            "h-1.5 w-1.5 sm:h-2 sm:w-2 md:h-2.5 md:w-2.5",
            dotStyles[variant]
          )}
        />
      )}
      {children}
    </span>
  );
}

export function GlassStatusBadge({
  status,
  size = "md",
  className,
}: { status: "active" | "inactive" | "pending" | "error" | "success" | "warning"; size?: "sm" | "md" | "lg"; className?: string }) {
  const config = {
    active: { variant: "success" as const, label: "Active", dot: true },
    inactive: { variant: "default" as const, label: "Inactive", dot: true },
    pending: { variant: "warning" as const, label: "Pending", dot: true },
    error: { variant: "danger" as const, label: "Error", dot: true },
    success: { variant: "success" as const, label: "Success", dot: true },
    warning: { variant: "warning" as const, label: "Warning", dot: true },
  };

  const cfg = config[status];
  return <GlassBadge variant={cfg.variant} size={size} dot={cfg.dot} className={className}>{cfg.label}</GlassBadge>;
}