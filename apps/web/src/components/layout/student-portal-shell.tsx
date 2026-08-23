'use client';

import * as React from 'react';
import Link from 'next/link';
import { BookOpen, ChartNoAxesCombined, LogOut, Menu, UserRound, X } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { authService } from '@/services';
import type { AuthUser } from '@/types';

const items = [
  { label: 'Thông tin cá nhân', href: '/student/profile', icon: UserRound },
  { label: 'Lớp học của tôi', href: '/student/classes', icon: BookOpen },
  { label: 'Quá trình học tập', href: '/student/progress', icon: ChartNoAxesCombined },
];

export function StudentPortalShell({ user, children }: { user: AuthUser; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  function logout() { authService.logout(); router.replace('/login'); }
  return <div className="flex min-h-screen bg-[#fafafa] text-slate-700"><div className={cn('fixed inset-0 z-40 bg-slate-900/20 transition-opacity lg:hidden', open ? 'opacity-100' : 'pointer-events-none opacity-0')} onClick={() => setOpen(false)} /><aside className={cn('fixed inset-y-0 left-0 z-50 flex w-52 flex-col border-r border-slate-100 bg-white transition-transform lg:static lg:translate-x-0', open ? 'translate-x-0' : '-translate-x-full')}><div className="flex h-16 items-center justify-between px-6"><Link href="/student/profile" className="text-xl font-extrabold tracking-[0.12em] text-emerald-500">RIKI</Link><Button variant="ghost" size="sm" className="text-slate-400 lg:hidden" onClick={() => setOpen(false)}><X className="size-4" /></Button></div><p className="px-6 text-[9px] text-slate-400">Tốt hơn hôm qua</p><div className="mx-6 mt-3 border-t border-slate-100" /><nav className="mt-4 px-3"><p className="mb-2 px-3 text-[9px] font-medium uppercase tracking-wide text-slate-400">Menu</p>{items.map(({ label, href, icon: Icon }) => { const active = pathname === href || pathname.startsWith(`${href}/`); return <Link href={href} key={href} onClick={() => setOpen(false)} className={cn('mb-1 flex items-center gap-2 rounded-lg px-3 py-2 text-[11px] transition-colors', active ? 'bg-emerald-50 font-semibold text-emerald-500' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700')}><Icon className="size-3.5" />{label}</Link>; })}</nav><div className="mt-auto border-t border-slate-100 p-3"><div className="mb-2 flex items-center gap-2 px-2"><Avatar initials={user.initials} className="size-7 bg-emerald-50 text-[10px] text-emerald-500" /><div className="min-w-0"><p className="truncate text-[10px] font-medium text-slate-600">{user.fullName}</p><p className="text-[9px] text-slate-400">Học viên</p></div></div><button onClick={logout} className="flex h-8 w-full items-center justify-center gap-2 rounded-lg border border-slate-100 text-[10px] text-slate-500 hover:bg-slate-50"><LogOut className="size-3.5" />Đăng xuất</button></div></aside><div className="min-w-0 flex-1"><div className="flex h-14 items-center border-b border-slate-100 bg-white px-4 lg:hidden"><Button variant="ghost" size="sm" onClick={() => setOpen(true)}><Menu className="size-4" /></Button><span className="ml-2 text-sm font-bold tracking-wider text-emerald-500">RIKI</span></div><main className="p-4 sm:p-6 lg:p-7">{children}</main></div></div>;
}
