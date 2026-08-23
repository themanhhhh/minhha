'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AppHeader } from '@/components/layout/app-header';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { StudentPortalShell } from '@/components/layout/student-portal-shell';
import { authService } from '@/services';
import { rolePath } from '@/mocks/auth';
import type { AuthUser, UserRole } from '@/types';

function roleFromPath(pathname: string): UserRole { if (pathname.startsWith('/student')) return 'STUDENT'; if (pathname.startsWith('/teacher')) return 'TEACHER'; if (pathname.startsWith('/director')) return 'DIRECTOR'; return 'ACADEMIC_STAFF'; }
export function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter(); const pathname = usePathname(); const [open, setOpen] = useState(false); const [user, setUser] = useState<AuthUser | null>(null); const pathRole = roleFromPath(pathname);
  useEffect(() => { const current = authService.getUser(); if (!current) { router.replace('/login'); return; } if (current.role !== pathRole) { router.replace(rolePath(current.role)); return; } setUser(current); }, [pathRole, router]);
  if (!user) return <div className="grid min-h-screen place-items-center bg-background text-sm text-muted-foreground">Đang tải không gian làm việc...</div>;
  if (user.role === 'STUDENT') return <StudentPortalShell user={user}>{children}</StudentPortalShell>;
  const role = user.role;
  return <div className="flex min-h-screen bg-slate-50"><AppSidebar role={role} user={user} open={open} onClose={() => setOpen(false)} onLogout={() => { authService.logout(); router.replace('/login'); }} /><div className="flex min-w-0 flex-1 flex-col"><AppHeader user={user} onMenu={() => setOpen(true)} /><main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main></div></div>;
}
