import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface GlassInputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  hint?: string;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

export const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
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
                : "border-glass-border",
              leadingIcon && "pl-10",
              trailingIcon && "pr-10",
              className
            )}
            {...props}
          />
          {trailingIcon && (
            <div
              className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center h-10"
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
GlassInput.displayName = "GlassInput";

export interface GlassTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  label?: string;
  hint?: string;
}

export const GlassTextarea = forwardRef<HTMLTextAreaElement, GlassTextareaProps>(
  ({ className, error, id, label, hint, ...props }, ref) => {
    const textareaId = id || `textarea-${Math.random().toString(36).slice(2, 9)}`;
    const errorId = `${textareaId}-error`;
    const hintId = `${textareaId}-hint`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-text-secondary mb-1.5"
          >
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          className={cn(
            "glass-input w-full min-h-[100px] rounded-xl p-3 text-sm transition-all duration-200 resize-y",
            "placeholder:text-text-muted",
            "focus:outline-none focus:ring-2 focus:ring-accent-cyan/30 focus:border-accent-cyan/50",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-tint",
            error
              ? "border-danger-500/50 focus:ring-danger-500/30 focus:border-danger-500/50"
              : "border-glass-border",
            className
          )}
          {...props}
        />
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
GlassTextarea.displayName = "GlassTextarea";

export interface GlassSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  label?: string;
  hint?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const GlassSelect = forwardRef<HTMLSelectElement, GlassSelectProps>(
  ({ className, error, id, label, hint, options, placeholder, ...props }, ref) => {
    const selectId = id || `select-${Math.random().toString(36).slice(2, 9)}`;
    const errorId = `${selectId}-error`;
    const hintId = `${selectId}-hint`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-text-secondary mb-1.5"
          >
            {label}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          className={cn(
            "glass-input w-full h-10 rounded-xl px-3 py-2 text-sm transition-all duration-200 appearance-none bg-no-repeat bg-right pr-10",
            "bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748B' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")] bg-[right_0.75rem_center]",
            "focus:outline-none focus:ring-2 focus:ring-accent-cyan/30 focus:border-accent-cyan/50",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-tint",
            error
              ? "border-danger-500/50 focus:ring-danger-500/30 focus:border-danger-500/50"
              : "border-glass-border",
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
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
GlassSelect.displayName = "GlassSelect";