import type { BroadcastInput, Notification, NotificationListParams, NotificationListResult } from '@/types';
import { apiClient } from '@/lib/api-client';

export const notificationService = {
  async list(params: NotificationListParams = {}): Promise<NotificationListResult> {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.pageSize) query.set('pageSize', String(params.pageSize));
    if (params.unreadOnly) query.set('unreadOnly', 'true');
    return apiClient<NotificationListResult>(`/me/notifications?${query.toString()}`);
  },

  async unreadCount(): Promise<number> {
    const response = await apiClient<{ data: { count: number } }>('/me/notifications/unread-count');
    return response.data.count;
  },

  async markRead(id: string): Promise<Notification> {
    const response = await apiClient<{ data: Notification }>(`/me/notifications/${id}/read`, { method: 'PATCH' });
    return response.data;
  },

  async markAllRead(): Promise<number> {
    const response = await apiClient<{ data: { updatedCount: number } }>('/me/notifications/read-all', { method: 'PATCH' });
    return response.data.updatedCount;
  },

  async broadcast(input: BroadcastInput): Promise<{ classId: string; recipientCount: number }> {
    const response = await apiClient<{ data: { classId: string; recipientCount: number } }>('/notifications/broadcast', { method: 'POST', body: JSON.stringify(input) });
    return response.data;
  },
};
