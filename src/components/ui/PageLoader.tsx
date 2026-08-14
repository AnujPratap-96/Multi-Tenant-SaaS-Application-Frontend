import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// eslint-disable-next-line react-refresh/only-export-components
export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn("h-5 w-5 animate-spin text-primary-500", className)} aria-hidden />;
}

export default function PageLoader() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="h-full min-h-[400px] flex flex-col items-center justify-center gap-3 text-gray-400"
    >
      <Spinner className="h-8 w-8 text-primary-500" />
      <span className="text-sm">Loading...</span>
    </div>
  );
}
