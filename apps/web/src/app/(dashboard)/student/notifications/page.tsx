'use client';

import { Bell, BellRing, CheckCheck, ChevronLeft, ChevronRight, LoaderCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useMarkAllStudentNotificationsRead, useMarkStudentNotificationRead, useStudentNotifications } from '@/features/students/hooks/use-notifications';
import type { Notification, NotificationType } from '@/types';

const pageSize = 20;

export default function StudentNotificationsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const notificationsQuery = useStudentNotifications({ page, pageSize, unreadOnly });
  const markRead = useMarkStudentNotificationRead();
  const markAllRead = useMarkAllStudentNotificationsRead();
  const notifications = notificationsQuery.data?.data ?? [];
  const meta = notificationsQuery.data?.meta;
  const totalPages = Math.max(1, meta?.totalPages ?? 1);

  useEffect(() => { setPage(1); }, [unreadOnly]);

  async function openNotification(notification: Notification) {
    if (!notification.readAt) await markRead.mutateAsync(notification.id);
    if (notification.actionUrl) router.push(notification.actionUrl);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-500"><BellRing className="size-3.5" />Trung tâm thông báo</div><h1 className="text-3xl font-semibold tracking-tight text-slate-900">Thông báo</h1><p className="mt-2 text-sm text-slate-500">Theo dõi các cập nhật mới nhất từ lớp học và trung tâm.</p></div>
        <Button type="button" variant="outline" size="sm" disabled={!meta?.unreadCount || markAllRead.isPending} onClick={() => markAllRead.mutate()}><CheckCheck className="size-4" />Đánh dấu tất cả đã đọc</Button>
      </div>

      <div className="flex items-center gap-2 border-b border-slate-200">
        <button type="button" onClick={() => setUnreadOnly(false)} className={`border-b-2 px-3 py-3 text-sm font-medium ${!unreadOnly ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500'}`}>Tất cả {meta ? `(${meta.total})` : ''}</button>
        <button type="button" onClick={() => setUnreadOnly(true)} className={`border-b-2 px-3 py-3 text-sm font-medium ${unreadOnly ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500'}`}>Chưa đọc {meta ? `(${meta.unreadCount})` : ''}</button>
      </div>

      <Card className="border-slate-200 shadow-sm"><CardContent className="p-0">
        {notificationsQuery.isLoading ? <div className="flex items-center justify-center gap-2 px-6 py-16 text-sm text-slate-400"><LoaderCircle className="size-5 animate-spin" />Đang tải thông báo...</div> : notificationsQuery.isError ? <div className="px-6 py-16 text-center text-sm text-red-500">Không thể tải thông báo. Vui lòng thử lại.</div> : notifications.length === 0 ? <div className="flex flex-col items-center px-6 py-16 text-center"><Bell className="size-8 text-slate-300" /><p className="mt-3 text-sm font-medium text-slate-600">Không có thông báo</p><p className="mt-1 text-xs text-slate-400">Bạn sẽ nhận được thông báo khi lớp học có cập nhật mới.</p></div> : <div className="divide-y divide-slate-100">{notifications.map((notification) => <NotificationRow key={notification.id} notification={notification} onOpen={() => void openNotification(notification)} />)}</div>}
      </CardContent></Card>

      {totalPages > 1 && <div className="flex items-center justify-between text-sm text-slate-500"><span>Trang {page} / {totalPages}</span><div className="flex gap-2"><Button type="button" variant="outline" size="sm" disabled={page <= 1 || notificationsQuery.isFetching} onClick={() => setPage((value) => value - 1)}><ChevronLeft className="size-4" />Trước</Button><Button type="button" variant="outline" size="sm" disabled={page >= totalPages || notificationsQuery.isFetching} onClick={() => setPage((value) => value + 1)}>Sau<ChevronRight className="size-4" /></Button></div></div>}
    </div>
  );
}

function NotificationRow({ notification, onOpen }: { notification: Notification; onOpen: () => void }) {
  return <button type="button" onClick={onOpen} className={`flex w-full items-start gap-4 px-5 py-5 text-left transition-colors hover:bg-emerald-50/40 sm:px-6 ${notification.readAt ? 'bg-white' : 'bg-emerald-50/30'}`}><div className={`mt-0.5 grid size-10 shrink-0 place-items-center rounded-xl ${notification.readAt ? 'bg-slate-100 text-slate-400' : 'bg-emerald-100 text-emerald-600'}`}><Bell className="size-5" /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className={`text-sm ${notification.readAt ? 'font-medium text-slate-700' : 'font-semibold text-slate-900'}`}>{notification.title}</p>{!notification.readAt && <Badge variant="success">Mới</Badge>}</div><p className="mt-1 text-sm leading-6 text-slate-500">{notification.body}</p><p className="mt-2 text-xs text-slate-400">{formatDate(notification.createdAt)}{notification.type !== 'SYSTEM' ? ` · ${typeLabel(notification.type)}` : ''}</p></div><span className={`mt-2 size-2 shrink-0 rounded-full ${notification.readAt ? 'bg-slate-200' : 'bg-emerald-500'}`} /></button>;
}

function typeLabel(type: NotificationType) {
  const labels: Record<NotificationType, string> = { ASSIGNMENT_CREATED: 'Bài tập', MATERIAL_PUBLISHED: 'Tài liệu', LESSON_CREATED: 'Lịch học', LESSON_UPDATED: 'Lịch học', SCORE_PUBLISHED: 'Điểm số', ATTENDANCE_ALERT: 'Điểm danh', CLASS_ENROLLED: 'Lớp học', BROADCAST: 'Thông báo lớp', SYSTEM: 'Hệ thống' };
  return labels[type];
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}
