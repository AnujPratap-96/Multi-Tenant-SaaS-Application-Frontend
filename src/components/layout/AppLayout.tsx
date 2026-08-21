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
    <div className="h-screen flex flex-col overflow-hidden bg-canvas">
      <TopNav setSidebarOpen={setSidebarOpen} />

      <div className="flex-1 flex min-w-0 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

        <main className="flex-1 overflow-auto p-6 md:p-8 lg:pl-72">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}