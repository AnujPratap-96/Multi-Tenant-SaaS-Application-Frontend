import { cn } from "@/lib/utils";

// a11y: hides itself from the accessibility tree; pair with an aria-label wrapper if needed
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("animate-pulse rounded-md bg-gray-200 dark:bg-gray-800", className)}
    />
  );
}
