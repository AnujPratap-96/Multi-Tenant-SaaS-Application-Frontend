import { useEffect, useRef, useState } from "react";
import { Bell, X } from "lucide-react";
import { cn } from "../../lib/utils";

// Placeholder notifications — replace with real API data when backend supports it
interface MockNotification {
  id: number;
  text: string;
  time: string;
  read: boolean;
}

const MOCK: MockNotification[] = [
  { id: 1, text: "You were added to Project Alpha", time: "2m ago", read: false },
  { id: 2, text: 'Task "Design wireframes" was assigned to you', time: "1h ago", read: false },
  { id: 3, text: "New member joined your organization", time: "3h ago", read: true },
];

export default function NotificationsPanel() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<MockNotification[]>(MOCK);
  const ref = useRef<HTMLDivElement>(null);
  const unread = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markAllRead = () => setNotifications((n) => n.map((x) => ({ ...x, read: true })));

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center ring-2 ring-white dark:ring-gray-950">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-100 dark:border-gray-800 z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
            <span className="font-semibold text-sm">Notifications</span>
            <div className="flex items-center gap-2">
              {unread > 0 && (
                <button onClick={markAllRead} className="text-xs text-primary-600 hover:underline">
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <ul className="divide-y divide-gray-50 dark:divide-gray-800 max-h-72 overflow-y-auto">
            {notifications.map((n) => (
              <li
                key={n.id}
                className={cn(
                  "px-4 py-3 text-sm",
                  !n.read && "bg-primary-50/60 dark:bg-primary-900/10"
                )}
              >
                <p className={cn("text-gray-800 dark:text-gray-200", !n.read && "font-medium")}>{n.text}</p>
                <p className="text-xs text-gray-400 mt-0.5">{n.time}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
