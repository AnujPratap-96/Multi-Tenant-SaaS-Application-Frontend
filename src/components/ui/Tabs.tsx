import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface TabItem {
  value: string;
  label: ReactNode;
  content: ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}

// a11y: tablist/tab/tabpanel with roving tabindex + arrow-key navigation
export function Tabs({ items, value, onValueChange, className }: TabsProps) {
  const generatedId = useId();
  const [internal, setInternal] = useState(items[0]?.value ?? "");
  const active = value ?? internal;
  const activeItem = items.find((i) => i.value === active) ?? items[0];
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  const select = (item: TabItem) => {
    if (item.disabled) return;
    if (value === undefined) setInternal(item.value);
    onValueChange?.(item.value);
    refs.current[items.findIndex((i) => i.value === item.value)]?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    const idx = items.findIndex((i) => i.value === active);
    if (e.key === "ArrowRight") {
      e.preventDefault();
      const next = items[(idx + 1) % items.length];
      if (next) select(next);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const next = items[(idx - 1 + items.length) % items.length];
      if (next) select(next);
    } else if (e.key === "Home") {
      e.preventDefault();
      select(items[0]);
    } else if (e.key === "End") {
      e.preventDefault();
      select(items[items.length - 1]);
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <div role="tablist" aria-label="Tabs" className="flex gap-1 border-b border-gray-200 dark:border-gray-700">
        {items.map((item, i) => (
          <button
            key={item.value}
            role="tab"
            id={`${generatedId}-tab-${item.value}`}
            aria-selected={item.value === active}
            aria-controls={`${generatedId}-panel-${item.value}`}
            tabIndex={item.value === active ? 0 : -1}
            disabled={item.disabled}
            ref={(el) => {
              refs.current[i] = el;
            }}
            onClick={() => select(item)}
            onKeyDown={onKeyDown}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
              item.value === active
                ? "border-primary-600 text-primary-600 dark:text-primary-400"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
      {activeItem && (
        <div
          role="tabpanel"
          id={`${generatedId}-panel-${activeItem.value}`}
          aria-labelledby={`${generatedId}-tab-${activeItem.value}`}
          className="py-4"
        >
          {activeItem.content}
        </div>
      )}
    </div>
  );
}
