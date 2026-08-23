'use client';

import { Bell, Menu, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import type { AuthUser } from '@/types';

export function AppHeader({ user, onMenu }: { user: AuthUser; onMenu: () => void }) {
  return <header className="flex h-16 items-center justify-between border-b bg-white px-4 sm:px-6"><div className="flex items-center gap-3"><Button variant="ghost" size="sm" className="lg:hidden" onClick={onMenu}><Menu className="size-5" /></Button><div className="hidden items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-muted-foreground md:flex"><Search className="size-4" />Tìm kiếm nhanh <kbd className="ml-6 rounded border bg-white px-1.5 py-0.5 text-[10px]">⌘ K</kbd></div><p className="text-sm font-medium text-muted-foreground md:hidden">Riki LMS</p></div><div className="flex items-center gap-2 sm:gap-4"><Button variant="ghost" size="sm" className="relative"><Bell className="size-4" /><span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-emerald-500" /></Button><div className="hidden h-6 w-px bg-border sm:block" /><div className="flex items-center gap-2"><Avatar initials={user.initials} /><div className="hidden text-right sm:block"><p className="text-sm font-semibold leading-tight">{user.fullName}</p><p className="text-xs text-muted-foreground">{user.email}</p></div></div></div></header>;
}
