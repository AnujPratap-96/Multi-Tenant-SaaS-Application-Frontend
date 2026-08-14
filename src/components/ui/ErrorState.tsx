import type { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "./Button";
import { cn } from "@/lib/utils";

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
  children?: ReactNode;
}

export function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
  className,
  children,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center gap-2 py-12 px-4 text-center",
        className
      )}
    >
      <AlertTriangle className="h-8 w-8 text-red-500" aria-hidden />
      <h3 className="text-base font-medium text-gray-900 dark:text-white">{title}</h3>
      {message && <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">{message}</p>}
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-3">
          Retry
        </Button>
      )}
      {children}
    </div>
  );
}
