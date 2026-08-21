import { createContext, useContext, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassDropdownContextValue {
  close: () => void;
}
const GlassDropdownContext = createContext<GlassDropdownContextValue | null>(null);

interface GlassDropdownProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: "left" | "right";
}

export function GlassDropdown({ trigger, children, align = "left" }: GlassDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, right: 0, width: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const open = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) {
      setCoords({ top: rect.bottom + 8, left: rect.left, right: rect.right, width: rect.width });
    }
    setIsOpen(true);
  };
  const close = () => setIsOpen(false);
  const toggle = () => (isOpen ? close() : open());

  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (e: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        close();
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    const onScroll = () => close();
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [isOpen]);

  const positionStyle: CSSProperties =
    align === "right"
      ? { top: coords.top, right: typeof window !== "undefined" ? window.innerWidth - coords.right : 0, minWidth: Math.max(coords.width, 180) }
      : { top: coords.top, left: coords.left, minWidth: Math.max(coords.width, 180) };

  return (
    <GlassDropdownContext.Provider value={{ close }}>
      <div className="relative inline-block" ref={triggerRef}>
        <div onClick={toggle}>{trigger}</div>

        {createPortal(
          <AnimatePresence>
            {isOpen && (
              <motion.div
                ref={dropdownRef}
                key="glass-dropdown"
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ type: "spring", damping: 30, stiffness: 400 }}
                style={positionStyle}
                className="glass-strong fixed z-[100] rounded-xl p-1 shadow-glass-lg"
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
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
      </div>
    </GlassDropdownContext.Provider>
  );
}

interface GlassDropdownItemProps {
  onClick?: () => void;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
}

export function GlassDropdownItem({ onClick, children, disabled, className }: GlassDropdownItemProps) {
  const ctx = useContext(GlassDropdownContext);
  return (
    <button
      type="button"
      onClick={() => {
        onClick?.();
        ctx?.close();
      }}
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
  children: ReactNode;
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
