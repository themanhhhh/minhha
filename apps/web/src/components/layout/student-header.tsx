'use client';

import { Bell, CheckCheck, ChevronRight, LoaderCircle } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useMarkStudentNotificationRead, useStudentNotificationUnreadCount, useStudentNotifications } from '@/features/students/hooks/use-notifications';
import type { Notification } from '@/types';

export function StudentHeader() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const recentQuery = useStudentNotifications({ page: 1, pageSize: 5 });
  const unreadQuery = useStudentNotificationUnreadCount();
  const markRead = useMarkStudentNotificationRead();
  const unreadCount = unreadQuery.data ?? 0;

  async function openNotification(notification: Notification) {
    if (!notification.readAt) await markRead.mutateAsync(notification.id);
    setOpen(false);
    if (notification.actionUrl) router.push(notification.actionUrl);
  }

  return (
    <header className="relative z-30 flex h-16 items-center justify-between border-b border-slate-100 bg-white px-4 sm:px-6 lg:px-10">
      <div className="flex items-center gap-3">
        <Link href="/student/dashboard" className="text-lg font-extrabold tracking-[0.12em] text-emerald-500 lg:hidden">RIKI</Link>
        <p className="hidden text-sm text-slate-400 sm:block">Không gian học tập</p>
      </div>
      <div className="relative">
        <Button type="button" variant="ghost" size="sm" className="relative size-10 rounded-full p-0" aria-label="Mở thông báo" onClick={() => setOpen((value) => !value)}>
          <Bell className="size-5 text-slate-600" />
          {unreadCount > 0 && <span className="absolute right-1 top-1 flex min-w-4 items-center justify-center rounded-full bg-emerald-500 px-1 text-[9px] font-bold leading-4 text-white">{unreadCount > 99 ? '99+' : unreadCount}</span>}
        </Button>
        {open && (
          <div className="absolute right-0 top-12 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <div><p className="text-sm font-semibold text-slate-800">Thông báo</p><p className="mt-0.5 text-xs text-slate-400">{unreadCount} thông báo chưa đọc</p></div>
              <CheckCheck className="size-4 text-emerald-500" />
            </div>
            <div className="max-h-80 overflow-y-auto">
              {recentQuery.isLoading ? <div className="flex items-center justify-center gap-2 px-4 py-8 text-xs text-slate-400"><LoaderCircle className="size-4 animate-spin" />Đang tải...</div> : recentQuery.data?.data.length ? recentQuery.data.data.map((notification) => <button key={notification.id} type="button" onClick={() => void openNotification(notification)} className={`flex w-full items-start gap-3 border-b border-slate-50 px-4 py-3 text-left transition-colors hover:bg-emerald-50/50 ${notification.readAt ? 'bg-white' : 'bg-emerald-50/30'}`}><span className={`mt-1 size-2 shrink-0 rounded-full ${notification.readAt ? 'bg-slate-200' : 'bg-emerald-500'}`} /><span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium text-slate-700">{notification.title}</span><span className="mt-1 block line-clamp-2 text-xs leading-5 text-slate-400">{notification.body}</span><span className="mt-1 block text-[10px] text-slate-400">{formatDate(notification.createdAt)}</span></span></button>) : <div className="px-4 py-8 text-center text-xs text-slate-400">Bạn chưa có thông báo.</div>}
            </div>
            <Link href="/student/notifications" onClick={() => setOpen(false)} className="flex items-center justify-center gap-1 px-4 py-3 text-xs font-semibold text-emerald-600 hover:bg-emerald-50">Xem tất cả <ChevronRight className="size-3.5" /></Link>
          </div>
        )}
      </div>
    </header>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}
