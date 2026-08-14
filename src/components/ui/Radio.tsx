import { forwardRef, type InputHTMLAttributes, useId } from "react";
import { cn } from "@/lib/utils";

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  label?: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    return (
      <label htmlFor={inputId} className="inline-flex items-center gap-2 cursor-pointer select-none">
        <input
          id={inputId}
          ref={ref}
          type="radio"
          className={cn(
            "h-4 w-4 border-gray-300 dark:border-gray-700 text-primary-600 focus:ring-primary-500 accent-primary-600",
            className
          )}
          {...props}
        />
        {label && <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>}
      </label>
    );
  }
);
Radio.displayName = "Radio";
