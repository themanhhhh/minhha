'use client';

import { useState } from 'react';
import { CalendarDays, Check, KeyRound, LogOut, Mail, Phone, UserRound, UsersRound, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services';
import { StudentPageIntro } from '@/components/common/student-page-intro';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import type { StudentProfile as StudentProfileData } from '@/types';

const statusLabels = { ACTIVE: 'Đang học', RESERVED: 'Bảo lưu', WAITING: 'Chờ xếp lớp', COMPLETED: 'Hoàn thành' } as const;

export function StudentProfile({ profile }: { profile: StudentProfileData }) {
  const router = useRouter();
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  function logout() {
    authService.logout();
    router.replace('/login');
  }

  return (
    <div className="mx-auto max-w-5xl">
      <StudentPageIntro
        eyebrow="Tài khoản"
        title="Thông tin cá nhân"
        description="Quản lý thông tin tài khoản và mục tiêu học tập của bạn."
      />
      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <CardHeader className="border-b bg-white px-5 py-5 sm:px-7">
          <div className="flex items-center gap-4">
            <div className="grid size-12 shrink-0 place-items-center rounded-full bg-emerald-50 text-lg font-bold text-emerald-600">N</div>
            <div>
              <CardTitle className="text-lg sm:text-xl">{profile.fullName}</CardTitle>
              <p className="mt-0.5 text-xs text-slate-500">{profile.code} · Học viên Riki</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-5 sm:p-7">
          <div className="grid gap-3 sm:grid-cols-2">
            <ProfileField icon={<UsersRound />} label="Mã học viên" value={profile.code} />
            <ProfileField icon={<UserRound />} label="Họ và tên" value={profile.fullName} />
            <ProfileField icon={<UserRound />} label="Giới tính" value={profile.gender} />
            <ProfileField icon={<CalendarDays />} label="Ngày sinh" value={formatDate(profile.dateOfBirth)} />
            <ProfileField icon={<Mail />} label="Email" value={profile.email} />
            <ProfileField icon={<Phone />} label="Số điện thoại" value={profile.phone} />
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <LevelCard label="Trình độ hiện tại" value={profile.currentLevel} />
            <LevelCard label="Mục tiêu JLPT" value={profile.targetLevel} />
            <div className="flex min-w-32 flex-col justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5">
              <span className="text-[11px] text-slate-400">Trạng thái</span>
              <Badge variant="success" className="mt-1 w-fit"><Check className="mr-1 size-3" />{statusLabels[profile.status]}</Badge>
            </div>
          </div>
          <div className="mt-7 flex flex-wrap gap-3 border-t pt-6">
            <Button variant="secondary" onClick={() => setChangePasswordOpen((current) => !current)}><KeyRound className="size-4" />Đổi mật khẩu</Button>
            <Button variant="outline" onClick={logout}><LogOut className="size-4" />Đăng xuất</Button>
          </div>
          {changePasswordOpen && <ChangePassword onClose={() => setChangePasswordOpen(false)} />}
        </CardContent>
      </Card>
    </div>
  );
}

function ProfileField({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="flex min-h-16 items-center gap-3 rounded-lg bg-slate-50 px-4 py-3"><span className="grid size-8 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-500"><span className="size-3.5 [&>svg]:size-3.5">{icon}</span></span><div className="min-w-0"><p className="text-[11px] text-slate-400">{label}</p><p className="truncate text-sm font-medium text-slate-700">{value}</p></div></div>;
}

function LevelCard({ label, value }: { label: string; value: string }) {
  return <div className="min-w-32 rounded-lg border border-slate-100 bg-white px-3 py-2.5"><p className="text-[11px] text-slate-400">{label}</p><div className="mt-1.5 inline-flex items-center gap-1.5 rounded-full border border-emerald-200 px-2 py-0.5 text-xs font-semibold text-emerald-500"><span className="grid size-3.5 place-items-center rounded-full bg-emerald-50">◎</span>{value}</div></div>;
}

function ChangePassword({ onClose }: { onClose: () => void }) {
  return <div className="mt-6 rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 sm:p-5"><div className="mb-4 flex items-center justify-between"><div><h3 className="text-sm font-semibold">Đổi mật khẩu</h3><p className="mt-1 text-xs text-muted-foreground">Mật khẩu mới cần có ít nhất 8 ký tự.</p></div><button onClick={onClose} className="rounded-md p-1 text-muted-foreground hover:bg-white"><X className="size-4" /></button></div><div className="grid gap-3 sm:grid-cols-2"><Input type="password" placeholder="Mật khẩu hiện tại" /><Input type="password" placeholder="Mật khẩu mới" /></div><div className="mt-3 flex justify-end"><Button size="sm" onClick={onClose}>Lưu mật khẩu</Button></div></div>;
}

function formatDate(value: string) {
  const [year, month, day] = value.split('-');
  return `${year}-${month}-${day}`;
}
