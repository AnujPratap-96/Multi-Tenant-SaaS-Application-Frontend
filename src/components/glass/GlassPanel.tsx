import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface GlassPanelProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "strong";
}

export const GlassPanel = forwardRef<HTMLDivElement, GlassPanelProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    const variants = {
      default: "glass",
      elevated: "glass-elevated",
      strong: "glass-strong",
    };

    return (
      <div
        ref={ref}
        className={cn(variants[variant], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
GlassPanel.displayName = "GlassPanel";

export const GlassSidebar = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <aside
      ref={ref}
      className={cn("glass-elevated h-full flex flex-col", className)}
      {...props}
    >
      {children}
    </aside>
  )
);
GlassSidebar.displayName = "GlassSidebar";

export const GlassHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <header
      ref={ref}
      className={cn("glass sticky top-0 z-40 border-b border-glass-border/50", className)}
      {...props}
    >
      {children}
    </header>
  )
);
GlassHeader.displayName = "GlassHeader";

export const GlassSection = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <section ref={ref} className={cn("", className)} {...props}>
      {children}
    </section>
  )
);
GlassSection.displayName = "GlassSection";

export const GlassContainer = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("mx-auto max-w-7xl px-4 sm:px-6 lg:px-8", className)}
      {...props}
    >
      {children}
    </div>
  )
);
GlassContainer.displayName = "GlassContainer";