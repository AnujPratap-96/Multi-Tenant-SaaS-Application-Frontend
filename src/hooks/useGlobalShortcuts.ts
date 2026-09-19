import { useEffect } from "react";
import { useCommandPaletteStore } from "@/features/command-palette/commandPaletteStore";

export function useGlobalShortcuts() {
  const { toggle, close } = useCommandPaletteStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        toggle();
      }
      // Escape
      if (e.key === "Escape") {
        close();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggle, close]);
}
