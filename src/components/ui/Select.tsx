/**
 * F-23: Aurora theme-aware Select.
 *
 * Replaces the native <select> so the open option list follows the active
 * theme (light/dark) like the custom GlassDropdown used by the organization
 * switcher. Native <select> popups are OS-rendered and ignore CSS theming.
 *
 * Accepts either `options={[{ value, label, icon?, disabled? }]}` or
 * <option> children, and supports both `onChange` (native-like event) and
 * `onValueChange`.
 */

import {
  forwardRef,
  isValidElement,
  useEffect,
  useRef,
  useState,
  Children,
  type ChangeEvent,
  type MutableRefObject,
  type ReactElement,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Check, ChevronDown } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
}

interface SelectProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onChange?: (e: ChangeEvent<HTMLSelectElement>) => void;
  options?: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  children?: ReactNode;
  name?: string;
  id?: string;
}

function extractChildOptions(children: ReactNode): SelectOption[] {
  return Children.toArray(children)
    .filter(
      (c) =>
        isValidElement(c) &&
        (c.type === "option" || (c.type as { displayName?: string })?.displayName === "Option")
    )
    .map((c) => {
      const el = c as ReactElement<{
        value?: string | number;
        children?: ReactNode;
        disabled?: boolean;
      }>;
      return {
        value: String(el.props.value ?? ""),
        label: el.props.children != null ? String(el.props.children) : "",
        disabled: el.props.disabled,
      };
    });
}

export const Select = forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      value,
      defaultValue,
      onValueChange,
      onChange,
      options,
      placeholder = "Select…",
      disabled,
      className,
      children,
      name,
      id,
    },
    ref
  ) => {
    const finalOptions = options ?? extractChildOptions(children);
    const selected =
      finalOptions.find((o) => o.value === value) ??
      finalOptions.find((o) => o.value === defaultValue) ??
      null;

    const [isOpen, setIsOpen] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
    const triggerRef = useRef<HTMLButtonElement | null>(null);

    const open = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (rect) {
        setCoords({ top: rect.bottom + 4, left: rect.left, width: rect.width });
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
          !(document.getElementById("select-portal")?.contains(e.target as Node))
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

    const selectOption = (optionValue: string) => {
      onChange?.({ target: { value: optionValue } } as ChangeEvent<HTMLSelectElement>);
      onValueChange?.(optionValue);
      close();
    };

    return (
      <>
        <button
          ref={(node) => {
            triggerRef.current = node;
            if (typeof ref === "function") ref(node);
            else if (ref) (ref as MutableRefObject<HTMLButtonElement | null>).current = node;
          }}
          type="button"
          id={id}
          name={name}
          disabled={disabled}
          onClick={toggle}
          className={cn(
            "inline-flex items-center justify-between gap-2 rounded-lg transition-colors",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/40",
            "disabled:cursor-not-allowed disabled:opacity-50",
            className ??
              "glass px-3 py-2 text-sm border border-glass-border text-text-primary hover:border-accent-cyan/40"
          )}
        >
          <span className={cn("truncate", !selected && "text-text-muted")}>
            {selected ? selected.label : placeholder}
          </span>
          <ChevronDown className="h-4 w-4 flex-shrink-0 opacity-60" />
        </button>

        {createPortal(
          <AnimatePresence>
            {isOpen && (
              <motion.div
                id="select-portal"
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ type: "spring", damping: 30, stiffness: 400 }}
                style={{ top: coords.top, left: coords.left, minWidth: coords.width }}
                className="glass-strong fixed z-[100] max-h-72 overflow-y-auto rounded-xl p-1 shadow-glass-lg"
                role="listbox"
              >
                {finalOptions.map((option) => {
                  const isSelected = option.value === value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      disabled={option.disabled}
                      onClick={() => selectOption(option.value)}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                        "text-text-primary hover:bg-tint-strong",
                        isSelected && "bg-accent-cyan/10 text-accent-cyan",
                        option.disabled && "cursor-not-allowed opacity-50 hover:bg-transparent"
                      )}
                      role="option"
                      aria-selected={isSelected}
                    >
                      {option.icon && <span className="flex-shrink-0">{option.icon}</span>}
                      <span className="flex-1 truncate">{option.label}</span>
                      {isSelected && <Check className="h-4 w-4 flex-shrink-0 text-accent-cyan" />}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
      </>
    );
  }
);
Select.displayName = "Select";

export function Option({ className, ...props }: React.HTMLAttributes<HTMLOptionElement>) {
  return <option className={cn("py-2 rounded-md px-2 text-sm transition-colors", className)} {...props} />;
}
Option.displayName = "Option";
