/**
 * F-23: Aurora Glassmorphic Select Component.
 * 
 * Design direction:
 * - Glass surface with subtle backdrop blur
 * - Focus state with aurora accent glow
 * - Option styles matching card depth
 * - Light/dark mode compatible
 */

import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  onValueChange?: (value: string) => void;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, onChange, onValueChange, children, ...props }, ref) => (
    <select
      ref={ref}
      onChange={(e) => {
        onChange?.(e);
        onValueChange?.(e.target.value);
      }}
      className={cn(
        // Glass select surface with backdrop blur
        "glass w-full rounded-lg border border-border/40 bg-transparent px-3 py-2 text-sm transition-colors",
        "placeholder:text-muted-foreground dark:placeholder:text-dark-muted-foreground",
        // Focus state - aurora accent glow
        "focus:outline-none focus:ring-2 focus-ring-inset focus:ring-2 focus:ring-aurora-blue focus:border-transparent",
        // Disabled state
        "disabled:cursor-not-allowed disabled:opacity-50",
        // Additional classes
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
);
Select.displayName = "Select";

/**
 * Option styles - should be applied to option elements within Select
 * Uses the same glass treatment for consistency
 */
export function Option({ className, ...props }: React.HTMLAttributes<HTMLOptionElement>) {
  return <option className={cn("glass py-2 rounded-md px-2 text-sm transition-colors", className)} {...props} />;
}
Option.displayName = "Option";