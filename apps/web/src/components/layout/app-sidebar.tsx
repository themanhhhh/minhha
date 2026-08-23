'use client';

import Link from 'next/link';
import { BookOpen, CalendarDays, ChartNoAxesCombined, ChevronRight, ClipboardCheck, GraduationCap, LayoutDashboard, Library, LogOut, School, ShieldCheck, UserRound, UsersRound, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { navigationByRole, roleLabels } from '@/config/navigation';
import { cn } from '@/lib/utils';
import type { AuthUser, UserRole } from '@/types';

const icons = { 'layout-dashboard': LayoutDashboard, 'book-open': BookOpen, 'calendar-days': CalendarDays, 'chart-no-axes-combined': ChartNoAxesCombined, 'user-round': UserRound, 'clipboard-check': ClipboardCheck, 'users-round': UsersRound, 'graduation-cap': GraduationCap, library: Library, school: School, 'shield-check': ShieldCheck };

interface AppSidebarProps { role: Exclude<UserRole, 'STUDENT'>; user: AuthUser; open: boolean; onClose: () => void; onLogout: () => void; }

export function AppSidebar({ role, user, open, onClose, onLogout }: AppSidebarProps) {
  const pathname = usePathname();
  return <>
    <div className={cn('fixed inset-0 z-40 bg-slate-900/20 transition-opacity lg:hidden', open ? 'opacity-100' : 'pointer-events-none opacity-0')} onClick={onClose} />
    <aside className={cn('fixed inset-y-0 left-0 z-50 flex w-52 flex-col border-r border-slate-100 bg-white text-slate-700 transition-transform lg:static lg:z-auto lg:translate-x-0', open ? 'translate-x-0' : '-translate-x-full')}>
      <div className="flex h-16 items-center justify-between px-6"><Link href={navigationByRole[role][0].items[0].href} className="text-xl font-extrabold tracking-[0.12em] text-emerald-500">RIKI</Link><Button variant="ghost" size="sm" className="text-slate-400 lg:hidden" onClick={onClose}><X className="size-4" /></Button></div>
      <p className="px-6 text-[9px] text-slate-400">Tốt hơn hôm qua</p>
      <div className="mx-6 mt-3 border-t border-slate-100" />
      <nav className="mt-4 flex-1 space-y-6 overflow-y-auto px-3 pb-4"><p className="mb-2 px-3 text-[9px] font-medium uppercase tracking-wide text-slate-400">Menu</p>{navigationByRole[role].map((group) => <div key={group.label}><p className="mb-2 px-3 text-[9px] font-medium uppercase tracking-wide text-slate-400">{group.label}</p><div className="space-y-1">{group.items.map((item) => { const Icon = icons[item.icon as keyof typeof icons]; const active = pathname === item.href || pathname.startsWith(`${item.href}/`); return <Link key={item.href} href={item.href} onClick={onClose} className={cn('group flex items-center justify-between rounded-lg px-3 py-2 text-[11px] transition-colors', active ? 'bg-emerald-50 font-semibold text-emerald-500' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700')}><span className="flex items-center gap-2"><Icon className="size-3.5" />{item.label}</span><ChevronRight className={cn('size-3 opacity-0 transition-opacity', active && 'opacity-60 group-hover:opacity-100')} /></Link>; })}</div></div>)}</nav>
      <div className="border-t border-slate-100 p-3"><div className="mb-2 flex items-center gap-2 px-2"><Avatar initials={user.initials} className="size-7 bg-emerald-50 text-[10px] text-emerald-500" /><div className="min-w-0"><p className="truncate text-[10px] font-medium text-slate-600">{user.fullName}</p><p className="truncate text-[9px] text-slate-400">{roleLabels[role]}</p></div></div><button onClick={onLogout} className="flex h-8 w-full items-center justify-center gap-2 rounded-lg border border-slate-100 text-[10px] text-slate-500 hover:bg-slate-50"><LogOut className="size-3.5" />Đăng xuất</button></div>
    </aside>
  </>;
}
