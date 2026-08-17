import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopNav from "./TopNav";
import { useThemeStore } from "../../features/theme/themeStore";
import { ErrorBoundary } from "../guards/ErrorBoundary";

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { initTheme } = useThemeStore();

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  return (
    <div className="min-h-screen flex overflow-hidden bg-canvas">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopNav setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 overflow-auto p-6 md:p-8">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}