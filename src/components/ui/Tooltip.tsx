import { useId, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
}

// a11y: role="tooltip" bound to the trigger via aria-describedby
export function Tooltip({ content, children, side = "top", className }: TooltipProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = () => {
    if (timer.current) clearTimeout(timer.current);
    setOpen(true);
  };
  const hide = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(false), 100);
  };

  const position =
    side === "top"
      ? "bottom-full left-1/2 -translate-x-1/2 mb-1"
      : side === "bottom"
        ? "top-full left-1/2 -translate-x-1/2 mt-1"
        : side === "left"
          ? "right-full top-1/2 -translate-y-1/2 mr-1"
          : "left-full top-1/2 -translate-y-1/2 ml-1";

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      <span aria-describedby={id}>{children}</span>
      {open && (
        <span
          id={id}
          role="tooltip"
          className={cn(
            "absolute z-50 whitespace-nowrap rounded-md bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 shadow-lg",
            position,
            className
          )}
        >
          {content}
        </span>
      )}
    </span>
  );
}
