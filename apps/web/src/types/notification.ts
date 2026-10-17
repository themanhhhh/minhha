export type NotificationType =
  | 'ASSIGNMENT_CREATED'
  | 'MATERIAL_PUBLISHED'
  | 'LESSON_CREATED'
  | 'LESSON_UPDATED'
  | 'SCORE_PUBLISHED'
  | 'ATTENDANCE_ALERT'
  | 'CLASS_ENROLLED'
  | 'BROADCAST'
  | 'SYSTEM';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  actionUrl: string | null;
  entity: string | null;
  entityId: string | null;
  metadata: unknown;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationListParams {
  page?: number;
  pageSize?: number;
  unreadOnly?: boolean;
}

export interface NotificationListResult {
  data: Notification[];
  meta: { page: number; pageSize: number; total: number; totalPages: number; unreadCount: number };
}

export interface BroadcastInput {
  classId: number | string;
  title: string;
  body: string;
  actionUrl?: string;
}
