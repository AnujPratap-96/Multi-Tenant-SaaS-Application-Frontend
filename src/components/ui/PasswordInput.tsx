import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input, type InputProps } from "./Input";
import { cn } from "@/lib/utils";

export const PasswordInput = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, hint, leadingIcon, ...props }, ref) => {
    const [show, setShow] = useState(false);
    const labelText = show ? "Hide password" : "Show password";

    return (
      <Input
        ref={ref}
        type={show ? "text" : "password"}
        label={label}
        hint={hint}
        leadingIcon={leadingIcon}
        trailingIcon={
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="text-text-muted hover:text-text-primary transition-colors cursor-pointer"
            tabIndex={-1}
            aria-label={labelText}
            aria-pressed={show}
          >
            {show ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
          </button>
        }
        className={cn("pr-10", className)}
        {...props}
      />
    );
  }
);
PasswordInput.displayName = "PasswordInput";