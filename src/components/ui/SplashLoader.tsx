import { Hexagon } from "lucide-react";

export default function SplashLoader() {
  return (
    <div className="h-screen flex flex-col items-center justify-center gap-4 bg-white dark:bg-gray-950">
      <div className="bg-primary-600 p-3 rounded-2xl animate-pulse">
        <Hexagon className="h-8 w-8 text-white" />
      </div>
      <p className="text-sm text-gray-400">Loading Nexus…</p>
    </div>
  );
}
