import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassDropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: "left" | "right";
}

export function GlassDropdown({ trigger, children, align = "left" }: GlassDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="relative inline-block" ref={triggerRef}>
      <div onClick={() => setIsOpen((o) => !o)}>{trigger}</div>

      <AnimatePresence>
        {isOpen && createPortal(
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
            className={cn(
              "glass-strong fixed z-[99] min-w-[180px] rounded-xl p-1 shadow-glass-lg",
              align === "right" ? "right-0" : "left-0"
            )}
            role="menu"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-0.5"
            >
              {children}
            </motion.div>
          </motion.div>,
          document.body
        )}
      </AnimatePresence>
    </div>
  );
}

interface GlassDropdownItemProps {
  onClick?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export function GlassDropdownItem({ onClick, children, disabled, className }: GlassDropdownItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      role="menuitem"
      className={cn(
        "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors",
        "text-text-primary hover:bg-tint-strong hover:text-text-primary",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
    >
      {children}
    </button>
  );
}

interface GlassDropdownSectionProps {
  title?: string;
  children: React.ReactNode;
}

export function GlassDropdownSection({ title, children }: GlassDropdownSectionProps) {
  return (
    <div className="space-y-0.5">
      {title && (
        <p className="px-3 py-1.5 text-[11px] font-semibold text-text-muted uppercase tracking-wider">
          {title}
        </p>
      )}
      {children}
    </div>
  );
}

interface GlassDropdownDividerProps {
  className?: string;
}

export function GlassDropdownDivider({ className }: GlassDropdownDividerProps) {
  return <div className={cn("border-t border-glass-border/50 my-1", className)} />;
}