import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { NotificationListParams } from '@/types';
import { notificationService } from '@/services';

export const notificationQueryKeys = {
  all: ['student-notifications'] as const,
  list: (params: NotificationListParams) => ['student-notifications', params] as const,
  unreadCount: ['student-notification-unread-count'] as const,
};

export function useStudentNotifications(params: NotificationListParams = {}) {
  return useQuery({
    queryKey: notificationQueryKeys.list(params),
    queryFn: () => notificationService.list(params),
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });
}

export function useStudentNotificationUnreadCount() {
  return useQuery({
    queryKey: notificationQueryKeys.unreadCount,
    queryFn: notificationService.unreadCount,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });
}

export function useMarkStudentNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationService.markRead,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: notificationQueryKeys.all });
      void queryClient.invalidateQueries({ queryKey: notificationQueryKeys.unreadCount });
    },
  });
}

export function useMarkAllStudentNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationService.markAllRead,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: notificationQueryKeys.all });
      void queryClient.invalidateQueries({ queryKey: notificationQueryKeys.unreadCount });
    },
  });
}
