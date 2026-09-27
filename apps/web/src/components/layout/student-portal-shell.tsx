'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  BookOpen,
  CalendarDays,
  ChartNoAxesCombined,
  LayoutDashboard,
  LogOut,
  UserRound,
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { Avatar } from '@/components/ui/avatar';
import { navigationByRole } from '@/config/navigation';
import { cn } from '@/lib/utils';
import { authService } from '@/services';
import type { AuthUser } from '@/types';

const icons = {
  'layout-dashboard': LayoutDashboard,
  'book-open': BookOpen,
  'calendar-days': CalendarDays,
  'chart-no-axes-combined': ChartNoAxesCombined,
  'user-round': UserRound,
};

const studentItems = navigationByRole.STUDENT.flatMap((group) => group.items);

export function StudentPortalShell({ user, children }: { user: AuthUser; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  function logout() {
    authService.logout();
    router.replace('/login');
  }

  return (
    <div className="flex min-h-screen bg-[#fafafa] text-slate-700">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-56 flex-col border-r border-slate-100 bg-white lg:flex">
        <div className="flex h-20 items-center px-7">
          <Link href="/student/dashboard" className="text-xl font-extrabold tracking-[0.12em] text-emerald-500">
            RIKI
          </Link>
        </div>
        <div className="px-7">
          <p className="text-[9px] font-medium uppercase tracking-[0.16em] text-slate-400">Không gian học tập</p>
          <div className="mt-4 border-t border-slate-100" />
        </div>
        <nav className="mt-5 flex-1 space-y-1 overflow-y-auto px-3">
          {studentItems.map((item) => {
            const Icon = icons[item.icon as keyof typeof icons];
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                href={item.href}
                key={item.href}
                className={cn(
                  'group flex items-center gap-3 rounded-xl px-4 py-3 text-xs transition-colors',
                  active
                    ? 'bg-emerald-50 font-semibold text-emerald-600'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800',
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-slate-100 p-4">
          <div className="mb-3 flex items-center gap-2.5 px-2">
            <Avatar initials={user.initials} className="size-8 bg-emerald-50 text-[10px] text-emerald-600" />
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-slate-700">{user.fullName}</p>
              <p className="truncate text-[10px] text-slate-400">{user.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex h-9 w-full items-center justify-center gap-2 rounded-xl border border-slate-100 text-xs text-slate-500 transition-colors hover:border-emerald-100 hover:bg-emerald-50 hover:text-emerald-600"
          >
            <LogOut className="size-3.5" />
            Đăng xuất
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 lg:ml-56">
        <div className="min-h-screen px-4 py-6 pb-24 sm:px-6 sm:py-8 lg:px-10 lg:py-10 lg:pb-10">{children}</div>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-6 border-t border-slate-200 bg-white/95 px-1 pb-[max(0.35rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_24px_rgba(15,23,42,0.06)] backdrop-blur lg:hidden">
        {studentItems.map((item) => {
          const Icon = icons[item.icon as keyof typeof icons];
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              href={item.href}
              key={item.href}
              className={cn(
                'flex min-w-0 flex-col items-center gap-1 rounded-lg px-1 py-1.5 text-[9px] transition-colors',
                active ? 'font-semibold text-emerald-600' : 'text-slate-400 hover:text-slate-700',
              )}
            >
              <Icon className="size-4" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
        <button
          onClick={logout}
          className="flex min-w-0 flex-col items-center gap-1 rounded-lg px-1 py-1.5 text-[9px] text-slate-400 transition-colors hover:text-emerald-600"
        >
          <LogOut className="size-4" />
          <span className="truncate">Đăng xuất</span>
        </button>
      </nav>
    </div>
  );
}
