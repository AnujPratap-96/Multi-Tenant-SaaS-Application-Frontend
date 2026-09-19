import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { notificationsApi, type NotificationListParams } from "./notificationsApi";
import { useTenantStore } from "@/features/tenant/tenantStore";

const tenantId = () => useTenantStore.getState().currentTenant?.id ?? "none";

const handleError = (err: unknown) => {
  const message =
    (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
    "Something went wrong";
  toast.error(message);
};

export const useNotifications = (params: NotificationListParams = {}) =>
  useQuery({
    queryKey: ["notifications", tenantId(), params],
    queryFn: () => notificationsApi.list(params),
  });

export const useUnreadCount = () =>
  useQuery({
    queryKey: ["notifications", tenantId(), "unread-count"],
    queryFn: () => notificationsApi.unreadCount(),
    refetchInterval: 30_000,
  });

export const useMarkNotificationRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications", tenantId()] });
    },
    onError: handleError,
  });
};

export const useMarkAllNotificationsRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications", tenantId()] });
      toast.success("All notifications marked as read");
    },
    onError: handleError,
  });
};
