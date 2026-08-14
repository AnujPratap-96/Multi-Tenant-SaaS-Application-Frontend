/**
 * F-23: Aurora Glassmorphic Input Component.
 * 
 * Design direction:
 * - Glass surface with subtle backdrop blur
 * - Focus state with soft aurora accent glow
 * - Consistent light/dark mode appearance
 * - Smooth transition between states
 * - Error state using status color system
 * 
 * Uses CSS custom properties from the design tokens:
 * --foreground, --background, --input, --focus, --muted-foreground
 */

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, id, ...props }, ref) => (
    <div className="w-full">
      <input
        id={id}
        type={type ?? "text"}
        ref={ref}
        aria-invalid={error ? true : undefined}
        className={cn(
          // Glass input surface with subtle backdrop blur
          "glass w-full h-10 rounded-lg border border-border/40 bg-transparent px-3 py-2 text-sm transition-colors",
          "placeholder:text-muted-foreground dark:placeholder:text-dark-muted-foreground",
          // Focus state - aurora accent glow
          "focus:outline-none focus:ring-2 focus-ring-inset focus:ring-2 focus:ring-aurora-blue focus:border-transparent",
          // Disabled state
          "disabled:cursor-not-allowed disabled:opacity-50",
          // Additional classes
          className
        )}
        {...props}
      />
      {error && (
        <p id={id ? `${id}-error` : undefined} role="alert" className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  )
);
Input.displayName = "Input";