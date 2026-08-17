import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  hint?: string;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, id, label, hint, leadingIcon, trailingIcon, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).slice(2, 9)}`;
    const errorId = `${inputId}-error`;
    const hintId = `${inputId}-hint`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-text-secondary mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leadingIcon && (
            <div
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none transition-colors duration-200"
              aria-hidden="true"
            >
              {leadingIcon}
            </div>
          )}
          <input
            id={inputId}
            type={type ?? "text"}
            ref={ref}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : hint ? hintId : undefined}
            className={cn(
              "glass-input w-full h-10 rounded-xl px-3 py-2 text-sm transition-all duration-200",
              "placeholder:text-text-muted",
              "focus:outline-none focus:ring-2 focus:ring-accent-cyan/30 focus:border-accent-cyan/50",
              "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-tint",
              error
                ? "border-danger-500/50 focus:ring-danger-500/30 focus:border-danger-500/50"
                : "border-border/40",
              leadingIcon && "pl-10",
              trailingIcon && "pr-10",
              className
            )}
            {...props}
          />
          {trailingIcon && (
            <div
              className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none transition-colors duration-200"
              aria-hidden="true"
            >
              {trailingIcon}
            </div>
          )}
        </div>
        {error && (
          <p
            id={errorId}
            role="alert"
            className="mt-1.5 text-sm text-danger-500 animate-slide-in-up"
          >
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={hintId} className="mt-1.5 text-sm text-text-muted">
            {hint}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";