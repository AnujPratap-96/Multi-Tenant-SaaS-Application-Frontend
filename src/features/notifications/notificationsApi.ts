import api from "@/lib/axios";
import type { Notification } from "@/types/domain";

// Notifications API surface (Notification table + BullMQ emitter).

const unwrap = <T>(res: { data?: { data?: T } }): T | undefined => res.data?.data;

export interface NotificationListParams {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}

export const notificationsApi = {
  list: (params: NotificationListParams = {}) =>
    api
      .get("/notifications", { params })
      .then(
        (res) =>
          (unwrap<{ items: Notification[]; total: number; unreadCount: number }>(res) ?? {
            items: [],
            total: 0,
            unreadCount: 0,
          })
      ),

  unreadCount: () =>
    api
      .get("/notifications/unread-count")
      .then((res) => (unwrap<{ unreadCount: number }>(res)?.unreadCount ?? 0)),

  markRead: (id: string) => api.patch(`/notifications/${id}/read`),

  markAllRead: () => api.post("/notifications/read-all"),
};
