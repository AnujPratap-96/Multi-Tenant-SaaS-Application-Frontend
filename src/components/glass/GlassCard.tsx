import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "strong" | "modal" | "interactive";
  padding?: "none" | "sm" | "md" | "lg" | "xl";
  children: ReactNode;
}

const paddingStyles = {
  none: "",
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
  xl: "p-8",
};

const variantStyles = {
  default: "glass",
  elevated: "glass-elevated",
  strong: "glass-strong",
  modal: "glass-modal",
  interactive: "glass transition-all duration-300 hover:border-accent-cyan/30 hover:shadow-glass-lg",
};

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = "default", padding = "md", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl",
          variantStyles[variant],
          paddingStyles[padding],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
GlassCard.displayName = "GlassCard";

export const GlassCardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("px-0 pb-4 border-b border-glass-border/50", className)}
      {...props}
    />
  )
);
GlassCardHeader.displayName = "GlassCardHeader";

export const GlassCardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("text-heading-sm font-semibold text-text-primary", className)}
      {...props}
    />
  )
);
GlassCardTitle.displayName = "GlassCardTitle";

export const GlassCardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("mt-1 text-body-sm text-text-muted", className)}
      {...props}
    />
  )
);
GlassCardDescription.displayName = "GlassCardDescription";

export const GlassCardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("pt-4", className)} {...props} />
  )
);
GlassCardContent.displayName = "GlassCardContent";

export const GlassCardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("mt-4 pt-4 border-t border-glass-border/50", className)}
      {...props}
    />
  )
);
GlassCardFooter.displayName = "GlassCardFooter";