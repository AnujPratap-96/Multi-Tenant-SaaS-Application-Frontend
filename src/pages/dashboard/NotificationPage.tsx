import { Bell, CheckCheck } from "lucide-react";
import { useNotifications, useMarkAllNotificationsRead } from "@/features/notifications/notificationsQueries";
import { Button } from "@/components/ui/Button";
import PageLoader from "@/components/ui/PageLoader";

function formatTime(iso?: string) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

export default function NotificationPage() {
  const { data, isLoading } = useNotifications({ limit: 50 });
  const markAll = useMarkAllNotificationsRead();
  const items = data?.items ?? [];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary-500" /> Notifications
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {data?.unreadCount ? `${data.unreadCount} unread` : "You're all caught up"}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => markAll.mutate()}
          disabled={markAll.isPending || (data?.unreadCount ?? 0) === 0}
        >
          <CheckCheck className="h-4 w-4 mr-1.5" /> Mark all read
        </Button>
      </div>

      {isLoading ? (
        <PageLoader />
      ) : items.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-12 text-center">
          <Bell className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((n) => (
            <div
              key={n.id}
              className={`bg-white dark:bg-gray-900 rounded-xl border px-4 py-3 flex items-start gap-3 ${
                n.readAt
                  ? "border-gray-100 dark:border-gray-800"
                  : "border-primary-200 dark:border-primary-900/40 bg-primary-50/40 dark:bg-primary-900/10"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                  n.readAt ? "bg-gray-300 dark:bg-gray-600" : "bg-primary-500"
                }`}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 dark:text-white">{n.message}</p>
                <p className="text-[11px] text-gray-400 mt-1">{formatTime(n.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
